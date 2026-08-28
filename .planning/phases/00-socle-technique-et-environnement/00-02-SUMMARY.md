---
phase: 00-socle-technique-et-environnement
plan: 02
subsystem: infra
tags: [zod, env-validation, nextjs, gitignore]

requires:
  - phase: 00-socle-technique-et-environnement (plan 01)
    provides: Next.js scaffold, next.config.ts, @/* alias, npm scripts
provides:
  - .env.example naming all four contractual environment variables with no values
  - .env.local with schema-valid, non-secret placeholders (git-ignored)
  - src/lib/env/server.ts, client.ts, index.ts — Zod-validated environment split
  - Boot-time environment gate wired into next.config.ts (dev/build/start all fail fast)
affects: [00-03, 00-04, 00-05, 00-06]

tech-stack:
  added: [zod@4.4.3]
  patterns:
    - "Environment access only through src/lib/env/server.ts (server) or src/lib/env/client.ts (browser) — never process.env directly"
    - "Server/client env split to keep secrets out of the browser bundle"

key-files:
  created:
    - .env.example
    - .env.local
    - src/lib/env/server.ts
    - src/lib/env/client.ts
    - src/lib/env/index.ts
  modified:
    - .gitignore
    - next.config.ts
    - package.json
    - package-lock.json

key-decisions:
  - "zod was already a transitive dependency in package-lock.json (via shadcn) but not in package.json — npm install zod added it as a direct dependency, which is what task 2 required regardless"

patterns-established:
  - "Zod schema at module scope, parsed at import time, frozen export — the pattern every future secret (payment, email, Google Calendar) follows"

requirements-completed: [SOCLE-04]

duration: 15min
completed: 2026-08-27
---

# Phase 00 Plan 02: Environment Variables and Boot-Time Validation Summary

**Zod-validated, server/client-split environment module wired into next.config.ts so dev/build/start fail loudly by variable name; .env.example documents all four contractual variable names with zero values.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-08-27T12:49:00Z
- **Completed:** 2026-08-27T13:04:03Z
- **Tasks:** 2
- **Files modified:** 9 (across 2 commits)

## Accomplishments
- `.env.example` commits only variable names, no values, grouped by environment with the service-role key marked server-only/secret
- `.env.local` holds schema-valid placeholders so `npm run build` succeeds from this plan onward, without a real credential ever existing
- `.gitignore` now also excludes `.vercel`, `supabase/.temp/`, `supabase/.branches/`, and `.gsd-headless/` (the untracked internal tooling directory present at session start)
- `src/lib/env/server.ts` validates all four variables with Zod at module scope and throws, naming the failing variable, on any missing/malformed value
- `src/lib/env/client.ts` exposes only the three `NEXT_PUBLIC_` variables via statically-analysable `process.env.NEXT_PUBLIC_*` accesses, contains no reference to the server-only key, and does not import the server module
- `next.config.ts` imports the server module via a relative specifier for its side effect, so `dev`, `build` and `start` all fail before serving a request
- Blanking `NEXT_PUBLIC_SUPABASE_URL` and running `next build` fails non-zero with `NEXT_PUBLIC_SUPABASE_URL` in the error output; a full placeholder environment builds cleanly
- `lint`, `typecheck`, `build` all exit 0; no `any` anywhere under `src/`; `SUPABASE_SERVICE_ROLE_KEY` appears in `src/` only inside `src/lib/env/server.ts`

## Task Commits

1. **Task 1: Lock secret hygiene in .gitignore and publish the value-free .env.example** - `98a171e` (chore)
2. **Task 2: Validate the environment with Zod at the process boundary and fail loudly by name** - `953a40f` (feat)

**Plan metadata:** pending (this commit)

## Files Created/Modified
- `.gitignore` - added `.vercel`, `supabase/.temp/`, `supabase/.branches/`, `.gsd-headless/`
- `.env.example` - four variable names, no values, grouped by environment
- `.env.local` - schema-valid non-secret placeholders (git-ignored, not committed)
- `src/lib/env/server.ts` - full Zod schema, parses `process.env`, throws by name on failure, frozen typed export
- `src/lib/env/client.ts` - `NEXT_PUBLIC_` subset only, statically-analysable accesses, no server import
- `src/lib/env/index.ts` - re-exports both, documents why the split exists
- `next.config.ts` - relative side-effect import of `./src/lib/env/server`
- `package.json` / `package-lock.json` - `zod` added as a direct runtime dependency

## Decisions Made
- `zod` was already present transitively in `package-lock.json` (pulled in by `shadcn`) but absent from `package.json` `dependencies`; `npm install zod` promoted it to a direct dependency, satisfying the acceptance criterion regardless of the prior transitive state.

## Deviations from Plan

None - plan executed exactly as written. The `.gsd-headless/` addition to `.gitignore` was already explicitly specified by the plan's task 1 action (not an inferred deviation).

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required in this plan. `.env.local` placeholders are wired for local `npm run build`/`dev` to work before Supabase exists; plan 00-05 replaces them with real local-stack values.

## Next Phase Readiness
- `.env.example` is the authoritative variable list plan 00-04 (CI) mirrors as placeholders and plan 00-06 documents for the account owner.
- `src/lib/env/server.ts` and `client.ts` are the only sanctioned way later plans (00-05 Supabase, and every later lot) read environment variables.
- No blockers for plans 00-03 or 00-04.

---
*Phase: 00-socle-technique-et-environnement*
*Completed: 2026-08-27*

## Self-Check: PASSED

All 7 created/modified files verified present on disk; both task commit hashes (98a171e, 953a40f) verified present in git log.
