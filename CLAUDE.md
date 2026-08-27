# CLAUDE.md

You are on Windows (native, not WSL) — paths are `C:\...` and shell commands run through PowerShell or Git Bash.

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

## Communication Guidelines

**IMPORTANT**: Before answering any question, rephrase it into a clearer form first — the user may not know how to phrase it precisely.

## Rules

- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.
- At the end of each plan, list unresolved questions (extremely concise).
- DO NOT write tests unless explicitly requested
- DO NOT run dev server — assume already running
- Add code comments sparingly — focus on "why", not "what"
- Use GitHub CLI for all GitHub interactions
- NEVER use `any` type — use proper TypeScript types, `unknown`, or generics, use Zod at boundaries
- NEVER hardcode text; use translation keys; all strings in `src/locales/fr/`
- show/hide based on user role
- use queryKeys factory, prefer optimistic updates

## Git Commits

Format: `#<type>: <one sentence>`
Example: `#feat: add agenda slot picker`
Types: feat / fix / refactor / chore / docs

## Developer Profile

<!-- GSD:profile-start -->
> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
