---
quick_id: 260831-grv
status: complete
---

# Quick Task 260831-grv: Refonte visuelle landing — Run 2 (en-tête et héros)

Run 2 of 3 from `ariba-cto/notes/2026-08-31-brief-lot2-refonte-visuelle.md`,
authoritative mockup `ariba-cto/notes/2026-08-31-maquette-lot2-landing-v2.html`.
Run 1 (surface scale, tokens) already shipped — not touched here.

## Task 1 — Header: transparent-at-rest, "Prendre RDV" CTA, mobile fit

Files: `src/components/layout/header.tsx`, `src/locales/fr/common.json`

- Header background is fully transparent at rest (no bg-color, no blur, no
  shadow); the `data-scrolled=true` state keeps the deep veil
  (28px blur / saturate 1.7) already established in globals — restyle the
  header's own classes to start transparent and only apply background/blur/
  shadow under `data-[scrolled=true]:`.
- Add `header::before`-equivalent safety gradient (a pseudo-element or an
  absolutely positioned span) that fades to transparent once scrolled.
- Add `common.actions.prendreRdv` = "Prendre RDV" to `common.json`; header
  CTA switches from `common.actions.demarrer` to this new key, links to
  `/inscription`, and gains an arrow "chip" pastille matching the maquette's
  `.btn-rdv .arr-chip`.
- Below 1000px: hide the Connexion link and the arrow chip (not the whole
  CTA — the button stays, compact) so the burger's right edge stays inside
  the viewport at 375px.

## Task 2 — H1 content: Supabase-sourced, animated word ends the string

Files: `src/locales/fr/landing.json`, `scripts/seed-content.mjs` (seed data
only, no seed *logic* change needed — same `landing.hero.titre` -> `titre`
mapping), `src/components/sections/hero.tsx`

- `landing.json`'s `hero.titre` becomes
  "Formez-vous en direct. Maîtrisez SAP Ariba" (no trailing period — the
  animated resting word must end the string so the suffix is empty, D-25).
- `hero.tsx` currently splits the accroche once, around the resting word,
  and renders everything before it (including the lead sentence) in plain
  ink. Rewrite the split: first isolate the lead sentence at the first `.`
  (rendered in `--violet`), then split the remainder around the resting
  word for the typewriter. Give the typewriter its own line (`<br/>` before
  it) so the width-locked box can't overflow `#hero`'s `overflow-hidden`.
- Re-seed local Supabase content after the JSON change (`npm run
  content:seed`), confirm the new accroche renders.

## Verification

- `data-scrolled` absent on header → no opaque `background-color` computed.
- At 375px, burger's right edge <= viewport width (manual DOM check or
  visual).
- Prerendered `/` H1 (`.next/server/app/index.html`) ends with the resting
  word "SAP Ariba" (no trailing text after it in the aria-hidden span).
- `npm run lint`, `npm run typecheck`, `npm run build` all exit 0, 14 static
  routes.
