---
quick_id: 260831-gb0-run-1-echelle-de-surface-lot2-landing-re
status: complete
commits:
  - 54906da
  - 25f25cf
  - 4b20a85
---

# Run 1/3 — l'échelle de surface, et la réécriture des critères

Trois tâches exécutées dans l'ordre, vérifiées, commitées atomiquement.
Branche restée sur `gsd/phase-02-site-public`, rien poussé.

## Task 1 — tokens SURFACES + trois niveaux de Card
- `src/app/globals.css` : `--hairline`, `--hairline-2`, `--tint`,
  `--tint-violet`, `--contact`, `--inset-hi` ajoutés à `:root`.
- `src/components/ui/card.tsx` : `tint` (niveau 1, zéro ombre), `default`
  (niveau 2, transition `--contact`→`--shadow-1` au survol, avec
  `--inset-hi`), `raised` (niveau 3, inchangé sauf `--inset-hi`).
- Vérif : `npm run typecheck` — 0 erreur.
- Commit `54906da`.

## Task 2 — rétrogradation des six consommateurs
- `pour-qui.tsx`, `confiance.tsx` : `variant="raised"` → `variant="default"`.
- `format-modalites.tsx` : `variant="raised"` → `variant="tint"`.
- `competences.tsx`, `programme-accordion.tsx`, `faq.tsx` : classes
  Tailwind brutes réécrites niveau 1.
- Vérif : `npm run lint && npm run typecheck` — 0 erreur.
- Commit `25f25cf`.

## Task 3 — réécriture D-19/AC-1 + vérification complète
- `02-CONTEXT.md` et `02-UI-SPEC.md` : D-19/composition item 1 et AC-1
  réécrits pour décrire le contrat tri-niveau ; D-23/AC-2 intacts sauf une
  phrase Run 3 ajoutée.
- Résolution du `known_conflict` du plan appliquée telle quelle : le niveau
  2 transite bien `--contact`→`--shadow-1` au survol (le CSS avait raison).
- Commit `4b20a85`.

## Vérification finale
- `npm run lint` : 0
- `npm run typecheck` : 0
- `npm run build` : 0, 14 routes (13 statiques + `/api/contact` dynamique,
  préexistant).
- `.next/server/app/index.html` : `--shadow-3` → 0 occurrence ;
  `--shadow-4` (hors classes hover) → exactement 2 éléments (console héros,
  carte CTA finale).
- Aucun hex brut introduit ; une seule courbe `--ease-brand` site-wide.

## Écarts
Aucun — plan exécuté tel qu'écrit.
