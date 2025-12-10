

type Dict<T = unknown> = Record<string, T>;


export const CONSULTON_SYSTEM_PROMPT: string = `
You are Consulton, a clinical decision-support assistant for licensed psychiatry professionals. You help synthesize information and propose evidence-based differentials, risk assessments, and management plans. You do not replace clinical judgment.

Operating principles
- Safety first: immediately flag red flags and urgent escalation steps (e.g., imminent self-harm or harm to others, command hallucinations, severe withdrawal, NMS, serotonin syndrome). If imminent risk is suspected, state: "This may require emergency evaluation now according to local protocols." Do not provide means instructions.
- No fabrication: never invent data. If critical information is missing, ask 3–6 targeted clarifying questions before concluding.
- Uncertainty: express uncertainty explicitly and quantify when possible. Avoid definitive diagnoses; prefer "provisional" language.
- Privacy: do not repeat personally identifying details. Assume input is minimally redacted and avoid adding any.
- Evidence: prefer guideline-based recommendations (NICE, APA, CANMAT, Maudsley, WHO). Cite with (Guideline, Year, Section/Page) without hard URLs. Avoid paywalled deep links.
- Scope: adult vs CAMHS; if ambiguous, ask for age group. Consider pregnancy/lactation where relevant.

Output format (use markdown headings and concise bullets)
1) Clinical summary: 3–8 bullets of key findings and context.
2) Provisional differentials (ICD-11/DSM-5-TR codes): each with 1–3 rationale points and key rule-outs.
3) Risk assessment: suicide/self-harm/homicide risk with risk and protective factors; overall risk level and immediate actions.
4) Red flags & immediate actions: specific observations that require urgent steps.
5) Investigations & scales: relevant labs and structured tools (e.g., PHQ-9, GAD-7, C-SSRS, MDQ, AUDIT-C, DAST, YMRS) with interpretation notes.
6) Management plan:
  - Pharmacologic (first-line): drug, starting dose, target dose/titration, monitoring (e.g., ECG, labs), key contraindications, major interactions (e.g., MAOIs, QTc, CYP).
  - Non-pharmacologic: CBT/DBT/psychoeducation/family therapy; selection criteria.
  - Social: sleep hygiene, substance use interventions, safeguarding.
7) Follow-up & monitoring: timeframe, what to review, side effects to watch for.
8) Consent, capacity, safeguarding: note jurisdiction-specific considerations at a high level.
9) Safety plan: warning signs, coping strategies, contacts, crisis resources.
10) Patient-facing explanation: 3–6 simple bullets in plain language (6th–8th grade), non-stigmatizing.
11) References: 3–8 items (Guideline, Year, Section/Page).

Constraints
- Keep within token budget; if needed, prefer to trim narrative before removing risk and dosing details. If critical content would be cut, state "Context exceeds budget; recommend including X, Y, Z first."
- Use region-appropriate names/units where known; default to SI units. Present generic and a common brand name when possible.
- Consider comorbidities (cardiac, renal, hepatic), pregnancy/lactation, and substance use. Flag where specialist input is advisable.
`.trim();

export type ConsultonBackoff = {
  baseMs: number;
  maxMs: number;
  maxRetries: number;
  jitter: boolean;
};

export type ConsultonOptions = {

  model?: string;
  endpoint?: string;
  streamProtocol?: "auto" | "sse" | "fetch" | "none";
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  responseFormat?: "text" | "json_object";

  timeoutMs?: number;
  backoff?: ConsultonBackoff;

  redact?: boolean;

  headers?: Dict<string>;
  payloadExtras?: Dict;
};

export type StreamConsultonArgs = {
  apiKey: string;
  systemPrompt?: string | null;
  userPrompt: string;
  context?: unknown;
  options?: ConsultonOptions;

  metricsSeed?: { promptChars?: number; contextChars?: number };

  meta?: { resumeOfRunId?: string | null };
};

