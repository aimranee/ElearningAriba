---
quick_id: 260831-meh-section-01-landing-publique-en-tete-et-h
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/layout/header.tsx
  - src/components/sections/hero.tsx
  - src/components/sections/cta-final.tsx
  - src/locales/fr/common.json
  - src/locales/fr/landing.json
  - src/app/globals.css
  - .planning/phases/02-site-public/02-CONTEXT.md
  - .planning/phases/02-site-public/02-UI-SPEC.md
autonomous: true
requirements: []

must_haves:
  truths:
    - "The header shows a monogram pastille next to the wordmark, and 'Accueil' no longer appears in either the desktop or mobile nav"
    - "The H1 never renders a duplicated word when the typewriter's resting word can't be located in the accroche string — it degrades to the full static accroche instead"
    - "The hero has exactly one primary promise above the fold ('Prendre RDV', pointing to /inscription); 'Démarrer ma formation' is gone from the codebase and the header/hero CTAs no longer compete"
    - "The hero eyebrow, the two floating badges, and the bob/bob2 keyframes are gone"
    - "The hero chips show exactly two items, with no duplication of the assembly card's 'Appel découverte' pill"
    - "The assembly card's violet panel shows a live data aggregate (module count, total hours, certification prep) instead of repeating the three left-column pills or naming a single module"
    - "The assembly card's status badge reads 'Sessions ouvertes', not 'En préparation'"
    - "02-CONTEXT.md's D-04 (and 02-UI-SPEC.md's mirrored authority section) documents the maquette's removal as visual authority and the new section-by-section regime"
    - "npm run lint, npm run typecheck and npm run build all exit 0, and all 14 routes stay statically prerendered"
  artifacts:
    - path: "src/components/layout/header.tsx"
      provides: "Monogram pastille beside the wordmark; MOBILE_LINKS and desktop nav without an Accueil entry"
    - path: "src/components/sections/hero.tsx"
      provides: "No eyebrow block, a guarded typewriter split, a single hero CTA, deduped chips, no floating badges, a non-repeating assembly card with a live aggregate"
    - path: "src/locales/fr/common.json"
      provides: "nav.accueil, hero.eyebrow, hero.badges, actions.demarrer, assemblage.moduleTitre removed; hero.chips trimmed to two entries; assemblage.statut set to 'Sessions ouvertes'; a new assemblage key for the certification-prep line"
    - path: ".planning/phases/02-site-public/02-CONTEXT.md"
      provides: "D-04 rewritten to remove the maquette as visual authority"
    - path: ".planning/phases/02-site-public/02-UI-SPEC.md"
      provides: "§0 authority section and footer line rewritten to match D-04"
  key_links:
    - from: "src/components/sections/hero.tsx"
      to: "src/locales/fr/common.json assemblage"
      via: "assemblage.statut, assemblage.badge, assemblage.resume, new certification key — no assemblage.moduleTitre or pills.map duplication"
      pattern: "assemblage\\.(statut|badge|resume)"
    - from: "src/components/sections/cta-final.tsx"
      to: "src/locales/fr/common.json hero.chips"
      via: "existing .join(\" · \") call, unchanged, now over the trimmed two-item array"
      pattern: "hero\\.chips\\.join"
---

<objective>
Rebuild the landing page's header and hero per the CTO's section-01 brief: a
monogram wordmark and a four-link nav, a typewriter that degrades silently
instead of duplicating a word, one hero CTA instead of two competing
promises, deduped chips, no floating badges, and an assembly card whose
violet panel shows a live parcours aggregate instead of repeating itself.
Closes with the D-04 rewrite that retires the maquette as visual authority.

Purpose: the maquette is no longer the contract — the rendered app is. This
plan is the first section-by-section pass under that regime, and it fixes
three concrete defects the brief names: a silent typewriter duplication bug,
a two-CTA hero competing with the header's own CTA, and an assembly card
that renders the same three pills twice.

Output: updated header.tsx, hero.tsx, common.json, landing.json, globals.css
(bob/bob2 keyframes removed), and 02-CONTEXT.md/02-UI-SPEC.md with D-04
rewritten.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md

<discovery_notes>
Read directly from the repo before this plan was written (do not re-derive):

