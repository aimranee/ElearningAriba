import "server-only";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

/*
 * why: a dependency-free in-process sliding-window limiter — a Map from key
 * to pruned timestamp array. This is per-instance and therefore best-effort
 * on serverless (a cold instance resets the count); a shared store (Redis,
 * Upstash, ...) is deliberately out of scope because D-35 forbids a third
 * party here and nothing about this form may enter the cookie/RGPD
 * inventory before Lot 5. Good enough to blunt casual abuse, not a hard
 * guarantee.
 */
const hits = new Map<string, number[]>();

export function consume(key: string): { allowed: boolean } {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const previous = hits.get(key) ?? [];
  const recent = previous.filter((timestamp) => timestamp > cutoff);

  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return { allowed: false };
  }

  recent.push(now);
  hits.set(key, recent);
  return { allowed: true };
}
