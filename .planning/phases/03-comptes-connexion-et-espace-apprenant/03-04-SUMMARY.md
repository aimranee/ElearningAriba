---
phase: 03-comptes-connexion-et-espace-apprenant
plan: 04
subsystem: session-spine
tags: [supabase-ssr, middleware, next-middleware, route-handlers, auth]

# Dependency graph
requires:
  - phase: 03-comptes-connexion-et-espace-apprenant
    plan: "01"
    provides: "app.profil table, RLS, database.types.ts"
  - phase: 03-comptes-connexion-et-espace-apprenant
    plan: "02"
    provides: "auth config (password rule, confirmation, rate limits), SUPABASE_SUPPORTS_BUCKET env"
  - phase: 03-comptes-connexion-et-espace-apprenant
    plan: "03"
    provides: "espace.json nav.*/deconnexion keys, FOCUS_RING, Button component"
provides:
  - "src/middleware.ts: session-refresh middleware scoped to /espace via a positive matcher"
  - "src/lib/supabase/middleware.ts: inline anon-key Supabase client for the middleware runtime"
  - "src/lib/auth/session.ts: getLearner()/requireLearner() — the single session read for every /espace surface"
  - "src/app/api/auth/callback/route.ts: GET handler exchanging a confirmation code or verifying an OTP, with next-path open-redirect defence"
  - "src/app/api/auth/deconnexion/route.ts: POST-only sign-out, 303 redirect to /connexion"
  - "src/app/espace/layout.tsx + src/components/espace/espace-nav.tsx: session gate and local nav band"
affects: [03-05, 03-06, 03-07, 03-08, 03-09]

tech-stack:
  added: []
  patterns:
    - "Middleware Supabase client built inline from @supabase/ssr (no server-only import, no next/headers) — mirrors src/lib/supabase/server.ts's cookie adapter shape but writes to both request and response in the same pass"
    - "Positive matcher (['/espace', '/espace/:path*']) instead of a negative one, to make it structurally impossible for the matcher to opt a public route into dynamic rendering"
    - "getUser() not getSession() in the middleware — validates the token against the auth server rather than trusting the cookie"

key-files:
  created:
    - src/lib/supabase/middleware.ts
    - src/middleware.ts
    - src/lib/auth/session.ts
    - src/app/api/auth/callback/route.ts
    - src/app/api/auth/deconnexion/route.ts
    - src/app/espace/layout.tsx
    - src/components/espace/espace-nav.tsx
  modified: []

key-decisions:
  - "Learner type is `{ id: string } & Database['app']['Tables']['profil']['Row']` per plan spec — profil's Row has no id column (only utilisateur_id), so id is merged in from auth.getUser()"
  - "Callback route typed with NextRequest (not plain Request) so the redirect origin comes from request.nextUrl.origin, never a Host header read"
  - "espace/layout.tsx wraps EspaceNav + children in the same mx-auto max-w-5xl px-4 container espace/page.tsx already uses; page.tsx is untouched per plan instruction, so the container is nested (harmless duplicate width, not doubled padding beyond one extra px-4) — the plan names this the intended intermediate state, cleaned up when plan 03-08 touches page.tsx"

requirements-completed: []

metrics:
  duration: ~55min
  completed: 2026-09-01
---

# Phase 03 Plan 04: Session Spine Summary

**Built the Lot 3 session spine end to end: a positive-matcher middleware that refreshes the token on `/espace` only via `getUser()`, a single `requireLearner()` session read every espace surface will use, GET/POST auth route handlers for confirmation-or-OAuth callback and sign-out, and the `/espace` layout + local nav band that gates the whole space — closing the `server.ts:42` "No middleware exists yet (Lot 3)" comment.**

## Performance

- **Duration:** ~55 min
- **Tasks:** 3/3 completed
- **Files created:** 7

## Accomplishments

