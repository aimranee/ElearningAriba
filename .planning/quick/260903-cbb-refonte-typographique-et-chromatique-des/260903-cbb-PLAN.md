---
phase: quick
plan: 260903-cbb
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/globals.css
  - src/components/sections/section.tsx
  - src/components/sections/faq.tsx
  - src/components/sections/pour-qui.tsx
  - src/components/sections/hero.tsx
  - src/components/sections/programme-accordion.tsx
  - src/components/sections/format-modalites.tsx
  - src/components/sections/confiance.tsx
  - src/components/sections/cta-final.tsx
  - .planning/phases/02-site-public/02-CONTEXT.md
autonomous: true
requirements: []
must_haves:
  truths:
    - "No literal rem text-size utility remains in the seven landing sections or section.tsx — every size is text-[length:var(--text-x)]"
    - "Every text-[length:var(--x)] added by this run is paired with leading-[var(--x--line-height)] except the eight lines the brief marks 'garder le leading'"
    - "The tone=\"band\" tint renders as a flat --violet-band fill, no gradient, in the four sections that carry it"
    - "section.tsx's bg-clip-text accent gradient and faq.tsx's closing-link hover use the AA-corrected color stops (indigo/deep/azur-ink and violet-ink)"
    - "pour-qui's five profile accents read from the wash/ink palette with zero color-mix() left in the file, exposed via --card-wash not --card-accent"
    - "D-85 through D-91 are recorded verbatim in 02-CONTEXT.md, in the existing bullet format, after D-84"
  artifacts:
    - path: "src/app/globals.css"
      provides: "--violet-band: #e7ebff token in :root, one new line, no other token touched"
    - path: "src/components/sections/section.tsx"
      provides: "flat --violet-band fill for tone=band, corrected accent gradient, --text-micro eyebrow"
    - path: "src/components/sections/pour-qui.tsx"
      provides: "PROFIL_ACCENTS on wash/ink palette, --card-wash rename, color-mix removed"
    - path: ".planning/phases/02-site-public/02-CONTEXT.md"
      provides: "D-85..D-91"
  key_links:
    - from: "src/components/sections/section.tsx"
      to: "src/app/globals.css"
      via: "bg-[var(--violet-band)]"
      pattern: "var\\(--violet-band\\)"
    - from: "src/components/sections/pour-qui.tsx"
      to: "PROFIL_ACCENTS wash/ink values"
      via: "style --card-wash"
      pattern: "--card-wash"
---

<objective>
Run 3 of 5 in the scale/palette rework: migrate the seven remaining landing sections (`hero`, `pour-qui`, `programme-accordion`, `format-modalites`, `confiance`, `cta-final`, `faq`) plus the shared `section.tsx` shell onto the run-1 type tokens and run-2-adjacent palette. Every change is a fixed correspondence written in `ariba-cto/notes/2026-09-03-brief-run-3-sept-sections-sur-les-crans.md` — no value in this plan is chosen, all 33 size mappings, the one gradient-to-flat-color swap, two contrast fixes, and one accent-palette migration are copied from that brief's tables.

Purpose: after this run the eight type tokens laid in run 1 are fully consumed and no literal `rem` text size remains anywhere in the landing except `competences.tsx` (finished in run 2) and geometry (explicitly out of scope, run 4).
Output: nine source files migrated, one new CSS token, D-85..D-91 recorded in `02-CONTEXT.md`.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@C:/Users/Essakhi/Desktop/ElearningSAP/ariba-cto/notes/2026-09-03-brief-run-3-sept-sections-sur-les-crans.md
@src/app/globals.css
@src/components/sections/section.tsx
@src/components/sections/faq.tsx
@src/components/sections/pour-qui.tsx
@src/components/sections/hero.tsx
@src/components/sections/programme-accordion.tsx
@src/components/sections/format-modalites.tsx
@src/components/sections/confiance.tsx
@src/components/sections/cta-final.tsx
@.planning/phases/02-site-public/02-CONTEXT.md
</context>

<interfaces>
Tokens available in `src/app/globals.css` `@theme inline` (run 1, unchanged this run):
`--text-display` (36→60px) / `--text-title` (28→40px) / `--text-section` (24px) / `--text-lead` (18px) / `--text-card` (20px) / `--text-body` (16px) / `--text-small` (14px) / `--text-micro` (12px), each with a paired `--x--line-height`.

