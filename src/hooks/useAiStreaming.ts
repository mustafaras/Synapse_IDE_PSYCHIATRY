import { useCallback, useRef, useState } from 'react';
import { type ProviderId as AiProvider, getAdapter } from '@/services/ai/adapters';
import { getModel } from '@/utils/ai/models/registry';
import type { Adapter, StreamEvent } from '@/services/ai/adapters/types';
import { useAiSettingsStore } from '@/stores/useAiSettingsStore';
import { beginTrace, endTraceError, endTraceOk, getActiveTraceId, setUsageAndMaybeCost, spanEnd, spanStart } from '@/utils/obs/instrument';
import { emitAiEvent } from '@/lib/ai/telemetry';
import { flags } from '@/config/flags';
import { timeouts } from '@/config/timeouts';


export type { AiProvider };

export interface StartStreamOptions { groupKey?: string; signal?: AbortSignal }
export interface StartParams {
  provider: AiProvider;
  modelId: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  seed?: number | null;
  runtime?: {
    provider?: AiProvider;
    model?: string;
    apiKey?: string;
    baseUrl?: string;
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    jsonMode?: boolean;
  };
  onDelta?: (c: string) => void;
  onComplete?: (full: string) => void;
  onError?: (e: unknown) => void;
  onFirstByte?: () => void;
  onStart?: (m:{requestId:string})=>void
}
interface QueueJob extends StartParams { id: string; extSignal?: AbortSignal | undefined }

interface StreamState { isStreaming: boolean; isTyping: boolean; abortReason: string | null; activeJobId: string | null; provider?: string; queuedJobs: number }
const initialStreamState: StreamState = { isStreaming:false,isTyping:false,abortReason:null,activeJobId:null,queuedJobs:0 };
const RETRIABLE = new Set(['transient','rate_limit','server','network']);
const genId = () => `r${Date.now().toString(36)}${Math.random().toString(36).slice(2,8)}`;
const sleep = (ms:number)=>new Promise(r=>setTimeout(r,ms));
const jitter = () => 120 + Math.round(Math.random()*160);

