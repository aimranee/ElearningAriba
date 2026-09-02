---
quick_id: 260902-x6c
status: complete
---

# Quick Task 260902-x6c: Mur competences — aplats soft (run 2/5)

Run 2/5 of the scale/palette rework (run 1: `260902-r1s`, commits `bcac989`/`8879bc0`).
Consumes run 1's tokens on the six-competency wall.

## What changed

`src/components/sections/competences.tsx` only:

- `CARD_ACCENTS: Record<string, string>` → `CARD_TEINTES: Record<string, { soft: string; ink: string }>`.
  Three hues changed family per the audit correspondence: procure-to-pay `--blue`→azur,
  gestion-catalogues `--indigo`→magenta, certification `--sky`→coral. Fallback stays violet.
- Tile rebuilt to the brief's literal target: removed the 22% color-mix border, the absolute
  gradient overlay + its `group-hover`, the 150px watermark at opacity 0.18, the 3px
  `data-slot="competence-rule"` bar, `bg-white`, the `group` class, and the `relative z-[1]`
  wrapper. New tile: `bg-[var(--tuile-soft)]` (soft/ink pushed via inline CSS custom properties),
  pictogram in normal flow (`size-7 shrink-0 text-[var(--tuile-ink)]`), `flex flex-col gap-[0.9rem]`
  so a missing pictogram leaves no dead space. Hover lift (D-17) and shape (`rounded-[20px]
  overflow-hidden p-[1.6rem] min-h-[13.5rem] h-full`) unchanged.
- Typography scaled onto run 1's tokens: title `text-[length:var(--text-card)]
  leading-[var(--text-card--line-height)] text-[var(--ink)]`, description
  `text-[length:var(--text-small)] leading-[var(--text-small--line-height)] text-[var(--ink-soft)]`
  (D-79's `length:` index — bare `text-[var(--x)]` compiles to `color:` in Tailwind v4).

Recorded **D-80 to D-84** in `02-CONTEXT.md` (soft-fill rationale, pictogram ink-on-own-soft
acceptance, 3px rule removal, typography-in-same-run decision, the CTO's measured contrast
table for `--ink`/`--ink-soft`/`--muted-ink`/teinte-ink on soft fills).

## Not touched

`globals.css` (all twelve tokens already present from run 1), any other section/component/page,
`Section tone="default"` alternation, the pictogram registry, the certification `Award` fallback,
`Reveal`/`dataD`, the grid/gutters, any content (`landing.json`, `content:seed`).
`--blue`/`--indigo`/`--sky` left in `globals.css` — their removal is run 4.

## Verification

No browser tool available. `npm run build` intentionally skipped (would overwrite `.next` and
serve stale code to the CTO's Playwright verification on `:3200`).

- `npm run lint` — exit 0.
- `npm run typecheck` (`next typegen && tsc --noEmit`) — exit 0.
- `npm run content:check` — exit 1, pre-existing gate (`faq.items` blocked CADR-03, 71 CADR-03 +
  11 CADR-01 keys), not a regression.

Branch `gsd/phase-02-site-public` confirmed at start and unchanged throughout. Nothing pushed.

**Left for the CTO to measure via Playwright** (per the brief, D-74's rule — no DOM assertion
invented here): the six distinct soft fills render in correspondence order, title computes to
20px / description to 14px, real contrast ≥7.0 on both, zero `--muted-ink` on a tile, zero
remaining watermark/tinted-border/3px-rule elements, no horizontal overflow or tile truncation
at 375px.
