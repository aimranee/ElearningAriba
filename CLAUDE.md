# CLAUDE.md

## What this is

The **product** repo for the SAP Ariba e-learning site: a live-training booking
platform — the learner creates an account, books and pays for a slot in the
trainer's calendar, and follows their progression. A French back-office runs
availability, sessions, attendance and payments.

Remote `github.com/aimranee/ElearningAriba.git`, default branch `main`, private.
It sits inside the workspace repo, which ignores it — two separate histories.
Never commit product code to the parent.

**The client owns this repo.** Nothing internal goes in it: no day rates, no
margins, no internal calendar, no reference to unsold lots.

## Scope — signed, closed

**Offre 1 "Essentiel" was signed 2026-08-26.** Lots 1–10 are the v1 requirement
set: **28,5 j, 1 500 €**, no deposit, each lot paid on delivery, 30-day
corrective warranty after go-live. `reference/Offre_1_Essentiel.pdf` is the
single scope reference — where anything disagrees with it, the PDF wins.

| Lot | Charge | Titre | Payable |
|---|---|---|---|
| 1 | 2,5 j | Cadrage, contenus et design | à validation des maquettes |
| 2 | 3,5 j | Site public | à la recette des pages |
| 3 | 3,5 j | Comptes, connexion et espace apprenant | à la recette des comptes |
| 4 | 3 j | Agenda et prise de rendez-vous | à la recette de l'agenda |
| 5 | 2,5 j | SEO, pages juridiques, RGPD et mise en ligne | **à la mise en ligne** |
| 6 | 3 j | Sessions live de groupe | à la recette des sessions |
| 7 | 3 j | Paiement en ligne, formules et factures | au premier paiement encaissé |
| 8 | 2,5 j | Synchronisation Google Calendar | à la recette de la synchro |
| 9 | 2,5 j | Présence, progression et attestations | à la recette du suivi |
| 10 | 2,5 j | Administration des utilisateurs et des contenus | à la livraison du lot |

One lot = one iteration = one payment gate; a lot is done when it is
*recettable* on its own. **Lot 5 is go-live** and sits mid-scope on purpose —
the site cannot collect accounts and payments without SEO, legal pages, RGPD and
deployment. Lots 6–10 deploy onto the live site without downtime.

**Lots 11–18 (Business, Premium) are not sold. Do not build into them.** The
lots are cumulative prefixes — keep that true, and stop at ten.

## Stack — committed to the client in writing

`reference/Offre_1_Essentiel.pdf`, section 1, **"Socle technique"**. Not an open
decision; changing any of it means re-issuing a signed offer.

**Next.js (React, TypeScript)** server-rendered · **Supabase** (PostgreSQL, auth
by email and Google, file storage) · **Vercel** with HTTPS · transactional email
with domain authentication · payment delegated to a PCI-DSS certified provider,
no card data on the site · **Google Calendar API** · custom back-office in French.

Open on purpose: the **payment provider** ("Stripe ou équivalent, choisi au
cadrage") — decided in Lot 1.

## Non-negotiables

1. **The agenda and the payment are the product surface.** Training is live. The
   site sells a slot in the trainer's calendar, not access to videos. Booking is
   the primary conversion.
2. **The learner account is the spine.** Every booking goes through an account,
   including the free discovery call — that is what ties appointments, payments,
   attendance and progression to one person.
3. **Fully dynamic from v1.** No module, slot, price or asset hardcoded.

## Not owed — excluded in writing

Auto-generated visio links and J-1/H-1 reminders; waiting lists and learner
self-service cancellation; free editing of section presentation copy plus a media
library (business content — modules, programme, FAQ, tarifs, formules — *is*
editable here); e-learning lessons, quizzes, video hosting. Excluded from all
three offers: B2B multi-seat accounts, automatic refunds, English version, forum,
native mobile app.

Deliberate limits, not oversights: refunds are manual (cancelling frees the slot
and notifies; the trainer decides); attendance is an admin sheet plus a learner
self check-in code, never imported from the visio; notifications email-only; one
trainer, one agenda.

## Reference documents

Read-only copies of what the client holds. Do not edit them here.

| File | What it is |
|---|---|
| `Offre_1_Essentiel.pdf` | **The signed offer** — lots 1–10, 28,5 j, 1 500 €. |
| `ElearningAriba_CahierDeCharges.odt` | Client's original spec, French — source of the seven landing sections, five modules, five profiles. A zip: read `content.xml`. Predates the offer; the offer wins. |
| `Offre_2_Business.pdf`, `Offre_3_Premium.pdf` | Lots 1–13 / 1–18. **Unsold** — contrast only. |
| `maquette-landing-2026-01-17.png` | Landing mockup, six months older than the offer. Palette and hero accroche are good; its positioning is **wrong** — it sells self-paced e-learning and omits Agenda and Se connecter. Tone only, not structure or copy. |

## Conventions

- **All learner- and client-facing copy is French.**
- Split unrelated work into separate commits; never mention AI or planning
  references in commit messages.

<!-- GSD:project-start source:PROJECT.md -->

## Project

**Formation SAP Ariba — plateforme de réservation live**

A live-training booking platform for a SAP Ariba training offer, in French. A
learner creates an account, books and pays for a slot in the trainer's calendar
(discovery call, one-to-one session, group session, or a prepaid package),
receives the appointment in their own Google Calendar, and follows their
attendance and progression through to a certificate. The trainer runs
availability, sessions, attendance and payments from a custom French
back-office, and sees every booking land in their own Google Calendar.

The client owns this repository. Everything written here ships to them.

**Core Value:** The learner can book — and pay for — a real slot in the trainer's calendar, and
the trainer sees it. If everything else fails, that must work.

### Constraints

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
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->

## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
