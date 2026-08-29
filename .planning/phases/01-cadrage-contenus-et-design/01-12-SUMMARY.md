---
phase: 01-cadrage-contenus-et-design
plan: 12
subsystem: journey-routes
tags: [nextjs, i18n, agenda, reservation, paiement]

# Dependency graph
requires:
  - phase: 01-cadrage-contenus-et-design
    provides: journey copy bundles (agenda.json, reservation.json, paiement.json) from plan 01-04
  - phase: 01-cadrage-contenus-et-design
    provides: Card, Badge, Button, Message, EmptyState families from plans 01-05/01-06
provides:
  - src/lib/i18n/fr.ts currencyFormatter/formatCurrency and timeFormatter/formatTime
  - /agenda, /reservation, /paiement routes — the last three of the eleven signed screens
affects: [04-agenda, 07-paiement]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "formatCurrency/formatTime follow the existing singleton-plus-wrapper shape in fr.ts"
    - "maquette-only data (calendar grid, chosen slot, chosen formule) is a module-scope const explicitly commented as replaced by a later lot"

key-files:
  created:
    - src/app/agenda/page.tsx
    - src/app/reservation/page.tsx
    - src/app/paiement/page.tsx
  modified:
    - src/lib/i18n/fr.ts

key-decisions:
  - "src/components/sections/section.tsx (Section/SectionHeader) does not exist yet in this worktree — it is created by sibling wave-5 plan 01-09, running in a parallel worktree not merged here. Used plain <h1>/<h2> semantic markup instead, keeping the heading outline (h1 only, or h1 then h2) valid without importing a non-existent module."
  - "Copied .env.local from the parent checkout (local Supabase CLI demo placeholders, not secrets) — required for npm run typecheck; worktrees don't inherit gitignored files."

requirements-completed: [CADR-06]

# Metrics
duration: 45min
completed: 2026-08-29
---

# Phase 01 Plan 12: Agenda, Réservation, Paiement Routes Summary

**The last three of the eleven signed screens — agenda, réservation, paiement — now exist as real Next.js routes, provider-neutral and with their empty/error states visible, closing CADR-06.**

## Performance

- **Duration:** 45 min
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- `src/lib/i18n/fr.ts`: added `currencyFormatter`/`formatCurrency` (EUR) and `timeFormatter`/`formatTime` (pinned `TIME_ZONE`), following the file's existing singleton-plus-wrapper pattern; every pre-existing export unchanged
- `/agenda`: appointment-type cards, a static maquette calendar grid with the four-state legend, and the `aucunCreneau` empty state as `EmptyState tone="waiting"`
- `/reservation`: three-step stepper, recap card (type/date/heure/durée/prix all through the formatters), and the slot-taken error demonstration as `Message variant="error"`
- `/paiement`: the four `formules` with prices through `formatCurrency`, the recapitulatif, consentement, the provider-neutral `payer` CTA, the `securite` line, and `echecHandoff` as `EmptyState tone="error"` with a retry action
- `npm run typecheck` exits 0 — all eleven signed screens build

## Task Commits
1. **Task 1: Close the two formatter gaps** - `cd3725a` (feat)
2. **Task 2: /agenda and /reservation** - `7354073` (feat)
3. **Task 3: /paiement, provider-neutral, and the closing pass** - `91d65dd` (feat)

## Files Created/Modified
- `src/lib/i18n/fr.ts` - added `currencyFormatter`, `formatCurrency`, `timeFormatter`, `formatTime`
- `src/app/agenda/page.tsx` - appointment types, calendar maquette, no-slot empty state
- `src/app/reservation/page.tsx` - stepper, recap, slot-taken error demonstration
- `src/app/paiement/page.tsx` - formules, recap, payer CTA, failed-handoff empty state

