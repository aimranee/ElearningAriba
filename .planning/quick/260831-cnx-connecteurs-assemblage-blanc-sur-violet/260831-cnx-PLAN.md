---
quick_id: 260831-cnx-connecteurs-assemblage-blanc-sur-violet
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/motion/assembly-connectors.tsx
autonomous: true
requirements: []
---

<objective>
Third occurrence of the same contrast trap in the hero assembly card: the
three connector cables' gradient terminal stop and the comet both resolve to
`var(--violet)`, identical to the violet card's left-edge background color
(`rgb(99,91,255)`) — contrast ratio 1.0, invisible on arrival.
</objective>

<context>
Measured 2026-08-31 on the rendered page: geometry fix from the prior run
(SVG `z-[2]` above the card's `z-[1]`, paths x=44.6→52) is correct and
untouched. Card left edge sits at x≈48.3 on that 44.6→52 span (≈50% of each
path's gradient bounding box). The failure is purely color: gradient stop
`offset="100%"` and comet `fill` both read `var(--violet)`, same RGB as the
card background at its left edge.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Swap terminal stop + comet to white, add mid-course transition stop, thicken stroke</name>
  <files>src/components/motion/assembly-connectors.tsx</files>
  <action>
For each of the three `linearGradient`s (`asm-w1`, `asm-w2`, `asm-w3`):
- Keep `offset="0%"` on the pastille accent color (`path.from` — `var(--violet)`/`var(--amber)`/`var(--mint)`), raise `stopOpacity` from `.25` to `.9` for readability against the light background at the start of the run.
- Add `offset="40%"` stop at `var(--card)` (the project's white token, `#ffffff` in globals.css), `stopOpacity=".95"` — the transition completes well before the card edge (~50% of the bounding box).
- Change `offset="100%"` from `var(--violet)` to `var(--card)`, same opacity, so the tail stays white across the whole card-covered segment.

Change the comet `<circle>`'s `fill` from `var(--violet)` to `var(--card)` — same trap, same fix.

Bump `strokeWidth` on the `<path>` from `"1.6"` to `"2"`.

Touch nothing else: coordinates, z-index, stroke-dasharray trace logic,
stagger, comet motion, `--ease-brand`, and the reduced-motion branch are
unchanged.
  </action>
  <verify>
    <automated>npm run lint && npm run typecheck && npm run build</automated>
  </verify>
  <done>
All three gradients read stop 0%=accent/.9, 40%=var(--card)/.95, 100%=var(--card)/.95;
comet fill is var(--card); strokeWidth is "2"; lint/typecheck/build all exit 0;
build output still lists 14 routes with 13 static + 1 dynamic (/api/contact).
  </done>
</task>

</tasks>

<verification>
1. `npm run lint` — 0 errors.
2. `npm run typecheck` — 0 errors.
3. `npm run build` — 0 errors, same 14-route shape as before this change.
4. Read the component source post-edit: assert stop offsets/colors/opacities and comet fill match the plan exactly (no browser available this run — visual confirmation deferred to the CTO).
</verification>

<success_criteria>
- No raw hex added to the component — white comes from `var(--card)` (globals.css token), accents stay on their existing `var(--violet|--amber|--mint)` tokens.
- Cable and comet are white for the entire card-covered segment (offset ≥40%, well before the measured 50% card edge).
- Stroke width 2, everything else in the file byte-identical to the prior (geometry) fix.
- Nothing pushed; stays on `gsd/phase-02-site-public`.
</success_criteria>

<output>
Create `.planning/quick/260831-cnx-connecteurs-assemblage-blanc-sur-violet/SUMMARY.md` when done.
</output>
