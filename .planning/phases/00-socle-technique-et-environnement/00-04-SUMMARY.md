---
phase: 00-socle-technique-et-environnement
plan: 04
subsystem: infra
tags: [github-actions, ci, nvmrc, eslint, typescript]

requires:
  - phase: 00-socle-technique-et-environnement (plan 01)
    provides: npm scripts lint/typecheck/build, package-lock.json, engines.node
  - phase: 00-socle-technique-et-environnement (plan 02)
    provides: .env.example variable names, boot-time environment validation
provides:
  - .github/workflows/ci.yml — pull_request/push CI gate running lint, typecheck, build
  - .nvmrc — single Node version pin shared by CI and (later) the hosting build
  - CONTRIBUTING.md — branch -> preview -> pull request -> CI -> merge flow, in French, with the branch-protection handover declared as an external dependency
affects: [00-06]

tech-stack:
  added: []
  patterns:
    - "CI runs the same three npm scripts (lint, typecheck, build) a developer runs locally, from npm ci"
    - "Node version pinned once in .nvmrc, read by CI via node-version-file"

key-files:
  created:
    - .github/workflows/ci.yml
    - .nvmrc
    - CONTRIBUTING.md
  modified: []

key-decisions:
  - "Build step supplies only schema-valid, non-secret placeholder env values (localhost/127.0.0.1/literal placeholder strings) so the boot-time Zod validator from plan 00-02 passes in CI without any real credential existing"

patterns-established:
  - "CI workflow triggers on pull_request (never pull_request_target) with top-level permissions: contents: read and nothing else"

requirements-completed: [SOCLE-05, SOCLE-03]

duration: 1min
completed: 2026-08-27
---

# Phase 00 Plan 04: CI Quality Gate and Delivery Flow Summary

**GitHub Actions `CI` workflow running lint, typecheck and build via `npm ci` on every pull request targeting `main`, Node pinned once in `.nvmrc`, and `CONTRIBUTING.md` recording the branch-protection handover as an external dependency.**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-08-27T13:13:19Z
- **Completed:** 2026-08-27T13:14:20Z
- **Tasks:** 2
- **Files modified:** 3 (across 2 commits)

## Accomplishments
- `.github/workflows/ci.yml` runs `quality` on `ubuntu-latest`: checkout, `actions/setup-node` with `node-version-file: .nvmrc` and npm caching, `npm ci`, then `npm run lint`, `npm run typecheck`, `npm run build` as three separate named steps
- Triggers on `pull_request` (branches `[main]`) and `push` (branches `[main]`); no `pull_request_target`, no `secrets.` reference anywhere in the file
- Top-level `permissions: contents: read` only; `concurrency` group cancels superseded runs
- Build step's `env` block supplies the four `.env.example` variable names with obviously non-secret placeholders (`http://localhost:3000`, `http://127.0.0.1:54321`, literal placeholder strings), with a comment stating no real value may ever be written there
- `.nvmrc` contains exactly `22`, matching the measured local Node v22.21.1 and `engines.node` from plan 00-01
- `npm run lint`, `npm run typecheck` and `npm run build` each verified to exit 0 locally before committing
- `CONTRIBUTING.md` (French) documents branche de fonctionnalité -> déploiement de prévisualisation -> pull request -> `CI` -> fusion dans `main`, the `#<type>: <phrase>` commit convention, and declares branch protection on `main` (requiring the `quality` job) plus PR-only merges as an external dependency owned by the party holding the hosting accounts — containing no day rate, margin, schedule or named individual
- Nothing pushed to any remote

## Task Commits

1. **Task 1: Write the pull-request gate running lint, type-check and build** - `572f649` (feat)
2. **Task 2: Record the delivery flow and the branch-protection handover** - `03baa10` (docs)

**Plan metadata:** pending (this commit)

## Files Created/Modified
- `.github/workflows/ci.yml` - CI workflow: checkout, setup-node, npm ci, lint, typecheck, build with non-secret placeholder env
- `.nvmrc` - `22`
- `CONTRIBUTING.md` - delivery flow, commit convention, branch-protection external-dependency handover (French)

## Decisions Made
- Placeholder build-env values chosen to be unambiguously non-secret (`localhost`, `127.0.0.1`, literal `placeholder-*` strings) and short enough that no automated secret-shape check (long token, `eyJ` fragment) could mistake them for real credentials.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None from this plan. Enabling branch protection on `main` (requiring the `quality` job) and requiring pull requests remains an external step for the party owning the hosting accounts, once the repository is connected — documented in `CONTRIBUTING.md`.

## Next Phase Readiness
- `.nvmrc` is now the single Node version pin available for plan 00-06 to quote as the hosting build runtime.
- The CI gate exists and is reproducible locally but is not yet *required* — branch protection is the declared external half of SOCLE-05.
- No blockers for plan 00-06, which depends on both this plan and 00-05.

---
*Phase: 00-socle-technique-et-environnement*
*Completed: 2026-08-27*

## Self-Check: PASSED

All 3 created files verified present on disk; both task commit hashes (572f649, 03baa10) verified present in git log.