- `header.tsx`: logo `Link` (lines 53-58) renders only `common.metadata.title`
  in `text-lg font-semibold`. Desktop nav (lines 60-79) and `MOBILE_LINKS`
  (lines 13-20) both start with an `Accueil` entry pointing at `/`. Grep
  confirms `common.nav.accueil` has exactly two consumers, both in
  `header.tsx` (lines 14, 65) — no footer or other file reads it, so the key
  can be deleted from `common.json` outright.
- `hero.tsx`: the eyebrow `Reveal` is lines 105-114 (reads
  `common.hero.eyebrow`). The split logic is lines 79-87: `leadSplit`,
  `accrocheRest`, `restingWord`, `splitIndex`, `accrochePrefix`,
  `accrocheSuffix` are all already computed — nothing needs recomputing, only
  a guard around the render at lines 121-129. When `leadSplit < 0`,
  `accrocheRest` is already `""` and `splitIndex` is already `-1` from the
  existing logic — a single `hasValidSplit = leadSplit >= 0 && splitIndex >=
  0` boolean, computed once alongside the other split variables, correctly
  captures both failure modes named in the brief (word not found, and `words`
  empty, since an empty `words` array makes `restingWord` falsy and
  `splitIndex` `-1` via the existing ternary at line 84).
- Primary CTA is lines 140-147 (`common.actions.demarrer` → `/inscription`).
  Grep confirms `common.actions.demarrer` has exactly one consumer, this
  line — delete the key after the edit.
- Chips are lines 159-169, reading `common.hero.chips` directly (no local
  copy) — trimming the JSON array to two entries is the entire fix; no JSX
  change needed. `cta-final.tsx:89` reads the same array via
  `common.hero.chips.join(" · ")` — do not touch `cta-final.tsx`, the
  shortened join is the intended, automatic effect on that file.
- Floating badges are lines 172-187 (`common.hero.badges.pdf` /
  `.certification`, `animate-[bob_...]` / `animate-[bob2_...]`). Grep
  confirms `hero.tsx` is the sole consumer of both `animate-[bob` and `bob2`
  — the two `@keyframes` blocks in `globals.css:320-329` (`bob`) and
  `globals.css:330-338` (`bob2`) can be deleted outright, leaving the
  `blink` keyframe (lines 314-318) and everything from `comet` (line 342 on)
  untouched.
- Assembly card is lines 188-256. `assemblage.moduleTitre` (rendered at line
  237, the `<h4>`) has exactly one consumer in the whole codebase (this
  line) — delete the key after removing the `<h4>`. The duplicated
  checklist is the second `assemblage.pills.map` at lines 243-253 (no `key`
  reuse conflict — remove the whole block). `moduleCount`/`totalHours`/
  `resume` are already computed above the JSX (lines 89-94) — `resume`
  already reads `"{modules} modules · {heures} de formation live"` from
  `common.assemblage.resume`, satisfying two of the three aggregate figures
  the brief asks for (module count, total hours) with no new computation.
  The third (certification prep) needs one new `common.assemblage` string
  key, since none currently names it — call it `certification` (e.g.
  `"Préparation à la certification"`), rendered as its own row with a
  `Check` icon (already imported in `hero.tsx`), styled like the removed
  checklist rows minus the array/duplication.
- `common.assemblage.statut` is currently `"En préparation"` — the sole
  consumer is `hero.tsx:200`. Change to `"Sessions ouvertes"` in place, no
  key rename (avoids touching the `frameLabel`/`badge`/`pills` siblings the
  brief says stay untouched).
- `landing.json`'s `hero.sousTitre` (line 4) is read by `hero.tsx` via
  `getSection("hero")` → `sectionResult.data.lead`, sourced from Supabase,
  not the JSON directly at runtime (D-24) — editing the JSON alone does
  nothing to the rendered page until `npm run content:seed` re-runs.
  `seed-content.mjs:153` already wires `landing.hero.sousTitre` into the
  `hero` section's `lead` column — no seed-script change needed, only a
  local re-seed after the JSON edit.
