---
quick_id: 260831-cnx-connecteurs-assemblage-blanc-sur-violet
status: complete
---

# Summary

Third occurrence of the assembly card's color-on-same-color trap, this time
on the three hand-written connector cables: their gradient terminal stop and
comet fill both resolved to `var(--violet)`, matching the violet card's own
background at its left edge (contrast ratio 1.0 — invisible on arrival).

## Change

`src/components/motion/assembly-connectors.tsx`, one task, one commit:

- Each of the three gradients (`asm-w1`/`asm-w2`/`asm-w3`) now has three
  stops instead of two: `0%` = pastille accent color at `.9` opacity (was
  `.25`), `40%` = `var(--card)` (white token) at `.95` opacity — a new stop,
  placing the transition well before the card's measured left edge at ~50%
  of the path's bounding box — and `100%` = `var(--card)` at `.95` (was
  `var(--violet)` at `.95`).
- Comet `fill` changed from `var(--violet)` to `var(--card)`.
- `strokeWidth` raised from `"1.6"` to `"2"`.
- Untouched: path coordinates, SVG `z-[2]`, stroke-dasharray trace logic,
  stagger timing, comet motion/opacity toggling, `--ease-brand`, and the
  `prefers-reduced-motion` branch.

`var(--card)` is `#ffffff` in `globals.css` (`:root`) — no raw hex added to
the component.

## Verification

- `npm run lint` — 0 errors.
- `npm run typecheck` — 0 errors.
- `npm run build` — 0 errors; same 14-route shape (13 static, `/api/contact`
  dynamic) as before this change.
- Asserted from source, not a browser: all three gradients carry the
  0%/40%/100% stops with the colors/opacities above; comet `fill="var(--card)"`;
  `strokeWidth="2"`. No browser tool was available this run — visual
  confirmation on the rendered page is left to the CTO, per the task's own
  instruction.

## Commit

`#fix: keep assembly connector cables white on violet card, thicken stroke`
— one atomic commit, nothing pushed (stays on `gsd/phase-02-site-public`).
