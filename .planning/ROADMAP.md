# Roadmap: Formation SAP Ariba — plateforme de réservation live

## Milestone

**`v1 — Essentiel`** — the whole signed scope, Offre 1 "Essentiel", lots 1–10.

One milestone, not ten. A lot is a payment gate inside this version, not a
shipped version of its own. The milestone closes when Lot 10 is accepted.

## Overview

The journey runs from an empty repository to an operational live-training
platform. Phase 0 stands up the technical foundation the offer's stack
prescribes. Phases 1 to 10 map one-to-one onto lots 1 to 10 of the signed
offer: framing and design, then the public site, then accounts, then the
agenda — at which point the site goes live at Phase 5 with SEO, legal pages,
GDPR and deployment. The remaining phases deploy onto the live site without
service interruption: group sessions, online payment, Google Calendar
synchronisation, attendance and certificates, and finally the administration of
users and business content. Each phase is autonomous and produces a visible,
usable result; each is accepted by the client on its own before the next one
starts.

**Phase N = Lot N for phases 1–10.** That mapping is the traceability that lets
a delivered phase be matched to a payment gate with no interpretation.

## Phases

**Phase Numbering:**

- Integer phases (0, 1, 2, …): planned milestone work
- Decimal phases (2.1, 2.2): urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 0: Socle technique et environnement** - Next.js, Supabase, Vercel preview and the local environment stood up
- [x] **Phase 1: Cadrage, contenus et design** - Lot 1 — framing decisions, French copy, visuals, design system, validated mockups (completed 2026-08-29)
- [ ] **Phase 2: Site public** - Lot 2 — landing page in seven sections, internal pages, contact form, navigation
- [ ] **Phase 3: Comptes, connexion et espace apprenant** - Lot 3 — accounts, Google sign-in, learner space, data isolation, GDPR rights
- [x] **Phase 4: Agenda et prise de rendez-vous** - Lot 4 — availabilities, public agenda, three-screen booking, agenda back-office (completed 2026-09-04)
- [ ] **Phase 5: SEO, pages juridiques, RGPD et mise en ligne** - Lot 5 — the site goes live on its domain, indexable, legal and compliant
- [ ] **Phase 6: Sessions live de groupe** - Lot 6 — group sessions, public listing, enrolment, seat management
- [ ] **Phase 7: Paiement en ligne, formules et factures** - Lot 7 — hosted payment, four sale formulas, orders, invoices
- [ ] **Phase 8: Synchronisation Google Calendar** - Lot 8 — two-way trainer sync, learner-side events, Google app verification
- [ ] **Phase 9: Présence, progression et attestations** - Lot 9 — attendance sheets, self check-in, progression, PDF certificates
- [ ] **Phase 10: Administration des utilisateurs et des contenus** - Lot 10 — user administration, editable business content, overview, email log

## Phase Details

### Phase 0: Socle technique et environnement

**Goal**: Stand up the technical foundation prescribed by the offer's "Socle technique", so that every following phase has a running application, a database, and a deployable preview.
**Depends on**: Nothing (first phase)
**Requirements**: SOCLE-01, SOCLE-02, SOCLE-03, SOCLE-04, SOCLE-05
**Payment gate**: None — this phase carries no lot.
**Effort**: Carries no lot and no payment gate of its own; its effort sits inside the signed 28,5 j and is accounted against Lot 2 — Site public, whose deliverable cannot exist on the contractual stack without the application, the database and the deployment target this phase stands up.
**Success Criteria** (what must be TRUE):

  1. The Next.js (React, TypeScript) application starts locally with server-side rendering, from a documented setup
  2. A Supabase project is provisioned with database, authentication and file storage, and its schema is under versioned migrations in the repository
  3. Pushing a branch produces a Vercel preview deployment reachable over HTTPS
  4. Environment variables are separated per environment and no secret is committed
  5. Lint, type-check and build run automatically and block a broken merge

**External dependencies - closed 2026-08-28**: success criterion 3 is met. The Vercel project `elearning-ariba` is connected and preview-per-branch is confirmed — deployments `17a58cd` and `f399aec` both succeeded over HTTPS. Criterion 2's hosted Supabase is provisioned in `eu-west-3` (Paris) as two projects, production and preview, and `20260827131029_init_schema.sql` is applied to both with its version recorded in each migration history. Two limits stay open and belong to later lots rather than to this phase: every deployment URL sits behind Vercel SSO (`all_except_custom_domains`), so no automated check reaches a built page yet; and no production deployment exists until this branch merges to `main`.

