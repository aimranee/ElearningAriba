# Phase 3 — Recette (Lot 3 : Comptes, connexion et espace apprenant)

**Date de cette passe :** 2026-09-01
**Base :** `npx supabase db reset --local` exécuté une fois, en début de cette
passe. Toute la preuve ci-dessous vient de cette même réinitialisation, en une
seule passe — aucune ligne n'est recopiée d'un résumé de plan antérieur.
**Branche :** `gsd/phase-03-comptes-connexion-et-espace-apprenant` (vérifiée en
début et en fin de passe).

**Vocabulaire de verdict — trois valeurs, aucune autre :** `proven locally`,
`proven on hosted`, `blocked`.

---

## Section 1 — Verdict par exigence

| Exigence | Texte | Verdict | Preuve (commande / observation de cette passe) | Limite |
|---|---|---|---|---|
| **CPT-01** | Le visiteur peut créer un compte avec email et mot de passe, et doit vérifier son adresse email | proven locally | `POST /api/auth/inscription` (compte `nadia.recette@example.test`, puis `sofia`, `lea`, `maya`, `yasmine.verif@example.test`) → `200 {"ok":true}` ; `psql`: `app.profil` contient la ligne (`prenom=Nadia`, `role=learner`) ; `POST /api/auth/connexion` avant confirmation → `401 identifiantsInvalides` ; email trouvé dans Mailpit, objet *« Votre compte est confirmé. Vous pouvez réserver votre premier créneau. »* (identique à `emails.json.confirmationInscription.objet`) ; lien de confirmation suivi via le flux PKCE réel (`/auth/v1/verify` → code → `GET /api/auth/callback`) → `307` vers `/espace`, cookie de session posé, page `/espace` retourne `200` avec *« Bonjour Yasmine, heureux de vous revoir. »* | Non prouvable en hébergé à cette clôture : le SMTP personnalisé dépend d'un domaine qui n'existe pas encore (item CIO). Aucun email réel n'est jamais parti — tout est resté dans le collecteur local (D-23). |
| **CPT-02** | Le visiteur peut se connecter avec un compte Google en un clic | blocked | `GET /api/auth/google` → `307` vers `/auth/v1/authorize` local ; suivi manuellement → `302` vers `accounts.google.com` avec `client_id=env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)` **littéralement présent dans l'URL** — la variable n'est substituée par aucune valeur réelle. Le chemin de code est écrit et se referme proprement sur `connexion.erreurs.rejetServeur` en cas d'échec (vérifié dans le code de `/api/auth/callback` et `/api/auth/google`), mais la connexion complète — obtenir une session réelle via un compte Google — n'a jamais été observée, ni localement ni en hébergé. | Le client OAuth Google n'existe pas encore. Demande transmise au CIO (voir Section 3). Tant qu'il n'existe pas, `CPT-02` ne peut être déclaré prouvé nulle part, pas même localement. |
| **CPT-03** | L'apprenant peut réinitialiser un mot de passe oublié, et les tentatives de connexion répétées sont freinées | proven locally | Réinitialisation complète rejouée cette passe : `POST /api/auth/mot-de-passe/demande` sur une adresse enregistrée et une adresse inconnue → deux réponses `200 {"ok":true}` **strictement identiques** (`diff` ne montre aucune différence) ; email trouvé uniquement pour l'adresse enregistrée, objet *« Réinitialisez votre mot de passe. »* ; lien suivi via le même flux PKCE réel → `/nouveau-mot-de-passe` avec session de récupération ; `POST /api/auth/mot-de-passe/nouveau` → `200` ; ancien mot de passe → `401 identifiantsInvalides` ; nouveau mot de passe → `200`. Freinage : six requêtes consécutives depuis la même IP simulée sur `/demande` → la sixième renvoie `429`. | Non prouvable en hébergé à cette clôture : même dépendance SMTP/domaine que `CPT-01` (item CIO). Le freinage natif (config Supabase) est indépendant de l'email et existe déjà dans `config.toml`, mais le parcours complet par email ne peut être rejoué qu'une fois le SMTP en place. |
| **CPT-04** | Un compte est requis pour toute réservation, y compris l'appel découverte gratuit — une identité unique, avec tout l'historique de l'apprenant rattaché à son enregistrement | proven locally | Invariant de modèle de données, sans écran (D-A11 du UI-SPEC) : `app.profil` a pour clé primaire `auth.users(id)` (`\d app.profil` : `PRIMARY KEY (utilisateur_id)`, `utilisateur_id uuid references auth.users(id)`), la ligne est créée par le déclencheur `app.creer_profil_pour_nouvel_utilisateur()` sur les deux parcours d'inscription possibles (le parcours email a été rejoué en direct cette passe ; le parcours Google reste écrit dans le code du même déclencheur mais est bloqué par `CPT-02`) ; la preuve d'isolation négative (Section ci-dessous) confirme le cloisonnement par `auth.uid()`. `find src/app -type d -name 'admin*'` et une recherche de mots liés à la réservation dans `src/app/espace/`, `src/components/espace/`, `src/components/compte/` ne renvoient rien. | Le déclencheur lui-même n'est prouvé que localement, la migration qui le crée n'étant pas encore poussée en hébergé (voir `CPT-08`). |
| **CPT-05** | L'apprenant peut remplir son profil — identité, coordonnées, profil professionnel, préférences de communication | proven locally | `POST /api/profil` avec `nom`, `telephone`, `profil_professionnel`, préférences, **plus un `role` et un `email` forgés** → `200` ; lecture `psql` immédiate : `nom`/`telephone`/`profil_professionnel` mis à jour, **`role` reste `learner`**, **`email` reste `yasmine.verif@example.test`** — les deux champs forgés sont retombés sans effet. | Non prouvable en hébergé : les deux migrations Lot 3 (`20260831160000_lot3_comptes.sql`, `20260831161000_lot3_grants.sql`) n'ont pas été poussées sur les deux projets Supabase hébergés — ce poste n'a pas de `SUPABASE_ACCESS_TOKEN` (item CIO). |
| **CPT-06** | L'apprenant voit son espace — prochains rendez-vous et sessions, historique, documents, factures, avancement — avec des états vides honnêtes pour les surfaces que rempliront des lots ultérieurs | proven locally | `GET /espace` avec session → `200`, salutation réelle *« Bonjour Yasmine, heureux de vous revoir. »*, les six cartes présentes : cinq affichent l'état vide existant mot pour mot (*« Aucun rendez-vous à venir. »*, *« Aucune session en cours. »*, *« Aucun historique pour le moment. »*, *« Aucune facture pour le moment. »*, *« Votre progression n'a pas encore commencé. »*), la sixième (*Mes documents*) affiche du contenu réel pour un apprenant ayant des accès accordés et l'état vide pour un apprenant qui n'en a pas (`karim.verif@example.test`, testé sans octroi → `Aucun document disponible.`). Aucune donnée factice, aucune carte promue ou teintée (`grep variant=` : les six cartes résolvent à `variant="default"`). | Non prouvable en hébergé : mêmes migrations non poussées que `CPT-05` (item CIO). |
| **CPT-07** | Les apprenants inscrits peuvent télécharger les supports via des liens signés, limités dans le temps, non partageables | proven locally | Graine locale rejouée (`supabase/seed/lot3_acces_support_local.sql`) pour `yasmine.verif@example.test`, deux objets PDF réels déposés dans le bucket privé `supports`. **Positif :** téléchargement → `302` vers une URL signée, octets réels (`%PDF-1.4`) reçus. **Négatif horizontal :** `karim.verif@example.test` demandant l'id du document de Yasmine → `404`, corps `{"erreur":"Ce document n'a pas pu être ouvert..."}`, aucune fuite de chemin ni de bucket. **Négatif non authentifié :** même requête sans cookie → `404`. **Non partageable :** deux requêtes à deux secondes d'écart émettent deux jetons signés différents. **Expiration :** la même URL signée, redemandée après 65 secondes (TTL 60s), renvoie `400` du service de stockage — ne sert plus le fichier. | Le bucket privé n'existe pas encore en hébergé. Demande transmise au CIO (voir Section 3). Les mêmes migrations non poussées bloquent aussi `app.acces_support` en hébergé. |
| **CPT-08** | Les rôles sont apprenant et administrateur, et l'isolement au niveau base de données rend techniquement impossible pour un apprenant de lire les données d'un autre apprenant | proven locally | `psql -v ON_ERROR_STOP=1 -f supabase/tests/lot3_rls_isolation.sql` contre la base fraîchement réinitialisée → code de sortie `0`, quatre notices `RLS-ISOLATION: … DENIED` (lecture croisée sur `profil`, écriture croisée sur `profil`, escalade de rôle, lecture croisée sur `acces_support`/`demande_suppression`). Reconfirmé en direct par la tentative d'écriture de `role: "administrator"` via `POST /api/profil` (voir `CPT-05`) : sans effet. | Non prouvable en hébergé : les migrations qui créent les politiques RLS ne sont pas poussées (item CIO). |
| **CPT-09** | L'apprenant peut demander la suppression de son compte et l'export de ses données (RGPD) | proven locally | **Export :** `GET /api/rgpd/export` pour deux apprenants distincts → `200` chacun, `Content-Disposition: attachment`. Les deux fichiers diffèrent : celui de `karim.verif@example.test` contient `"documents": []`, celui de `yasmine.verif@example.test` contient ses deux documents réels — aucun champ de l'un n'apparaît dans l'autre. **Suppression :** `RESEND_API_KEY` confirmé absent de `.env.local` (`grep -c` = `0`) ; `POST /api/rgpd/suppression` comme `karim.verif@example.test` → `200`, ligne `psql` confirmée (`statut = enregistree`) malgré l'échec d'envoi de la notification ; requête répétée → `409 {"erreur":"dejaDemandee","date":"1 septembre 2026"}`. | Non prouvable en hébergé : la notification au formateur dépend du même SMTP absent (item CIO), et les migrations créant `app.demande_suppression` ne sont pas poussées. La suppression elle-même reste exécutée en SQL jusqu'à `ADM-02` (Lot 10) — aucune surface Lot 3 ne l'exécute (`find src/app -type d -name 'admin*'` : vide). |

`grep -cE '\| (proven locally|proven on hosted|blocked) \|' 03-RECETTE.md` → `9`. Aucune ligne ne porte `proven on hosted`.

---

## Section 2 — Ce qui n'est pas prouvé, en clair

- Les emails de `CPT-01` et `CPT-03` n'ont **jamais été vus que dans un
  collecteur local**. Le SMTP personnalisé et un domaine d'envoi authentifié
  n'existent pas encore — sans eux, aucun email de ce produit n'atteint une
  vraie boîte mail.
- Le parcours Google de `CPT-02` **n'a jamais tourné avec de vrais
  identifiants**. Ce qui a été observé cette passe, c'est le début du parcours
  redirigeant vers Google avec un identifiant de client vide — la connexion
  elle-même n'a jamais abouti, ni ici ni ailleurs.
- Le bucket de `CPT-07` **n'existe que localement**. Aucun support de
  formation ne peut être téléchargé sur un projet hébergé tant que ce bucket
  n'est pas créé là-bas.
- **Aucune migration du Lot 3 n'a été appliquée à un projet hébergé**, donc
  rien de ce qui dépend de `CPT-05`, `CPT-07`, `CPT-08` ou `CPT-09` n'existe
  aujourd'hui sur un projet hébergé — pas la table, pas la politique, pas la
  colonne.
- La phrase qui compte le plus : **`tsc` et `next build` passent avec ou sans
  aucune migration appliquée**, parce que les types viennent du fichier
  `src/types/database.types.ts` et non d'une base de données réellement
  interrogée à la compilation — donc une compilation verte ne prouve
  strictement rien sur l'état de la base.
- Deux comportements que ce siège ne peut pas observer par une commande, faute
  d'outil de navigateur automatisé dans ce projet : l'état *pending* d'un
  bouton (`data-loading="true"`) déclenché par un clic réel, et la transition
  de la case à cocher de suppression de compte, désactivée puis activée par un
  clic réel. Le code source garantit ces deux comportements (grep confirmé),
  mais aucun clic n'a été simulé cette passe. C'est exactement pour ces deux
  points que la Tâche 2 (revue humaine) existe.

---

## Section 3 — Ce que doit le CIO

- [ ] **Pousser les deux migrations du Lot 3** (`20260831160000_lot3_comptes.sql`,
  `20260831161000_lot3_grants.sql`) sur les deux projets Supabase hébergés —
  débloque `CPT-05`, `CPT-07`, `CPT-08`, `CPT-09` en hébergé. Ce poste n'a
  aucun `SUPABASE_ACCESS_TOKEN` (`env | grep -c SUPABASE_ACCESS_TOKEN` = `0`) ;
  la publication n'appartient qu'au CIO.
- [ ] **Créer le client OAuth Google** et sa configuration côté fournisseur sur
  les deux projets hébergés — débloque `CPT-02`, seul moyen de faire aboutir la
  connexion Google, y compris pour une vérification locale avec de vraies
  informations d'identification.
- [ ] **Configurer un SMTP personnalisé avec un domaine d'envoi authentifié**
  sur les deux projets hébergés — débloque `CPT-01` et `CPT-03` en hébergé (les
  emails de confirmation et de réinitialisation), et la notification de
  suppression de `CPT-09`.
- [ ] **Créer le bucket de stockage privé `supports`** sur les deux projets
  hébergés — débloque `CPT-07` en hébergé.

Deux dettes ouvertes qui touchent le Lot 3 sans en faire partie :

- [ ] Le renommage `master` → `main` (porte de CI désarmée, production Vercel
  gelée).
- [ ] La remise en route des projets Supabase Free-plan actuellement en pause.

**Rien n'a été poussé pendant cette passe.** Aucun `git push`, aucun
`supabase db push`, aucun déploiement. `git log origin/HEAD..HEAD --oneline`
compte `227` commits locaux absents de `origin/main` ; `git reflog` ne
contient aucune entrée de push (`grep -ci 'push'` → `0`) ; la branche de
travail est restée `gsd/phase-03-comptes-connexion-et-espace-apprenant` du
début à la fin de cette passe.

`supabase/seed/lot3_acces_support_local.sql` et
`supabase/tests/lot3_rls_isolation.sql` vivent hors de `supabase/migrations/`
et ne doivent **jamais** être exécutés contre un projet hébergé — ce sont des
outils de preuve locale uniquement.

---

## Section 4 — Éléments ouverts pour le fondateur

### Les onze critères d'acceptation du UI-SPEC

| # | Critère | Verdict | Preuve / observation de cette passe |
|---|---|---|---|
| 1 | `git diff` de toute la phase ne touche aucune ligne de `globals.css`, des huit composants `ui/`, ni de `layout/*` | pass | `git diff --stat main -- ...` montre `1277` insertions — **mais `main` est resté au placeholder de la Phase 0 (`27ab022`) et ne contient ni le Lot 1 ni le Lot 2** (confirmé : `git log --oneline -1 main` = `27ab022`). La base réelle de cette phase est le point de fourche `c124a827` (`gsd/phase-02-site-public`), documenté dans `03-CONTEXT.md`. `git diff --stat c124a827 -- src/app/globals.css src/components/ui/{accordion,badge,button,card,empty-state,field,input,message}.tsx src/components/layout/` renvoie une sortie **vide** — zéro ligne changée sur toute la phase contre la bonne base. |
| 2 | `next build` montre les 14 routes préexistantes toujours statiques ; les deux nouvelles routes de réinitialisation sont statiques aussi ; seul `/espace*` est dynamique | pass | Table de routes de cette passe : 14 `○` (`/`, `/_not-found`, `/a-propos`, `/agenda`, `/connexion`, `/contact`, `/formation`, `/inscription`, `/mot-de-passe-oublie`, `/nouveau-mot-de-passe`, `/paiement`, `/programme`, `/programme.pdf`, `/reservation`) ; `ƒ` sur `/espace`, `/espace/profil`, `/espace/donnees` et tous les `api/*`. |
| 3 | Une recherche de chaîne française littérale dans `src/app/**` ou `src/components/**` ne renvoie rien de nouveau | pass | `grep -rnE '>[A-ZÀ-Ý][a-zà-ÿ]+ [a-zà-ÿ]+'` sur `src/app/{inscription,connexion,mot-de-passe-oublie,nouveau-mot-de-passe,espace}` et `src/components/{compte,espace}` (hors `locales/fr`) → aucune correspondance. |
| 4 | `/espace` affiche le vrai prénom de l'apprenant ; `PRENOM_MAQUETTE` n'existe plus ; les six états vides sont identiques octet pour octet à `espace.json` | pass | `grep -rn 'PRENOM_MAQUETTE' src/` → vide. `/espace` avec session réelle → *« Bonjour Yasmine, heureux de vous revoir. »*. Les cinq libellés d'état vide observés cette passe correspondent mot pour mot à ceux cités ci-dessus (Section 1, `CPT-06`). |
| 5 | Aucune route `/admin` ; aucun point d'entrée de réservation créé | pass | `find src/app -type d -name 'admin*'` → vide. Recherche de mots liés à la réservation dans les surfaces Lot 3 → vide (hors la chaîne existante `aucuneReservation`/« Voir les créneaux disponibles »). |
| 6 | `/espace`, `/espace/profil`, `/espace/donnees` sans session → redirection vers `/connexion`, jamais une page à moitié rendue | pass | Les trois routes testées sans cookie cette passe → `307` vers `/connexion` ; corps de `/espace` : 10 octets (vide). |
| 7 | Sur `/espace`, l'état vide *aucune réservation* reste hors de toute `Card`, en tête, avec le seul bouton d'accent de la page ; les six cartes de la grille résolvent à `variant="default"`, sans accent. Sur `/espace/donnees`, la carte de suppression est `variant="muted"`, son panneau de confirmation révélé est `variant="default"`, et aucune classe `destructive` n'apparaît avant que ce panneau soit révélé | pass | `src/app/espace/page.tsx` : l'`EmptyState` (ligne 37) est rendu avant la grille et hors de tout `<Card>` ; les six cartes de la grille utilisent `<Card key={key}>` sans prop `variant`, qui résout au défaut `"default"` (confirmé dans `card.tsx`). `src/app/espace/donnees/page.tsx` : carte export `variant="default"` (ligne 32), carte suppression `variant="muted"` (ligne 51) ; `src/components/compte/suppression-compte.tsx` : panneau révélé `variant="default"` (ligne 103), le seul `variant="destructive"` du fichier est sur le bouton de confirmation finale (ligne 129), rendu uniquement après révélation du panneau. |
| 8 | Le bouton de confirmation de suppression de compte est inatteignable tant que la case d'accusé n'est pas cochée | pass (garantie source) | `grep -n 'disabled={'` sur `suppression-compte.tsx` → `disabled={!confirme || enEnvoi}`, lié à `onCheckedChange` de `Checkbox`. **La transition par clic réel (décochée → cochée → bouton actif) n'a pas été simulée cette passe**, faute d'outil de navigateur automatisé dans ce projet — c'est un des deux points que la Tâche 2 doit vérifier à l'œil. |
| 9 | Exactement une valeur `cubic-bezier` dans le code — aucune seconde courbe, aucune transition `ease`/`linear` nue ajoutée par le Lot 3 | pass | `grep -rn 'cubic-bezier' src/` → une seule occurrence, `--ease-brand` dans `globals.css:60`. |
| 10 | Chaque formulaire rend les cinq états (idle, pending, erreur de champ, rejet serveur, succès) ; l'état de rejet serveur utilise `Field data-rejected="server"`, jamais une bordure rouge générique | pass pour idle/erreur de champ/rejet serveur/succès ; **non observé pour pending** | Idle, erreur de champ (`422` observés sur `/api/auth/inscription`, `/api/profil`), rejet serveur (`401`/`429`/`409` observés et mappés sur les clés existantes), succès (`200` observés sur chaque route) — tous rejoués en direct cette passe. `rejected="server"` confirmé présent dans le code des îlots clients. **L'état pending (`data-loading="true"` sur un clic réel) n'a pas été observé cette passe** — comportement client déclenché par interaction, non accessible par `curl`. |
| 11 | `npm run lint`, `npm run typecheck`, `next build` sortent en `0` ; `npm run content:check` sort toujours en `1` sur la clé unique non résolue | pass | Les quatre commandes rejouées cette passe : `typecheck` → `0`, `lint` → `0`, `build` → `0`, `content:check` → `1` avec `CADR-03: 72`, `CADR-01: 10` — identique au total de référence. |

### Les douze décisions D-A du UI-SPEC (exposées pour la ratification du fondateur — non tranchées ici)

| # | Décision | Statut |
|---|---|---|
| D-A1 | Bande de navigation locale (`espace-nav.tsx`) pour `/espace`, `/espace/profil`, `/espace/donnees` et *Se déconnecter*, faute de conscience de session dans `header.tsx` (écriture interdite) | en attente de ratification |
| D-A2 | Noms de route : `/mot-de-passe-oublie`, `/nouveau-mot-de-passe`, `/espace/profil`, `/espace/donnees` | en attente de ratification |
| D-A3 | Corps de formulaire en îlots client, coquilles de page en composants serveur statiques | en attente de ratification |
| D-A4 | Aucune modale : suppression de compte en confirmation intégrée à la page, en deux temps | en attente de ratification |
| D-A5 | Boutons primaires et destructeurs à `className="h-11"` au site d'appel | en attente de ratification |
| D-A6 | Trois nouveaux fichiers de langue plutôt que l'extension de `connexion.json`/`espace.json` | en attente de ratification |
| D-A7 | Champs de profil `CPT-05` : prénom, nom, email (lecture seule), téléphone, profil professionnel, deux préférences — aucun champ société | en attente de ratification |
| D-A8 | L'artefact d'export est nommé « fichier » ; l'accusé de suppression ne promet aucun délai | en attente de ratification |
| D-A9 | *Mes documents* est la seule des six cartes `/espace` pouvant afficher du contenu au Lot 3 | en attente de ratification |
| D-A10 | Le message de succès de réinitialisation est identique, adresse existante ou non | en attente de ratification |
| D-A11 | `CPT-04` ne reçoit aucune surface au Lot 3 | en attente de ratification |
| D-A12 | Hiérarchie du point focal déclarée pour `/espace` et `/espace/donnees` | en attente de ratification |

### Autres éléments pour ratification

- **Déviation `SubmitButton`** (plan 03-03) : la spécification prévoyait `useFormStatus` ; le composant livré utilise une prop `pending` explicite, parce qu'aucune action serveur n'existe dans ce dépôt (chaque mutation passe par un gestionnaire de route via `fetch`) et `useFormStatus` aurait silencieusement rapporté `pending: false` en permanence contre ce motif. Comportement visible identique. **En attente de ratification.**
- **Issue D-14** (plan 03-06) : l'écart de schéma `http`/`https` dans `additional_redirect_urls` a été fermé par observation directe plutôt que par modification. Le poste local GoTrue accepte un `redirect_to` inter-origines forgé aussi facilement que le véritable — `config.toml:171` reste inchangé (`git diff supabase/config.toml` vide). Le comportement du rebond interne de fin de parcours Google reste inobservable sans identifiants Google réels. **En attente de ratification.**
- **Nouvelle copie française en attente de validation (D-11) :** `src/locales/fr/mot-de-passe.json`, `src/locales/fr/profil.json`, `src/locales/fr/donnees.json` (nouveaux fichiers), plus les clés additives de `src/locales/fr/espace.json` (`nav.*`, `deconnexion`, `documents.expiration`, `documents.erreur`) et de `src/locales/fr/emails.json` (`suppressionCompteNotification`), ainsi que les deux gabarits d'email Supabase Auth francisés (`supabase/templates/confirmation.html`, `supabase/templates/recovery.html`). **Aucune de ces chaînes n'a été jugée par un humain à cette clôture.**

---

## Statut des portes humaines (Tâches 2 et 3)

**Tâche 2 — Revue fondateur des six surfaces Lot 3 :** `not reviewed`.
**Tâche 3 — Ratification fondateur de la copie française et des décisions
autonomes :** `not reviewed`.

Ce siège est headless et ne peut ni ouvrir un navigateur ni observer un clic
réel. Aucune inférence n'a été faite à partir de la preuve automatisée
ci-dessus pour statuer sur ces deux portes — la preuve automatisée établit ce
qu'une commande peut établir ; les critères 3, 8 et 9 du UI-SPEC (visuels et
interactifs) et la ratification de la copie exigent un œil humain,
explicitement.

Toute exigence, tout critère d'acceptation du UI-SPEC, et toute décision `D-A`
qui dépend de ces deux tâches reste à l'état d'attente tant qu'elles ne sont
pas explicitement tranchées par le fondateur — jamais déduites d'un vert
automatisé.

---
*Phase : 03-comptes-connexion-et-espace-apprenant*
*Passe de recette : 2026-09-01*
