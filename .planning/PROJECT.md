# Formation SAP Ariba — plateforme de réservation live

## What This Is

A live-training booking platform for a SAP Ariba training offer, in French. A
learner creates an account, books and pays for a slot in the trainer's calendar
(discovery call, one-to-one session, group session, or a prepaid package),
receives the appointment in their own Google Calendar, and follows their
attendance and progression through to a certificate. The trainer runs
availability, sessions, attendance and payments from a custom French
back-office, and sees every booking land in their own Google Calendar.

The client owns this repository. Everything written here ships to them.

## Core Value

The learner can book — and pay for — a real slot in the trainer's calendar, and
the trainer sees it. If everything else fails, that must work.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Public site that sells the training: landing page (seven sections),
      Programme, Formation, À propos, Contact
- [ ] Learner accounts — email/password and Google sign-in, mandatory for every
      booking including the free discovery call
- [ ] Learner space — upcoming appointments and sessions, history, documents,
      invoices, progression
- [ ] Availability model and public agenda; three-screen booking flow with
      transactional protection against double-booking
- [ ] Technical SEO, performance, responsive site, five legal pages, GDPR
      consent, domain + HTTPS + email authentication, go-live
- [ ] Group live sessions — creation, recurrence, public listing, seat counting,
      enrolment, cancellation/postponement notices
- [ ] Online payment through a PCI-DSS certified provider; four sale formulas;
      orders and statuses; automatic PDF invoice; back-office payment tracking
- [ ] Two-way Google Calendar synchronisation on the trainer side; automatic
      event creation on the learner side, `.ics` otherwise
- [ ] Attendance sheets plus learner self check-in code; attendance-based
      progression; automatic PDF certificate above a configurable threshold
- [ ] Back-office administration of users and of business content (modules,
      programme PDF, FAQ, prices and formulas, contact messages); email log
- [ ] Fully dynamic from v1 — no module, slot, price or asset hardcoded

### Out of Scope

Excluded in writing in the signed offer:

- Auto-generated video-conference links, and the J-1 / H-1 reminder sequence —
  excluded in writing (section 6)
- Waiting lists on full sessions, and learner self-service cancellation —
  excluded in writing (section 6)
- Free editing of every section presentation text, and a media library —
  excluded in writing. Business content (modules, programme, FAQ, prices,
  formulas) *is* fully editable; presentation copy is changed by the provider
- E-learning platform — lessons, quizzes, video hosting — excluded in writing
- Production of the course material: filming, editing, voice-over, creation of
  course supports, exercises and answer keys
- The expert SAP Ariba subject matter itself — the trainer remains the source of
  technical content; this work covers its presentation, not its creation
- Legal validation by a lawyer — legal pages are drafted from compliant
  templates; their validation is the client's responsibility
- Third-party subscriptions and licences, SAP or Qualiopi certification,
  advertising campaigns, brand identity creation
- B2B multi-seat company accounts, automatic refunds, English version, forum,
  native mobile app

Deliberate limits, not oversights:

- Refunds are manual — cancelling frees the slot and notifies the learner; the
  trainer decides and executes any refund, under the published refund policy
- Attendance is an admin sheet plus a learner self check-in code — never
  imported from the video-conference tool
- Notifications are email-only
- One trainer, one agenda

## Context

- **Scope is signed and closed.** The client signed Offre 1 "Essentiel" on
  2026-08-26: ten lots, 28,5 jours, 1 500 €, no deposit, each lot paid on
  delivery, 30-day corrective warranty after go-live.
  `reference/Offre_1_Essentiel.pdf` is the single scope reference — where
  anything disagrees with it, the PDF wins.
- **One lot = one iteration = one payment gate.** A lot is done when it is
  *recettable* on its own. The scope of the following lot is confirmed when the
  previous one is validated.
- **Go-live is mid-scope, at Lot 5**, not at the end. The site is online and
  operational from that lot; the remaining lots deploy progressively, *sans
  coupure de service*.
- `reference/ElearningAriba_CahierDeCharges.odt` is the client's original French
  spec — source of the seven landing sections, five modules and five target
  profiles. It predates the offer and is context, not scope.
- `reference/maquette-landing-2026-01-17.png` is an early landing mockup. Its
  palette and hero accroche are usable; its positioning is wrong — it sells
  self-paced e-learning and omits Agenda and Se connecter. Tone only, not
  structure or copy.
