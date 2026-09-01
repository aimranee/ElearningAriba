---
phase: 03-comptes-connexion-et-espace-apprenant
plan: 11
subsystem: phase-recette
tags: [supabase, rls, recette, gdpr, oauth, evidence-record]

dependency-graph:
  requires:
    - phase: 03-comptes-connexion-et-espace-apprenant
      plan: "01-10"
      provides: "every CPT-01..CPT-09 surface, route handler and migration this plan re-verifies"
  provides:
    - ".planning/phases/03-comptes-connexion-et-espace-apprenant/03-RECETTE.md: the phase evidence record, hosted-dependency handoff and honest limits"
  affects: []

tech-stack:
  added: []
  patterns:
    - "diff the write-forbidden UI files against the phase's actual fork point (c124a827), not against main — main is still the Phase 0 placeholder and diffing against it would show all of Lot 1/2 as phase changes"
    - "PKCE email-confirmation/recovery links followed for real via curl: capture the code-verifier cookie from the route handler's Set-Cookie response, hit GoTrue's own /auth/v1/verify with it to mint a code, then exchange that code against this repo's own /api/auth/callback"

key-files:
  created:
    - .planning/phases/03-comptes-connexion-et-espace-apprenant/03-RECETTE.md
  modified: []

key-decisions:
  - "CPT-02 verdict is blocked, not proven-locally-with-hosted-limit: the Google client id/secret don't exist anywhere, so the requirement (sign in with Google) has never completed end to end in any environment, local included — only the redirect-initiation and fail-closed paths were observed"
  - "The UI-SPEC's acceptance criterion 1 command (git diff against main) was run as literally specified and shown non-zero, then re-run against the phase's real fork point c124a827 and shown zero, with both results and the reason for the discrepancy recorded rather than silently substituting the corrected command"
  - "Two UI-SPEC criteria (10's pending state, 8's checkbox click-through) are recorded pass-for-source-guarantee-only, not pass outright, because no headless-browser tool exists in this worktree to simulate a real click — flagged explicitly as why Task 2 exists"

requirements-completed: []

metrics:
  duration: ~140min
  completed: 2026-09-01
---

# Phase 03 Plan 11 (Task 1 only): Clean-state recette record

**Reset the local stack once, re-ran every CPT-01..CPT-09 proof from that single clean state — sign-up through email confirmation, sign-in/sign-out, unauthenticated redirects, password reset with enumeration-safety diff, the support-access mechanism's full positive/negative/expiry matrix, profile-update privilege-escalation refusal, and RGPD export/deletion — then wrote `03-RECETTE.md` with a three-value verdict per requirement, an honest unproven-items list, a CIO handoff, and the eleven UI-SPEC criteria plus the fourteen autonomous-decision items queued for founder ratification. Tasks 2 and 3 (the two blocking human-verify checkpoints) were not executed — this run is headless and cannot open a browser or observe a click — and are recorded in the file as `not reviewed`, literally, with no verdict inferred from the automated evidence above them.**

## What Was Done

**Clean-state re-verification.** `npx supabase db reset --local` applied all five migrations (including both Lot 3 ones) from scratch. `psql -f supabase/tests/lot3_rls_isolation.sql` against that fresh database printed all four `RLS-ISOLATION: … DENIED` notices, exit `0`. `npm run typecheck`, `npm run lint`, `npm run build` all exited `0`; `npm run content:check` exited `1` with unchanged totals (`CADR-03: 72`, `CADR-01: 10`). `git diff package.json package-lock.json` empty.

**Live behavioural proof, not copied from any plan summary.** Against a temporary `next start` of this worktree's own build, replayed live: a real sign-up → real PKCE email-confirmation link → session at `/espace` with the real first name; sign-in refused pre-confirmation; sign-in/sign-out with the unauthenticated redirect confirmed on all three `/espace*` routes with an empty body; a password-reset request for a registered and an unregistered address diffed byte-identical, followed through to a working new-password sign-in with the old password then rejected; the support-access mechanism's full matrix (positive download of real PDF bytes, horizontal-negative `404` between two learners, unauthenticated `404`, two distinct signed tokens two seconds apart, and a captured signed URL expiring to `400` after 65 seconds against a 60-second TTL); a profile update carrying a forged `role` and a forged `email` that both silently dropped while legitimate fields persisted; and an RGPD export that differed correctly between two learners plus a deletion request that survived a failed notification send (`RESEND_API_KEY` confirmed unset) and returned `409` on repeat.

**The write-forbidden-files check was run against the correct base, and the discrepancy is recorded, not hidden.** `git diff --stat main -- <write-forbidden files>` shows 1277 inserted lines, because `main` is still the Phase 0 placeholder (`27ab022`) and never received Lot 1 or Lot 2. The phase's actual fork point is `c124a827` (`gsd/phase-02-site-public`), documented in `03-CONTEXT.md`; diffed against that base, the same files show zero changed lines. Both results are in `03-RECETTE.md`, with the reason for the discrepancy stated plainly.

