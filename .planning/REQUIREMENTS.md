# Requirements: Formation SAP Ariba — plateforme de réservation live

**Defined:** 2026-08-27
**Core Value:** The learner can book — and pay for — a real slot in the trainer's calendar, and the trainer sees it.

**Source of scope:** `reference/Offre_1_Essentiel.pdf`, signed 2026-08-26 — lots
1–10, 28,5 j, 1 500 €. Where anything below disagrees with the PDF, the PDF
wins. Nothing beyond Lot 10 is in scope.

Requirement categories map one-to-one onto the lots of the signed offer, so
that every requirement traces to a payment gate. `SOCLE` is the only category
with no lot: it is the technical foundation the lots are built on.

## v1 Requirements

### Socle — technical foundation (no lot)

- [x] **SOCLE-01**: The Next.js (React, TypeScript) application runs locally with server-side rendering and a documented setup
- [x] **SOCLE-02**: A Supabase project exists with database, authentication and file storage provisioned, and migrations are versioned in the repository
- [x] **SOCLE-03**: The repository is connected to Vercel and every branch produces a preview deployment over HTTPS
- [x] **SOCLE-04**: Secrets and environment variables are separated per environment and never committed
- [x] **SOCLE-05**: Lint, type-check and build run as an automated gate before merge

**Hosting dependencies - status at 2026-08-28.** SOCLE-02 and SOCLE-03 each have a repository half and a hosting half, and both halves of both are now delivered. Repository side: versioned migrations under `supabase/`, the typed Supabase clients, `vercel.json`, per-environment variables and the automated gate. Hosting side: the Vercel project `elearning-ariba` is connected and preview-per-branch is confirmed — deployments `17a58cd` and `f399aec` both succeeded and answer over HTTPS, which is SOCLE-03. Two Supabase projects exist in `eu-west-3` (Paris), production `toxegyhxdoxjuyijgemx` and preview `urmtwbcsqodjnwsnxcqd`, and `20260827131029_init_schema.sql` is applied to both, its version recorded in each project's migration history. The note that stood here said no Vercel project was connected and no migration had been applied; both were true on 2026-08-27 and are false now.

**Two limits recorded rather than glossed.** Vercel Deployment Protection is `all_except_custom_domains`, so every preview URL and the production URL answer `302` to Vercel SSO — a deployment is reachable over HTTPS, but no automated check, Lighthouse run or client demo reaches a built page until a protection-bypass secret exists. And no production deployment has ever succeeded: `main` carries no application, so `https://elearning-ariba.vercel.app` returns `DEPLOYMENT_NOT_FOUND` until this branch merges.

### Cadrage — Lot 1: cadrage, contenus et design

- [ ] **CADR-01**: The framing workshop output is recorded — positioning, commercial promise, sale formulas, page hierarchy, priorities
- [ ] **CADR-02**: The payment provider is chosen and recorded (Stripe ou équivalent), so provider account verification can start
- [ ] **CADR-03**: All French site copy is written — accroches, bénéfices, descriptions de modules, FAQ, libellés de formulaires, contenu des emails automatiques
- [ ] **CADR-04**: Visuals are selected and prepared — professional photography, SAP Ariba interface captures, pictograms
- [ ] **CADR-05**: A design system is defined — bleu / blanc / vert palette, typography, spacing scale, and components (contrasted CTA buttons, cards, badges, accordions, form fields) with their states
- [ ] **CADR-06**: Mockups are validated by the client before integration — landing page, internal pages, and every screen of the full journey (inscription, connexion, agenda, réservation, paiement, espace apprenant)

### Site public — Lot 2

