---
quick_id: 260831-hjn
status: complete
---

# Quick Task 260831-hjn: Refonte visuelle landing — Run 4 (échange héros/CTA, carte d'assemblage animée, parcours sélectionnable)

Run 4 of `ariba-cto/notes/2026-08-31-brief-lot2-refonte-visuelle.md`, section
"Run 4" (four parts). Runs 1–3 already shipped (surface scale, header/hero,
parcours+assemblage+photo) — do not re-touch tokens in `globals.css` that
already exist, do not redo Run 1–3 work. The mockup
(`2026-08-31-maquette-lot2-landing-v2.html`) still shows the OLD placement
(console in hero, assembly in CTA) — on placement only, this brief overrides
the mockup; everything else (colors, radii, shadows, spacing) stays mockup-
faithful.

Per `02-CONTEXT.md`/`02-UI-SPEC.md` AC-1/AC-2: niveau 3 stays capped at
**exactly two persistent surfaces page-wide**. After this run those two
surfaces are still the console frame and the assembly card — they've simply
swapped sections. Task 1 updates the naming in both docs to match (the brief
only names `02-CONTEXT.md`, but `02-UI-SPEC.md` carries the identical
sentence per Run 3's own precedent of keeping them in sync — leaving one
stale would be a real inconsistency, so both are corrected).

## Task 1 — Swap hero console ↔ CTA-final assembly card; rename criterion 1

Files: `src/components/sections/hero.tsx`, `src/components/sections/cta-final.tsx`,
`.planning/phases/02-site-public/02-CONTEXT.md`, `.planning/phases/02-site-public/02-UI-SPEC.md`

**Not one word of either object's copy changes.** This task only moves JSX
between the two files and adjusts each file's data-fetching/imports to
support its new content. The two floating badges (`Support PDF par module`,
`Préparation certification`, with their `bob`/`bob2` animations) stay in
hero.tsx exactly as positioned today — they now encircle the assembly card
instead of the console frame; no class or position changes to them.

**hero.tsx:**
- Remove the console `.frame` markup (frame-bar with 3 dots + url, live-row,
  "Créneaux disponibles" label, 3 slot rows, video placeholder) and its
  `data-slot="hero-console"` wrapper.
- In its place, port the `.asm` assembly-card markup **verbatim** from
  cta-final.tsx's current implementation: the `asm-bar` (3 dots, frame
  label, status pill), the `asm-wires` SVG (static for this task — Task 2
  makes it a client island), the `asm-pills` column (3 pills), and the
  `asm-card` (badge, h4, resume line, progress bar, 3 checklist rows).
  Rename its wrapper's `data-slot` to `"hero-assembly"`.
- Add the const arrays `ASM_PILL_ICONS = [UserCheck, Radio, FileText]` and
  `ASM_PILL_GRADIENTS` (copy verbatim from cta-final.tsx) into hero.tsx —
  each section file owns its own small gradient consts, same precedent as
  `STEP_GRADIENTS` in format-modalites.tsx; do not extract a shared module.
- hero.tsx already fetches `getModules()` (`modulesResult`, used today for
  `liveModule`) — reuse it for the assembly card's resume line: add
  `const moduleCount = modulesResult.data.length` and
  `const totalHours = modulesResult.data.reduce((sum, m) => sum + m.dureeHeures, 0)`,
  then `const assemblage = common.assemblage` and
  `const resume = assemblage.resume.replace("{modules}", formatNumber(moduleCount)).replace("{heures}", formatHours(totalHours))`
  (exact pattern cta-final.tsx uses today). Import `formatNumber` alongside
  the existing `formatHours` import from `@/lib/i18n/fr`.
- `liveModule` (currently `modulesResult.data[1] ?? modulesResult.data[0]`)
  is no longer used in hero.tsx once the console moves out — remove it and
  its now-unused destructuring if nothing else references it.
- Import changes: drop `Calendar`, `Play` (were only for the console);
  add `UserCheck`, `Radio` (for the assembly pills). Keep `Check`,
  `FileText`, `GraduationCap`, `Shield` (still used — chips, pills,
  badges).

