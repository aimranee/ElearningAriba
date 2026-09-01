---
quick_id: 260901-iag
mode: quick
---

# Quick Task 260901-iag: Retablir alternance teinte/transparent de la landing

## Task Boundary

Trois sections de la landing partagent le meme `tone` que leur voisine, cassant
l'alternance transparent/teinte stricte (D-21). Corriger uniquement l'attribut
`tone=` dans trois fichiers, deux occurrences chacune (etat d'erreur + rendu
principal).

## Tasks

### Task 1 — Corriger les tones dans les trois fichiers de section

**Files:**
- `src/components/sections/programme-accordion.tsx`
- `src/components/sections/format-modalites.tsx`
- `src/components/sections/confiance.tsx`

**Action:**
1. `src/components/sections/programme-accordion.tsx` — les deux occurrences de
   `tone="default"` (etat d'erreur ~ligne 34 et rendu principal ~ligne 49)
   deviennent `tone="band"`.
2. `src/components/sections/format-modalites.tsx` — les deux occurrences de
   `tone="band"` (etat d'erreur ~ligne 26 et rendu principal ~ligne 44)
   deviennent `tone="default"`.
3. `src/components/sections/confiance.tsx` — les deux occurrences de
   `tone="default"` (etat d'erreur ~ligne 34 et rendu principal ~ligne 47)
   deviennent `tone="band"`.

Ne modifier que la valeur de l'attribut `tone=`. Aucun autre fichier, aucune
autre valeur (couleur, jeton, classe, ombre, contenu, duree, grille) ne doit
changer. Ne pas toucher `section.tsx`, ni `pour-qui.tsx`, `competences.tsx`,
`cta-final.tsx`, `faq.tsx`, `hero.tsx`.

**Verify:**
- `grep -n 'tone=' src/components/sections/programme-accordion.tsx` → 2x `band`
- `grep -n 'tone=' src/components/sections/format-modalites.tsx` → 2x `default`
- `grep -n 'tone=' src/components/sections/confiance.tsx` → 2x `band`
- `git diff --stat` touches only these 3 files
- Sequence check: grep tone values for the 7 landing sections in the order
  referenced by `src/app/page.tsx` == band, default, band, default, band,
  default, band
- `npm run content:seed` then `npm run lint`, `npm run typecheck`,
  `npm run build` all exit 0
- Build route table: 13 static (○) routes + exactly 1 dynamic (ƒ) route
  (`/api/contact`). If `/programme.pdf` shows as ƒ, content is missing —
  reseed and rebuild before concluding.
- `.next/server/app/index.html` contains zero occurrences of "pas disponible"
  or "erreur"

**Done:** Both occurrences changed in each of the 3 files, no other files
touched, lint/typecheck/build all pass with the expected route table, and the
grep-verified tone sequence matches band/default/band/default/band/default/band.
