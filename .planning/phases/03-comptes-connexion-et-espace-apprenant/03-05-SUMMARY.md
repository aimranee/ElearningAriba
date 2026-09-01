---
phase: 03-comptes-connexion-et-espace-apprenant
plan: 05
subsystem: sign-up
tags: [nextjs, supabase-auth, route-handler, client-island, rls]

# Dependency graph
requires:
  - phase: 03-comptes-connexion-et-espace-apprenant
    plan: "01"
    provides: "app.profil trigger reading raw_user_meta_data, ignoring role"
  - phase: 03-comptes-connexion-et-espace-apprenant
    plan: "02"
    provides: "password rule (8 chars + digit), enable_confirmations = true, francised confirmation email"
  - phase: 03-comptes-connexion-et-espace-apprenant
    plan: "03"
    provides: "inscriptionSchema/inscriptionIssuesToFieldErrors, AuthShell, SubmitButton"
  - phase: 03-comptes-connexion-et-espace-apprenant
    plan: "04"
    provides: "/api/auth/callback code/token_hash exchange, /espace session gate"
provides:
  - "POST /api/auth/inscription: validated sign-up, enumeration-safe on an already-registered address"
  - "InscriptionForm client island rendering all five UI-SPEC states"
  - "/inscription as a static shell hosting the island, Lot 1 demo section removed"
affects: [03-06, 03-07]

tech-stack:
  added: []
  patterns:
    - "signUp's options.data becomes raw_user_meta_data — only prenom/nom/profil_professionnel sent, never a privilege field, mirroring the plan 03-01 trigger's read set"
    - "error.code === \"user_already_exists\" folded into the ordinary 200 success response — the actual enumeration-safety mechanism observed against this local auth server (see Deviations)"

key-files:
  created:
    - src/app/api/auth/inscription/route.ts
    - src/components/compte/inscription-form.tsx
  modified:
    - src/app/inscription/page.tsx

key-decisions:
  - "T-03-30's mitigation folds Supabase's user_already_exists error into the success response, rather than relying on Supabase to return a success-shaped response unprompted — see Deviations for what was actually observed locally"

requirements-completed: [CPT-01]

metrics:
  duration: ~90min
  completed: 2026-09-01
---

# Phase 03 Plan 05: Sign-up Vertical Slice Summary

**`CPT-01` end to end: `/inscription` (static) -> `InscriptionForm` client island -> `POST /api/auth/inscription` -> Supabase `signUp` -> the plan 03-01 trigger writes `app.profil` -> the French confirmation email -> the plan 03-04 callback -> `/espace`, proven live against the local stack including the account-enumeration-safety path, which required folding an explicit `user_already_exists` provider error into the plan's assumed unprompted-success response.**

## Accomplishments

- `src/app/api/auth/inscription/route.ts` exports `POST` only: parses with `inscriptionSchema`, calls `supabase.auth.signUp` with `emailRedirectTo` built from `serverEnv.NEXT_PUBLIC_SITE_URL` and `options.data` carrying only `prenom`/`nom`/`profil_professionnel` — never a privilege field — a per-IP `consume()` guard in front, and a weak-password rejection mapped to `inscription.erreurs.motDePasseFaible` rather than the provider's English message.
- `src/components/compte/inscription-form.tsx` is a `"use client"` island lifting the field markup verbatim from the old page, rendering idle/pending/field-error/server-rejection/success exactly as `contact-form.tsx` models them, submitting to `/api/auth/inscription`.
- `src/app/inscription/page.tsx` is now a server component (`AuthShell` + `Card` + `InscriptionForm`), the 85-line `<section id="inscription-etats">` demo block deleted, still statically rendered (`○ /inscription` in the build output, confirmed in `.next/server/app/inscription.html`).
- The six-step end-to-end sequence in the plan's Task 1 acceptance criteria passed live against the local stack: account created, `app.profil` row carries `Camille | Durand | consultant | learner`, sign-in refused with `email_not_confirmed` before confirmation, the mail-collector confirmation link followed through to a working `/espace` session (`Bonjour` present), and a repeat sign-up to the same address returns the identical `200 {"ok":true}` body with the profile row count still `1`.
- Negative behaviour verified: `abcdefg`/`abcdefg` (no digit) -> `422 {"errors":{"motDePasse":"motDePasseFaible"}}`; mismatched passwords -> `422 {"errors":{"confirmation":"confirmationDifferente"}}`.

## Task Commits

1. **Task 1: The sign-up route handler, proven end to end** - `14f2156` (feat)
2. **Task 2: Replace the /inscription shell with a static shell plus a client island** - `8e10634` (feat)

## Files Created/Modified

- `src/app/api/auth/inscription/route.ts` — POST-only sign-up handler
- `src/components/compte/inscription-form.tsx` — the five-state client island
- `src/app/inscription/page.tsx` — static shell, demo section removed

## Verification Performed

