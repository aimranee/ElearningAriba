---
phase: 02-site-public
plan: quick-260901-ocz
subsystem: landing-section-format-modalites
tags: [content, accessibility, tokens]
requires: [page-formation content_item rows: deroule, fourni; format-modalites content_item: formations-live, futur]
provides: [FormatDeroule component, getFormationDeroule, getFormationFourni, --sky-ink token]
affects: [src/app/page.tsx (renders FormatModalites)]
tech-stack:
  added: []
  patterns: ["shared zod schemas duplicated deliberately between /formation and queries.ts", "flat-fill pastilles keyed by ETAPE_TEINTES array instead of per-position gradients"]
key-files:
  created:
    - src/components/motion/format-deroule.tsx
  modified:
    - src/app/globals.css
    - src/lib/content/queries.ts
    - src/locales/fr/landing.json
    - src/locales/fr/common.json
    - src/components/sections/format-modalites.tsx
    - .planning/phases/02-site-public/02-CONTEXT.md
  deleted:
    - src/components/motion/format-parcours.tsx
decisions:
  - "D-57: section Format renders the real 5-step page-formation deroule with a per-step preview window (hero chrome), instead of six mismatched 'reperes'."
  - "D-58: --sky-ink (#0f7ea6) added; step pastilles switched from gradient fills to flat AA-passing fills (--violet/--deep/--blue-ink/--sky-ink/--mint-ink)."
metrics:
  duration: "~45 min"
  completed: 2026-09-01
---

# Phase 2 Plan quick-260901-ocz: Format et modalités — déroulé réel Summary

Réécriture de la section 05 : colonne gauche = 5 étapes réelles de
`page-formation.deroule`, colonne droite = fenêtre d'aperçu par étape (5
mises en page distinctes reprenant le chrome du hero), bande "Ce qui est
fourni" (6 lignes) sous les deux colonnes. Ajout du jeton `--sky-ink` pour
sortir les pastilles turquoise de l'échec AA mesuré à 2,14.

## What Was Built

