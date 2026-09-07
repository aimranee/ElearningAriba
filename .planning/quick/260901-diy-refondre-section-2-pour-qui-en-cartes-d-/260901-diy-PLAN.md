---
quick_id: 260901-diy-refondre-section-2-pour-qui-en-cartes-d-
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/locales/fr/landing.json
  - scripts/seed-content.mjs
  - src/lib/content/queries.ts
  - src/app/globals.css
  - src/components/sections/pour-qui.tsx
  - src/components/sections/competences.tsx
  - .planning/phases/02-site-public/02-CONTEXT.md
  - .planning/phases/02-site-public/02-UI-SPEC.md
autonomous: true
requirements: [PUB-02]
---

<objective>
Rebuild the "Pour qui" landing section as intention cards, per
`C:/Users/Essakhi/Desktop/ElearningSAP/ariba-cto/notes/2026-09-01-brief-section-02-pour-qui-cartes-intention.md`
(read in full — authoritative, every design/content/contrast/hover decision
is locked, execute exactly, do not deviate). Each of the five signed profiles
gets a first-person "accroche" as the card headline (new
`content_item.donnees.accroche`, jsonb, no migration), the existing profile
name moves to the card footer as a link label, and the existing description
becomes hover-revealed content using a two-block inverse-grid technique that
keeps card and row height constant. Section flips to `tone="band"`;
Competences flips to `tone="default"` to keep the alternation correct after
the 2026-09-01 stats-band removal. Three new AA-passing ink tokens
(`--blue-ink`, `--mint-ink`, `--amber-ink`) extend `D-05` because three of
the seven accent tokens fail WCAG AA as text-on-white ink.

Purpose: close the visual gap between the founder's reference screenshots and
the shipped section, without repeating the project's three prior
dead-ink-on-tinted-surface defects, and without inventing a page this lot
never sold (cards link to `/programme`, not to non-existent per-domain
pages).
Output: five accent-mapped intention cards with a reserved-height hover
reveal, updated seed/content-schema, two new `02-CONTEXT.md` decisions,
`02-UI-SPEC.md` brought in sync.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@C:/Users/Essakhi/Desktop/ElearningSAP/ariba-cto/notes/2026-09-01-brief-section-02-pour-qui-cartes-intention.md
@src/components/sections/pour-qui.tsx
@src/components/sections/competences.tsx
@src/locales/fr/landing.json
@scripts/seed-content.mjs
@src/lib/content/queries.ts
@src/app/globals.css
@src/components/ui/card.tsx
@.planning/phases/02-site-public/02-CONTEXT.md
@.planning/phases/02-site-public/02-UI-SPEC.md

<interfaces>
From `src/components/ui/card.tsx` (read-only, do not modify — this section
uses `variant="default"` only, "niveau 2"):
```typescript
function Card(props: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>): JSX.Element;
function CardTitle(props: React.ComponentProps<"h3">): JSX.Element;
function CardDescription(props: React.ComponentProps<"p">): JSX.Element;
```
`variant="default"`'s own classes already carry `hover:-translate-y-[3px]`
and the `--contact` → `--shadow-1` box-shadow transition — Card is hovered
directly (it sits inside the new `Link`, same box, same pointer path), so
this elevation fires automatically. Do not re-add a translate or shadow
override for it.

From `src/lib/content/queries.ts`, the existing pattern this plan extends
(add a sibling schema, do not change `getModules`/`moduleDonneesSchema`):
```typescript
const moduleDonneesSchema = z.object({
  objectifs: z.array(z.string()).default([]),
  contenu: z.array(z.string()).default([]),
});
export type ContentItem = Database["app"]["Tables"]["content_item"]["Row"]; // .donnees: Json | null, .cle: string, .titre: string, .description: string | null
```

From `src/app/globals.css` `:root` (lines 98-105), the existing accent
tokens this plan reads from and extends — do not change their values:
```css
--violet: #635bff; --deep: #4f46e5; --indigo: #4338ca;
--blue: #3b82f6; --sky: #38bdf8; --mint: #1fc79b; --amber: #ffb444;
```

