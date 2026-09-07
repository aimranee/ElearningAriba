---
task: 260907-opw
type: quick
branch: cto/landing-v3
autonomous: true
files_modified:
  - src/components/icons/google-mark.tsx
  - src/locales/fr/common.json
  - src/locales/fr/inscription.json
  - src/components/compte/auth-shell.tsx
  - src/app/globals.css
  - src/components/illustrations/espace-fenetre.tsx
  - src/components/illustrations/parcours-etapes.tsx
  - src/app/connexion/page.tsx
  - src/app/inscription/page.tsx
  - src/app/mot-de-passe-oublie/page.tsx
  - src/app/nouveau-mot-de-passe/page.tsx
  - src/components/compte/connexion-form.tsx
  - src/components/compte/inscription-form.tsx
---

<objective>
Auth v2 "panneau + formulaire": recompose the four authentication surfaces (connexion,
inscription, mot-de-passe-oublie, nouveau-mot-de-passe) onto a night brand panel beside
the form column, lead both forms with Google, raise every field/button to 44px. Four
atomic commits per `2026-09-07-brief-refonte-auth-v2.md` §G, each independently buildable;
verification runs once at the end.

Purpose: land the founder-approved auth v2 maquette (`2026-09-07-maquette-auth-v2.html`)
on `cto/landing-v3` ahead of landing runs D/E, per the brief's decision 6.
Output: four commits; three new files (`google-mark.tsx`, `espace-fenetre.tsx`,
`parcours-etapes.tsx`); a final verification pass (lint, typecheck, build, content:check,
git status) run once after all four commits.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md

Source brief and maquette (read-only, external to repo — do not modify):
@C:/Users/Essakhi/Desktop/ElearningSAP/ariba-cto/notes/2026-09-07-brief-refonte-auth-v2.md
@C:/Users/Essakhi/Desktop/ElearningSAP/ariba-cto/notes/2026-09-07-maquette-auth-v2.html

Code to change:
@src/components/compte/auth-shell.tsx
@src/app/connexion/page.tsx
@src/app/inscription/page.tsx
@src/app/mot-de-passe-oublie/page.tsx
@src/app/nouveau-mot-de-passe/page.tsx
@src/components/compte/connexion-form.tsx
@src/components/compte/inscription-form.tsx
@src/locales/fr/common.json
@src/locales/fr/inscription.json
@src/app/globals.css

Read-only reference:
@src/components/sections/section.tsx
@src/components/ui/input.tsx
@src/components/ui/field.tsx
@src/components/ui/button.tsx
@src/components/motion/reveal.tsx
@src/components/illustrations/mini-calendrier.tsx
@src/components/motion/format-deroule.tsx
@src/locales/fr/landing.json
@src/locales/fr/mot-de-passe.json
@src/locales/fr/connexion.json
@src/lib/utils.ts
</context>

<interfaces>
<!-- Facts already verified in the repo at the time this plan was written.
     Executor must still re-verify anything time-sensitive per the
     STOP-and-report rule below — these are a starting point, not a
     substitute for reading the live files. -->

**`AuthShell` current signature** (`src/components/compte/auth-shell.tsx`, 40 lines):
`AuthShell({ titre, intro, largeur = "md", children })` — centred title block then
children, no panel, no Google, no illustration. Signature is kept; `entete?: string` and
`illustration?: ReactNode` are added, both optional, so the four pages still compile
before Task 3 rewires them.

**`inputVariants` (`src/components/ui/input.tsx`)**: base `h-8` (32px); `size` variants
are only `default` (empty) and `sm` (`h-7`) — **no size variant reaches 44px.** `FieldControl`
(`field.tsx:48-63`) composes `inputVariants({ size, className })` through `cn` (`clsx` +
`tailwind-merge`, `src/lib/utils.ts`), so a `className="h-11"` passed to `FieldControl`
wins over the `h-8` base via tailwind-merge's own-property override — this is the correct,
only mechanism (confirmed): never edit `input.tsx`.

**`buttonVariants` (`src/components/ui/button.tsx`)**: base/`outline` variant height is
`h-8`; no 44px variant exists either. Same `cn`/tailwind-merge override applies:
`className="h-11 w-full"` on a `<Button>` wins over the variant's `h-8`.

**`connexion.json` already has `"google": "Continuer avec Google"`** as a top-level key
(sibling of `titre`/`intro`/`champs`/`motDePasseOublie`) — Task 1 duplicates this exact
sentence into `inscription.json` under the same key name, top-level (sibling of `titre`/
`intro`/`champs`), not nested under `champs`.

**`landing.json` `formatModalites.apercu.nonContractuel`** = "Aperçu de l'interface —
exemple non contractuel." (line 142, nested under `formatModalites.apercu`, not
top-level — the brief's "landing.json:142" reference resolves to this nested path). Task 2
imports `landing` and reads exactly this path for the panel caption.

