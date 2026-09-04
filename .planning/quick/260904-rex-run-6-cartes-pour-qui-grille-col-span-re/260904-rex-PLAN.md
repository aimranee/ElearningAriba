---
phase: quick
plan: 260904-rex
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/sections/pour-qui.tsx
  - src/locales/fr/common.json
  - .planning/phases/02-site-public/02-CONTEXT.md
autonomous: true
requirements: []
must_haves:
  truths:
    - "Second row of Pour qui renders two 3-column cards filling all six lg grid columns"
    - "Card footer always renders (title-or-label + chevron), never conditioned on accroche presence"
    - "Footer row is hidden on touch/no-hover devices"
  artifacts:
    - path: "src/components/sections/pour-qui.tsx"
      provides: "col-span grid + always-rendered footer with ChevronDown"
    - path: "src/locales/fr/common.json"
      provides: "actions.enSavoirPlus key"
  key_links:
    - from: "src/components/sections/pour-qui.tsx"
      to: "common.actions.enSavoirPlus"
      via: "fallback label when !hasAccroche"
      pattern: "common\\.actions\\.enSavoirPlus"
---

<objective>
Fix "Pour qui" card grid so the second row's two cards each span 3 of 6 lg columns
(replacing the centered orphan pair), and make the card footer always render a
label + rotating chevron affordance instead of only when `donnees.accroche` exists.

Purpose: D-49's original 3+2 grid left an asymmetric centered pair in row two;
the hover-reveal mechanism needs a permanent affordance so users know the card
opens on hover, and that affordance shouldn't disappear when there's no accroche.
Output: Updated pour-qui.tsx, one new locale key, three new CONTEXT.md decisions.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/sections/pour-qui.tsx
@src/locales/fr/common.json
@.planning/phases/02-site-public/02-CONTEXT.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Grid col-span fix, always-rendered footer with chevron, locale key</name>
  <files>src/components/sections/pour-qui.tsx, src/locales/fr/common.json</files>
  <action>
In src/components/sections/pour-qui.tsx:

1. Swap the `ArrowRight` import for `ChevronDown` from `lucide-react` (line 2). Do not
   remove ArrowRight until confirming it has no other use in this file — it currently
   only appears in the footer block being replaced, so remove it entirely.

2. Grid className on the `<ul>` (line 58) stays `mt-10 grid grid-cols-1 gap-[1.35rem]
   sm:grid-cols-2 lg:grid-cols-6` — unchanged.

3. Each `<Reveal as="li">`'s className (lines 72-76): replace the ternary with one keyed
   on index: indices 0, 1, 2 get `lg:col-span-2`; indices 3, 4 get `lg:col-span-3`. Drop
   `lg:col-start-2` entirely — it is no longer needed since two 3-col cards fill row two.