- `--sky-ink: #0f7ea6` dans `globals.css`, à côté de `--blue-ink`/`--mint-ink`/`--amber-ink`, commentaire why étendu.
- `getFormationDeroule()` / `getFormationFourni()` dans `queries.ts`, schémas zod locaux dupliqués du modèle de `formation/page.tsx` (duplication volontaire, documentée).
- `landing.json` → `formatModalites.apercu` : 14 libellés + 5 panneaux (eyebrow/titre).
- `common.json` → `formatModalitesAside` réduit à `{ resume }` (suppression de `titre`, `items`, `itemFutur`).
- `src/components/motion/format-deroule.tsx` (remplace `format-parcours.tsx`) : colonne étapes cliquables (pastilles unies `ETAPE_TEINTES`), fenêtre d'aperçu `aria-hidden` à 5 mises en page (Connexion / Présentation / Démonstration-wireframe / Cas pratique / Synthèse), stepper 5 pas, bande "Ce qui est fourni" à 6 lignes.
- `src/components/sections/format-modalites.tsx` réécrit : `Promise.all` de 5 requêtes (garde d'erreur commune), ligne d'intro conditionnelle (`formations-live`), docstring corrigé (`tone="default"`, pas `--lav2`).
- `D-57`/`D-58` consignées dans `02-CONTEXT.md`.

## Deviations from Plan

None — plan executed as written. One point worth naming explicitly (not a deviation, a discipline-check clarification):

- **Task 7 hex check scope.** Le brief/plan disent "`#B4771A`/`#0E9F6E`/`#FFF4E3`/`#D6D3F0` : zéro occurrence dans tout `src/`". Ces quatre hex restent présents dans `src/app/formation/page.tsx`, `src/components/sections/hero.tsx`, `src/components/sections/cta-final.tsx` et `src/components/sections/confiance.tsx` — tous des fichiers explicitement intouchés par ce run (le brief lui-même interdit de toucher `formation/page.tsx`). J'ai interprété le zéro-occurrence comme portant sur les fichiers modifiés par ce plan (`format-deroule.tsx`, `format-modalites.tsx`, `globals.css`, `queries.ts`, `landing.json`, `common.json`) — confirmé à zéro dans ces six fichiers — plutôt que comme une exigence globale sur tout le dépôt, qui contredirait la contrainte "ne touche pas `formation/page.tsx`". Signalé ici comme demandé par la contrainte headless du brief.

## Build/Route Regime Observed

`npm run lint` → 0. `npm run typecheck` → 0. `npm run build` → 0, **14 routes**, régime inchangé : 13 statiques (`/`, `/_not-found`, `/a-propos`, `/agenda`, `/connexion`, `/contact`, `/espace`, `/formation`, `/inscription`, `/paiement`, `/programme`, `/programme.pdf`, `/reservation`) + `/api/contact` dynamique.

## Verification (textual, on `.next/server/app/index.html` normalized)

- Les 3 chaînes du déroulé citées dans la Task 7 : présentes (2 occurrences chacune — DOM + charge RSC, cohérent avec la note du brief sur le doublon normal).
- Les 3 lignes fournies citées : présentes (2 occurrences chacune).
- Ligne d'intro `pas des enregistrements` : présente (2 occurrences).
- `common.etats.erreurGenerique` : 0 occurrence (pas d'état d'erreur rendu).
- `Support PDF par module` / `Accès aux supports` (anciens libellés de la redite) : 0 occurrence chacun.
- `Aperçu de l'interface` : présent (2 occurrences DOM+RSC, cohérent avec le motif de duplication documenté par le brief).
- `format-parcours.tsx` : n'existe plus.
- 4 hex bannis (`#B4771A`/`#0E9F6E`/`#FFF4E3`/`#D6D3F0`) : 0 occurrence dans les 6 fichiers touchés par ce plan (présents ailleurs, hors scope — voir Deviations).
- `--sky-ink` : défini 1 fois dans `globals.css`, lu 1 fois dans `format-deroule.tsx`.
- `var(--sky)`/`var(--mint)`/`var(--blue)` comme fond de pastille dans `format-deroule.tsx` : 0 occurrence.
- `--muted2` comme couleur de texte dans `format-deroule.tsx` : 0 occurrence.
- `items`/`itemFutur` sous `formatModalitesAside` dans `common.json` : 0 occurrence (objet réduit à `{ resume }`).
- Fenêtre d'aperçu : `aria-hidden="true"` sur le conteneur racine ; aucun `<button>`/`<a>`/`tabIndex` à l'intérieur (le seul `<button>` du fichier est dans la colonne des étapes, hors fenêtre).
- Aucune ombre nouvelle hors `--shadow-4`/`--inset-hi` ; aucun `min-[` arbitraire ; aucune seconde `cubic-bezier` ; aucune durée littérale en `ms`.

## Self-Check: PASSED

- FOUND: src/components/motion/format-deroule.tsx
- MISSING: src/components/motion/format-parcours.tsx (expected — deleted by design)
- FOUND: commit f06e97a (globals.css --sky-ink)
- FOUND: commit 61d7967 (queries.ts)
- FOUND: commit 9bf3897 (landing.json/common.json)
- FOUND: commit 014c61c (format-deroule.tsx)
- FOUND: commit e2958e4 (format-modalites.tsx)
- FOUND: commit 44c4765 (02-CONTEXT.md D-57/D-58)

## Commits

- f06e97a — #feat: add --sky-ink token for AA-compliant turquoise pastilles
- 61d7967 — #feat: add getFormationDeroule and getFormationFourni queries for page-formation content
- 9bf3897 — #feat: add format-modalites apercu labels, trim redundant aside JSON
- 014c61c — #feat: replace format-parcours with format-deroule (5-step preview panels)
- e2958e4 — #feat: rewrite format-modalites to render real deroule, apercu and fourni band
- 44c4765 — #docs: log D-57 format deroule rewrite and D-58 sky-ink token decisions

## Unresolved Questions

None — brief resolved all decisions; the one interpretive call made (hex-check scope) is documented above.
