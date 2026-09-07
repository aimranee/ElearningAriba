---
phase: 04-agenda-et-prise-de-rendez-vous
plan: 07
subsystem: api
tags: [supabase, postgres, rls, security-definer, csv, resend, zod, agenda, admin]

# Dependency graph
requires:
  - phase: 04-agenda-et-prise-de-rendez-vous (plan 01)
    provides: "app.reservation, app.maintien_creneau, app.est_administrateur(), the reserver_creneau RPC shape this plan's RPCs mirror"
  - phase: 04-agenda-et-prise-de-rendez-vous (plan 04)
    provides: "src/lib/agenda/ics.ts, src/lib/email/render.ts's reservation renderers (including reservationAnnulationOuDeplacementNotice, unconsumed until this plan)"
  - phase: 04-agenda-et-prise-de-rendez-vous (plan 06)
    provides: "requireAdministrator(), src/lib/agenda/admin-queries.ts, src/lib/validation/agenda-admin.ts, src/locales/fr/admin.json shell"
provides:
  - "app.deplacer_reservation, app.annuler_reservation, app.reserver_pour_apprenant — admin-only security definer RPCs with typed outcomes"
  - "profil_admin_select RLS policy — an administrator can read another learner's app.profil row"
  - "src/lib/agenda/csv.ts — zero-dependency French-Excel CSV builder"
  - "listerReservationsAdmin / trouverReservationAdmin in admin-queries.ts — the two-query app.profil join (no direct FK for PostgREST embedding)"
  - "POST /api/admin/reservations, PATCH+DELETE /api/admin/reservations/[id], GET /api/admin/reservations/export"
