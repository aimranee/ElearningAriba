---
quick_id: 260831-gyj
status: pending
---

# Quick Task 260831-gyj: Refonte visuelle landing — Run 3 (parcours, assemblage, photo) + 2 corrections

Run 3 of 3 from `ariba-cto/notes/2026-08-31-brief-lot2-refonte-visuelle.md`,
authoritative mockup `ariba-cto/notes/2026-08-31-maquette-lot2-landing-v2.html`
(CSS lines 349-476, HTML lines 830-1060). Run 1 (surface scale, tokens,
commit 4b20a85) and Run 2 (header + hero, commits 218064b/244a819) already
shipped — do not touch `header.tsx`/`hero.tsx` content, do not re-add
`--hairline`/`--tint`/`--tint-violet`/`--contact`/`--inset-hi` tokens
(already in `globals.css`), do not re-add `raised`/`tint`/`default` Card
variants (already in `card.tsx`).

Per `02-CONTEXT.md` AC-1/D-19 (rewritten in Run 1): niveau 1 = zero
box-shadow ever (tint/border/translate only); niveau 2 = `--contact` at rest
→ `--shadow-1` on hover (a contact shadow, not a lift); niveau 3 = the only
tier that lifts to `--shadow-4` (max 2 elements page-wide). This run's new
surfaces must land on the correct tier — parcours rows are niveau 1, the
steps-aside card is niveau 2, the `.asm` assembly card becomes the section's
niveau-3 element (Task 2).

## Task 1 — Format et modalités: numbered parcours + companion aside + rail

Files: `src/components/sections/format-modalites.tsx`, `src/locales/fr/common.json`

- Rewrite the six items from icon-tile cards into a numbered "parcours"
  list (`<ol>`), one `<li>` per item, mirroring mockup `.step`
  (lines 358-369) — **not** the shared `Card` component's `tint` variant,
  since `.step` is transparent at rest and only tints on hover/active,
  where the generic `tint` variant tints unconditionally. Per item:
  - A `.step-n`-equivalent 42px `rounded-[14px]` pill showing the
    zero-padded index (`String(index + 1).padStart(2, "0")`), white bold
    text, with a per-index gradient background matching the mockup exactly
    (index 0-5): `linear-gradient(135deg,var(--violet),var(--indigo))`,
    `linear-gradient(135deg,var(--blue),var(--deep))`,
    `linear-gradient(135deg,var(--amber),#B4771A)`,
    `linear-gradient(135deg,var(--sky),var(--blue))`,
    `linear-gradient(135deg,var(--mint),#0E9F6E)`,
    `linear-gradient(135deg,var(--violet-l),var(--violet))`. `#B4771A` is
    already a raw-hex precedent in this same file (the existing "futur"
    badge); `#0E9F6E` has no equivalent token — same class of exception,
    matched verbatim from the mockup, not a new brand color.
  - Drop the `FORMAT_ICONS` lucide map and its imports entirely — the
    mockup's `.step-n` shows only the number, no icon glyph.
  - The row: `rounded-[18px] border border-transparent bg-transparent
    p-[1.3rem_1.4rem] transition-[background-color,border-color]
    duration-[var(--duration-base)] ease-[var(--ease-brand)]` — **zero
    box-shadow at any state** (niveau 1). On hover, and statically on the
    first item (`index === 0`, mirroring the mockup's `.step.on` — a static
    "first item active" state, no scroll-linked JS per D-17):
    `bg-[var(--tint-violet)] border-[var(--hairline)]`.
  - A 3px vertical liseré: absolutely positioned `span`, `left-0 top-4
    bottom-4 w-[3px] rounded-full
    bg-[linear-gradient(180deg,var(--violet),var(--blue))]`, `opacity-0` at
    rest, `opacity-100` on hover and statically on the first item — put
    `group` on the `<li>`, use `group-hover:opacity-100` plus a literal
    `opacity-100` when `index === 0`.
  - Keep the existing "futur" badge treatment verbatim (`item.statut ===
    "futur"`, amber pill "À venir") on item 3's `<h3>`.
  - **The six items' `titre`/`description` still come from the same
    `getSectionItems("format-modalites")` call — do not change a single
    word, do not reorder.**
- Below the `<ol>`, add a static progression rail (`aria-hidden="true"`,
  mirrors mockup lines 893-900): 6 circular pips (30px, digits 01-06)
  joined by 5 segments. First pip "on" (`bg-[var(--ink)] text-white
  border-[var(--ink)]`), first segment "on"
  (`bg-[linear-gradient(90deg,var(--violet),var(--mint))]`), the rest
  default (`bg-white border-[var(--hairline)] text-[var(--muted2)]` /
  `bg-[var(--border)]`). Purely decorative digits — no locale key needed.
