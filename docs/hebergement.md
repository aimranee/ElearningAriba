# Hébergement — dépendances externes

Ce document liste tout ce que **la partie qui détient les comptes
d'hébergement** doit faire pour connecter ce dépôt à une infrastructure
hébergée. Rien de ce qui suit ne peut être fait depuis ce dépôt : ce sont des
actions sur les comptes Supabase et Vercel eux-mêmes.

Aucune étape de ce document ne nécessite un plan payant, ni chez Supabase ni
chez Vercel.

## Supabase — base de données, authentification, stockage

- [ ] Créer le projet Supabase hébergé **dans une région UE**.

  **La région est définitive une fois le projet créé — elle ne peut plus être
  changée ensuite.** Les données personnelles des apprenants hébergées hors UE
  compromettraient à la fois l'isolation des données au niveau base de données
  promise au Lot 3 et la conformité RGPD promise au Lot 5. Choisir la région
  avant de cliquer sur créer, pas après.

- [ ] Activer les trois capacités nécessaires sur le projet : base de données,
      authentification, stockage de fichiers.

- [ ] Récupérer l'URL du projet, la clé anonyme (`anon key`) et la clé de rôle
      de service (`service role key`) — voir le tableau des variables
      d'environnement ci-dessous pour où les placer.

- [ ] Les migrations versionnées dans `supabase/migrations/` de ce dépôt sont
      appliquées au projet hébergé **par la partie qui détient les
      identifiants du projet**, pas depuis cette phase. Aucune migration n'a
      été appliquée à un projet hébergé jusqu'ici.

## Vercel — connexion du dépôt et déploiement

- [ ] Importer ce dépôt dans Vercel.

- [ ] Confirmer que l'import lit correctement ce que `vercel.json` déclare
      déjà dans le dépôt : préréglage de framework `nextjs`, commande
      d'installation `npm ci`, commande de build `npm run build`.

- [ ] Renseigner les variables d'environnement pour les environnements
      preview et production (tableau ci-dessous).

- [ ] Confirmer qu'un push sur une branche produit un déploiement de
      prévisualisation accessible en HTTPS.

- [ ] Attacher le domaine de production du client.

Rapprocher la région du serveur Vercel de la région UE choisie pour Supabase
est préférable pour la latence — c'est un réglage côté hébergement, pas un
fichier de ce dépôt.

## Variables d'environnement

Les quatre noms ci-dessous sont ceux de `.env.example`, reproduits tels
quels. Ce tableau indique seulement quels environnements ont besoin d'une
valeur — jamais la valeur elle-même.

| Variable | Local | Preview | Production |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | ✓ | dérivée automatiquement | dérivée automatiquement |
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | ✓ | ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | ✓ | ✓ |

`NEXT_PUBLIC_SITE_URL` n'a pas besoin d'être renseignée sur Vercel : elle est
dérivée au moment du build à partir des variables système du projet
(production → l'URL de production du projet, preview → l'URL de la branche
ou du déploiement). Ne la renseigner explicitement ici que pour remplacer
cette valeur dérivée.

`SUPABASE_SERVICE_ROLE_KEY` est **secrète et strictement côté serveur**. Elle
ne doit jamais porter le préfixe `NEXT_PUBLIC_`, et ne doit jamais être collée
dans un fichier du dépôt, une pull request ou un workflow.

## Protection de branche

Voir `CONTRIBUTING.md` pour le détail du flux de livraison. En résumé pour
cette partie : le job `quality` du workflow `CI` doit être rendu obligatoire
sur `main` — c'est la moitié restante, externe, de SOCLE-05.

## Contrainte de coût

Aucune étape de ce document ne peut dépendre d'une fonctionnalité Supabase ou
Vercel nécessitant un plan payant.