From `src/components/motion/reveal.tsx`, unchanged, already used by both
files:
```typescript
type RevealProps = { as?: ElementType; dataD?: 1|2|3|4|5; className?: string; children?: ReactNode };
export function Reveal(props: RevealProps): JSX.Element; // renders <Component className={cn("reveal", className)} data-d={dataD}>
```
</interfaces>

Accent/ink mapping table (§5 of the brief, exact — keyed by `content_item.cle`,
which the seed sets equal to `picto`):

| `cle` | `--card-accent` | `--card-ink` |
| --- | --- | --- |
| `acheteur` | `var(--violet)` | `var(--violet)` |
| `category-manager` | `var(--blue)` | `var(--blue-ink)` |
| `supply-chain` | `var(--mint)` | `var(--mint-ink)` |
| `consultant` | `var(--indigo)` | `var(--indigo)` |
| `etudiant` | `var(--amber)` | `var(--amber-ink)` |

Unknown `cle` falls back to the `acheteur` row (violet/violet).

Five accroches, keyed by `cle` (§1 of the brief, exact strings — French
guillemets `«`/`»` with non-breaking spaces are part of the string):

| `cle` | Accroche |
| --- | --- |
| `acheteur` | « Je veux structurer mes achats, pas les subir » |
| `category-manager` | « Je veux piloter mes catégories avec les bons outils » |
| `supply-chain` | « Je veux relier mes flux au bon processus » |
| `consultant` | « Je veux une expertise que le marché reconnaît » |
| `etudiant` | « Je veux une compétence rare avant mon premier poste » |
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Content contract — locale, seed, zod schema, ink tokens</name>
  <files>src/locales/fr/landing.json, scripts/seed-content.mjs, src/lib/content/queries.ts, src/app/globals.css</files>
  <action>
In `src/locales/fr/landing.json`, add an `accroche` field to each of the five
objects in `pourQui.profils` (order: acheteur, category-manager,
supply-chain, consultant, etudiant), using the exact strings from the
accroche table above, guillemets and non-breaking spaces included. Leave
`titre`, `description` and `picto` on every object unchanged, and leave
`pourQui.eyebrow`/`pourQui.titre`/`pourQui.reassurance` untouched.

In `scripts/seed-content.mjs`, in the `profilItems` mapping (around lines
232-239), add `donnees: { accroche: profil.accroche }` as a new property on
each mapped object, alongside the existing `section_cle`, `cle`, `titre`,
`description`, `picto`, `position`. Do not touch `competenceItems` or
`moduleItems` in this same function.

In `src/lib/content/queries.ts`, add a new schema next to
`moduleDonneesSchema` (same file, do not change `moduleDonneesSchema` or
`getModules`):
`export const profilDonneesSchema = z.object({ accroche: z.string().optional() });`
Export it (unlike `moduleDonneesSchema`, which stays module-private) because
`pour-qui.tsx` parses it directly rather than through a dedicated query
function — there is no `getProfils()` wrapper, `getSectionItems("pour-qui")`
already returns the typed `ContentItem[]` and the component does its own
`safeParse` per item. Add a one-line `why` comment above it: jsonb is
validated at the boundary per CLAUDE.md, `accroche` is optional so a
missing/malformed value degrades silently instead of throwing.

In `src/app/globals.css`, inside `:root`, insert three new tokens
immediately after `--amber: #ffb444;` (before `--lav: #f1f0ff;`), with this
exact `why` comment above them (verbatim, it records the measured contrast
ratios):
`/* why (2026-09-01): --blue/--mint/--amber serve as pastille and wash tint in "Pour qui", but fail AA as ink-on-white-card (3.68 / 2.16 / 1.77). These darkened variants keep the hue and pass (4.62 / 4.58 / 4.63). The accent decorates, the ink reads. */`
followed by:
`--blue-ink: #3472d8;`
`--mint-ink: #158568;`
`--amber-ink: #996c29;`
Do not touch any other token in `:root`, and do not touch the `@theme
inline` block or the reduced-motion block.
  </action>
  <verify>
    <automated>npx tsc --noEmit -p tsconfig.json</automated>
  </verify>
  <done>