D-79 syntax rule (already fixed at four sites in run 1, must be followed at every new site this run): every arbitrary text-size utility is `text-[length:var(--x)]`. Writing `text-[var(--x)]` compiles to `color:` in Tailwind v4 and the size silently fails — this is the single most important thing to get right in every task below.

Leading rule: pair every new `text-[length:var(--x)]` with `leading-[var(--x--line-height)]`, **except** these eight sites, which the brief marks "garder le leading" (line-height there serves geometry — badge/pastille/circle/medallion — not reading) — change only the size class at these sites, do not add or alter any leading:
`section.tsx:60`, `cta-final.tsx:55` (both already carry `leading-none` — keep it), `programme-accordion.tsx:80`, `confiance.tsx:68`, `cta-final.tsx:102` (these three carry no leading class today — add none).
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: globals.css token + section.tsx (band flat color, accent-gradient contrast fix, eyebrow token)</name>
  <files>src/app/globals.css, src/components/sections/section.tsx</files>
  <action>
In `src/app/globals.css`, inside `:root`, add exactly one new line `--violet-band: #e7ebff;` immediately after the existing `--coral-ink: #b3413c;` line (end of the wash/soft/ink block that run 1 added, right before the blank line preceding the "shadcn surface aliases" comment). Do not delete, reorder, or redefine any other token — the count goes from 26 to 27 per the brief.

In `src/components/sections/section.tsx`:
- Line ~27, the `tone === "band"` gradient class `bg-[linear-gradient(180deg,rgba(241,240,255,0),var(--lav2)_18%,var(--lav2)_82%,rgba(241,240,255,0))]` becomes the flat `bg-[var(--violet-band)]`. Do not touch `--lav2` in globals.css — it keeps its one remaining consumer, `--muted: var(--lav2)`.
- Line ~68, the `bg-clip-text` accent gradient `bg-[linear-gradient(100deg,var(--violet)_0%,var(--deep)_42%,var(--blue)_100%)]` becomes `bg-[linear-gradient(100deg,var(--indigo)_0%,var(--deep)_42%,var(--azur-ink)_100%)]` (C1: the `--blue` bound measured 3.59 on `--paper`, already failing AA before this run; the new bounds measure 6.67/5.31/4.74 on the band).
- Line ~60, the eyebrow span's `text-[0.72rem]` becomes `text-[length:var(--text-micro)]`. Keep its existing `leading-none` unchanged (garder le leading) — do not add a `leading-[var(--text-micro--line-height)]` here.

Nothing else in this file changes: the `tone="band"`/`tone="default"` API, the `SectionHeader` structure, and the `--text-title`/`--text-lead` sites already on tokens from run 1 stay as they are.
  </action>
  <verify>
    <automated>grep -c "violet-band" src/app/globals.css src/components/sections/section.tsx</automated>
  </verify>
  <done>globals.css has exactly one new --violet-band line; section.tsx's band tone is a flat color, its accent gradient uses indigo/deep/azur-ink, and its eyebrow uses text-[length:var(--text-micro)] with leading-none intact.</done>
</task>

<task type="auto">
  <name>Task 2: faq.tsx — three size mappings + closing-link contrast fix</name>
  <files>src/components/sections/faq.tsx</files>
  <action>
Apply per the brief's tables:
- Line ~80, the question `<span>`'s `text-[1.02rem]` becomes `text-[length:var(--text-card)] leading-[var(--text-card--line-height)]`.
- Line ~85, `AccordionPanel`'s `text-[0.96rem] leading-[1.65]` becomes `text-[length:var(--text-body)] leading-[var(--text-body--line-height)]`.
- Line ~93, the closing paragraph's `text-[0.96rem] leading-[1.65]` becomes `text-[length:var(--text-body)] leading-[var(--text-body--line-height)]`.
- Line ~96 (C2), the closing `<Link>`'s `hover:text-[var(--violet)]` becomes `hover:text-[var(--violet-ink)]` — the link sits directly on the band (not on a card); base `--deep` already passes at 5.31, but the old hover fell to 3.96, the new one measures 4.76.

Do not touch the accordion mechanics, `defaultValue`, or the question/answer data flow.
  </action>
  <verify>
    <automated>grep -c "text-\[length:var(--text-card)\]\|text-\[length:var(--text-body)\]\|violet-ink" src/components/sections/faq.tsx</automated>
  </verify>
  <done>All three FAQ text sizes render via text-[length:var(...)] tokens with paired leading; hover state on the closing link uses --violet-ink.</done>
