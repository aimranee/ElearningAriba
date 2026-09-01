---
phase: 03-comptes-connexion-et-espace-apprenant
plan: 02
subsystem: auth
tags: [supabase, auth, config-toml, email-templates, zod, env]

# Dependency graph
requires:
  - phase: 02-site-public
    provides: existing Next.js/Supabase scaffold, src/lib/env/server.ts Zod-at-boot pattern
provides:
  - Supabase config.toml matching the signed copy (8-char + digit password, mandatory email confirmation)
  - Native rate-limit throttling for CPT-03 (10/5min sign-in and token-verification, no captcha)
  - Declared (env-only) auth.external.google provider block for CPT-02
  - Declared private storage.buckets.supports for CPT-07
  - Francised confirmation.html and recovery.html Supabase Auth email templates
  - SUPABASE_SUPPORTS_BUCKET validated server env var, defaulted to "supports"
affects: [03-05-sign-up, 03-06-google-oauth, 03-07-password-reset, 03-08-supports-access]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Supabase config.toml contradiction fixes always move config toward signed copy, never the reverse (D-12/D-13)"
    - "Static Auth email templates duplicate emails.json strings with an explicit in-file comment naming the duplication (D-23)"

key-files:
  created:
    - supabase/templates/confirmation.html
    - supabase/templates/recovery.html
  modified:
    - supabase/config.toml
    - src/lib/env/server.ts
    - .env.example

key-decisions:
  - "minimum_password_length 8 + password_requirements letters_digits, matching inscription.json's signed copy (D-12)"
  - "enable_confirmations true on [auth.email] only, [auth.sms] left untouched (D-13)"
  - "sign_in_sign_ups and token_verifications tightened 30->10 per 5min; no captcha added (D-08)"
  - "additional_redirect_urls http/https mismatch carried as a comment, not fixed — deferred to 03-06 (D-14)"
  - "SUPABASE_SUPPORTS_BUCKET defaulted rather than required so next build never breaks on a missing bucket name"
  - "Google client id/secret NOT added to serverEnvSchema — consumed only by the Supabase CLI via config.toml's env() substitution"

patterns-established:
  - "Every config.toml edit in this phase carries a one-line # comment naming the decision ID it implements"

requirements-completed: []

# Metrics
duration: 24min
completed: 2026-09-01
---

# Phase 03 Plan 02: Supabase Auth Configuration Summary

**Resolved both signed-copy/config contradictions in config.toml (8-char+digit password, mandatory confirmation), tightened native rate limits for CPT-03, declared the Google provider and private supports bucket, francised both Auth email templates, and added the validated SUPABASE_SUPPORTS_BUCKET env var.**

## Performance

- **Duration:** 24 min
- **Started:** 2026-09-01T07:43:00Z
- **Completed:** 2026-09-01T08:07:35Z
- **Tasks:** 3 completed
- **Files modified:** 5 (2 created, 3 modified)

## Accomplishments
- Configuration now matches the signed copy on both contradictions (password rule, confirmation requirement) instead of the copy being wrong
- CPT-03's throttling exists using only Supabase's native rate limits, with no captcha and no new dependency
- CPT-02's Google provider block and CPT-07's private bucket are declared, with zero committed credentials
- Both Supabase Auth emails now arrive in French in the local mail collector, in the voice of `emails.json`
- `SUPABASE_SUPPORTS_BUCKET` is validated, defaulted configuration — `next build` cannot break on it

## Task Commits