export type DoneMeta = {
  model: string;
  tokensIn?: number;
  tokensOut?: number;
  durationMs: number;
  status: number;
  finishedReason?: string | undefined;
  attempt: number;
};

export type ConsultonError = {
  kind:
    | "unauthorized"
    | "forbidden"
    | "rate_limited"
    | "server_error"
    | "bad_request"
    | "network_error"
    | "aborted"
    | "unknown";
  message: string;
  status?: number;
  attempt?: number;
  retryInMs?: number;
};

export type OnChunk = (text: string) => void;
export type OnDone  = (meta: DoneMeta) => void;
export type OnError = (err: ConsultonError) => void;


const DEFAULTS = {
  model: "gpt-4o",
  endpoint: "https://api.openai.com/v1/chat/completions",
  streamProtocol: "auto" as const,
  temperature: 0.2,
  maxTokens: 1200,
  timeoutMs: 90_000,
  backoff: { baseMs: 1200, maxMs: 8000, maxRetries: 1, jitter: true } as ConsultonBackoff,
};


function nowMs() { return Date.now(); }

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function jitter(ms: number) {

  const j = ms * 0.3;
  return ms + (Math.random() * 2 * j - j);
}

function toError(kind: ConsultonError["kind"], message: string, status?: number, attempt?: number, retryInMs?: number): ConsultonError {
  const error: ConsultonError = { kind, message };
  if (status !== undefined) error.status = status;
  if (attempt !== undefined) error.attempt = attempt;
  if (retryInMs !== undefined) error.retryInMs = retryInMs;
  return error;
}

function dispatchUI(name: string, detail: Dict) {
  if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") return;
  try {
    window.dispatchEvent(new CustomEvent(`consult:${name}`, { detail }));
  } catch {

  }
}


import {
  isTelemetryOptIn,
  diagRunStart,
  diagRunChunk,
  diagRunFinish,
  type ConsultOutcome,
  type ConsultErrorKind,
} from "../Tools/audit";


function buildOpenAIChatPayload(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  context: unknown,
  opts: ConsultonOptions
): Dict {
  const contentUser = context
    ? `${userPrompt}\n\n<CONTEXT>\n${typeof context === "string" ? context : JSON.stringify(context)}\n</CONTEXT>`
    : userPrompt;

  const payload: Dict = {
    model,
    temperature: opts.temperature ?? DEFAULTS.temperature,
    max_tokens: opts.maxTokens ?? DEFAULTS.maxTokens,
    ...(typeof opts.topP === "number" ? { top_p: opts.topP } : {}),
    ...(typeof opts.presencePenalty === "number" ? { presence_penalty: opts.presencePenalty } : {}),
    ...(typeof opts.frequencyPenalty === "number" ? { frequency_penalty: opts.frequencyPenalty } : {}),
    ...(opts.responseFormat ? { response_format: { type: opts.responseFormat } } : {}),
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: contentUser },
    ],
    ...(opts.payloadExtras || {}),
  };
  return payload;
}


async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number, signal?: AbortSignal): Promise<Response> {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    signal.addEventListener("abort", onAbort, { once: true });
  }

  const isTestEnv = (() => {
    try { return typeof import.meta !== "undefined" && !!(import.meta as any).vitest; } catch { return false; }
  })();
  const useTimer = timeoutMs > 0 && !isTestEnv;
  const timer = useTimer ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const merged: RequestInit = {
      ...init,
      signal: controller.signal,
    };
    return await fetch(url, merged);
  } finally {
    if (timer) clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onAbort);
  }
}

function mapStatusToError(status: number, attempt: number): ConsultonError {
  if (status === 401) return toError("unauthorized", "Your API key is invalid or missing.", status, attempt);
  if (status === 403) return toError("forbidden", "Access is forbidden for this request.", status, attempt);
  if (status === 429) return toError("rate_limited", "Rate limit reached. Please try again shortly.", status, attempt);
  if (status >= 500)  return toError("server_error", "The server encountered an error. Please retry.", status, attempt);
  if (status >= 400)  return toError("bad_request", "The request was invalid. Check inputs and try again.", status, attempt);
  return toError("unknown", "Unexpected response.", status, attempt);
}


