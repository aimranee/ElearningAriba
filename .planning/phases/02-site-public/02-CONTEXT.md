# Phase 2: Site public — Context

**Gathered:** 2026-08-29
**Status:** Ready for planning
**Source:** PRD Express Path (`C:/Users/Essakhi/Desktop/ElearningSAP/ariba-cto/notes/2026-08-29-brief-phase-2-site-public.md`)

<domain>
## Phase Boundary

Lot 2 — the **public site** that sells the training. It delivers:

- the landing page in its **seven signed sections**, in order: Hero · Pour qui est
  cette formation ? · Ce que vous allez apprendre · Programme détaillé · Format et
  modalités · Confiance et sécurité · CTA final et FAQ
- the three internal pages: Programme, Formation, À propos
- a working Contact page and form (stored + two emails + anti-spam)
- navigation reaching any page in two clicks, and a complete footer
- migration of the signed public content from `src/locales/fr/*.json` into Supabase,
  so no public page reads the JSON at runtime
- a `/programme.pdf` route generated from the same database rows

Payment gate: **« à la recette des pages »**. The acceptance criteria are written as
**applied outcomes** so that gate is provable.

**Audience:** anonymous visitor only. No authenticated surface in this lot.

**Explicitly NOT in this phase** (negative space — building any of it is unpaid work):
accounts / Google sign-in / learner space (Lot 3); availabilities, public agenda,
booking (Lot 4); SEO, meta, structured data, legal pages, RGPD, deployment (Lot 5);
group sessions (Lot 6); payment, formulas, orders, invoices (Lot 7); Google Calendar
sync (Lot 8); attendance, progression, certificates (Lot 9); admin back-office
(Lot 10). Lots 11–18 are unsold. Also: no dark theme, no second locale, no CMS,
no analytics, no third-party script.

⛔ **Prior-lot lesson.** Lot 1 shipped twelve green plans whose maquettes the founder
rejected on sight, because every design criterion was a *presence check* — does the
token exist, is there one `cubic-bezier`. A grep cannot see timidity. The criteria in
this phase name **applied outcomes** on purpose. Do not soften them back into presence
checks. Diagnosis: `ariba-cto/notes/2026-08-29-les-maquettes-lot-1-sont-insuffisantes.md`.
</domain>

<decisions>
## Implementation Decisions

All decisions below were given by the founder inline on 2026-08-29 before launch, or
are verbatim scope from the signed offer. None is inferred. Every one is **locked**.

### Design direction

- **D-01**: The design reference is **26academy.com, taken literally** — structure,
  treatment, components and palette.
- **D-02**: The accent is violet **`#635BFF`**, verbatim from 26academy. ⚠ This departs
  from a written term of the signed offer: `CADR-05` says « palette bleu / blanc /
  vert ». The conflict was raised and the cost named; the founder reaffirmed violet and
  instructed that it **not** be routed to the Chief of Staff for pricing. Build as
  instructed.
- **D-03** (superseded 2026-09-01, founder decision): the animated stats band
  is **removed** — its four figures are all restated elsewhere on the page:
  Format et modalités repeats the module/hours line verbatim
  (`formatModalitesAside.resume`), the Compétences section renders the same
  six skills, and "Aucun prérequis SAP" already appears twice (hero chip,
  Format et modalités). The honest trust placeholders remain. The seven
  signed sections remain. No signed requirement is affected — none of
  `PUB-01`..`PUB-07` names a stats band.
- **D-04** (superseded 2026-08-31, founder decision): the maquette is **retired as
  visual authority**. The rendered application is the reference. Reason: three times
  the maquette was wrong and the shipped code was right (missing `<meta charset>`,
  mobile burger off-viewport at 375px, a second easing curve). The landing is now
  rebuilt **section by section** — each section discussed, corrected, delivered and
  verified before the next opens. File
  `C:/Users/Essakhi/Desktop/ElearningSAP/ariba-cto/notes/2026-08-29-maquette-lot2-landing-validee.html`
  stays on disk as a historical trace only — not read, not authoritative.

