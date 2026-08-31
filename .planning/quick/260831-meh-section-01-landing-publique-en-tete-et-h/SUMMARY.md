---
quick_id: 260831-meh-section-01-landing-publique-en-tete-et-h
status: complete
---

# Summary — Section 01 landing publique : en-tête et héros

## Commits (locaux, branche `gsd/phase-02-site-public`, rien poussé)

- `9eb4f3b` — `#feat: replace header wordmark with monogram pastille and drop Accueil nav link`
- `784ed31` — `#feat: single-CTA hero with silent typewriter degradation and non-repeating assembly card`
- `985a9ad` — `#docs: retire maquette as visual authority in D-04 and UI spec section 0`
- `2415629` — `#fix: let header wordmark truncate so monogram addition can't push burger off 375px viewport`

## Changements

**En-tête** (`header.tsx`, `common.json`) — pastille monogramme `aria-hidden`
(dégradé `--violet`→`--indigo`, "A" blanc) devant le nom de marque. `Accueil`
retiré de `MOBILE_LINKS` et de la nav bureau — quatre liens restants
(Programme, Formation, À propos, Contact). `common.nav.accueil` supprimée.

**Héros** (`hero.tsx`, `common.json`, `landing.json`, `globals.css`) —
sourcil retiré. Garde-fou `hasValidSplit = leadSplit >= 0 && splitIndex >= 0`
ajouté : split valide → mise en page inchangée (violet + préfixe +
Typewriter + suffixe) ; split invalide → accroche statique complète, aucune
duplication, aucune exception levée. CTA principal → `common.actions.prendreRdv`
("Prendre RDV" → `/inscription`) ; `actions.demarrer` supprimée. `hero.chips`
réduit à deux entrées (répercussion automatique sur `cta-final.tsx`, fichier
non touché autrement). Deux badges flottants + `hero.badges` + keyframes
`bob`/`bob2` supprimés, import `Shield` inutilisé retiré. Carte d'assemblage :
`<h4>{moduleTitre}</h4>` et la checklist dupliquée retirés, remplacés par une
ligne "Préparation à la certification" ; `assemblage.statut` →
"Sessions ouvertes" ; `moduleTitre` supprimée. `landing.json hero.sousTitre`
raccourci selon le brief, contenu local re-seedé (`npm run content:seed`).

**Docs** (`02-CONTEXT.md`, `02-UI-SPEC.md`) — D-04 et §0/pied de page
réécrits : le maquette est retiré comme autorité visuelle, l'application
rendue est la référence, régime section par section. Sections tokens/timing
sous §0 non touchées.

## Déviation

Ligne d'en-tête `flex`/`justify-between`/nowrap déjà calibrée pour le burger
à 375px. La pastille ajoute ~42px non compressibles → risque de débordement.
Corrigé par `min-w-0` sur le `Link` du logo et `truncate` sur le span du nom
(commit `2415629`), pour que le nom cède la place sous contrainte plutôt que
la ligne déborde.

## Vérification — 13 points du brief

1. "Démarrer ma formation" absent — PASS
2. "Prendre RDV" présent ≥2 fois (en-tête + héros) — PASS
3. "En préparation" absent, "Sessions ouvertes" présent une fois — PASS
4. "Appel découverte" une fois dans le héros, "Support PDF" une fois dans le héros — PASS
5. "Procure-to-Pay" absent de la carte d'assemblage — PASS
6. Sourcil "Formation live · SAP Ariba" absent — PASS
7. "Accueil" absent de la nav — PASS
8. `--shadow-3`/`--shadow-4` sur exactement deux objets (console héros, carte CTA final) — PASS, plafond inchangé
9. `bob`/`bob2` absents du CSS produit — PASS
10. 375px, pas de débordement horizontal — **non mesuré en navigateur réel** (outil Playwright non autorisé dans cette session) ; raisonné à partir des règles flex (`min-width:auto`) et du correctif appliqué
11. Bord droit du burger ≤ largeur viewport à 375px — **non mesuré**, même raisonnement que le point 10
12. H1 se termine par le mot au repos, sans doublon — PASS, lu sur le HTML rendu ; branche split invalide vérifiée par lecture de code uniquement (aucune donnée Supabase actuelle ne la déclenche)
13. Monogramme et nom lisibles en-tête transparent et voilé — PASS par construction (fond dégradé opaque indépendant de `data-scrolled`)

**Build/qualité** : `npm run lint`, `npm run typecheck`, `npm run build` — 0
erreur, exécutés deux fois. 14 routes inchangées (13 statiques +
`/api/contact` dynamique).

**Réserve** : points 10-11 à confirmer par un spot-check navigateur humain —
aucun outil de navigateur automatisé n'était autorisé dans cette exécution.

## Hors périmètre (non touché, conforme au brief)

Ambiguïté nav Programme/Formation, hexadécimaux bruts restants dans
`hero.tsx`, refonte section Format, créneaux CTA final, photo du formateur.
