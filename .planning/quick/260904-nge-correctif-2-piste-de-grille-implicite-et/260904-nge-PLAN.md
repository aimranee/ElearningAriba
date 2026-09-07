---
quick_id: 260904-nge
status: complete
---

# Quick Task 260904-nge: Correctif 2 — piste de grille implicite et boutons de mois

## Contexte

Corrige D-30 : le débordement de `/agenda` et `/admin/reservations` ne venait
pas du calendrier (cellules déjà fluides depuis le correctif précédent) mais
de la piste de grille implicite des deux conteneurs
`grid gap-4 md:grid-cols-2`, dont l'élément de grille porte `min-width: auto`
par défaut. Voir `ariba-cto/notes/2026-09-04-le-calendrier-n-etait-pas-le-coupable-min-width-auto.md`.

Périmètre exact imposé par le brief — rien d'autre à toucher :
`agenda-booker.tsx:270`, `reservation-actions.tsx:115`, `calendrier-mois.tsx`,
`04-CONTEXT.md`.

## Tâches

1. Ajouter `grid-cols-1` aux deux conteneurs `grid gap-4 md:grid-cols-2`
   (`agenda-booker.tsx`, `reservation-actions.tsx`) — supprime le plancher de
   min-content de la piste implicite.
2. Boutons de navigation de mois (`calendrier-mois.tsx`) : icône seule
   (`ChevronLeft`/`ChevronRight` de `lucide-react`) sous `sm:`, libellé texte
   à partir de `sm:` via `sr-only sm:not-sr-only`, `aria-label` permanent,
   `h-11 min-w-11` conservé.
3. Mesurer sous Playwright (build de production, port 3016) :
   `documentElement.scrollWidth === window.innerWidth` sur `/agenda` et
   `/admin/reservations` à 1440, 375, 320 ; largeur/hauteur des boutons de
   mois au label visible.
4. Consigner D-34 (corrige D-30) et D-35 dans `04-CONTEXT.md`.

## Condition de sortie

`scrollWidth === innerWidth` aux trois largeurs sur les deux surfaces — seule
condition de sortie du brief.