1. **Task 1: Resolve both contradictions, tighten rate limits, declare Google and the private bucket** - `116f89d` (fix)
2. **Task 2: Francise the two Supabase Auth email templates** - `8750860` (feat)
3. **Task 3: Add the supports bucket name to the validated environment, close the green gates** - `51bf3bd` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified
- `supabase/config.toml` - password rule, confirmation flag, rate limits, Google provider, supports bucket, email template pointers, all six edits comment-annotated
- `supabase/templates/confirmation.html` - francised confirmation email, transcribed from `emails.json.confirmationInscription`
- `supabase/templates/recovery.html` - francised password-reset email, transcribed from `emails.json.reinitialisationMotDePasse`
- `src/lib/env/server.ts` - added `SUPABASE_SUPPORTS_BUCKET` (defaulted, not secret)
- `.env.example` - documented the new bucket var plus the CLI-only Google client id/secret (empty values, never committed)

## Decisions Made
- Followed the plan's six numbered config.toml edits exactly, each with its own decision-ID comment
- `{prenom}` interpolation dropped from both email templates in favor of the plain "Bonjour," form (no Go-template equivalent exists at confirmation/recovery time); documented as an HTML comment in each template, written to avoid the literal placeholder string so it doesn't trip the "unresolved placeholder" grep check
- Left `additional_redirect_urls` at `:162` completely unchanged except for the required comment (D-14) — confirmed by grep the exact original value survived

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Restored missing `node_modules` and `.env.local` in the worktree**
- **Found during:** Task 3 (green gates)
- **Issue:** This worktree had no `node_modules` (Turbopack's build failed with "Could not find the Next.js package") and no `.env.local` (Zod env validation threw at boot for `typecheck`/`build`). Neither is part of the git-tracked plan scope — both are gitignored/generated local state, not new dependencies.
- **Fix:** Ran `npm ci` (installs exactly what `package-lock.json` already specifies, zero new packages) to restore `node_modules`; copied the existing `.env.local` from the parent repo checkout (same file, git-ignored, already trusted local-stack credentials) into the worktree.
- **Files modified:** none tracked (node_modules and .env.local are both gitignored)
- **Verification:** `npm run typecheck`, `npm run lint`, `npm run build` all exit 0 afterward
- **Committed in:** not committed (gitignored, no tracked change)

---

**Total deviations:** 1 auto-fixed (1 blocking, worktree environment restoration only — no source change)
**Impact on plan:** No scope creep; this was local-environment setup required to run the plan's own verification commands, not a change to plan-scoped files.

## Issues Encountered
None beyond the deviation above.

## User Setup Required

None from this plan directly — however three items remain outside this seat's reach and are recorded in the plan's `<hosted_limits>`, not reported as green beyond local:
- **CPT-02** — Google OAuth client id/secret do not exist here; the provider block reads from environment variables that the CIO must provision on both hosted Supabase projects (Dashboard → Authentication → Providers → Google).
- **CPT-01 / CPT-03 on hosted** — Supabase's hosted mail sender needs custom SMTP with an authenticated domain, a CIO item (Dashboard → Project Settings → Authentication → SMTP Settings). Proven locally only, via the local mail collector.
- **CPT-07's bucket** — created locally by `[storage.buckets.supports]`; the hosted private bucket must be created by the CIO on both projects (Dashboard → Storage → New bucket, private).

## Next Phase Readiness
- The password rule, confirmation requirement, throttling, Google provider declaration and private bucket declaration are all in place locally for the sign-up/sign-in/reset plans (03-05..03-07) and the supports-access plan (03-08) to build on.
- Both Auth emails are proven French locally; local stack confirmed via Mailpit — subjects match `emails.json` exactly for both `confirmationInscription` and `reinitialisationMotDePasse`.
- `npm run typecheck`, `npm run lint`, `npm run build` all exit 0; `npm run content:check` still exits 1 with the unchanged baseline (`CADR-03: 72`, `CADR-01: 10`).
- No file under `src/app/globals.css`, `src/components/ui/` or `src/components/layout/` was touched.
- No blockers for the next wave; the three hosted CIO dependencies above remain open and are already tracked in `03-CONTEXT.md`'s `<hosted_dependencies>`.

---
*Phase: 03-comptes-connexion-et-espace-apprenant*
*Completed: 2026-09-01*
