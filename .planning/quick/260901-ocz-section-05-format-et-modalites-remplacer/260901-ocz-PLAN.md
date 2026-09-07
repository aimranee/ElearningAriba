---
phase: 02-site-public
plan: quick-260901-ocz
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/globals.css
  - src/lib/content/queries.ts
  - src/locales/fr/landing.json
  - src/locales/fr/common.json
  - src/components/motion/format-parcours.tsx
  - src/components/motion/format-deroule.tsx
  - src/components/sections/format-modalites.tsx
  - .planning/phases/02-site-public/02-CONTEXT.md
autonomous: true
requirements: [PUB-05]
must_haves:
  truths:
    - "La colonne gauche de la section Format et modalités affiche les cinq etapes reelles du deroule de formation (page-formation), numerotees 01 a 05, sans repere fictif ni numerotation mensongere"
    - "La colonne droite affiche une fenetre d'apercu reutilisant le chrome du hero, avec cinq mises en page distinctes selon l'etape selectionnee au clic"
    - "L'apercu de l'etape 03 est un wireframe abstrait sans aucune marque SAP/Ariba"
    - "Une bande Ce qui est fourni sous les deux colonnes liste 5 lignes cochees (fourni + prerequis + dureeAcces) et 1 ligne non cochee (item format-modalites statut futur)"
    - "Tous les numeros blancs sur pastille/pilule respectent AA (jetons -ink uniquement, jamais --sky/--mint/--blue en fond de texte blanc)"
  artifacts:
    - path: "src/components/motion/format-deroule.tsx"
      provides: "Composant client de la colonne etapes + fenetre d'apercu 5 mises en page + bande fournie"
    - path: "src/components/sections/format-modalites.tsx"
      provides: "Composant serveur : 5 requetes (getSection, getSectionItems, getFormationDeroule, getFormationFourni, getModules), garde d'erreur, ligne d'intro"
    - path: "src/lib/content/queries.ts"
      provides: "getFormationDeroule, getFormationFourni lisant page-formation"
  key_links:
    - from: "src/components/sections/format-modalites.tsx"
      to: "src/components/motion/format-deroule.tsx"
      via: "props deroule/fourni/panneaux/items"
      pattern: "FormatDeroule"
    - from: "src/components/motion/format-deroule.tsx"
      to: "src/app/globals.css"
      via: "ETAPE_TEINTES var(--sky-ink) etc."
      pattern: "ETAPE_TEINTES"
---

<objective>
Reecrire la section 05 "Format et modalites" : colonne gauche = deroule reel de 5
etapes (page-formation), colonne droite = fenetre d'apercu par etape (5 mises en
page distinctes, chrome de hero.tsx), bande "Ce qui est fourni" sous les deux
colonnes. Corrige au passage 5 traps de contraste AA mesures et 4 hexadecimaux bruts.

Purpose: la section actuelle dit trois fois la meme chose (colonne, carte, stepper)
et sa numerotation 01 a 06 est une affirmation fausse (« Prerequis » y est l'etape
06, « Videos a venir » — non livre — l'etape 03). Le bon contenu (deroule
chronologique reel) existe deja en base et n'est pas rendu.

Output: jeton --sky-ink, getFormationDeroule/getFormationFourni dans queries.ts,
bloc apercu dans landing.json, formatModalitesAside reduit dans common.json,
format-deroule.tsx (remplace format-parcours.tsx), format-modalites.tsx reecrit,
D-57/D-58 dans 02-CONTEXT.md.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/phases/02-site-public/02-CONTEXT.md
@./CLAUDE.md

Brief autorite complet (a lire en entier avant execution, toutes les decisions y
sont prises — ne pas reinterpreter) :
C:/Users/Essakhi/Desktop/ElearningSAP/ariba-cto/notes/2026-09-01-brief-section-05-format-deroule-et-mocks.md

Sources actuelles :
@src/components/sections/format-modalites.tsx
@src/components/motion/format-parcours.tsx
@src/app/formation/page.tsx
@src/lib/content/queries.ts
@src/locales/fr/landing.json
@src/locales/fr/common.json
@src/app/globals.css
</context>

