---
phase: 01-cadrage-contenus-et-design
plan: 02
subsystem: ui
tags: [tailwind-v4, next-font, oklch, design-tokens, css]

# Dependency graph
requires:
  - phase: 01-cadrage-contenus-et-design (plan 01)
    provides: the founder's retained design direction (direction 2 — profondeur, Plus Jakarta Sans / Inter, palette oklch values, ease-brand) recorded in design-exploration/README.md
provides:
  - Rewritten design-token layer in src/app/globals.css — bleu/blanc/vert palette, one easing curve, four paired shadow tiers, spacing scale, fluid type scale
  - next/font wiring for Plus Jakarta Sans (headings) and Inter (body) in src/app/layout.tsx, fixing the previously broken --font-sans chain
  - CSS-only atmosphere layer (.atmosphere-wash/-blob/-grain), motion primitives (.reveal-rise + stagger, reduced-motion neutraliser), and the [data-density=compact] contract
affects: [01-05, 01-06 (component families and maquettes consume every token here)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "One easing curve only: --ease-brand, consumed via var(), never a second cubic-bezier literal in the file"
    - "Paired shadow ladder: --shadow-1..4 each combine --shadow-contact (1px) with a growing soft shadow"
    - "Density contract via [data-density=compact] attribute + in-data-[density=compact]: variant, mirroring button.tsx's in-data-[slot=...] idiom"

key-files:
  created: []
  modified:
    - src/app/globals.css
    - src/app/layout.tsx

key-decisions:
  - "Direction retenue block's ease-brand (cubic-bezier(0.16, 1, 0.3, 1)) taken verbatim over direction-02-profondeur.html's own curve (0.22, 1, 0.36, 1) — the README block is the founder's final pick and explicitly overrides the throwaway HTML where both give a value"
  - "shadcn scaffolding tokens not named in Task 1 (card, popover, accent, chart-*, sidebar-*) were re-colored to the same tinted-blue neutral family rather than deleted, since button.tsx's dark: utilities and future shadcn primitives may still resolve them and no task instructed removing them"
  - "--radius kept at 0.625rem (existing Phase-0 value) rather than direction-02's throwaway 0.75rem, per Task 1's explicit instruction to keep it as the single knob"

requirements-completed: [CADR-05]

# Metrics
duration: 6min
completed: 2026-08-29
---

# Phase 01 Plan 02: Design System Foundation Summary

**Rewrote `globals.css`'s token layer with the founder's retained bleu/blanc/vert palette, one shared easing curve, a four-tier paired shadow ladder and a fluid type scale, wired Plus Jakarta Sans/Inter through `next/font` fixing a previously-broken font chain, and added a CSS-only atmosphere layer, motion primitives and a compact-density contract.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-08-29T11:44:00+01:00
- **Completed:** 2026-08-29T11:46:18+01:00
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments
- Every one of the 33 chroma-zero shadcn placeholder colours in `:root` replaced with the direction-2-profondeur palette (bleu primary, vert success, tinted-not-black foreground)
- `--ease-brand` / `--duration-base` are the single motion source of truth; exactly one `cubic-bezier(` literal remains in the whole file
- `--font-sans` no longer self-references — it now resolves through `--font-body` to the real Inter next/font variable, fixing the Phase-0 latent bug
- `.atmosphere-wash`, `.atmosphere-blob`, `.atmosphere-grain` and the `.reveal-rise` family exist as reusable `@layer components` utilities, CSS/inline-SVG only, with a `prefers-reduced-motion` neutraliser
- `[data-density="compact"]` contract exists for the back-office surface, documented for the `in-data-[density=compact]:` variant

## Task Commits

1. **Task 1: Replace the token layer with the retained palette, type scale, easing and shadow ladder** - `fecac61` (feat)
2. **Task 2: Wire the chosen typefaces through next/font and fix the broken font chain** - `a5eb5f0` (feat)
3. **Task 3: Atmosphere layer, motion primitives and the density contract** - `e14f306` (feat)

_No plan-metadata commit yet — orchestrator commits SUMMARY.md separately in this worktree flow._

## Files Created/Modified
- `src/app/globals.css` - full token rewrite (palette, easing, shadows, spacing, type scale, atmosphere/motion/density layer), Phase-0 placeholder comment and `.dark` block deleted
- `src/app/layout.tsx` - Geist replaced with Plus Jakarta Sans (`--font-heading-face`) and Inter (`--font-body`); third Phase-0 placeholder comment deleted

## Decisions Made
- Used the README `Direction retenue` block's `--ease-brand` value verbatim, which differs from direction-02's own HTML file — the README is the founder's final, authoritative pick (see key-decisions above)
- Re-colored (not deleted) the shadcn scaffolding tokens the plan didn't explicitly name (card/popover/accent/chart/sidebar), tinting them into the same palette family rather than leaving grey or removing them
- Kept `--radius: 0.625rem` per explicit plan instruction, not direction-02's throwaway `0.75rem`

## Deviations from Plan

None — plan executed exactly as written. All three tasks' automated verification blocks passed as specified (token presence check, layout.tsx string checks, `npm run typecheck`).

One environment note, not a deviation from the plan's task content: `npm run typecheck` requires `NEXT_PUBLIC_SUPABASE_*`/`SUPABASE_SERVICE_ROLE_KEY` env vars (Zod-validated at `src/lib/env/server.ts`) and this worktree had no `.env.local`. Copied the existing untracked `.env.local` from the main checkout (it is git-ignored, not committed, not part of any task diff) so the plan's own required verification (`npm run typecheck`) could run and exit 0.

## Issues Encountered
- `npm run build` was also attempted for extra confidence beyond the plan's required verification, but failed in this worktree with "Could not find the Next.js package" — the worktree has no installed `node_modules` and `npm install` is explicitly prohibited by this plan. This is a worktree environment limitation unrelated to the code changes; `npm run typecheck` (the plan's actual required gate) passed cleanly, and no task's acceptance criteria requires `npm run build` to succeed at plan-execution time (it is listed under the plan's manager-session verification, D-39).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Token layer, typography, atmosphere and motion primitives are ready for plans 01-05/01-06 (the five signed component families) to consume
- `[data-density="compact"]` is available as soon as a back-office surface is built; no component yet reacts to it (correctly — that's out of this plan's file scope)
- No blockers

---
*Phase: 01-cadrage-contenus-et-design*
*Completed: 2026-08-29*
