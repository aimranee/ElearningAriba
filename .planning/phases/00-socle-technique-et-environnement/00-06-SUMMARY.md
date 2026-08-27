---
phase: 00-socle-technique-et-environnement
plan: 06
subsystem: infra
tags: [vercel, hosting, readme, documentation]

requires:
  - phase: 00-socle-technique-et-environnement (plan 04)
    provides: .nvmrc, CONTRIBUTING.md, CI quality gate
  - phase: 00-socle-technique-et-environnement (plan 05)
    provides: db:types script, Supabase client factories, local half of SOCLE-02
provides:
  - vercel.json — framework/install/build declaration for a hosting import, no project or org id
  - docs/hebergement.md — hosted-half handover for Supabase (EU region, permanent) and Vercel
  - README.md — clone-to-running-app setup sequence, in French
affects: []

tech-stack:
  added: []
  patterns:
    - "Hosted-only steps are declared in docs/hebergement.md, never assumed or performed from this phase"

key-files:
  created:
    - vercel.json
    - docs/hebergement.md
  modified:
    - README.md

key-decisions:
  - "Task 4 (walking the README from a clean clone) intentionally NOT performed by this executor — verifier independence requires the party who did not write the README to walk it"

patterns-established: []

requirements-completed: []

duration: ~15min
completed: 2026-08-27
---

# Phase 00 Plan 06: Hosting Shape and Setup Documentation Summary

**`vercel.json` declaring the Next.js hosting shape, `docs/hebergement.md` handing over the hosted Supabase/Vercel halves with the permanent EU-region constraint stated up front, and a rewritten French `README.md` — 3 of 4 tasks complete, Task 4 (independent README walk) intentionally left open for the developer.**

## Performance

- **Duration:** ~15 min
- **Tasks:** 3 of 4 (Task 4 intentionally not performed)
- **Files modified:** 3 (across 3 commits)

## Accomplishments

- `vercel.json` at the repository root: `framework: "nextjs"`, `installCommand: "npm ci"`, `buildCommand: "npm run build"`; no `projectId`, `orgId`, `regions`, `crons`, `alias` or domain. No `.vercel` directory exists. `npm run build` exits 0.
- `docs/hebergement.md` (French): states the hosted Supabase project must be created in an EU region and that the region is permanent before creation; lists database, authentication and file storage as the three capabilities to provision; per-environment (local/preview/production) table of the four `.env.example` variable names with no value; marks `SUPABASE_SERVICE_ROLE_KEY` secret and server-only; cross-references `CONTRIBUTING.md` for the `quality` job branch-protection rule; closes with the no-paid-tier constraint. Contains zero `eyJ` fragments, zero opaque URLs, zero day-rate/margin/schedule/lot-11+ references.
- `README.md` replaced the `create-next-app` scaffold text with a French, D-12-compliant setup guide: prerequisites (Node 22 via `.nvmrc`, npm, Docker Desktop installed **and started**, with the manual-start requirement stated explicitly); the full sequence `npm ci` → copy `.env.example` to `.env.local` → `npx supabase start` → `npx supabase status` → `npm run db:types` → `npm run dev`; all six npm scripts named exactly as in `package.json`; migration workflow (`npx supabase migration new`, `npx supabase db reset`, no `db push`); env-var failure behavior; links to `CONTRIBUTING.md` and `docs/hebergement.md` without duplicating either.
- Nothing pushed, deployed or linked. `reference/` untouched.

## Task Commits

1. **Task 1: Give the repository the shape a hosting import consumes** — `358ee7e` (feat)
2. **Task 2: Declare the external dependencies in a handover document** — `1c222cd` (docs)
3. **Task 3: Write the README that takes a fresh clone to a running application** — `1365b59` (docs)
4. **Task 4: Walk the README from a clean clone** — **NOT PERFORMED** (see below)

**Plan metadata:** pending (this commit)

## Files Created/Modified