- Add a sticky companion aside (mockup lines 903-923) beside the `<ol>` in a
  `grid lg:grid-cols-[1.02fr_.98fr] gap-[clamp(2rem,4vw,3.5rem)]
  items-start` wrapper; the aside gets `lg:sticky lg:top-[104px]`. Render it
  as a **niveau 2** surface (`Card variant="default"` — matches AC-1's
  "niveau 2 on ... the parcours' side frame"), containing:
  - A header row: `Layers` lucide icon + bold title text.
  - 6 checklist rows (`Check` lucide icon in a mint dot for 5 of them, an
    empty ring dot for the 6th "wait" row, matching the futur item), plus a
    footer line with a `GraduationCap` icon and "`{N} modules · {H} de
    formation live`" — `{N}`/`{H}` computed at request time (never
    hardcode "5 modules"/"17 h") via `getModules()` from
    `@/lib/content/queries`, summed the same way `stats-band.tsx` already
    does (`modules.reduce((sum, m) => sum + m.dureeHeures, 0)`), formatted
    with `formatNumber`/`formatHours` from `@/lib/i18n/fr`.
  - This wrapper copy (title, 5 checklist labels, the "wait" label, the
    resume template) is new decorative chrome, not signed content — add it
    to `common.json` as a new top-level key:
    ```json
    "formatModalitesAside": {
      "titre": "Ce que comprend votre parcours",
      "items": [
        "Sessions animées en direct",
        "Support PDF par module",
        "Cas pratique en fin de module",
        "Accès aux supports",
        "Aucun prérequis SAP"
      ],
      "itemFutur": "Compléments vidéo — à venir",
      "resume": "{modules} modules · {heures} de formation live"
    }
    ```
    Substitute `{modules}`/`{heures}` with `.replace()`, the same
    single-brace pattern `footer.tsx` already uses for `{annee}` — no
    templating library.
  - Fetch `getModules()` alongside the existing `getSection`/
    `getSectionItems` calls in one `Promise.all`; extend the existing
    `!sectionResult.ok || !itemsResult.ok` error gate to also cover
    `!modulesResult.ok` (same `EmptyState tone="error"` fallback already in
    the file).

Verify: `npm run build`; in `.next/server/app/index.html`, no element whose
class list contains both a `step`-scoped marker and `shadow-[var(--shadow-3`
or `shadow-[var(--shadow-4` (grep for `shadow-\[var\(--shadow-[34]` inside
the format-modalites section markup — must be zero hits there); the item
texts "Formations live" and "Prérequis" are still present verbatim.

## Task 2 — CTA final: two-column assembly card + photo slot on Confiance

Files: `src/components/sections/cta-final.tsx`,
`src/components/sections/confiance.tsx`, `src/locales/fr/common.json`

**cta-final.tsx** — split the panel into two columns (mockup `.cta-grid`,
lines 986-1058):

- Change the `Reveal` panel's inner layout from the current centered
  single column to `grid gap-[clamp(2rem,4vw,3.5rem)]
  lg:grid-cols-[1.02fr_.98fr] items-center text-left` (drop `text-center`
  and the `mx-auto`/`items-center` centering on the eyebrow/h2/lead — they
  become left-aligned block children of the left column). **Keep the left
  column's existing content, CTA hrefs (`/reservation`,`/programme`) and
  copy untouched** — only its container changes from centered-stack to
  grid-cell.
- **Shadow-4 bookkeeping (D-23/AC-2 — reword, don't duplicate):** the outer
  gradient panel currently carries `shadow-[var(--shadow-4),var(--shadow-brand)]`.
  Drop `--shadow-4` from the outer panel (keep `--shadow-brand` only) — the
  new `.asm` card (below) becomes the section's sole `--shadow-4` consumer,
  so the page-wide count stays exactly two (hero console + this card), per
  the CONTEXT/UI-SPEC wording fixed in Task 4. Do not leave `--shadow-4` on
  both the outer panel and the inner card — that would be three sites.
- Build the right column, the `.asm` "carte d'assemblage" (mockup lines
  1002-1057), `aria-hidden="true"` (it is decorative — the pills/checklist
  restate the left column's own text, nothing new is announced to screen
  readers):
  - Outer wrapper: `rounded-[22px] bg-white overflow-hidden
    shadow-[var(--shadow-4),var(--inset-hi)] text-[var(--ink)]` — the
    explicit `text-[var(--ink)]` is load-bearing: `.cta-final` sets
    `color:#fff` on all descendants (mockup comment), so without it every
    label inside this white card renders white-on-white.
  - A top bar: 3 decorative dots (`background:#FF5F57/#FEBC2E/#28C840` —
    literal macOS traffic-light hex, no site token exists for this chrome,
    same exception class as the futur-badge amber), a frame label
    (`common.assemblage.frameLabel`), and a status pill
    (`common.assemblage.statut`) using `text-[var(--mint)]
    bg-[var(--success-muted)]` (closest existing tokens to the mockup's
    green chip — do not invent new hex for it).
  - The `.asm-wires` SVG: copy the mockup's three static bezier paths
    verbatim (`viewBox="0 0 100 100" preserveAspectRatio="none"`, the
    `w1`/`w2`/`w3` linearGradient defs and the three `<path>` d-attributes
    at lines 1028-1030) — **no JS generation, no resize recompute**. Use
    `stop-color="var(--violet)"` / `var(--amber)` / `var(--mint)` in the
    gradient stops instead of the mockup's literal hex (`#635BFF`/`#FFB444`/
    `#1FC79B` are exactly those tokens) — CSS custom properties resolve
    fine in inline SVG `stop-color` here since it's rendered inline in the
    HTML document, not a standalone `.svg` file.
  - Three `.asm-pill` rows (`Appel découverte` / `Session live` /
    `Support PDF`, icons `UserCheck` / `Radio` / `FileText` from
    lucide-react in a small gradient square — violet→indigo,
    amber→`#B4771A`, mint→`#0E9F6E`, same two hex exceptions as Task 1),
    each pill: `bg-white border-[var(--hairline)]
    shadow-[var(--contact),var(--inset-hi)] text-[var(--ink)] font-bold` —
    label text comes from `common.assemblage.pills[].label`.
  - The `.asm-card` (mockup lines 1048-1056): `rounded-[18px] p-[1.15rem]
    text-white bg-[linear-gradient(135deg,var(--violet),var(--indigo))]
    shadow-[var(--shadow-brand)]` (no `--shadow-4` here — only the outer
    `.asm` wrapper carries it, per the bookkeeping note above), containing:
    a badge (`GraduationCap` icon + `common.assemblage.badge`), an `h4`
    (`common.assemblage.moduleTitre`), a subtitle line built the same way
    as Task 1's aside resume (`common.assemblage.resume`, `{modules}`/
    `{heures}` substituted from a `getModules()` call in this file's own
    `Promise.all`), a full-width white progress bar (purely decorative, no
    text), and 3 checkmark rows reusing `common.assemblage.pills[].label`.
- Extend the existing `!sectionResult.ok` error gate to also cover the new
  `getModules()` result (same `EmptyState tone="error"` fallback).
- Add to `common.json`:
  ```json
  "assemblage": {
    "frameLabel": "Votre parcours SAP Ariba — assemblage",
    "statut": "En préparation",
    "badge": "Parcours SAP Ariba",
    "moduleTitre": "Procure-to-Pay",
    "resume": "{modules} modules · {heures} de formation live",
    "pills": [
      { "cle": "appel-decouverte", "label": "Appel découverte" },
      { "cle": "session-live", "label": "Session live" },
      { "cle": "support-pdf", "label": "Support PDF" }
    ]
  }
  ```

**confiance.tsx** — add the photo placeholder on this section (it is the
"À propos" nav anchor, per the brief):

- Above the existing three-fact grid, add a `grid gap-10 lg:grid-cols-2
  lg:items-center` row: left cell is the existing `SectionHeader` call with
  an added `className="text-left mx-0 max-w-none"` (overrides the
  component's default centered/`max-w-3xl` styling via `cn`'s `twMerge`,
  without touching `section.tsx` — a left-aligned header is unique to this
  composite row); right cell is a new 16:9 `<figure>` "photo slot" (mockup
  lines 939-943): `aspect-[16/9] rounded-[20px] border-[1.5px] border-dashed
  border-[#D6D3F0] bg-[var(--tint-violet)] grid place-items-center
  text-center gap-2 p-6` — `#D6D3F0` is the mockup's dashed-border color,
  no token exists for it, same exception class. Contents: a `Camera`
  lucide icon in a small white rounded square, `common.photoSlot.label`
  (`text-[var(--violet)]` uppercase small caps), `common.photoSlot.description`.
  **No `<img>`, no `next/image` call, no stock photo** — this is a declared
  empty slot only.
- Add to `common.json`:
  ```json
  "photoSlot": {
    "label": "Photo · portrait du formateur",
    "description": "Emplacement réel, dimensionné 16/9 et prêt pour next/image. Il reste déclaré tant qu'aucun fichier n'est fourni."
  }
  ```

Verify: `npm run build`; in `.next/server/app/index.html`, `shadow-[var(--shadow-4)` (as a literal substring, accounting for the multi-value `shadow-[var(--shadow-4),...]` form) appears on exactly two rendered elements page-wide (hero console frame + the `.asm` card) — grep the compiled `.next/static/css/*.css` is not sufficient (F-3: Tailwind emits declared vars regardless of use), assert against the prerendered HTML class attributes instead; the three pill labels ("Appel découverte", "Session live", "Support PDF") are present as visible text (not just inside an `aria-hidden` ancestor's alt/aria-label) — Task 1's aside makes the same three concepts visible via signed item titles, so this is presentational duplication, not new information; no horizontal overflow at 375px width (`scrollWidth === clientWidth` — manual/human check, not automatable from static HTML).

## Task 3 — Correction A: mobile-nav burger icon

Files: `src/components/layout/mobile-nav.tsx`

- Import `Menu`, `X` from `lucide-react`.
- Replace the button's visible `<span aria-hidden="true">{open ?
  common.nav.menu.fermer : common.nav.menu.ouvrir}</span>` text with an
  icon: `open ? <X aria-hidden="true" className="size-5" /> : <Menu
  aria-hidden="true" className="size-5" />`.
- Keep `aria-label={open ? common.nav.menu.fermer : common.nav.menu.ouvrir}`
  and `aria-expanded={open}` on the `<button>` exactly as they are — the
  accessible name comes from `aria-label` alone, no visible text or
  `sr-only` span is needed once the icon carries `aria-hidden="true"`.

Verify: `npm run lint && npm run typecheck && npm run build`; in
`.next/server/app/index.html`, `aria-label="Ouvrir le menu"` is present on
the burger `<button>` and the literal rendered text node `>Ouvrir le menu<`
is absent (`grep -c '>Ouvrir le menu<' .next/server/app/index.html` returns
0 — the string only appears inside the `aria-label="..."` attribute now).

## Task 4 — Correction B: AC-1 wording fix (button hover ≠ niveau 3)

Files: `.planning/phases/02-site-public/02-CONTEXT.md`,
`.planning/phases/02-site-public/02-UI-SPEC.md`

Both files carry the identical criterion-1 sentence (CONTEXT.md `<specifics>`
→ "Acceptance criteria", around line 282; UI-SPEC.md §7, around line 175):

> "niveau 3 on **exactly two** rendered elements page-wide (hero console,
> CTA final card)."

Reword to count **two persistent niveau-3 surfaces**, explicitly excluding
`Button`'s primary-variant hover micro-interaction
(`hover:shadow-[var(--shadow-4)]` in `button.tsx`, which fires on every
primary button instance site-wide — header CTA, hero CTAs, programme CTA,
cta-final buttons — and is not a niveau-3 surface). Replace the sentence in
both files with:

> "niveau 3 on **exactly two persistent surfaces** page-wide (hero console
> frame, CTA-final assembly card) — the ceiling counts rendered elements
> that carry the niveau-3 rest/hover treatment (raised Card variant or an
> equivalent hand-styled surface), not a `Button` primary variant's
> `hover:shadow-[var(--shadow-4)]` hover micro-interaction, which is
> excluded from the count."

Do not touch any other criterion or any other sentence in either file.

Verify: `grep -n "niveau 3 on" .planning/phases/02-site-public/02-CONTEXT.md
.planning/phases/02-site-public/02-UI-SPEC.md` shows the new wording in both
files, identical sentence.

## Final verification

- `npm run lint`, `npm run typecheck`, `npm run build` all exit 0.
- 14 routes still static/prerendered (`next build` output, "○ (Static)" /
  ISR markers unchanged in count from before this run).
- No raw hex introduced beyond the documented exceptions above (`#B4771A`,
  `#0E9F6E`, `#FF5F57`/`#FEBC2E`/`#28C840`, `#D6D3F0`) — every other color
  in the new markup resolves through a `globals.css` token.
- No new `ease-in`/`ease-out`/`ease-in-out`/`linear` on any `transition`/
  `animation` (`grep -rn "ease-in\|ease-out\|linear" src/components/sections/format-modalites.tsx src/components/sections/cta-final.tsx src/components/sections/confiance.tsx src/components/layout/mobile-nav.tsx` — only false positives like "linear-gradient" allowed, no bare easing keyword on a transition/animation property).
- No price, no payment-provider name introduced anywhere in this run's
  diff.
