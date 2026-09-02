---
phase: 04-agenda-et-prise-de-rendez-vous
plan: 02
subsystem: database
tags: [postgres, supabase, seed-script, sql-tests, easter-computus, idempotence]

# Dependency graph
requires:
  - phase: 04-agenda-et-prise-de-rendez-vous (plan 01)
    provides: "app.type_rendez_vous, app.disponibilite_hebdomadaire, app.exception_agenda, app.reservation, app.maintien_creneau tables; app.creneaux_libres/app.reserver_creneau/app.maintenir_creneau/app.paques RPCs"
provides:
  - "scripts/seed-agenda.mjs -- idempotent bootstrap: admin promotion, appointment types, typical week, holidays (D-21/D-22)"
  - "src/locales/fr/admin.json -- holiday labels + admin copy skeleton, French typography checked"
  - "supabase/tests/lot4_creneaux_libres.sql -- AGD-02/D-13/D-23/D-04 free-slot expansion proof"
  - "supabase/tests/lot4_feries.sql -- AGD-07/D-17 Easter/holiday calendar proof"
  - "app.creneaux_libres D-13 horizon bounded to the instant, not just the day (bugfix)"
affects: [04-03, 04-04, 04-05, 04-06, 04-07, 04-08, 04-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Read-then-insert-missing idempotent seed writes (never upsert) so an administrator-configured value survives a re-seed"
    - "SQL negative-test isolation: delete-then-reseed the fixture tables inside the same begin/rollback transaction so exact-count assertions do not depend on ambient seeded state"
    - "Calendar-derived test dates (generate_series + isodow search) instead of hardcoded offsets, so a test's pass/fail never depends on what day it runs"

key-files:
  created:
    - scripts/seed-agenda.mjs
    - src/locales/fr/admin.json
    - supabase/tests/lot4_creneaux_libres.sql
    - supabase/tests/lot4_feries.sql
    - supabase/migrations/20260902090000_lot4_agenda_paques_service_role_grant.sql
    - supabase/migrations/20260902091000_lot4_creneaux_libres_horizon_fix.sql
  modified:
    - package.json
    - .env.example
    - supabase/tests/lot4_verrou_creneau.sql
    - supabase/tests/lot4_rls_reservation.sql
    - supabase/tests/lot4_maintien_creneau.sql

key-decisions:
  - "Fixed a missing service_role EXECUTE grant on app.paques via a new additive migration rather than editing the already-applied grants migration"
  - "Fixed app.creneaux_libres's D-13 horizon (day-granular only, no instant-level upper bound) via a new create-or-replace migration, caught by this plan's own SQL proof"
  - "Converted plain type_rendez_vous inserts in the three 04-01 SQL test files to on-conflict-do-update, since agenda:seed now permanently seeds those ids outside any transaction"
  - "lot4_creneaux_libres.sql clears app.disponibilite_hebdomadaire/app.exception_agenda inside its own transaction before seeding its fixture, to keep exact-count assertions independent of ambient seeded state"
  - "lot4_feries.sql step 6 inserts its own ferie-shaped row rather than reading one from the ambient seed, since the French calendar has long stretches with no holiday inside the 8-week booking horizon"

requirements-completed: [AGD-01, AGD-02, AGD-07]

# Metrics
duration: 30min
completed: 2026-09-02
---

# Phase 04 Plan 02: Agenda bootstrap seed and free-slot/holiday SQL proofs Summary

**Idempotent `npm run agenda:seed` (admin promotion, two appointment types, a Mon-Fri typical week, 22 French holidays with Easter computed) plus two SQL proof files for the read-time free-slot expansion and the holiday calendar, and two real bugs the proofs caught in already-applied Lot 4 SQL.**

## Performance

- **Duration:** ~30 min
- **Tasks:** 2
- **Files modified:** 11 (2 new migrations, 2 new SQL tests, 3 modified SQL tests, seed script, locale file, package.json, .env.example)

## Accomplishments

- `scripts/seed-agenda.mjs`: promotes the `FORMATEUR_EMAIL` account to `administrator`, seeds `app.type_rendez_vous` from `src/locales/fr/agenda.json` (bootstrap-only, never touched again), opens a Monday-Friday 09:00-12:00/14:00-17:00 week, and pre-fills the current and next year's eleven French holidays via `app.paques()`. Every write is read-then-insert-missing; verified non-destructive by mutating a price and a holiday's `ouvert` flag and re-running.
- `src/locales/fr/admin.json`: the eleven holiday labels plus the admin copy skeleton (`titre`, `intro`, `nav`), checked programmatically against the French typography rules (no straight apostrophe, no bare space before `:`, balanced `« »`).
- `supabase/tests/lot4_creneaux_libres.sql`: 10 numbered assertions proving the 75-minute step (60min type + 15min buffer), the 24-hour notice and 8-week horizon, taken/whole-day/partial-day closures, Saturday re-opening, cancellation restoring a slot, and a D-27 retention hiding exactly one instant.
- `supabase/tests/lot4_feries.sql`: 6 numbered assertions proving `app.paques()` against the five known 2024-2028 dates, the three 2026 derived feasts, Easter Sunday itself carrying no `ferie` row, 11+11 seeded rows, the `ferie` row shape, and closed-by-default/re-openable behaviour.
- Caught and fixed two real bugs in already-applied Lot 4 SQL (see Deviations): a missing `service_role` grant on `app.paques`, and `app.creneaux_libres`'s D-13 horizon only bounding by calendar day rather than to the instant.
- All six Lot 4-relevant SQL test files (`lot3_rls_isolation`, `lot4_verrou_creneau`, `lot4_rls_reservation`, `lot4_maintien_creneau`, `lot4_creneaux_libres`, `lot4_feries`) exit 0 in one run against the now-seeded local stack.
- `npm run lint && npm run typecheck && npm run build` all exit 0; the 30-route table is unchanged (`/agenda` still `○` static); `git diff src/locales/fr/agenda.json package-lock.json` is empty; `package.json` gains only the `agenda:seed` line.

## Task Commits

1. **Task 1: Admin copy file and the idempotent agenda seed script** — `3e51046` (feat)
2. **Task 2: SQL proofs for free-slot expansion and the holiday calendar** — `df86726` (test)

## Files Created/Modified

- `scripts/seed-agenda.mjs` — idempotent bootstrap: admin promotion, appointment types, typical week, holidays
- `src/locales/fr/admin.json` — holiday labels + admin copy skeleton
- `package.json` — `agenda:seed` script
- `.env.example` — `FORMATEUR_EMAIL` bootstrap variable, documented as not part of `src/lib/env/server.ts`
- `supabase/migrations/20260902090000_lot4_agenda_paques_service_role_grant.sql` — bugfix: grants `service_role` EXECUTE on `app.paques`
- `supabase/migrations/20260902091000_lot4_creneaux_libres_horizon_fix.sql` — bugfix: bounds the D-13 8-week horizon to the instant, not only the calendar day
- `supabase/tests/lot4_creneaux_libres.sql` — AGD-02/D-13/D-23/D-04 free-slot expansion proof (10 assertions)
- `supabase/tests/lot4_feries.sql` — AGD-07/D-17 holiday/Easter proof (6 assertions)
- `supabase/tests/lot4_verrou_creneau.sql`, `lot4_rls_reservation.sql`, `lot4_maintien_creneau.sql` — fixture inserts switched to on-conflict-do-update to coexist with the now-permanently-seeded environment

## Decisions Made

- New additive migrations for both bugfixes rather than editing the already-applied 04-01 migrations (scope fence: "All migrations are additive").
- SQL proof isolation: `lot4_creneaux_libres.sql` clears and re-seeds `app.disponibilite_hebdomadaire`/`app.exception_agenda` inside its own transaction, since agenda:seed's permanent rows would otherwise duplicate ranges and corrupt exact-count assertions.
- `lot4_feries.sql` step 6 targets a self-inserted `ferie`-shaped row instead of an ambient seeded one, since the real French calendar has no holiday inside the 8-week horizon for long stretches of the year (e.g. mid-July to All Saints) — a date-dependent flake the plan's literal wording did not anticipate.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Missing `service_role` EXECUTE grant on `app.paques`**
- **Found during:** Task 1, first `npm run agenda:seed` run
- **Issue:** `20260901181000_lot4_agenda_grants.sql` revokes `EXECUTE` on `app.paques(int)` from `PUBLIC` (line 45) but never re-grants it to any role. `scripts/seed-agenda.mjs` calls it via `.rpc("paques", …)` under `service_role`, which bypasses RLS but not function `EXECUTE` grants — the seed failed with "permission denied for function paques".
- **Fix:** New additive migration `20260902090000_lot4_agenda_paques_service_role_grant.sql` granting `EXECUTE` on `app.paques(int)` to `service_role`.
- **Files modified:** `supabase/migrations/20260902090000_lot4_agenda_paques_service_role_grant.sql`
- **Verification:** `has_function_privilege('service_role', 'app.paques(int)', 'execute')` now `t`; `npm run agenda:seed` succeeds and seeds 22 holidays.
- **Committed in:** `3e51046` (Task 1 commit)

**2. [Rule 1 - Bug] `app.creneaux_libres`'s D-13 horizon bounded only by calendar day**
- **Found during:** Task 2, first run of `lot4_creneaux_libres.sql` step 4
- **Issue:** The day-generation cutoff `least(p_au, ((now() + interval '8 weeks') at time zone 'Europe/Paris')::date)` bounds by *date*, but the function had no matching filter on the instant itself — unlike the symmetric 24-hour notice, which does filter `pas.debut >= now() + interval '24 hours'` precisely. A carrier day whose slots run into the afternoon could return an instant up to ~24h past the exact `now() + interval '8 weeks'` mark, violating this plan's own must-have truth ("nothing beyond 8 weeks").
- **Fix:** New additive migration `20260902091000_lot4_creneaux_libres_horizon_fix.sql` using `create or replace function` to add `and pas.debut <= now() + interval '8 weeks'` to the final `where` clause, symmetric with the notice filter. Function grants persist across `create or replace` for an unchanged signature — verified.
- **Files modified:** `supabase/migrations/20260902091000_lot4_creneaux_libres_horizon_fix.sql`
- **Verification:** `lot4_creneaux_libres.sql` step 4 passes; `has_function_privilege` checks for `anon`/`authenticated` unchanged (`t`/`t`); all six Lot 4-relevant SQL test files still exit 0.
- **Committed in:** `df86726` (Task 2 commit)

**3. [Rule 1 - Bug] Three 04-01 SQL test files collided with the now-permanent seed**
- **Found during:** Task 2, running `lot4_verrou_creneau.sql` after `npm run agenda:seed` had run
- **Issue:** `lot4_verrou_creneau.sql`, `lot4_rls_reservation.sql` and `lot4_maintien_creneau.sql` each `insert` fresh `decouverte`/`individuelle` rows into `app.type_rendez_vous`. Plan 04-02's `agenda:seed` now permanently seeds those same ids outside any transaction (as designed — D-21/D-22), so the plain inserts collided with `23505 duplicate key`. This is a direct, in-scope consequence of this plan's own Task 1 output on the shared local stack, and blocks this plan's own `<verification>` requirement that "the three plan-04-01 SQL files still exit 0".
- **Fix:** Converted each plain `insert` to `insert … on conflict (id) do update set …`, forcing the test's own `duree_minutes`/`tampon_minutes`/`prix_centimes` for the transaction's duration; `rollback;` restores the seeded row afterward.
- **Files modified:** `supabase/tests/lot4_verrou_creneau.sql`, `supabase/tests/lot4_rls_reservation.sql`, `supabase/tests/lot4_maintien_creneau.sql`
- **Verification:** All three files exit 0 against the seeded local stack, alongside the two new files and `lot3_rls_isolation.sql`.
- **Committed in:** `df86726` (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (all Rule 1 — bugs this plan's own seed script and SQL proofs surfaced in already-applied Lot 4 code).
**Impact on plan:** All three fixes are corrections to code plan 04-01 produced, or to test fixtures that assumed a state (an unseeded environment) this plan's own deliverable ends. None are scope creep; the horizon fix in particular closes a real D-13 spec gap that would have shipped silently without this plan's SQL proof exercising it.

## Issues Encountered

None beyond the three deviations above.

## User Setup Required

None for local development. `FORMATEUR_EMAIL` and the trainer's real auth account are hosted-environment CIO setup (already tracked in `04-CONTEXT.md` § Out of this seat's reach — "Running the administrator seed script on each environment (D-21)"). For local testing, one `auth.users` row (`formateur@example.test`) was created directly against the local stack so `npm run agenda:seed` could be exercised end-to-end; this is local-only test data, never committed, and does not affect the hosted CIO handoff.

## Next Phase Readiness

- A fresh local environment now bootstraps to a usable agenda with `npm run content:seed && npm run agenda:seed`: two appointment types, a five-day working week, 22 holidays, one administrator.
- `app.creneaux_libres` is now correct at all four D-13/D-23/D-04 boundaries this plan set out to prove, closing a gap that would otherwise have surfaced later in plan 04-03's booking flow or 04-04's public agenda surface.
- No blockers. The shared local Supabase stack was not reset during this plan; both new migrations were applied directly via `docker exec … psql` and will apply cleanly on the next `supabase db reset --local` since they are ordered after `20260901181000`.

---
*Phase: 04-agenda-et-prise-de-rendez-vous*
*Completed: 2026-09-02*

## Self-Check: PASSED

All six created files confirmed present on disk; both task commit hashes (`3e51046`, `df86726`) confirmed present in `git log --oneline --all`.