- `vercel.json` — hosting import shape: framework, install command, build command
- `docs/hebergement.md` — hosted Supabase/Vercel handover checklist, French
- `README.md` — clone-to-running-app setup guide, French, replaces the `create-next-app` scaffold text

## Decisions Made

- Task 4 was deliberately not performed by this executor. The plan's own `<action>` for Task 4 states: "do not simulate it, do not reason about it from the README text, and do not mark it done from the existing working tree — the working tree already has `node_modules`, a filled `.env.local` and a started stack, which is exactly what hides a missing step." A headless executor operating on this same working tree cannot satisfy that independence requirement; only a separately-run clean clone can.

## Deviations from Plan

None on Tasks 1–3 — each executed exactly as written and each automated `<verify>` check passed before commit.

Task 4 is not a deviation but an explicit scope exclusion directed by the orchestrating instruction for this run: complete Tasks 1–3, stop before Task 4.

## Issues Encountered

- `.planning/REQUIREMENTS.md` already shows `SOCLE-01`, `SOCLE-02` and `SOCLE-03` checked off as "Complete" from earlier plans (00-01 through 00-05), before this plan's Task 4 — the one verification step that actually proves SOCLE-01's D-12 claim ("a fresh clone reaches a running application with no undocumented step") — has run. This summary does not add further completions on top of that pre-existing state, and this executor treats SOCLE-01 and the hosted half of SOCLE-03 as **not actually verified** regardless of what the checkboxes say, until Task 4 is walked. Flagging this discrepancy for the developer rather than silently deepening it.

## Pending human verification

**Task 4 — walk the README from a clean clone — is intentionally left open.** It was not performed, not simulated, and not marked done. This is by design: the party who wrote the README must not be the party who verifies it, and the current working tree already has `node_modules`, a filled `.env.local` and a running Supabase stack — exactly the state that hides a missing step.

Steps the developer must walk to close Task 4:

1. Clone this repository into a temporary directory **outside** the current working tree (a local `git clone` of the working copy is sufficient — do not push and do not clone from a remote).
2. Follow `README.md` from the top, running only the commands it names, in the order it names them, inventing nothing:
   - confirm Node 22, npm and a started Docker Desktop are in place
   - `npm ci`
   - copy `.env.example` to `.env.local`
   - `npx supabase start`
   - read the API URL and keys from `npx supabase status`, paste them into `.env.local`
   - `npm run db:types`
   - `npm run dev`
3. Confirm `npm run dev` serves the application and `GET /` answers in the browser.
4. Report any moment a step had to be guessed, looked up elsewhere, or run a command the README does not contain — if found, that gap must be added to `README.md` and the walk repeated to green.
5. Delete the temporary clone. No remote is contacted at any point.

**Until this walk is done and reported "approved," Phase 0 is not fully verified.** Plan 00-06 status: **3/4 tasks complete — Task 4 pending human verification.**

## User Setup Required

Beyond Task 4 above, the hosted-half external dependencies declared in `docs/hebergement.md` remain open and owned by the party holding the hosting accounts: creating the Supabase project in an EU region with database/auth/storage provisioned, connecting the repository to Vercel with per-branch HTTPS previews and the production domain, and enabling branch protection requiring the `quality` CI job on `main`.

## Next Phase Readiness

- `vercel.json` and `docs/hebergement.md` give a later session everything needed to action the hosted halves of SOCLE-02 and SOCLE-03 without guesswork.
- `README.md` is ready for the independent walk; it is not yet confirmed correct end-to-end.
- **Phase 0 is NOT fully verified or fully complete.** Task 4 of this plan is the sole remaining gate, and it requires the developer, not this executor.

---
*Phase: 00-socle-technique-et-environnement*
*Completed: 2026-08-27 (partial — 3/4 tasks; Task 4 pending human verification)*

## Self-Check: PASSED

All 3 created/modified files (`vercel.json`, `docs/hebergement.md`, `README.md`) verified present on disk; all three task commit hashes (`358ee7e`, `1c222cd`, `1365b59`) verified present in git log.