</task>

<task type="auto">
  <name>Task 3: pour-qui.tsx — palette migration, --card-wash rename, color-mix removal, three size mappings</name>
  <files>src/components/sections/pour-qui.tsx</files>
  <action>
Replace the `PROFIL_ACCENTS` table (and `FALLBACK`) with the new wash/ink palette per the brief's D-section table — keep the same `{ accent: string; ink: string }` shape and the same object keys, only the values change:
- `acheteur`: `accent: "var(--violet-wash)"`, `ink: "var(--violet-ink)"`
- `category-manager`: `accent: "var(--azur-wash)"`, `ink: "var(--azur-ink)"`
- `supply-chain`: `accent: "var(--mint-wash)"`, `ink: "var(--mint-ink)"`
- `consultant`: `accent: "var(--magenta-wash)"`, `ink: "var(--magenta-ink)"`
- `etudiant`: `accent: "var(--amber-wash)"`, `ink: "var(--amber-ink)"`
- `FALLBACK`: `accent: "var(--violet-wash)"`, `ink: "var(--violet-ink)"`

Rename the exposed CSS custom property `--card-accent` to `--card-wash` everywhere it appears in this file:
- The `style` prop on `Card` (`"--card-accent": accentInk.accent`) becomes `"--card-wash": accentInk.accent`. Leave `"--card-ink": accentInk.ink` as-is.
- The `Card` className's `group-hover:bg-[linear-gradient(160deg,color-mix(in_srgb,var(--card-accent)_10%,white)_0%,white_62%)] group-focus-within:bg-[linear-gradient(160deg,color-mix(in_srgb,var(--card-accent)_10%,white)_0%,white_62%)]` becomes `group-hover:bg-[linear-gradient(160deg,var(--card-wash)_0%,white_62%)] group-focus-within:bg-[linear-gradient(160deg,var(--card-wash)_0%,white_62%)]` — both `group-hover:` and `group-focus-within:` lose their `color-mix(...)` wrapper, using the wash directly as the gradient's start stop.
- The pictogram medallion's `bg-[color-mix(in_srgb,var(--card-accent)_14%,white)]` becomes `bg-[var(--card-wash)]`.

There must be zero occurrences of `color-mix` and zero occurrences of `--card-accent` left in this file after these edits. The pictogram and the `titre` footer text keep reading `var(--card-ink)` — that is unchanged and intentional (D-84 forbids a hue's own ink on its own `soft`, not on its `wash`).

Apply the three size mappings:
- Line ~100, `CardTitle`'s `text-[1.05rem] leading-[1.3]` becomes `text-[length:var(--text-card)] leading-[var(--text-card--line-height)]` — write this as an explicit override (do not delete the size class); `CardTitle`'s own default is `--text-section` (24px), so removing the override would silently grow the title to 24px.
- Line ~105, `CardDescription`'s `text-[0.94rem] leading-[1.6]` becomes `text-[length:var(--text-small)] leading-[var(--text-small--line-height)]`.
- Line ~112, the footer `titre` `<span>`'s `text-[0.9rem]` becomes `text-[length:var(--text-small)] leading-[var(--text-small--line-height)]`.

Do not touch the hover/focus reveal mechanics (`grid-rows-[0fr]`/`grid-rows-[1fr]`), the `Reveal` wrapper, the grid column spans, or the `Link`/`aria-label` structure.
  </action>
  <verify>
    <automated>grep -c "color-mix\|card-accent" src/components/sections/pour-qui.tsx</automated>
  </verify>
  <done>grep above returns 0; PROFIL_ACCENTS/FALLBACK read wash/ink tokens; --card-wash is the only exposed CSS var driving the medallion and hover/focus gradient; CardTitle explicitly overrides to --text-card; description and footer title read --text-small.</done>
</task>

<task type="auto">
  <name>Task 4: hero.tsx — five size mappings + display cran</name>
  <files>src/components/sections/hero.tsx</files>
  <action>
Apply per the brief's tables (all five are new leading pairings — none of hero.tsx's sites are on the "garder le leading" list):
- Line ~106, the H1's `text-[clamp(2.5rem,4.6vw,3.9rem)] leading-[1.04]` becomes `text-[length:var(--text-display)] leading-[var(--text-display--line-height)]`. Leave `font-heading`, `font-extrabold`, `tracking-[-0.032em]`, `text-balance` untouched.
- Line ~154, the chip `<li>`'s `text-[0.82rem]` becomes `text-[length:var(--text-small)] leading-[var(--text-small--line-height)]`.
- Line ~172, the `frameLabel` `<span>`'s `text-[0.72rem]` becomes `text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)]`.
- Line ~186, the pill `<div>`'s `text-[0.84rem]` becomes `text-[length:var(--text-small)] leading-[var(--text-small--line-height)]`.
- Line ~205, the badge `<span>`'s `text-[0.6rem]` becomes `text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)]`.

