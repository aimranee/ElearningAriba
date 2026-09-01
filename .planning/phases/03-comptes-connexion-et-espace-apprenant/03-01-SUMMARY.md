---
phase: 03-comptes-connexion-et-espace-apprenant
plan: 01
subsystem: database
tags: [supabase, postgres, rls, migrations, security-definer]

# Dependency graph
requires:
  - phase: 02-site-public
    provides: the `app` schema, the `touch_updated_at()` trigger function, and the additive-migration + reversion-comment + grants-only-followup precedent
provides:
  - "app.profil: the single identity anchor keyed on auth.users(id), auto-populated by an after-insert trigger on auth.users for both email and Google sign-up"
  - "app.acces_support: the CPT-07 support-access grant mechanism, rows written by SQL/migration until Lot 6"
  - "app.demande_suppression: the CPT-09 deletion-request record with a partial unique index preventing stacked pending requests"
  - "RLS + column-scoped grants proving learner isolation and blocking self-escalation to administrator"
  - "a runnable negative isolation proof (supabase/tests/lot3_rls_isolation.sql) that fails when the policy is weakened"
  - regenerated src/types/database.types.ts carrying the three new tables
affects: [03-02, 03-03, 03-04, 03-05, 03-06, 03-07, 03-08, 03-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "security definer trigger function with set search_path = '' and fully-qualified identifiers to create the profile row without trusting client-supplied raw_user_meta_data for role"
    - "column-scoped grant update (...) excluding role/email/utilisateur_id/created_at/updated_at as the actual privilege-escalation control, distinct from and layered under the RLS using/with check predicate"
    - "negative RLS proof: seed as superuser, positive control (exactly one own row), then four DO blocks each asserting a refusal (cross-read count=0, cross-write row_count=0 + insert exception, escalation SQLSTATE 42501, other-tables cross-read count=0), single transaction rolled back"

key-files:
  created:
    - supabase/migrations/20260831160000_lot3_comptes.sql
    - supabase/migrations/20260831161000_lot3_grants.sql
    - supabase/tests/lot3_rls_isolation.sql
  modified:
    - src/types/database.types.ts

key-decisions:
  - "Positive control in the isolation proof asserts A reads exactly one profil row (not >=1), so the mutation check (using(true)) fails fast at the positive-control assertion rather than silently passing assertion 1 with a wrong count — still a valid non-zero-exit detection of a weakened policy"
  - "npm ci run to restore an absent node_modules (lockfile-only, zero dependency changes) and a local-only .env.local created from npx supabase status output so typecheck/lint/build could execute; neither is committed (both gitignored)"

patterns-established:
  - "Grouped Lot 3 migration pattern: schema+RLS in one file, grants-only follow-up in a second, mirroring the 02-site-public content-table precedent, to limit CIO push round-trips per D-21"

requirements-completed: [CPT-08]

# Metrics
duration: 35min
completed: 2026-09-01
---

# Phase 03 Plan 01: Lot 3 Data Spine Summary

**Three additive Supabase migrations (schema+RLS, then column-scoped grants) plus a negative RLS isolation proof establish `app.profil` as the single learner identity anchor with database-enforced cross-learner isolation and role-escalation refusal, verified locally and regenerated into `database.types.ts`.**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-09-01T08:55:00+01:00
- **Completed:** 2026-09-01T09:07:39+01:00
- **Tasks:** 4/4 completed
- **Files modified:** 4

## Accomplishments
- `app.profil`, `app.acces_support`, `app.demande_suppression` created with RLS, all `to authenticated using (utilisateur_id = (select auth.uid()))`, zero `anon` policies
- `app.creer_profil_pour_nouvel_utilisateur()` security-definer trigger auto-creates the profile row on `auth.users` insert, never reading `role` from client metadata
- Column-scoped `grant update` on `app.profil` withholds `role`/`email`/`utilisateur_id`/`created_at`/`updated_at` — the actual escalation control, proven with SQLSTATE 42501
- `supabase/tests/lot3_rls_isolation.sql` proves four refusals negatively (cross-read, cross-write, escalation, and cross-read on the other two tables) inside a single rolled-back transaction; verified it fails (non-zero exit) when `profil_self_select` is weakened to `using (true)`, then restored and re-verified exit 0
- `npm run db:types`, `typecheck`, `lint`, `build` all exit 0; `content:check` still exits 1 with unchanged baseline `CADR-03: 72`, `CADR-01: 10`; route rendering column unchanged (`○` everywhere except `ƒ /api/contact` and `ƒ /programme.pdf`)

## Task Commits

Each task was committed atomically:

1. **Task 1: Author the grouped Lot 3 schema migration** - `34df824` (feat)
2. **Task 2: Author the grants migration, with the column-scoped update grant** - `e0a4564` (feat)
3. **Task 3: Write and run the negative RLS isolation proof** - `2e9752b` (test)
4. **Task 4: Regenerate database types and close the green gates** - `9248d5d` (chore)

## Files Created/Modified
- `supabase/migrations/20260831160000_lot3_comptes.sql` - three tables, RLS policies, the profile-creation trigger and function
- `supabase/migrations/20260831161000_lot3_grants.sql` - `authenticated`/`service_role` grants, column-scoped update on `profil`
- `supabase/tests/lot3_rls_isolation.sql` - the negative isolation proof (D-18), local-only, never pushed
- `src/types/database.types.ts` - regenerated, now carries `profil`, `acces_support`, `demande_suppression`

## Decisions Made
- Column list for grant update matches the plan exactly: `prenom, nom, telephone, profil_professionnel, preference_rappels, preference_actualites` — verified via `information_schema.column_privileges`, byte-for-byte match to the acceptance criterion's expected string
- Isolation-proof seed users use fixed local uuids `...00a`/`...00b` with the minimal `auth.users` column set the local instance's constraints require (`instance_id`, `aud`, `role`, `email`, `encrypted_password`, `email_confirmed_at`, `raw_app_meta_data`, `raw_user_meta_data`, `is_sso_user`, `is_anonymous`, timestamps)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Restored missing `node_modules` via `npm ci`**
- **Found during:** Task 4 (regenerate types and run green gates)
- **Issue:** `next build` failed — `node_modules` was entirely absent in this worktree, so Turbopack couldn't resolve the `next` package
- **Fix:** Ran `npm ci` against the existing, unmodified `package-lock.json` — zero dependency or version changes, purely restoring what the lockfile already declares
- **Files modified:** none tracked (node_modules is gitignored, package.json/package-lock.json untouched)
- **Verification:** `npm run typecheck`/`lint`/`build` all exit 0 after
- **Committed in:** n/a (nothing to commit — gitignored)

**2. [Rule 3 - Blocking] Created local-only `.env.local`**
- **Found during:** Task 4
- **Issue:** `typecheck` and `build` both fail at boot-time Zod env validation with no `.env.local` present in this worktree (unlike the manually-provisioned `ElearningAriba-lot3` clone described in `03-CONTEXT.md`)
- **Fix:** Created `.env.local` populated with the local Supabase stack's own `npx supabase status` output (well-known local demo URL/anon key/service-role key, not a secret)
- **Files modified:** `.env.local` (gitignored, not committed)
- **Verification:** all four green gates pass
- **Committed in:** n/a (gitignored)

**3. [Rule 3 - Blocking] Used `docker exec`/`docker cp` in place of a host `psql` binary**
- **Found during:** Task 1 verification
- **Issue:** `psql` is not on this worktree's `PATH`
- **Fix:** Ran every verification query through `docker exec supabase_db_ElearningAriba psql -U postgres ...` against the same local Postgres container the plan's `psql "postgresql://...54322/..."` commands target — identical database, different client invocation
- **Files modified:** none
- **Verification:** every plan-specified query returned the exact expected value
- **Committed in:** n/a

---

**Total deviations:** 3 auto-fixed, all Rule 3 (blocking, tooling-only). No source, schema, or dependency-manifest changes beyond what the plan specified.
**Impact on plan:** None on scope or content — all three are local execution-environment fixes needed to run the plan's own verification commands.

## Issues Encountered
- A stray `app.profil` row (`throwaway-confirm@example.test`) was observed once after an intermediate `db reset`, from an unrelated prior CLI health-check auth user, not from this plan's migrations or test. Confirmed absent immediately after a clean reset and after running the isolation proof (`select count(*) from app.profil` = 0 both times), so it did not affect any acceptance criterion.

## User Setup Required

None from this plan directly, but the phase-level hosted dependency stands: both migrations (`20260831160000_lot3_comptes.sql`, `20260831161000_lot3_grants.sql`) must be pushed to both hosted Supabase projects by the CIO (D-21) — this seat has no `SUPABASE_ACCESS_TOKEN` and ran no `supabase db push`. Until that push happens, `CPT-05` and `CPT-08` are green **locally only**.

## Next Phase Readiness
- The identity anchor, isolation, and privilege-escalation controls all plan-04-09 surfaces (sign-up, sign-in, profile, espace, support access, GDPR) depend on now exist and are proven locally.
- No route or component was touched; the 14 public routes remain static, matching D-16.
- Blocker carried forward: hosted push of both migrations is owed by the CIO before `CPT-05`/`CPT-08` can be called green beyond local.

---
*Phase: 03-comptes-connexion-et-espace-apprenant*
*Completed: 2026-09-01*

## Self-Check: PASSED

All 4 created/modified files confirmed present on disk; all 5 task/plan commits (34df824, e0a4564, 2e9752b, 9248d5d, 8636b51) confirmed in `git log`.