affects: [04-08, 04-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "app.profil has no direct foreign key to app.reservation (both reference auth.users independently) — admin-queries.ts joins with a second, explicit query rather than PostgREST embed syntax"
    - "the shared plan-04-04 reservationAnnulationOuDeplacementNotice renderer serves both move and cancel; cancel supplies a fixed French sentence (admin.reservations.annulation.dateHeureNouvelle) into the {dateHeureNouvelle} slot instead of a second date/time"
    - "create-on-behalf reads FORMATEUR_LIEN_VISIO server-side (D-15), same optional-at-boot/strict-at-use split as the booking route — no lieu field in the request schema"

key-files:
  created:
    - supabase/migrations/20260901182000_lot4_admin_reservation.sql
    - src/lib/agenda/csv.ts
    - src/app/api/admin/reservations/route.ts
    - src/app/api/admin/reservations/[id]/route.ts
    - src/app/api/admin/reservations/export/route.ts
  modified:
    - src/types/database.types.ts
    - supabase/tests/lot4_rls_reservation.sql
    - src/lib/agenda/admin-queries.ts
    - src/lib/validation/agenda-admin.ts
    - src/locales/fr/admin.json

key-decisions:
  - "Added profil_admin_select (create policy, additive) to the same migration — Lot 3 shipped only profil_self_select since no admin surface existed yet; without it every reservation would render 'compte supprime' for every OTHER learner, not just erased accounts. Rule 2 (missing critical functionality)."
  - "reserver_pour_apprenant resolves the email against auth.users, not app.profil — auth.users is authoritative for 'does an account exist'."
  - "reservation_annulee (move-on-a-cancelled-row) and deja_annulee (cancel-on-a-cancelled-row) map to the same admin.erreurs.dejaAnnulee French key — both describe the identical state to the administrator."
  - "The cancellation notice reuses the single move/cancel email template from plan 04-04 rather than adding a second one (out of this plan's files_modified); the {dateHeureNouvelle} slot carries a fixed French sentence for the cancel case."

requirements-completed: [AGD-08, AGD-09]

# Metrics
duration: ~95min
completed: 2026-09-03
---

# Phase 4 Plan 07: Admin reservation control — move, cancel, book on behalf, CSV export Summary

**Three admin-only security-definer RPCs (deplacer/annuler/reserver_pour_apprenant) with typed outcomes, a new profil_admin_select RLS policy the reads depend on, and three route handlers plus a zero-dependency French-Excel CSV export — all verified end-to-end against the local stack, including a real formula-injection payload and a real account erasure.**

## Performance

- **Duration:** ~95 min
- **Tasks:** 2 of 2
- **Files modified:** 10 (5 created, 5 modified)

## Accomplishments

### Task 1 — Admin reservation RPCs, migration, types, extended RLS proof

- `supabase/migrations/20260901182000_lot4_admin_reservation.sql`: three `volatile security definer` functions with `set search_path = ''`, fully-qualified identifiers, and a first-statement `app.est_administrateur()` refusal in every one (the in-body check is the control, not the grant). `deplacer_reservation` re-derives `fin`/`fin_avec_tampon` from the row's own `type_id`, never re-validates against `app.creneaux_libres` (the administrator outranks the published rules and the D-13 window), catches `exclusion_violation` → `creneau_indisponible`, and clears any overlapping `app.maintien_creneau` retention. `annuler_reservation` sets `statut='annulee'`/`annulee_le=now()`, freeing the slot through the existing partial exclusion constraint. `reserver_pour_apprenant` resolves an email against `auth.users` — an unknown email creates nothing (D-18) — and mirrors `app.reserver_creneau`'s exception handling.
- Added `profil_admin_select` (a new `create policy`, additive) in the same migration — a Rule 2 fix, not in the plan's original file list of objects but required for the plan's own stated join to work (see Deviations).
- Applied via `npx supabase db reset --local` (9 migrations, including two post-04-02 fix migrations already in the tree), reseeded content and agenda (the seeded `formateur@example.test` account did not exist after the reset — created via the service-role admin API with a temporary password before `agenda:seed` would proceed), regenerated `src/types/database.types.ts` (24-line diff naming all three new functions).
- Extended `supabase/tests/lot4_rls_reservation.sql` with 8 new numbered steps: learner refusal of all three RPCs (writes nothing); admin move onto a free instant (`ics_sequence` +1, `ics_uid` unchanged); admin move onto a taken instant (refused, row untouched); admin cancel + learner rebooking the freed instant; the D-27 interaction (a visitor's hold on an instant does not block an admin move onto it, and the hold is cleared afterward); `reserver_pour_apprenant` unknown-email refusal and known-email success (row owned by the learner, not the admin); and `profil_admin_select` itself (administrator reads other learners' profil rows, a learner still cannot).

**Verification:** all five `supabase/tests/*.sql` files (including `lot3_rls_isolation.sql`) exit 0; `has_table_privilege('authenticated','app.reservation','update')` still `f`; 3/3 new functions `prosecdef`; `has_table_privilege('authenticated','app.maintien_creneau','select')` still `f`; `npm run typecheck` exits 0; `git diff package.json package-lock.json` empty.

### Task 2 — Admin reservation reads, French-Excel CSV, three route handlers

- `src/lib/agenda/csv.ts`: BOM + `;` + CRLF + formula-injection guard (prefix-quotes a cell beginning with `=`, `+`, `-`, `@`, tab or CR), zero dependencies, no French string authored.
- `src/lib/agenda/admin-queries.ts`: `listerReservationsAdmin(du, au)` and `trouverReservationAdmin(id)`, both joining `app.profil` with a **second, explicit query** — `app.reservation.utilisateur_id` and `app.profil.utilisateur_id` both reference `auth.users` independently, with no direct FK between the two app tables, so PostgREST's `.select("*, profil(*)")` embed syntax is unavailable. `profil: null` renders as `admin.reservations.compteSupprime` with an empty email — never a snapshot on the reservation row (D-08).
- `src/lib/validation/agenda-admin.ts`: `deplacementSchema`, `buildCreationPourApprenantSchema` (a factory over the active `app.type_rendez_vous` id set, read at request time — never `agenda.json`), `exportSchema` (both bounds required, span capped at 366 days, T-04-48), and three outcome-to-`admin.erreurs.*` mappers.
- `src/locales/fr/admin.json`: a new `reservations` section (six export column labels, the "columns announced before export" sentence with correct NBSP-before-colon typography, statut labels, compte-supprime label, cancellation copy) and six new `erreurs.*` keys.
- Three route handlers, each opening with a method-surface comment and calling `requireAdministrator()` before parsing: `POST /api/admin/reservations` (create-on-behalf, branches on the RPC's typed outcome, sends the plan-04-04 confirmation + trainer notification after commit); `PATCH`+`DELETE /api/admin/reservations/[id]` (move/cancel, no GET, both notify the learner through the shared plan-04-04 renderer, skip silently when `utilisateur_id` is null); `GET /api/admin/reservations/export` (D-19 CSV, `Cache-Control: no-store, no-cache, private`, RFC 5987 filename derived from the validated date range only).

**Verification — `npm run lint && npm run typecheck && npm run build` all exit 0; `supabase/tests/lot4_rls_reservation.sql` exits 0.**

**End-to-end against the local stack** (temporary `next start` on port 3013 — port 3000 squatted, 3010/3012 used by prior plans' notes; cookie jars stored under a repo-relative `.tmp-e2e/` to avoid a `/tmp` path issue on this shell, deleted afterward):
- Create-on-behalf for an existing learner → 200, row owned by the learner (not the admin).
- Move onto a free instant → 200, `ics_sequence` +1.
- Move onto a taken instant → 409 `creneauIndisponible`, `debut` unchanged.
- Cancel → 200, `statut='annulee'`; the freed instant is then bookable by a learner via `POST /api/reservation`.
- Create-on-behalf with an unknown email → 409 `apprenantIntrouvable`, `select count(*) from auth.users` unchanged.
- `individuelle` deactivated mid-flight → create-on-behalf refused with `champsInvalides` (422) before the RPC is called, zero rows created, `actif` restored afterward.
- A learner whose surname is `=1+1` (prenom empty, so the "apprenant" cell begins with the nom) exports as `'=1+1` — a single-quote-prefixed cell, not a formula.
- Erasing that learner's account (`auth.admin.deleteUser`) leaves the reservation `statut='confirmee'` with `utilisateur_id` null; the CSV export then shows `Compte supprimé` with an empty email cell, and the slot still refuses a new booking (`creneauIndisponible`).
- The export file: first three bytes `EF BB BF`, header line ends `\r\n`, splits into exactly six `;`-separated fields (date, type, durée, apprenant, email, statut in that order).
- As a learner: all three endpoints (`POST`, `PATCH`, `DELETE`) `307` to `/espace`; unauthenticated `GET /export` `307`s to `/connexion`; the targeted reservation's `statut` was unchanged by the refused calls.
- No unhandled server errors in the `next start` log across the full sequence (RESEND_API_KEY empty locally — every send attempt threw `EmailTransportError`, swallowed as designed).

## Task Commits

1. **Task 1: Admin reservation RPCs, apply, regenerate types, extend the isolation proof** — `5e06435` (feat)
2. **Task 2: Admin reservation reads, French-Excel CSV, three route handlers** — `8308c1b` (feat)

## Files Created/Modified

- `supabase/migrations/20260901182000_lot4_admin_reservation.sql` — the three admin RPCs + `profil_admin_select`
- `src/types/database.types.ts` — regenerated
- `supabase/tests/lot4_rls_reservation.sql` — 8 new numbered assertion steps
- `src/lib/agenda/csv.ts` — French-Excel CSV builder
- `src/lib/agenda/admin-queries.ts` — `listerReservationsAdmin`, `trouverReservationAdmin`, `chargerProfilsApprenants`
- `src/lib/validation/agenda-admin.ts` — move/cancel/create-on-behalf/export schemas + outcome mappers
- `src/locales/fr/admin.json` — `reservations` section + 6 new `erreurs.*` keys
- `src/app/api/admin/reservations/route.ts` — POST (create-on-behalf)
- `src/app/api/admin/reservations/[id]/route.ts` — PATCH (move) + DELETE (cancel)
- `src/app/api/admin/reservations/export/route.ts` — GET (CSV export)

## Decisions Made

- `profil_admin_select` added inside this plan's migration (Rule 2) — see Deviations.
- `reserver_pour_apprenant` resolves the email against `auth.users`, never `app.profil` — the former is authoritative for account existence.
- `reservation_annulee` and `deja_annulee` share the `dejaAnnulee` French key.
- Create-on-behalf carries no `lieu` field; the server reads `FORMATEUR_LIEN_VISIO` after the admin gate, mirroring the booking route's D-15 discipline.
- The cancellation notice reuses plan 04-04's single move/cancel email template (out of this plan's `files_modified`), supplying a fixed French sentence into the shared `{dateHeureNouvelle}` slot rather than adding a second template.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 — missing critical functionality] Added `profil_admin_select` RLS policy**
- **Found during:** Task 1, while designing the migration ahead of Task 2's join
- **Issue:** `app.profil` shipped in Lot 3 with only `profil_self_select` — no admin surface existed yet. The plan's own interfaces section requires `admin-queries.ts` to join `app.profil` "at read time" so a reservation renders the learner's real name/email. Without a policy letting an administrator select another learner's row, RLS would return zero rows for every learner other than the admin themself, and every reservation — not just erased accounts — would incorrectly render "compte supprimé".
- **Fix:** Added `create policy profil_admin_select on app.profil for select to authenticated using (app.est_administrateur());` inside the new migration (a `create`, not an `alter`/`drop`, so it stays inside the file's own "strictly additive" mandate). `select` on `app.profil` was already granted to `authenticated` by Lot 3's grants migration — only the missing policy was added.
- **Files modified:** `supabase/migrations/20260901182000_lot4_admin_reservation.sql`, `supabase/tests/lot4_rls_reservation.sql` (steps 14/15 assert the fix and its boundary — an administrator can read other learners' profil rows, a learner still cannot)
- **Verification:** end-to-end — a reservation for a still-active learner exports with the learner's real name/email, not "compte supprimé"; SQL steps 14/15 pass.

### Reported, not fixed (literal-text mismatches against a working-correctly implementation)

Per this session's standing verification-defect guidance (established in `04-06-SUMMARY.md`): grep-count mismatches against idiomatically correct, verified-working code are reported, not fixed by deforming the code to satisfy an exact count.

1. **`grep -c "requireAdministrator" <file>` expects `1`; actual is `2` (`reservations/route.ts`, one POST handler), `3` (`[id]/route.ts`, two handlers: PATCH + DELETE), `2` (`export/route.ts`, one GET handler).** Same class of mismatch 04-06 already reported: the substring appears once in the import statement plus once per handler's own call, and `[id]/route.ts` legitimately exports two independently-gated handlers. Verified behaviorally: every handler in every file was exercised end-to-end above (POST, PATCH, DELETE, GET), and every unauthenticated/non-admin call redirected before any write or read.
2. **`grep -nE "decouverte|individuelle|typesRendezVous|agenda\.json" src/lib/validation/agenda-admin.ts` expects zero matches; actual has three.** One is a doc comment explaining the create-on-behalf schema deliberately never reads `agenda.json` (the guard's own explanation, containing the literal path it forbids). Two are the literal outcome string `'appel_decouverte_deja_reserve'` — `app.reserver_pour_apprenant`'s own RPC outcome name, required verbatim by the plan's own action text, and the exact same documented, unavoidable tension `04-04-SUMMARY.md` already recorded for `src/lib/validation/reservation.ts`. The behavioral requirement the grep is a proxy for — never hard-code the accepted `typeId` set — is independently satisfied: `buildCreationPourApprenantSchema` takes the active-id set as a parameter, sourced from `app.type_rendez_vous` at request time (proven end-to-end: deactivating `individuelle` mid-flight refuses the request before the RPC is ever called).
3. **`grep -nE "[éèêàçûôîÉÈÀÇ]" src/lib/agenda/csv.ts` expects zero matches; actual has one (under a UTF-8 locale) or more (under this shell's default non-UTF-8 locale, matching individual bytes of the multi-byte em dash `—`, same false-positive class 04-06 already documented).** The one genuine match, under `LC_ALL=C.UTF-8`, is the literal `é` inside an English-language code comment explaining the exact encoding bug the leading BOM exists to prevent ("Excel FR renders é as Ã©") — not a French UI label. No French string is authored in the file's executable code; every header/row value is an argument sourced from `admin.json` at the call site, confirmed by inspection and by the end-to-end CSV output above.

---

**Total deviations:** 1 auto-fixed (Rule 2 — a missing RLS policy the plan's own text implicitly required), 3 reported-not-fixed (grep-count mismatches against verified-correct code, same class already established in `04-04-SUMMARY.md` and `04-06-SUMMARY.md`).
**Impact on plan:** The Rule 2 fix is necessary for AGD-08's export/read requirement to work at all for any still-active learner, not just erased ones. No scope creep — nothing beyond what the plan's own interfaces section already specified.

## Known Stubs

None — every read, write and export is wired to the live database; no placeholder data. `admin.reservations` copy (export column labels, the "columns announced before export" sentence, cancellation copy) is written now but has no UI consumer yet — plan 04-08 is the intended caller, the same forward-provisioning pattern `04-04-SUMMARY.md` used for its unconsumed cancellation-notice renderer, consumed one plan later by this same plan.

## Threat Flags

None beyond what this plan's own `<threat_model>` already registers (T-04-42 through T-04-50, T-04-SC). The one new surface not explicitly named in that register — the `profil_admin_select` RLS policy itself, an administrator's read access to another learner's `app.profil` row — is the direct, minimal mechanism the register's own T-04-45 mitigation ("Join `app.profil` at read time") depends on to function; it is scoped to `select` only, gated by `app.est_administrateur()`, and proven negative for a learner caller in `supabase/tests/lot4_rls_reservation.sql` steps 14-15.

## Issues Encountered

- **The seeded `formateur@example.test` account did not exist after `npx supabase db reset --local`** — Auth data is not part of any migration or seed script; it was created via the service-role admin API with a temporary password (`TempPass!2026x`, not committed, not persisted into any tracked file) before `npm run agenda:seed` would proceed, same pattern `04-06-SUMMARY.md` recorded.
- **Port 3000 squatted by an unrelated process** (same condition every prior Lot 4 plan recorded) — end-to-end verification used a temporary `next start` on port 3013, stopped via `taskkill` once done.
- **Cookie jars written to `/tmp` were not visible across subsequent Bash tool calls** on this Windows/Git-Bash environment (the file silently did not exist on the next call despite `curl -c` reporting success) — switched to a repo-relative `.tmp-e2e/` directory, which persisted correctly across calls; the directory was deleted at the end of verification.
- The first move/cancel test instant (`16:00`) chosen for the extended SQL test file did not align to the type's generated slot grid (`09:00` + N×45min steps never lands on `16:00`) — `deplacer_reservation` (which does not re-validate against `app.creneaux_libres`) succeeded, but the subsequent learner `reserver_creneau` on the same instant correctly failed `creneau_indisponible`, since that RPC does re-derive against the grid. Fixed by using a grid-aligned instant (`15:00`) for that chain of assertions — a test-data correction, not a code defect.

## User Setup Required

None — all verification is local-database and local-build only; nothing pushed, no CIO dependency for this plan. AGD-06's "an email actually arrives in an inbox" remains a manual/hosted-recette verification (`RESEND_API_KEY` empty locally, unchanged since plan 04-04), not achievable from this machine.

## Next Phase Readiness

- Unblocked. All three admin RPCs, the CSV export, and the three route handlers are live and verified against the local stack.
- Plan 04-08 (the `/admin/reservations` UI screen) can now call `POST/PATCH/DELETE /api/admin/reservations[…]` and `GET /api/admin/reservations/export`, and read through `listerReservationsAdmin`/`trouverReservationAdmin`. The `admin.reservations` copy this plan added (export column labels, cancellation confirmation copy) is ready for that screen to consume.
- No founder review gate in this plan (no `checkpoint:human-verify` task) — fully autonomous, API-only. The visible surface belongs to plan 04-08, which carries its own D-26 gate (and explicitly owes the 375px/320px, tap-target and input-font-size checks 04-06's gate deferred).

---
*Phase: 04-agenda-et-prise-de-rendez-vous*
*Completed: 2026-09-03*

## Self-Check: PASSED

All 5 created files and this SUMMARY.md confirmed present on disk; both task commit hashes (`5e06435`, `8308c1b`) confirmed present in `git log --oneline --all`.