### Design tokens — replace the Lot 1 `:root` palette

- **D-05**: The token set is exactly:
  `--ink:#0A2540; --ink-soft:#28374B; --muted:#5C6B82; --muted2:#8A95A8;`
  `--violet:#635BFF; --violet-l:#8B85FF; --deep:#4F46E5; --indigo:#4338CA;`
  `--blue:#3B82F6; --sky:#38BDF8; --mint:#1FC79B; --amber:#FFB444;`
  `--lav:#F1F0FF; --lav2:#F6F5FF; --soft:#FBFBFE; --paper:#FCFCFF;`
  `--border:#E9ECF3; --border2:#F0F2F8; --card:#FFFFFF;`
  `--ease:cubic-bezier(.16,1,.3,1);`
- **D-06**: Shadows are **paired** — a 1px contact shadow plus a large soft one —
  across four tiers `--shadow-1` … `--shadow-4`, plus `--shadow-brand`
  (`0 30px 60px -24px rgba(99,91,255,.45)`) for anything wearing the accent.
- **D-07**: Typography is **unchanged from Lot 1** and already wired through
  `next/font`: **Plus Jakarta Sans** display at `letter-spacing:-.028em`, **Inter** body.

### Motion — exact values measured from 26academy's source

- **D-08**: **H1 typewriter** cycling the six signed competencies: 26 ms/char typing,
  1050 ms hold, 15 ms/char erase, 140 ms between words.
- **D-09**: **Typewriter width-lock** to the widest word, **re-locked on
  `document.fonts.ready`** — the H1 must never reflow (CLS).
- **D-10**: **Typewriter resync on `visibilitychange`** — restore the whole current
  word; background tabs throttle timers and freeze it mid-letter.
- **D-11**: **Hero spotlight** — 600 px radial `rgba(99,91,255,.16)`, positioned from
  `mousemove` on the hero only, `opacity` 0 → 1.
- **D-12**: **Magnetic buttons** — `translate(mx*.12, my*.18 - 2)` on `.btn-primary`,
  cleared on `mouseleave`.
- **D-13**: **Mesh atmosphere** — 4 blurred blobs, `filter:blur(84px)`,
  `mix-blend-mode:multiply`, drifting on 24–32 s loops, plus a rAF-throttled
  whole-layer cursor drift of ±34 px.
- **D-14**: **Reveal on scroll** — `translateY(34px)` → none, 1 s, staggered `.09s` per
  `data-d` step.
- **D-15**: **One curve only**: `cubic-bezier(.16,1,.3,1)` and nothing else, anywhere.
- **D-16**: **Every animation has a `prefers-reduced-motion: reduce` bypass** — the
  typewriter renders the full word, the spotlight is hidden, the mesh stops.
- **D-17**: The motion kit is 26academy's own and **stops there**. Not a per-section
  cursor-reactive background: that is more than the reference does and it endangers
  `GOL-02`.
- **D-18**: **Scroll progress** indicator and **blurred header at rest, deepening on
  scroll**.

### Composition — the rules Lot 1 broke

- **D-19**: The surface system is **tri-level**. The unconditional hover-lift
  (`--shadow-3` rest / `--shadow-4` + `translateY(-7px)` hover) is scoped to **niveau 3**
  only — the page's two highest-emphasis elements. **Niveau 1** (`--tint` background,
  `--hairline` border, zero box-shadow) and **niveau 2** (white background, `--hairline`
  border, `--contact`/`--inset-hi`) change background tint, border color (`--hairline` →
  `--hairline-2`) and a 2-3px `translateY` on hover; niveau 2 additionally transitions its
  box-shadow from `--contact` to `--shadow-1` (both paired with `--inset-hi`) — niveau 1
  never gains a box-shadow at any state.
