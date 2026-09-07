---
phase: 02-site-public
plan: 03
subsystem: ui
tags: [atmosphere, motion, client-islands, intersection-observer, raf-throttling]

requires:
  - phase: 02-site-public
    plan: 01
    provides: --ease-brand token, --shadow-brand, floating card/button variants the atmosphere and reveal primitives sit alongside
provides:
  - Single root-mounted atmosphere layer (.bg-fixed/.mesh-layer/.mesh/.grid-fade) replacing the two per-section Lot 1 mounts
  - Cursor-driven mesh drift through exactly one rAF-throttled window mousemove listener, reduced-motion aware
  - .reveal/.reveal.in/.reveal[data-d] CSS primitives at the maquette's 34px/1s/.09s-step values
  - RevealScope IntersectionObserver island + Reveal server-safe wrapper, mounted once in layout.tsx
affects: [02-05-hero, 02-09-landing-sections, 02-10-landing-sections]

tech-stack:
  added: []
  patterns:
    - "Client-island discipline extended beyond accordion.tsx: 'use client' + a why comment + one useEffect with explicit cleanup + a matchMedia(prefers-reduced-motion) early return/branch"
    - "Root-mount composition: atmosphere and motion scopes mount once in layout.tsx as the first children of body, never per-section"

key-files:
  created:
    - src/components/atmosphere/atmosphere-layer.tsx
    - src/components/atmosphere/mesh-drift.tsx
    - src/components/motion/reveal.tsx
  modified:
    - src/app/globals.css
    - src/app/layout.tsx

key-decisions:
  - "grid-fade rendered as a sibling of bg-fixed (not nested inside it), matching the maquette's top-level markup order rather than the plan prose's ambiguous 'followed by a sibling' phrasing read literally"
  - "Reveal wrapper uses cn() from src/lib/utils.ts (the repo's existing cva/cn idiom) instead of a manual className join"

requirements-completed: []

duration: 22min
completed: 2026-08-30
---

# Phase 2 Plan 3: Root atmosphere layer and reveal-on-scroll island Summary

**One fixed atmosphere layer (four blurred meshes drifting with the cursor through a single rAF-throttled listener, plus a grid-fade) mounted once at the root, and an IntersectionObserver reveal island — both reduced-motion aware, neither turning a route into a client component.**

## Performance

- **Duration:** 22 min
- **Tasks:** 3
- **Files modified:** 5 (2 modified, 3 created)

## Accomplishments

- Replaced the Lot 1 `.atmosphere-blob`/`.atmosphere-wash`/`.atmosphere-grain`/`.reveal-rise` CSS with the maquette's `.bg-fixed`/`.mesh-layer`/`.mesh`/`@keyframes m1-m4`/`.grid-fade`/`.reveal` primitives, all on the single `var(--ease-brand)` curve, with a reduced-motion block that now also disables `.mesh` and forces `.reveal` visible
- Built `AtmosphereLayer` as a server component rendering the four positioned meshes and grid-fade at the maquette's exact geometry, `aria-hidden`, with a `data-slot="mesh-layer"` hook
- Built `MeshDrift`, a client island with one `window` `mousemove` listener (`{ passive: true }`), rAF-throttled via a `pending` boolean, computing `+/-34px` translate offsets, with a `matchMedia("(prefers-reduced-motion: reduce)")` early return and full listener + rAF cleanup
- Mounted `AtmosphereLayer` and `MeshDrift` as the first two children of `<body>` in `layout.tsx`, before the skip link — the single root mount point (D-20/AC-3)
- Built `RevealScope`, an IntersectionObserver island (`threshold: 0.12`, `rootMargin: "0px 0px -8% 0px"`) that adds `.in` and unobserves on intersection, with a reduced-motion branch that adds `.in` to every `.reveal` synchronously instead of observing
- Built `Reveal`, a server-safe polymorphic wrapper (`as` prop, `data-d` 1-5) with no hooks, so any Server Component section can use it without becoming a client component
- Mounted `RevealScope` in `layout.tsx` beside `MeshDrift`

## Task Commits

1. **Task 1: Rewrite the atmosphere and reveal CSS to the maquette's values** - `22e80de` (feat)
2. **Task 2: Build the root atmosphere layer and its cursor drift island** - `e1cbfbc` (feat)
3. **Task 3: Build the reveal-on-scroll island** - `a388e01` (feat)

## Files Created/Modified

- `src/app/globals.css` - mesh/grid-fade/reveal primitives replacing the superseded Lot 1 atmosphere and reveal classes
- `src/components/atmosphere/atmosphere-layer.tsx` (created) - server-rendered atmosphere markup, single mount point
- `src/components/atmosphere/mesh-drift.tsx` (created) - rAF-throttled cursor drift client island
- `src/components/motion/reveal.tsx` (created) - `RevealScope` IntersectionObserver island + `Reveal` server-safe wrapper
- `src/app/layout.tsx` - mounts `AtmosphereLayer`, `MeshDrift`, `RevealScope` as the first three children of `<body>`