- `02-CONTEXT.md`: D-04 is lines 59-63. The acceptance-criteria list doesn't
  otherwise name the maquette; AC-1 (surface map) and AC-4 (single curve,
  formerly named D-15 in the brief's numbering) do not need edits, per the
  brief. `02-UI-SPEC.md`: the authority section is lines 9-22 (§0), and the
  closing attribution line is line 200 — both cite the maquette as contract
  and need the same rewrite as D-04.
</discovery_notes>

<interfaces>
From `src/components/sections/hero.tsx` (current, before this plan) — the
split variables this plan's guard consumes, unchanged in shape:
```
const leadSplit = accroche.indexOf(".");
const accrocheLead = leadSplit >= 0 ? accroche.slice(0, leadSplit + 1) : accroche;
const accrocheRest = leadSplit >= 0 ? accroche.slice(leadSplit + 1).trimStart() : "";
const restingWord = words[0] ?? "";
const splitIndex = restingWord ? accrocheRest.indexOf(restingWord) : -1;
const accrochePrefix = splitIndex >= 0 ? accrocheRest.slice(0, splitIndex) : accrocheRest;
const accrocheSuffix = splitIndex >= 0 ? accrocheRest.slice(splitIndex + restingWord.length) : "";
```
This plan adds one more `const hasValidSplit = leadSplit >= 0 && splitIndex >= 0;`
immediately after and branches the render on it — no other variable changes.

From `src/locales/fr/common.json`'s `assemblage` object (current):
```json
"assemblage": {
  "frameLabel": "Votre parcours SAP Ariba — assemblage",
  "statut": "En préparation",
  "badge": "Parcours SAP Ariba",
  "moduleTitre": "Procure-to-Pay",
  "resume": "{modules} modules · {heures} de formation live",
  "pills": [ { "cle": "appel-decouverte", "label": "Appel découverte" }, ... ]
}
```
After this plan: `statut` → `"Sessions ouvertes"`, `moduleTitre` removed, one
new key added (e.g. `certification`), `pills` and `frameLabel`/`badge`
untouched.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Header — monogram pastille and Accueil removal</name>
  <files>src/components/layout/header.tsx, src/locales/fr/common.json</files>
  <action>
In `header.tsx`, replace the logo `Link` (currently just
`{common.metadata.title}` in `text-lg font-semibold`) with a `Link` wrapping
two children: an `aria-hidden="true"` `span` — a decorative monogram
pastille, `size-8` (or close), `rounded-[9px]`, background
`linear-gradient(135deg,var(--violet),var(--indigo))`, centered white bold
"A" — followed by a `span` carrying the existing `common.metadata.title`
text and its current `font-heading text-lg font-semibold text-foreground`
classes. Tokens only (`var(--violet)`, `var(--indigo)`) — no raw hex. The
`Link`'s accessible name stays the full wordmark text (the pastille
contributes nothing to it); keep `FOCUS_RING` on the `Link` itself.

Remove the `Accueil` entry from `MOBILE_LINKS` (the `{ href: "/", label:
common.nav.accueil }` object) and remove the standalone `<Link href="/">
{common.nav.accueil}</Link>` from the desktop `<nav>` — both without
touching the four remaining links (Programme, Formation, À propos, Contact)
or the `Connexion`/`Prendre RDV` block beside them.

In `common.json`, delete the `nav.accueil` key — grep confirms no other
file reads it.
  </action>
  <verify>
    <automated>npm run lint && npm run typecheck</automated>
  </verify>
  <done>Header renders a monogram pastille beside the wordmark; desktop nav and MOBILE_LINKS both list exactly four routes (Programme, Formation, À propos, Contact); common.json has no nav.accueil key; lint and typecheck are green.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Hero — sourcil, typewriter guard, single CTA, chips, badges, assembly card</name>
  <files>src/components/sections/hero.tsx, src/locales/fr/common.json, src/locales/fr/landing.json, src/app/globals.css</files>
  <behavior>
    - Typewriter guard: when the resting word can't be located in the
      accroche (or `words` is empty), the H1 renders the full accroche as
      static text — no `<Typewriter>` mount, no duplicated word, no thrown
      exception.
    - Typewriter guard, valid-split case unchanged: same violet lead +
      prefix + `<br/>` + `<Typewriter>` + suffix layout as today.
  </behavior>
  <action>