**Static:**
- `npm run typecheck`, `npm run lint`, `npm run build` all exit `0`.
- Route table unchanged in shape from plan 03-04's baseline except `/api/auth/inscription` joining the `ƒ` group; `/inscription` stays `○`.
- All Task 1 grep acceptance criteria passed: single `POST` export, no `revalidate`, no literal `role`, `NEXT_PUBLIC_SITE_URL` used once with no hardcoded origin, no `: any`/`as any`, no accented character outside the locale-key strings.
- All Task 2 grep/build acceptance criteria passed: `inscription-etats` gone from both the source and the prerendered HTML, `"use client"` only on the island, no `session`/`supabase/server` import in the page, `rejected="server"` prop used (not the raw attribute), the fetch target matches, no hardcoded visible label, `git diff --name-only src/components/ui/ src/components/layout/ src/app/globals.css` empty, `content:check` totals unchanged (`CADR-03: 72`, `CADR-01: 10`).

**Live behavioural, against `next start` on the local stack (temporary port, torn down after):**
- Full six-step sequence from the plan's Task 1 acceptance criteria — sign-up, `app.profil` row, pre-confirmation sign-in refusal, mail-collector link followed to a working `/espace` session, repeat sign-up silent — all passed. See Deviations for how step 4/6 were actually exercised.
- Both negative-password/mismatched-confirmation cases returned the correct locale-keyed `422`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Folded `user_already_exists` into the ordinary success response**
- **Found during:** Task 1 end-to-end verification (step 6, repeat sign-up)
- **Issue:** The plan's account-enumeration-discipline paragraph states that Supabase, against an already-registered address, "returns a success-shaped response with no session and no confirmation sent" — implying `supabase.auth.signUp` resolves with no `error`. Observed locally: signing up again with an already-registered, already-confirmed address resolves with an explicit `error.code === "user_already_exists"` (HTTP 422 from the auth server) instead. Passing that error straight to the handler's generic `502` branch would leak an enumeration signal through the HTTP status alone — the exact outcome T-03-30 exists to prevent.
- **Fix:** Added an explicit branch mapping `error.code === "user_already_exists"` to the same `200 {"ok":true}` response every other successful sign-up gets, before the weak-password/generic-rejection branches.
- **Files modified:** `src/app/api/auth/inscription/route.ts` (folded into the Task 1 commit, no separate commit)
- **Verification:** repeat-sign-up acceptance criterion passes — identical `200`/body, `app.profil` count for the address stays `1`.

### Environment / verification-only notes (not plan deviations, recorded for the next agent)

- This worktree had no `node_modules` and no `.env.local` at spawn — same class of restoration every prior Lot 3 plan performed. Ran `npm ci` against the unmodified lockfile; copied `.env.local` from the parallel main checkout (gitignored, local-stack credentials, not committed).
- `.env.local`'s `NEXT_PUBLIC_SITE_URL` was changed from `http://localhost:3000` to `http://127.0.0.1:3000` in this worktree only (gitignored, not committed) to match `supabase/config.toml`'s `auth.site_url`. Without this, `emailRedirectTo` never matches GoTrue's redirect allow-list (the known D-14 `http`/`https` and `localhost`/`127.0.0.1` mismatch, explicitly owned by plan 03-06, not this plan's `files_modified`) and GoTrue silently substitutes `site_url` with no path when the visitor follows the confirmation link, landing on `/` with a `?code=` query param instead of `/api/auth/callback`. To still exercise the real six-step sequence, the confirmation link was followed to GoTrue directly (capturing the resulting PKCE `code`), then that code was exchanged against this worktree's own `/api/auth/callback` using the cookie jar captured from the original sign-up request (the code-verifier cookie `createServerClient` had already set) — proving the app's own code path end to end without depending on the broken external redirect. **This is a verification-only workaround, not a source change**; the underlying config mismatch is still open and owned by 03-06.

---

**Total deviations:** 1 auto-fixed (Rule 1, a real behavioural gap between the plan's assumption and the observed provider response), plus environment/verification notes carried from every prior Lot 3 plan.
**Impact on plan:** The Rule 1 fix is required for T-03-30 to actually hold; without it, a repeat sign-up to a confirmed address would return `502` instead of `200`, which is a distinguishable, enumerable signal. No other scope creep.

## Hosted / Cross-Plan Notes

Per the plan's own `<hosted_limits>`: `CPT-01` is proven **locally only**. Hosted Supabase projects send through the default, heavily rate-limited sender with no custom SMTP yet (a CIO item per plan 03-02's notes) — no confirmation email from this seat can be observed on hosted at all.

The `.env.local`/`config.toml` mismatch this plan worked around (D-14) is explicitly plan 03-06's fix, not applied here — `supabase/config.toml` was not touched by this plan.

## Next Phase Readiness

- `CPT-01` is delivered: a visitor can create an account, must confirm their address before it works, and the profile row carries their real name at role `learner`.
- Neither a repeat sign-up nor an error response reveals whether an address is already registered.
- `/inscription` is still static, the Lot 1 demo block is gone, and every visible label resolves through `inscription.json`/`common.json`.
- Plan 03-06 (sign-in, Google OAuth) is the natural next consumer of the callback route this plan also exercised for real, and owns closing D-14 so the confirmation-link redirect matches without the workaround this plan needed for verification.

---
*Phase: 03-comptes-connexion-et-espace-apprenant*
*Completed: 2026-09-01*

## Self-Check: PASSED

`src/app/api/auth/inscription/route.ts`, `src/components/compte/inscription-form.tsx`, `src/app/inscription/page.tsx` all confirmed present on disk. Commits `14f2156` and `8e10634` confirmed in `git log`.