`landing.json`'s five `pourQui.profils` objects each carry an `accroche`
field with the exact signed string. `seed-content.mjs`'s `profilItems`
mapping includes `donnees: { accroche: profil.accroche }`. `queries.ts`
exports `profilDonneesSchema`. `globals.css` `:root` has `--blue-ink`,
`--mint-ink`, `--amber-ink` right after `--amber`, with the why-comment.
`tsc --noEmit` clean.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Re-seed local content</name>
  <files>(none — writes to the local Supabase database only)</files>
  <action>
Run `npm run content:seed` against the local Supabase stack (already
running, do not start/stop it). This re-runs the idempotent upsert from Task
1's updated `seed-content.mjs`, so the five `pour-qui` rows in
`app.content_item` gain their `donnees.accroche` value. Confirm the command
exits 0 and its own summary output reports the `pour-qui` section's five
items upserted (or the script's equivalent per-section count) with no error.
Do not re-seed against any hosted project — hosted re-seeding is the CIO's
and stays out of scope (per `.planning/STATE.md` Blockers/Concerns).
  </action>
  <verify>
    <automated>npm run content:seed</automated>
  </verify>
  <done>
`npm run content:seed` exits 0 locally; the five `pour-qui` content_item rows
now carry `donnees.accroche`.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Rebuild pour-qui.tsx as intention cards; flip competences.tsx tone</name>
  <files>src/components/sections/pour-qui.tsx, src/components/sections/competences.tsx</files>
  <action>
Rewrite `src/components/sections/pour-qui.tsx`. Keep the existing
`getSection`/`getSectionItems` data fetch, the `SectionHeader` block, and the
`EmptyState` error fallback unchanged in content — only their `Section tone`
prop changes. Change **both** `<Section tone="default">` occurrences (the
error fallback and the success render) to `<Section tone="band">` — same
section, both states must agree on tone or a failed read would flash a
mismatched atmosphere band.

Add module-level imports: `Link` from `next/link`, `ArrowRight` from
`lucide-react`, `profilDonneesSchema` from `@/lib/content/queries`. Add a
module-level `const` mapping `cle` to `{ accent: string; ink: string }`
using the accent/ink table above (five entries plus one `FALLBACK` = the
`acheteur` row, used when a `cle` is not in the map).

Grid: `<ul className="mt-10 grid grid-cols-1 gap-[1.35rem] sm:grid-cols-2 min-[1000px]:grid-cols-6 grid-auto-rows-[1fr]">`. Each `Reveal` (`as="li"`, same
`dataD` cascade as today, unchanged) gets `min-[1000px]:col-span-2` on every
item, plus `min-[1000px]:col-start-2` additionally on index `3` only (the
fourth card, `consultant`) — delete the current `index < 3 ? col-span-2 :
col-span-3` asymmetric branch entirely.

Per profile, inside the `Reveal`, replace the current `<Card>` block with:
a `<Link href="/programme" className="group block h-full">` carrying the
accessible label — compute `hasAccroche = parsed.success &&
Boolean(parsed.data.accroche)` from `profilDonneesSchema.safeParse(profil.donnees)`,
`accroche = hasAccroche ? parsed.data.accroche! : profil.titre` (silent
fallback per the brief — never throw on a missing/malformed value), and
`aria-label={hasAccroche ? \`${accroche} — ${profil.titre}\` : profil.titre}`.
Inside the link, `<Card variant="default" className="h-full p-[1.7rem]"
style={{ "--card-accent": accentInk.accent, "--card-ink": accentInk.ink } as
React.CSSProperties}>` (cast needed — custom properties are not in the
default `CSSProperties` type), where `accentInk =
PROFIL_ACCENTS[profil.cle] ?? FALLBACK`. Also add
`group-hover:bg-[linear-gradient(160deg,color-mix(in_srgb,var(--card-accent)_10%,white)_0%,white_62%)]
group-focus-within:bg-[linear-gradient(160deg,color-mix(in_srgb,var(--card-accent)_10%,white)_0%,white_62%)]`
to the Card's `className` — the 10% wash, capped exactly there per the
brief, must never exceed it.

Card contents, in order:
1. Pastille: `<span aria-hidden="true" className="flex size-[52px] shrink-0
   items-center justify-center rounded-[16px]
   bg-[color-mix(in_srgb,var(--card-accent)_14%,white)]
   text-[var(--card-ink)] transition-transform duration-[500ms]
   ease-[var(--ease-brand)] group-hover:scale-[1.08]
   group-hover:-rotate-[4deg] group-focus-within:scale-[1.08]
   group-focus-within:-rotate-[4deg]">` wrapping the existing `Picto`
   (`size-6`) — drop the old gradient background and its `shadow-[...]`
   entirely, both are superseded by the tinted-pastille recipe.
2. `<CardTitle className="mt-3 font-heading text-[1.05rem] leading-[1.3]
   font-bold tracking-[-0.02em] text-[var(--ink)]">{accroche}</CardTitle>`.
3. The hover-reveal description block: `<div className="grid
   grid-rows-[0fr] transition-[grid-template-rows]
   duration-[var(--duration-base)] ease-[var(--ease-brand)]
   group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr]
   [@media(hover:none)]:grid-rows-[1fr]"><div
   className="overflow-hidden"><CardDescription className="text-[0.94rem]
   leading-[1.6] text-[var(--muted-ink)]">{profil.description}</CardDescription></div></div>`.
4. The footer, rendered **only if `hasAccroche`** (per the brief's
   degradation rule — no footer when falling back to `titre`):
   `<div className="mt-1 flex items-center justify-between"><span
   className="font-semibold text-[0.9rem] text-[var(--card-ink)]">{profil.titre}</span><ArrowRight
   aria-hidden="true" className="size-4 text-[var(--card-ink)]
   transition-transform duration-[var(--duration-base)]
   ease-[var(--ease-brand)] group-hover:translate-x-[3px]
   group-focus-within:translate-x-[3px]" /></div>`.
5. The spacer ("cale"), always rendered, placed **after** the footer,
   `aria-hidden="true"`, identical text/classes to block 3 so its
   content-height matches (this is what makes the 0fr/1fr sum constant):
   `<div aria-hidden="true" className="grid grid-rows-[1fr]
   transition-[grid-template-rows] duration-[var(--duration-base)]
   ease-[var(--ease-brand)] group-hover:grid-rows-[0fr]
   group-focus-within:grid-rows-[0fr]
   [@media(hover:none)]:grid-rows-[0fr]"><div className="overflow-hidden
   invisible"><CardDescription className="text-[0.94rem]
   leading-[1.6]">{profil.description}</CardDescription></div></div>`.

Do not add a `prefers-reduced-motion` rule anywhere in this file — the
global rule at `globals.css:331-339` already zeroes every
`transition-duration`, including the two grid-row transitions above.

In `src/components/sections/competences.tsx`, change **both**
`<Section tone="band">` occurrences (error fallback line ~21, success render
line ~33) to `<Section tone="default">`. Touch nothing else in this file —
no other prop, no class, no import.
  </action>
  <verify>
    <automated>npx tsc --noEmit -p tsconfig.json</automated>
  </verify>
  <done>
`pour-qui.tsx` renders five `Link`-wrapped `Card` elements with accent/ink
custom properties, a tinted pastille, an accroche title, a two-block
inverse-grid hover reveal, a conditional footer, and a matching spacer;
`Section tone="band"` on both occurrences. `competences.tsx` has
`Section tone="default"` on both occurrences and is otherwise byte-identical
to before. `tsc --noEmit` clean.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 4: Record the two 2026-09-01 decisions</name>
  <files>.planning/phases/02-site-public/02-CONTEXT.md, .planning/phases/02-site-public/02-UI-SPEC.md</files>
  <action>
In `.planning/phases/02-site-public/02-CONTEXT.md`, under `<decisions>`,
append two new decisions after `D-48` (do not renumber or edit any existing
`D-` entry, including `D-05`), following the existing dated-decision format
used by `D-03`/`D-04`:

`D-49` (2026-09-01, founder): "Pour qui" moves to intention cards — a
first-person accroche (`content_item.donnees.accroche`, jsonb, no
migration) is the card headline, the five signed profile names move to the
card footer as a `/programme` link label, the description reveals on hover
via a two-block inverse-grid technique that keeps card and row height
constant, and the section tone flips to `band` (Competences flips to
`default` to preserve alternation). Two reference screenshots
(`Screenshot 2026-09-01 083648.png`/`083656.png`) set direction only, not
authority — see `D-50` and the AA contrast note below for the two measured
departures.

`D-50` (2026-09-01, CTO): extends `D-05`'s token set with `--blue-ink`
(`#3472d8`), `--mint-ink` (`#158568`), `--amber-ink` (`#996c29`) — measured,
not an oversight: `--blue`/`--mint`/`--amber` fail WCAG AA as ink-on-white-card
(3.68 / 2.16 / 1.77 against the 4.5 threshold) while these darkened variants
pass (4.62 / 4.58 / 4.63). Rule going forward: an accent token may decorate a
large/decorative surface (pastille fill, wash tint) at any ratio; card body
ink must come from an AA-passing token. Also records the reference's second
departure: cards link to `/programme`, not to a non-existent per-domain page
(Lot 11+, unsold).

In `.planning/phases/02-site-public/02-UI-SPEC.md`, find where the
"Pour qui" section is described in the landing structure list (§5, currently
"five profils + « même sans expérience SAP »") and, immediately after it (in
the same style as the existing stats-band-removal paragraph at lines
137-141), add a short paragraph noting: cards now open on a first-person
accroche with the profile name at the footer as a `/programme` link, hover
reveals the description under a reserved-height two-block grid technique,
section is `tone="band"` (Competences now `tone="default"`) — reference
`D-49`/`D-50`.
  </action>
  <verify>
    <automated>MISSING — no test harness in package.json; verified by Task 5's grep against rendered output plus a manual diff read of both files after write</automated>
  </verify>
  <done>
`02-CONTEXT.md` has `D-49` and `D-50` appended after `D-48`, no existing
decision edited. `02-UI-SPEC.md`'s "Pour qui" structure entry has a
paragraph describing the new card mechanic and tone flip.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 5: Full verification chain</name>
  <files>(none — verification only, reads build output)</files>
  <action>
Run, in order: `npm run lint`, `npm run typecheck`, `npm run build`. All
three must exit 0, and the build output must still list 14 routes (13
static + `/api/contact` dynamic, unchanged split).

Then, against `.next/server/app/index.html`, run a small node check rather
than a whole-page grep — several "Pour qui" strings (profile names, the word
"programme") also appear elsewhere on the page, so a plain whole-file grep
cannot prove section-scoped counts. Slice the HTML between the "Pour qui"
H2/eyebrow text and the Compétences section's eyebrow text
("Ce que vous allez apprendre"), then within that slice assert: all five
accroche substrings present (match on a distinctive fragment of each, e.g.
"structurer mes achats", "piloter mes catégories", "relier mes flux",
"expertise que le marché", "compétence rare avant mon premier poste" — avoid
matching on the guillemets/nbsp exactly, HTML entity encoding may differ
from the source string); all five profile names present ("Acheteurs",
"Category managers", "Professionnels supply chain et achats",
"Consultants SAP Ariba juniors ou en reconversion", "Étudiants et jeunes
diplômés"); exactly 10 occurrences of each description's distinctive
fragment is not required — instead confirm each of the five description
texts appears **at least twice** in the slice (the real block plus the
aria-hidden spacer both render it; do not write a check requiring exactly
one occurrence, and do not remove the spacer to satisfy a stricter count);
exactly 5 occurrences of `href="/programme"` in the slice (the hero's own
"Voir le programme" link sits outside this slice and must not be counted).

Also run, across the two touched component files only
(`src/components/sections/pour-qui.tsx`,
`src/components/sections/competences.tsx`): a search for `cubic-bezier`
outside `var(--ease-brand)` — must return zero (both files should reference
easing only via `ease-[var(--ease-brand)]`, never a literal curve); a search
for `ease-in`, `ease-out`, `ease-in-out` or `linear` on a transition/animate
class — must return zero (note `linear-gradient` calls are not a match for
this check — only the bare timing-function keywords count); a search for a
raw hex color (`#` followed by 3-6 hex digits) inside either file's JSX —
must return zero, all colors route through `var(--...)` tokens or
`color-mix(...)`.
  </action>
  <verify>
    <automated>npm run lint && npm run typecheck && npm run build</automated>
  </verify>
  <done>
Lint/typecheck/build all exit 0, 14 routes reported. Within the "Pour qui"
HTML slice: five accroche fragments present, five profile names present,
each of the five descriptions present at least twice, exactly five
`href="/programme"` occurrences. Zero non-brand easing tokens and zero raw
hex colors across the two touched component files.
  </done>
</task>

</tasks>

<threat_model>
Pure presentational/content change to an existing public marketing section —
same data source (`app.content_item`, already RLS-scoped to published rows
per `D-28`), same read path (`getSectionItems`, cookieless public client, no
new query), no new user input, no new external dependency, no write path
touched. The only new parsed input is `content_item.donnees` (jsonb, already
existed and was already unvalidated-then-consumed by `getModules`'s sibling
schema) — this plan adds a second `safeParse` with a non-throwing fallback,
which is a hardening, not a new trust boundary. No STRIDE register required.
</threat_model>

<verification>
1. `npx tsc --noEmit` clean after Tasks 1 and 3.
2. `npm run content:seed` exits 0 locally (Task 2), before Task 5's build so
   the rendered HTML reflects the new `accroche` data.
3. `npm run lint && npm run typecheck && npm run build` all exit 0; 14
   routes, same static/dynamic split as before this plan.
4. `.next/server/app/index.html`, sliced to the "Pour qui" section: five
   accroche fragments, five profile names, each description at least twice
   (spacer-aware), exactly five `href="/programme"` links.
5. Zero `cubic-bezier`/`ease-in`/`ease-out`/`ease-in-out`/`linear` tokens and
   zero raw hex colors in `pour-qui.tsx`/`competences.tsx`.
6. `02-CONTEXT.md` carries `D-49`/`D-50`, no existing decision edited;
   `02-UI-SPEC.md`'s "Pour qui" entry matches.
7. Not a substitute for pixel measurement: hover/focus/touch behavior at
   1440px/375px (wash appearance, description reveal without row-height
   shift, keyboard-focus parity) is left to the CTO after this run — no
   browser is available in this environment.
</verification>

<success_criteria>
- Five cards, each a full-card `/programme` link, uniform width (3+2,
  centered second row), same-height rows.
- Each card opens on its signed first-person accroche; the signed profile
  name sits at the footer with an `aria-hidden` arrow; a missing/malformed
  `accroche` degrades silently to showing `titre` as the headline with no
  footer, never a thrown error.
- Hover/focus reveals the description between accroche and footer while the
  card's own height and the row's height do not change by a pixel (inverse
  0fr/1fr grid pair); touch devices show the description permanently.
- Pastille is a 14%-tinted accent fill with an accent-colored icon; card
  footer ink uses an AA-passing token (`--violet`/`--indigo` as-is,
  `--blue-ink`/`--mint-ink`/`--amber-ink` new); the hover wash caps at a 10%
  accent tint.
- `Card variant="default"` supplies the 3px lift and shadow step
  unmodified; no new shadow tier invented.
- "Pour qui" is `tone="band"` on both render paths; Competences is
  `tone="default"` on both render paths; no other section's tone changed.
- Zero hardcoded visible strings, zero new raw hex in JSX, exactly one
  easing curve (`--ease-brand`), no dev server started, local atomic commits
  only, branch stays `gsd/phase-02-site-public`, nothing pushed.
</success_criteria>

<output>
Create `.planning/quick/260901-diy-refondre-section-2-pour-qui-en-cartes-d-/SUMMARY.md` when done.
</output>