export function useAiStreaming(_opts: Record<string, unknown> = {}) {
  const [streamState,setStreamState] = useState<StreamState>(initialStreamState);
  const update = useCallback(<T extends Partial<StreamState>>(patch: (s:StreamState)=>StreamState|T)=>setStreamState(s=>({...s,...(typeof patch==='function'?patch(s):patch)})),[]);
  const queueRef = useRef<QueueJob[]>([]);
  const abortRef = useRef<AbortController|null>(null);
  const activeRequestIdRef = useRef<string|null>(null);
  const accumRef = useRef('');
  const lastHttpStatusRef = useRef<number | undefined>(undefined);
  const lastErrorRef = useRef<string | undefined>(undefined);
  const startedAtRef = useRef<number | undefined>(undefined);
  const endedAtRef = useRef<number | undefined>(undefined);
  const attemptsRef = useRef(0);

  const computeOrder = useCallback((primary: AiProvider): string[] => {


  const stateKeys = useAiSettingsStore.getState().keys as Record<string, unknown>;
  const hasKey = (p: string) => {
      if (p === 'ollama') return true;
      const entry = stateKeys[p];
      if (!entry) return false;
      if (typeof entry === 'string') return entry.trim().length > 0;
      if (typeof entry === 'object' && entry) return !!(entry as { apiKey?: string }).apiKey;
      return false;
    };
    const baseOrder: string[] = ['openai','anthropic','gemini','ollama'];
    const seen = new Set<string>();
    const out: string[] = [];
    const push = (p:string, { force }:{ force?: boolean } = {}) => { if(!seen.has(p) && (force || hasKey(p))) { seen.add(p); out.push(p);} };

    push(primary, { force: true });
    for (const p of baseOrder) push(p);

    const ordered = out.filter(p => p !== 'ollama');
    if (out.includes('ollama')) ordered.push('ollama');
    return ordered.length ? ordered : [primary];
  },[]);

  const executeViaAdapter = useCallback(async (job: QueueJob, requestId: string): Promise<void> => {

    let order = computeOrder((job.runtime?.provider||job.provider) as AiProvider);


    try {
      const runtimeModel = (job.runtime?.model || job.modelId) as string;
      const spec = getModel(runtimeModel);
      if (spec) {
        const restricted = order.filter(p => p === spec.provider);
        if (restricted.length) order = restricted;
      }
    } catch {  }
    let lastErr: unknown = null;
    let success = false;
    for(let i=0;i<order.length;i++){
      const providerKey = order[i];
      attemptsRef.current = i+1;
      update(s=>({...s,provider:providerKey,isTyping:true}));
      const adapter = getAdapter(providerKey as AiProvider);
      const ac = abortRef.current!;
      const runtime = job.runtime;
      const model = runtime?.model || job.modelId;
      const options: Record<string, unknown> & { model: string } = { model };

  const jobAny = job as unknown as Record<string, unknown>;
      const directKey = providerKey === 'openai' ? (jobAny.openai as string | undefined)
        : providerKey === 'anthropic' ? (jobAny.anthropic as string | undefined)
        : providerKey === 'gemini' ? ((jobAny.gemini as string | undefined) || (jobAny.google as string | undefined))
        : undefined;
      if(runtime?.temperature ?? job.temperature !== undefined) options.temperature = runtime?.temperature ?? job.temperature;
      if(runtime?.topP ?? job.topP !== undefined) options.topP = runtime?.topP ?? job.topP;
      if(runtime?.maxTokens ?? job.maxTokens !== undefined) options.maxTokens = runtime?.maxTokens ?? job.maxTokens;
      if(runtime?.jsonMode ?? job.jsonMode !== undefined) options.jsonMode = runtime?.jsonMode ?? job.jsonMode;
      const messages = [ ...(job.systemPrompt ? [{ role:'system', content: job.systemPrompt }] as const : []), { role:'user', content: job.prompt } ];
      const onEvent = (ev: StreamEvent) => {
        if(ev.requestId!==activeRequestIdRef.current) return;
        if(ev.type==='start'){
          job.onStart?.({requestId});
        } else if (ev.type === 'handshake') {


        } else if (ev.type === 'first_byte') {

          try { job.onFirstByte?.(); } catch {}
        } else if(ev.type==='delta'&&ev.text){
          accumRef.current+=ev.text; job.onDelta?.(ev.text);
        } else if(ev.type==='usage'){
          try{ const tid=getActiveTraceId(); if(tid) setUsageAndMaybeCost(tid,providerKey as AiProvider,model,ev.usage);}catch{}
        } else if(ev.type==='error'){
          const errObj = ev.error as { status?: number; message?: string } | undefined;
            if(typeof errObj?.status==='number') lastHttpStatusRef.current=errObj.status;
            if(typeof errObj?.message==='string') lastErrorRef.current=errObj.message;
        }
      };
      type StreamArgs = Parameters<Adapter['stream']>[0];
      const args = { requestId, signal: ac.signal, options, messages, onEvent } as unknown as StreamArgs & Record<string, unknown>;
      if(providerKey==='ollama') (args as Record<string, unknown>).baseUrl = runtime?.baseUrl || job.runtime?.baseUrl || 'http://localhost:11434';
      if(providerKey!=='ollama') {
        const k = runtime?.apiKey || directKey;
        if(k) (args as Record<string, unknown>).apiKey = k;
      }
      if(flags.e2e) (args as Record<string, unknown>).timeoutMs = timeouts.sseOpenMs; else if('timeoutMs' in (args as Record<string, unknown>)) delete (args as Record<string, unknown>).timeoutMs;
      if((providerKey==='openai'||providerKey==='anthropic'||providerKey==='gemini') && !(args as Record<string, unknown>).apiKey){

        if (providerKey === order[0]) {
          const err = Object.assign(new Error(`Missing API key for provider "${providerKey}"`), { status: 401, code: 'missing_api_key' });
          lastErr=err; lastHttpStatusRef.current=401; lastErrorRef.current=err.message; update(s=>({...s,abortReason:'auth_error'})); throw err;
        } else {
          continue;
        }
      }
      try { await adapter.stream(args); console.warn('[AI][STREAM_OK]', { provider: providerKey, chars: accumRef.current.length }); success = true; break; }
      catch(e){
        const err = e as { category?: string; providerCode?: string; code?: string; name?: string };
        lastErr=err; const cat=err?.category; const code=err?.providerCode||err?.code;
        if(cat==='abort'||cat==='auth') throw err;
        if(i<order.length-1 && RETRIABLE.has(cat||'')){

          try {
            const next = order[i+1];
            window.dispatchEvent(new CustomEvent('ai:providerSwitch', { detail: { from: providerKey, to: next, reason: cat || code || 'failover', attempt: attemptsRef.current } }));
            window.dispatchEvent(new CustomEvent('ai:failoverNotice', { detail: { from: providerKey, to: next, category: cat, code, attempt: attemptsRef.current } }));
          } catch {  }
          console.warn('[AI][FAILOVER]', { from: providerKey, to: order[i+1], reason: `${cat||'unknown'}/${code||''}` });
          await sleep(jitter());
          continue;
        }
        break;
      }
      finally { update(s=>({...s,isTyping:false})); }
    }
    if(!success) throw lastErr || new Error('all_providers_failed');
  },[computeOrder,update]);

  interface AiTelemetryFinalEvent { t:'final'; id:string; reason:'ok'|'error'|'aborted'; durMs:number; attempts:number; http?:number; err?:string }

  const _execute = useCallback(async (job:QueueJob): Promise<void> =>{

    abortRef.current = new AbortController();

    if (job.extSignal) {
      if (job.extSignal.aborted) {

        try { abortRef.current.abort(); } catch {}
      } else {
        try {
          job.extSignal.addEventListener('abort', () => { try { abortRef.current?.abort(); } catch {} }, { once: true });
        } catch {  }
      }
    }
    const requestId = genId();
    activeRequestIdRef.current = requestId;
    accumRef.current='';
    attemptsRef.current=0;
    startedAtRef.current=Date.now();
    lastHttpStatusRef.current=undefined;
    lastErrorRef.current=undefined;
    endedAtRef.current=undefined;
    update(s=>({...s,isStreaming:true,isTyping:true,activeJobId:job.id,abortReason:null}));
    let traceId:string|null=null; let buildSpan:string|null=null; let aborted=false;
    try{ traceId=beginTrace({ requestId, provider: job.provider, model: job.modelId, userTextBytes: job.prompt.length }); buildSpan=spanStart(traceId,'build_prompt','system+context'); }catch{}
    try{ if(traceId&&buildSpan) { spanEnd(traceId,buildSpan,{}); buildSpan=null; } }catch{}
    try {
      await executeViaAdapter(job, requestId);
      if(!lastHttpStatusRef.current) lastHttpStatusRef.current=200;
      job.onComplete?.(accumRef.current);
      try{ if(traceId) endTraceOk(traceId);}catch{}
    } catch(err){
      const eObj = err as { name?: string; message?: string; code?: string } | undefined;
      if(eObj?.name==='AbortError'){
        aborted=true; update(s=>({...s,abortReason:s.abortReason||'aborted'}));
        try{ if(traceId) endTraceError(traceId,{ code:'cancelled', message:'aborted'});}catch{}
      } else {
        const msg=eObj?.message||String(err||'error');
        lastErrorRef.current=msg;
        job.onError?.(err);
        try{ if(traceId) endTraceError(traceId,{ code: eObj?.code||'unknown', message: msg }); }catch{}
      }
    } finally {
      endedAtRef.current=Date.now();
      update(s=>({...s,isStreaming:false,isTyping:false,activeJobId:null}));
      abortRef.current=null;
      const { logAiEvents } = useAiSettingsStore.getState().flags;
      try{
        if(logAiEvents){
          const reason: 'ok'|'error'|'aborted' = lastErrorRef.current ? 'error' : (aborted ? 'aborted':'ok');
          const evt: AiTelemetryFinalEvent = { t:'final', id:requestId, reason, durMs:(endedAtRef.current||0)-(startedAtRef.current||0), attempts:attemptsRef.current };
          if (lastHttpStatusRef.current !== undefined) evt.http = lastHttpStatusRef.current;
          if (lastErrorRef.current !== undefined) evt.err = lastErrorRef.current;
          emitAiEvent(evt as unknown as Parameters<typeof emitAiEvent>[0]);
        }
      }catch{}
      runNext();
    }


  },[executeViaAdapter,update]);

  const runNext = useCallback((): void => { if(streamState.isStreaming) return; const job=queueRef.current.shift(); if(!job) return; update(s=>({...s,queuedJobs:queueRef.current.length})); void _execute(job); },[streamState.isStreaming,_execute,update]);

  const startStreaming = useCallback((params:StartParams,_options?:StartStreamOptions)=>{

    if(!useAiSettingsStore.getState().hydrated){
      const job:QueueJob={...params,id:genId(),extSignal:_options?.signal};

      queueRef.current.push(job);
      update(s=>({...s,queuedJobs:queueRef.current.length}));
      const listener = () => { try { window.removeEventListener('ai:settingsHydrated', listener); if(!streamState.isStreaming) runNext(); } catch {} };
      try { window.addEventListener('ai:settingsHydrated', listener, { once:true }); } catch {}
      return { opToken: job.id, abort: ()=>{ abortRef.current?.abort(); }, groupKey: params.modelId };
    }
    const job:QueueJob={...params,id:genId(),extSignal:_options?.signal};
    if(streamState.isStreaming){ queueRef.current.push(job); update(s=>({...s,queuedJobs:queueRef.current.length})); } else { void _execute(job);}
    return { opToken: job.id, abort: ()=>{ abortRef.current?.abort(); }, groupKey: params.modelId };
  },[streamState.isStreaming,_execute,update,runNext]);

  const abortStreaming = useCallback((reason:string='user_cancel')=>{ update(s=>({...s,abortReason:reason})); try{ abortRef.current?.abort(); }catch{} },[update]);

  const getLastMeta = useCallback(()=>({ attempts: attemptsRef.current, lastHttpStatus: lastHttpStatusRef.current, lastError: lastErrorRef.current, startedAt: startedAtRef.current, endedAt: endedAtRef.current }),[]);

  return { startStreaming, abortStreaming, streamState, getLastMeta } as const;
}

export default useAiStreaming;