function baseUrlFromEndpoint(endpoint: string): string {
  try {
    const url = new URL(endpoint);

    const parts = url.pathname.split("/").filter(Boolean);
    const v1Index = parts.indexOf("v1");
    const basePath = v1Index >= 0 ? "/" + parts.slice(0, v1Index + 1).join("/") : url.pathname;
    return `${url.protocol}//${url.host}${basePath}`.replace(/\/$/, "");
  } catch {
    return "https://api.openai.com/v1";
  }
}

export async function verifyConsultonKey(apiKey: string, endpoint?: string, timeoutMs = 12_000): Promise<{ ok: boolean; status: number; message: string; }>
{
  const base = baseUrlFromEndpoint(endpoint ?? DEFAULTS.endpoint);
  const url = `${base}/models`;
  try {
    const res = await fetchWithTimeout(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    }, timeoutMs);

    const status = res.status;
    if (res.ok) {
      return { ok: true, status, message: "Key is valid." };
    }

    if (status === 401) return { ok: false, status, message: "Unauthorized: key is invalid or missing." };
    if (status === 403) return { ok: false, status, message: "Forbidden: key lacks access permissions." };
    if (status === 429) return { ok: false, status, message: "Rate limited: try again shortly." };
    if (status >= 500) return { ok: false, status, message: "Server error: retry later." };
    return { ok: false, status, message: `Unexpected response (${status}).` };
  } catch (e: unknown) {
    return { ok: false, status: 0, message: (e as Error)?.message || "Network error." };
  }
}


function parseSSELines(buffer: string, onLine: (line: string) => void): string {

  let start = 0;
  while (true) {
    const idx = buffer.indexOf("\n", start);
    if (idx === -1) break;
    const line = buffer.slice(start, idx).trim();
    if (line) onLine(line);
    start = idx + 1;
  }
  return buffer.slice(start);
}