**`common.json` `nav.espace`** = "Mon espace", `metadata.title` = "Formation SAP Ariba" —
both exist today; Task 2's `EspaceFenetre` composes its window-bar title as
`${common.nav.espace} · ${common.metadata.title}`.

**Window-chrome dot colours precedent (`src/components/motion/format-deroule.tsx:121-123`)**:
three `span` elements, class `size-2.5 rounded-full`, inline `style={{ background:
"#FF5F57" }}` (and `#FEBC2E`, `#28C840`) — decorative macOS-chrome convention, explicitly
exempted from D-02's no-raw-hex rule by prior run C. Task 2's two illustrations reproduce
this exact markup/values verbatim, not a new mechanism.

**`Reveal` (`src/components/motion/reveal.tsx`)**: `Reveal({ as, dataD, className,
children })`, `dataD` is `1 | 2 | 3 | 4 | 5`, renders the element with class `reveal`
merged with `className`, `data-d={dataD}`. `RevealScope` (mounted once in the app shell,
unchanged this run) adds class `in` on intersection or immediately under
`prefers-reduced-motion`.

**`globals.css` tokens already present, no new token needed**: `--night`, `--night-2`,
`--glass`, `--glass-2`, `--glass-line`, `--glass-line-2`, `--grid-dot-night`, `--azur-soft`,
`--violet-l`, `--mint`, `--mint-soft`. The maquette's window live-dot uses `--mint` (`.window
.bar .live i{background:var(--mint)}`) — mint, not the landing v3 hero's red `--live` dot;
confirm this against the maquette before writing Task 2's illustration. `@keyframes
pulse-live` already exists (`globals.css` around line 352) and animates `box-shadow` only —
colour-agnostic in the keyframe itself, the consuming element supplies colour via its own
`background`/inline style, matching the existing idiom.

**Header height / usable viewport**: `header.tsx` is fixed at 76px; the auth panel's
sticky offset and min-height both use `76px` literally (`top-[76px]`,
`calc(100svh-76px)`), matching `--header` in the maquette.

**FieldControl count in `inscription-form.tsx` — brief/code discrepancy, STOP-and-report
item**: the brief (§C-05) states "44px on all seven FieldControl including the select
render." A direct read of the current file (270 lines) for this plan found exactly **six**
`FieldControl` elements: `prenom`, `nom`, `email`, `motDePasse`, `confirmation`, `profil`
(the select). No seventh field exists in the file as read. Task 4 must re-count
`FieldControl` occurrences in the live file before editing; if the count is still six,
apply the 44px `className="h-11"` to all six and report this brief/code mismatch in the
final summary rather than inventing a seventh field. If a seventh has appeared for any
reason, treat the brief as correct, cover all seven, and still report the discrepancy
against what this plan measured.
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1 (COMMIT 1): Google mark icon and the separator string</name>
  <files>src/components/icons/google-mark.tsx, src/locales/fr/common.json, src/locales/fr/inscription.json</files>
  <action>
Per brief §A (the single explicit raw-hex exception) and §D. No page or form changes in
this task — Task 4 wires the icon and the new strings into the forms.

**New file `src/components/icons/google-mark.tsx`**: a server component (no `"use
client"`), named export `GoogleMark`, signature `GoogleMark(props: ComponentProps<"svg">)`,
mirroring the shape of `src/components/icons/pictograms.tsx`'s `PictogramBase` (viewBox,
spread `...props`, `aria-hidden="true"` as a default the caller can override) but as its
own standalone file — do not add it into `pictograms.tsx`, whose own doc comment reserves
that file for domain pictograms, not third-party marks. Root svg: `viewBox="0 0 48 48"`,
`aria-hidden="true"`, `focusable="false"`, props spread last so a caller-supplied
`aria-hidden`/`className` can override the default. Contains the four official Google "G"
paths exactly as authored in the maquette (`2026-09-07-maquette-auth-v2.html`, identical
at both its call sites): path fill `#EA4335`, d `M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9
2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z`;
path fill `#4285F4`, d `M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26
5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z`; path fill `#FBBC05`, d `M10.53
28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0
3.88.92 7.54 2.56 10.78l7.97-6.19z`; path fill `#34A853`, d `M24 48c6.48 0 11.93-2.13
15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98
6.19C6.51 42.62 14.62 48 24 48z`. These four `fill` hex values are this file's sole
exception to the no-raw-hex rule (D-02) — nowhere else in this plan writes a new raw hex,
only the pre-existing window-chrome dots reused verbatim in Task 2. Do not set any size
default on the svg beyond the props spread — Task 4's call site sizes it via
`className="size-[18px]"`.

**`common.json`**: add a new top-level group `"formulaires": { "ou": "ou" }` (one key,
one word — the separator's word, replacing today's silent two-line-no-word divider).
Insert it anywhere at the top level (e.g. after `"photoSlot"`); keep the file valid JSON,
no trailing comma.