- **D-20**: The atmosphere layer is mounted **once at the root** and is visible behind
  **all seven** sections. Lot 1 reached 2 of 8.
- **D-21**: Sections **alternate** transparent / `--lav2` tinted bands, to give the
  atmosphere something to read against.
- **D-22**: Every section opens **eyebrow → two-sentence H2 → lead**. A claim, a full
  stop, then a turn; the second half carries the emotional payload and takes the
  gradient.
- **D-23**: `variant="raised"` already exists on the Card family and is used zero times
  in eleven routes — **this lot uses it**. `--shadow-4` is defined and consumed nowhere
  — **this lot consumes it**. (Run 3 changes the CTA-final call site's shape — a
  card-assembly element replacing the current violet block — without changing this
  criterion.)

### Content and data

- **D-24**: **Public content migrates to Supabase in this lot**, seeded from Lot 1's
  signed JSON. The JSON becomes the **seed**, not the runtime source. No public page
  reads `src/locales/fr/landing.json` at runtime.
- **D-25**: **Content is never re-authored.** The signed French in `src/locales/fr/` is
  the source. Where a string is missing, the **mock registry is the answer, not
  invention**. Moving content into the database must not silently satisfy the mock
  guard — a key that was unresolved stays unresolved.
- **D-26**: The new Supabase migration is **strictly additive** — it must not alter or
  drop a Phase 0 table (`supabase/migrations/20260827131029_init_schema.sql`, already
  applied to production and preview).
- **D-27**: The content seed is **idempotent** — upsert on a stable natural key, never a
  blind insert. Supabase migrations are forward-only.
- **D-28**: **RLS**: new content tables get an anon-select policy for **published rows
  only**; the contact table is **insert-only for anon, with no select**.
- **D-29**: The **programme PDF is generated from the database** — not supplied by the
  client, not a placeholder. `/programme.pdf` renders the five modules and their
  durations from the same rows the page reads.
- **D-30**: The five modules and durations, from `landing.json`: 3 h, 4 h, 4 h, 3 h,
  3 h — **17 h total**. The figures band uses these.
- **D-31**: Témoignages and logos partenaires have signed **placeholder** copy and render
  as **marked placeholders**, never as invented reviews.
- **D-32**: The **four surface-state components from Lot 1** (loading, empty, error,
  success) are the only permitted states and must be **used, not re-invented**. A failed
  database read renders the error surface, never a blank section.

### Contact form and email

- **D-33**: **Email transport is Resend.** Exactly two emails leave the system, both on
  a contact submission and both from Lot 1's signed `emails.json`: an immediate
  notification to the trainer and an acknowledgement to the prospect. No other outward
  traffic.
- **D-34**: The Resend API key and the domain's SPF/DKIM records are the CIO's to
  provision — **read from validated env, never committed**.
- **D-35**: **Anti-spam is honeypot + rate limit + minimum-time-to-submit** — no third
  party, so nothing enters the cookie/RGPD inventory before Lot 5. A honeypot submission
  is rejected **without sending either email**.
- **D-36**: The contact form covers four states: submitting, success, validation error,
  transport error.
- **D-37**: Contact messages are personal data and are **retained**. Their deletion and
  export path is Lot 5's RGPD work — **this lot must not build a public delete route**.

### Technical constraints

- **D-38**: Next.js App Router, **React Server Components for content reads**. The
  landing page stays **static or ISR** — it must not become a client page because of the
  motion. **Motion mounts in small client islands.**
- **D-39**: `GOL-02` obliges **Lighthouse ≥ 90 on mobile** — contractual. The motion
  budget is sized for it: one rAF-throttled pointer listener for the mesh, one for the
  hero spotlight, CSS keyframes for the rest.
- **D-40**: `next/font` is already wired — **no font may be loaded from a CDN**.
- **D-41**: **No image is required by this design.** 26academy's homepage loads five
  images total and all its richness is CSS and inline SVG. Pictograms are **inline SVG
  from a sprite**, as Lot 1 built them.
