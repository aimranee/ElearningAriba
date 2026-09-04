---
quick_id: 260904-nge
status: complete
---

# Quick Task 260904-nge — Summary

## Ce qui a été fait

1. `src/components/agenda/agenda-booker.tsx:270` et
   `src/components/admin/reservation-actions.tsx:115` : `grid gap-4 md:grid-cols-2`
   → `grid grid-cols-1 gap-4 md:grid-cols-2`. `grid-cols-1` émet
   `repeat(1, minmax(0,1fr))`, ce qui supprime le plancher de min-content sur
   la piste implicite qui causait le débordement (D-34, corrige D-30).
2. `src/components/agenda/calendrier-mois.tsx` : les deux `Button` de
   navigation de mois passent en icône seule (`ChevronLeft`/`ChevronRight`)
   sous `sm:`, libellé texte visible à partir de `sm:`
   (`sr-only sm:not-sr-only`), `aria-label` permanent sur le bouton, `h-11
   min-w-11` conservé (D-35).
3. D-34 et D-35 consignées dans `04-CONTEXT.md`.

Aucun autre fichier touché. `button.tsx`, `input.tsx`, `field.tsx` non
modifiés, conformément au périmètre.

## Commits

- `a0d77f6` — `#fix: ajoute grid-cols-1 pour supprimer le plancher de min-content de la piste implicite`
- `5de4144` — `#fix: boutons de mois en icone seule sous sm avec nom accessible permanent`
- `d8e78b0` — `#docs: consigne les decisions D-34 et D-35 du correctif de la piste de grille`

## Vérification

- `npm run lint` : clean.
- `npm run typecheck` : clean.
- `npm run build` : succès (production, Turbopack).
- `npm run agenda:seed && npm run content:seed` : ok, base locale déjà migrée.
- Mesure Playwright (Chromium) sur `next start -- --port 3016`, une seule
  connexion `formateur@example.test` avec `storageState` réutilisé,
  `waitUntil: "load"`, `location.pathname` vérifié avant chaque mesure,
  boutons mesurés par l'élément visible (le `<button>` lui-même porte
  `aria-label` + `h-11 min-w-11`, pas seulement l'icône interne) :

  | Largeur | Page | scrollWidth | innerWidth | Bouton "Mois précédent" | Bouton "Mois suivant" |
  |---|---|---|---|---|---|
  | 1440 | /agenda | 1440 | 1440 | 117,5×44 | 99,4×44 |
  | 1440 | /admin/reservations | 1440 | 1440 | 117,5×44 | 99,4×44 |
  | 375 | /agenda | 375 | 375 | 44×44 | 44×44 |
  | 375 | /admin/reservations | 375 | 375 | 44×44 | 44×44 |
  | 320 | /agenda | 320 | 320 | 44×44 | 44×44 |
  | 320 | /admin/reservations | 320 | 320 | 44×44 | 44×44 |

  **Condition de sortie unique du brief atteinte aux six combinaisons** :
  `scrollWidth === innerWidth`. Les deux boutons de mois gardent ≥44×44 et un
  nom accessible non vide (`aria-label`) aux trois largeurs. Le script de
  mesure Playwright était un jetable, non commité (pas dans le périmètre du
  brief).

- Note opérationnelle (hors périmètre, consignée pour info) : le serveur
  `next start` précédent (correctif borné du 2026-09-04, commit bd36dd5)
  était resté en écoute sur le port 3016 depuis la session antérieure ;
  chaque nouvelle tentative de `npm run start -- --port 3016` dans cette
  session démarrait un second processus qui échouait à re-binder le port
  sans le signaler bruyamment, et l'ancien processus accumulait les
  tentatives de connexion contre le rate-limit en mémoire de
  `/api/auth/connexion` (5/10min, clé "unknown" en local faute de
  `x-forwarded-for`). Le process a dû être identifié via `netstat` et tué
  explicitement avant de pouvoir mesurer avec une seule connexion propre.
  Sans rapport avec le code applicatif.

## Hors périmètre — pas fait

- Pas de vérification étendue de `/admin` et `/admin/horaires` (le brief ne
  les inclut pas dans la condition de sortie) ; ces fichiers n'ont pas été
  touchés par ce correctif, donc les acquis du correctif précédent (plancher
  16px, hauteurs 44px) ne sont pas en risque de régression.
- Pas de fichier `agenda.json` touché : aucun libellé accessible manquant, les
  clés `moisPrecedent`/`moisSuivant` existantes suffisent pour `aria-label`
  et le libellé visible.