**Plans**: 6 plans

Plans:
**Wave 1**

- [x] 00-01-PLAN.md — Next.js application, French / Europe-Paris defaults, Tailwind v4 + shadcn/ui toolchain

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 00-02-PLAN.md — Per-environment variables, no committed secret, Zod validation failing loudly at boot

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 00-03-PLAN.md — Supabase local stack via Docker and the migration mechanism proven end to end
- [x] 00-04-PLAN.md — Automated lint / type-check / build gate on pull requests, and the delivery flow

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 00-05-PLAN.md — Generated database types and Supabase client wiring driven by the validated environment

**Wave 5** *(blocked on Wave 4 completion)*

- [x] 00-06-PLAN.md — Hosting-consumable repository shape, fresh-clone README, external-dependency handover

### Phase 1: Cadrage, contenus et design

**Goal**: Lot 1 — settle the positioning and the sale formulas, write every French text, prepare the visuals, define the design system, and get the mockups validated by the client before any integration.
**Mode**: mvp
**Depends on**: Phase 0
**Requirements**: CADR-01, CADR-02, CADR-03, CADR-04, CADR-05, CADR-06
**Payment gate**: à validation des maquettes
**Success Criteria** (what must be TRUE):

  1. The framing decisions are recorded — positioning, commercial promise, sale formulas, page hierarchy, priorities
  2. The payment provider is chosen and recorded, so its account verification can be started
  3. Every French text exists — accroches, bénéfices, descriptions de modules, FAQ, form labels, automatic email content
  4. The design system exists with the bleu / blanc / vert palette, typography, spacing scale and components with their states
  5. The client has validated the mockups for the landing page, the internal pages, and every screen of the full journey — inscription, connexion, agenda, réservation, paiement, espace apprenant

**Plans**: 12 plans in 5 waves

Plans:

- [x] 01-01-PLAN.md — Exploration — two or three throwaway visual directions outside src/, typography settled
- [x] 01-02-PLAN.md — Design tokens, typography wiring, atmosphere layer and motion primitives
- [x] 01-03-PLAN.md — French copy for the shared chrome and the five public screens
- [x] 01-04-PLAN.md — French copy for the six journey screens, incl. the four surface states
- [x] 01-05-PLAN.md — Component families: CTA buttons, cards, badges, and the shared Message part
- [x] 01-06-PLAN.md — Component families: accordions and form fields, plus the four surface-state components
- [x] 01-07-PLAN.md — Pictograms and the presentational header and footer, mounted in the root layout
- [x] 01-08-PLAN.md — Automatic email copy, the mock-content guard, and the framing record
- [x] 01-09-PLAN.md — Maquette: landing, its seven signed sections and the prepared video slot
- [x] 01-10-PLAN.md — Maquettes: programme, formation, à propos, contact
- [x] 01-11-PLAN.md — Maquettes: inscription, connexion, espace apprenant
- [x] 01-12-PLAN.md — Maquettes: agenda, réservation, paiement, and the two missing formatters

### Phase 2: Site public

**Goal**: Lot 2 — deliver the public site that sells the training: the landing page in its seven sections, the internal pages, a working contact form, and navigation that reaches any page in two clicks.
**Mode**: mvp
**Depends on**: Phase 1
**Requirements**: PUB-01, PUB-02, PUB-03, PUB-04, PUB-05, PUB-06, PUB-07, PUB-08, PUB-09, PUB-10, PUB-11, PUB-12, PUB-13
**Payment gate**: à la recette des pages
**Success Criteria** (what must be TRUE):

  1. A visitor can read the landing page and finds all seven sections — Hero, Pour qui, Ce que vous allez apprendre, Programme détaillé, Format et modalités, Confiance et sécurité, CTA final et FAQ
  2. A visitor can read the Programme, Formation and À propos pages
  3. A visitor can send a message from the Contact page; it is stored, the trainer is notified immediately, the prospect receives an acknowledgement, and spam is blocked
  4. A visitor can reach any page in two clicks through the navigation menu, and the footer is complete
  5. No module, price or asset on the public site is hardcoded — all of it comes from the database

**Plans**: 11 plans in 6 waves

Plans:

