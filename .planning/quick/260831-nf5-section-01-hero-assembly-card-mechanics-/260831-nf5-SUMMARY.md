---
phase: quick
plan: 260831-nf5
subsystem: ui
tags: [nextjs, react, tailwind, motion, i18n]

requires:
  - phase: quick/260831-n81
    provides: hero assembly card mobile grid (min-w-0, hidden connectors <640px)
provides:
  - AssemblyCard client island: 5-module carousel, honest progress bar, 3-row checklist
  - Connector cables terminating on a static node before the card edge
affects: [hero section, section-01 landing follow-ups]

tech-stack:
  added: []
  patterns:
    - "Height-locked carousel via hidden sizer + document.fonts.ready + debounced resize (mirrors typewriter.tsx's width-lock)"
    - "IntersectionObserver-driven one-shot validation, decoupled from an independently looping setInterval carousel"

key-files:
  created:
    - src/components/motion/assembly-card.tsx
  modified:
    - src/locales/fr/common.json
    - src/components/sections/hero.tsx
    - src/components/motion/assembly-connectors.tsx

key-decisions:
  - "Renamed local `module` variables to `mod` in assembly-card.tsx — Next.js's no-assign-module-variable lint rule flags any assignment to a variable literally named `module` (reserved for CommonJS module scope)"
  - "Left `linear-gradient(...)` occurrences in hero.tsx (ASM_PILL_GRADIENTS, pre-existing, untouched) — these are CSS gradient function calls, not the banned `linear` transition-timing-function keyword; confirmed via diff that no easing tokens were introduced or remain in the touched files' transition/animation properties"

requirements-completed: []

duration: 25min
completed: 2026-08-31
---

# Quick Task 260831-nf5: Section 01 Hero Assembly Card Mechanics Summary

**Hero's violet result card now runs a real 5-module carousel (height-locked title, honest `module.position`-driven progress bar, "Module N sur 5" label) plus a 3-row checklist that validates once on viewport entry — all in one new client island, `AssemblyCard`, decoupled from an also-updated connector-cable component whose cables now terminate on a small static node just before the card instead of crossing onto it.**

## Performance

- **Duration:** ~25 min
- **Tasks:** 4 (3 code tasks + 1 full verification chain)
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments
- New `AssemblyCard` client island: single `useEffect`, refs-only DOM writes, `matchMedia` reduced-motion check once at mount, height-locked title box (hidden sizer, `document.fonts.ready`, 180ms-debounced resize), 3.2s interval carousel fading via `--ease-brand` only, and a one-shot `IntersectionObserver` (threshold 0.3, disconnects immediately) that staggers the 3 checklist rows ~260ms apart independently of the looping carousel
- Two new locale templates (`assemblage.moduleLigne`, `assemblage.progression`) replace the removed `resume`/`certification` keys; `hero.tsx` now renders `<AssemblyCard>` with modules/templates/pills as props, stays a server component
- `assembly-connectors.tsx` cables shortened to straight `x=44.6 → x=47.8` runs, solid single accent color end to end (no more `<linearGradient>`/`var(--card)` crossing trick), each terminating on a small filled `<circle>` node; comet recolored to match its cable; dropped the now-unneeded `z-[2]` since cables no longer need to render above the card's content

## Task Commits

Each task was committed atomically:

1. **Task 1: Locale keys + new client island** - `6f4f1bf` (feat)
2. **Task 2: Wire AssemblyCard into hero.tsx** - `6fa2823` (feat)
3. **Task 3: Cables terminate on a node, drop white-crossing gradient** - `ca60047` (fix)
4. **Task 4: Full verification chain** - no source changes; verification only. One follow-up commit landed inside Task 1's file scope after `npm run lint` caught an issue not visible to `tsc --noEmit`: `d7e5269` (fix)