**cta-final.tsx:**
- Remove the `.asm` assembly-card markup (right column) and its
  `ASM_PILL_ICONS`/`ASM_PILL_GRADIENTS` consts, the `assemblage`/`resume`
  computation, and the now-unused `formatNumber`/`formatHours` import (grep
  to confirm no other call site in this file before removing).
- In its place, port the console `.frame` markup **verbatim** from
  hero.tsx's current implementation (frame-bar, live-row, "Créneaux
  disponibles" label, 3 slot rows, video placeholder), reading
  `common.hero.console.*` (same object, no locale changes needed since text
  is unchanged) and `liveModule` computed the same way hero.tsx computed it
  today (`modulesResult.data[1] ?? modulesResult.data[0]` — cta-final.tsx
  already fetches `getModules()` as `modulesResult`, reuse it).
- **The white-on-white trap (identical to the pastilles in Run 3):**
  `.cta-final`'s outer panel forces `color:#fff` on every descendant. The
  console frame's outer wrapper is `bg-white` — give it an explicit
  `text-[var(--ink)]` class (same fix already proven on the current `.asm`
  wrapper) so every unstyled inherited-color text node inside (the `strong`
  module title, etc.) resolves to ink, not white-on-white. Every other text
  node inside the console already carries an explicit ink-family token
  (`var(--muted-ink)`, `var(--deep)`, `var(--mint)`) in the markup being
  ported — verify none of them were relying on inherited near-black instead
  of an explicit token; if any were, add the missing explicit color.
- Import changes: drop `Check`, `FileText`, `GraduationCap`, `Radio`,
  `UserCheck` (were only for the assembly pills/checklist); add `Play`
  (video placeholder icon). Keep `Calendar` (still used by the "Réserver"
  button AND now also by the console's calendar-icon label — same import,
  two call sites).
- **Shadow-4 bookkeeping stays correct automatically**: each block already
  carries its own `shadow-[var(--shadow-4)…]` declaration inline in its own
  JSX — moving the blocks moves their shadow-4 usage with them, so the
  page-wide count of two stays two, just relocated. Do not add or remove a
  shadow-4 declaration anywhere in this task.

**02-CONTEXT.md and 02-UI-SPEC.md** (criterion 1 / §7, identical sentence in
both — `grep -n "niveau 3 on" .planning/phases/02-site-public/02-CONTEXT.md
.planning/phases/02-site-public/02-UI-SPEC.md` to find both occurrences):
replace `"hero console frame, CTA-final assembly card"` with
`"hero assembly card, CTA-final console frame"`. Change nothing else in
either sentence.

Verify: `npm run build`; in `.next/server/app/index.html`,
`data-slot="hero-assembly"` is present and `data-slot="hero-console"` is
absent; the hero section's rendered HTML contains the assembly-card copy
("Votre parcours SAP Ariba — assemblage", the 3 pill labels, "Parcours SAP
Ariba" badge); the cta-final section's rendered HTML contains the console
copy ("Créneaux disponibles", the 3 slot dates, "Emplacement vidéo de
présentation"); the two floating badge strings ("Support PDF par module",
"Préparation certification") are still inside the hero section, not
cta-final's.

## Task 2 — Animate the assembly connectors (client island)

Files: new `src/components/motion/assembly-connectors.tsx`, edit
`src/components/sections/hero.tsx`, edit `src/app/globals.css`

- Create `"use client"` component `AssemblyConnectors`, modeled on
  `typewriter.tsx`'s pattern (refs + a single `useEffect`, direct DOM style
  writes, `matchMedia("(prefers-reduced-motion: reduce)")`, no `useState`).
  It renders the **same static SVG** currently inline in the assembly card
  (`viewBox="0 0 100 100" preserveAspectRatio="none"`, the 3 `linearGradient`
  defs, the 3 hand-written bezier `<path d="…">`s) — the paths are literal
  JSX, never computed from element positions, and never recomputed on
  resize (this is explicitly the rejected approach — do not reintroduce
  it).
- Progressive trace: on mount (non-reduced-motion), for each `<path>` set
  `strokeDasharray`/`strokeDashoffset` to `path.getTotalLength()` (fully
  hidden). Mount an `IntersectionObserver` on the SVG wrapper (threshold
  ~0.4, `once` — disconnect after first trigger). On intersect, set each
  path's `strokeDashoffset` to `0`, staggered per path via
  `transitionDelay` (e.g. `${index * 140}ms`); the CSS driving this is
  `transition: stroke-dashoffset 1.1s var(--ease-brand)` set in the JSX
  `style` prop (inline, since Tailwind has no dasharray/dashoffset
  transition utility) — `--ease-brand` only, no second curve.