- [x] 02-01-PLAN.md — Design tokens, floating cards, banded sections and the single easing curve
- [x] 02-02-PLAN.md — Content and contact tables with RLS, cookieless read client, typed queries, idempotent seed
- [x] 02-03-PLAN.md — Root atmosphere layer, mesh drift and the scroll reveal island
- [x] 02-04-PLAN.md — Blurred header deepening on scroll, scroll progress, complete footer, two-click navigation
- [x] 02-05-PLAN.md — Hero and figures band from the database, with typewriter, spotlight and magnetic motion
- [x] 02-06-PLAN.md — Programme, Formation and À propos pages read from the database
- [x] 02-07-PLAN.md — Contact form end to end: validation, anti-spam, storage and the two emails
- [x] 02-08-PLAN.md — /programme.pdf generated from the module rows, no new dependency
- [x] 02-09-PLAN.md — Landing sections: Pour qui, Ce que vous allez apprendre, Programme détaillé
- [x] 02-10-PLAN.md — Landing sections: Format et modalités, Confiance et sécurité, CTA final et FAQ
- [ ] 02-11-PLAN.md — Applied-outcome audit, founder recette and phase close

### Phase 3: Comptes, connexion et espace apprenant

**Goal**: Lot 3 — make the learner account the spine: sign-up, secure sign-in including Google, a profile, a learner space, gated access to supports, and the GDPR rights the offer promises.
**Mode**: mvp
**Depends on**: Phase 2
**Requirements**: CPT-01, CPT-02, CPT-03, CPT-04, CPT-05, CPT-06, CPT-07, CPT-08, CPT-09
**Payment gate**: à la recette des comptes
**Success Criteria** (what must be TRUE):

  1. A visitor can create an account with email and password, verify their address, and reset a forgotten password; repeated attempts are throttled
  2. A visitor can sign in with a Google account in one click
  3. A learner can fill their profile and see their space — prochains rendez-vous et sessions, historique, documents, factures, avancement — with honest empty states where a later lot fills the surface
  4. An enrolled learner can download a support through a signed, time-limited link that cannot be shared
  5. A learner cannot technically read another learner's data, enforced at the database level, and can request account deletion and a data export

**Plans**: 11 plans

Plans:
**Wave 1**

- [x] 03-01-PLAN.md — Grouped Lot 3 schema: profile identity anchor, support grants, deletion requests, RLS with a negative isolation proof
- [x] 03-02-PLAN.md — Auth configuration joins the signed copy: password rule, address confirmation, native rate limits, French Auth emails, Google provider, private bucket
- [x] 03-03-PLAN.md — The new French copy, the checkbox primitive, the auth shell and submit button, and the two validation boundaries

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 03-04-PLAN.md — The session spine: middleware, session read, auth callback, sign-out, the espace gate and its nav band

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 03-05-PLAN.md — Sign-up with email verification, end to end
- [x] 03-06-PLAN.md — Sign-in with password and with Google, throttled, plus the deferred redirect-URL check
- [x] 03-07-PLAN.md — Password reset: request without enumeration, then a new password
- [x] 03-08-PLAN.md — The learner space with its real first name, and signed short-lived support downloads
- [x] 03-09-PLAN.md — The profile surface, and the CPT-04 identity invariant

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 03-10-PLAN.md — RGPD: data export and a two-step account-deletion request

**Wave 5** *(blocked on Wave 4 completion)*

- [ ] 03-11-PLAN.md — Clean-state re-verification, the honest per-requirement record, the CIO handoff and the two founder gates

### Phase 4: Agenda et prise de rendez-vous

**Goal**: Lot 4 — deliver the primary conversion: a public agenda backed by a real availability model, a three-screen booking flow from the learner account, and an agenda back-office for the trainer.
**Mode**: mvp
**Depends on**: Phase 3
**Requirements**: AGD-01, AGD-02, AGD-03, AGD-04, AGD-05, AGD-06, AGD-07, AGD-08, AGD-09
**Payment gate**: à la recette de l'agenda
**Success Criteria** (what must be TRUE):

  1. A visitor sees a monthly calendar and a list of free slots, in Europe/Paris, with past, blocked or taken slots automatically greyed out
  2. A learner books an appointment in three screens from their account — type, slot, confirmation — and two learners cannot take the same slot
  3. The learner receives a confirmation email with a `.ics` file, and the trainer is notified immediately
  4. The trainer can define weekly hours, open, grey out or block ranges, set holidays, and view, move, cancel, create on a learner's behalf, or export reservations
  5. A reservation carries an order/confirmation state that is inert until Phase 7 activates it, so the payment rule can be switched on without rewriting the booking flow