- **D-42**: **Tailwind v4 + shadcn/ui**, the Lot 1 component families reused. **Do not
  fork a second button or card implementation.**
- **D-43**: **French only** — `fr-FR`, LTR, `Europe/Paris`, pinned in
  `src/lib/i18n/fr.ts`, which exports the **only permitted formatters**. Every date, time
  and number formats through them. `currencyFormatter` carries the `€`; a hand-written
  symbol violates Lot 1's decisions D-29/D-30 (not the D-numbers in this document).
- **D-44**: **Single tenant** — one trainer, one organisation, one catalogue. No tenant
  scoping, no organisation table, no per-tenant keys.
- **D-45**: **No price appears on the public site in this lot.** Formulas, prices, orders
  and invoices are Lot 7, and `CADR-02` (payment provider) is deferred to Lot 7 by a
  reaffirmed founder decision — **no provider may be named in code**.

### Process constraints

- **D-46**: **Atomic commits**, `STATE.md` updated, all work on the **current branch**.
- **D-47**: ⛔ **Never `git push`.** Publishing `main` in `ElearningAriba` is a Vercel
  production deploy and belongs to the CIO alone.
- **D-48**: Ship green: `tsc` 0, `eslint` 0, `next build` 0, and the mock guard still
  exits 1 on an unresolved client-dependent key.
- **D-49** (2026-09-01, founder): "Pour qui" moves to intention cards — a
  first-person accroche (`content_item.donnees.accroche`, jsonb, no
  migration) is the card headline, the five signed profile names move to the
  card footer as a `/programme` link label, and the section tone flips to
  `band` (Competences flips to `default` to preserve alternation). Two
  reference screenshots (`Screenshot 2026-09-01 083648.png`/`083656.png`) set
  direction only, not authority — see `D-50` and the AA contrast note below
  for the two measured departures. The description originally revealed on
  hover via a two-block inverse-grid technique that reserved constant card
  and row height; **replaced 2026-09-01 (founder)** with a dynamic height —
  compact at rest, expanding on hover/focus, row and downstream content shift
  with it — after measuring 114–116px of dead space under the footer at rest
  (35–36% of card height). Reveal duration also slows from `--duration-base`
  (220ms) to a dedicated `--duration-reveal` (450ms) token for this gesture
  only; `--duration-base` is unchanged for its other consumers.
- **D-50** (2026-09-01, CTO): extends `D-05`'s token set with `--blue-ink`
  (`#3472d8`), `--mint-ink` (`#158568`), `--amber-ink` (`#996c29`) — measured,
  not an oversight: `--blue`/`--mint`/`--amber` fail WCAG AA as ink-on-white-card
  (3.68 / 2.16 / 1.77 against the 4.5 threshold) while these darkened variants
  pass (4.62 / 4.58 / 4.63). Rule going forward: an accent token may decorate a
  large/decorative surface (pastille fill, wash tint) at any ratio; card body
  ink must come from an AA-passing token. Also records the reference's second
  departure: cards link to `/programme`, not to a non-existent per-domain page
  (Lot 11+, unsold).
- **D-51** (2026-09-01, founder): "Ce que vous allez apprendre" passe des
  sujets aux **résultats** : six intitulés verbe-en-tête, chacun avec une
  phrase portée par `content_item.description`, sans pastille numérotée. La
  liste signée est rétablie à l'identique — « catalogues, contrats et
  workflows » regroupés en une compétence, « préparer la certification SAP
  Ariba » rétablie comme sixième. Motif : les six intitulés redisaient les
  cinq modules du Programme un pour un, et l'item signé de certification
  n'existait nulle part sur le site. La promesse reste celle de l'offre —
  préparer, jamais garantir. **La `cle` du premier item est porteuse** : le
  H1 du héros y prend son mot de repos.