<interfaces>
Extrait de src/app/formation/page.tsx lignes 20-28 — modele exact des schemas
zod a reproduire dans queries.ts (schemas locaux, dupliques deliberement) :

    const derouleDonneesSchema = z.object({
      deroule: z.array(z.string()).default([]),
    });

    const fourniDonneesSchema = z.object({
      fourni: z.array(z.string()).default([]),
      prerequis: z.string().optional(),
      dureeAcces: z.string().optional(),
    });

Extrait de src/lib/content/queries.ts — signature QueryResult et pattern
getSectionItems a reutiliser dans les deux nouvelles fonctions :

    export type QueryResult<T> = { ok: true; data: T } | { ok: false };
    export async function getSectionItems(sectionCle: string): Promise<QueryResult<ContentItem[]>>;

Extrait de src/components/sections/hero.tsx lignes 163-175 — chrome de fenetre
a reprendre a l'identique dans format-deroule.tsx (structure, classes, les
trois hex litteraux des pastilles macOS) :

    <div className="relative overflow-hidden rounded-[22px] bg-white text-[var(--ink)] shadow-[var(--shadow-4),var(--inset-hi)]">
      <div className="flex items-center gap-1.5 border-b border-[var(--border2)] bg-white px-[14px] py-[11px]">
        <span className="size-2.5 rounded-full" style={{ background: "#FF5F57" }} />
        <span className="size-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
        <span className="size-2.5 rounded-full" style={{ background: "#28C840" }} />
        <span className="ml-2 truncate text-[0.72rem] font-semibold text-[var(--muted-ink)]">
          {label}
        </span>
      </div>
      {/* corps */}
    </div>

Extrait de src/app/globals.css lignes 107-123 — jetons -ink existants et le
commentaire why date a etendre pour --sky-ink :

    --muted-ink: #5c6b82;
    --muted2: #8a95a8;
    /* ... */
    --blue: #3b82f6;
    --sky: #38bdf8;
    --mint: #1fc79b;
    --amber: #ffb444;
    /* why (2026-09-01): --blue/--mint/--amber servent de pastille et de wash
       tint dans "Pour qui", mais echouent AA en encre-sur-carte-blanche
       (3.68 / 2.16 / 1.77). Ces variantes assombries gardent la teinte et
       passent (4.62 / 4.58 / 4.63). L'accent decore, l'encre lit. */
    --blue-ink: #3472d8;
    --mint-ink: #158568;
    --amber-ink: #996c29;

content_item seede pour page-formation (via scripts/seed-content.mjs, INTOUCHE
dans ce run) : cle="deroule" -> donnees.deroule: string[5] ; cle="fourni" ->
donnees.fourni: string[3], donnees.prerequis, donnees.dureeAcces (memes cles
top-level a l'interieur du jsonb `donnees`, voir le schema fourniDonneesSchema
ci-dessus qui les lit directement dans `donnees`). Item format-modalites de cle
"formations-live" (slug de "Formations live") porte la description "Des
sessions animees en direct par un expert certifie, pas des enregistrements."
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Jeton --sky-ink</name>
  <files>src/app/globals.css</files>
  <action>
    Dans le bloc :root, ajoute la ligne "--sky-ink: #0f7ea6;" juste apres
    --amber-ink (a cote de --blue-ink / --mint-ink / --amber-ink, brief section
    1 / D-58). Etends le commentaire why date 2026-09-01 deja present au-dessus
    (celui qui explique pourquoi --blue/--mint/--amber echouent comme encre) pour
    ajouter que --sky echoue aussi comme fond de pastille sous un chiffre blanc
    (mesure 2,14) alors que --sky-ink passe (4,61 dans les deux sens). N'edite
    aucune autre valeur du bloc :root.
  </action>
  <verify>
    <automated>grep -c "sky-ink: #0f7ea6" src/app/globals.css | grep -qx 1</automated>
  </verify>
  <done>"--sky-ink: #0f7ea6" defini une fois dans :root, commentaire why etendu pour mentionner le 2,14 mesure et le 4,61 de --sky-ink.</done>
