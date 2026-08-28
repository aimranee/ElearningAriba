---
status: in-progress
---

# Quick task — lockfile, typecheck order, NEXT_PUBLIC_SITE_URL resolution (run 2)

Source: `ariba-cto/notes/2026-08-27-brief-fix-lockfile-et-site-url.md` (revised
2026-08-28). Rework on SOCLE-04/SOCLE-05. Three defects, three atomic commits.

## Task 1 — commit Defect 1 (lockfile)

`package-lock.json` is already modified in the working tree (regenerated
inside `node:22-bookworm`, proven `npm ci` + `lint` green there). Validate
that proof still holds, then commit as-is. `package.json` untouched, `shadcn`
stays a pinned devDependency. No regeneration unless the container disproves
the existing fix.

## Task 2 — commit Defect 3 (typecheck order)

`package.json`: `"typecheck": "tsc --noEmit"` → `"typecheck": "next typegen && tsc --noEmit"`.
Nothing else in `package.json`, nothing in `ci.yml` or `vercel.json`.

## Task 3 — commit Defect 2 (NEXT_PUBLIC_SITE_URL resolution)

Add `src/lib/env/site-url.ts` exporting `resolveSiteUrl(env)`:
1. explicit `NEXT_PUBLIC_SITE_URL` wins
2. else on Vercel, per `VERCEL_ENV`: production → `https://${VERCEL_PROJECT_PRODUCTION_URL}`,
   preview/other → `https://${VERCEL_BRANCH_URL || VERCEL_URL}`
3. else `http://localhost:3000`

Wire it into `src/lib/env/server.ts`'s parse call (server-side, real
`process.env` at runtime — no cross-module import-order dependency). Wire it
into `next.config.ts`'s `env` field so the value is inlined into the client
bundle for `src/lib/env/client.ts`'s existing static
`process.env.NEXT_PUBLIC_SITE_URL` access (left untouched — comment there
already explains why it must stay a literal access).

Zod `.url()` validation stays in place on both schemas — boot still fails
loudly if the resolved value is somehow invalid.

Update `.env.example`, `README.md`, `docs/hebergement.md` to document the new
resolution order and that the variable can be left unset on Vercel.

No `NEXT_PUBLIC_VERCEL_*` client-exposed variants — unverified per brief,
build-time-only resolution in `next.config.ts` sidesteps that toggle entirely.

## Verification

Inside `node:22-bookworm`: `npm ci && npm run lint && npm run typecheck && npm run build`,
all four green in order. No `node_modules` residue left for Windows. Then
`npm ci` on Windows to re-prove.

## Constraints

Never push. Stay on `gsd/phase-00-socle-technique-et-environnement`. Touch
only what the three defects require. Three atomic commits, in order.
