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
 * guarantee. A per-call-site budget exists (below) because a slot-retention
 * route and a contact form do not have the same shape of traffic.
 */
const hits = new Map<string, number[]>();

/* why (W14): entries were only ever `set`, never `delete`d — harmless while
   every key was an IP behind an authenticated-adjacent form, and not
   harmless once an unauthenticated caller can influence the key space
   (src/app/api/creneaux/maintien/route.ts). An amortised sweep, every
   500th call, drops entries whose newest timestamp predates the widest
   window this module has been asked for — no dependency, no scheduler. */
let appelsDepuisPurge = 0;
let fenetreLaPlusLarge = WINDOW_MS;
const INTERVALLE_PURGE = 500;

function purgerEntreesPerimees(now: number): void {
  const cutoff = now - fenetreLaPlusLarge;
  for (const [key, timestamps] of hits) {
    const dernier = timestamps.length > 0 ? Math.max(...timestamps) : -Infinity;
    if (dernier < cutoff) {
      hits.delete(key);
    }
  }
}

export function consume(
  key: string,
  options?: { max?: number; windowMs?: number },
): { allowed: boolean } {
  const max = options?.max ?? MAX_PER_WINDOW;
  const windowMs = options?.windowMs ?? WINDOW_MS;

  if (windowMs > fenetreLaPlusLarge) {
    fenetreLaPlusLarge = windowMs;
  }

  appelsDepuisPurge += 1;
  const now = Date.now();
  if (appelsDepuisPurge >= INTERVALLE_PURGE) {
    appelsDepuisPurge = 0;
    purgerEntreesPerimees(now);
  }

  const cutoff = now - windowMs;
  const previous = hits.get(key) ?? [];
  const recent = previous.filter((timestamp) => timestamp > cutoff);

  if (recent.length >= max) {
    hits.set(key, recent);
    return { allowed: false };
  }

  recent.push(now);
  hits.set(key, recent);
  return { allowed: true };
}
