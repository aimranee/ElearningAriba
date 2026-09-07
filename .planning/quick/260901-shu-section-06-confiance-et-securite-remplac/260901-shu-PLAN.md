---
phase: 02-site-public
plan: quick-260901-shu
type: execute
wave: 1
depends_on: []
files_modified:
  - src/locales/fr/landing.json
  - src/locales/fr/_mocks.public.json
  - scripts/seed-content.mjs
  - src/lib/content/queries.ts
  - src/components/motion/confiance-faits.tsx
  - src/components/sections/confiance.tsx
  - .planning/phases/02-site-public/02-CONTEXT.md
autonomous: true
requirements: [PUB-06]
must_haves:
  truths:
    - "Les trois affirmations invérifiables (protection des données, experts certifiés au pluriel, contenus mis à jour) ont disparu de la landing et sont remplacées par trois faits contrôlables : appel découverte gratuit 30 min, formateur nommé, groupe plafonné à 8"
    - "Aucun encart en pointillés (témoignages, entreprises, photo) ne subsiste dans la section confiance"
    - "Une carte formateur composée en code (pastille monogramme JD à plat, nom, intitulé, trois lignes, lien vers /a-propos) remplace l'encart photo"
    - "Cliquer sur une carte de fait échange sa moitié basse entre description et preuve, sans décalage de hauteur, au clic comme au clavier"
    - "Le seed retire nominativement les anciennes lignes confiance (temoignages, logos, protection-des-donnees, experts-sap-ariba-certifies, contenus-regulierement-mis-a-jour) et n'insère que les trois nouvelles"
  artifacts:
    - path: "src/components/motion/confiance-faits.tsx"
      provides: "Client component : mécanisme fait -> preuve, un vrai <button> par carte, hauteur fixe, lien de preuve hors du bouton"
    - path: "src/components/sections/confiance.tsx"
      provides: "Composant serveur : carte formateur en code, wiring vers ConfianceFaits, aucun `use client`"
    - path: "src/lib/content/queries.ts"
      provides: "getConfianceFaits() + schema zod pour donnees.preuve, frontière de validation avant tout rendu"
  key_links:
    - from: "src/components/sections/confiance.tsx"
      to: "src/components/motion/confiance-faits.tsx"
      via: "props items (titre/description/preuve/icon) + labels"
      pattern: "ConfianceFaits"
    - from: "src/lib/content/queries.ts"
      to: "src/components/sections/confiance.tsx"
      via: "getConfianceFaits()"
      pattern: "getConfianceFaits"
    - from: "scripts/seed-content.mjs"
      to: "app.content_item (section_cle='confiance')"
      via: "upsertItems sur (section_cle, cle) + RETIRED_ITEMS"
      pattern: "appel-decouverte|formateur-identifie|groupe-limite"
---

<objective>
Réécrire la section 06 « Confiance et sécurité » : trois affirmations invérifiables
deviennent trois faits contrôlables (appel découverte gratuit, formateur nommé,
groupe plafonné à 8), les emplacements Témoignages/Entreprises disparaissent du
rendu et des données semées, l'encart photo en pointillés devient une carte
formateur composée en code, et chaque fait gagne un mécanisme « fait → preuve »
au clic sans décalage de mise en page (D-64).

⚠ Deux valeurs sont fictives sur décision du fondateur (2026-09-01) : le nom du
formateur « Jean Dupont » (initiales JD) et le plafond « 8 participants ».
Enregistrées au registre des mocks, jamais destinées à la mise en ligne.

Purpose: la mesure a montré trois adjectifs invérifiables, une contradiction
avec /a-propos (« experts » pluriel vs un seul formateur réel), 8 occurrences de
« certifié » sur la page, et environ 400px de bande en pointillés dominant la
section visuellement sans rien prouver.

Output: `landing.json` confiance réécrit (lead, items avec preuve, formateur),
`_mocks.public.json` mis à jour, `seed-content.mjs` réécrit et exécuté,
`getConfianceFaits()` dans `queries.ts`, nouveau client component
`confiance-faits.tsx`, `confiance.tsx` réécrit, D-61 à D-64 dans `02-CONTEXT.md`.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/phases/02-site-public/02-CONTEXT.md
@./CLAUDE.md

