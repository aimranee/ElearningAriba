---
phase: 04-agenda-et-prise-de-rendez-vous
plan: 01
subsystem: database
tags: [postgres, supabase, exclusion-constraint, tstzrange, rls, security-definer, dst]

# Dependency graph
requires:
  - phase: 03-comptes-connexion-et-espace-apprenant
    provides: app.profil (role column), app.est_administrateur precedent shape, RLS + withheld-grant pattern
provides:
  - "app.type_rendez_vous, app.disponibilite_hebdomadaire, app.exception_agenda, app.reservation, app.maintien_creneau"
  - "AGD-05 lock: exclude using gist (plage with &&) where (statut <> 'annulee')"
  - "app.creneaux_libres/app.reserver_creneau/app.maintenir_creneau/app.liberer_creneau/app.purger_maintiens_expires/app.est_administrateur/app.paques security definer RPCs"
  - "D-27 15-minute slot retention with release-on-commit and no-authority-over-booking guarantee"
  - "regenerated src/types/database.types.ts"
affects: [04-02, 04-03, 04-04, 04-05, 04-06, 04-07, 04-08, 04-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Range-only GiST exclusion constraint for double-booking refusal, no btree_gist"
    - "Wall-clock (date + time) at time zone 'Europe/Paris' for DST-correct instants, computed entirely in SQL"
    - "Typed-outcome security definer RPC as the only write path (never a raw 23P01/HTTP 400)"
    - "Advisory retention table (RLS on, zero policies, zero table grants) reachable only through its own definer RPCs"
    - "Revoke EXECUTE from PUBLIC on every new function before granting the intended role set"

key-files:
  created:
    - supabase/migrations/20260901180000_lot4_agenda.sql
    - supabase/migrations/20260901181000_lot4_agenda_grants.sql
    - supabase/tests/lot4_verrou_creneau.sql
    - supabase/tests/lot4_rls_reservation.sql
    - supabase/tests/lot4_maintien_creneau.sql
  modified:
    - src/types/database.types.ts

key-decisions:
  - "Seeded both type_rendez_vous rows plus a full 1-7 isodow weekly rule in every test file's control section, rather than a single weekday, so no test is fragile to what day of the week it happens to run on"
  - "Used 'individuelle' as the working type for lock/RLS/DST/erasure test steps and reserved 'decouverte' for the D-12 proof alone, avoiding cross-interference between the two properties under test"

requirements-completed: [AGD-01, AGD-03, AGD-05, AGD-09]

# Metrics
duration: 70min
completed: 2026-09-02
---

# Phase 04 Plan 01: Agenda data model and reservation lock Summary

**Five-table Postgres temporal model (types, weekly rules, exceptions, reservations, D-27 slot retention) with a range-only GiST exclusion constraint making double-booking impossible, plus seven security-definer RPCs and six RLS policies — proven by three SQL negative test files.**

## Performance

- **Duration:** ~70 min
- **Tasks:** 3
- **Files modified:** 6 (2 migrations, 3 SQL test files, 1 generated types file)

## Accomplishments

- Applied `20260901180000_lot4_agenda.sql`: five tables, two exclusion constraints (`reservation_pas_de_chevauchement`, `maintien_pas_de_chevauchement`), the D-12 partial unique index, seven `security definer` functions, six RLS policies. `app.maintien_creneau` deliberately carries RLS-on-zero-policies.
- Applied `20260901181000_lot4_agenda_grants.sql`: withholds `insert`/`update` on `app.reservation` and `insert`/`delete` on `app.type_rendez_vous` from `authenticated`; grants no table privilege at all on `app.maintien_creneau`; revokes the Postgres default `PUBLIC` execute grant on every new function before granting the intended role set.
- Regenerated `src/types/database.types.ts` against the applied schema; `npx supabase db reset --local` applies all seven migrations cleanly from scratch.
- Wrote and passed three SQL negative test files (29 numbered assertions total) proving: the exclusion constraint's SQLSTATE 23P01 refusal (including against an RLS-invisible row), half-open bounds, the AGD-09 cancel-frees-slot / `en_attente_paiement`-still-blocks pair, the D-12 one-discovery-call rule, DST correctness across both 2026 switches with a constant 8-hour span, D-08 erasure behaviour, full reservation/type-configuration RLS isolation, and the entire D-27 retention lifecycle (mint, replace, contention, lapse-before-sweep, purge, forged-token refusal, release-on-commit).
- `lot3_rls_isolation.sql` still passes with all four `DENIED` notices — the Lot 4 migrations are additive.
- `npm run lint && npm run typecheck && npm run build` all exit 0; the 30-route table is unchanged in shape (static routes stay static); `git diff package.json package-lock.json` is empty.

## Task Commits

1. **Task 1: Write the Lot 4 availability and reservation migration** — `c0b6dd8` (feat)
2. **Task 2: Grants migration, apply to the local stack, regenerate types** — `c4a0767` (feat)
3. **Task 3: SQL negative tests for the lock, the Lot 7 seam, reservation isolation and the retention** — `9db5395` (test, includes two migration bugfixes the tests caught)

## Files Created/Modified

- `supabase/migrations/20260901180000_lot4_agenda.sql` — five tables, two exclusion constraints, seven definer functions, six RLS policies
- `supabase/migrations/20260901181000_lot4_agenda_grants.sql` — table/function grants, withheld privileges, PUBLIC-execute revocations
- `supabase/tests/lot4_verrou_creneau.sql` — AGD-05/AGD-09/AGD-01/D-12 negative proof (9 notices)
- `supabase/tests/lot4_rls_reservation.sql` — learner isolation, admin access, AGD-03 configure-only isolation, anon boundary (10 notices)
- `supabase/tests/lot4_maintien_creneau.sql` — D-27 retention lifecycle proof (10 notices)
- `src/types/database.types.ts` — regenerated, carries the five new tables and RPC signatures

## Decisions Made

- Seeded the full 1–7 isodow weekly rule (not a single weekday) in every test file's control section, so no test's pass/fail depends on what day of the week the suite happens to run.
- Reserved `'decouverte'` exclusively for the D-12 (one-discovery-call) proof and used `'individuelle'` for every other lock/RLS/DST/erasure step, so the partial unique index never interferes with unrelated overlap assertions.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `app.maintenir_creneau`'s RETURNS TABLE column collided with the table's own column name**
- **Found during:** Task 3, first run of `lot4_maintien_creneau.sql` step 3
- **Issue:** `app.maintenir_creneau` returns `table (resultat text, jeton uuid, expire_le timestamptz)`; inside the function body, `select 1 from app.maintien_creneau where jeton = p_jeton` is ambiguous between the OUT variable `jeton` and `app.maintien_creneau.jeton` — Postgres raised `42702 column reference "jeton" is ambiguous`, which the plan's own outcome contract (`'ok' | 'creneau_indisponible' | 'type_inconnu' | 'jeton_inconnu'`) has no slot for; this was a live bug in the shipped function, not a test artefact.
- **Fix:** Table-qualified both references (`m.jeton`/`app.maintien_creneau.jeton`) and added a comment explaining why an unqualified reference is dangerous here.
- **Files modified:** `supabase/migrations/20260901180000_lot4_agenda.sql`
- **Verification:** `lot4_maintien_creneau.sql` steps 3, 6, 7, 9 all exercise the replace/contention paths that hit this code; all pass.
- **Committed in:** `9db5395` (folded into the Task 3 commit, since it was caught by Task 3's own tests)

**2. [Rule 1 - Bug] `reserver_creneau` and `purger_maintiens_expires` stayed executable by roles they were meant to refuse**
- **Found during:** Task 2 verification (`has_function_privilege` checks)
- **Issue:** Postgres grants `EXECUTE` to `PUBLIC` on every new function by default. The grants migration only ever revoked from named roles (`anon`); it never touched the `PUBLIC` grant, so `anon` could still call `app.reserver_creneau` and both `anon`/`authenticated` could still call `app.purger_maintiens_expires()` through inherited `PUBLIC` privilege — silently defeating the "authenticated-only" / "service_role-only" intent stated in the plan and in `04-RESEARCH.md`'s threat register (T-04-07c).
- **Fix:** Added `revoke execute on function ... from public;` for every one of the seven new functions before the intended grants, matching the withheld-privilege discipline Lot 3 already applied to table columns.
- **Files modified:** `supabase/migrations/20260901181000_lot4_agenda_grants.sql`
- **Verification:** `has_function_privilege('anon', 'app.reserver_creneau(...)', 'execute')` now `f`; `has_function_privilege('anon'/'authenticated', 'app.purger_maintiens_expires()', 'execute')` now `f`/`f`, `service_role` `t`.
- **Committed in:** `9db5395`

**3. [Rule 1 - Bug] RLS policies referencing `app.est_administrateur()` could not evaluate for `authenticated`**
- **Found during:** Task 3, first run of `lot4_rls_reservation.sql`
- **Issue:** `reservation_admin_all`, `dispo_admin_all`, `exception_admin_all` and `type_admin_update` all call `app.est_administrateur()` in their `USING`/`WITH CHECK` clauses. After fix #2 revoked the `PUBLIC` execute grant, `authenticated` had no explicit grant on that helper function either, so any query touching those policies failed with `permission denied for function est_administrateur` — a self-inflicted regression from fix #2, caught immediately by the same test run.
- **Fix:** Added `grant execute on function app.est_administrateur() to authenticated;` alongside the other function grants.
- **Files modified:** `supabase/migrations/20260901181000_lot4_agenda_grants.sql`
- **Verification:** `lot4_rls_reservation.sql` steps 3, 5b, 6a, 6b (all of which exercise `est_administrateur()`-gated policies) pass.
- **Committed in:** `9db5395`

**4. [Rule 1 - Bug] Test-file timestamp expressions using `AT TIME ZONE` on only the `time` literal, not the full `date + time` sum**
- **Found during:** Task 3, writing `lot4_verrou_creneau.sql` and `lot4_maintien_creneau.sql`
- **Issue:** `(current_date + 9) + time '09:00' at time zone 'Europe/Paris'` parses as `(current_date + 9) + (time '09:00' at time zone 'Europe/Paris')` — `AT TIME ZONE` binds to the `time` literal alone (producing a `timetz`), not to the date-plus-time sum, which silently produces the wrong `timestamptz` (off by the local UTC offset). `04-RESEARCH.md` Pattern 2's own example is correctly parenthesised (`(jour + heure_debut) at time zone ...`); this was a test-authoring mistake, not a migration defect, but it made every early run's day-math wrong.
- **Fix:** Wrapped the full sum in parentheses before applying `AT TIME ZONE` everywhere in the affected test files, matching Pattern 2's proven form exactly.
- **Files modified:** `supabase/tests/lot4_verrou_creneau.sql`, `supabase/tests/lot4_maintien_creneau.sql`, `supabase/tests/lot4_rls_reservation.sql`
- **Verification:** All three files' free-slot / booking assertions pass against `app.creneaux_libres`'s independently-correct SQL.
- **Committed in:** `9db5395`

---

**Total deviations:** 4 auto-fixed (all Rule 1 — bugs the negative tests themselves were written to catch).
**Impact on plan:** All four fixes are corrections to code this same plan produced; none are scope creep. Deviation #2 in particular closes a real privilege-escalation gap (T-04-07c) that would have shipped silently without a test exercising it.

## Issues Encountered

- **Verification-command precision, not a functional gap.** The plan's acceptance criteria state exact NOTICE counts per test file ("eight for `lot4_verrou_creneau.sql`", "seven for `lot4_rls_reservation.sql`", "ten for `lot4_maintien_creneau.sql`"). The implementation emits 9, 10 and 10 notices respectively, because three compound steps in the plan's own numbered list (step 5 in `lot4_verrou_creneau.sql`; steps 5, 6 and 7 in `lot4_rls_reservation.sql`) each cover two distinct assertions (e.g. "insert refused" + "reserver_creneau returns creneau_indisponible"), and each assertion got its own notice for traceability. Every numbered step still has at least one notice, matching the acceptance criteria's stated intent ("at least one NOTICE per numbered assertion"); `lot4_maintien_creneau.sql`'s count matches exactly (10/10) since its steps were not compound.
- **The `pg_proc ... proconfig @> array['search_path=']` verify query** used in Task 1's `<verify>` block undercounts by design: `proconfig` stores `search_path=""` (quoted empty string), and the `@>` containment operator requires an exact array-element match against the literal `search_path=`, so it never matches. Verified the underlying property instead with `exists (select 1 from unnest(proconfig) c where c like 'search_path=%')`, which correctly reports 7 new functions (8 including the pre-existing Lot 3 `creer_profil_pour_nouvel_utilisateur`).
- **The plan's source-level negative-fence grep** (`^ *(alter|drop) `) also matches the `alter table ... enable row level security` statements this migration necessarily contains (five of them, one per table) — the same grep applied to the already-accepted `lot3_comptes.sql` matches its three RLS-enable statements identically. Confirmed as expected noise, not a fence violation: the fence's actual target ("no `alter`/`drop` against a Lot 1-3 object") is satisfied, since every `alter table` here targets a table this migration itself just created.

## User Setup Required

None — no external service configuration required. All work is local-database only; nothing was pushed.

## Next Phase Readiness

- All objects plan 04-02 onward needs (`app.type_rendez_vous`, `app.disponibilite_hebdomadaire`, `app.exception_agenda`, `app.reservation`, `app.maintien_creneau`, and all seven RPCs) exist on the local stack with generated types committed.
- `app.paques()` is ready for plan 04-02's holiday seed; `app.creneaux_libres`'s defaulted fourth parameter and `app.maintenir_creneau`/`app.liberer_creneau` are ready for plan 04-03's booking flow.
- No blockers. The shared local Supabase stack was reset three times during this plan (once per fix cycle); `npm run content:seed` was re-run after each reset per `04-RESEARCH.md` Pitfall 8, so Lot 2 content remains intact for sibling worktrees reading the same stack.

---
*Phase: 04-agenda-et-prise-de-rendez-vous*
*Completed: 2026-09-02*

## Self-Check: PASSED

All six created/modified files confirmed present on disk; all three task commit hashes (`c0b6dd8`, `c4a0767`, `9db5395`) confirmed present in `git log --oneline --all`.
