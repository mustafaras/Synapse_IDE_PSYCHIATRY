import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'
import type { IncomingMessage, ServerResponse } from 'http'

// Lightweight body reader (small JSON payloads only)
async function readBody(req: IncomingMessage): Promise<string> {
  return await new Promise((resolve, reject) => {
    const bufs: Buffer[] = []
    req.on('data', d => bufs.push(d))
    req.on('end', () => resolve(Buffer.concat(bufs).toString('utf8')))
    req.on('error', reject)
  })
}

// Minimal in-process API plugin (dev only) to remove need for external /api proxy server.
// Handles:
//  POST /api/openai/verify  { key }
//  POST /api/chat  { model, messages:[{role,content}], temperature?, top_p?, max_tokens?, apiKey? }
// Streams OpenAI chat completions via SSE with immediate flushing.
function devSseApiPlugin() {
  return {
    name: 'dev-sse-api-plugin',
    apply: 'serve' as const,
    configureServer(server: any) {
      const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || ''
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        try {
          const { url, method } = req
          if (!url?.startsWith('/api/')) return next()

          // VERIFY ENDPOINT
            if (url === '/api/openai/verify' && method === 'POST') {
              let body = ''
              try { body = await readBody(req) } catch {}
              let key = ''
              try { key = String(JSON.parse(body)?.key || '').trim() } catch {}
              if (!key) {
                res.writeHead(400, { 'content-type': 'application/json' })
                return void res.end(JSON.stringify({ ok: false, error: 'missing_key' }))
              }
              try {
                const r = await fetch('https://api.openai.com/v1/models?limit=1', { headers: { Authorization: `Bearer ${key}` } })
                if (r.status === 200) {
                  res.writeHead(200, { 'content-type': 'application/json' })
                  return void res.end(JSON.stringify({ ok: true }))
                }
                const map: Record<number, string> = { 401: 'unauthorized', 403: 'unauthorized', 429: 'rate_limited' }
                const code = map[r.status] || 'upstream_error'
                res.writeHead(r.status === 429 ? 429 : (r.status === 401 || r.status === 403 ? 401 : 502), { 'content-type': 'application/json' })
                return void res.end(JSON.stringify({ ok: false, error: code, status: r.status }))
              } catch (e) {
                res.writeHead(500, { 'content-type': 'application/json' })
                return void res.end(JSON.stringify({ ok: false, error: 'verify_exception' }))
              }
            }

          // CHAT STREAM ENDPOINT
          if (url === '/api/chat' && method === 'POST') {
            let bodyStr = ''
            try { bodyStr = await readBody(req) } catch {}
            let payload: any = {}
            try { if (bodyStr) payload = JSON.parse(bodyStr) } catch {
              res.writeHead(400, { 'content-type': 'application/json' })
              return void res.end(JSON.stringify({ error: 'invalid_json' }))
            }
            const messages = Array.isArray(payload.messages) ? payload.messages : []
            if (!messages.length) {
              res.writeHead(400, { 'content-type': 'application/json' })
              return void res.end(JSON.stringify({ error: 'messages_required' }))
            }
            const model = payload.model || 'gpt-4o-mini'
            let key: string | undefined
            const auth = req.headers['authorization']
            if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) key = auth.slice(7).trim()
            else if (typeof payload.apiKey === 'string') key = payload.apiKey.trim()
            else if (OPENAI_KEY) key = OPENAI_KEY
            if (!key) {
              res.writeHead(401, { 'content-type': 'application/json' })
              return void res.end(JSON.stringify({ error: 'missing_api_key' }))
            }

            // SSE headers
            res.writeHead(200, {
              'Content-Type': 'text/event-stream; charset=utf-8',
              'Cache-Control': 'no-cache, no-transform',
              'Connection': 'keep-alive'
            })
            res.write(':ok\n\n')

            const upstreamBody = JSON.stringify({
              model,
              messages,
              temperature: payload.temperature ?? undefined,
              top_p: payload.top_p ?? undefined,
              max_tokens: payload.max_tokens ?? undefined,
              stream: true
            })

            let controllerAborted = false
            req.on('close', () => { controllerAborted = true })

            let upstream: Response
            try {
              upstream = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'text/event-stream',
                  Authorization: `Bearer ${key}`
                },
                body: upstreamBody
              })
            } catch (e) {
              res.write(`event: error\n`)
              res.write(`data: {"error":"upstream_connect"}\n\n`)
              return void res.end()
            }
            if (!upstream.ok || !upstream.body) {
              res.write(`event: error\n`)
              res.write(`data: {"error":"upstream_${upstream.status}"}\n\n`)
              return void res.end()
            }

            const reader = (upstream.body as ReadableStream<Uint8Array>).getReader()
            ;(async () => {
              try {
                while (true) {
                  const { done, value } = await reader.read()
                  if (done) break
                  if (controllerAborted) break
                  if (value) res.write(value)
                }
                res.write(':done\n\n')
                res.end()
              } catch {
                try {
                  res.write(`event: error\n`)
                  res.write(`data: {"error":"stream_failure"}\n\n`)
                } finally { res.end() }
              }
            })()
            return
          }

          // Unknown /api route
          if (url?.startsWith('/api/')) {
            res.writeHead(404, { 'content-type': 'application/json' })
            return void res.end(JSON.stringify({ error: 'not_found' }))
          }
          next()
        } catch (e) {
          try {
            res.writeHead(500, { 'content-type': 'application/json' })
            res.end(JSON.stringify({ error: 'internal_plugin_error' }))
          } catch {}
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(() => {
  // Compute build-time provenance values and inject as VITE_* defines for runtime access
  const fnvHex = (str: string): string => {
    let h = 0x811c9dc5
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i)
      // 32-bit FNV-1a
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
    }
    return h.toString(16).padStart(8, '0')
  }
  const safeRead = (p: string): string => {
    try { return fs.readFileSync(path.resolve(__dirname, p), 'utf8') } catch { return '' }
  }
  const pkgJson = safeRead('package.json')
  let appVersion = '0.0.0'
  try { appVersion = JSON.parse(pkgJson)?.version || '0.0.0' } catch {}
  let buildHash = 'dev'
  try { buildHash = execSync('git rev-parse --short=12 HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString('utf8').trim() } catch {}
  const recipesHash = fnvHex(safeRead('src/centerpanel/Tools/export/recipes.ts'))
  const profilesHash = fnvHex(safeRead('src/centerpanel/Tools/export/deid/profiles.ts'))
  return {
  plugins: [react(), devSseApiPlugin()],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
    'import.meta.env.VITE_BUILD_HASH': JSON.stringify(buildHash),
    'import.meta.env.VITE_RECIPES_HASH': JSON.stringify(recipesHash),
    'import.meta.env.VITE_PROFILES_HASH': JSON.stringify(profilesHash),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/pages': path.resolve(__dirname, './src/pages'),
  '@/features': path.resolve(__dirname, './src/features'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/ai': path.resolve(__dirname, './src/ai'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/config': path.resolve(__dirname, './src/config'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Dev-only proxy to call local Ollama from the browser without CORS issues
      '/ollama': {
        target: 'http://localhost:11434',
        changeOrigin: true,
        // keep path like /ollama/api/* -> http://localhost:11434/api/*
        rewrite: (p) => p.replace(/^\/ollama/, ''),
      },
      // Dev-only proxy for OpenAI to avoid browser CORS on SSE
      '/openai': {
        target: 'https://api.openai.com',
        changeOrigin: true,
        secure: true,
        // keep path like /openai/v1/* -> https://api.openai.com/v1/*
        rewrite: (p) => p.replace(/^\/openai/, ''),
      },
      // NOTE: /api/* is now handled in-process by devSseApiPlugin(); external proxy disabled.
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          monaco: ['@monaco-editor/react', 'monaco-editor']
        }
      }
    }
  },
  }
})