Remove the eyebrow `Reveal` block entirely (the sourcil span, its gradient
filet, and its `common.hero.eyebrow` read). The H1 `Reveal` moves up to take
its place — no wrapping change needed since the eyebrow was a sibling, not a
parent.

Add `const hasValidSplit = leadSplit >= 0 && splitIndex >= 0;` immediately
after the existing split-variable block (per `<interfaces>`), and branch the
H1's `aria-hidden` span on it: when true, render the existing violet-lead +
prefix + `<br/>` + `<Typewriter words={words} />` + suffix markup unchanged;
when false, render `{accroche}` alone, with no `<br/>` and no `<Typewriter>`
mount. The `sr-only` span keeps rendering `{accroche}` unconditionally in
both cases. Do not add a thrown assertion anywhere in this path — degrade
silently per the brief.

Change the primary CTA's Button child from `{common.actions.demarrer}` to
`{common.actions.prendreRdv}` — destination `/inscription` stays. Leave the
secondary "Voir le programme" Button untouched.

Remove the two floating badge `div`s (the `bob`/`bob2`-animated blocks)
entirely, including their `Shield`/`GraduationCap` icons' usage at that call
site (the imports themselves may still be needed elsewhere in the file —
check before removing an import).

In the assembly card's violet panel: remove the `<h4>` reading
`assemblage.moduleTitre`, and remove the second `assemblage.pills.map(...)`
block (the checklist, lines ~243-253) in its entirety. In its place, after
the `resume` div and before (or after — match the existing visual rhythm of
badge → headline stat → detail line → progress bar) the progress bar, add
one row showing the certification-prep aggregate: a `Check` icon (already
imported) plus the new `assemblage.certification` string, styled
consistently with the row it replaces (white/78 text, small font, flex gap
— match the removed checklist row's text sizing, not its per-item
`key`/`.map`, since this is a single static row, not a list).

In `common.json`:
- Delete `hero.eyebrow`.
- Delete `hero.badges` (both `pdf` and `certification` sub-keys).
- Delete `actions.demarrer`.
- Trim `hero.chips` to exactly `["Aucun prérequis SAP", "Expert certifié"]`
  (drop "Appel découverte gratuit").
- Set `assemblage.statut` to `"Sessions ouvertes"`.
- Delete `assemblage.moduleTitre`.
- Add `assemblage.certification` with a short French label naming
  certification prep, e.g. `"Préparation à la certification"` — this is new
  UI chrome describing an existing aggregate, not re-authored signed
  content, so word it plainly and consistently with the file's existing
  tone (short, declarative, no ellipsis).

In `landing.json`, replace `hero.sousTitre` with: "Prenez en main
l'écosystème Ariba, du premier appel d'offres jusqu'à la certification."
(verbatim from the brief). Then run `npm run content:seed` to re-seed the
local Supabase content table — the hero section's `lead` column is sourced
from this key at seed time (`seed-content.mjs:153`), not read live from the
JSON.

In `globals.css`, delete the `@keyframes bob { ... }` and `@keyframes bob2 {
... }` blocks (lines ~320-338) — leave `blink` and `comet` untouched.
  </action>
  <verify>
    <automated>npm run content:seed && npm run lint && npm run typecheck</automated>
  </verify>
  <done>Eyebrow gone; typewriter renders the static accroche with no duplicated word whenever splitIndex or leadSplit is negative; primary CTA reads "Prendre RDV"; hero.chips has two entries; floating badges and bob/bob2 keyframes are gone; assembly card's violet panel shows badge → aggregate stat → certification-prep row → progress bar with no repeated pills or module name; local content re-seeded; lint and typecheck are green.</done>
</task>

<task type="auto">
  <name>Task 3: Rewrite D-04, then full build + rendered-HTML verification</name>
  <files>.planning/phases/02-site-public/02-CONTEXT.md, .planning/phases/02-site-public/02-UI-SPEC.md</files>
  <action>