</task>

<task type="auto">
  <name>Task 2: Requetes partagees page-formation</name>
  <files>src/lib/content/queries.ts</files>
  <action>
    Ajoute deux exports sur le modele exact des schemas locaux de
    src/app/formation/page.tsx lignes 20-28 (voir interfaces ci-dessus).
    getFormationDeroule retourne Promise&lt;QueryResult&lt;string[]&gt;&gt; : lit
    getSectionItems("page-formation"), trouve l'item dont cle vaut "deroule",
    valide son donnees avec un schema zod local { deroule:
    z.array(z.string()).default([]) }, retourne { ok:false } si la lecture
    echoue, si l'item est absent, si le parse echoue, ou si le tableau resultant
    est vide (un deroule vide compte comme une erreur, brief section 4 -
    "Format et modalites" est la section, son absence ne laisse rien a montrer).
    getFormationFourni retourne Promise&lt;QueryResult&lt;{ fourni: string[];
    prerequis?: string; dureeAcces?: string }&gt;&gt; : meme
    getSectionItems("page-formation"), trouve l'item dont cle vaut "fourni",
    valide avec { fourni: z.array(z.string()).default([]), prerequis:
    z.string().optional(), dureeAcces: z.string().optional() }, retourne {
    ok:false } uniquement sur echec de lecture, item absent, ou parse invalide
    (un fourni vide reste ok:true — prerequis/dureeAcces absents degradent en
    silence cote appelant, brief section "Empty & error"). Pose un commentaire
    why date 2026-09-01 juste au-dessus des deux fonctions disant que ces
    schemas dupliquent volontairement ceux de formation/page.tsx : cette page
    fonctionne deja, la converger dans ce run elargirait la surface de risque
    sans benefice pour la section 5. Ne touche pas a
    src/app/formation/page.tsx.
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | grep -i "queries.ts" ; grep -c "export async function getFormationDeroule" src/lib/content/queries.ts | grep -qx 1</automated>
  </verify>
  <done>getFormationDeroule et getFormationFourni exportes, typecheck sur queries.ts propre, aucun changement dans src/app/formation/page.tsx.</done>
</task>