- [ ] **PUB-01**: Visitor sees a Hero section — accroche title, explanatory subtitle, primary CTA « Démarrer ma formation », secondary CTA « Voir le programme », main visual and a ready video placeholder
- [ ] **PUB-02**: Visitor sees « Pour qui est cette formation ? » — the five target profiles with pictograms and the reassurance « même sans expérience SAP »
- [ ] **PUB-03**: Visitor sees « Ce que vous allez apprendre » — the six acquired competencies (écosystème Ariba, Procure-to-Pay, Source-to-Pay, appels d'offres RFQ/RFP, catalogues, contrats et workflows, préparation à la certification)
- [ ] **PUB-04**: Visitor sees « Programme détaillé » — the five modules in an accordion with estimated duration, and a button to download the programme as PDF
- [ ] **PUB-05**: Visitor sees « Format et modalités » — live training, PDF supports, videos to come, access duration, end-of-module practical cases, prerequisites
- [ ] **PUB-06**: Visitor sees « Confiance et sécurité » — data protection, certified SAP Ariba experts, regularly updated content, and ready placeholders for testimonials and company logos
- [ ] **PUB-07**: Visitor sees a final CTA and a FAQ of six to eight questions answering the most frequent objections
- [x] **PUB-08**: Visitor can read the Programme page — the five modules developed with pedagogical objectives, content and duration
- [x] **PUB-09**: Visitor can read the Formation page — format, modalities, the concrete run of a live session, what is provided
- [x] **PUB-10**: Visitor can read the À propos page — the trainer, their background, their SAP Ariba legitimacy
- [ ] **PUB-11**: Visitor can send a message from the Contact page (nom, email, téléphone, profil, message), it is stored in the database, the trainer is notified immediately, the prospect gets an acknowledgement, and the form is protected against spam
- [x] **PUB-12**: Every page is reachable in two clicks through a minimalist navigation menu, with a complete footer
- [ ] **PUB-13**: All public-site content comes from the database — no module, price or asset hardcoded

### Comptes — Lot 3: comptes utilisateurs, connexion et espace apprenant

- [x] **CPT-01**: Visitor can create an account with email and password, and must verify their email address
- [ ] **CPT-02**: Visitor can sign in with a Google account in one click — **bloquée** : aucun identifiant Google (client OAuth) n'existe encore ; `src/app/api/auth/google/route.ts` vise la même URL de callback que les parcours corrigés (`65dea14`/`3eee9bc`/`2a1b518`) ; la liste d'autorisation **hébergée** devra porter `https://<domaine>/api/auth/callback**`, faute de quoi Google échouera dès sa livraison.
- [x] **CPT-03**: Learner can reset a forgotten password, and repeated sign-in attempts are throttled
- [x] **CPT-04**: An account is required for every reservation, including the free discovery call — one identity, with the learner's whole history attached to their record
- [x] **CPT-05**: Learner can fill their profile — identity, contact details, professional profile (acheteur, consultant, étudiant, entreprise), communication preferences
- [x] **CPT-06**: Learner sees their space — mes prochains rendez-vous et sessions, mon historique, mes documents, mes factures, mon avancement — with honest empty states for the surfaces filled by later lots
- [x] **CPT-07**: Enrolled learners can download supports through signed, time-limited, non-shareable links
- [x] **CPT-08**: Roles are learner and administrator, and database-level isolation makes it technically impossible for a learner to read another learner's data
- [x] **CPT-09**: Learner can request deletion of their account and export of their data (GDPR)

### Agenda — Lot 4: agenda et prise de rendez-vous

- [ ] **AGD-01**: The data model holds recurring availabilities per day, exceptions, reservations, and handles the Europe/Paris timezone
- [ ] **AGD-02**: Visitor sees a public monthly calendar and a list of free slots, with past, blocked or already-taken slots automatically greyed out
- [ ] **AGD-03**: Administrator can configure appointment types — 30-minute discovery call, one-hour individual session — with configurable label, duration, buffer time and price
- [ ] **AGD-04**: Learner books in three screens from their account — appointment type, slot, confirmation
- [ ] **AGD-05**: Two learners cannot book the same slot, enforced by a transactional lock in the database
- [ ] **AGD-06**: Learner receives a confirmation email with a `.ics` file, and the trainer is notified immediately
- [ ] **AGD-07**: Administrator can define weekly working hours, open, grey out or block time ranges, and set holidays
- [ ] **AGD-08**: Administrator can view, move or cancel reservations, create an appointment on a learner's behalf, and export the list
- [ ] **AGD-09**: A reservation carries an order/confirmation state that is inert until Lot 7 activates it — so that the "confirmed only after effective payment / slot released if payment fails" rule can be switched on without rewriting the booking flow

### Mise en ligne — Lot 5: SEO, pages juridiques, RGPD et mise en ligne

- [ ] **GOL-01**: Every page carries technical SEO — per-page metadata, Open Graph and Twitter Card tags, `sitemap.xml`, `robots.txt`, schema.org structured data (Organization, Course), readable URLs and a coherent heading structure
- [ ] **GOL-02**: The site reaches Lighthouse ≥ 90 on mobile, with optimised modern image formats and deferred loading
- [ ] **GOL-03**: The site is responsive on mobile, tablet and desktop
- [ ] **GOL-04**: Five legal pages are published from compliant templates — termes et conditions / mentions légales, politique de confidentialité, politique de cookies, politique de remboursement, clause de non-responsabilité
- [ ] **GOL-05**: GDPR compliance is in place — consent banner, no tracker set before acceptance, minimised data collection, and a deletion-on-request procedure
- [ ] **GOL-06**: The domain name is connected, the site is in production with an HTTPS certificate and the domain's transactional email authentication configured
- [ ] **GOL-07**: The client accepts the site after a joint recette, receives a one-hour back-office training and a written French guide, and the 30-day corrective warranty starts
- [ ] **GOL-08**: Subsequent lots deploy onto the live site without service interruption

### Sessions live — Lot 6: sessions live de groupe

- [ ] **SES-01**: Administrator can create a session from the back-office — training and module concerned, date and time, duration, number of seats, price, description, status (brouillon / publiée / complète / annulée)
- [ ] **SES-02**: Administrator can duplicate a session or create a series (for example every Tuesday for six weeks)
- [ ] **SES-03**: Visitor sees a public « Prochaines sessions » page — sorted list, filters by module and by date, remaining seats in real time, « complet » badge
- [ ] **SES-04**: Learner can enrol in a session from their account, with the seat count decremented and concurrent enrolments on the last seat prevented
- [ ] **SES-05**: Administrator sees the enrolled learners per session with their contact details and the fill rate, and can export CSV
- [ ] **SES-06**: Administrator can cancel or postpone a session, and every enrolled learner is emailed automatically
- [ ] **SES-07**: A session enrolment carries the same inert order/confirmation state as a reservation, ready for Lot 7

### Paiement — Lot 7: paiement en ligne, formules et factures

- [ ] **PAY-01**: Learner pays through the chosen PCI-DSS certified provider on a payment page hosted by that provider — no bank data transits or is stored on the site
- [ ] **PAY-02**: The free 30-minute discovery call is bookable without payment
- [ ] **PAY-03**: Learner pays for an individual session at the moment they book the slot
- [ ] **PAY-04**: Learner pays for a seat in a group live session at the moment they enrol
- [ ] **PAY-05**: Learner can buy a « forfait de formation » — the complete programme — and then freely book slots and sessions without paying again, within the limits of that package
- [ ] **PAY-06**: Orders carry a status — en attente, payée, échouée, remboursée — a reservation is confirmed only after effective payment confirmed by the provider, and the slot is released automatically if payment does not succeed
- [ ] **PAY-07**: A PDF invoice or receipt is generated automatically, emailed, and available in the learner space
- [ ] **PAY-08**: Administrator can configure prices, formulas and promotional codes entirely from the back-office
- [ ] **PAY-09**: Administrator can track payments in the back-office — order list, search, CSV export, revenue collected over a period
- [ ] **PAY-10**: On cancellation the slot is freed and the learner is notified; any refund is decided and executed by the trainer under the published refund policy

### Synchronisation Google Calendar — Lot 8

- [ ] **GCAL-01**: Administrator connects their Google account once from the back-office
- [ ] **GCAL-02**: Any busy event in the trainer's personal Google Calendar automatically greys out the corresponding slots on the site
- [ ] **GCAL-03**: Every appointment and session is written into the trainer's Google Calendar with the learner's name, email and reason, so the trainer is notified on their phone
- [ ] **GCAL-04**: Moving or cancelling an appointment updates or deletes the Google Calendar event automatically
- [ ] **GCAL-05**: A learner who signed in with Google gets the event created directly in their calendar, then updated or removed automatically, with nothing to click
- [ ] **GCAL-06**: A learner who did not sign in with Google gets a `.ics` file attached to the confirmation email, compatible with Outlook, Apple Calendar and others
- [ ] **GCAL-07**: The application is declared and verified with Google — consent screen, minimal access scope, privacy policy meeting their requirements
- [ ] **GCAL-08**: Administrator can reconnect in one click if the Google authorisation expires, with no technical intervention

### Suivi — Lot 9: présence, progression et attestations

- [ ] **SUI-01**: Administrator keeps an attendance sheet per session and per appointment — enrolled list, présent / absent / excusé marking, free comment
- [ ] **SUI-02**: Learner can self-declare present through a code or link displayed during the live session, with the trainer always able to correct it
- [ ] **SUI-03**: Progression is computed from attendance — sessions attended over the programme total, per-module advancement, overall percentage
- [ ] **SUI-04**: Learner sees mes présences, mon avancement, mes prochaines échéances and the history of everything they attended
- [ ] **SUI-05**: Administrator sees the attendance rate per session, learners falling behind, individual history, and can export CSV
- [ ] **SUI-06**: A PDF certificate is generated automatically above a configurable attendance threshold, carrying the learner's name, the training, the hour volume, the dates and a unique verifiable number

### Administration — Lot 10: administration des utilisateurs et des contenus

- [ ] **ADM-01**: Administrator can search learners and open a complete record — appointments, sessions, attendance, payments, documents
- [ ] **ADM-02**: Administrator can deactivate a learner account or reset its access
- [ ] **ADM-03**: Administrator can edit business content without development — programme modules (title, duration, description, objectives), the programme PDF, the FAQ, prices and formulas
- [ ] **ADM-04**: Administrator can read and manage the messages received through the contact form
- [ ] **ADM-05**: Administrator sees an overview — upcoming appointments and sessions, new enrolments, the month's payments, unread messages
- [ ] **ADM-06**: Administrator can consult a log of emails sent by the platform with their delivery status
- [ ] **ADM-07**: The client accepts the full scope after a final joint recette, and the corrections are made

## v2 Requirements

None. The signed offer is a closed, fixed-price scope of ten lots. Anything not
listed above is out of scope, not deferred — adding it means re-issuing a signed
offer.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Auto-generated video-conference link | Excluded in writing, section 6 of the signed offer |
| J-1 / H-1 reminder sequence | Excluded in writing, section 6 |
| Waiting list on full sessions | Excluded in writing, section 6 |
| Learner self-service cancellation | Excluded in writing, section 6 — cancellation goes through the trainer |
| Free editing of section presentation copy | Excluded in writing, section 6 — business content (modules, programme, FAQ, prices, formulas) *is* editable; presentation copy is changed by the provider |
| Media library | Excluded in writing, section 6 |
| E-learning lessons, quizzes, video hosting | Excluded in writing, section 6 — the training is delivered live |
| Production of course material (filming, editing, voice-over, supports, exercises, answer keys) | Excluded in writing, section 6 — not a development deliverable |
| Expert SAP Ariba subject matter | Excluded in writing, section 6 — the trainer is the source of technical content; this work covers its presentation |
| Legal validation by a lawyer | Excluded in writing, section 6 — legal pages come from compliant templates; validation is the client's responsibility |
| Third-party subscriptions and licences | Excluded in writing, section 6 — subscribed in the client's name so they stay the owner |
| SAP or Qualiopi certification | Excluded in writing, section 6 |
| Advertising campaigns, brand identity creation | Excluded in writing, section 6 |
| B2B multi-seat company accounts | Excluded from all offers |
| Automatic refunds | Excluded from all offers — refunds are decided and executed by the trainer |
| English version of the site | Excluded from all offers — all copy is French |
| Forum | Excluded from all offers |
| Native mobile app | Excluded from all offers — the site is responsive |
| Attendance imported from the video-conference tool | Deliberate limit — attendance is an admin sheet plus a learner self check-in code |
| Notifications other than email (SMS, push, in-app) | Deliberate limit — notifications are email-only |
| Multiple trainers or multiple agendas | Deliberate limit — one trainer, one agenda |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SOCLE-01 | Phase 0 | Complete |
| SOCLE-02 | Phase 0 | Complete |
| SOCLE-03 | Phase 0 | Complete |
| SOCLE-04 | Phase 0 | Complete |
| SOCLE-05 | Phase 0 | Complete |
| CADR-01 | Phase 1 | Pending |
| CADR-02 | Phase 1 | Pending |
| CADR-03 | Phase 1 | Pending |
| CADR-04 | Phase 1 | Pending |
| CADR-05 | Phase 1 | Pending |
| CADR-06 | Phase 1 | Pending |
| PUB-01 | Phase 2 | Pending |
| PUB-02 | Phase 2 | Pending |
| PUB-03 | Phase 2 | Pending |
| PUB-04 | Phase 2 | Pending |
| PUB-05 | Phase 2 | Pending |
| PUB-06 | Phase 2 | Pending |
| PUB-07 | Phase 2 | Pending |
| PUB-08 | Phase 2 | Complete |
| PUB-09 | Phase 2 | Complete |
| PUB-10 | Phase 2 | Complete |
| PUB-11 | Phase 2 | Pending |
| PUB-12 | Phase 2 | Complete (02-04) |
| PUB-13 | Phase 2 | Pending |
| CPT-01 | Phase 3 | Complete (03-11) |
| CPT-02 | Phase 3 | Blocked — Google OAuth client missing |
| CPT-03 | Phase 3 | Complete (03-11) |
| CPT-04 | Phase 3 | Complete (03-11) |
| CPT-05 | Phase 3 | Complete (03-11) |
| CPT-06 | Phase 3 | Complete (03-11) |
| CPT-07 | Phase 3 | Complete (03-11) |
| CPT-08 | Phase 3 | Complete (03-11) |
| CPT-09 | Phase 3 | Complete (03-11) |
| AGD-01 | Phase 4 | Pending |
| AGD-02 | Phase 4 | Pending |
| AGD-03 | Phase 4 | Pending |
| AGD-04 | Phase 4 | Pending |
| AGD-05 | Phase 4 | Pending |
| AGD-06 | Phase 4 | Pending |
| AGD-07 | Phase 4 | Pending |
| AGD-08 | Phase 4 | Pending |
| AGD-09 | Phase 4 | Pending |
| GOL-01 | Phase 5 | Pending |
| GOL-02 | Phase 5 | Pending |
| GOL-03 | Phase 5 | Pending |
| GOL-04 | Phase 5 | Pending |
| GOL-05 | Phase 5 | Pending |
| GOL-06 | Phase 5 | Pending |
| GOL-07 | Phase 5 | Pending |
| GOL-08 | Phase 5 | Pending |
| SES-01 | Phase 6 | Pending |
| SES-02 | Phase 6 | Pending |
| SES-03 | Phase 6 | Pending |
| SES-04 | Phase 6 | Pending |
| SES-05 | Phase 6 | Pending |
| SES-06 | Phase 6 | Pending |
| SES-07 | Phase 6 | Pending |
| PAY-01 | Phase 7 | Pending |
| PAY-02 | Phase 7 | Pending |
| PAY-03 | Phase 7 | Pending |
| PAY-04 | Phase 7 | Pending |
| PAY-05 | Phase 7 | Pending |
| PAY-06 | Phase 7 | Pending |
| PAY-07 | Phase 7 | Pending |
| PAY-08 | Phase 7 | Pending |
| PAY-09 | Phase 7 | Pending |
| PAY-10 | Phase 7 | Pending |
| GCAL-01 | Phase 8 | Pending |
| GCAL-02 | Phase 8 | Pending |
| GCAL-03 | Phase 8 | Pending |
| GCAL-04 | Phase 8 | Pending |
| GCAL-05 | Phase 8 | Pending |
| GCAL-06 | Phase 8 | Pending |
| GCAL-07 | Phase 8 | Pending |
| GCAL-08 | Phase 8 | Pending |
| SUI-01 | Phase 9 | Pending |
| SUI-02 | Phase 9 | Pending |
| SUI-03 | Phase 9 | Pending |
| SUI-04 | Phase 9 | Pending |
| SUI-05 | Phase 9 | Pending |
| SUI-06 | Phase 9 | Pending |
| ADM-01 | Phase 10 | Pending |
| ADM-02 | Phase 10 | Pending |
| ADM-03 | Phase 10 | Pending |
| ADM-04 | Phase 10 | Pending |
| ADM-05 | Phase 10 | Pending |
| ADM-06 | Phase 10 | Pending |
| ADM-07 | Phase 10 | Pending |

**Coverage:**

- v1 requirements: 88 total
- Mapped to phases: 88
- Unmapped: 0 ✓

## Open scope questions

Questions the signed document does not answer. Recorded here rather than
resolved in the roadmap.

1. **Package (« forfait ») limits are undefined.** PAY-05 says the learner books
   "dans la limite de son forfait" but the offer does not state what bounds a
   package — a number of sessions, an hour volume, a validity window, or a
   module list. Needs a client answer at cadrage (Lot 1) before Lot 7 is
   planned.

2. **The attendance threshold for a certificate is "paramétrable"** (SUI-06) but
   no default is given. Needs a client answer before Lot 9 is planned.

3. **Whether the free discovery call counts towards progression** (SUI-03) is
   not stated. Needs a client answer before Lot 9 is planned.

---
*Requirements defined: 2026-08-27*
*Last updated: 2026-08-27 after initial definition*
