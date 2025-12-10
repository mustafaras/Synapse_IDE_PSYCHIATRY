export type ConsultSessionStatus = "running" | "done" | "canceled" | "error";
export type ConsultSession = {
  id: string;
  title: string;
  startedAt: number;
  endedAt?: number;
  status: ConsultSessionStatus;

  raw: string;
  html: string;

  model: string;
  temperature: number;
  maxTokens: number;
};

const sessions: ConsultSession[] = [];
type Sub = (list: ConsultSession[]) => void;
const subs = new Set<Sub>();

const notify = () => {
  const list = sessions.slice();
  subs.forEach(fn => { try { fn(list); } catch {} });
};

export function subscribeSessions(cb: Sub): () => void {
  subs.add(cb);
  try { cb(sessions.slice()); } catch {}
  return () => void subs.delete(cb);
}

export function getSessions() { return sessions.slice(); }
export function getSessionById(id: string) { return sessions.find(s => s.id === id); }

export function createSession(init: Partial<ConsultSession>): ConsultSession {
  const id = init.id ?? Math.random().toString(36).slice(2, 10);
  const now = Date.now();
  const s: ConsultSession = {
    id,
    title: init.title ?? `Run ${sessions.length + 1} — ${new Date(now).toLocaleTimeString()}`,
    startedAt: init.startedAt ?? now,
    status: init.status ?? "running",
    raw: init.raw ?? "",
    html: init.html ?? "",
    model: init.model ?? "gpt-5",
    temperature: typeof init.temperature === "number" ? init.temperature : 0.2,
    maxTokens: typeof init.maxTokens === "number" ? init.maxTokens : 1024
  };
  sessions.push(s);
  notify();
  return s;
}

export function updateSession(id: string, patch: Partial<ConsultSession>) {
  const s = sessions.find(x => x.id === id);
  if (!s) return;
  Object.assign(s, patch);
  notify();
}

export function closeSession(id: string) {
  const i = sessions.findIndex(x => x.id === id);
  if (i >= 0) {
    sessions.splice(i, 1);
    notify();
  }
}

export function renameSession(id: string, title: string) {
  const s = sessions.find(x => x.id === id);
  if (!s) return;
  s.title = title;
  notify();
}
