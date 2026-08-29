---
phase: 01-cadrage-contenus-et-design
plan: 05
subsystem: ui
tags: [react, tailwind, base-ui, class-variance-authority, design-system]

# Dependency graph
requires:
  - phase: 01-cadrage-contenus-et-design
    provides: Wave 2 design tokens in src/app/globals.css (colours, shadow ladder, easing, density contract)
provides:
  - Message part (error/success/info, role=alert on error) shared by every family's error state
  - Badge family (default/success/outline/muted/destructive) with full D-23 state set
  - Card family (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardSkeleton) with full D-23 state set
  - Button extended with a success variant, contrasted shadow states, a data-loading state, and density
affects: [02-site-public, 03-comptes-et-espace-apprenant, 04-agenda, back-office-lots]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "data-loading attribute (not a boolean prop) is the loading-state API across button/card/badge"
    - "data-[interactive=true]: gates hover/active on otherwise-static components (badge, card)"
    - "in-data-[density=compact]: reused from button.tsx across card/badge/message for the two-density contract"

key-files:
  created:
    - src/components/ui/message.tsx
    - src/components/ui/badge.tsx
    - src/components/ui/card.tsx
  modified:
    - src/components/ui/button.tsx

key-decisions:
  - "Message renders two literal JSX branches (error vs non-error) instead of a dynamic role attribute, so role=\"alert\" is statically greppable and unambiguous"
  - "Copied .env.local from the parent checkout into the worktree (Supabase local-stack demo placeholders, not secrets) — required for next typegen/typecheck to resolve; worktrees don't inherit gitignored files"

patterns-established:
  - "Shared error-with-message state: every family pairs with <Message variant=\"error\"> at the call site rather than duplicating alert markup"

requirements-completed: [CADR-05]

# Metrics
duration: 25min
completed: 2026-08-29
---

# Phase 01 Plan 05: Component Families (Message, Badge, Card, Button) Summary

**Three of five signed component families (CTA button, card, badge) plus the shared Message part now carry the full D-23 state set — default, hover, focus-visible, active, disabled, loading, error-with-message — sourced entirely from Wave 2 tokens.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-08-29T10:27:00Z
- **Completed:** 2026-08-29T10:52:13Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- `Message` part: shared error/success/info text, `role="alert"` + `aria-live="polite"` on the error variant
- `Badge` family: 5 variants, interactive-gated hover/active, loading, density
- `Card` family: 7 parts (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardSkeleton`), 5 variants, interactive/disabled/loading/error/density states
- `Button` extended in place: added `success` variant, contrasted shadow ladder (rest/hover/active), `data-loading` state with a `button-spinner` slot, density — without touching any existing variant, size, or export

## Task Commits

1. **Task 1: The Message part and the badge family** - `62155b2` (feat)
2. **Task 2: The card family with its parts and states** - `d022cb0` (feat)
3. **Task 3: Extend the CTA button to the full signed state set** - `859c36e` (feat)

## Files Created/Modified
- `src/components/ui/message.tsx` - shared error/success/info text part with `role="alert"`
- `src/components/ui/badge.tsx` - badge family, full D-23 state set
- `src/components/ui/card.tsx` - card family with 7 parts, full D-23 state set
- `src/components/ui/button.tsx` - added `success` variant, shadow contrast, loading, density

## Decisions Made
- `Message`'s error/non-error branches are two literal JSX returns (not a ternary on `role`), so `role="alert"` is a static, greppable string rather than a computed value — matches the plan's verification approach and keeps the attribute auditable
- Copied `.env.local` (local Supabase demo placeholders, not real secrets) from the parent checkout into this worktree — worktrees don't carry gitignored files, and `next typegen`/`typecheck` fail without env vars present. No production secret involved.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing `.env.local` in worktree blocked `npm run typecheck`**
- **Found during:** Task 3 (`npm run typecheck` verification)
- **Issue:** `next typegen` throws a Zod validation error for `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` — the worktree has no `.env.local` because it's git-ignored and worktrees don't copy untracked files
- **Fix:** Copied `.env.local` verbatim from the parent checkout (local Supabase CLI demo placeholder values — publicly known demo JWTs, not project secrets)
- **Files modified:** `.env.local` (git-ignored, not committed)
- **Verification:** `npm run typecheck` then exits 0
- **Committed in:** not committed (git-ignored by design)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required to run the plan's own type gate; no code or scope change.

## Issues Encountered
- `npm run build` fails in this worktree with a Turbopack "Could not find the Next.js package" error — this is a worktree-specific `node_modules` resolution issue (the worktree's filesystem root doesn't see `next` the way the main checkout does), unrelated to any file this plan touched. The plan's only mandated gate is `npm run typecheck`, which passes. Modifying `next.config.ts` to work around it is explicitly forbidden by this plan's threat model. Deferred — likely resolves once this worktree is merged back into the main checkout, where `node_modules` is shared.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Three of five signed families (button, card, badge) plus the Message part are closed contracts; the remaining two families (whatever Wave 2's sibling plan covers) can now reuse the same `Message`/token/state idioms
- `grep -rn "@radix-ui" src/` and `grep -rn "cubic-bezier" src/components/` both return empty
- `npm run typecheck` exits 0

---
*Phase: 01-cadrage-contenus-et-design*
*Completed: 2026-08-29*

## Self-Check: PASSED

- FOUND: src/components/ui/message.tsx
- FOUND: src/components/ui/badge.tsx
- FOUND: src/components/ui/card.tsx
- FOUND: src/components/ui/button.tsx
- FOUND: 62155b2, d022cb0, 859c36e, 5561a3f (all present in git log)