## Decisions Made
- `@/components/sections/section` (`Section`/`SectionHeader`) is not available in this worktree — it's created by sibling wave-5 plan 01-09 in a parallel, unmerged worktree. Rather than import a module that doesn't exist here, all three routes use plain `<h1>`/`<h2>` tags directly, keeping exactly one `<h1>` per route and no skipped heading level. No `<h3>` is used anywhere in this plan's files (card "titles" are styled `<p>` elements) specifically to avoid a heading-level skip in the absence of a preceding `<h2>` section header.
- Copied `.env.local` (local Supabase CLI demo placeholders, not secrets) from the parent checkout — required for `next typegen`/`npm run typecheck`; git-ignored, not committed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing `.env.local` in worktree blocked `npm run typecheck`**
- **Found during:** Task 2/3 verification
- **Issue:** `next typegen` fails validating `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY` — worktrees don't carry git-ignored files
- **Fix:** Copied `.env.local` verbatim from the parent checkout (public local Supabase CLI demo JWTs, not project secrets)
- **Files modified:** `.env.local` (git-ignored, not committed)
- **Verification:** `npm run typecheck` exits 0

### Reported gaps (per plan's own "stop and report" clause, not fixed)

The plan's hard prohibition states: "No French string literal in JSX. If a key is missing, stop and report — plan 01-04 owns the copy." Three copy keys that the plan's action text assumed exist are missing from the journey bundles:

1. **No minute/duration unit label** in `agenda.json` or `common.json` — the plan asks for "the duration as `formatNumber(dureeMinutes)` plus the unit label from the bundle." No such label key exists anywhere. Rendered `formatNumber(dureeMinutes)` alone (e.g. "30") without a unit suffix, rather than inventing text. `src/app/agenda/page.tsx`, `src/app/reservation/page.tsx`.
2. **No "free/gratuit" badge label** in `agenda.json` for the discovery-call type — the plan asks for a `Badge variant="success"` "from the bundle" instead of a zero price. No such label key exists. Rendered `formatCurrency(0)` inside the badge instead (still never hand-written, but shows "0,00 €" rather than a "Gratuit" chip). `src/app/agenda/page.tsx`.
3. **No "recommended formula" badge label** in `paiement.json` — the plan asks to mark one formula as recommended "with a Badge label from the bundle." No such label key exists. No formula is marked as recommended; all four render identically. `src/app/paiement/page.tsx`.

These are copy gaps in plan 01-04's output, not blocking bugs — flagging for a future 01-04 follow-up rather than fixing here, per the plan's explicit instruction.

---
**Total deviations:** 1 auto-fixed (blocking), 3 reported gaps (missing copy, not fixed per plan instruction)
**Impact on plan:** All three routes render, build and pass every automated verification gate; the three gaps above are cosmetic-only (missing unit/badge labels), not missing functionality.

## Known Stubs

- The agenda calendar grid (`joursMaquette` in `src/app/agenda/page.tsx`) and the chosen-slot/chosen-formule constants (`creneauMaquette` in `reservation/page.tsx`, `formuleChoisieMaquette` in `paiement/page.tsx`) are hardcoded maquette-only data, explicitly commented as replaced by Lot 4 (availability) and Lot 7 (real order/payment). This is intentional per the plan's own instruction, not an oversight.

## Threat Flags

None — all new surface (three public unguarded routes) is already registered in the plan's own threat model (T-01-NOINDEX, accepted).

## Issues Encountered

None beyond the `.env.local` and missing-copy-key items documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `CADR-06` is structurally complete: all eleven signed screens exist as real routes
- `npm run typecheck` exits 0; `git status --porcelain supabase src/types` is empty
- `grep -rniE "stripe|paypal|mollie|adyen|paddle|braintree|payplug" src/` returns nothing
- `grep -rn "€" src/app/` returns nothing outside `formatCurrency` call sites
- Follow-up: plan 01-04 (or a later copy pass) should add a duration unit label, a "gratuit" badge label, and a "recommandée" formula badge label to close the three reported gaps above

---
*Phase: 01-cadrage-contenus-et-design*
*Completed: 2026-08-29*

## Self-Check: PASSED

- FOUND: src/lib/i18n/fr.ts
- FOUND: src/app/agenda/page.tsx
- FOUND: src/app/reservation/page.tsx
- FOUND: src/app/paiement/page.tsx
- FOUND: cd3725a, 7354073, 91d65dd (all present in git log)