In `02-CONTEXT.md`, replace the D-04 bullet (lines 59-63, currently "The
validated maquette is the visual contract... Where this document and the
file disagree, the file wins.") with: the maquette is retired as visual
authority; the rendered application is the reference; the landing is
rebuilt section by section, each section discussed and delivered before the
next opens — per the founder's 2026-08-31 decision. Keep the file path
mention only as a historical trace ("kept on disk, not read, not
authoritative"), matching the brief's own framing. Do not touch AC-1
(surface map) or D-15/AC-4 (single easing curve) — both survive as-is.

In `02-UI-SPEC.md`, rewrite §0 "The authority" (lines 9-22) the same way —
the maquette is no longer the design contract; the rendered app is, under
the section-by-section regime — and rewrite the closing attribution line
(line 200, "Derived from the founder-approved maquette... authority.") to
match. Leave every token/timing/composition section below §0 untouched;
this task only retargets who/what holds authority, not the values already
measured.

Then run the full verification chain: `npm run lint`, `npm run typecheck`,
`npm run build`. After a green build, check `.next/server/app/index.html`
for the 9 rendered-HTML assertions and confirm the 4 page-behavior checks
at 375px, both listed under `<verification>` below.
  </action>
  <verify>
    <automated>npm run lint && npm run typecheck && npm run build</automated>
  </verify>
  <done>D-04 (and 02-UI-SPEC.md's mirrored authority section) no longer names the maquette as visual contract; lint/typecheck/build all exit 0; all 14 routes remain statically prerendered; every rendered-HTML and 375px check below passes.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|--------------|
| None new | Presentational/copy edits to an already-static, server-rendered landing page plus two doc rewrites. No new input, endpoint, or trust boundary. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|------------------|
| T-quick-260831-meh-01 | Tampering | None | accept | Pure JSX/JSON/CSS/doc edits; no dependency install, no new runtime input path. |
</threat_model>

<verification>
After `npm run build`, on `.next/server/app/index.html`:

1. "Démarrer ma formation" appears nowhere.
2. "Prendre RDV" appears at least twice (header + hero).
3. "En préparation" appears nowhere; "Sessions ouvertes" appears once.
4. "Appel découverte" appears exactly once in the hero (the pill); "Support
   PDF" appears exactly once (the pill).
5. "Procure-to-Pay" no longer appears in the assembly card.
6. The eyebrow "Formation live · SAP Ariba" no longer appears.
7. "Accueil" no longer appears in the header nav.
8. `--shadow-3`/`--shadow-4` appear on exactly two rendered objects (hero
   console, CTA final card) — unchanged ceiling, this plan added no new
   consumer.
9. `bob` and `bob2` no longer appear in the produced CSS.

On the served page:

10. At 375px, `scrollWidth === clientWidth` — no horizontal overflow.
11. The burger's right edge is ≤ the viewport width at 375px.
12. The H1 ends on the typewriter's resting word, with no duplication.
13. The monogram and wordmark are legible against both the transparent and
    the veiled header state.
</verification>

<success_criteria>
- Header: monogram pastille beside the wordmark; nav down to four links
  (Programme, Formation, À propos, Contact) on desktop and mobile;
  `common.nav.accueil` deleted.
- Hero: no eyebrow; typewriter degrades to static accroche with no
  duplicated word when the split can't be located; one CTA ("Prendre RDV" →
  `/inscription`); two chips, no repeat of "Appel découverte"; no floating
  badges, no `bob`/`bob2` keyframes; assembly card's violet panel shows a
  live aggregate (module count, hours, certification prep), no repeated
  pills, no single-module name, status badge reads "Sessions ouvertes".
  `cta-final.tsx` untouched beyond the natural effect of the shortened
  `hero.chips` array.
- `landing.json`'s `hero.sousTitre` shortened per the brief; local Supabase
  content re-seeded to match.
- `02-CONTEXT.md` D-04 and `02-UI-SPEC.md`'s authority section both retire
  the maquette as visual contract in favor of the rendered app, under the
  section-by-section regime; AC-1, D-15/AC-4 and D-23/AC-2 untouched.
- `npm run lint`, `npm run typecheck`, `npm run build` all exit 0; 14 routes
  stay statically prerendered.
- Nothing pushed; stays on `gsd/phase-02-site-public`.
</success_criteria>

<output>
Create `.planning/quick/260831-meh-section-01-landing-publique-en-tete-et-h/SUMMARY.md` when done.
</output>
