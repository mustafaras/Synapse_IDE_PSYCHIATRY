type Bucket = { hits: number[] };
const users = new Map<string, Bucket>();
const sessions = new Map<string, Bucket>();
const providers = new Map<string, Bucket>();

const now = () => Date.now();
const prune = (b: Bucket, windowMs: number) => { b.hits = b.hits.filter((t) => now() - t < windowMs); };

function take(b: Bucket, limit: number, windowMs: number): boolean {
  prune(b, windowMs);
  if (b.hits.length >= limit) return false;
  b.hits.push(now());
  return true;
}

export function guardUser(userId: string, perMin: number) {
  const b = users.get(userId) ?? { hits: [] }; users.set(userId, b);
  return take(b, perMin, 60_000);
}
export function guardSession(sessId: string, perMin: number) {
  const b = sessions.get(sessId) ?? { hits: [] }; sessions.set(sessId, b);
  return take(b, perMin, 60_000);
}
export function guardProvider(prov: string, perMin: number) {
  const b = providers.get(prov) ?? { hits: [] }; providers.set(prov, b);
  return take(b, perMin, 60_000);
}
