---
phase: 01-cadrage-contenus-et-design
plan: 11
subsystem: maquettes
tags: [routes, inscription, connexion, espace-apprenant, field-family, empty-state]
dependency-graph:
  requires: ["01-04", "01-05", "01-06", "01-07"]
  provides: ["route:/inscription", "route:/connexion", "route:/espace"]
  affects: ["Lot 3 (comptes, connexion, espace apprenant)"]
tech-stack:
  added: []
  patterns:
    - "Field family composed as Field > FieldLabel > FieldControl > FieldDescription/FieldError, matching plan 01-06's API"
    - "data-rejected=\"server\" passed as a literal attribute on Field (not the rejected= convenience prop) to keep the server-rejected marker visible in source"
key-files:
  created:
    - src/app/inscription/page.tsx
    - src/app/connexion/page.tsx
    - src/app/espace/page.tsx
  modified: []
decisions:
  - "Section/SectionHeader (plan 01-09) is not a dependency of this plan and was not available in the wave-5 worktree — pages use plain h1/h2 markup instead"
  - "espace.bienvenue rendered as the page's <h2>, doubling as both the greeting and the section heading above the surface grid, to avoid an invented heading string"
  - "Demonstration-block <h2> titles for /inscription and /connexion reuse common.nav.inscription and common.nav.connexion (no dedicated 'états' heading key exists in the locale bundle, and src/locales/ is out of scope for this plan)"
  - "Google button icon is lucide-react's Chrome — no brand icon exists in lucide; it's a decorative pictogram only, the control is inert"
metrics:
  duration: "35min"
  completed: "2026-08-29"
---

# Phase 1 Plan 11: Inscription, Connexion, Espace Apprenant Summary

Three real Next.js routes at the signed French slugs — `/inscription`,
`/connexion`, `/espace` — built on the design system's field and empty-state
families, with no authenticated behaviour and no invented data.

## What Was Built

- `src/app/inscription/page.tsx` — the account-creation maquette: six fields
  (`prenom`, `nom`, `email`, `motDePasse`, `confirmation`, `profil`) via the
  `Field`/`FieldLabel`/`FieldControl`/`FieldDescription` family, a `profil`
  `<select>` rendered through `FieldControl`'s `render` prop, and a states
  demonstration block showing default, disabled, loading (`data-loading`),
  client-side invalid (`aria-invalid` + `FieldError`), and server-rejected
  (`data-rejected="server"` + `FieldError`) — the two error kinds visually
  distinguishable per the field family's built-in styling. The
  `inscription.succes` confirmation state renders as a second `Card`.
- `src/app/connexion/page.tsx` — email/password fields, an inert "mot de
  passe oublié" control, an inert Google button (`Chrome` icon,
  `variant="outline"`), and a states block for all three `connexion.erreurs`
  keys (`identifiantsInvalides`, `rejetServeur`, `tropDeTentatives`).
- `src/app/espace/page.tsx` — the learner space: a top-level
  `EmptyState tone="waiting"` for `espace.aucuneReservation` (with an
  `EmptyStateAction` linking to `/agenda`), then six surfaces
  (`rendezVous`, `sessions`, `historique`, `documents`, `factures`,
  `avancement`) each as a `Card` + `EmptyState`, tone `waiting` for the two
  surfaces expecting near-term content and `neutral` for the rest. No sample
  row, no percentage, no progress bar anywhere. `data-density="default"` sits
  on the surface grid per the back-office density contract (D-24).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - blocking] `src/app/contact/page.tsx` and
`src/components/sections/section.tsx` referenced in Task 1's `read_first` do
not exist in this worktree** — they belong to sibling wave-5 plans (01-09,
01-10) not in this plan's `depends_on` and not yet merged at execution time.
This plan's own `<interfaces>` block does not list `Section`/`SectionHeader`
as available, so no functionality was skipped; the three routes use plain
`h1`/`h2`/`Card` markup instead of a `Section` wrapper. Not blocking — no
task required these files to exist, only to consult them for consistency.

**2. [Rule 1 - bug] Own code comment tripped the connexion verify script's
OAuth-wiring check** — a `/* why */` comment mentioning "OAuth" matched the
verify regex `/accounts.google|oauth2|OAuth/`, even though no OAuth logic
existed. Reworded the comment to describe the same constraint ("no provider
client, no consent-flow URL, no redirect") without the flagged word. Files:
`src/app/connexion/page.tsx`. Commit: `20fcc06`.

**3. [Rule 1 - bug] espace surface grid used `sm:`/`lg:` instead of the
spec'd `md:`/`lg:` responsive steps** — Task 3 explicitly calls for "single
column below `sm`, two at `md`, the full grid at `lg`"; the initial grid
skipped `md`. Fixed to `grid md:grid-cols-2 lg:grid-cols-3`. Commit:
`37ca3fc`.

### Content-layer heading gap (documented, not a deviation from a rule)

No locale key exists for a "démonstration des états" section title in
`inscription.json` or `connexion.json`, and this plan is barred from
modifying `src/locales/`. Rather than inventing new French copy inline
(forbidden by D-29) or stopping the plan for a non-blocking, non-gated
heading string, the `<h2>` above each states block reuses the existing
`common.nav.inscription` / `common.nav.connexion` labels. Flag for the
manager session if a more precise heading is wanted later — it is a one-line
change once plan 01-04 adds a key.

## Known Limitations

- **`npm run typecheck` was not run.** `node_modules` does not exist in this
  worktree and this plan's hard prohibitions forbid `npm install`. All three
  automated `node -e` verification scripts from Tasks 1 and 2 were run
  directly and pass. Per D-39, verification longer than a few minutes (which
  includes any install) happens in the manager session, not in this run —
  `npm run typecheck` must be run there before the plan is considered fully
  verified.
- The three routes were not rendered in a browser (no dev server available
  in this session per `CLAUDE.md`); visual, responsive and keyboard checks
  were done by code review against the field/empty-state family's existing
  CSS state contracts, not by interaction.

## Self-Check

- `src/app/inscription/page.tsx` — FOUND
- `src/app/connexion/page.tsx` — FOUND
- `src/app/espace/page.tsx` — FOUND
- Commit `20fcc06` (`#feat: add inscription and connexion maquettes with full field states`) — FOUND
- Commit `1ee365d` (`#feat: add espace apprenant maquette with six honest empty states`) — FOUND
- Commit `37ca3fc` (`#fix: use md breakpoint for espace surface grid per responsive spec`) — FOUND

## Self-Check: PASSED