4. Footer block (lines 115-125, the `{hasAccroche ? (...) : null}`): replace with an
   always-rendered `<div>` with className `mt-1 flex items-center justify-between
   [@media(hover:none)]:hidden` (keep the existing `mt-1 flex items-center
   justify-between` classes, add the hide-on-no-hover modifier). Inside:
   - Left: a `<span>` with the same text classes as today
     (`font-semibold text-[length:var(--text-small)]
     leading-[var(--text-small--line-height)] text-[var(--card-ink)]`), content is
     `titre` when `hasAccroche` is true, else `common.actions.enSavoirPlus`.
   - Right: `<ChevronDown aria-hidden="true" className="size-4 text-[var(--card-ink)]
     transition-transform duration-[var(--duration-reveal)] ease-[var(--ease-brand)]
     group-hover:rotate-180 group-focus-within:rotate-180" />` (swap ArrowRight's
     translate-x hover class for ChevronDown's rotate-180).

5. Do not touch anything else: `grid-rows-[0fr]`/`group-hover:grid-rows-[1fr]`/
   `[@media(hover:none)]:grid-rows-[1fr]` on the description wrapper, CardTitle's
   `accroche` content, CardSpotlight, the gradient tile, the Link to /programme, tint
   pairs, EmptyState branch — all unchanged.

In src/locales/fr/common.json: inside the `actions` object (after `"continuer":
"Continuer"`), add `"enSavoirPlus": "En savoir plus"`. Do not add this key to
_mocks.public.json — it's a static interface label, not content-driven.
  </action>
  <verify>
    <automated>grep -n "lg:col-span-3\|lg:col-start-2\|ChevronDown\|ArrowRight\|enSavoirPlus" src/components/sections/pour-qui.tsx src/locales/fr/common.json</automated>
  </verify>
  <done>
Grid uses col-span-2 (idx 0-2) / col-span-3 (idx 3-4), zero col-start-2 remains,
ChevronDown imported and used, ArrowRight import removed, footer always renders,
enSavoirPlus key present in common.json actions section.
  </done>
</task>

<task type="auto">
  <name>Task 2: Commit source change, then verify</name>
  <files>src/components/sections/pour-qui.tsx, src/locales/fr/common.json</files>
  <action>
Commit the Task 1 changes first, before running any verification commands (project
rule: commit before verify). Use git to stage exactly the two files touched in Task 1
and commit with message:

`#feat: two-column split on Pour qui second row, always-on footer affordance`

Then run, in order, and report real output for each:
- `npm run lint`
- `npm run typecheck`
- `npm run content:check`

`content:check` is expected to exit 1 (it's a gate that always fails while mock
content is unregistered) — confirm the reported blocked-key set is IDENTICAL to what
it was before this change (same count, same key names). If `enSavoirPlus` appears
anywhere in its output, the key was mis-registered as content instead of a static
label — find where and remove it from whatever registry picked it up.

Do NOT run `npm run build`.
  </action>
  <verify>
    <automated>npm run lint && npm run typecheck; npm run content:check</automated>
  </verify>
  <done>
One commit created with the exact message above containing only the two source files.
lint and typecheck exit 0. content:check exits 1 with the same key set as before
(enSavoirPlus absent from its blocked-keys output).
  </done>
</task>

<task type="auto">
  <name>Task 3: Append D-105 to D-107 in 02-CONTEXT.md</name>
  <files>.planning/phases/02-site-public/02-CONTEXT.md</files>
  <action>
Read .planning/phases/02-site-public/02-CONTEXT.md's Decisions section to match its
exact bullet format (as used for D-96 through D-104: `- **D-XXX** (2026-09-04,
fondateur) — ...`). Append three new bullets immediately after the D-104 line, before
the `### Claude's Discretion` heading:

- **D-105** (2026-09-04, fondateur) — la deuxième rangée de "Pour qui" devient deux
  cartes de 3 colonnes ; les six colonnes sont consommées sur les deux rangées ;
  `lg:col-start-2` est retiré.
- **D-106** (2026-09-04, fondateur) — le mécanisme de repli au survol est conservé
  (décision fondateur) mais la carte porte désormais un repère permanent (libellé +
  chevron) qui pivote à l'ouverture ; le repère est masqué là où le survol n'existe pas,
  puisque la description y est déjà toujours ouverte.
- **D-107** (2026-09-04, fondateur) — le pied de carte n'est plus conditionné à
  `donnees.accroche` ; il s'affiche toujours, et ne montre `titre` que lorsqu'une
  accroche distincte existe, pour éviter de dupliquer le titre.

Commit this file alone with message:

`#docs: record D-105 to D-107 pour-qui footer decisions`
  </action>
  <verify>
    <automated>grep -c "D-105\|D-106\|D-107" .planning/phases/02-site-public/02-CONTEXT.md</automated>
  </verify>
  <done>
D-105, D-106, D-107 present in 02-CONTEXT.md immediately after D-104, matching
existing bullet format. Separate commit created touching only 02-CONTEXT.md.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

None — this is a static UI edit with no new input surface, no new external data source.

## STRIDE Threat Register

No new threats introduced. Card content already flows through `profilDonneesSchema`
(existing boundary validation, untouched by this plan).
</threat_model>

<verification>
- Grid: grep confirms `lg:col-span-3` present and `lg:col-start-2` absent in
  pour-qui.tsx.
- Footer: grep confirms `ChevronDown` imported/used, `ArrowRight` absent, footer div
  no longer wrapped in a `hasAccroche` ternary (no `{hasAccroche ? (` before the
  footer's `<div className="mt-1`).
- Locale: `enSavoirPlus` present in common.json under `actions`, absent from
  `_mocks.public.json` and from `content:check` output.
- `npm run lint` / `npm run typecheck` exit 0. `npm run content:check` exits 1 with
  the pre-existing key set (no new blocked keys).
</verification>

<success_criteria>
- Second row renders two 3-col cards (no centered single card).
- Footer (label + chevron) renders on every card regardless of accroche.
- Footer hidden under `[@media(hover:none)]`.
- Two atomic commits: one source (`#feat`), one docs (`#docs`).
- lint/typecheck clean, content:check gate unchanged in shape.
</success_criteria>

<output>
Create `.planning/quick/260904-rex-run-6-cartes-pour-qui-grille-col-span-re/260904-rex-SUMMARY.md` when done
</output>