- `/espace` is now a real session gate: hitting it without a cookie returns a `307` to `/connexion` with zero leaked markup (verified live against a local `next start` build); every other route's rendering marker is unchanged except the two new `ƒ` route handlers and `/espace` itself flipping to `ƒ` (from `requireLearner()` reading cookies).
- `src/middleware.ts` uses `getUser()` (auth-server validated), never `getSession()` (cookie-trusting) — asserted both by grep and by the fact the redirect fires correctly.
- The middleware's Supabase client is built inline in `src/lib/supabase/middleware.ts`, carries no `server-only` import and never references `SUPABASE_SERVICE_ROLE_KEY` — confirmed by grep on both files.
- `/api/auth/callback` handles both the `code` (PKCE) and `token_hash`+`type` (OTP) shapes, validates `type` against the closed set `signup`/`recovery`/`email_change`, and refuses an off-origin `next` — proved live: `next=https://evil.test/`, `next=//evil.test`, and `next=/\evil.test` all redirect back to `localhost:3799`, never to `evil.test`.
- `/api/auth/deconnexion` is POST-only (`GET` returns `405`, verified live) and returns a `303` to `/connexion` whether or not a session cookie is present, since a failed sign-out on an already-invalid session must not surface an error.
- `espace-nav.tsx` renders the three nav links (`espace.nav.apercu/profil/donnees`) and a real `<form method="post">` sign-out — no `--primary` accent anywhere on the band, no hardcoded French string (every label resolves through `espace.json`).
- `espace/layout.tsx` calls `requireLearner()` before any markup, per D-27 — asserted by line-number ordering (`requireLearner` at line 8, the JSX `return (` at line 10).

## Task Commits

1. **Task 1: Middleware and the session read** - `3fb2959` (feat)
2. **Task 2: Callback and sign-out route handlers** - `ae1b328` (feat)
3. **Task 3: The espace layout and nav band** - `00f5422` (feat)

## Files Created

- `src/lib/supabase/middleware.ts` — inline anon-key Supabase client for the middleware runtime, cookie adapter writing onto both request and response
- `src/middleware.ts` — default export calling the helper + `getUser()`, positive matcher `["/espace", "/espace/:path*"]`
- `src/lib/auth/session.ts` — `getLearner()`/`requireLearner()`, the single session read for `/espace`
- `src/app/api/auth/callback/route.ts` — GET-only confirmation/OAuth landing point, open-redirect-safe `next` handling
- `src/app/api/auth/deconnexion/route.ts` — POST-only sign-out, 303 to `/connexion`
- `src/app/espace/layout.tsx` — session gate + nav band wrapper for every `/espace` surface
- `src/components/espace/espace-nav.tsx` — local nav band, `bg-muted`, three links + sign-out form

## Verification Performed

**Static (all green):**
- `npm run typecheck`, `npm run lint`, `npm run build` all exit `0` after every task.
- `npm run content:check` exits `1` with unchanged baseline totals `CADR-03: 72`, `CADR-01: 10`.
- Every plan-specified grep/node acceptance criterion passed (verb-export discipline, no `server-only`/`SUPABASE_SERVICE_ROLE_KEY` in middleware files, matcher shape, no `: any`/`as any`, derived row type, no hardcoded French string in the nav band, no accent colour on the nav band, `git diff` empty for `src/lib/supabase/{public,server,client}.ts`, `src/components/ui/`, `src/components/layout/`, `src/app/globals.css`, `src/app/espace/page.tsx`).
- Final `next build` route table (baseline `c124a82` had 13 `○` + 1 `ƒ /api/contact`): now `○` for `/`, `/_not-found`, `/a-propos`, `/agenda`, `/connexion`, `/contact`, `/formation`, `/inscription`, `/paiement`, `/programme`, `/programme.pdf`(unchanged, was already `ƒ`), `/reservation`; `ƒ` for `/api/auth/callback`, `/api/auth/deconnexion`, `/api/contact`, `/espace` — exactly the plan-specified delta.