The badge growing ~25% (10px→12px) is the accepted outcome of D-86 — if the mockup stops reading as a scaled-down interface, that is a geometry fix for a later run, not a typography reversal here. Do not touch `AssemblyCard`, `AssemblyConnectors`, `HeroSpotlight`, `Magnetic`, the typewriter split logic, or any brand gradient (`hero.tsx:20`/`:203` stay untouched).
  </action>
  <verify>
    <automated>grep -c "text-\[length:var(--text-display)\]\|text-\[length:var(--text-small)\]\|text-\[length:var(--text-micro)\]" src/components/sections/hero.tsx</automated>
  </verify>
  <done>All five hero.tsx sites render via text-[length:var(...)] tokens with paired leading; no literal rem text size remains in the file.</done>
</task>

<task type="auto">
  <name>Task 5: programme-accordion.tsx — seven size mappings</name>
  <files>src/components/sections/programme-accordion.tsx</files>
  <action>
Apply per the brief's tables:
- Line ~80, the module-number `<span>`'s `text-[0.78rem]` becomes `text-[length:var(--text-micro)]` — garder le leading (circle 34px context, no leading class present, add none).
- Line ~84, the module-title `<span>`'s `text-[1.02rem]` becomes `text-[length:var(--text-card)] leading-[var(--text-card--line-height)]`.
- Line ~87, the duration pastille `<span>`'s `text-[0.8rem]` becomes `text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)]`.
- Line ~92, `AccordionPanel`'s `text-[0.96rem] leading-[1.65]` becomes `text-[length:var(--text-body)] leading-[var(--text-body--line-height)]`.
- Line ~93, the description `<p>`'s `text-[0.96rem] leading-[1.65]` becomes `text-[length:var(--text-body)] leading-[var(--text-body--line-height)]`.
- Line ~98, the "Au programme" `<p>`'s `text-[0.72rem]` becomes `text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)]`.
- Line ~105, each content-line `<li>`'s `text-[0.92rem] leading-[1.55]` becomes `text-[length:var(--text-small)] leading-[var(--text-small--line-height)]`.

Both accordions (this file and faq.tsx) are expected to grow vertically per D-85 — that is accepted, do not compensate with padding or line-height changes outside what is specified above. Leave the accordion mechanics, `defaultValue`, `formatHours`, and the PDF/reservation CTAs untouched.
  </action>
  <verify>
    <automated>grep -c "text-\[length:var(--text-" src/components/sections/programme-accordion.tsx</automated>
  </verify>
  <done>All seven sites use text-[length:var(...)] tokens with the specified leading pairing (or explicitly none where marked garder); no literal rem text size remains in the file.</done>
</task>

<task type="auto">
  <name>Task 6: format-modalites.tsx + confiance.tsx — one and six size mappings</name>
  <files>src/components/sections/format-modalites.tsx, src/components/sections/confiance.tsx</files>
  <action>
In `format-modalites.tsx`, line ~85, the intro `<p>`'s `text-[0.98rem] leading-[1.6]` becomes `text-[length:var(--text-body)] leading-[var(--text-body--line-height)]`. Nothing else in this file changes — it stays out of scope beyond this one line.

In `confiance.tsx`, apply per the brief's tables:
- Line ~59, the eyebrow `<span>`'s `text-[0.68rem]` becomes `text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)]`.
- Line ~68, the medallion `<span>`'s `text-[1.1rem]` becomes `text-[length:var(--text-card)]` — garder le leading (64px medallion context, no leading class present, add none).
- Line ~73, the formateur-name `<p>`'s `text-[1.02rem]` becomes `text-[length:var(--text-card)] leading-[var(--text-card--line-height)]`.
- Line ~74, the intitulé `<p>`'s `text-[0.88rem]` becomes `text-[length:var(--text-small)] leading-[var(--text-small--line-height)]`.
- Line ~81, each proof-point `<li>`'s `text-[0.88rem]` becomes `text-[length:var(--text-small)] leading-[var(--text-small--line-height)]`.
- Line ~90, the "en savoir plus" `<Link>`'s `text-[0.85rem]` becomes `text-[length:var(--text-small)] leading-[var(--text-small--line-height)]`.