**`03-RECETTE.md` written with its four required sections:** a nine-row per-requirement verdict table (`CPT-01`..`CPT-09`, exactly three verdict values used, `CPT-02` alone marked `blocked` because the Google OAuth client doesn't exist anywhere yet — not even for a local proof); a plain-language "what is not proven" section; a CIO handoff checklist (both Lot 3 migrations, the Google client, custom SMTP, the private bucket, the two carried debts, and an explicit "nothing was pushed" assertion backed by `git log origin/HEAD..HEAD` and an empty `git reflog` push count); and a founder-facing section listing all eleven UI-SPEC acceptance criteria with pass/fail evidence, the twelve `D-A` decisions, the `SubmitButton` deviation, and the D-14 outcome — all marked as awaiting ratification, never ruled on by this run.

## Task Commits

1. **Task 1: Re-verify the phase from a clean state and write the recette record** — `ed35e7b` (docs)

## Verification Performed

- `npx supabase db reset --local && psql -f supabase/tests/lot3_rls_isolation.sql && npm run typecheck && npm run lint && npm run build` — all exit `0`, four isolation notices printed.
- `npm run content:check` exits `1`, totals unchanged.
- `grep -cE '\| (proven locally|proven on hosted|blocked) \|' 03-RECETTE.md` → `9`; `grep -ciE '\b(assumed|probably|should work|devrait|à priori)\b'` → `0`; `proven on hosted` never appears inside the `CPT-01`/`CPT-02` rows.
- Section 3 contains all four hosted-dependency items and both carried debts (grep-confirmed); the no-push assertion is backed by `git log origin/HEAD..HEAD --oneline` (227 unpushed commits) and `git reflog | grep -ci push` (`0`).
- Section 4 lists all eleven UI-SPEC criteria with individual verdicts.
- `find src/app -type d -name 'admin*'` empty; `grep -rn PRENOM_MAQUETTE src/` empty; the write-forbidden diff against the correct base (`c124a827`) is zero lines.
- `next build` route table: fourteen static routes, `/espace`/`/espace/profil`/`/espace/donnees` and every `api/*` dynamic.
- `git diff package.json package-lock.json` empty.
- Branch confirmed `gsd/phase-03-comptes-connexion-et-espace-apprenant` at both the start and the end of this run.

## Deviations from Plan

### Auto-fixed Issues

None — this task ran the plan's own verification sequence and produced the record it specifies. Where the plan's literal acceptance command (`git diff --stat main -- ...`) did not isolate the phase's own contribution because `main` never received Lot 1/2, both the literal result and the corrected result (against the phase's real fork point) are recorded in `03-RECETTE.md` rather than silently substituting one for the other.

### Environment / verification-only notes (not plan deviations)

- No `psql` binary on this worktree's `PATH` — every SQL command ran through `docker exec supabase_db_ElearningAriba psql`, same substitution plan 03-01 documented.
- No headless-browser tool exists in this worktree. Every behavioural proof above was driven through `curl` against a temporary `next start` process (torn down after each round), including hand-carried PKCE code-verifier cookies to complete real email-confirmation and password-recovery round trips without a browser. Two UI-SPEC criteria (the `data-loading="true"` pending state, and the deletion checkbox's disabled→enabled transition on a real click) could not be exercised this way — their source-level guarantees were grep-confirmed, but no click was simulated. Recorded honestly in `03-RECETTE.md` as not observed this pass, and flagged as the reason Task 2 exists.
- All test accounts and their data (Nadia, Sofia, Lea, Maya, Yasmine, Karim, plus their profil/acces_support/demande_suppression rows) live only in the local Supabase stack reset at the start of this run; nothing was seeded into a committed migration or fixture.

## What Was Not Done — by design, per the run's own instructions

**Tasks 2 and 3 of this plan — both `checkpoint:human-verify`, `gate="blocking"` — were not executed.** This run is headless: it cannot open a browser, click a checkbox, or judge whether new French copy "sounds right." `03-RECETTE.md` records both as `not reviewed`, literally, and states explicitly that no human gate was inferred from the automated evidence above it — the exact failure mode phase 02-04 had and threat `T-03-48` in this plan's own threat model exists to prevent.

**The phase is not closed.** Every requirement, UI-SPEC criterion, and `D-A` decision that depends on Task 2 or Task 3's ruling stays at `not reviewed` / awaiting ratification in the record. The founder still needs to: walk the nine steps of Task 2 against a running `npm run build && npm start`, and rule on the copy and the fourteen autonomous decisions in Task 3, per `03-11-PLAN.md`.

## Hosted / Cross-Plan Notes

`03-RECETTE.md` Section 3 is the single CIO handoff for the whole phase: both Lot 3 migrations, the Google OAuth client, custom SMTP with an authenticated domain, and the private `supports` bucket — plus the two carried debts (the `master`→`main` rename, the paused Free-plan projects). Nothing was pushed during this run; no command touching a remote ref or a hosted Supabase project was executed.

## Next Phase Readiness

- The phase cannot be marked complete until the founder rules on Tasks 2 and 3 of this plan.
- No file under `src/app/globals.css`, `src/components/ui/`, or `src/components/layout/` was touched by this task — it only created `03-RECETTE.md`.
- Working tree is clean and the branch is unchanged from the run's start.

---
*Phase: 03-comptes-connexion-et-espace-apprenant*
*Completed: 2026-09-01*