**`inscription.json`**: add a new top-level key `"google": "Continuer avec Google"` — same
sentence as `connexion.json`'s existing `google` key, same top-level position (sibling of
`titre`/`intro`/`champs`, not nested under `champs`). Nothing else in either JSON file
changes.
  </action>
  <verify>
    <automated>node -e "const c=require('./src/locales/fr/common.json'); const i=require('./src/locales/fr/inscription.json'); if(c.formulaires?.ou!=='ou') throw new Error('common.formulaires.ou missing'); if(i.google!=='Continuer avec Google') throw new Error('inscription.google missing'); console.log('locale keys ok')"</automated>
  </verify>
  <done>
`src/components/icons/google-mark.tsx` exists, exports `GoogleMark`, viewBox `0 0 48 48`,
four paths with the exact hex fills above and no other raw hex in the file. `common.json`
has `formulaires.ou === "ou"`. `inscription.json` has a top-level `google === "Continuer
avec Google"`. No page or form file touched yet. Commit with message
`#feat: add the Google mark icon and the form separator string`.
  </done>
</task>

<task type="auto">
  <name>Task 2 (COMMIT 2): AuthShell recomposed as a night panel beside the form column</name>
  <files>src/components/compte/auth-shell.tsx, src/app/globals.css, src/components/illustrations/espace-fenetre.tsx, src/components/illustrations/parcours-etapes.tsx</files>
  <action>
Per brief §C-01/C-02/C-03 and the maquette's `.auth`/`.panel`/`.panel .inner`/`.eyebrow`/
`.window`/`.steps` rules. The four pages still call `AuthShell` with only `titre`/`intro`/
`largeur` at the end of this task (props optional) — they keep compiling and rendering
their old plain layout until Task 3 passes `entete`/`illustration`.

**`auth-shell.tsx`**: keep the existing `titre`/`intro`/`largeur`/`children` props; add
`entete?: string` and `illustration?: ReactNode`. Import `Reveal` from
`@/components/motion/reveal`, `common` from `@/locales/fr/common.json`, `landing` from
`@/locales/fr/landing.json`.

Title split (accent rule): find the index of the first occurrence of `". "` in `titre`.
If none, render `titre` plain, no accent span. If found, the first sentence (up to and
including the period) renders as plain white text; the remainder (after the space)
renders inside a `<span className="bg-clip-text text-transparent
bg-[linear-gradient(100deg,var(--violet-l)_0%,var(--azur-soft)_100%)]">`, preceded by a
literal space so the two parts read as one sentence with no visible seam.

Root render, outermost: `<div className="lg:grid lg:grid-cols-[minmax(0,44fr)_minmax(0,56fr)]
lg:min-h-[calc(100svh-76px)]">` — this is the `.auth` grid, block (stacked) below `lg`
by default since `lg:grid` only applies at `lg` and above.

Panel `<aside data-slot="auth-panel" className="relative overflow-hidden text-white
bg-[linear-gradient(180deg,var(--night-2),var(--night)_70%)]
before:pointer-events-none before:absolute before:inset-0 before:content-['']
before:[background-image:radial-gradient(circle,var(--grid-dot-night)_1px,transparent_1.6px)]
before:[background-size:26px_26px]
before:[mask-image:radial-gradient(ellipse_80%_70%_at_50%_40%,#000_30%,transparent_80%)]
before:[-webkit-mask-image:radial-gradient(ellipse_80%_70%_at_50%_40%,#000_30%,transparent_80%)]
after:pointer-events-none after:absolute after:inset-0 after:content-['']
after:[background:radial-gradient(40%_45%_at_8%_0%,rgba(99,91,255,.38),transparent_70%),radial-gradient(35%_40%_at_100%_100%,rgba(15,126,166,.35),transparent_70%)]">`
— the `before`/`after` utility strings are copied verbatim from `section.tsx`'s `night`
tone (only the base background changes, from the flat `bg-[var(--night)]` to the two-stop
gradient the brief specifies).