## Files Created/Modified
- `src/components/motion/assembly-card.tsx` - New client island: carousel, progress bar, checklist
- `src/locales/fr/common.json` - `assemblage.moduleLigne`/`assemblage.progression` replace `resume`/`certification`
- `src/components/sections/hero.tsx` - Renders `<AssemblyCard>`, dead `resume` computation removed
- `src/components/motion/assembly-connectors.tsx` - Cables terminate on a node, solid accent color, no gradient crossing

## Decisions Made
- `module` as a local variable name is invalid in this codebase's lint config (`@next/next/no-assign-module-variable`) — renamed to `mod` at both call sites flagged by ESLint (Task 1's file, caught during Task 4's `npm run lint`)
- Treated `linear-gradient(...)` (CSS function, pre-existing in `hero.tsx`, unrelated to this plan's scope) as distinct from the banned `linear` easing keyword when running the negative easing-token scan — confirmed no transition/animation property in any touched file uses `linear`, `ease-in`, `ease-out`, or `ease-in-out`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Renamed `module` locals in assembly-card.tsx to `mod`**
- **Found during:** Task 4 (`npm run lint`)
- **Issue:** `npx tsc --noEmit` (Tasks 1-3's own verification) doesn't catch ESLint rules; `npm run lint` in Task 4 failed with `@next/next/no-assign-module-variable` on two `const module = ...` / `for (const module of ...)` assignments
- **Fix:** Renamed both locals to `mod`; all call sites within the same scope updated
- **Files modified:** `src/components/motion/assembly-card.tsx`
- **Verification:** `npm run lint` and `npx tsc --noEmit` both clean afterward
- **Committed in:** `d7e5269`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Pure lint-rule compliance fix, no behavior change. No scope creep.

## Issues Encountered
None beyond the lint fix above.

## User Setup Required
None - no external service configuration required.

## Verification Evidence (Task 4)

- `npm run lint` — 0 errors (after the `module` rename fix)
- `npm run typecheck` — clean (`next typegen && tsc --noEmit`)
- `npm run build` — 14 routes reported: `/`, `/_not-found`, `/a-propos`, `/agenda`, `/api/contact` (dynamic), `/connexion`, `/contact`, `/espace`, `/formation`, `/inscription`, `/paiement`, `/programme`, `/programme.pdf`, `/reservation` — same static/dynamic split as before this plan
- `.next/server/app/index.html` (prerendered) contains the first module's title ("Découverte de l'écosystème Ariba") and all three checklist labels ("Appel découverte", "Session live", "Support PDF") as rendered content — verified by direct string search on the build artifact, not a source grep
- Zero occurrences of `ease-in`, `ease-out`, `ease-in-out` across the four touched files; the only `linear` substring matches are pre-existing `linear-gradient(...)` CSS function calls in `hero.tsx` (`ASM_PILL_GRADIENTS`), untouched by this plan and not a transition-timing-function usage
- `git diff` across all four touched files' full changeset shows no new raw hex color introduced
- `assembly-connectors.tsx` carries zero `var(--card)` occurrences and zero `<linearGradient>`/`<defs>` blocks

**Not verified this run (no browser available):** `setInterval`/`IntersectionObserver` cleanup correctness is established by `tsc --noEmit`/`next build` passing plus code review of Task 1's `useEffect` return (interval cleared, all tracked `setTimeout` handles cleared, observer disconnected if not already self-disconnected) — not by a source grep, per the plan's own instruction. 1440px/375px pixel-level review (node position relative to the card edge, dimmed-row contrast on `--violet`/`--indigo`, absence of layout shift on module change) is explicitly left to the CTO after this run.

## Next Phase Readiness
- Hero section's assembly card now has real per-module mechanics (carousel, progress, checklist) instead of a static summary line
- Connector cables no longer rely on a color-survival trick to cross onto the card — third contrast-trap category on this card (after the pastille and console fixes) structurally closed by removing the crossing itself
- Pending: human visual confirmation at 1440px/375px (node placement, dimmed-row contrast, carousel CLS) — batched into the founder's plan 02-11 review per existing STATE.md convention for this section

---
*Quick task: 260831-nf5*
*Completed: 2026-08-31*