**Live behavioural (against a temporary local `next start -p 3799` of this worktree's own build, torn down immediately after):**
- `GET /espace` (no cookie) → `307` to `/connexion`; body contains zero occurrences of `Votre espace apprenant`.
- `GET /api/auth/callback?code=invalid&next=https://evil.test/` (and the `//evil.test` and `/\evil.test` variants) → all three redirect to `http://localhost:3799/connexion?erreur=session`, never to `evil.test`.
- `GET /api/auth/deconnexion` → `405`.
- `POST /api/auth/deconnexion` (no cookie) → `303` to `/connexion`.
- Created and deleted a throwaway confirmed user (`e2e-lot3-04@example.test`) against the local Supabase auth admin API to exercise the password-grant token endpoint; not carried into a full authenticated-cookie round trip (see Known Limitation below).

## Known Limitation

The plan's full end-to-end authenticated-cookie test (sign in, capture the `@supabase/ssr` cookie jar, hit `/espace` and `/api/auth/deconnexion` with it, confirm the session is genuinely invalidated) requires either a browser-driven sign-in flow — which does not exist yet; the sign-in page is plan 03-06 — or hand-constructing Supabase's exact cookie encoding/chunking outside a browser client, which was judged too fragile to fabricate reliably in this session. What was proven instead: the unauthenticated path (redirect + zero markup), the open-redirect refusal, the verb refusal, and the unconditional 303 on sign-out. The session-write mechanics themselves (cookie adapter shape) mirror `src/lib/supabase/server.ts`'s already-proven pattern and are structurally identical to what plan 03-01's RLS work already establishes as correct. Plan 03-06, which builds the sign-in surface, is positioned to close this gap with a real browser-equivalent flow.

## Hosted / Cross-Plan Notes

Per the plan's own `<hosted_limits>`: the callback's OAuth (`code`) branch is written and typed correctly but cannot be exercised from this seat — the Google client id/secret are a CIO item (D-06), and `config.toml`'s `additional_redirect_urls` `https`/`http` mismatch (D-14) is plan 03-06's to resolve. **CPT-02 (Google sign-in) is unproven, not green** — only the email-confirmation branch, `next` validation, sign-out, and the session gate were locally verified.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Restored missing `node_modules` and created `.env.local`**
- **Found during:** pre-Task-1 environment check
- **Issue:** This worktree had neither `node_modules` nor `.env.local` — same class of issue every prior Lot 3 plan hit (see 03-01/03-02/03-03 summaries).
- **Fix:** `npm ci` against the unmodified lockfile; `.env.local` populated from the local Supabase stack's own `npx supabase status` output (well-known local demo credentials, not secrets). `RESEND_API_KEY` deliberately omitted (Zod's `.min(1).optional()` rejects an empty string).
- **Files modified:** none tracked (both gitignored).

**2. [Rule 1 - Bug] Removed a literal `server-only` string from a comment**
- **Found during:** Task 1 acceptance check
- **Issue:** The first draft's `why:` comment in `src/lib/supabase/middleware.ts` referenced the word "server-only" in prose, tripping the plan's `grep -c 'server-only'` acceptance criterion (expects `0`, was `1`) even though no actual `import "server-only"` existed.
- **Fix:** Reworded the comment to avoid the literal string while keeping the same explanation.
- **Files modified:** `src/lib/supabase/middleware.ts` (folded into the Task 1 commit, no separate commit).

---

**Total deviations:** 2 auto-fixed (1 Rule 3 environment restoration, 1 Rule 1 comment wording). No scope creep, no source-logic changes beyond the plan.

## Next Phase Readiness

- The session spine — middleware, `requireLearner()`, callback, sign-out, and the `/espace` gate — exists and is provably correct for the unauthenticated and cross-origin-attack paths.
- `/espace` still renders the Lot 1 placeholder page (`PRENOM_MAQUETTE`) — untouched per plan instruction — now behind a real session gate. Plan 03-08 owns removing that placeholder.
- Plan 03-06 (sign-in/Google OAuth) is the natural next consumer: it will exercise the callback's `code` branch for real and can close the full authenticated round-trip test this plan could not fabricate standalone.
- No file under `src/components/ui/`, `src/components/layout/`, `src/app/globals.css`, or `src/app/espace/page.tsx` was touched.

---
*Phase: 03-comptes-connexion-et-espace-apprenant*
*Completed: 2026-09-01*
