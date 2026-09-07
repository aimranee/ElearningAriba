---
status: complete
---

# Quick Task 260907-my2: Landing v3 Run B — Summary

Run B of 3 for "Landing v3 - Le parcours". Ported the three middle sections of the
landing page to the v3 maquette on `cto/landing-v3`, four atomic commits:

| Hash | Message |
|---|---|
| `5764836` | `#feat: restyle pour-qui section as speech bubbles` |
| `1933b20` | `#feat: restyle competences section as night wall with constellation backdrop` |
| `1d7de8b` | `#feat: restyle programme section as a drawn timeline` |
| `c87d330` | `#fix: drop unused index param in constellation link map` |

## What changed

- **Pour qui** (`pour-qui.tsx`): cards restyled as maquette `.bubble` speech bubbles
  (tinted quote panel with tail + quote mark, author row with existing 52px picto
  tile, expanding description, sliding-arrow CTA row). `CardSpotlight` removed from
  this section. D-49 hover/focus expansion mechanism preserved. No new strings.
- **Competences** (`competences.tsx` + new `illustrations/constellation.tsx`):
  wrapped in `<Section tone="night">`, tiles restyled as maquette `.skill` glass
  cards, added the previously-dead `data-slot="competence-rule"` trace element,
  added a constellation SVG backdrop (lines/nodes/animated link paths/twinkling
  sparks, `prefers-reduced-motion` honoured), added a two-button CTA row using
  existing translation keys only.
- **Programme** (`programme-accordion.tsx`): restructured as a maquette
  `.tl`/`.mod` drawn timeline — a `Reveal`-driven vertical gradient line that
  scales in via a new `.reveal.in [data-slot="timeline-line"]` CSS rule, five
  gradient pins (01–05) on the line, restyled accordion items. Verified the
  Base UI `data-open`/`data-panel-open` contract live (already correct since
  the 2026-09-05 fix — no dead rule found this run, contrary to the brief).

## Verification (all run once, after all commits)

1. `npm run lint` — pass (0 problems, after one Rule-1 auto-fix in the new file).
2. `npm run typecheck` — pass.
3. `npm run build` — pass. Prerendered `/` ≈ 303 KB (well above the 44 KB
   empty-DB failure threshold — real content, not a false positive).
4. `npm run content:check` — exits 1, 84 placeholders, matching the existing
   baseline exactly, zero new placeholders.
5. `git status --short` clean of tracked source files.
6. `git rev-parse --abbrev-ref HEAD` — `cto/landing-v3`, unchanged. No push.

No STOP-and-report triggers fired — every fact in the brief (tokens, accordion
contract, translation keys, `Section` stacking) matched the live codebase, with
one correction folded into the plan itself: the competence-rule trace element
had to be *added*, not merely kept, since it didn't exist in JSX yet.