**Plans**: 9 plans

Plans:
**Wave 1**

- [x] 04-01-PLAN.md — Availability and reservation model, the exclusion-constraint lock, the read and write RPCs, applied migrations and regenerated types

**Wave 2** *(blocked on Wave 1)*

- [x] 04-02-PLAN.md — Idempotent agenda seed (administrator, appointment types, typical week, French holidays) and the free-slot expansion proofs

**Wave 3** *(blocked on Wave 2)*

- [x] 04-03-PLAN.md — Public `/agenda`: static shell, client availability island, monthly grid, slot list, three-state legend *(Tasks 1-2 complete and committed; Task 3, the D-26 blocking founder visual review, is pending — see 04-03-SUMMARY.md)*

**Wave 4** *(blocked on Wave 3, run in parallel)*

- [x] 04-04-PLAN.md — Booking commit: video-link env var, `.ics` builder, Resend attachments, the POST route and the `.ics` download
- [x] 04-06-PLAN.md — `/admin` shell with the role gate, weekly hours, range exceptions and the holiday calendar

**Wave 5** *(blocked on Wave 4, run in parallel)*

- [x] 04-05-PLAN.md — The three booking screens, the success surface and the learner's appointments in `/espace`
- [x] 04-07-PLAN.md — Admin reservation RPCs (move, cancel, book on behalf) and the French-Excel CSV export

**Wave 6** *(blocked on Wave 5)*

- [x] 04-08-PLAN.md — `/admin/reservations`: the table, per-row move and cancel, create-on-behalf and the export panel

**Wave 7** *(blocked on Wave 6)*

- [x] 04-09-PLAN.md — `/admin/types-de-rendez-vous`: per-type edit of label, duration, buffer and price, PATCH-only write path, no create, no delete

### Phase 5: SEO, pages juridiques, RGPD et mise en ligne

**Goal**: Lot 5 — put the site online on its own domain, indexable, fast, responsive, legally covered and GDPR-compliant, and hand the back-office over to the client. This is go-live, and it sits mid-scope on purpose: the site cannot collect accounts and payments without it.
**Mode**: mvp
**Depends on**: Phase 4
**Requirements**: GOL-01, GOL-02, GOL-03, GOL-04, GOL-05, GOL-06, GOL-07, GOL-08
**Payment gate**: à la mise en ligne
**Success Criteria** (what must be TRUE):

  1. The site is reachable on the client's domain over HTTPS, with the domain's transactional email authentication configured
  2. Every page carries its metadata, Open Graph and Twitter Card tags, and the site serves `sitemap.xml`, `robots.txt` and schema.org Organization and Course data over readable URLs
  3. The site scores Lighthouse ≥ 90 on mobile and displays correctly on mobile, tablet and desktop
  4. The five legal pages are published, and no tracker is set before the consent banner is accepted
  5. The client has accepted the site, received a one-hour back-office training and a written French guide, and the 30-day corrective warranty has started
  6. Later phases can be deployed onto the live site without service interruption

**Carried from Phase 0**: `next.config.ts` sets a repository-wide `X-Robots-Tag: noindex, nofollow` guard so the pre-launch placeholder cannot be indexed. Removing it is part of this phase's go-live — the site cannot appear in search results until it is gone.

**Carried from the ownership ruling of 2026-08-27**: the client owns neither the Supabase nor the Vercel account — both are created on the founder's account and stay there permanently, not transferred at go-live. This departs from Section 5 of the signed offer, which states these subscriptions are *« souscrits au nom du client pour qu'il en reste propriétaire »*. **That clause is dead and no plan may inherit it.** GOL-04's politique de confidentialité and GOL-07's handover documents and written French guide are the two deliverables that would otherwise describe a reality that does not exist — a factual defect inside a delivered, paid lot. Ending the engagement is a migration, not a handover, and the handover documents must say so. The offers are frozen: no corrected PDF will be issued, so a correction to the client is a letter or a side agreement citing the signed document. Do not plan around a re-issued offer.

