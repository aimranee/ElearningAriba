---
phase: 01-cadrage-contenus-et-design
plan: 06
subsystem: ui
tags: [react, tailwind, base-ui, class-variance-authority, design-system, accessibility]

# Dependency graph
requires:
  - phase: 01-cadrage-contenus-et-design
    provides: Message part and card variant (plan 01-05), Wave 2 design tokens in src/app/globals.css
provides:
  - Accordion family (Accordion, AccordionItem, AccordionHeader, AccordionTrigger, AccordionPanel) — fourth signed family, client-only stateful leaf
  - Form field family (Field, FieldLabel, FieldControl, FieldDescription, FieldError) — fifth signed family, incl. the server-rejected state
  - Input part reused by FieldControl
  - EmptyState family (EmptyState, EmptyStateIcon, EmptyStateTitle, EmptyStateDescription, EmptyStateAction) — the three remaining D-23 surface states
affects: [02-site-public, 03-comptes-et-espace-apprenant, 04-agenda, 07-paiement, back-office-lots]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Only the accordion carries \"use client\" — every other family stays server-importable"
    - "Field's data-rejected=\"server\" is a distinct ancestor-driven state (in-data-[rejected=server]:) from client-side aria-invalid"
    - "FieldError and EmptyStateDescription (error tone) both wrap the shared Message part instead of Base UI's own Field.Error, since no validation logic is wired yet (D-41)"
    - "EmptyState's three tones (neutral/waiting/error) share one context so EmptyStateDescription renders as Message only for the error tone"
    - "Native HTML attribute collisions (input's numeric size) are resolved with Omit<Primitive.Props, \"size\"> rather than renaming the variant"

key-files:
  created:
    - src/components/ui/accordion.tsx
    - src/components/ui/input.tsx
    - src/components/ui/field.tsx
    - src/components/ui/empty-state.tsx

key-decisions:
  - "FieldError renders the shared Message directly rather than wrapping Base UI's Field.Error primitive, because that primitive derives its displayed text from native validity/form-error state this Lot never wires — using it would have silently dropped the caller's prop text"
  - "EmptyState's error tone is threaded through React context so EmptyStateDescription can switch from a plain <p> to the shared Message (role=alert) without every call site repeating that branch"
  - "Omit<InputPrimitive.Props, \"size\"> / Omit<FieldPrimitive.Control.Props, \"size\"> resolve the native <input size> vs. cva size-variant collision without renaming the variant away from the family's size convention"

patterns-established:
  - "Ancestor-driven named states (data-rejected=\"server\") reuse the existing in-data-[...] idiom rather than inventing a new mechanism"

requirements-completed: [CADR-05]

# Metrics
duration: 35min
completed: 2026-08-29
---

# Phase 01 Plan 06: Accordion, Form Field and Surface States Summary

**All five signed component families are now closed — accordion (Base UI, client-only) and form field (with a distinct server-rejected state) complete the set, plus an EmptyState family covering the three remaining D-23 surface states (no slot, no booking, failed payment handoff).**

## Performance

- **Duration:** 35 min
- **Started:** 2026-08-29T12:01:00Z
- **Completed:** 2026-08-29T12:36:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- `Accordion` family: root/item/header/trigger/panel on `@base-ui/react/accordion`, full D-23 state set on the trigger, chevron rotates on the primitive's own `data-panel-open`, panel animates height/opacity on `--ease-brand`/`--duration-base` only
- `Input` part on `@base-ui/react/input` with the full D-23 state set, reused by `FieldControl` so the two never drift
- `Field` family on `@base-ui/react/field`: label/control/description/error plus a named `data-rejected="server"` state distinct from client-side `aria-invalid`
- `EmptyState` family composed on `Card variant="outline"`: three tones (`neutral`, `waiting`, `error`), the error tone renders the shared `Message` and sets `role="alert"` on the root

## Task Commits

1. **Task 1: The accordion family** - `089d21c` (feat)
2. **Task 2: The form field family, including the server-rejected state** - `e8de4c9` (feat), fixed by `c3cf6e8` (fix)
3. **Task 3: The three remaining surface states** - `784b170` (feat)

## Files Created/Modified
- `src/components/ui/accordion.tsx` - fourth signed family, client component
- `src/components/ui/input.tsx` - text control, reused by the field family
- `src/components/ui/field.tsx` - fifth signed family, incl. server-rejected state
- `src/components/ui/empty-state.tsx` - agenda/espace/payment-handoff surface states

## Decisions Made
- `FieldError` wraps the shared `Message` directly rather than Base UI's `Field.Error`, whose displayed text comes from native validity/form-error state — using it as specified would have discarded the caller's own error text since no validation is wired in this Lot (D-41)
- `EmptyState`'s tone is passed through a small React context so `EmptyStateDescription` alone decides whether to render a plain paragraph or the announced `Message`, keeping call sites uniform across tones
- Resolved the native `<input size>` vs. cva `size` variant collision with `Omit<Primitive.Props, "size">` at the two call sites (`Input`, `FieldControl`) instead of renaming the variant, keeping the family's existing `size` convention intact

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `size` variant collided with native `<input>` size attribute**
- **Found during:** Task 2 (`npm run typecheck`)
- **Issue:** `InputPrimitive.Props` and `FieldPrimitive.Control.Props` both extend the native `<input>` props, which include a numeric `size` attribute. Intersecting that with the cva `VariantProps<typeof inputVariants>` (`size: "default" | "sm"`) collapsed the prop's type to `never`, so `size="default"` failed to typecheck in both `Input` and `FieldControl`.
- **Fix:** Wrapped each primitive's prop type in `Omit<..., "size">` before intersecting with `VariantProps<typeof inputVariants>`.
- **Files modified:** `src/components/ui/input.tsx`, `src/components/ui/field.tsx`
- **Verification:** `npm run typecheck` exits 0; task 2's automated verify script re-run and still passes
- **Committed in:** `c3cf6e8` (fix)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary for the plan's own type gate to pass; no scope change, no behavior change from what the plan specified.

## Issues Encountered
- Worktree has no `node_modules` of its own; Node's module resolution walks up to the parent checkout's `node_modules` since the worktree is nested under it, so `npm run typecheck` still resolves all packages correctly.
- `next typegen` failed on missing Supabase env vars (git-ignored `.env.local` doesn't exist in a fresh worktree) — copied `.env.local` verbatim from the parent checkout (local Supabase CLI demo placeholders, not secrets), same fix already documented in the 01-05 summary. Not committed (git-ignored by design).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All five signed component families (`Button`, `Card`, `Badge`, `Accordion`, `Field`) exist as closed families with the full D-23 state set
- All four D-23 surface-level states exist as components: server-rejected field (`Field` + `data-rejected="server"`), agenda with no slot / espace with no booking (`EmptyState` tone `neutral`/`waiting`), failed payment handoff (`EmptyState` tone `error`)
- `grep -rn "@radix-ui\|dangerouslySetInnerHTML" src/` returns nothing
- `grep -rln "use client" src/` lists only `src/components/ui/accordion.tsx`
- `npm run typecheck` exits 0; nothing pushed

---
*Phase: 01-cadrage-contenus-et-design*
*Completed: 2026-08-29*

## Self-Check: PASSED

- FOUND: src/components/ui/accordion.tsx
- FOUND: src/components/ui/input.tsx
- FOUND: src/components/ui/field.tsx
- FOUND: src/components/ui/empty-state.tsx
- FOUND: 089d21c, e8de4c9, c3cf6e8, 784b170 (all present in git log)