- Comet: one small `<circle>` per path, `offset-path: path("<same d
  string>")`, animated via a new `@keyframes comet { from { offset-distance:
  0%; } to { offset-distance: 100%; } }` in `globals.css` (place beside the
  existing `blink`/`bob`/`bob2` keyframes, same `@layer`, same file comment
  convention: "consumes --ease-brand rather than the maquette's
  ease-in-out"). Apply `animation: comet 2.6s var(--ease-brand) infinite`
  per circle with a small stagger (`animationDelay: ${index * 0.5}s` in the
  inline style) so the three comets read as offset from each other, per the
  brief ("décalée d'une courbe à l'autre"). Comets start at `opacity: 0` in
  the JSX and flip to `opacity: 1` inside the same IntersectionObserver
  callback that triggers the trace reveal — they must not run visibly along
  an undrawn/invisible line before the viewport entry.
- `prefers-reduced-motion: reduce`: skip the `IntersectionObserver` entirely.
  Set every path's `strokeDasharray`/`strokeDashoffset` directly to
  `"none"`/`"0"` (not via the transition — a direct style write, so there is
  no animated frame at all) and either omit the comet circles from the
  render in this branch or set them to `display: none` synchronously in the
  same effect before any paint. Result: complete, motionless curves, zero
  comet — non-negotiable per the brief.
- In hero.tsx, replace the inline static `<svg className="asm-wires"…>`
  block (ported in Task 1) with `<AssemblyConnectors />`.
- No second easing curve anywhere in this file: the dashoffset transition
  and the `comet` keyframe animation both reference `var(--ease-brand)`
  only — no bare `linear`, `ease-in`, `ease-out`, or `ease-in-out`.

Verify: `npm run build`; `grep -n "cubic-bezier\|ease-in\|ease-out\|linear" src/components/motion/assembly-connectors.tsx` — no bare easing keyword (matches on `linear-gradient` are not the concern here since this file has none); `grep -n "@keyframes comet" src/app/globals.css` present, uses `offset-distance`; manual browser check with DevTools' "prefers-reduced-motion: reduce" emulation confirms static full curves and no moving comet (a static grep cannot verify the rendered pixel outcome, only that the reduce-branch code path exists).

## Task 3 — Selectable parcours (client island, key-matched aside) + fix invisible "à venir" label

Files: new `src/components/motion/format-parcours.tsx`, edit
`src/components/sections/format-modalites.tsx`, edit
`src/locales/fr/common.json`

**common.json** — restructure `formatModalitesAside` so every row carries a
`cle` for correspondence (label text is **unchanged**, only the shape
gains a key — same "chrome, not signed content" class as the object's Run 3
introduction):
```json
"formatModalitesAside": {
  "titre": "Ce que comprend votre parcours",
  "items": [
    { "cle": "formations-live", "label": "Sessions animées en direct" },
    { "cle": "supports-pdf", "label": "Support PDF par module" },
    { "cle": "cas-pratiques-en-fin-de-module", "label": "Cas pratique en fin de module" },
    { "cle": "duree-d-acces", "label": "Accès aux supports" },
    { "cle": "prerequis", "label": "Aucun prérequis SAP" }
  ],
  "itemFutur": { "cle": "videos-a-venir", "label": "Compléments vidéo — à venir" },
  "resume": "{modules} modules · {heures} de formation live"
}
```
The `cle` values are `slugify(titre)` (see `scripts/seed-content.mjs`) of
`landing.json`'s `formatModalites.items` titles, in DB order ("Formations
live", "Supports PDF", "Vidéos à venir", "Durée d'accès", "Cas pratiques en
fin de module", "Prérequis") — read them from the seed script and
`landing.json`, do not invent them. Note the mismatch the brief warns
about: DB order has "vidéo" 3rd, this aside array has it last (as
`itemFutur`) — this is exactly why matching is by `cle`, never by index.

**format-parcours.tsx** (`"use client"`):
- Props: `items: ContentItem[]` (the six `getSectionItems("format-modalites")`
  rows, each with `id`/`cle`/`titre`/`description`/`statut`), `aside: {
  titre: string; items: {cle:string;label:string}[]; itemFutur:
  {cle:string;label:string}; resume: string }`.
- `const [selected, setSelected] = useState(0)` — item at index 0 (DB order)
  is active on first render, no effect needed.
- The `<ol>` of 6 rows: each row is now a `<li><Reveal as="div"
  dataD={…}>` wrapping a real `<button type="button" onClick={() =>
  setSelected(index)}>` (native buttons are keyboard-activatable by
  default — Enter/Space — satisfying "au clic et au clavier" with no extra
  key handling). The button carries the grid/border/tint/liseré classes
  previously keyed off `isFirst`; replace that check with `selected ===
  index` for both the row tint/border and the vertical liseré's
  opacity. Reset default button chrome (`w-full text-left bg-transparent
  border-0 p-0` baseline) then reapply the existing row padding/radius
  classes on the button itself.
- Rail: `selected === index` → filled pip (`bg-[var(--ink)]
  text-white border-[var(--ink)]`, replacing the old `index === 0` check);
  segment `index < selected` → the gradient "on" class (segments fill up to
  the current selection, replacing the old always-first-segment-on state).
- Aside: build one array of 6 `{cle, label, futur}` rows from `aside.items`
  (`futur:false`) plus `aside.itemFutur` (`futur:true`) for rendering — same
  visual treatment as before (mint check dot vs. empty ring dot for the
  futur row). A row gets `aria-current="true"` plus a highlight
  (`border-[var(--violet)] bg-[var(--tint-violet)]` layered on its existing
  classes) when `row.cle === items[selected]?.cle`. **All 6 rows stay
  rendered and visible regardless of selection** — highlighting only, never
  hiding, per the brief.
- Fix the invisible-label bug while this file is being written: the "à
  venir" row's label class is `text-[var(--muted)]` in the current
  format-modalites.tsx (line ~165) — `--muted` resolves to `var(--lav2)`, a
  near-white surface token (`globals.css:124`), not an ink; the correct
  token is `--muted-ink` (`globals.css:96`). Use `text-[var(--muted-ink)]`
  on this row in the new component. Confirm via `grep -rn "var(--muted)]"
  src/components/` that this was the only call site using the surface token
  as a text color anywhere in the codebase.

**format-modalites.tsx**: keep the server-side `getSection`/
`getSectionItems`/`getModules` fetch, the error gate, and the `resume`
string substitution exactly as today; replace the inline `<ol>` + rail +
`<Card>` aside JSX with `<FormatParcours items={items} aside={{
...common.formatModalitesAside, resume }} />`.

Verify: `npm run lint && npm run typecheck && npm run build`; in
`.next/server/app/index.html` the format-modalites section contains exactly
6 `<button` elements inside the parcours `<ol>`; the aside row carrying
`aria-current="true"` on first render corresponds to the item whose `cle`
is `formations-live` ("Sessions animées en direct" — confirm this really is
DB-order index 0 by checking `landing.json`'s `formatModalites.items[0]`
title is "Formations live"); `grep -rn "var(--muted)\]" src/components/`
(excluding `--muted-ink`/`--muted2`) returns zero matches.

## Final verification

- `npm run lint`, `npm run typecheck`, `npm run build` all exit 0; 14 routes
  still static/prerendered.
- No page renders "Une erreur est survenue" on a manual check against the
  local dev server — if one does, local Supabase is down; restart it and
  recheck before concluding anything.
- Console and assembly-card copy is byte-identical to before this run (diff
  the two blocks' text nodes against the pre-Run-4 versions of
  hero.tsx/cta-final.tsx).
- No raw hex introduced beyond the already-documented exceptions
  (`#B4771A`, `#0E9F6E`, `#FF5F57`/`#FEBC2E`/`#28C840`, `#D6D3F0`).
- No `cubic-bezier`/`ease-in`/`ease-out`/`ease-in-out`/bare `linear`
  introduced anywhere in this run's diff — `--ease-brand` only.
- `git status` shows local commits only on `gsd/phase-02-site-public`;
  nothing pushed.