**Carried from the content-gate ruling of 2026-09-04**: go-live is gated on `content:check`, and the fix is a step in `.github/workflows/ci.yml` — not a change to `scripts/check-mock-content.mjs`. The script already refuses: it exits 1 today, while `ci.yml` runs only `lint`, `typecheck` and `build`, so nothing invokes it. Wire the step and see it refuse on the remaining items before declaring the gate armed — a gate nobody has watched fail is not a gate. Re-measure the outstanding count at planning time instead of trusting a figure written here: it was 84 items (73 CADR-03, 11 CADR-01) on 2026-09-04 and moves as content lands. The registry covers six of thirteen content files, so the gate guards only what it declares.

**Carried from the public/app split ruling of 2026-09-08**: the app is split into two route groups, `(public)` and `(app)`. The public group carries `Header`, `Footer`, `ScrollProgress`, `RevealScope` and the `pt-[76px]` offset; the app group carries its own top bar. This refactor is not part of Lot 5 — it ships beforehand, once `02-11` closes — and Lot 5 inherits it rather than replanning it. The route groups change no URLs and owe no redirect on that account. Lot 5 adds a host `elearning.<domain>` mapped onto the `(app)` group by host rewrite in the middleware, and that host routing must fall back to path routing whenever the host is not the production one: Vercel preview deployments get generated hostnames and sit behind Vercel SSO, so host routing cannot be exercised there, and a split that does not fall back makes every preview untestable. The public/app boundary crosses the booking tunnel exactly once, and before any client state exists: `/agenda` stays public, while everything past slot selection is app-side — `/reservation/*`, `/connexion`, `/inscription`, `/mot-de-passe-oublie`, `/nouveau-mot-de-passe`, `/paiement`, `/espace/*`, `/admin/*`. This is a technical constraint, not a cosmetic one — the D-28 detour keeps the retained slot in `sessionStorage`, which is scoped to the origin, so an origin jump mid-tunnel silently loses the state, and this tunnel has already broken once in production. `NEXT_PUBLIC_SITE_URL` is today a single value inlined at build time by `next.config.ts`; Lot 5 must split it into a canonical/marketing URL and a separate auth origin that is the app host, and every auth redirect (`src/app/api/auth/google/route.ts`, `src/app/api/auth/inscription/route.ts`, `src/app/api/auth/mot-de-passe/demande/route.ts`) must target the app origin. The Supabase redirect allow-list must carry the app host before any deployment: GoTrue silently falls back to `site_url` for an out-of-list redirect, and the PKCE verifier cookie is scoped to the host — both fail without an error message. `/admin` and `/espace` share the app host and each keep their own shell; no third host is created. The app group's header is 76px tall, matching the public header, and that is not a cosmetic choice — `AuthShell` (auth v2) is composed around that height (`min-height: calc(100svh - 76px)`, a `sticky top:76px` panel), and every `espace`/`admin` page inherits the same offset, so a different height reopens geometry already signed off. Two hosts mean a canonical/sitemap/robots story across two hosts, with the app host staying `noindex`; that specification belongs to the Head of SEO, not to Lot 5's planner. The domain name itself is not settled: `formation-sap-ariba.fr` has never been the subject of a recorded decision and did not resolve as of 2026-09-08 (NXDOMAIN, no NS delegation; registrar-side registration status remains for the CIO to confirm), yet it is asserted in nine delivered files, including the `from` address of production emails, the ICS `PRODID`, and two migrations that write `ics_uid` values of the form `…@formation-sap-ariba.fr` to the database. If the domain retained differs, the change is a data migration, not a configuration change. Founder decision of 2026-09-08: proceed without a domain; GOL-06 stays blocked on it.

**Plans**: TBD

### Phase 6: Sessions live de groupe

**Goal**: Lot 6 — open group live sessions: create and repeat them from the back-office, publish them, let learners enrol, and manage seats and cancellations.
**Mode**: mvp
**Depends on**: Phase 5
**Requirements**: SES-01, SES-02, SES-03, SES-04, SES-05, SES-06, SES-07
**Payment gate**: à la recette des sessions
**Success Criteria** (what must be TRUE):

  1. The trainer can create a session with its training and module, date, duration, seats, price, description and status, and can duplicate it or create a series
  2. A visitor sees the « Prochaines sessions » page — sorted, filterable by module and date, with remaining seats in real time and a « complet » badge
  3. A learner can enrol from their account, and two learners cannot both take the last seat
  4. The trainer sees the enrolled learners with their contact details and the fill rate, and can export CSV
  5. Cancelling or postponing a session emails every enrolled learner automatically
  6. A session enrolment carries the same inert order/confirmation state as a reservation, ready for Phase 7