- **D-52** (2026-09-01, founder): le seed **retire nominativement** les
  lignes de contenu retirées. `upsertItems` clé sur `(section_cle, cle)` et
  ne supprime jamais : sans retrait explicite, une ligne retirée du JSON
  survit à chaque re-seed et se rend encore. Retrait ligne par ligne sur les
  deux colonnes, jamais en masse sur `section_cle`.
- **D-53** (2026-09-01, founder): **le mur chromatique.** La section
  abandonne l'objet « pastille + titre + phrase sur carte claire », déjà
  porté par Pour qui, Format et modalités et Confiance : six tuiles pleines,
  une teinte par compétence, lavage plafonné à 30 %, filigrane du pictogramme
  coupé par le bord, filet d'accent à pleine saturation qui **se trace au
  défilement**. Deux règles mesurées en font partie : **`--muted-ink` est
  interdit sur ces lavages** (échec AA dès 16 % sur le violet et le bleu —
  titre en `--ink`, phrase en `--ink-soft`), et **l'ordre des teintes est
  calculé** pour que violet/indigo et bleu/ciel ne soient jamais adjacents,
  à aucune largeur.
- **D-54** (2026-09-01, founder): la courbe unique du site passe de
  `cubic-bezier(0.16, 1, 0.3, 1)` à `cubic-bezier(0.22, 0.61, 0.36, 1)`, et
  l'entrée `.reveal` passe de 1s en dur à `--duration-entrance: 700ms`.
  Motif : la courbe expo-out plaçait 49 % du mouvement dans les 10 premiers
  pour cent du temps — sur les 34px de `.reveal`, 22px étaient parcourus en
  150ms et les 12px restants étalés sur 850ms, ce que l'œil lit comme un
  saut suivi d'une immobilité, pas comme un mouvement. Allonger la durée
  aggrave le défaut ; seule la courbe le corrige. `D-17` tient : une seule
  courbe sur le site, dont la valeur a changé. `--duration-reveal` (450ms,
  `D-49`) reste distinct — il porte le dépliement « Pour qui » et le tracé
  du filet, pas l'entrée.
- **D-55** (2026-09-01, founder + CTO): `--duration-entrance` passe à
  **950ms**, et le filigrane des tuiles de compétence cesse de se déplacer
  au survol : il ne lui reste qu'une éclosion d'opacité 0,18 → 0,26 portée
  par `--duration-reveal`. Motif, en deux temps. La durée : 700ms se lisait
  pressé une fois la courbe adoucie, parce que sous easeOutCubic la durée
  entière est du mouvement perçu. Le filigrane : la tuile monte de 2px
  pendant que son propre filigrane descendait de 6px — vecteurs opposés qui
  décollent l'icône de sa carte — et l'élément étant coupé par le bord de la
  tuile, tout déplacement le pousse hors cadre et lui fait changer de
  silhouette en cours de mouvement. Règle retenue : ce qui est grand bouge
  peu et lentement. Le décalage d'icône de 3px de `pour-qui.tsx` reste
  valide — petit élément, un seul axe, aucun bord qui le coupe.
- **D-56** (2026-09-01, founder + CTO): l'accordéon Programme rend, sous le
  résumé de chaque module, les puces `donnees.contenu` sous un libellé
  « Au programme » ; les `objectifs` restent sur `/programme` parce que la
  section 3 porte désormais les résultats. Le CTA « Télécharger le
  programme en PDF » est rétabli sur la landing en lisant son libellé
  depuis la section `page-programme` : la ligne `telecharger-pdf` n'a pas
  de `duree_heures`, et `getModules()` refuse la section entière si un de
  ses items en manque — la loger dans `programme` rendrait l'état
  d'erreur. Sa requête reste **hors de la garde d'erreur** : son échec
  masque le bouton, il ne blanchit pas la section.