Do not touch `ConfianceFaits`, the photo-placeholder comment, or the icon mapping.
  </action>
  <verify>
    <automated>grep -c "text-\[length:var(--text-" src/components/sections/format-modalites.tsx src/components/sections/confiance.tsx</automated>
  </verify>
  <done>format-modalites.tsx's intro paragraph and all six confiance.tsx sites use text-[length:var(...)] tokens per the mapping above; no literal rem text size remains in either file.</done>
</task>

<task type="auto">
  <name>Task 7: cta-final.tsx — six size mappings including the two remaining high crans</name>
  <files>src/components/sections/cta-final.tsx</files>
  <action>
Apply per the brief's tables:
- Line ~55, the eyebrow `<span>`'s `text-[0.72rem]` becomes `text-[length:var(--text-micro)]` — keep the existing `leading-none` unchanged (garder le leading).
- Line ~60 (high cran), the H2's `text-[clamp(2rem,4vw,3rem)] leading-[1.08]` becomes `text-[length:var(--text-title)] leading-[var(--text-title--line-height)]` (D-87: 48px→40px, one size per title rank). Leave `font-heading`, `font-extrabold`, `tracking-[-0.028em]`, `text-balance` untouched.
- Line ~65 (high cran), the lead `<p>`'s `text-[1.1rem] leading-[1.6]` becomes `text-[length:var(--text-lead)] leading-[var(--text-lead--line-height)]`.
- Line ~93, the "les étapes" `<h3>`'s `text-[0.95rem]` becomes `text-[length:var(--text-body)] leading-[var(--text-body--line-height)]` — it keeps its own `font-bold tracking-[-0.01em]`.
- Line ~102, the step-number circle `<span>`'s `text-[0.95rem]` becomes `text-[length:var(--text-small)]` — garder le leading (34px circle context, no leading class present, add none).
- Line ~106, the step-title `<strong>`'s `text-[0.92rem]` becomes `text-[length:var(--text-small)] leading-[var(--text-small--line-height)]`.
- Line ~107, the step-description `<span>`'s `text-[0.85rem] leading-[1.5]` becomes `text-[length:var(--text-small)] leading-[var(--text-small--line-height)]`.

Lines 106 and 107 both land on 14px (`--text-small`) — they stay distinguished by weight (`font-bold` vs regular) and opacity (`text-white` vs `text-white/82`), unchanged from today. Do not touch the panel's brand gradient, the grid dot background, the two `Button`s, or the step-row `bg-black/10` contrast fix from a prior run.
  </action>
  <verify>
    <automated>grep -c "text-\[length:var(--text-" src/components/sections/cta-final.tsx</automated>
  </verify>
  <done>All six cta-final.tsx sites use text-[length:var(...)] tokens per the mapping above (h2 at --text-title, lead at --text-lead); no literal rem text size remains in the file.</done>
</task>

<task type="auto">
  <name>Task 8: Record D-85..D-91, run verification, confirm branch</name>
  <files>.planning/phases/02-site-public/02-CONTEXT.md</files>
  <action>
Append seven new decision bullets, `D-85` through `D-91`, to `02-CONTEXT.md`'s existing decision list, immediately after the `D-84` bullet, in the same bullet format (`- **D-XX** (date, attribution): ...`). Use the exact wording from the brief's "Décisions à consigner" section, verbatim, dated 2026-09-03:

- D-85 (fondateur): les titres d'accordéon et de carte des sept sections passent sur --text-card (20 px), +23 % sur les deux accordéons, croissance verticale acceptée.
- D-86 (fondateur): les six tailles de surtitre passent toutes sur --text-micro sans exemption ; la maquette du héros s'ajuste par sa géométrie, pas par sa typo.
- D-87 (fondateur): le h2 du CTA final descend de 48 à 40 px — une seule taille par rang de titre.
- D-88 (fondateur): la bande devient un aplat plein --violet-band #E7EBFF. --violet-wash a été mesuré à ΔE 2,56 du papier, sous le seuil du perceptible ; #E7EBFF est à 5,42 et le plancher AA de --muted-ink (4,57) interdit d'aller plus bas.
- D-89 (fondateur): les cinq accents de pour-qui migrent sur la nouvelle palette ; le médaillon prend le wash en aplat direct et les deux color-mix disparaissent.
- D-90 (CTO): le dégradé bg-clip-text du mot accentué échouait à AA sur sa borne --blue (3,59 sur --paper) avant ce run, sur les sept sections et les pages internes. Remplacé par --indigo → --deep → --azur-ink (6,67 / 5,31 / 4,74 sur la bande).
- D-91 (fondateur): la géométrie — 28 paddings, 22 gouttières, 13 rayons — reste hors du run 3 ; c'est le run 4.

Then run, in order, and capture the real exit codes/output of each (do not run `npm run build` — it would overwrite `.next` and serve stale code to the CTO's later Playwright verification):
1. `npm run lint`
2. `npm run typecheck`
3. `npm run content:check`

`content:check` is expected to exit 1 (`faq.items` blocked on CADR-03, pre-existing, unrelated to this run) — do not attempt to fix it. `lint` and `typecheck` are expected to exit 0.

Finally, run `git rev-parse --abbrev-ref HEAD` and confirm it prints `gsd/phase-02-site-public`.
  </action>
  <verify>
    <automated>grep -c "D-85\|D-86\|D-87\|D-88\|D-89\|D-90\|D-91" .planning/phases/02-site-public/02-CONTEXT.md</automated>
  </verify>
  <done>D-85..D-91 present verbatim in 02-CONTEXT.md after D-84; lint and typecheck exit 0; content:check exits 1 with faq.items as the only new/expected blocker (no regression beyond it); branch confirmed as gsd/phase-02-site-public.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

None new. This run is a styling/token migration across existing server components — no new input surface, no new data flow, no new external dependency, no npm/pip/cargo install.

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|------------------|
| T-cbb-01 | Tampering | pour-qui.tsx style prop (`--card-wash`/`--card-ink` inline CSS vars) | accept | Values are hardcoded `var(--token)` string literals from a closed enum (PROFIL_ACCENTS), never derived from user/database input — no injection surface |
</threat_model>

<verification>
1. `grep -c "violet-band" src/app/globals.css src/components/sections/section.tsx` — both files show the new token/consumer.
2. `grep -rc "text-\[0\.\|text-\[clamp\|text-\[1\." src/components/sections/{hero,pour-qui,programme-accordion,format-modalites,confiance,cta-final,faq,section}.tsx` returns 0 across all eight files (no literal rem/clamp text size remains).
3. `grep -c "color-mix" src/components/sections/pour-qui.tsx` returns 0.
4. `grep -c "D-9[01]" .planning/phases/02-site-public/02-CONTEXT.md` returns >= 1 (confirms D-90/D-91 present, proxy for the full D-85..D-91 block).
5. `npm run lint` exits 0.
6. `npm run typecheck` exits 0.
7. `npm run content:check` exits 1 (pre-existing `faq.items`/CADR-03 gate, not a regression).
8. `git rev-parse --abbrev-ref HEAD` prints `gsd/phase-02-site-public`.
</verification>

<success_criteria>
- All 33 size mappings from the brief applied with `text-[length:var(--x)]` syntax and correct leading pairing (or explicit no-leading at the eight "garder" sites).
- The band is a flat `--violet-band` fill, no gradient, in `section.tsx`.
- The two contrast fixes (accent gradient in `section.tsx`, hover link in `faq.tsx`) are applied per the brief's replacement values.
- `pour-qui.tsx`'s five accents read the new wash/ink palette, `--card-wash` replaces `--card-accent`, zero `color-mix` remains.
- No geometry (padding/gutter/radius), no gradient under "Ce qui ne change pas", no content, and no migration touched.
- D-85..D-91 recorded verbatim in `02-CONTEXT.md`.
- `lint`/`typecheck` exit 0; `content:check` exits 1 with no new blocker beyond the pre-existing `faq.items`.
- Nothing pushed; branch remains `gsd/phase-02-site-public`.
</success_criteria>

<output>
Create `.planning/quick/260903-cbb-refonte-typographique-et-chromatique-des/260903-cbb-SUMMARY.md` when done
</output>
