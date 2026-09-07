---
phase: quick
plan: 260904-rex
subsystem: ui
tags: [react, nextjs, tailwind, lucide-react]

requires:
  - phase: 02-site-public
    provides: pour-qui.tsx card grid (D-49) and footer built on 2026-09-01
provides:
  - Second-row "Pour qui" cards now span 3+3 lg columns instead of a centered orphan pair
  - Card footer (label + chevron) always renders, independent of `donnees.accroche`
affects: [02-site-public, 02-11]

tech-stack:
  added: []
  patterns:
    - "Footer affordance no longer conditioned on optional content field — always renders, content varies"

key-files:
  created: []
  modified:
    - src/components/sections/pour-qui.tsx
    - src/locales/fr/common.json
    - .planning/phases/02-site-public/02-CONTEXT.md

key-decisions:
  - "D-105: second row is two 3-col cards, lg:col-start-2 removed, six columns consumed across both rows"
  - "D-106: hover-reveal mechanism kept; card now carries a permanent label+chevron affordance, hidden where hover doesn't exist"
  - "D-107: footer no longer conditioned on donnees.accroche; shows titre only when a distinct accroche exists"

patterns-established: []

requirements-completed: []

duration: 10min
completed: 2026-09-04
---

# Quick Task 260904-rex: Pour qui grid col-span + always-on footer Summary

**Second-row "Pour qui" cards now split 3+3 across all six lg grid columns; card footer (label + chevron) always renders instead of only when an accroche exists.**

## Performance

- **Duration:** ~10 min
- **Completed:** 2026-09-04T18:49:18Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Grid: indices 0-2 keep `lg:col-span-2`, indices 3-4 now `lg:col-span-3` (was a single `lg:col-span-2 lg:col-start-2` centered card); `lg:col-start-2` fully removed.
- Footer: swapped `ArrowRight` for `ChevronDown` (rotate-180 on hover/focus instead of translate-x), always renders a `<div>` with label (`titre` when an accroche exists, else new `common.actions.enSavoirPlus` key) + chevron; hidden under `[@media(hover:none)]`.
- New locale key `actions.enSavoirPlus` added to `common.json` only — not registered in `_mocks.public.json`, confirmed absent from `content:check` output.
- Recorded D-105 to D-107 in `02-CONTEXT.md`.

## Task Commits

1. **Task 1+2: Grid col-span fix, always-rendered footer with chevron, locale key** - `b5ed1cb` (feat)
2. **Task 3: Record D-105 to D-107** - `b32c3cf` (docs)

## Files Created/Modified
- `src/components/sections/pour-qui.tsx` - col-span keyed on index, footer always renders with ChevronDown
- `src/locales/fr/common.json` - added `actions.enSavoirPlus`
- `.planning/phases/02-site-public/02-CONTEXT.md` - D-105 to D-107 appended after D-104

## Decisions Made
See key-decisions above (D-105 to D-107).

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None on the source change. `npm run lint` reported errors, but they come entirely from stale build artifacts under `.claude/worktrees/agent-a80857ed9be261179/.next/build/**` — a leftover worktree from a prior parallel-execution run, not covered by the root `eslint.config.mjs`'s top-level `.next/**` ignore glob (which only matches at repo root, not nested paths). Zero lint errors/warnings on `src/components/sections/pour-qui.tsx` or `src/locales/fr/common.json` themselves. Out of scope per this task's file list — not fixed, flagged here for cleanup (delete `.claude/worktrees/agent-a80857ed9be261179` or extend the eslint ignore glob to `**/.next/**`).

## Verification (real output)

**npm run lint** — exit 1, but zero findings in this task's two files; all findings are in `.claude/worktrees/agent-a80857ed9be261179/.next/build/**` (require-imports, no-assign-module-variable, ban-ts-comment — pre-existing stale build output, unrelated to this change).

**npm run typecheck** — exit 0:
```
> elearning-ariba@0.1.0 typecheck
> next typegen && tsc --noEmit

Generating route types...
✓ Types generated successfully
```

**npm run content:check** — exit 1 (expected gate). Key set: 73 CADR-03 + 11 CADR-01 = 84 blocked keys, matching the count carried forward from the prior run (260904-h5r added `hero.preuve.formateur`/`groupe`, bringing CADR-03 from 71→73). `enSavoirPlus` does not appear anywhere in the output (confirmed via grep, no match) — not mis-registered as content.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
"Pour qui" grid and footer changes are complete and self-contained. No browser available this run — visual confirmation of the 3+3 row layout and the chevron rotation is left for the CTO's review, consistent with prior runs in this phase.

---
*Phase: quick*
*Completed: 2026-09-04*
