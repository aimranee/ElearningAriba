---
phase: 04-agenda-et-prise-de-rendez-vous
plan: 09
subsystem: ui
tags: [nextjs, supabase, admin, agenda, types-rendez-vous, d-20, d-26, d-36]

# Dependency graph
requires:
  - phase: 04-agenda-et-prise-de-rendez-vous (plan 01)
    provides: "app.type_rendez_vous, its check constraints and its type_admin_update RLS policy (UPDATE only, no insert, no delete)"
  - phase: 04-agenda-et-prise-de-rendez-vous (plan 03)
    provides: "the public reader of app.type_rendez_vous that /agenda's static shell consumes, and the D-06 revalidate=3600 contract this plan's write path must honour"
  - phase: 04-agenda-et-prise-de-rendez-vous (plan 06)
    provides: "requireAdministrator(), the /admin shell, admin-nav.tsx's single driving array, admin-queries.ts's session-scoped RLS-is-the-filter idiom"
provides:
  - "/admin/types-de-rendez-vous — the AGD-03 configuration screen: label, duration, buffer and price, per type, no create, no delete"
  - "PATCH /api/admin/types-de-rendez-vous — the sole write path onto app.type_rendez_vous, admin-gated"
affects: []

requirements-completed: [AGD-03]

# Metrics
completed: 2026-09-04
---

# Phase 4 Plan 09: Types de rendez-vous configuration screen — Summary

**AGD-03 closes: the trainer configures label, duration, buffer and price for each appointment type from `/admin/types-de-rendez-vous`, through an admin-gated `PATCH` route, and the value they save is the one every priced surface resolves to.** Task 1 (boundary schema, admin read, `PATCH` route) and Task 2 (the configuration screen and the fourth nav entry) were committed in `d6c67a3` and `d796e89`. This summary records Task 3 — the D-26 founder review gate — and the close of the phase.

## Task 3 — Founder Review Gate: APPROVED (2026-09-04)

The text below is transcribed verbatim from the CTO's gate note
(`ariba-cto/notes/2026-09-04-gate-04-09-approbation-et-cloture-du-lot-4.md`),
written and signed 2026-09-04.

---

**Approuvé sur preuves machine et passe navigateur du CTO.** Build de
production reconstruit (`.next/BUILD_ID` postérieur au dernier commit source
— l'artefact laissé par le run était périmé de 87 s), servi par `next start`
sur `:3016`, base locale semée, Playwright Chromium, `location.pathname`
asserté avant chaque mesure.

### Les sept vérités du plan — vérifiées une par une

| Vérité | Preuve mesurée |
|---|---|
| Les quatre attributs d'AGD-03 sont éditables par type | 8 champs rendus = 2 types × (libellé, durée, tampon, prix) |
| Une modification enregistrée est celle que l'apprenant voit | prix passé à **120,50 €** par l'écran réel : DB `12050`, `/agenda` et `/reservation` affichent `120,50 €` |
| `tampon_minutes` change la densité des créneaux | SQL : tampon 15 → 80 créneaux, 30 → 80, **90 → 40** |
| Aucune création, aucune suppression | UI : 0 affordance aux trois largeurs · route : `PATCH` seul exporté · grants : `authenticated` = SELECT+UPDATE · RLS : 2 policies seulement |
| Un apprenant appelant l'écriture est refusé et n'écrit rien | connexion apprenant 200, `PATCH` **307**, ligne inchangée (`9000` avant et après) |
| `/agenda` est revalidé à l'enregistrement, et reste prérendu | route statique à ISR 1 h : `90,00 €` → `120,50 €` **à la requête suivante**, sans attendre l'heure |
| `/reservation` n'est pas revalidé | dynamique depuis D-28, motif écrit dans le fichier |

**Validation** : durée `0` → **422 `dureeInvalide`**, rien écrit.
**Mobile**, 1440 / 375 / 320 : aucun défilement horizontal, zéro champ sous
16 px, zéro contrôle sous 44 px.
**Navigation** : 4 entrées — Horaires, Jours fériés, Types de rendez-vous,
Réservations.

**Valeurs restaurées** après la passe : découverte 30 min / 15 / 0 €,
individuelle 60 min / 15 / 90 €. Vérifié en base.

### Les deux écarts signalés par le run — tranchés

1. **Deux entrées de navigation au lieu d'une** : conforme à l'intention.
   `04-08` avait différé « Réservations » à ce plan, et les critères de
   `04-09` exigent 4 sections. Le rendu montre bien 4.
2. **Le critère « le nombre de créneaux décroît strictement de 15 à 30 min de
   tampon » est faux**, pas le code. Un bloc de 3 h donne
   `floor(180/75) = 2` et `floor(180/90) = 2`. Le mécanisme est correct et se
   prouve à tampon 90 (80 → 40). **Critère à corriger, implémentation
   conservée.**

### Ce que l'approbation ne couvre pas

- **Le corps de l'e-mail de confirmation** n'a pas été vérifié : il demande
  une réservation complète par le parcours apprenant, hors de portée d'une
  sonde. Le prix y transite par la même ligne `app.type_rendez_vous` que les
  deux surfaces vérifiées.
- **Le champ prix est pré-rempli à l'anglaise** — `(prix_centimes / 100).toFixed(2)`
  rend « 90.00 » là où l'interface affiche « 90,00 € ». La saisie accepte
  déjà la virgule (`centimesDepuisEuros` fait `replace(",", ".")`) : c'est un
  défaut d'affichage seul. **Le fondateur a choisi de ne pas le corriger
  maintenant** (2026-09-04). À reprendre hors du Lot 4.

## D-36 — la cellule de 21 px est acceptée

Décision du fondateur, 2026-09-04. La cellule de jour mesure 21,14 × 44 px
sur `/admin/reservations` à 320 px. Rien n'est tronqué, la hauteur tactile de
44 px est conservée, et une largeur de 44 px est arithmétiquement hors
d'atteinte dans un carton de 230 px. Détail et options écartées :
`ariba-cto/notes/2026-09-04-decision-la-cellule-de-21px-est-acceptee.md`.
Consignée dans `04-CONTEXT.md` à la suite de D-35.

## Clôture

`04-09` était le dernier plan et le dernier gate D-26 de la phase.
**Le Lot 4 est complet** : AGD-01 à AGD-09 livrés.

---

## Files Created/Modified

Committed prior to this gate, in `d6c67a3` (Task 1) and `d796e89` (Task 2):

- `src/lib/validation/types-rendez-vous.ts`
- `src/lib/agenda/admin-queries.ts`
- `src/locales/fr/admin.json`
- `src/app/api/admin/types-de-rendez-vous/route.ts`
- `src/components/admin/types-editeur.tsx`
- `src/app/admin/types-de-rendez-vous/page.tsx`
- `src/components/admin/admin-nav.tsx`

This summary (documentary close of the D-26 gate) touches only
`.planning/` files — no source, no migration.

## Next Phase Readiness

- All five D-26 founder gates of the phase (plans 04-03, 04-05, 04-06, 04-08,
  04-09) are signed off.
- AGD-01 through AGD-09 are delivered — see `.planning/REQUIREMENTS.md`.
- Phase 5 (SEO, pages juridiques, RGPD et mise en ligne — go-live) may begin.

---
*Phase: 04-agenda-et-prise-de-rendez-vous*
*Completed: 2026-09-04*