<task type="auto">
  <name>Task 3: Libelles d'interface et reduction de l'aside</name>
  <files>src/locales/fr/landing.json, src/locales/fr/common.json</files>
  <action>
    Dans src/locales/fr/landing.json, objet formatModalites, ajoute une cle
    apercu portant exactement (brief section 3) : etapeLabel = "Etape {n}" ;
    panneaux = tableau de 5 objets { eyebrow, titre } dans cet ordre exact —
    1) Connexion / "Votre creneau reserve", 2) Presentation / "Le formateur
    presente le module", 3) Demonstration / "Le formateur partage son ecran",
    4) Cas pratique / "Vous mettez en pratique", 5) Synthese / "Questions et
    synthese" ; puis les cles plates enDirect = "En direct", ecranPartage =
    "Ecran partage", rejoindre = "Rejoindre la session", confirme = "Confirme",
    accompagne = "Accompagne par le formateur", supportModule = "Support PDF du
    module", vosQuestions = "Vos questions", creneauExemple = "Jeudi . 14 h —
    16 h" (utilise le caractere milieu de ligne "·", pas un point), formateur =
    "Formateur", participants = "Participants", nonContractuel = "Apercu de
    l'interface — exemple non contractuel.", frameLabel = "Session live .
    Formation SAP Ariba" (meme caractere "·"), ceQuiEstFourni = "Ce qui est
    fourni". Utilise des apostrophes droites coherentes avec le reste du
    fichier JSON. Dans src/locales/fr/common.json, objet formatModalitesAside :
    supprime les cles items et itemFutur, supprime la cle titre, garde
    uniquement resume tel quel (le nouvel intitule de la bande vient desormais
    de landing.json formatModalites.apercu.ceQuiEstFourni). Ne modifie aucune
    autre cle de l'un ou l'autre fichier.
  </action>
  <verify>
    <automated>node -e "const c=require('./src/locales/fr/common.json'); const l=require('./src/locales/fr/landing.json'); if(c.formatModalitesAside.items||c.formatModalitesAside.itemFutur||c.formatModalitesAside.titre) process.exit(1); if(!l.formatModalites.apercu||l.formatModalites.apercu.panneaux.length!==5) process.exit(1); console.log('ok')"</automated>
  </verify>
  <done>landing.json.formatModalites.apercu existe avec 5 panneaux et tous les libelles listes ; common.json.formatModalitesAside ne porte plus que resume.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 4: Composant client format-deroule (colonne etapes, fenetre d'apercu, bande fournie)</name>
  <files>src/components/motion/format-parcours.tsx, src/components/motion/format-deroule.tsx</files>
  <behavior>
    Ce composant n'a pas de logique testable isolement (pas de lanceur de
    tests dans le projet) ; la verification se fait par grep sur le JSX rendu
    apres build (voir la tache de verification finale).
  </behavior>
  <action>
    Supprime src/components/motion/format-parcours.tsx. Cree
    src/components/motion/format-deroule.tsx, "use client", un seul useState
    pour l'index selectionne (defaut 0). Definis en haut du fichier, avec le
    commentaire why date 2026-09-01 du brief section 5 (ces cinq jetons sont
    les seuls de la palette a porter un chiffre blanc a AA ; --sky/--mint/--blue
    ont ete mesures a 2,14/2,16/3,68 et sont donc exclus des pastilles) :

    const ETAPE_TEINTES = [
      "var(--violet)",
      "var(--deep)",
      "var(--blue-ink)",
      "var(--sky-ink)",
      "var(--mint-ink)",
    ] as const;

    Props : items (ContentItem[] du deroule, deja des strings — accepte plutot
    deroule: string[] directement puisque getFormationDeroule retourne
    string[]), fourniLignes (les 6 lignes de la bande deja assemblees par le
    parent : { texte: string; coche: boolean }[]), aperçu (le bloc apercu de
    landing.json), premierModuleTitre (string, pour le panneau 1), resume
    (string deja interpole, pour la ligne GraduationCap). Grille racine :
    "mt-10 grid items-start gap-[clamp(2rem,4vw,3.5rem)] lg:grid-cols-[0.92fr_1.08fr]".

    5a. Colonne des etapes (brief section 5a) : un ol, chaque etape un
    button type="button" dans un Reveal (as="li", dataD de 1 a 5),
    aria-pressed={isSelected}, portant : la pastille flex size-[42px] shrink-0
    items-center justify-center rounded-[14px] text-[0.8rem] font-extrabold
    tabular-nums text-white avec style backgroundColor: ETAPE_TEINTES[index]
    (fond uni, jamais de degrade) et le numero 01..05 ; le texte de l'etape
    (deroule[index]) dans un p text-[0.98rem] leading-[1.55], font-semibold
    text-[var(--ink)] si selectionnee sinon text-[var(--muted-ink)] ; la barre
    verticale gauche absolute top-4 bottom-4 left-0 w-[3px] rounded-full avec
    style background: ETAPE_TEINTES[index], opacity-100 si selectionnee sinon
    opacity-0 group-hover:opacity-100 transition-opacity
    duration-[var(--duration-base)] ease-[var(--ease-brand)] ; le panneau
    selectionne bg-[var(--tint-violet)] border border-[var(--hairline)], sinon
    transparent avec les memes etats de survol (border-transparent
    hover:border-[var(--hairline)] hover:bg-[var(--tint-violet)]).

    5b. Fenetre d'apercu (brief section 5b) : conteneur
    lg:sticky lg:top-[104px] aria-hidden="true" portant le chrome du hero
    (voir interfaces ci-dessus : relative overflow-hidden rounded-[22px]
    bg-white text-[var(--ink)] shadow-[var(--shadow-4),var(--inset-hi)], barre
    superieure flex items-center gap-1.5 border-b border-[var(--border2)]
    bg-white px-[14px] py-[11px] avec les 3 pastilles macOS #FF5F57/#FEBC2E/#28C840
    puis un span ml-2 truncate text-[0.72rem] font-semibold
    text-[var(--muted-ink)] portant apercu.frameLabel). Corps : la pilule
    d'etape inline-flex items-center rounded-full px-[0.6rem] py-[0.28rem]
    text-[0.6rem] font-extrabold tracking-[0.1em] uppercase text-white avec
    style backgroundColor: ETAPE_TEINTES[selected], texte compose
    `${apercu.etapeLabel.replace("{n}", String(selected+1).padStart(2,"0"))} . ${apercu.panneaux[selected].eyebrow}`
    (utilise le caractere "·") ; le titre mt-3 text-[1.02rem] font-bold
    tracking-[-0.02em] = apercu.panneaux[selected].titre. Puis le corps propre
    a l'etape, aucun element focusable nulle part dans la fenetre (pas de
    button/a/tabIndex) :
    1) Connexion — ligne Calendar + apercu.creneauExemple en tabular-nums ;
       premierModuleTitre en dessous ; pilule apercu.confirme en --mint-ink sur
       --success-muted ; puis un div (jamais un button) large fond
       ETAPE_TEINTES[0] texte blanc portant apercu.rejoindre.
    2) Presentation — tuile rounded-[14px] bg-[var(--tint)] ~130px de haut avec
       rond --deep + User blanc + apercu.formateur dessous ; a cote 3 petites
       tuiles carrees --tint avec User en --muted-ink surmontees de
       apercu.participants ; badge apercu.enDirect avec point plein --mint-ink.
    3) Demonstration (wireframe abstrait, aucune marque SAP/Ariba) — 5 barres
       neutres bg-[var(--border2)] h-2 rounded-full largeurs 100%/70%/85%/45%/90% ;
       une zone encadree border-2 dans ETAPE_TEINTES[2] fond --tint ~40% large
       ~44px haut posee sur la 3e barre, MousePointer2 dans ETAPE_TEINTES[2] au
       coin bas-droit ; badge apercu.ecranPartage sous le bloc.
    4) Cas pratique — 3 rangs rounded-[13px] bg-[var(--tint)] px-3 py-2 avec
       barre neutre en guise de libelle : rangs 1-2 Check blanc dans rond
       --mint-ink, rang 3 rond vide border-2 dans ETAPE_TEINTES[3] ; puis ligne
       apercu.accompagne precedee d'un rond --deep avec User blanc.
    5) Synthese — 2 rangs rounded-[13px] bg-[var(--tint)] avec MessageCircle
       --muted-ink + barre neutre, surmontes de apercu.vosQuestions ; puis une
       ligne separee border border-[var(--hairline)] rounded-[13px] avec
       Download en ETAPE_TEINTES[4] + apercu.supportModule.
    Sous la fenetre : apercu.nonContractuel en text-[0.72rem]
    text-[var(--muted2)] -> remplace par text-[var(--muted-ink)] (brief : le
    muted2 est sous AA, 3,02, ne l'introduis pas comme encre de texte) mt-2
    text-center.

    5d. Stepper (brief section 5d) : sous la colonne de gauche uniquement
    (pas sous la fenetre), aria-hidden="true", rang 01..05, numero actif blanc
    sur --ink, numeros inactifs text-[var(--muted-ink)] (jamais --muted2), trait
    rempli garde son degrade existant, trait vide --border. Reutilise la forme
    actuelle de format-parcours.tsx mais adapte a 5 etapes (pas 6) et a la
    nouvelle encre.

    Bande "Ce qui est fourni" (brief section 6), rendue par ce meme composant
    sous la grille des deux colonnes : border-t border-[var(--hairline)]
    mt-12 pt-8, intitule apercu.ceQuiEstFourni en text-[0.72rem]
    font-semibold uppercase tracking-[0.14em] text-[var(--deep)], puis grille
    sm:grid-cols-2 lg:grid-cols-3 gap-[0.6rem] mt-4 des 6 lignes de
    fourniLignes : cochee = flex items-start gap-[0.65rem] rounded-[13px]
    border border-[var(--hairline)] bg-white px-[0.85rem] py-[0.7rem]
    text-[0.88rem], glyphe Check blanc dans rond bg-[var(--mint-ink)] (pas
    --mint) ; non cochee = meme geometrie bg-[var(--tint)]
    text-[var(--muted-ink)] rond vide border-2 border-[var(--hairline-2)].
    Puis, sous la grille, la ligne de resume GraduationCap --violet + resume
    (prop deja interpolee), conservee telle quelle depuis l'ancien
    format-parcours.tsx.

    Icones lucide-react utilisees, exactement : Calendar, User, MousePointer2,
    MessageCircle, Download, Check, GraduationCap.
  </action>
  <verify>
    <automated>test ! -f src/components/motion/format-parcours.tsx && grep -c "ETAPE_TEINTES" src/components/motion/format-deroule.tsx | grep -qE "^[1-9]" && grep -c "aria-hidden=\"true\"" src/components/motion/format-deroule.tsx | grep -qE "^[1-9]" && ! grep -E "<button|<a |tabIndex" src/components/motion/format-deroule.tsx | grep -v "type=\"button\"" | grep -q "MousePointer2\|Download"</automated>
  </verify>
  <done>format-parcours.tsx n'existe plus ; format-deroule.tsx exporte le composant client avec les 5 pastilles unies, la fenetre aria-hidden a 5 mises en page distinctes, le stepper a 5 pas, et la bande "Ce qui est fourni" a 6 lignes.</done>
</task>

<task type="auto">
  <name>Task 5: Section serveur format-modalites</name>
  <files>src/components/sections/format-modalites.tsx</files>
  <action>
    Reecris le composant serveur (reste un composant serveur). Promise.all de
    5 requetes : getSection("format-modalites"), getSectionItems("format-modalites")
    (pour l'intro et l'item statut futur de la bande), getFormationDeroule(),
    getFormationFourni(), getModules() (pour le resume modules/heures et le
    titre du premier module). Si l'une des 5 echoue, rends l'etat d'erreur
    existant EmptyState tone="error" avec common.etats.erreurGenerique — les
    5 entrent dans la garde d'erreur (brief section 4, contrairement au CTA
    PDF de D-56 : le deroule est la section). Sous le SectionHeader, rends la
    ligne d'intro : la description de l'item de section format-modalites dont
    cle vaut "formations-live", dans un p mx-auto max-w-[52ch] mt-5 text-center
    text-[0.98rem] leading-[1.6] text-[var(--muted-ink)] ; si l'item est absent
    ne rends pas le p. Construis fourniLignes : les 3 chaines de fourni.data.fourni,
    puis fourni.data.prerequis (si present), puis fourni.data.dureeAcces (si
    present), chacune coche:true ; puis, si un item de section format-modalites
    a statut === "futur", ajoute une 6e ligne { texte: item.description ??
    item.titre, coche:false } (si l'item ou sa description est absent, la
    grille rend simplement les autres lignes, brief "Empty & error"). Passe a
    FormatDeroule : deroule (deroule.data), fourniLignes, apercu
    (landing.formatModalites.apercu — importe le JSON), premierModuleTitre
    (modules.data[0]?.titre), resume (formatNumber(moduleCount) et
    formatHours(totalHours) interpoles dans common.formatModalitesAside.resume,
    comme avant). Corrige le docstring en tete de fichier : il pretend
    aujourd'hui que la section est posee sur --lav2 ; elle rend tone="default" —
    dis-le correctement (l'alternance avec Programme et Confiance en tone="band"
    de part et d'autre est correcte, D-21). Ne change pas tone="default" sur
    le composant Section.
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | grep -i "format-modalites.tsx" ; grep -c "getFormationDeroule\|getFormationFourni" src/components/sections/format-modalites.tsx | grep -qE "^[1-9]"</automated>
  </verify>
  <done>format-modalites.tsx compile, garde d'erreur couvre les 5 requetes, ligne d'intro conditionnelle, FormatDeroule recoit deroule/fourniLignes/apercu/premierModuleTitre/resume, docstring corrige.</done>
</task>

<task type="auto">
  <name>Task 6: Contrat de phase D-57/D-58</name>
  <files>.planning/phases/02-site-public/02-CONTEXT.md</files>
  <action>
    Ajoute a la suite de D-56, dans la section decisions, deux nouvelles
    entrees datees 2026-09-01, exactement le texte du brief section 8 :
    D-57 (la section Format rend le deroule reel de cinq etapes lu depuis
    page-formation, avec un apercu par etape dans le cadre de fenetre du
    hero, cinq mises en page distinctes, et "Ce qui est fourni" en bande sous
    les deux colonnes ; les six "reperes" cessaient de decrire une sequence :
    ils etaient numerotes 01 a 06 avec une barre de progression alors que
    "Prerequis" y etait l'etape 06 et "Videos a venir" — non livre — l'etape
    03 ; l'apercu de l'etape 03 est un wireframe abstrait : aucune reprise de
    l'habillage de SAP Ariba sur une page marchande) et D-58 (--sky-ink:
    #0f7ea6 rejoint --blue-ink / --mint-ink / --amber-ink ; les pastilles
    numerotees passent du degrade a l'aplat : seuls --violet (4,70), --deep
    (6,29), --blue-ink (4,62), --sky-ink (4,61) et --mint-ink (4,58) portent
    un chiffre blanc a AA ; --sky et --mint, utilises jusqu'ici, etaient
    mesures a 2,14 et 2,16 ; le glyphe de coche passe a --mint-ink (2,16 to
    4,58) et les numeros inactifs du stepper a --muted-ink (3,02 to 5,41)).
    Suis la forme des D- existants (meme style de puce/paragraphe que D-56).
  </action>
  <verify>
    <automated>grep -c "^- \*\*D-57\*\*\|D-57\*\* (" .planning/phases/02-site-public/02-CONTEXT.md | grep -qE "^[1-9]" && grep -c "D-58" .planning/phases/02-site-public/02-CONTEXT.md | grep -qE "^[1-9]"</automated>
  </verify>
  <done>D-57 et D-58 presents dans 02-CONTEXT.md avec le contenu du brief section 8.</done>
</task>

<task type="auto">
  <name>Task 7: Verification finale</name>
  <files>(aucun — verification uniquement)</files>
  <action>
    Rappel : commite d'abord chaque tache precedente (deja fait au fil de
    l'execution), verifie ensuite, jamais en arriere-plan. Lance dans l'ordre
    npm run lint, npm run typecheck, npm run build ; les trois sortent 0 et
    les 14 routes restent au meme regime (13 statiques + /api/contact
    dynamique) ; si le build en annonce un autre regime, note-le dans le
    resume plutot que de l'ajuster silencieusement. Sur
    .next/server/app/index.html, normalise le HTML (remplace &#39; et &#x27;
    par ') puis verifie : les 3 chaines du deroule sont presentes
    ("Connexion a la session live a l'heure indiquee", "Demonstration pas a
    pas sur la plateforme SAP Ariba", "Temps de questions et de synthese") ;
    les lignes fournies sont presentes ("Un acces a l'espace apprenant pour
    suivre votre progression", "Le cas pratique corrige de chaque module",
    "n'est necessaire pour suivre cette formation") ; la ligne d'intro
    "pas des enregistrements" est presente ; common.etats.erreurGenerique
    n'apparait pas dans le bloc de la section Format ; "Support PDF par
    module" et "Acces aux supports" retournent zero occurrence ; "Apercu de
    l'interface" apparait une fois. Controles de discipline sur les fichiers
    touches : src/components/motion/format-parcours.tsx n'existe plus ;
    #B4771A / #0E9F6E / #FFF4E3 / #D6D3F0 zero occurrence dans tout src/ ;
    --sky-ink defini une fois dans globals.css et lu dans format-deroule.tsx ;
    var(--sky) / var(--mint) / var(--blue) zero occurrence comme fond de
    pastille dans format-deroule.tsx ; --muted2 zero occurrence comme couleur
    de texte dans format-deroule.tsx ; items et itemFutur zero occurrence sous
    formatModalitesAside dans common.json ; la fenetre d'apercu porte
    aria-hidden="true" et ne contient aucun button, a, ni tabIndex ; aucun
    hexadecimal brut ajoute dans un JSX (hormis les 3 pastilles macOS deja
    presentes dans hero.tsx et reprises ici) ; aucune ombre nouvelle hors
    --shadow-4/--inset-hi du cadre ; aucun min-[ arbitraire ; aucune seconde
    cubic-bezier ; aucune duree litterale en ms. Si une ambiguite subsiste
    malgre le brief, tranche-la le plus litteralement possible et signale-la
    dans le resume final — ne t'arrete jamais sans avoir commite.
  </action>
  <verify>
    <automated>cd "C:/Users/Essakhi/Desktop/ElearningSAP/ElearningAriba" && npm run lint && npm run typecheck && npm run build</automated>
  </verify>
  <done>lint/typecheck/build sortent 0, 14 routes au meme regime, toutes les chaines et zero-occurrences ci-dessus confirmees sur .next/server/app/index.html normalise, tous les controles de discipline passent. Toute ambiguite tranchee est nommee dans le resume final.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|--------------|
| Supabase (public content) vers RSC | Lecture seule anonyme via le client cookieless ; aucune ecriture, aucune session. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|------------------|
| T-02-05-01 | Information Disclosure | format-deroule.tsx apercu | accept | L'apercu est deliberement generique/illustratif (aucune donnee sensible, aria-hidden, non focalisable) — rien a divulguer. |
| T-02-05-02 | Tampering | content_item.donnees jsonb (page-formation) | mitigate | Valide a la frontiere via schema zod local dans queries.ts (deroule: string tableau, fourni/prerequis/dureeAcces) avant tout rendu ; parse invalide donne ok:false qui mene a l'etat d'erreur, jamais un rendu de donnees non conformes. |
| T-02-05-SC | Tampering | npm installs | accept | Ce run n'ajoute aucune dependance npm — aucune surface de package a auditer. |
</threat_model>

<verification>
Commite avant de verifier (contrainte non negociable du brief), jamais en
arriere-plan. npm run lint, npm run typecheck, npm run build sortent 0.
14 routes au meme regime que la cloture de D-56 (13 statiques + /api/contact
dynamique) — sinon le nommer dans le resume, ne pas ajuster silencieusement.
Sur .next/server/app/index.html normalise (&#39;/&#x27; remplaces par une
apostrophe simple) : les 5 etapes du deroule presentes (au moins les 3
citees dans la Task 7), les 5 lignes fournies presentes (au moins les 3
citees), la ligne d'intro "pas des enregistrements" presente, aucun etat
d'erreur dans le bloc Format, "Support PDF par module" et "Acces aux
supports" a zero occurrence, "Apercu de l'interface" une fois. Controles de
discipline listes dans la Task 7 tous verifies.
</verification>

<success_criteria>
- Les 8 sous-sections du brief ("Ce que le code doit livrer") sont livrees :
  jeton --sky-ink, requetes partagees, libelles d'interface, section serveur,
  composant client (colonne etapes + fenetre + accessibilite + stepper),
  bande fournie, invariants respectes, D-57/D-58 consignes.
- npm run lint / npm run typecheck / npm run build sortent 0, 14 routes
  inchangees.
- Tous les controles textuels et de discipline de la section "La verification"
  du brief passent sur .next/server/app/index.html.
- Commits atomiques, un par unite de sens ; rien publie vers le distant ;
  branche gsd/phase-02-site-public inchangee.
</success_criteria>

<output>
Create `.planning/quick/260901-ocz-section-05-format-et-modalites-remplacer/260901-ocz-SUMMARY.md` when done
</output>