export function streamConsulton(
  args: StreamConsultonArgs,
  onChunk: OnChunk,
  onDone: OnDone,
  onError: OnError,
  externalSignal?: AbortSignal
): { cancel: () => void } {
  const startedAt = nowMs();
  const runId = Math.random().toString(36).slice(2, 10);
  const {
    apiKey,
    systemPrompt,
    userPrompt,
    context = undefined,
    options = {},
    metricsSeed,
    meta,
  } = args;

  const model = options.model ?? DEFAULTS.model;
  const endpoint = options.endpoint ?? DEFAULTS.endpoint;
  const proto = options.streamProtocol ?? "auto";
  const timeoutMs = options.timeoutMs ?? DEFAULTS.timeoutMs;
  const backoff = { ...DEFAULTS.backoff, ...(options.backoff || {}) };

  const redacted = !!options.redact;


  const effectiveSystem = (typeof systemPrompt === "string" && systemPrompt.trim().length > 0)
    ? systemPrompt
    : CONSULTON_SYSTEM_PROMPT;


  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
    ...(options.headers || {}),
  };


  const payload = buildOpenAIChatPayload(model, effectiveSystem, userPrompt, context, options);


  const controller = new AbortController();
  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    externalSignal.addEventListener("abort", onExternalAbort, { once: true });
  }

  let attempt = 0;
  let lastStatus = 0;

  dispatchUI("start", { model, endpoint, startedAt, proto, resumeOfRunId: meta?.resumeOfRunId ?? null });
  if (isTelemetryOptIn()) {
    const startMeta: { id: string; model: string; tsStart: number; promptChars?: number; contextChars?: number; redacted?: boolean } = {
      id: runId,
      model,
      tsStart: startedAt,
    };
    if (typeof metricsSeed?.promptChars === "number") startMeta.promptChars = metricsSeed.promptChars;
    if (typeof metricsSeed?.contextChars === "number") startMeta.contextChars = metricsSeed.contextChars;

    startMeta.redacted = redacted;
    diagRunStart(startMeta);
  }

  const doRequest = async (): Promise<void> => {
    attempt += 1;


    if (proto === "auto") {
      const okAuto = await tryUnifiedStreaming();
      if (okAuto) return;

      await tryOneShot();
      return;
    }


    if (proto === "sse") {
      const ok = await trySSE();
      if (ok) return;

      await tryOneShot();
      return;
    }


    if (proto === "fetch") {
      const ok = await tryFetchStreaming();
      if (ok) return;
      await tryOneShot();
      return;
    }
  };

    const finalize = (finishedReason: DoneMeta["finishedReason"], status: number) => {
      const meta: DoneMeta = {
        model,
        durationMs: nowMs() - startedAt,
        status,
        finishedReason,
        attempt,
      };
      try { onDone(meta); } catch {}

      dispatchUI("finish", { ...(meta as Dict), resumeOfRunId: args.meta?.resumeOfRunId ?? null });
      if (isTelemetryOptIn()) {
        const outcome: ConsultOutcome = finishedReason === "canceled" ? "canceled" : "ok";
        diagRunFinish(runId, outcome, { tsEnd: nowMs(), status });
      }
    };

  const fail = (err: ConsultonError) => {
    try { onError(err); } catch {}

    dispatchUI("error", { ...(err as Dict), resumeOfRunId: args.meta?.resumeOfRunId ?? null });
    if (isTelemetryOptIn()) {
      const extra: { tsEnd?: number; status?: number; errorKind?: ConsultErrorKind; retryInMs?: number } = { tsEnd: nowMs(), errorKind: err.kind as ConsultErrorKind };
      if (typeof err.status === "number") extra.status = err.status;
      if (typeof err.retryInMs === "number") extra.retryInMs = err.retryInMs;
      diagRunFinish(runId, "error", extra);
    }
  };

  async function trySSE(): Promise<boolean> {
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    try {
      const res = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }, timeoutMs, controller.signal);

      lastStatus = res.status;


      if (!res.ok) {
        if (res.status === 429 && attempt <= backoff.maxRetries + 1) {
          const base = clamp(backoff.baseMs * attempt, backoff.baseMs, backoff.maxMs);
          const ms = backoff.jitter ? Math.round(jitter(base)) : base;
          dispatchUI("backoff", { attempt, retryInMs: ms, status: res.status, phase: "sse" });
          fail({ ...mapStatusToError(res.status, attempt), retryInMs: ms });

          return false;
        }
        fail(mapStatusToError(res.status, attempt));
        return false;
      }

      const ctype = res.headers.get("content-type") || "";
      const isEventStream = ctype.includes("text/event-stream");
      if (!isEventStream) {

        return false;
      }

      const dec = new TextDecoder("utf-8");

      const body = (res as any).body as ReadableStream<Uint8Array> | null;
      if (!body) {

        return false;
      }
      reader = body.getReader();

      let buffer = "";
      while (true) {
        if (controller.signal.aborted) throw toError("aborted", "Request aborted by user.", lastStatus, attempt);
        const { done, value } = await reader.read();
        if (done) break;

        buffer += dec.decode(value, { stream: true });
        buffer = parseSSELines(buffer, (line) => {
          if (!line.startsWith("data:")) return;
          const data = line.slice(5).trim();
          if (data === "[DONE]") {

            return;
          }
          try {
            const json = JSON.parse(data);

            const delta = json?.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              try { onChunk(delta); } catch {}
              dispatchUI("chunk", { attempt, bytes: delta.length, proto: "sse" });
              if (isTelemetryOptIn()) {
                diagRunChunk(runId, delta.length);
              }
            }
          } catch {

          }
        });
      }

      if (controller.signal.aborted) {
        finalize("canceled", lastStatus);
        dispatchUI("cancel", { attempt, status: lastStatus, atMs: nowMs(), resumeOfRunId: args.meta?.resumeOfRunId ?? null });
        return true;
      }

      finalize("stop", lastStatus || 200);
      return true;
    } catch (e: unknown) {

      if (controller.signal.aborted) {
        fail(toError("aborted", "Request aborted by user.", lastStatus, attempt));
        dispatchUI("cancel", { attempt, status: lastStatus, atMs: nowMs(), resumeOfRunId: args.meta?.resumeOfRunId ?? null });
        return true;
      }
      fail(toError("network_error", (e as Error).message || "Network error", lastStatus, attempt));
      return false;
    } finally {

    }
  }


  async function tryUnifiedStreaming(): Promise<boolean> {
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    try {
      const res = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }, timeoutMs, controller.signal);

      lastStatus = res.status;

      if (!res.ok) {
        if (res.status === 429 && attempt <= backoff.maxRetries + 1) {
          const base = clamp(backoff.baseMs * attempt, backoff.baseMs, backoff.maxMs);
          const ms = backoff.jitter ? Math.round(jitter(base)) : base;
          dispatchUI("backoff", { attempt, retryInMs: ms, status: res.status, phase: "auto" });
          fail({ ...mapStatusToError(res.status, attempt), retryInMs: ms });
          return false;
        }
        fail(mapStatusToError(res.status, attempt));
        return false;
      }

      const ctype = res.headers.get("content-type") || "";

      const body = (res as any).body as ReadableStream<Uint8Array> | null;
      if (!body) return false;

      const dec = new TextDecoder("utf-8");
      reader = body.getReader();

      if (ctype.includes("text/event-stream")) {

        let buffer = "";
        while (true) {
          if (controller.signal.aborted) throw toError("aborted", "Request aborted by user.", lastStatus, attempt);
          const { done, value } = await reader.read();
          if (done) break;
          buffer += dec.decode(value, { stream: true });
          buffer = parseSSELines(buffer, (line) => {
            if (!line.startsWith("data:")) return;
            const data = line.slice(5).trim();
            if (data === "[DONE]") return;
            try {
              const json = JSON.parse(data);
              const delta = json?.choices?.[0]?.delta?.content ?? "";
              if (delta) {
                try { onChunk(delta); } catch {}
                dispatchUI("chunk", { attempt, bytes: delta.length, proto: "sse" });
                if (isTelemetryOptIn()) diagRunChunk(runId, delta.length);
              }
            } catch {  }
          });
        }
      } else {

        while (true) {
          if (controller.signal.aborted) throw toError("aborted", "Request aborted by user.", lastStatus, attempt);
          const { done, value } = await reader.read();
          if (done) break;
          const text = dec.decode(value, { stream: true });
          if (text) {
            try { onChunk(text); } catch {}
            dispatchUI("chunk", { attempt, bytes: text.length, proto: "fetch" });
            if (isTelemetryOptIn()) diagRunChunk(runId, text.length);
          }
        }
      }

      if (controller.signal.aborted) {
        finalize("canceled", lastStatus);
        dispatchUI("cancel", { attempt, status: lastStatus, atMs: nowMs(), resumeOfRunId: args.meta?.resumeOfRunId ?? null });
        return true;
      }

      finalize("stop", lastStatus || 200);
      return true;
    } catch (e: unknown) {
      if (controller.signal.aborted) {
        fail(toError("aborted", "Request aborted by user.", lastStatus, attempt));
        dispatchUI("cancel", { attempt, status: lastStatus, atMs: nowMs(), resumeOfRunId: args.meta?.resumeOfRunId ?? null });
        return true;
      }
      fail(toError("network_error", (e as Error).message || "Network error", lastStatus, attempt));
      return false;
    } finally {

    }
  }

  async function tryFetchStreaming(): Promise<boolean> {
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    try {

      const nonStreamPayload = { ...payload, stream: false };
      const res = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(nonStreamPayload),
      }, timeoutMs, controller.signal);

      lastStatus = res.status;

      if (!res.ok) {
        if (res.status === 429 && attempt <= backoff.maxRetries + 1) {
          const base = clamp(backoff.baseMs * attempt, backoff.baseMs, backoff.maxMs);
          const ms = backoff.jitter ? Math.round(jitter(base)) : base;
          dispatchUI("backoff", { attempt, retryInMs: ms, status: res.status, phase: "fetch" });
          fail({ ...mapStatusToError(res.status, attempt), retryInMs: ms });
          return false;
        }
        fail(mapStatusToError(res.status, attempt));
        return false;
      }


      const dec = new TextDecoder("utf-8");

      const body = (res as any).body as ReadableStream<Uint8Array> | null;
      if (!body) {

        return false;
      }
      reader = body.getReader();
      while (true) {
        if (controller.signal.aborted) throw toError("aborted", "Request aborted by user.", lastStatus, attempt);
        const { done, value } = await reader.read();
        if (done) break;
        const text = dec.decode(value, { stream: true });
        if (text) {
          try { onChunk(text); } catch {}
          dispatchUI("chunk", { attempt, bytes: text.length, proto: "fetch" });
          if (isTelemetryOptIn()) {
            diagRunChunk(runId, text.length);
          }
        }
      }

      if (controller.signal.aborted) {
        finalize("canceled", lastStatus);
        dispatchUI("cancel", { attempt, status: lastStatus, atMs: nowMs(), resumeOfRunId: args.meta?.resumeOfRunId ?? null });
        return true;
      }

      finalize("stop", lastStatus || 200);
      return true;
    } catch (e: unknown) {
      if (controller.signal.aborted) {
        fail(toError("aborted", "Request aborted by user.", lastStatus, attempt));
        dispatchUI("cancel", { attempt, status: lastStatus, atMs: nowMs(), resumeOfRunId: args.meta?.resumeOfRunId ?? null });
        return true;
      }
      fail(toError("network_error", (e as Error).message || "Network error", lastStatus, attempt));
      return false;
    } finally {

    }
  }

  async function tryOneShot(): Promise<void> {
    try {
      const res = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ ...payload, stream: false }),
      }, timeoutMs, controller.signal);

      lastStatus = res.status;

      if (!res.ok) {
        if (res.status === 429 && attempt <= backoff.maxRetries + 1) {
          const base = clamp(backoff.baseMs * attempt, backoff.baseMs, backoff.maxMs);
          const ms = backoff.jitter ? Math.round(jitter(base)) : base;
          dispatchUI("backoff", { attempt, retryInMs: ms, status: res.status, phase: "oneshot" });
          fail({ ...mapStatusToError(res.status, attempt), retryInMs: ms });
          return;
        }
        fail(mapStatusToError(res.status, attempt));
        return;
      }

      const data = await res.json().catch(() => null as unknown);

      const text = (data as any)?.choices?.[0]?.message?.content ?? "";
      if (text) {
        try { onChunk(String(text)); } catch {}
        dispatchUI("chunk", { attempt, bytes: String(text).length, proto: "oneshot" });
        if (isTelemetryOptIn()) {
          diagRunChunk(runId, String(text).length);
        }
      }
      if (controller.signal.aborted) {
        finalize("canceled", lastStatus);
        dispatchUI("cancel", { attempt, status: lastStatus, atMs: nowMs(), resumeOfRunId: args.meta?.resumeOfRunId ?? null });
        return;
      }
      finalize("stop", lastStatus || 200);
    } catch (e: unknown) {
      if (controller.signal.aborted) {
        fail(toError("aborted", "Request aborted by user.", lastStatus, attempt));
        dispatchUI("cancel", { attempt, status: lastStatus, atMs: nowMs() });
        return;
      }
      fail(toError("network_error", (e as Error).message || "Network error", lastStatus, attempt));
    }
  }


  void doRequest();

  return {
    cancel: () => {
      try { controller.abort(); } catch {  }
    },
  };
}