Sources actuelles à lire avant exécution :
@src/components/sections/confiance.tsx
@src/components/motion/format-deroule.tsx
@src/locales/fr/landing.json
@src/locales/fr/a-propos.json
@src/locales/fr/_mocks.public.json
@scripts/seed-content.mjs
@src/lib/content/queries.ts
@src/components/ui/card.tsx
</context>

<interfaces>
Extrait de src/lib/content/queries.ts — pattern QueryResult et getSectionItems à
réutiliser tel quel dans la nouvelle fonction :

    export type QueryResult<T> = { ok: true; data: T } | { ok: false };
    export async function getSectionItems(sectionCle: string): Promise<QueryResult<ContentItem[]>>;

Extrait de src/lib/content/queries.ts (moduleDonneesSchema / getModules) —
modèle exact de validation zod à la frontière + boucle de parse qui retourne
`{ ok: false }` sur le premier échec, à reproduire pour `donnees.preuve` :

    const moduleDonneesSchema = z.object({
      objectifs: z.array(z.string()).default([]),
      contenu: z.array(z.string()).default([]),
    });

    export async function getModules(): Promise<QueryResult<ModuleContent[]>> {
      const result = await getSectionItems("programme");
      if (!result.ok) return result;
      const modules: ModuleContent[] = [];
      for (const item of result.data) {
        const parsedDonnees = moduleDonneesSchema.safeParse(item.donnees);
        if (!parsedDonnees.success || item.titre === null) return { ok: false };
        modules.push({ /* ... */ });
      }
      return { ok: true, data: modules };
    }

Extrait de src/components/motion/format-deroule.tsx (lignes 84-119) — modèle
exact du bouton réel par carte, styles conditionnels sur l'état actif, à adapter
(swap description/preuve ici, pas une sélection de panneau) :

    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => setSelected(index)}
      className={isSelected ? "..." : "..."}
    >
      {/* pastille numéro à plat + texte */}
    </button>

Forme actuelle de src/locales/fr/landing.json `confiance` (à remplacer
entièrement, voir Task 1) :

    "confiance": {
      "eyebrow": "Confiance et sécurité",
      "titre": "La confiance se construit sur des faits. En voici trois.",
      "items": [ { "titre": "...", "description": "..." }, "...2 autres" ],
      "temoignages": { "label": "...", "placeholder": "..." },
      "logos": { "label": "...", "placeholder": "..." }
    }

Forme actuelle de scripts/seed-content.mjs autour de `confiancePlaceholders` et
`RETIRED_ITEMS` (lignes ~282-307 et ~379-391) — `RETIRED_ITEMS` est une
constante existante à étendre, jamais à recréer :

    const confianceItems = landing.confiance.items.map((item, index) => ({
      section_cle: "confiance",
      cle: slugify(item.titre),
      titre: item.titre,
      description: item.description,
      position: index + 1,
    }));

    const confiancePlaceholders = [ /* temoignages */, /* logos */ ];

    const RETIRED_ITEMS = [{ section_cle: "competences", cle: "contrats-workflows" }];

    for (const entry of RETIRED_ITEMS) {
      const { error } = await supabase
        .from("content_item")
        .delete()
        .eq("section_cle", entry.section_cle)
        .eq("cle", entry.cle);
      if (error) { console.error(...); process.exit(1); }
    }

Card variant="default" (niveau 2, src/components/ui/card.tsx) — classes déjà
appliquées par le variant, ne pas les redupliquer à la main :

    default: "border-[var(--hairline)] bg-background shadow-[var(--contact),var(--inset-hi)] hover:-translate-y-[3px] hover:border-[var(--hairline-2)] hover:shadow-[var(--shadow-1),var(--inset-hi)]"

a-propos.json (source des trois lignes condensées de la carte formateur, ne pas
contredire) :

    "parcours": "Consultant spécialisé sur l'écosystème Ariba depuis plusieurs années, intervenu sur des projets Procure-to-Pay et Source-to-Pay pour des organisations de tailles variées.",
    "legitimite": "Certifié sur les modules clés de la plateforme, avec une pratique régulière des appels d'offres, des catalogues et des workflows d'approbation.",
    "approche": "Une pédagogie orientée pratique : chaque notion est reliée à un cas d'usage réel avant d'être mise en application par l'apprenant."

