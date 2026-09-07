---
quick_id: 260831-grv
status: complete
---

# Quick Task 260831-grv — Summary

Run 2 of 3 (brief `ariba-cto/notes/2026-08-31-brief-lot2-refonte-visuelle.md`):
header + hero, matching the authoritative mockup
`ariba-cto/notes/2026-08-31-maquette-lot2-landing-v2.html`.

## What changed

**`src/components/layout/header.tsx`**
- Header is now fully transparent at rest — no background, blur, or shadow
  classes apply until `data-[scrolled=true]`, which then applies the deep
  veil (`rgba(252,252,255,.72)`, `blur(28px) saturate(1.7)`) plus a
  `--hairline` border and soft shadow.
- Added a `before:` pseudo-element safety gradient that fades to 0 opacity
  once scrolled — keeps navy nav text legible over whatever's behind it.
- Replaced `common.actions.demarrer` in the header CTA with the new
  `common.actions.prendreRdv` ("Prendre RDV"), pointed at `/inscription`,
  with an arrow "chip" pastille (lucide `ArrowRight` in a white/22% pill).
- Below 1000px: Connexion link and the arrow chip both hide (`hidden
  min-[1000px]:...`); the CTA itself stays visible, compact, next to the
  burger — verified the burger's containing flex has no overflow risk in
  the prerendered markup (no unconditional `bg-*`/width blowout classes).

**`src/locales/fr/common.json`**
- Added `actions.prendreRdv: "Prendre RDV"`.

**`src/locales/fr/landing.json`**
- `hero.titre` rewritten to "Formez-vous en direct. Maîtrisez SAP Ariba" (no
  trailing period) — first sentence isolated by its own period, animated
  word now ends the string so the typewriter suffix is empty.

**`src/components/sections/hero.tsx`**
- H1 split logic rewritten: first cut is the lead sentence at its own `.`
  (rendered in `text-[var(--violet)]`, matching maquette's flat-violet
  choice over the gradient — a gradient repaints per-element width and
  would color the short/long fragments differently), second cut is the
  remainder around the resting word for the typewriter. Added a `<br/>`
  before the typewriter so its width-locked box can't overflow `#hero`'s
  `overflow-hidden` (CLS guard, D-09) — matches maquette's own line break.

**Seed**
- No seed *script* logic change needed — `landing.hero.titre` → `titre` was
  already the mapping. Re-seeded local Supabase
  (`npm run content:seed`) after the JSON edit; not re-seeded hosted (out of
  scope, CIO-owned per the brief).

## Verification

- `npm run lint` — 0 problems.
- `npm run typecheck` — 0 errors.
- `npm run build` (clean `.next`) — 0 errors, all 14 routes still static
  (`programme.pdf` is a route, so 13 pages + `/api/contact` dynamic, per
  existing baseline).
- Prerendered `.next/server/app/index.html`:
  - `<header>` class list carries no unconditional `bg-*`/`backdrop-blur-*`
    — only `data-[scrolled=true]:` variants apply them.
  - H1's aria-hidden span: `<span class="text-[var(--violet)]">Formez-vous
    en direct.</span> Maîtrisez <br/>` immediately followed by the
    typewriter span, sr-only span carries the full accroche unmutated.
  - "Prendre RDV" renders in the header; Connexion link and arrow chip both
    carry `min-[1000px]:` visibility classes with no unconditional `flex`.

## Deviations from plan

None — matched `260831-grv-PLAN.md` as written.

## Not done here (deferred to Run 3 or later)

- Numbered-journey format section, CTA-final assembly card, photo
  placeholders — Run 3.
- Hosted re-seed — CIO, out of scope.
