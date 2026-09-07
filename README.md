# Formation SAP Ariba — plateforme de réservation live

Plateforme de réservation et de suivi de formations SAP Ariba en direct.
L'apprenant crée un compte, réserve et paie un créneau dans l'agenda du
formateur, puis suit sa progression jusqu'à l'attestation.

## Prérequis

- **Node 22**, tel que pinné dans `.nvmrc`
- **npm**
- **Docker Desktop**, installé **et démarré**

Démarrer le démon Docker Desktop est une étape manuelle qu'aucune commande
n'effectue : `npx supabase start` échoue tant qu'il n'est pas lancé.

## Démarrage

1. Cloner ce dépôt.
2. Installer les dépendances :

   ```bash
   npm ci
   ```

3. Copier le fichier d'exemple d'environnement :

   ```bash
   cp .env.example .env.local
   ```

4. Démarrer la stack Supabase locale (Docker Desktop doit déjà être lancé) :

   ```bash
   npx supabase start
   ```

5. Lire l'URL de l'API et les clés générées par la commande suivante :

   ```bash
   npx supabase status
   ```

   Reporter chaque valeur dans `.env.local` sous le nom de variable
   correspondant :

   - `API URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

   `npx supabase status` ne fournit pas d'URL du site : `NEXT_PUBLIC_SITE_URL`
   peut rester vide en local, elle vaut alors `http://localhost:3000` par
   défaut (voir aussi `.env.example`).

6. Générer les types de la base de données :

   ```bash
   npm run db:types
   ```

7. Démarrer l'application :

   ```bash
   npm run dev
   ```

La CLI Supabase est invoquée via `npx` et n'est jamais installée
globalement.

## Scripts npm

- `dev` — démarre le serveur de développement Next.js
- `build` — construit l'application pour la production
- `start` — démarre l'application construite
- `lint` — exécute ESLint
- `typecheck` — exécute la vérification de types TypeScript sans émission
- `db:types` — régénère `src/types/database.types.ts` depuis la stack
  Supabase locale

## Migrations de base de données

- Créer une nouvelle migration : `npx supabase migration new <nom>`
- L'appliquer localement : `npx supabase db reset`
- Régénérer les types après toute nouvelle migration : `npm run db:types`

Appliquer une migration à un projet hébergé est fait par la partie qui
détient les identifiants de ce projet, selon `docs/hebergement.md` — pas
depuis une machine de développement.

## Variables d'environnement

`.env.example` est la liste faisant autorité. `.env.local` n'est jamais
commité. Une variable manquante arrête l'application au démarrage en nommant
la variable — une erreur qui mentionne un nom de variable signifie que cette
variable est absente de `.env.local`, pas que l'application est cassée.

Exception : `NEXT_PUBLIC_SITE_URL` n'a pas besoin d'être renseignée. Une
valeur explicite l'emporte toujours ; à défaut, elle est dérivée par
environnement (Vercel en preview et production, `http://localhost:3000` en
local) — voir `src/lib/env/site-url.ts`.

## Pour aller plus loin

- Flux de contribution (branche, pull request, CI) : voir `CONTRIBUTING.md`
- Configuration de l'hébergement (Supabase et Vercel hébergés) : voir
  `docs/hebergement.md`

<!-- deploy trigger verified 2026-09-07 -->