## Decisions Made

- `grid-fade` placed as a sibling of `bg-fixed`, matching the maquette's literal markup (`<div class="bg-fixed">...</div><div class="grid-fade">`), since a strictly nested reading would have diverged from the founder-validated maquette without a stated reason
- `Reveal`'s className composition uses the repo's existing `cn()` utility rather than inventing a second joining approach

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree branch was stale relative to the plan's expected base commit**
- **Found during:** Setup, before Task 1
- **Issue:** The worktree's `worktree-agent-*` branch was at `27ab022` (Phase 0 merge), while the plan's expected base was `d2e3b93` (tip of `gsd/phase-02-site-public`, including 02-01's completed work). `src/app/globals.css` on disk was the raw shadcn placeholder, not 02-01's violet palette.
- **Fix:** Verified `27ab022` is an ancestor of `d2e3b93` and the worktree was clean, then `git reset --hard d2e3b93ac8ec10ac86a6f63ddd32002602f23ff8` per the plan's stated expected base commit — no protected-ref rewrite, no destructive loss (fast-forward-equivalent onto the correct lineage).
- **Files modified:** none (branch pointer only)
- **Verification:** `git log --oneline -5` showed the expected 02-01/02-02 history; `src/app/globals.css` matched the 02-01 summary's palette
- **Committed in:** N/A (pre-task setup, no file changes)

**2. [Rule 3 - Blocking] Worktree had no `node_modules` and no `.env.local`**
- **Found during:** Task 1 verification (`npm run build`)
- **Issue:** Fresh worktree checkout carried no installed dependencies and no local env file, both required for `next build` to run and for `serverEnv`'s Zod validation to pass
- **Fix:** Ran `npm install` (existing lockfile, no new packages) and copied the main checkout's gitignored `.env.local` into the worktree
- **Files modified:** none tracked (`.env.local` is gitignored; `package-lock.json` drift from an unrelated Node engine-string mismatch was reverted with `git checkout -- package-lock.json`, out of this plan's scope)
- **Verification:** `npm run build` exits 0
- **Committed in:** N/A (untracked/reverted, no commit)

---

**Total deviations:** 2 auto-fixed (both environment/setup blockers, zero source-code deviations from the plan's literal instructions)
**Impact on plan:** None on the shipped code — both fixes were required to run verification at all and left no trace in the commit history.

## Verification Notes

Two of the plan's own acceptance-criteria grep commands produce expected false positives and were verified by inspection instead of literal exit code:
- `grep -n "ease-in-out\|ease-in \|ease-out\| linear" src/app/globals.css` matches `.grid-fade`'s `linear-gradient(...)` calls (the space before `linear-gradient` satisfies `" linear"`), not a second easing/timing keyword — no bare `linear` or `ease-*` timing function exists in the file.
- `grep -rln "bg-fixed" src/` and the `mesh-layer` count both include `src/app/globals.css` itself (the CSS class definitions), which the plan's literal wording ("exactly one file" / "at most 2") did not account for. The markup/JS usage is confined to exactly the atmosphere layer and drift island as intended.

## Issues Encountered

None beyond the two setup deviations above.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- The atmosphere and reveal primitives exist and are mounted once at the root; no section anywhere else may mount them
- Plan 02-05 (hero) can add the hero spotlight, the second and last permitted pointer listener
- Plans 02-09/02-10 own wrapping actual landing-section markup in `Reveal` with `data-d` staggers — this plan only built the primitive, no section content was touched
- `.reveal-rise`/`.reveal-delay-*` classes were deleted from `globals.css`; five files (`src/app/a-propos/page.tsx`, `src/app/contact/page.tsx`, `src/app/formation/page.tsx`, `src/app/programme/page.tsx`, `src/components/sections/hero.tsx`) still reference the now-inert `reveal-rise` className. This is out of this plan's `files_modified` scope (those pages are owned by later plans) and does not break the build — the className simply no longer matches a CSS rule. Logged here so 02-05/02-09/02-10 know to replace `reveal-rise` with `Reveal`/`.reveal` rather than treat it as dead code to ignore.

## Unresolved questions

None.

## Self-Check: PASSED

All three created files exist on disk; `git log --oneline -5` shows commits `22e80de`, `e1cbfbc`, `a388e01` present in the worktree branch history; `npm run build` exits 0 with all twelve routes listed `○ (Static)`.

---
*Phase: 02-site-public*
*Completed: 2026-08-30*
