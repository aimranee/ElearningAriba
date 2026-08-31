---
status: complete
---

# Quick Task 260831-myt: Hero assembly connectors — z-index + coordinate fix

**Date:** 2026-08-31

## What shipped

1. `src/components/motion/assembly-connectors.tsx`
   - `PATHS` re-anchored: start `x=40` → `x=44.6` (pastille right edge, measured at 1440px), end `x=66` → `x=52` (violet card left edge, measured at 1440px). Y ordinates (18/50/82) unchanged — already correct.
   - Control points scaled proportionally to the new, much shorter span so curve shape stays consistent with the original.
   - SVG `className` `z-0` → `z-[2]`, above the violet card and pills (`z-[1]`) so the connectors terminate visibly on the card edge.
   - Header comment updated to record the 2026-08-31 re-anchor and reaffirm the 2026-08-28 "never computed, never resize-recomputed" decision.
2. `src/components/sections/hero.tsx`
   - Removed the white progress-bar `div`/`span` under the assembly card's module/hours summary (always rendered at 100%, measured nothing). Folded its bottom margin into the summary line to preserve spacing.

## Unchanged (per spec)

- Progressive trace, comet, per-path stagger, `prefers-reduced-motion` behavior (complete static curves, no comet) — all untouched in `assembly-connectors.tsx`'s `useEffect`.
- Green certification check in the violet card — untouched.
- `--ease-brand` remains the only easing curve used.

## Verification performed (no browser available)

- `npm run lint` — 0.
- `npm run typecheck` — 0.
- `npm run build` — 0, 14 routes listed (13 static `○` + `/api/contact` dynamic `ƒ`, matching pre-fix route count).
- `.next/server/app/index.html` (prerendered `/`): confirmed `z-[2]` present on the connectors SVG, confirmed the new path `d` coordinates (`M44.6 18…`, `M44.6 50…`, `M44.6 82…`) are in the markup, confirmed no `bg-white/24` / bar `span` remains.
- No new raw hex added; no hardcoded visible strings added.

**Not verified (no browser in this session):** actual rendered appearance at 1440px — CTO to confirm visually per the task's own instruction.

## Commits (local only, nothing pushed)

- `f274323` — `#fix: re-anchor hero assembly connectors on measured pastille/card edges, raise above card z-index`
- `1ce1553` — `#fix: remove obsolete white progress bar from hero assembly card`