- **D-57** (2026-09-01, founder + CTO): la section Format rend le `deroule`
  réel de cinq étapes lu depuis `page-formation`, avec un aperçu par étape
  dans le cadre de fenêtre du héros, cinq mises en page distinctes, et « Ce
  qui est fourni » en bande sous les deux colonnes. Les six « repères »
  cessaient de décrire une séquence : ils étaient numérotés `01→06` avec une
  barre de progression alors que « Prérequis » y était l'étape 06 et
  « Vidéos à venir » — non livré — l'étape 03. L'aperçu de l'étape 03 est un
  wireframe abstrait : aucune reprise de l'habillage de SAP Ariba sur une
  page marchande.
- **D-58** (2026-09-01, CTO): `--sky-ink: #0f7ea6` rejoint `--blue-ink` /
  `--mint-ink` / `--amber-ink`. Les pastilles numérotées passent du dégradé
  à l'aplat : seuls `--violet` (4,70), `--deep` (6,29), `--blue-ink` (4,62),
  `--sky-ink` (4,61) et `--mint-ink` (4,58) portent un chiffre blanc à AA ;
  `--sky` et `--mint`, utilisés jusqu'ici, étaient mesurés à 2,14 et 2,16.
  Le glyphe de coche passe à `--mint-ink` (2,16 → 4,58) et les numéros
  inactifs du stepper à `--muted-ink` (3,02 → 5,41).
