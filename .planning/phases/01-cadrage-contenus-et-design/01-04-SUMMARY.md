---
phase: 01-cadrage-contenus-et-design
plan: 04
subsystem: content
tags: [i18n, locale-bundle, copy, json, cadrage]

requires:
  - phase: 01-cadrage-contenus-et-design (01-01)
    provides: framing decisions (D-01…D-42) the copy device and mock-content guardrail rest on
provides:
  - Six journey locale bundles (inscription, connexion, agenda, reservation, paiement, espace)
  - The four D-23 surface states for the journey: agenda.aucunCreneau, espace.aucuneReservation, *.erreurs.rejetServeur, paiement.echecHandoff
  - Provider-neutral paiement copy (no provider named), four numeric sale formulas
  - Sidecar mock registry src/locales/fr/_mocks.journey.json for client-dependent journey values
affects: [01-08 (mock-content guard script), Wave 4 maquette plans consuming these bundles, Phase 3 (comptes/espace), Phase 4 (agenda), Phase 7 (paiement)]

tech-stack:
  added: []
  patterns:
    - "Direct default JSON import per screen namespace, no barrel/index (D-28)"
    - "Prices and durations stored as numbers, never formatted strings (D-30)"
    - "Client-dependent values registered once in a _mocks.<namespace>.json sidecar, never marked inline (D-07)"

key-files:
  created:
    - src/locales/fr/inscription.json
    - src/locales/fr/connexion.json
    - src/locales/fr/espace.json
    - src/locales/fr/agenda.json
    - src/locales/fr/reservation.json
    - src/locales/fr/paiement.json
    - src/locales/fr/_mocks.journey.json
  modified: []

key-decisions:
  - "_mocks.public.json (plan 01-03's deliverable) was not present in this worktree at execution time, since 01-03 runs in a parallel wave-2 worktree; _mocks.journey.json was authored to the field shape described in the plan text ({file,key,blocks,awaiting}) rather than verified against the sibling file directly. Reconcile shape identity when both branches merge."
  - "Registered only the four paiement.formules entries and the two agenda.typesRendezVous prices in the mock sidecar (CADR-01); no commercial-promise wording needed registration since all six journey intros are structural/neutral, not commercial claims"

requirements-completed: [CADR-03]

duration: 15min
completed: 2026-08-29
---

# Phase 1 Plan 4: Journey Copy (Booking, Account, Payment) Summary

**Six French locale bundles for the account, booking and payment journey screens, with all four D-23 empty/error states and a provider-neutral, all-numeric-price paiement screen**

## Performance

- **Duration:** ~15 min
- **Tasks:** 3 completed
- **Files modified:** 7 created

## Accomplishments
- Account journey (inscription, connexion, espace apprenant) fully copied, including honest empty states for all six learner-space surfaces and the `{prenom}` welcome token
- Booking and payment journey (agenda, reservation, paiement) fully copied — agenda holds two numeric appointment types (free discovery call + priced individual session), paiement holds four numeric sale formulas and stays provider-neutral throughout
- Client-dependent values (sale formulas, appointment prices) registered in a deletable sidecar `_mocks.journey.json`, invisible in the rendered bundles

## Task Commits

1. **Task 1: Account copy — inscription, connexion, espace apprenant** - `da92bad` (feat)
2. **Task 2: Booking and payment copy — agenda, reservation, paiement** - `6605310` (feat)
3. **Task 3: Register every client-dependent key of the journey screens** - `fbab0ef` (docs)

## Files Created/Modified
- `src/locales/fr/inscription.json` - account-creation labels, four profile options, server-rejection error
- `src/locales/fr/connexion.json` - sign-in labels, Google button label, throttling/rejection errors
- `src/locales/fr/espace.json` - six learner-space surfaces each with an honest empty state, plus the top-level `aucuneReservation` state
- `src/locales/fr/agenda.json` - calendar legend, two appointment types (numeric duration/price), `aucunCreneau` empty state
- `src/locales/fr/reservation.json` - three-step recap labels (values formatted at render, not stored), `creneauIndisponible` error
- `src/locales/fr/paiement.json` - provider-neutral recap/consent/security copy, four numeric sale formulas, `echecHandoff` state
- `src/locales/fr/_mocks.journey.json` - sidecar registry of the mocked sale formulas and appointment prices, blocked on `CADR-01`

## Decisions Made
- `_mocks.public.json` (from parallel plan 01-03) was absent in this worktree; `_mocks.journey.json` was written to match the shape described in the plan text directly rather than a live sibling file. See key-decisions above.
- No commercial-promise wording found in any journey `intro` that needed a `CADR-03` mock entry — all intros are structural/process copy, not client-supplied claims.

## Deviations from Plan

### Auto-fixed Issues

None — no bugs, missing-critical-functionality, or blocking issues encountered.

### Adapted verification (not a Rule 1–4 deviation)

**1. Task 3's automated verification could not cross-check against `src/locales/fr/_mocks.public.json`**
- **Found during:** Task 3
- **Issue:** The plan's verify script does `require('./src/locales/fr/_mocks.public.json')` to assert `_mocks.journey.json` matches its field shape. That file is plan 01-03's output, and 01-03 executes in a separate parallel wave-2 worktree not yet merged into this one.
- **Fix:** Ran an adapted version of the same verification omitting only the cross-file shape comparison; all other assertions (non-empty `mocks`, exact `{file,key,blocks,awaiting}` field set, valid `blocks` values, valid `awaiting` value, every key resolvable, all 4 formulas + both agenda prices registered, no visible marker leaked) passed unmodified.
- **Files modified:** none beyond the planned `_mocks.journey.json`
- **Verification:** Adapted node script printed `ok — 6 mocked journey keys registered`
- **Committed in:** `fbab0ef`

---

**Total deviations:** 0 auto-fixed; 1 verification adaptation (parallel-wave artifact not yet available)
**Impact on plan:** No scope or content change. Shape identity with `_mocks.public.json` should be spot-checked once both wave-2 worktrees merge.

## Issues Encountered
None beyond the adapted verification above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All six journey screens have every string Wave 4's maquette plans need; those plans can consume without inventing copy
- `_mocks.journey.json` is ready for plan 01-08's `content:check` guard once it exists
- Reconcile `_mocks.journey.json`'s field shape against `_mocks.public.json` once plan 01-03 lands in the same branch

---
*Phase: 01-cadrage-contenus-et-design*
*Completed: 2026-08-29*

## Self-Check: PASSED

All 7 created files confirmed present on disk; all 4 commits (`da92bad`, `6605310`, `fbab0ef`, `04a78cd`) confirmed in `git log`.