Précédent direct dans ce même repo pour l'import JSON statique côté serveur en
plus des requêtes Supabase (confirme que ce n'est pas une entorse à D-24 : le
contenu piloté par le CMS reste en base, le chrome/formateur non-itemisé reste
JSON) :

    src/components/sections/programme-accordion.tsx:18: import landing from "@/locales/fr/landing.json";
    src/components/sections/format-modalites.tsx:13: import landing from "@/locales/fr/landing.json";
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Données — landing.json, registre des mocks, seed</name>
  <files>src/locales/fr/landing.json, src/locales/fr/_mocks.public.json, scripts/seed-content.mjs</files>
  <action>
    Dans src/locales/fr/landing.json, remplace entièrement l'objet `confiance`
    par : `eyebrow` inchangé, `titre` inchangé, `lead` (nouveau) = « Chacun se
    contrôle : une durée, un nom, un plafond. Ouvrez la preuve. », `preuve` =
    { "voir": "Voir la preuve", "masquer": "Masquer la preuve" }, `formateur` =
    { "eyebrow": "Le formateur", "nom": "Jean Dupont", "initiales": "JD",
    "intitule": "Consultant SAP Ariba", "points": [ "Consultant sur
    l'écosystème Ariba", "Certifié sur les modules clés de la plateforme",
    "Pédagogie construite sur des cas d'usage réels" ], "lienLabel": "Voir le
    parcours complet" }, et `items` = exactement les trois objets suivants
    (clé, titre, description et texte de preuve copiés mot pour mot du brief,
    ne rien reformuler) :
    1) { "cle": "appel-decouverte", "titre": "Un appel découverte gratuit",
       "description": "Trente minutes avec le formateur avant tout
       engagement.", "preuve": { "texte": "Trente minutes, sans frais et sans
       engagement : vous exposez votre contexte, le formateur vous dit si la
       formation y répond.", "lienHref": "/contact", "lienLabel": "Demander
       l'appel" } }
    2) { "cle": "formateur-identifie", "titre": "Un formateur identifié",
       "description": "Jean Dupont, consultant SAP Ariba.", "preuve": {
       "texte": "Parcours, certifications et approche pédagogique sont
       détaillés sur la page À propos. Vous savez qui anime avant de
       réserver.", "lienHref": "/a-propos", "lienLabel": "Voir le parcours" } }
    3) { "cle": "groupe-limite", "titre": "Groupe limité à 8 participants",
       "description": "Chaque session live est plafonnée.", "preuve": {
       "texte": "Au-delà de 8 inscrits la session est fermée et un nouveau
       créneau est ouvert. C'est ce plafond qui permet de poser ses questions
       et de faire le cas pratique accompagné." } } — pas de
       lienHref/lienLabel sur ce troisième item.
    Supprime les clés `temoignages` et `logos` de l'objet `confiance`.

    Dans src/locales/fr/_mocks.public.json : l'entrée `{ "file": "landing.json",
    "key": "confiance.items", ... }` existe déjà — ne la duplique pas. Ajoute
    juste après une entrée `{ "file": "landing.json", "key":
    "confiance.formateur", "blocks": "CADR-03", "awaiting":
    "Cadrage_Formation_SAP_Ariba_Questions_Client.docx" }` (le nom du
    formateur est fictif, D-63). Retire les deux entrées devenues caduques
    dont la `key` vaut `confiance.temoignages.placeholder` et
    `confiance.logos.placeholder` (D-61).

    Dans scripts/seed-content.mjs : réécris `confianceItems` pour lire la
    nouvelle forme — `cle: item.cle` (ne pas re-slugifier, les clés sont
    portées par le JSON), `titre: item.titre`, `description: item.description`,
    `donnees: { preuve: item.preuve }`, `position: index + 1`. Supprime
    entièrement la constante `confiancePlaceholders` (les deux objets
    temoignages/logos) et retire sa concaténation `...confiancePlaceholders,`
    dans l'appel à `upsertItems`. Étends la constante `RETIRED_ITEMS` existante
    (ligne ~379, ne pas en créer une seconde) avec cinq entrées :
    `{ section_cle: "confiance", cle: "temoignages" }`,
    `{ section_cle: "confiance", cle: "logos" }`,
    `{ section_cle: "confiance", cle: "protection-des-donnees" }`,
    `{ section_cle: "confiance", cle: "experts-sap-ariba-certifies" }`,
    `{ section_cle: "confiance", cle: "contenus-regulierement-mis-a-jour" }` —
    ce sont les clés que l'ancien `slugify(item.titre)` produisait pour les
    trois anciens faits et les deux placeholders ; la boucle de retrait
    existante (ligne ~381-391) reste inchangée dans sa logique, elle itère
    simplement sur une liste plus longue.

    Ne lance PAS `npx supabase db reset` (stack partagée entre worktrees,
    interdit ce run). Lance `npm run content:seed` une fois les trois
    fichiers modifiés.
  </action>
  <verify>
    <automated>node -e "const l=require('./src/locales/fr/landing.json'); const m=require('./src/locales/fr/_mocks.public.json'); if(l.confiance.temoignages||l.confiance.logos) process.exit(1); if(l.confiance.items.length!==3) process.exit(1); if(!l.confiance.formateur||l.confiance.formateur.nom!=='Jean Dupont') process.exit(1); if(m.mocks.some(x=>x.key==='confiance.temoignages.placeholder'||x.key==='confiance.logos.placeholder')) process.exit(1); if(!m.mocks.some(x=>x.key==='confiance.formateur')) process.exit(1); console.log('ok')" && grep -c "confiancePlaceholders" scripts/seed-content.mjs | grep -qx 0</automated>
  </verify>
  <done>landing.json.confiance porte lead/preuve/formateur/items (3, avec cle+preuve), plus de temoignages/logos ; _mocks.public.json a confiance.formateur et n'a plus les deux entrées placeholder ; seed-content.mjs n'a plus confiancePlaceholders, RETIRED_ITEMS porte les 5 nouvelles entrées confiance ; `npm run content:seed` exécuté sans erreur.</done>
</task>

<task type="auto">
  <name>Task 2: Frontière de validation — getConfianceFaits() dans queries.ts</name>
  <files>src/lib/content/queries.ts</files>
  <action>
    Ajoute, sur le modèle exact de `moduleDonneesSchema`/`getModules` (voir
    interfaces ci-dessus), un schema local `confianceDonneesSchema = z.object({
    preuve: z.object({ texte: z.string(), lienHref: z.string().optional(),
    lienLabel: z.string().optional() }) })`, un type exporté `ConfianceFait = {
    id: string; cle: string; titre: string; description: string; preuveTexte:
    string; preuveLienHref?: string; preuveLienLabel?: string }`, et une
    fonction exportée `getConfianceFaits(): Promise&lt;QueryResult&lt;ConfianceFait[]&gt;&gt;`
    qui : appelle `getSectionItems("confiance")`, retourne le résultat tel
    quel si `!result.ok`, puis pour chaque ligne valide `item.donnees` avec
    `confianceDonneesSchema.safeParse` — si le parse échoue, ou si `item.titre`
    ou `item.description` est `null`, retourne `{ ok: false }` immédiatement
    (même contrat d'échec strict que `getModules`, jamais un rendu partiel).
    Sur succès, pousse `{ id: item.id, cle: item.cle, titre: item.titre,
    description: item.description, preuveTexte: parsed.data.preuve.texte,
    preuveLienHref: parsed.data.preuve.lienHref, preuveLienLabel:
    parsed.data.preuve.lienLabel }`. Retourne `{ ok: true, data: faits }` à la
    fin. Ne touche à aucune fonction existante du fichier.
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | grep -i "queries.ts" ; grep -c "export async function getConfianceFaits" src/lib/content/queries.ts | grep -qx 1 && grep -c "confianceDonneesSchema" src/lib/content/queries.ts | grep -qE "^[1-9]"</automated>
  </verify>
  <done>getConfianceFaits exporté, typecheck sur queries.ts propre, donnees.preuve validé par zod avant tout retour ok:true.</done>
</task>

<task type="auto">
  <name>Task 3: Mécanisme fait → preuve — nouveau client component confiance-faits.tsx</name>
  <files>src/components/motion/confiance-faits.tsx</files>
  <action>
    Crée src/components/motion/confiance-faits.tsx, "use client", sur le
    modèle de format-deroule.tsx (voir interfaces). Props : `items:
    Array&lt;{ id: string; cle: string; titre: string; description: string;
    preuveTexte: string; preuveLienHref?: string; preuveLienLabel?: string;
    icon: React.ReactNode }&gt;` et `labels: { voir: string; masquer: string }`.
    Un seul `useState&lt;Record&lt;string, boolean&gt;&gt;` `open`, clé = `item.id`,
    défaut `{}` (fermé = description visible). `ul` racine reprend exactement
    les classes actuelles de confiance.tsx : `mt-[3.25rem] grid grid-cols-1
    gap-[1.35rem] sm:grid-cols-2 lg:grid-cols-3`. Chaque item, dans un
    `Reveal as="li" dataD={((index % 5) + 1)}`, contient une `Card
    variant="default" className="group flex h-full flex-col p-[1.7rem]"` qui
    porte, dans cet ordre :
    1. la pastille icône `aria-hidden="true"` (classes identiques à l'actuel
       confiance.tsx : `flex size-[52px] shrink-0 items-center justify-center
       rounded-[16px] bg-[linear-gradient(135deg,var(--violet),var(--deep))]
       text-white shadow-[0_12px_24px_-10px_rgba(99,91,255,.6)]
       transition-transform duration-[500ms] ease-[var(--ease-brand)]
       group-hover:scale-[1.08] group-hover:-rotate-[4deg]`) contenant
       `item.icon` ;
    2. un vrai `&lt;button type="button" aria-expanded={isOpen}
       aria-controls={preuveId} onClick={...}&gt;` de largeur pleine, texte
       aligné à gauche, qui couvre UNIQUEMENT le titre + l'affordance — pas le
       bloc description/preuve. Le titre en `span` (classes de l'actuel
       CardTitle : `mt-3 text-[1.08rem] leading-[1.3] font-bold
       tracking-[-0.02em]`), suivi d'un `span` d'affordance (`mt-2 inline-block
       text-[0.78rem] font-semibold text-[var(--violet)] underline
       underline-offset-2`) affichant `labels.masquer` si `isOpen` sinon
       `labels.voir` ;
    3. sous le bouton, un conteneur `id={preuveId}` en `grid` où description
       et preuve occupent la MÊME cellule (`col-start-1 row-start-1` sur les
       deux blocs) — la hauteur du conteneur devient celle du plus haut des
       deux automatiquement, aucune transition de hauteur nulle part. Le bloc
       description est visible par défaut (`visible`) et devient `invisible`
       quand `isOpen` ; le bloc preuve fait l'inverse. Chaque bloc porte
       `aria-hidden` opposé à sa visibilité. Texte identique aux classes
       actuelles de CardDescription (`text-[0.94rem] leading-[1.6]
       text-[var(--muted-ink)]`). Dans le bloc preuve, sous `preuveTexte`, si
       `preuveLienHref` ET `preuveLienLabel` sont définis, un `&lt;Link
       href={preuveLienHref}&gt;` (import `next/link`) hors du `&lt;button&gt;`,
       classes `mt-2 inline-block text-[0.85rem] font-semibold
       text-[var(--violet)] underline underline-offset-2`, texte
       `preuveLienLabel`.
    `preuveId` = `` `confiance-preuve-${item.cle}` ``. `isOpen` = `Boolean(open[item.id])`.
    `onClick` bascule uniquement l'entrée de cet item dans `open` (cartes
    indépendantes, plusieurs ouvertes possible). Aucune classe `hover:` ne
    conditionne la visibilité du bloc preuve — seul `onClick`/`isOpen` compte,
    identique au clavier (Entrée/Espace activent nativement un `&lt;button&gt;`)
    et au toucher.
  </action>
  <verify>
    <automated>grep -c "aria-expanded" src/components/motion/confiance-faits.tsx | grep -qE "^[1-9]" && grep -c "aria-controls" src/components/motion/confiance-faits.tsx | grep -qE "^[1-9]" && grep -c "row-start-1" src/components/motion/confiance-faits.tsx | grep -qE "^[1-9]" && grep -c "dashed" src/components/motion/confiance-faits.tsx | grep -qx 0 && grep -c "cubic-bezier" src/components/motion/confiance-faits.tsx | grep -qx 0</automated>
  </verify>
  <done>confiance-faits.tsx exporte ConfianceFaits, chaque carte a un bouton réel avec aria-expanded/aria-controls, la moitié basse est un stack grid à hauteur fixe (description/preuve superposées), le lien de preuve n'est jamais imbriqué dans le bouton, zéro dashed, zéro cubic-bezier.</done>
</task>

<task type="auto">
  <name>Task 4: Section serveur confiance.tsx + contrat de phase D-61 à D-64</name>
  <files>src/components/sections/confiance.tsx, .planning/phases/02-site-public/02-CONTEXT.md</files>
  <action>
    Réécris src/components/sections/confiance.tsx (reste un composant serveur,
    aucun `"use client"`). `CONFIANCE_ICONS` réécrit sur les nouvelles clés :
    `"appel-decouverte": PhoneCall`, `"formateur-identifie": UserCheck`,
    `"groupe-limite": Users` (lucide-react). `Promise.all` de
    `getSection("confiance")` et `getConfianceFaits()` (import depuis
    `@/lib/content/queries`) ; sur échec de l'un ou l'autre, garde d'erreur
    inchangée (`EmptyState tone="error"` + `common.etats.erreurGenerique`).
    Importe `landing` depuis `@/locales/fr/landing.json` (précédent direct :
    programme-accordion.tsx, format-modalites.tsx) pour lire
    `landing.confiance.formateur` et `landing.confiance.preuve`. La grille de
    tête passe de `items-center` à `items-start`. Colonne droite : remplace
    entièrement l'encart photo en pointillés (le `Reveal as="figure"
    dataD={2}` actuel bordé `border-dashed`) par un `Reveal as="aside"
    dataD={2}` contenant une `Card variant="default" className="flex h-full
    flex-col gap-4 p-[1.7rem]"` qui porte, dans l'ordre : l'eyebrow
    (`formateur.eyebrow`, mêmes classes que les eyebrows existants du fichier
    — `text-[0.68rem] font-bold tracking-[0.14em] text-[var(--violet)]
    uppercase`) ; une ligne `flex items-center gap-4` avec la pastille de
    monogramme — `aria-hidden="true"`, `flex size-16 shrink-0 items-center
    justify-center rounded-[18px] bg-[var(--violet)] text-[1.1rem]
    font-extrabold text-white` contenant `formateur.initiales`, précédée d'un
    commentaire `why:` disant que c'est le seul emplacement réservé au
    portrait futur du formateur (remplacer par une balise Image le jour où une
    vraie photo existe — aucune photo ne peut être ajoutée ce run, D-63) — et
    à côté, nom (`formateur.nom`, `text-[1.02rem] font-bold text-[var(--ink)]`)
    et intitulé (`formateur.intitule`, `text-[0.88rem]
    text-[var(--muted-ink)]`) ; une liste des trois `formateur.points`, chaque
    ligne `flex items-start gap-2 text-[0.88rem] text-[var(--ink-soft)]`
    précédée d'un `Check` `aria-hidden="true"` `mt-[3px] size-4 shrink-0
    text-[var(--mint-ink)]` ; un `Link href="/a-propos"` en bas de carte
    (`mt-auto`), classes `inline-flex w-fit items-center text-[0.85rem]
    font-semibold text-[var(--violet)] underline underline-offset-2`, texte
    `formateur.lienLabel`. Aucun pointillé, aucun hexadécimal brut. Sous la
    grille de tête, remplace le `&lt;ul&gt;` de cartes actuel (et le bloc
    placeholders qui suit) par un seul appel à `&lt;ConfianceFaits items={...}
    labels={{ voir: landing.confiance.preuve.voir, masquer:
    landing.confiance.preuve.masquer }} /&gt;` (import depuis
    `@/components/motion/confiance-faits`), où `items` mappe chaque ligne de
    `getConfianceFaits()` en ajoutant `icon: CONFIANCE_ICONS[fait.cle] ?
    &lt;CONFIANCE_ICONS[fait.cle] className="size-6" /&gt; : null`. `SectionHeader`
    reçoit désormais `lead={section.lead ?? undefined}` (déjà le cas — vérifie
    que `section.lead` porte bien le nouveau `landing.confiance.lead` depuis
    le seed de la Task 1, aucun changement de prop nécessaire côté
    SectionHeader). `Reveal`/`dataD` restent sur les cartes de faits (portés
    par confiance-faits.tsx désormais). Garde d'erreur et `EmptyState`
    inchangés.

    Puis, dans .planning/phases/02-site-public/02-CONTEXT.md, ajoute à la
    suite de D-60, dans la section decisions, quatre nouvelles entrées datées
    2026-09-01, forme des D- existants (même style de puce/paragraphe que
    D-60) :
    - D-61 (fondateur) : emplacements « Témoignages » et « Entreprises »
      retirés du rendu ET des données semées.
    - D-62 (fondateur + CTO) : trois faits deviennent vérifiables — appel
      découverte gratuit 30 min, formateur nommé avec parcours consultable,
      groupe plafonné à un nombre. « Protection des données » et « Contenus
      régulièrement mis à jour » quittent la landing.
    - D-63 (fondateur + CTO) : encart photo 16/9 en pointillés remplacé par
      une carte formateur composée en code. Aucune photo sourcée ; `public/`
      ne contient aucune image matricielle. La pastille de monogramme est le
      seul emplacement du portrait futur.
    - D-64 (fondateur + CTO) : mécanisme « fait → preuve » — clic sur une
      carte échange sa moitié basse entre description et preuve. Hauteur de
      carte fixe, aucun décalage de mise en page, même comportement
      clavier/toucher.
  </action>
  <verify>
    <automated>grep -qv "use client" src/components/sections/confiance.tsx && ! grep -q "use client" src/components/sections/confiance.tsx && grep -c "dashed" src/components/sections/confiance.tsx | grep -qx 0 && grep -c "ConfianceFaits" src/components/sections/confiance.tsx | grep -qE "^[1-9]" && grep -c "D-61" .planning/phases/02-site-public/02-CONTEXT.md | grep -qE "^[1-9]" && grep -c "D-64" .planning/phases/02-site-public/02-CONTEXT.md | grep -qE "^[1-9]"</automated>
  </verify>
  <done>confiance.tsx reste un composant serveur sans dashed, monte la carte formateur en code et ConfianceFaits ; D-61 à D-64 présents dans 02-CONTEXT.md avec le texte ci-dessus.</done>
</task>

<task type="auto">
  <name>Task 5: Vérification finale (Bash uniquement — aucun outil navigateur)</name>
  <files>(aucun — vérification uniquement)</files>
  <action>
    Commite d'abord chaque tâche précédente (déjà fait au fil de l'exécution),
    vérifie ensuite. Lance dans l'ordre `npm run lint`, `npm run typecheck`,
    `npm run build` — les trois sortent 0. Lance `npm run content:check` :
    doit s'exécuter sans planter (code de sortie non pertinent — il est conçu
    pour sortir 1 tant que `confiance.items`/`confiance.formateur` restent
    mockés) et son texte doit toujours nommer `confiance.items` et
    `confiance.formateur` parmi les clés bloquantes. Contre la base locale
    (jamais de `db reset`) : `docker exec supabase_db_ElearningAriba psql -U
    postgres -d postgres -tAc "select cle, statut from app.content_item where
    section_cle='confiance' order by position;"` doit retourner exactement
    trois lignes, dans l'ordre `appel-decouverte`, `formateur-identifie`,
    `groupe-limite`, aucune avec un statut `placeholder`. Le serveur de dev
    est supposé déjà démarré (CLAUDE.md) — `curl -o /dev/null -s -w
    "%{http_code}"` sur `http://localhost:3000/contact` et
    `http://localhost:3000/a-propos` retournent chacun `200`. `grep -r
    "Experts SAP Ariba" src/` retourne zéro occurrence. Sur
    src/components/sections/confiance.tsx : zéro `dashed`, zéro `"use
    client"`. Sur les fichiers touchés (`confiance.tsx`,
    `confiance-faits.tsx`) : zéro hexadécimal brut ajouté dans un JSX (les
    tokens `var(--violet)` etc. ne comptent pas), zéro `min-[` arbitraire,
    zéro seconde valeur `cubic-bezier` dans tout `src/` (`grep -r
    "cubic-bezier" src/ | grep -v "var(--ease-brand" ` doit être vide ou ne
    révéler que la définition du token dans globals.css). Dis explicitement
    dans le résumé final que la vérification DOM réelle — mesures pixel,
    contraste mesuré au rendu, comportement clic/clavier observé dans un
    navigateur — reste à faire par le CTO en session : ne la tente pas, ne
    prétends pas l'avoir faite.
  </action>
  <verify>
    <automated>cd "C:/Users/Essakhi/Desktop/ElearningSAP/ElearningAriba" && npm run lint && npm run typecheck && npm run build</automated>
  </verify>
  <done>lint/typecheck/build sortent 0 ; content:check s'exécute sans planter et nomme toujours confiance.items/confiance.formateur ; psql retourne exactement les 3 lignes attendues sans statut placeholder ; curl /contact et /a-propos retournent 200 ; zéro "Experts SAP Ariba" dans src/ ; confiance.tsx sans dashed ni use client ; aucun hex brut/min-[/seconde cubic-bezier ajoutés. Le résumé final nomme explicitement la vérification DOM comme non faite, laissée au CTO.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|--------------|
| Supabase (contenu public) vers RSC | Lecture seule anonyme via le client cookieless ; aucune écriture, aucune session. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02-06-01 | Tampering | content_item.donnees jsonb (section confiance, champ preuve) | mitigate | Validé à la frontière via confianceDonneesSchema (zod) dans queries.ts avant tout rendu ; parse invalide retourne ok:false, qui mène à l'état d'erreur, jamais un rendu de donnees non conformes. |
| T-02-06-02 | Information Disclosure | confiance-faits.tsx bloc preuve | accept | Le texte de preuve est un contenu public déjà destiné à s'afficher (description alternative) — aucune donnée sensible, pas de PII. |
| T-02-06-SC | Tampering | npm installs | accept | Ce run n'ajoute aucune dépendance npm — aucune surface de package à auditer. |
</threat_model>

<verification>
Commite avant de vérifier, jamais en arrière-plan. `npm run lint`, `npm run
typecheck`, `npm run build` sortent 0. `npm run content:check` s'exécute sans
planter et signale toujours `confiance.items`/`confiance.formateur`. Après
`npm run content:seed` (jamais `db reset`), `psql` sur
`app.content_item where section_cle='confiance'` retourne exactement trois
lignes (`appel-decouverte`, `formateur-identifie`, `groupe-limite`), aucune
`statut = 'placeholder'`. `curl` sur `/contact` et `/a-propos` retourne 200.
Zéro « Experts SAP Ariba » dans `src/`. `confiance.tsx` sans `"use client"`.
Zéro `dashed` restant dans `confiance.tsx`. Aucun hexadécimal brut ajouté,
aucun `min-[` arbitraire, aucune seconde `cubic-bezier`. La vérification DOM
(mesures pixel, contraste réellement rendu, comportement clic/clavier observé)
n'est PAS tentée ce run — nommée explicitement comme laissée au CTO.
</verification>

<success_criteria>
- Les six sous-sections du brief (« Ce que le code doit livrer ») sont
  livrées : données + registre des mocks, picto de chaque fait, carte
  formateur en code, mécanisme fait → preuve, nettoyage des pointillés,
  D-61 à D-64 consignées.
- `npm run lint` / `npm run typecheck` / `npm run build` sortent 0.
- Tous les contrôles Bash de la section « Contraintes de vérification » du
  brief passent (psql, curl, grep).
- Commits atomiques, un par unité de sens ; rien publié vers le distant ;
  branche `gsd/phase-02-site-public` inchangée.
- Le résumé final nomme explicitement la vérification DOM comme non faite.
</success_criteria>

<output>
Create `.planning/quick/260901-shu-section-06-confiance-et-securite-remplac/260901-shu-SUMMARY.md` when done
</output>
