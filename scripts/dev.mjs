import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js')
const shimPath = path.join(rootDir, 'scripts', 'crypto-shim.cjs')

const major = Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10)
if (Number.isNaN(major) || major < 20) {
  console.error(`Node.js v20+ gerekiyor. Aktif sürüm: v${process.versions.node}`)
  process.exit(1)
}

if (!existsSync(viteBin)) {
  console.log('Bağımlılıklar eksik görünüyor. npm install çalıştırılıyor...')
  const install = spawnSync('npm', ['install'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  if (install.status !== 0) {
    process.exit(install.status ?? 1)
  }
}

const result = spawnSync(
  process.execPath,
  ['--require', shimPath, viteBin],
  {
    cwd: rootDir,
    stdio: 'inherit',
    env: process.env,
  },
)

if (typeof result.status === 'number') {
  process.exit(result.status)
}

if (result.error) {
  console.error(result.error)
  process.exit(1)
}

process.exit(0)