- `https://26academy.com` is a visual quality bar and trust-architecture
  reference for the French training market (rating metrics, testimonials, FAQ).
  It is **not** a feature or structure reference: it is a self-paced video
  platform with CPF / RNCP / Qualiopi financing and an eligibility checker,
  most of which is outside this scope. The landing page follows the seven
  sections enumerated in Lot 2.
- Target audience: buyers, category managers, supply-chain and procurement
  professionals, junior or reskilling SAP Ariba consultants, companies training
  their purchasing teams, students and recent graduates. No SAP Ariba
  prerequisite.

### The three structuring principles

1. **The agenda and the payment are the product.** Training is delivered live;
   the site does not sell access to videos, it sells a slot in the trainer's
   calendar. Booking is the primary conversion, treated as a module in its own
   right, not a contact form.
2. **The learner account is the spine.** Every booking goes through an account,
   including the free discovery call. That is what ties appointments, payments,
   attendance and progression to one person.
3. **Fully dynamic from the first version.** No module, slot, price or asset
   hardcoded — everything in the database and editable from the back-office, so
   the trainer can add pedagogical content without new development.

## Constraints

- **Tech stack** (contractual, section 1 "Socle technique" of the signed offer):
  Next.js (React, TypeScript) avec rendu serveur pour le référencement et la
  rapidité · Supabase (PostgreSQL, authentification email et Google, stockage de
  fichiers) · back-office sur mesure en français · hébergement Vercel avec
  HTTPS · emails transactionnels avec authentification du domaine · paiement
  délégué à un prestataire certifié PCI DSS, aucune donnée bancaire sur le
  site · API Google Calendar · code livré sur un dépôt Git dont le client est
  propriétaire. — Changing any of it means re-issuing a signed offer.
- **Language**: all learner- and client-facing copy is French, including the
  back-office — the client and their learners are French-speaking.
- **Payment provider**: deliberately open in the offer ("Stripe ou équivalent,
  choisi au cadrage") — decided in Lot 1, not before.
- **No card data on the site**: payment page hosted by the provider; no bank
  detail transits or is stored here — contractual, section 1 and Lot 7.
- **Data isolation**: roles are learner and administrator, with row-level
  isolation in the database — a learner cannot technically reach another
  learner's data (Lot 3).
- **Timezone**: Europe/Paris, with recurring availabilities, exceptions and
  holidays (Lot 4).
- **Performance**: Lighthouse ≥ 90 on mobile, responsive across mobile, tablet
  and desktop (Lot 5).
- **Repository ownership**: the client owns this repo. Nothing internal belongs
  in it — no rates, no margins, no internal calendar, no reference to work
  outside the signed offer.
- **Documentation lookups**: consult context7 for framework documentation
  (Next.js, Supabase, and anything else in the stack) before writing
  implementation code.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| One milestone, `v1 — Essentiel`, covering the whole signed scope | A milestone is a shipped version; ten milestones would mean ten shipped versions and ten rebuilds of the requirement set. The lots are payment gates inside one version, not ten versions. | — Pending |
| Eleven phases: a Phase 0 socle, then Phase N = Lot N for lots 1–10 | Gives one-to-one traceability from a delivered phase to a payment gate, with no interpretation. | — Pending |
| Phase 0 "Socle technique et environnement" carries no lot | The Next.js skeleton, the Supabase project, the local environment and the Vercel preview are real work that Lot 1 (cadrage, contenus, design) does not contain and that lots 2–10 cannot start without. | — Pending |
| Go-live stays at Lot 5, mid-scope | The site cannot collect accounts and payments without SEO, legal pages, GDPR and deployment. Lots 6–10 deploy onto the live site without interruption. | — Pending |
| Booking carries an inert order/confirmation seam from Lot 4 | The offer states the booking is confirmed only after effective payment and the slot is released automatically if payment fails. Without the seam at Lot 4, Lot 7 rewrites Lot 4. | — Pending |
| "Mes factures" and "mon avancement" ship as honest empty states in Lot 3 | Lot 3 specifies both surfaces in the learner space; invoices arrive at Lot 7, progression at Lot 9. Empty states, not fake data and not deferred surfaces. | — Pending |
| Payment provider left undecided here | The offer keeps it open ("Stripe ou équivalent, choisi au cadrage") — it is a Lot 1 decision. | — Pending |
| Google app verification submitted after Lot 5 go-live, not at Lot 8 | Lot 8's declaration and verification with Google requires a live homepage and a hosted privacy policy, both produced by Lot 5. Google's review turnaround is outside our control. `[ASSUMPTION]` on duration; the dependency itself is a fact from the offer. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-27 after initialization*
