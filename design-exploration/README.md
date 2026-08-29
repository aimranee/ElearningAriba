# Exploration visuelle — Lot 1 (D-03, D-33)

Trois directions jetables, hors `src/`, pour choisir la palette, la
typographie et la courbe d'animation avant qu'aucun token n'entre dans
l'application.

## Comment regarder

Ouvrir chaque fichier `.html` directement dans un navigateur — double-clic
ou glisser dans un onglet. Aucun build, aucun serveur, aucune dépendance.

## Ce qui se décide ici

Trois décisions, et seulement trois :

1. **La palette** — le bleu, le vert et le blanc exacts (`oklch(...)`).
2. **La typographie** — la police des titres et celle du texte.
3. **La courbe d'animation** — la seule easing curve utilisée sur tout le
   site (`--ease-brand`).

## Comparatif

| Direction | Police titres | Police texte | `--primary` | `--success` | `--foreground` | `--ease-brand` | Parti pris |
|---|---|---|---|---|---|---|---|
| 1 — clarté | Inter | Inter | `oklch(0.52 0.18 255)` | `oklch(0.62 0.15 150)` | `oklch(0.24 0.02 250)` | `cubic-bezier(0.16, 1, 0.3, 1)` | Blanc généreux, bleu en accent rare, surfaces quasi plates. |
| 2 — profondeur | Manrope | Inter | `oklch(0.48 0.2 260)` | `oklch(0.65 0.16 145)` | `oklch(0.2 0.03 260)` | `cubic-bezier(0.22, 1, 0.36, 1)` | Hero bleu profond, blobs flous, grain, cartes flottantes à fort contraste. |
| 3 — éditorial | Fraunces | Inter | `oklch(0.44 0.16 258)` | `oklch(0.58 0.14 148)` | `oklch(0.22 0.015 250)` | `cubic-bezier(0.4, 0, 0.2, 1)` | Serif display, filets fins, vert comme marqueur éditorial plutôt que couleur de succès seule. |

## Après la décision

Les valeurs de la direction retenue vont dans `src/app/globals.css` et
`src/app/layout.tsx` (Wave 2). `design-exploration/` est supprimé une fois
les maquettes validées.

## Direction retenue

```
direction: 2 — profondeur
police-titres: Plus Jakarta Sans
police-texte: Inter
primary: oklch(0.578 0.235 260)
success: oklch(0.65 0.16 145)
foreground: oklch(0.26 0.06 251)
ease-brand: cubic-bezier(0.16, 1, 0.3, 1)
```

Note : `--primary` donne 4,54:1 sur blanc (AA texte normal). Les états
`:hover` et `:active` doivent **assombrir** cette couleur (jamais l'éclaircir)
pour rester lisibles.