**Carried from the client's cadrage answers of 2026-09-13**: the group offer is « Parcours de 6h, petit groupe » at 599 € HT, 6 participants maximum (§ 4.1, a configuration). Whether that is one 6-hour session or a series sold as one seat is unanswered (C-11). If it is a series, measure it against Lots 6 and 7 as signed before planning: the offer pays « une place … à l'inscription », and Lot 6 creates series without saying a series sells as one.

**Plans**: TBD

### Phase 7: Paiement en ligne, formules et factures

**Goal**: Lot 7 — turn bookings into revenue: hosted payment through the PCI-DSS certified provider, the four sale formulas, order statuses that gate confirmation, automatic invoices, and payment tracking in the back-office.
**Mode**: mvp
**Depends on**: Phase 6 (and, for the order seam, Phase 4; for the provider choice, Phase 1)
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, PAY-06, PAY-07, PAY-08, PAY-09, PAY-10
**Payment gate**: au premier paiement encaissé
**Success Criteria** (what must be TRUE):

  1. A learner pays on a page hosted by the provider, and no bank data transits or is stored on the site
  2. The four formulas work — the discovery call is free, an individual session is paid at booking, a group seat is paid at enrolment, and a « forfait » lets the learner book freely within its limits without paying again
  3. A reservation is confirmed only once payment is effectively confirmed by the provider, and the slot is released automatically when payment does not succeed
  4. A PDF invoice or receipt is generated automatically, emailed, and available in the learner space
  5. The trainer can set prices, formulas and promotional codes from the back-office, and can list, search and export orders and read the revenue collected over a period
  6. Cancelling frees the slot and notifies the learner; any refund is decided and executed by the trainer under the published refund policy

**Carried from the client's cadrage answers of 2026-09-13**: the forfait is bounded by 12 hours AND 6 months of validity (§ 2.5) where the offer says only « dans la limite de son forfait » — two bounds, verify the fit at planning. Whether the forfait covers group sessions is unanswered (C-10). Prices are the client's: 250 / 599 / 1 599 € HT, displayed TTC with HT mentioned (Ruling 21); rounded-TTC question open as C-13. Launch discount −10 % maximum, occasional promo codes only, no discount on individual sessions, enterprise on quote (§ 2.6). The 12 h forfait against a 10 h programme is open as C-12.

**Plans**: TBD

### Phase 8: Synchronisation Google Calendar

