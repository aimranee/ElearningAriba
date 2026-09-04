---
quick_id: 260904-mpc
status: complete
---

# Quick Task 260904-mpc: correctif borné — calendrier, plancher 16px, densité admin

Source: `ariba-cto/notes/2026-09-04-brief-correctif-borne-calendrier-champs-densite-admin.md`
(founder-approved brief, decisions final, no discussion phase — brief is the plan).

## Scope

Exactly the 9 files listed in the brief's section A. Three defects:

1. **Calendrier déborde à 375/320** (`calendrier-mois.tsx`): `min-w-11` on grid day
   cells fights the 7-column grid math. Fix: fluid cells (`w-full`, drop `min-w-11`,
   keep `h-11`), tighter gap/padding below `sm:`.
2. **Champs admin sous 16px** (`input.tsx`, `reservation-creation.tsx`): the compact
   density variant (`in-data-[density=compact]:text-[0.8rem]`) beats a local
   `className="text-base"` because tailwind-merge doesn't treat a variant-prefixed
   utility and a bare one as conflicting. Fix at the source: compact variant becomes
   `text-base`.
3. **Densité admin écrase les contrôles à 28px** (`button.tsx`, `input.tsx`): same
   variant-vs-local-class mechanism, this time on height
   (`in-data-[density=compact]:h-7` → `h-11`).

## Tasks

1. Fluid calendar cells in `calendrier-mois.tsx` (grid gap/padding, drop `min-w-11`,
   `w-full` on both day-cell branches). Nav buttons unchanged.
2. 16px floor: `input.tsx` compact variant `text-[0.8rem]` → `text-base`; drop the
   now-redundant `className="text-base"` on the type selector in
   `reservation-creation.tsx`. `exceptions-editeur.tsx` and `export-panel.tsx`
   already route through `FieldControl`/`inputVariants` — no change needed there.
3. 44px control floor: `button.tsx` and `input.tsx` compact variant
   `h-7` → `h-11`. Scoped to `data-density=compact`, which is only set at
   `src/app/admin/layout.tsx` — Lot 3 surfaces unaffected.
4. Record D-30..D-33 in `04-CONTEXT.md`.

## Verification

- `npm run lint`, `npm run typecheck`, `npm run build` — real output required.
- Section E of the brief: build + `next start -- --port 3016`, Playwright Chrome,
  single login with reused `storageState`, `location.pathname` assertion, DOM
  measurement of scrollWidth / control heights / computed font-size before and
  after, on `/agenda`, `/admin/reservations`, `/admin`, `/admin/horaires`,
  `/admin/jours-feries`, plus a before/after check on `/connexion` and `/espace`.
