---
quick_id: 260902-gd2
status: complete
---

# Quick Task 260902-gd2: Refonte FAQ section 08 — Summary

Source: `ariba-cto/notes/2026-09-02-brief-section-08-faq-questions-reelles.md`. Décisions D-70 à D-74 consignées dans `.planning/phases/02-site-public/02-CONTEXT.md`.

## Fait

1. **`02-CONTEXT.md`** — D-70 (échelle programme-accordion), D-71 (7 questions reconstruites), D-72 (prix sans chiffre), D-73 (3 questions mocks CADR-03), D-74 (mesure Playwright `visibilityState: visible`) ajoutées après D-69, datées 2026-09-02.
2. **`src/locales/fr/landing.json`** — `faq.items` réécrit intégralement : 7 nouvelles questions dans l'ordre du brief (prix sans chiffre en position 1, prérequis, accès SAP perso [mock CADR-03], enregistrement, durée d'accès + fourni, attestation [mock CADR-03], financement CPF/OPCO [mock CADR-03]). Nouvelle clé `faq.cloture` (`question` + `lien` « Écrivez-nous »). Aucun chiffre, aucun tarif.
3. **`src/components/sections/faq.tsx`** — mécanique alignée littéralement sur `programme-accordion.tsx` (D-70) : `gap-[0.9rem]`, `defaultValue={entries[0] ? [entries[0].id] : []}`, `value={entry.id}` sur chaque item, `shadow-none`, trigger `px-[1.5rem] py-[1.35rem] hover:bg-transparent hover:text-[var(--deep)]`, question `text-[1.02rem] font-bold tracking-[-0.015em]`, panneau `text-[0.96rem] leading-[1.65] text-[var(--muted-ink)]`. Ligne de clôture ajoutée sous l'accordéon, lien vers `/contact`, aucune entrée registre (conforme au brief).
4. `npm run content:seed` lancé après l'édition de `landing.json`.

## Vérification par lecture (pas par supposition)

Requête directe sur `app.content_item` (conteneur `supabase_db_ElearningAriba`) :

```
 cle  |                     question                       | position
faq-1 | Combien coûte la formation ?                       | 1
faq-2 | Faut-il déjà connaître SAP Ariba pour commencer ?   | 2
faq-3 | Ai-je besoin de mon propre accès SAP Ariba ?        | 3
faq-4 | Les sessions sont-elles enregistrées ?              | 4
faq-5 | Combien de temps ai-je accès aux supports ?         | 5
faq-6 | Vais-je recevoir une attestation ?                  | 6
faq-7 | La formation est-elle finançable (CPF, OPCO) ?      | 7
```

Sept lignes, positions 1 à 7, questions conformes au brief.

## Sorties réelles des trois gates

- **`npm run content:check`** — **exit 1** (préexistant, pas introduit par ce run) :
  71 clés bloquées par `CADR-03`, 11 par `CADR-01`. `landing.json#faq.items` figure
  toujours dans la liste `CADR-03` (attendu — D-73 : la porte bloque le tableau
  entier sans qu'aucune entrée de registre soit ajoutée dans ce run, conforme au
  hors-périmètre). Aucune régression : le nombre de clés bloquées reflète l'état
  déjà connu du repo (`_mocks.public.json` couvre `landing.json`, `programme.json`,
  `a-propos.json` ; le trou sur `paiement.json`/`agenda.json`/`formation.json`
  reste hors périmètre de ce run, comme documenté dans le brief).
- **`npm run lint`** — **exit 0**, aucun avertissement.
- **`npm run typecheck`** — **exit 0** (`next typegen` + `tsc --noEmit` verts).

## Ce qui reste non mesuré, et pourquoi

Aucun outil navigateur dans ce run (allowlist `Skill Task Bash Read Write Edit Glob
Grep WebSearch WebFetch mcp__context7__*`). N'a été ni mesuré ni inventé :

- Hauteur de la section avant/après (estimée ~1000 px dans le brief, à mesurer).
- Hauteur de ligne fermée, `font-size` du déclencheur au rendu.
- Comportement d'ouverture au chargement et au clic (panel height, opacité).
- Contraste `--muted-ink` sur `--tint` et sur blanc (ligne ouverte), et du lien
  de clôture sur `band`.
- Absence de débordement horizontal à 375 px.

Ces mesures sont explicitement à la charge du CTO en session, via Playwright avec
`document.visibilityState: visible` (D-74) — pas mesurables par cet agent.

## Hors périmètre — non touché

`agenda.json`, `paiement.json`, `reservation.json`, `_mocks.public.json`,
`footer.tsx`, `src/components/ui/accordion.tsx`, `scripts/seed-content.mjs`,
ordre des sections. Aucun montant écrit dans la FAQ.

## Commits

Deux commits atomiques locaux, rien poussé vers le distant.