**Goal**: Lot 8 — connect the platform to Google Calendar: two-way on the trainer side, automatic on the learner side when they signed in with Google, `.ics` otherwise, with the application declared and verified with Google.
**Mode**: mvp
**Depends on**: Phase 7 (and, for the live homepage and hosted privacy policy Google's verification requires, Phase 5)
**Requirements**: GCAL-01, GCAL-02, GCAL-03, GCAL-04, GCAL-05, GCAL-06, GCAL-07, GCAL-08
**Payment gate**: à la recette de la synchronisation
**Success Criteria** (what must be TRUE):

  1. The trainer connects their Google account once from the back-office, and can reconnect in one click if the authorisation expires
  2. A busy event in the trainer's personal Google Calendar automatically greys out the matching slots on the site
  3. Every appointment and session appears in the trainer's Google Calendar with the learner's name, email and reason, and is updated or deleted automatically when moved or cancelled
  4. A learner who signed in with Google gets the event created, updated and removed in their own calendar with nothing to click; every other learner gets a `.ics` file on the confirmation email
  5. The application is declared and verified with Google — consent screen, minimal access scope, conforming privacy policy

**Plans**: TBD

### Phase 9: Présence, progression et attestations

**Goal**: Lot 9 — close the learner loop: record attendance, derive progression from it, show it to both sides, and issue the certificate automatically.
**Mode**: mvp
**Depends on**: Phase 8
**Requirements**: SUI-01, SUI-02, SUI-03, SUI-04, SUI-05, SUI-06
**Payment gate**: à la recette du suivi
**Success Criteria** (what must be TRUE):

  1. The trainer keeps an attendance sheet per session and per appointment, marking présent / absent / excusé with a free comment
  2. A learner can self-declare present through a code or link shown during the live session, and the trainer can always correct it
  3. A learner sees mes présences, mon avancement, mes prochaines échéances and the history of everything they attended
  4. The trainer sees the attendance rate per session, the learners falling behind and individual history, and can export CSV
  5. A PDF certificate is generated automatically above a configurable attendance threshold, carrying the learner's name, the training, the hour volume, the dates and a unique verifiable number

**Plans**: TBD

### Phase 10: Administration des utilisateurs et des contenus

**Goal**: Lot 10 — hand the platform over: full user administration, business content editable without development, an overview dashboard, an email log, and the final acceptance of the whole scope.
**Mode**: mvp
**Depends on**: Phase 9
**Requirements**: ADM-01, ADM-02, ADM-03, ADM-04, ADM-05, ADM-06, ADM-07
**Payment gate**: à la livraison du lot
**Success Criteria** (what must be TRUE):

  1. The trainer can search a learner and open a complete record — appointments, sessions, attendance, payments, documents — and can deactivate the account or reset its access
  2. The trainer can edit business content without development — programme modules, the programme PDF, the FAQ, prices and formulas
  3. The trainer can read and manage messages received through the contact form
  4. The trainer sees an overview — upcoming appointments and sessions, new enrolments, the month's payments, unread messages — and a log of sent emails with their delivery status
  5. The client has accepted the full scope after a final joint recette and the corrections are made

**Plans**: TBD

## Cross-phase dependencies

Facts from the signed offer, recorded so that a later phase does not rewrite an
earlier one. The dependency is recorded; the implementation is not chosen here.

| From | To | Why |
|---|---|---|
| Phase 4, Phase 6 | Phase 7 | The offer states *« La réservation n'est confirmée qu'après encaissement effectif »* and *« le créneau est libéré automatiquement si le paiement n'aboutit pas »*. Booking ships at Phase 4 and enrolment at Phase 6, payment at Phase 7 — so both need an order/confirmation seam that is inert until Phase 7 activates it. Without it, Phase 7 rewrites Phase 4. |
| Phase 3 | Phase 7, Phase 9 | Lot 3's espace apprenant is specified to show *« mes factures »* (Phase 7) and *« mon avancement »* (Phase 9). At Phase 3 these are honest empty states — not fake data, and not surfaces deferred to a later phase. |
| Phase 5 | Phase 8 | Lot 8 promises *« déclaration et vérification de l'application auprès de Google »*, which requires a live homepage and a hosted privacy policy — both produced by Phase 5. Google's review turnaround is outside our control, so submission should follow Phase 5 go-live rather than wait for Phase 8. `[ASSUMPTION]` on how long that takes; the dependency itself is a fact from the offer text. |
| Phase 1 | Phase 7 | The payment provider is chosen at cadrage — *« Stripe ou équivalent, choisi au cadrage »*. Provider account verification has its own lead time, so the choice must be recorded at Phase 1. |

## Progress

**Execution Order:**
Phases execute in numeric order: 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 0. Socle technique et environnement | 5/6 | In Progress|  |
| 1. Cadrage, contenus et design | 12/12 | Complete   | 2026-08-29 |
| 2. Site public | 10/11 | In Progress|  |
| 3. Comptes, connexion et espace apprenant | 10/11 | In Progress|  |
| 4. Agenda et prise de rendez-vous | 9/9 | Complete   | 2026-09-04 |
| 5. SEO, pages juridiques, RGPD et mise en ligne | 0/TBD | Not started | - |
| 6. Sessions live de groupe | 0/TBD | Not started | - |
| 7. Paiement en ligne, formules et factures | 0/TBD | Not started | - |
| 8. Synchronisation Google Calendar | 0/TBD | Not started | - |
| 9. Présence, progression et attestations | 0/TBD | Not started | - |
| 10. Administration des utilisateurs et des contenus | 0/TBD | Not started | - |

## Scope boundary

The signed offer stops at Lot 10. There is no Phase 11 and no future work
recorded in this roadmap. Anything not covered by the requirements above is out
of scope, not deferred — see `.planning/REQUIREMENTS.md` § Out of Scope.

Three scope questions the signed document does not answer are recorded, not
resolved, in `.planning/REQUIREMENTS.md` § Open scope questions. They need a
client answer before Phases 7 and 9 are planned.