Inside the aside, the sticky content block: `<div data-slot="auth-panel-inner"
className="relative z-[1] flex flex-col justify-center-safe gap-4 pt-9 px-5 pb-10
lg:sticky lg:top-[76px] lg:min-h-[calc(100svh-76px)] lg:gap-[1.4rem]
lg:px-[clamp(1.5rem,4.5vw,4.25rem)] lg:py-[clamp(2.5rem,5vw,4.5rem)]">` — the
`data-slot="auth-panel-inner"` attribute exists solely as the compact-CSS hook below (no
existing class targets this block precisely). Mobile-first: `pt-9 px-5 pb-10` (2.25rem /
1.25rem / 2.5rem, the brief's below-1024 band padding) with no min-height/sticky, both
added only at `lg:`.

First `<Reveal className="flex flex-col gap-4">` wraps the eyebrow and the `h1`:
eyebrow `<p className="inline-flex items-center gap-[0.55rem] text-[length:var(--text-micro)]
leading-none font-bold uppercase tracking-[.18em] text-[var(--azur-soft)]"><span
aria-hidden="true" className="h-0.5 w-[22px]
bg-[linear-gradient(90deg,var(--violet-l),var(--azur-soft))]" />{common.metadata.title}</p>`;
`h1` `className="text-[clamp(1.5rem,1.2rem+1.6vw,1.9rem)] lg:text-[length:var(--text-title)]
font-bold leading-[1.12] tracking-[-.025em] text-white"` rendering the split described
above (mobile clamp size below `lg`, the existing `--text-title` token at `lg` and above,
per the brief's below-1024 override).

Second `<Reveal dataD={1} className="hidden lg:block">` — rendered only when `illustration`
is truthy — wraps `{illustration}` followed by `<p className="mt-[0.7rem]
text-[length:var(--text-micro)] text-white/62">{landing.formatModalites.apercu.nonContractuel}</p>`.
When no `illustration` prop is passed, render nothing here (no empty Reveal).

Form column `<div className="flex items-center justify-center px-5 pt-9 pb-14 lg:px-5
lg:py-[clamp(2.5rem,6vw,5rem)]">` containing `<div className={cn("w-full flex flex-col
gap-5", largeur === "2xl" ? "max-w-[32rem]" : "max-w-[26rem]")}>`: `entete` renders as
`<h2 className="text-[length:var(--text-section)] font-bold tracking-[-.02em]
leading-[1.3] text-foreground">{entete}</h2>` only when provided; always render `<p
className="text-muted-foreground">{intro}</p>` beneath (present with or without `entete`
— `nouveau-mot-de-passe` has no `entete` but keeps its `intro`); then `{children}`.

**`globals.css`**: inside the existing `@layer components` block (do not open a second
`@layer components`), add one new media rule, keyed on the two `data-slot` hooks above —
no new token, no new `@keyframes`. The rule text to add, verbatim as plain CSS (not a code
fence — write it directly into the file):

@media (min-width: 1024px) and (max-width: 1279px), (min-width: 1024px) and (max-height: 860px) {
&#32; &#32;[data-slot="auth-panel"] h1 { font-size: 1.75rem; }
&#32; &#32;[data-slot="auth-panel-inner"] { padding-top: 2rem; padding-bottom: 2rem; }
&#32; &#32;[data-slot="fenetre-puces"] { display: none; }
}

**New file `src/components/illustrations/espace-fenetre.tsx`** (server component, no
`"use client"`, named export `EspaceFenetre`, mirroring `mini-calendrier.tsx`'s shape):
root `<div aria-hidden="true" className="pointer-events-none relative overflow-hidden
rounded-[22px] bg-[var(--night)] text-white shadow-[var(--shadow-2),0_0_0_1px_var(--glass-line)]">`.
Bar: `<div className="flex items-center gap-[0.4rem] border-b border-white/10 px-[0.9rem]
py-[0.75rem]">` with three `<span className="size-2.5 rounded-full"
style={{ background: "#FF5F57" }} />` / `"#FEBC2E"` / `"#28C840"` (verbatim precedent, see
`<interfaces>`), then `<span className="ml-2 min-w-0 flex-1 truncate whitespace-nowrap
text-[length:var(--text-micro)] font-semibold text-white/60">{`${common.nav.espace} ·
${common.metadata.title}`}</span>`, then the live badge `<span className="ml-auto
inline-flex flex-none items-center gap-[0.4rem] whitespace-nowrap rounded-full
bg-[rgba(31,199,155,.16)] px-[0.6rem] py-[0.25rem] text-[length:var(--text-micro)]
font-extrabold uppercase tracking-[0.06em] text-[var(--mint-soft)]"><span
aria-hidden="true" className="size-[7px] rounded-full bg-[var(--mint)]"
style={{ animation: "pulse-live 1.8s var(--ease-brand) infinite" }} />En direct</span>` —
"En direct" here is hardcoded illustration-only decorative text (D-112), not a translation
key (see brief §C-02's own framing of these micro-labels).

Scene: `<div className="bg-[linear-gradient(180deg,var(--night-2),var(--night))]
p-[1.15rem]">` containing a white card `<div className="rounded-2xl bg-white p-[1.1rem]
text-[var(--ink)] shadow-[var(--shadow-1)]">`: chip `<span className="inline-flex
items-center gap-[0.4rem] rounded-full bg-[var(--lav)] px-[0.6rem] py-[0.25rem]
text-[length:var(--text-micro)] font-extrabold uppercase tracking-[0.08em]
text-[var(--deep)]">Prochaine session</span>`; `<h3 className="mt-[0.6rem]
text-[length:var(--text-card)] font-bold tracking-[-.02em] leading-[1.3]">Votre créneau
réservé</h3>`; row `<div className="mt-[0.55rem] flex flex-wrap gap-[0.4rem_0.9rem]
text-[length:var(--text-small)] text-[var(--muted-ink)]"><b
className="text-[var(--ink)]">Session individuelle</b><span>Découverte de l'écosystème
Ariba</span></div>`; confirmed pill `<span className="mt-[0.6rem] inline-flex
items-center gap-[0.3rem] rounded-full bg-[#e6faf3] px-[0.55rem] py-[0.25rem]
text-[length:var(--text-micro)] font-extrabold text-[var(--mint-ink)]">` with an inline
check svg (`viewBox="0 0 24 24"`, `stroke="currentColor"`, `fill="none"`,
`strokeWidth={2.6}`, `strokeLinecap="round"`, `strokeLinejoin="round"`, `className="size-[11px]"`,
`<path d="M5 12l5 5L20 7" />`) then text `Confirmé`; a decorative pseudo-button
`<span className="mt-[0.9rem] inline-flex h-9 items-center justify-center gap-[0.6rem]
rounded-full bg-primary px-4 text-[length:var(--text-micro)] font-bold text-primary-foreground
shadow-[var(--shadow-brand)] pointer-events-none select-none whitespace-nowrap">Rejoindre
la session</span>` — a `span`, never an `a`/`button` (D-112, no interactive element inside
an `aria-hidden` illustration). All of "Prochaine session"/"Votre créneau réservé"/
"Session individuelle"/"Découverte de l'écosystème Ariba"/"Confirmé"/"Rejoindre la
session" are hardcoded illustration-only decorative strings per brief §C-02, not
translation keys.

Below the card: `<div data-slot="fenetre-puces" className="mt-[0.8rem] flex flex-wrap
gap-[0.5rem]">` with three glass chips `<span className="inline-flex items-center
gap-[0.4rem] rounded-[12px] border border-white/10 bg-white/[0.07] px-[0.7rem]
py-[0.4rem] text-[length:var(--text-micro)] font-semibold text-white/80">` each
containing a small `lucide-react` icon (`size-[13px]`, `aria-hidden="true"`) and text:
`User` + "Formateur", `TrendingUp` + "Progression", `FileText` + "Support PDF du module".

**New file `src/components/illustrations/parcours-etapes.tsx`** (same shape, named
export `ParcoursEtapes`): same window chrome as `EspaceFenetre` but the bar has no live
badge — just the three dots and the title span reading "Votre parcours · trois étapes"
(hardcoded illustration text, no locale key — this window has no `common`/dynamic
composition, unlike `EspaceFenetre`'s title). Scene contains `<div className="flex
flex-col gap-[0.55rem]">` with three step rows. Default row: `<div className="flex
items-center gap-[0.85rem] rounded-[14px] border border-[var(--glass-line)]
bg-[var(--glass)] p-[0.8rem_0.95rem] text-white/82"><span className="flex size-[30px]
flex-none items-center justify-center rounded-full border border-[var(--glass-line-2)]
bg-[var(--glass-2)] font-heading text-[length:var(--text-micro)] font-extrabold">{n}</span>
<div><b className="block font-heading text-[length:var(--text-small)] font-bold
leading-[1.3]">{titre}</b><small className="mt-[0.1rem] block
text-[length:var(--text-micro)] leading-[1.4] text-white/62">{description}</small></div></div>`.
First row (current step) uses the same shape with these overrides: outer `bg-white
border-white text-[var(--ink)] shadow-[var(--shadow-1)]`; pill `bg-primary border-primary
text-white` (flat, D-57, no gradient); `small` `text-[var(--muted-ink)]`; plus an extra
trailing tag `<span className="ml-auto flex-none rounded-full bg-[var(--lav)]
px-[0.55rem] py-[0.25rem] text-[length:var(--text-micro)] font-extrabold uppercase
tracking-[0.06em] text-[var(--deep)]">Maintenant</span>`. Three rows' content (hardcoded,
illustration-only, per brief §C-03): `01` "Créer votre compte" / "Prénom, nom, email, mot
de passe" (current); `02` "Confirmer votre email" / "Un lien vous attend dans votre boîte
mail"; `03` "Réserver votre premier créneau" / "Appel découverte, session individuelle ou
groupe".

Both new illustration files: root element carries `aria-hidden="true"` and
`pointer-events-none`; zero `a`/`button` elements anywhere in either file.
  </action>
  <verify>
    <automated>npx tsc --noEmit -p tsconfig.json 2>&1 | grep -iE "auth-shell|espace-fenetre|parcours-etapes" || echo "no auth-shell/illustration type errors"</automated>
  </verify>
  <done>
`AuthShell` accepts optional `entete`/`illustration`, splits `titre` on the first `". "`
into a plain-white first sentence and a gradient-accent remainder (or renders plain when
no split point exists), renders the two-column `lg:grid` layout with a sticky night panel
(`data-slot="auth-panel"`/`data-slot="auth-panel-inner"`) and a centred form column at
`max-w-[26rem]`/`max-w-[32rem]`. `globals.css` has one new compact media rule inside the
existing `@layer components`, no new token, no new `@keyframes`. `espace-fenetre.tsx` and
`parcours-etapes.tsx` exist, export `EspaceFenetre`/`ParcoursEtapes`, are `aria-hidden`,
`pointer-events-none`, contain no `a`/`button`. The four auth pages still compile
unchanged (props are optional). `tsc --noEmit` reports no errors in the four touched/new
files. Commit with message `#feat: recompose AuthShell as a night panel beside the form
column`.
  </done>
</task>

<task type="auto">
  <name>Task 3 (COMMIT 3): The four auth pages on the new shell</name>
  <files>src/app/connexion/page.tsx, src/app/inscription/page.tsx, src/app/mot-de-passe-oublie/page.tsx, src/app/nouveau-mot-de-passe/page.tsx</files>
  <action>
Per brief §C-01 (cross-link relocation) and §C-02/C-03/C-04 (per-page `entete`/
`illustration`). Remove `Card`/`CardContent`/`CardFooter` from all four pages — the form
islands and success states render directly inside `AuthShell`'s form column now. Keep
every page's existing "why" comment about static rendering (D-16 / no session helper /
no Supabase server import) verbatim — do not add any import from
`src/lib/auth/session.ts` or `src/lib/supabase/server.ts` to any of these four files.

**`connexion/page.tsx`**: drop the `Card`/`CardContent`/`CardFooter` import and usage.
Import `EspaceFenetre` from `@/components/illustrations/espace-fenetre` and `common` from
`@/locales/fr/common.json`. Pass `entete={common.nav.connexion}` and
`illustration={<EspaceFenetre />}` to `AuthShell` alongside the existing `titre`/`intro`.
Render `<ConnexionForm />` directly as a child (no wrapping `Card`), followed by
`<p className="text-center text-sm text-muted-foreground"><Link href="/inscription"
className="text-primary font-semibold hover:underline">{connexion.pasDeCompte}</Link></p>`
— the full `pasDeCompte` sentence stays inside the `Link` as it is one existing string,
only the surrounding `<p>`'s classes and position (below the form, inside the form
column, not a `CardFooter`) change.

**`inscription/page.tsx`**: same pattern — drop `Card`/`CardContent`/`CardFooter`; import
`ParcoursEtapes` from `@/components/illustrations/parcours-etapes` and `common`; pass
`entete={common.nav.inscription}`, `illustration={<ParcoursEtapes />}`, keep
`largeur="2xl"`; render `<InscriptionForm />` then `<p className="text-center text-sm
text-muted-foreground"><Link href="/connexion" className="text-primary font-semibold
hover:underline">{inscription.dejaInscrit}</Link></p>`.

**`mot-de-passe-oublie/page.tsx`**: drop `Card`/`CardContent`; import `connexion` from
`@/locales/fr/connexion.json` for the `entete` string; pass
`entete={connexion.motDePasseOublie}` (the existing "Mot de passe oublié ?" string) to
`AuthShell` alongside `titre={motDePasse.demande.titre}`/`intro={motDePasse.demande.intro}`;
no `illustration` prop. Render `<MotDePasseOublieForm />` directly, no cross-link (none
exists on this page today). Keep the existing "why (D-16)" comment.

**`nouveau-mot-de-passe/page.tsx`**: drop `Card`/`CardContent`; do not pass any `entete`
prop at all (so `AuthShell` renders no `h2` here, per brief §C-04); keep
`titre={motDePasse.nouveau.titre}`/`intro={motDePasse.nouveau.intro}`; no `illustration`
prop. Render `<NouveauMotDePasseForm />` directly. Keep the existing "why (D-16, D-A3)"
comment verbatim.
  </action>
  <verify>
    <automated>npx tsc --noEmit -p tsconfig.json 2>&1 | grep -iE "app/connexion/page|app/inscription/page|app/mot-de-passe-oublie/page|app/nouveau-mot-de-passe/page" || echo "no auth-page type errors"</automated>
  </verify>
  <done>
All four pages render `AuthShell` without any `Card`/`CardContent`/`CardFooter` import.
`connexion/page.tsx` passes `entete={common.nav.connexion}` and `illustration={<EspaceFenetre
/>}`; `inscription/page.tsx` passes `entete={common.nav.inscription}`,
`illustration={<ParcoursEtapes />}`, keeps `largeur="2xl"`; `mot-de-passe-oublie/page.tsx`
passes `entete={connexion.motDePasseOublie}` and no `illustration`; `nouveau-mot-de-passe/page.tsx`
passes no `entete` and no `illustration`. Each page's cross-link (where one exists) is a
centred `<p className="text-center text-sm text-muted-foreground">` with the `Link` in
`text-primary font-semibold`. No page imports anything from `src/lib/auth/session.ts` or
`src/lib/supabase/server.ts`; each page's existing "why" static-rendering comment is
unchanged. `tsc --noEmit` reports no errors in any of the four files. Commit with message
`#feat: move the four auth pages onto the new shell`.
  </done>
</task>

<task type="auto">
  <name>Task 4 (COMMIT 4): Lead both auth forms with Google, raise fields to 44px</name>
  <files>src/components/compte/connexion-form.tsx, src/components/compte/inscription-form.tsx</files>
  <action>
Per brief §C-05. `handleSubmit`, ids, `name`s, `autoComplete` values, `aria-label`s,
`RejectionField`, `CallbackFailureNotice`, and `InscriptionForm`'s success-state `Card`
are untouched in both files — only the additions/restyling below.

**`connexion-form.tsx`**: remove `import { LogIn } from "lucide-react";`. Add
`import { GoogleMark } from "@/components/icons/google-mark";`. Move the Google block to
the very top of the `<form>`, before the email `Field`, and change it from its current
plain two-line-no-word divider to a labelled separator with the word:

```
<Button
  render={<Link href="/api/auth/google" prefetch={false} />}
  nativeButton={false}
  variant="outline"
  className="h-11 w-full"
>
  <GoogleMark className="size-[18px]" />
  {connexion.google}
</Button>

<div className="flex items-center gap-3" aria-hidden="true">
  <span className="h-px flex-1 bg-border" />
  <span className="text-sm text-muted-foreground">{common.formulaires.ou}</span>
  <span className="h-px flex-1 bg-border" />
</div>
```

(Shown here only to fix the exact JSX shape — write it as real JSX in the file, not as a
fenced block.) Delete the old bottom Google `<Button>` block and the old two-line
`aria-hidden` divider (both currently sit after the submit button) entirely — this is a
move, not a duplication; the form must end up with exactly one Google button and one
separator, both at the top. Add `className="h-11"` to both `FieldControl` elements
(`connexion-email`, `connexion-mot-de-passe`). Change the forgot-password `Link`'s
`className` from `"self-end text-sm text-primary outline-none hover:underline
focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring rounded-md"` to
`"self-end text-sm text-primary font-semibold py-3 outline-none hover:underline
focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring rounded-md"`
(adds `font-semibold` and `py-3`, bringing its tap target to ≥44px given `text-sm`'s
~21.7px line height plus 24px of vertical padding). Add `className="h-11 w-full"` to the
submit `<Button>` (currently no `className`). Final top-to-bottom order inside the
`<form>`: Google button, separator-with-word, email `Field`, password `Field`,
forgot-password `Link`, submit `Button`, the `!hydrated` prep-text paragraph (unchanged),
then the existing `{submitError ? <RejectionField .../> : <Suspense><CallbackFailureNotice
/></Suspense>}` block (unchanged).

**`inscription-form.tsx`**: add `import { Button } from "@/components/ui/button";` and
`import { GoogleMark } from "@/components/icons/google-mark";` (this file does not import
plain `Button` today, only `SubmitButton`). Inside the non-success return branch, insert
the same Google button + word-separator block as above at the very top of the `<form>`
(before the `prenom`/`nom` two-column grid), using `inscription.google` in place of
`connexion.google` and `common.formulaires.ou` (this file already imports `common`). This
sits inside the island's non-success branch only — the `status === "success"` early
return (the "check your email" `Card`) is untouched, so it keeps fully replacing the form
including this new block, per the brief's "success state must keep replacing everything."
Before editing, re-count the `FieldControl` elements in the live file (`prenom`, `nom`,
`email`, `motDePasse`, `confirmation`, `profil`'s `select` render) against the
**STOP-and-report note in `<interfaces>`** — this plan found six, the brief's text says
seven; add `className="h-11"` to every `FieldControl` actually present (six, unless a
seventh is found) and report the count discrepancy in the final summary either way. Leave
`conditions` at `text-xs text-muted-foreground`, the `SubmitButton`, the success `Card`,
`handleSubmit`, ids, `name`s, `autoComplete`, and `aria-label` all unchanged.
  </action>
  <verify>
    <automated>npx tsc --noEmit -p tsconfig.json 2>&1 | grep -iE "connexion-form|inscription-form" || echo "no auth-form type errors"</automated>
  </verify>
  <done>
`connexion-form.tsx` has exactly one Google `<Button>` (top of form, `h-11 w-full`,
`<GoogleMark className="size-[18px]" />` + `{connexion.google}`) and exactly one
`aria-hidden` separator containing `{common.formulaires.ou}` between two `bg-border`
lines, no `LogIn` import anywhere in the file, both `FieldControl`s at `h-11`, the submit
`Button` at `h-11 w-full`, and the forgot-password `Link` carrying `text-primary
font-semibold py-3`. `inscription-form.tsx` has the same Google-button-plus-separator
block at the top of its non-success form branch using `inscription.google`, every
`FieldControl` present in the file (six, unless the live file has seven) at `h-11`, and
the success-state `Card` still fully replaces the form on `status === "success"`. Neither
file's `handleSubmit`, ids, `name`s, `autoComplete`, `aria-label`s, `RejectionField`,
`CallbackFailureNotice`, or success `Card` changed. `tsc --noEmit` reports no errors in
either file. Commit with message `#feat: lead both auth forms with Google and raise
fields to 44px`.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|--------------|
| Learner → `/api/auth/google` | Both Google buttons `render` a `Link` to the existing OAuth start route; no new route, no new redirect target introduced this run |
| Server component render → static HTML | `AuthShell` and both illustrations read only locale JSON server-side; no new client-side data-entry point |
| Decorative illustrations | `EspaceFenetre`/`ParcoursEtapes` render hardcoded, aria-hidden, non-interactive markup — no user input, no fetch |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|--------------|-----------------|
| T-260907opw-01 | Spoofing | `GoogleMark` / Google button | accept | Renders the existing `/api/auth/google` route unchanged; the icon is decorative branding only, carries no auth logic |
| T-260907opw-02 | Information Disclosure | `EspaceFenetre` / `ParcoursEtapes` | accept | Pure decorative SVG/HTML, `aria-hidden`, no fetch, no date/seat/account data (D-112) |
| T-260907opw-03 | Tampering | `google-mark.tsx` raw-hex exception | accept | Four brand-mandated fill values on a static, non-interactive SVG; no dynamic input reaches this file |
| T-260907opw-04 | Denial of Service | `pulse-live` reuse on the mint dot | accept | CSS-only, capped animation, honours `prefers-reduced-motion` via the existing global rule, no unbounded loop |

No package installs this run — package legitimacy gate not applicable.
</threat_model>

<verification>
Run once, after all four commits land, in this exact order. Do not run any of these in
the background; do not start a dev server. Assert only on exit codes and reported
build/log output — never by grepping source to "confirm" a UI change happened.

1. `npm run lint` — must report zero problems.
2. `npm run typecheck` — must pass.
3. `npm run build` — must pass; `/connexion`, `/inscription`, `/mot-de-passe-oublie`, and
   `/nouveau-mot-de-passe` must all be listed static (`○`) in the build output — a `ƒ`
   (dynamic) on any of them is a failure to report, not a warning. Report the prerendered
   size of `/` from the build output: a `/` around 44 KB means an empty database (content
   queries returned nothing) — report this explicitly as a **FAILURE**, not a success,
   even though the build itself exited 0.
4. `npm run content:check` — expected to exit 1, naming the same pre-existing placeholders
   as before this run and **zero new** placeholders. If a new placeholder name appears,
   report it as a regression, do not silently accept it.
5. `git status --short` must be clean (all four commits landed, nothing left uncommitted).
   `git rev-parse --abbrev-ref HEAD` must read `cto/landing-v3` (no branch created or
   switched).

Never run `git push`. If any fact in the brief conflicts with the code on the ground while
executing any task above, STOP and report precisely rather than inventing a substitute —
see the `FieldControl` count note in `<interfaces>` for one already-identified instance.
</verification>

<success_criteria>
- Four commits exist on `cto/landing-v3`, one per task above, each with a `#feat: ...`
  message matching brief §G's wording, committed before verification runs.
- `AuthShell` renders the two-column night-panel-plus-form-column layout at `lg:` and
  above, collapsing to a static band below `lg:`, with the title-accent split, eyebrow,
  optional illustration + non-contractual caption, and optional `entete`/always-present
  `intro` in the form column.
- All four auth pages use the new shell with no `Card`/`CardContent`/`CardFooter`, correct
  per-page `entete`/`illustration` (or absence thereof) per brief §C-02/C-03/C-04, and
  remain statically rendered (no session-helper import).
- Both `ConnexionForm` and `InscriptionForm` lead with a Google button (`h-11 w-full`,
  `GoogleMark` at 18px) followed by a labelled `ou` separator; every visible field/button/
  forgot-password link reaches a 44px target; `InscriptionForm`'s success state still
  fully replaces the form.
- Exactly two new translation keys exist (`common.formulaires.ou`, `inscription.google`)
  and no other new visible string anywhere in the touched files.
- No raw hex anywhere in the touched/new files except the four Google brand fills in
  `google-mark.tsx` and the pre-existing window-chrome dot hexes reused verbatim.
- No `any` type anywhere in the touched/new files.
- The `FieldControl`-count discrepancy (six found vs. seven claimed by the brief) is
  reported in the final summary regardless of which count the live file shows.
- Final verification checklist (above) run once, after all four commits, with results
  reported honestly (including the `/` prerender-size sanity check, the `content:check`
  baseline comparison, and the static/dynamic status of all four auth routes).
</success_criteria>

<output>
No SUMMARY.md required for this quick task — report results directly at the end of
execution: the four commit hashes/messages, the `FieldControl` count discrepancy finding,
and the outcome of each of the five final verification steps (pass/fail, with the reported
`/` prerender size, the `content:check` placeholder list, and the static/dynamic status of
the four auth routes).
</output>