- **D-59** (2026-09-01, fondateur): la tuile « Gestion des catalogues » passe
  de `--indigo` à `--rose` (#c2185b). Le mur chromatique portait deux teintes
  quasi-jumelles ; le rose les sépare. L'accent y est purement décoratif —
  bordure 22 %, lavis 30 % dégradé vers blanc, filigrane 18 %, filet 3 px —
  et ne passe jamais sous du texte : le titre (`--ink`) et la description
  (`--ink-soft`) mesurent 9,26 et 7,20 sur le lavis rose à pleine opacité de
  survol, contre 9,23 et 7,18 avec l'indigo. Le rose de 26academy (#EC4899)
  a été écarté : 3,53 en blanc-sur, sous la barre AA. Le rose s'écarte une
  seconde fois de CADR-05 (« palette bleu / blanc / vert »), après le violet
  de D-02, sur décision du fondateur.
- **D-60** (2026-09-01, fondateur): la tuile « Tenir catalogues, contrats et
  workflows » repasse de `--rose` à `--indigo` (#4338ca). Le rose lisait
  « girly » pour le fondateur ; mesuré sur le rendu, il n'existait qu'à cinq
  éléments de toute la page, tous dans cette tuile et son pictogramme. Le
  mur devient violet, blue, mint, amber, indigo, sky : six teintes
  distinctes, aucun rose. L'objection du D-59 — indigo quasi-jumeau du
  violet — tombe maintenant que `--sky` occupe la sixième tuile et que les
  tuiles 1 et 5 ne sont jamais adjacentes dans la grille à trois colonnes.
  `--rose` sort de la palette : un jeton mort dont la justification est
  périmée est un piège pour le prochain lecteur. #4338ca porte un glyphe
  blanc en AA, contrairement à `--sky`, `--mint` et `--blue` (mesurés 2,14 /
  2,16 / 3,68 au D-57), donc la pastille pictogramme reste conforme.
- **D-61** (2026-09-01, fondateur): les emplacements « Témoignages » et
  « Entreprises » sont retirés du rendu et des données semées.
- **D-62** (2026-09-01, fondateur + CTO): les trois faits deviennent
  vérifiables — appel découverte gratuit 30 min, formateur nommé avec
  parcours consultable, groupe plafonné à un nombre. « Protection des
  données » et « Contenus régulièrement mis à jour » quittent la landing.
- **D-63** (2026-09-01, fondateur + CTO): l'encart photo 16/9 en pointillés
  est remplacé par une carte formateur composée en code. Aucune photo n'est
  sourcée ; `public/` ne contient aucune image matricielle. La pastille de
  monogramme est le seul emplacement du portrait futur.
- **D-64** (2026-09-01, fondateur + CTO): mécanisme « fait → preuve » — un
  clic sur une carte échange sa moitié basse entre description et preuve.
  Hauteur de carte fixe, aucun décalage de mise en page, même comportement
  au clavier et au toucher.
- **D-65** (2026-09-02, fondateur): la règle de décalage zéro du D-64 est
  levée. Les cartes de fait de la section Confiance passent à une hauteur
  animée : repliée la hauteur de la description, dépliée celle de la
  preuve. Motif mesuré : la réserve permanente coûtait 90 px par carte,
  payés trois fois sur mobile, et faisait grossir la section de 1567 à
  1683 px malgré la suppression de 461 px d'encarts en pointillés. Le
  décalage à l'ouverture est accepté parce que l'accordéon Programme
  (D-56) le produit déjà.

### Claude's Discretion

- Table and column naming for the new Supabase content tables, and how many tables vs.
  a single typed content table.
- File/module organisation of the client motion islands, and which island owns which
  effect.
- Rate-limit storage mechanism and window/threshold values for D-35 (must be
  dependency-free per the "no third party" constraint).
- PDF generation technique for `/programme.pdf`, provided the data comes from the same
  rows the page reads (D-29).
- Wave/plan decomposition and commit granularity, within D-46.
- Zod schema shapes at the boundaries (per CLAUDE.md), and queryKeys factory usage.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### The visual contract — read this first
- `C:/Users/Essakhi/Desktop/ElearningSAP/ariba-cto/notes/2026-08-29-maquette-lot2-landing-validee.html` — the founder-approved Lot 2 landing maquette, self-contained HTML. **Authority where anything else disagrees.**

### The brief and its background
- `C:/Users/Essakhi/Desktop/ElearningSAP/ariba-cto/notes/2026-08-29-brief-phase-2-site-public.md` — source PRD for this context
- `C:/Users/Essakhi/Desktop/ElearningSAP/ariba-cto/notes/2026-08-29-les-maquettes-lot-1-sont-insuffisantes.md` — why the criteria are applied outcomes, not presence checks

### Signed scope
- `reference/Offre_1_Essentiel.pdf` — the single scope reference; where anything disagrees, the PDF wins
- `.planning/REQUIREMENTS.md` — PUB-01 … PUB-13, plus `GOL-02` (Lighthouse ≥ 90 mobile), `CADR-05` (palette, superseded for this lot by D-02), `CADR-02` (payment provider, deferred to Lot 7)
- `.planning/ROADMAP.md` — Phase 2 goal and success criteria
- `CLAUDE.md` — project rules: no `any`, no hardcoded strings, French locale keys, atomic commit format

### Signed content — the seed source, never re-authored
- `src/locales/fr/landing.json` — hero, pourQui, competences, programme, formatModalites, confiance, faq, ctaFinal
- `src/locales/fr/common.json` — nav, footer, actions
- `src/locales/fr/emails.json` — the two signed contact emails
- the per-page bundles in `src/locales/fr/`

### Existing code this lot must reuse, not fork
- `src/app/globals.css` — the four shadow tiers, the single easing token, the fluid type scale and spacing scale from Lot 1 (`--shadow-4` currently consumed nowhere)
- `src/lib/i18n/fr.ts` — pins `fr-FR` / `Europe/Paris`, exports the only permitted formatters
- the Lot 1 Card family (`variant="raised"`, used zero times in eleven routes) and Button family
- the four Lot 1 surface-state components (loading, empty, error, success)
- the mock registry guarding 60 client-dependent keys, exiting 1 on an unresolved one (deliberately outside CI)

### Database
- `supabase/migrations/20260827131029_init_schema.sql` — Phase 0 schema, applied to production and preview. The new migration is strictly additive.
</canonical_refs>

<specifics>
## Specific Ideas

### The seven landing sections, in order (named in the offer — the gate criterion)

1. **Hero** — accroche, sous-titre, CTA « Démarrer ma formation », CTA secondaire
   « Voir le programme », visuel principal, emplacement vidéo prêt
2. **Pour qui est cette formation ?** — the five profils + « même sans expérience SAP »
3. **Ce que vous allez apprendre** — the six compétences
4. **Programme détaillé** — the five modules in an accordion + bouton PDF
5. **Format et modalités** — the six repères
6. **Confiance et sécurité** — the three faits + emplacements témoignages / logos
7. **CTA final et FAQ** — sept questions

### Verified facts, checked 2026-08-29

- Lot 1 is complete and green on `4f44f71`: `tsc` 0, `eslint` 0, `next build` 0, eleven
  routes prerendered static. **Nothing pushed.**
- 26academy's tokens, motion and section structure were read from source on 2026-08-29
  (`https://26academy.com/`, inline `:root` and `/assets/v2/home.css`). Their accent is
  `#635BFF`; their `theme-color` meta is `#4837F5`.
- The header's « Connexion » and « Prendre RDV » are links to routes whose shells exist
  from Lot 1. **This lot adds no auth logic.**

### Acceptance criteria — applied outcomes, not presence checks

1. The surface map is verifiable **section by section**: **niveau 1** on
   compétences, the programme and FAQ accordions, and the Format parcours rows;
   **niveau 2** on the Pour-qui tiles, the Confiance tiles, and the parcours' side
   frame; **niveau 3** on **exactly two persistent surfaces** page-wide (hero
   assembly card, CTA-final console frame) — the ceiling counts rendered
   elements that carry the niveau-3 rest/hover treatment (raised Card variant
   or an equivalent hand-styled surface), not a `Button` primary variant's
   `hover:shadow-[var(--shadow-4)]` hover micro-interaction, which is excluded
   from the count. The criterion is the **ceiling on niveau 3** (max 2), not a
   floor on total card count.
2. `--shadow-4` appears in the **compiled CSS output** — consumed by the hero visual
   frame and the final CTA — not only declared in `globals.css`.
3. The atmosphere layer is behind **all seven** landing sections, verifiable by mounting
   it once at the root rather than per section.
4. A search of the codebase for `cubic-bezier` returns **exactly one distinct value**. A
   search for `ease-in`, `ease-out` or `linear` on a `transition` or `animation` returns
   nothing.
5. The H1 cycles the six signed competencies at the measured timings, the headline never
   reflows while cycling, and the whole word is restored after a tab switch.
6. The header is blurred at rest and deepens on scroll.
7. Under `prefers-reduced-motion: reduce`: the H1 shows a complete word, the spotlight is
   absent, the mesh is static, reveals are visible.
8. Each of the seven sections opens eyebrow → two-sentence H2 → lead.
9. A visitor sends a contact message: it is stored, the trainer receives the signed
   notification, the prospect receives the signed acknowledgement, and a honeypot
   submission is rejected without sending either.
10. No public page reads `src/locales/fr/landing.json` at runtime — every module,
    competency, profile, format item and FAQ entry is read from Supabase. `PUB-13` is
    provable by **deleting a row and seeing the page change**.
11. `/programme.pdf` renders the five modules and their durations from the same rows the
    page reads.
12. Every page is reachable in two clicks; the footer is complete.
13. `tsc` 0, `eslint` 0, `next build` 0, and the mock guard still exits 1 on an
    unresolved client-dependent key.
</specifics>

<deferred>
## Deferred Ideas

- Per-section cursor-reactive backgrounds — more than the reference does, endangers
  `GOL-02` (D-17).
- RGPD deletion/export path for contact messages — Lot 5 (D-37).
- Prices, sale formulas, payment provider selection — Lot 7 (D-45).
- SEO, meta, structured data, legal pages, deployment — Lot 5.
- Dark theme, second locale, CMS, analytics — not sold, not built.
- Lots 11–18 (Business, Premium) — unsold.
</deferred>

---

*Phase: 02-site-public*
*Context gathered: 2026-08-29 via PRD Express Path*
