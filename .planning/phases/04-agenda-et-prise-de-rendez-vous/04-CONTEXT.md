# Phase 4: Agenda et prise de rendez-vous - Context

**Gathered:** 2026-09-01
**Status:** Ready for planning
**Source:** PRD Express Path (`C:/Users/Essakhi/Desktop/ElearningSAP/ariba-cto/notes/2026-09-01-brief-lot4-agenda-et-prise-de-rendez-vous.md`)
**Mode:** mvp (from ROADMAP.md `**Mode**: mvp`)

<domain>
## Phase Boundary

Lot 4 delivers the platform's primary conversion: a **public agenda** backed by a
real availability model (recurring weekly rules + exceptions, free slots computed
at read time), a **three-screen booking flow** from the learner account
(type → slot → recap to validate, plus a success surface), the **confirmation
emails** (learner with `.ics`, trainer notified), and the **first `/admin`
surface** — an agenda back-office where the trainer runs hours, exceptions,
holidays and reservations.

**Delivers exactly `AGD-01`..`AGD-09` and nothing else.**

**Where it stops:**
- No cancellation or reschedule by the learner — that gesture belongs to the
  administrator alone (`AGD-08`).
- No per-meeting video link generation, no Google Calendar sync → Lot 8.
- No payment, no formules, no invoices → Lot 7. The Lot 7 seam is a `statut`
  column + `paiement_requis boolean default false` on the reservation, and it
  stays inert. **No dormant `commande` table.**
- No group sessions → Lot 6. No user/content administration → Lot 10.
- Lots 11–18 (Business, Premium) are not sold. Nothing approaches them.

**Execution environment:** worktree
`C:/Users/Essakhi/Desktop/ElearningAriba-lot3` on branch
`gsd/phase-04-agenda-et-prise-de-rendez-vous`, branched from Lot 3. No third
worktree — the local Supabase stack is shared between worktrees.

**Execution precondition (not a planning precondition):** the landing rework and
`02-11` must be delivered and Lot 2 merged into `main` before Lot 4's first
`db reset`, because the shared local Supabase stack would wipe the content the
Lot 2 session re-reads on every build. Planning touches neither source nor
database and can proceed now.

</domain>

<decisions>
## Implementation Decisions

All 26 decisions below were taken by the founder on 2026-09-01 and are LOCKED.

### Architecture and model

### D-01 — Back-office lives in a separate `/admin` route group
Guarded by `profil.role = 'administrator'`. Lot 10 extends this shell rather than
re-cutting it. This is the **first** exposure of the `administrator` role, which
has existed at database level since Lot 3 without any surface (Lot 3 D-02).

### D-02 — Rules + exceptions model, free slots computed at read time
Store recurring weekly hours and exceptions (holidays, blocks). **Free slots are
never materialised** — no generation job, no slot table.

### D-03 — `AGD-05` lock is a Postgres exclusion constraint on `tstzrange`
On the reservation table (`btree_gist`, `&&`). The database refuses overlap; the
application code does not have to be right. **The locked range includes the
buffer.**

### D-04 — Availability is declared as continuous ranges
The trainer declares "mardi 9h–12h"; splitting happens at read time from the
chosen type's duration + buffer. One range serves both the 30-min call and the
1-hour session.

### D-05 — Hand-written calendar UI, a library for zoned arithmetic
The monthly grid is written by hand — the design system is bespoke and a
third-party calendar would fight it. **Zoned date arithmetic goes to a proven
library, named on evidence by phase research** (support + state of `Temporal` on
Node 24 must be verified). Reason: recurring availabilities cross the DST
switches (2026-03-29, 2026-10-25); "14 h" is not the same UTC instant on both
sides, and that is exactly where hand-written arithmetic produces bugs no obvious
test catches.

### D-06 — `/agenda` stays a static shell
Availabilities are loaded client-side through the existing anonymous Supabase
client (`src/lib/supabase/public.ts`). Titles and copy stay static and
referenceable for Lot 5. **The static route count does not move.**

### D-07 — Lot 7 seam carried by the reservation (`AGD-09`)
`statut` (`confirmee | en_attente_paiement | annulee`) + `paiement_requis boolean`
defaulting to `false`. Lot 4 always writes `confirmee`. Lot 7 flips the default,
adds the payment screen and the slot-release path — without rewriting the flow.
**No inert `commande` table.**

### D-08 — `on delete set null` on `reservation.utilisateur_id`
When an account is erased the identity disappears, the reservation remains and
the slot stays taken, displayed as "compte supprimé" in `/admin`. Right to
erasure is served without making an appointment vanish from the trainer's agenda.

### Learner journey

### D-09 — Account required to book
The visitor sees the calendar and free slots (`AGD-02`); the click sends to
`/inscription` then returns to the chosen slot. One identity model, RLS unchanged.

### D-10 — Three screens: type → slot → recap to validate
Screen 3 shows everything being booked (type, date in Europe/Paris, duration,
price, location) and one button that commits. **The success page is a fourth
surface, not a step.** Reason: in Lot 7 that button becomes a payment.

### D-11 — No cancellation, no reschedule on the learner side
`AGD-08` gives that gesture to the administrator only; no signed requirement
gives it to the learner. The learner sees their reservation in their space and
contacts the trainer. **Any request to the contrary is a commercial event → CoS.**

### D-12 — One discovery call per account, enforced in the database
No more than one non-cancelled discovery call in an account's history. The error
message points to the individual session. Reason: the call is free and an account
takes thirty seconds; the existing rate limit is keyed on IP alone.

### D-13 — Booking window: 8-week horizon, 24-hour notice
Fixed values, not back-office settings.

### D-14 — Price displayed, settlement announced offline
The confirmation screen says settlement happens with the trainer, and that the
discovery call is free. Lot 7 replaces that sentence with a payment button.

### D-15 — Meeting location: the trainer's fixed video link, from an env var
Injected into the `.ics` and the emails. No third-party integration in Lot 4 —
Lot 8 replaces it with a per-meeting generated link without rewriting the journey.
**New decision: nothing in the dossier said where learner and trainer meet.**

### Trainer back-office

### D-16 — Dedicated, sober admin shell
Side navigation, working-tool density, no marketing chrome, **built on the
existing tokens and components — not a new design system.**

### D-17 — French public holidays pre-filled
The eleven, Easter computed, closed by default, each date re-openable; the trainer
adds their own closures.

### D-18 — Booking on a learner's behalf: existing accounts only
Blocking a range without selling it is already covered by `AGD-07`.

### D-19 — CSV export, encoded for French Excel
Over a period chosen by the administrator, fixed and documented columns (date,
type, duration, learner, email, statut). The scope of exported personal data is
written down explicitly.

### D-20 — Default buffer: 15 minutes, configurable per type (`AGD-03`)

### Bootstrap and content

### D-21 — Idempotent seed script, modelled on `npm run content:seed`
Reads the trainer's email from the environment and promotes their profile to
`administrator`. Replayable, versioned, **no personal data committed.**

### D-22 — The same script seeds a typical week
Monday to Friday, 9h–12h and 14h–17h, which the trainer adjusts. The agenda is
never empty at go-live and the CQO recette has material from the first run.

### D-23 — The visitor only ever sees "Indisponible"
Booked, blocked and holiday all present identically. `AGD-02` is served — the
slot is greyed out — without publishing the trainer's activity volume.

### D-24 — Consequence: the Lot 1 legend changes
`agenda.json` says "Réservé" and "Bloqué" today; the public legend becomes
**Libre / Indisponible / Passé**. "Réservé" and "Bloqué" survive on the `/admin`
side where the distinction is useful. **This is a change to content validated in
Lot 1 — FYI to the Chief of Staff.** It is not a scope change.

### Delivery lane

### D-25 — Branch `gsd/phase-04-agenda-et-prise-de-rendez-vous`, existing worktree
Branched from Lot 3, worked inside `ElearningAriba-lot3`. No third worktree.

### D-26 — One blocking visual review gate per surface-producing plan
Each plan that produces a surface stops on the founder's review before the next
opens. **Measured reason, not theoretical:** Lot 2 grouped its reviews onto a
final plan; `02-11` is still not done, four gates passed unreviewed, and
PUB-01…PUB-07 have been waiting since. **Do not group the reviews onto a final
plan.**

### Scope fence — hard rules for every plan

- **Never `git push`.** Pushing belongs to the CIO alone; a push to `main` in
  `ElearningAriba` is a production deployment.
- **Never switch branch.** Work stays on `gsd/phase-04-agenda-et-prise-de-rendez-vous`.
- **Do not modify the prices or the appointment-type labels** in
  `src/locales/fr/agenda.json` — content validated in Lot 1. Only the legend
  changes (D-24).
- **Verify on the rendered result**, never by grepping source. A verification
  command that looks for a literal string in code pushes the executor to rewrite
  correct code to satisfy the grep.
- **All migrations are additive.** No already-applied migration is edited; nothing
  from Lot 3 is altered.
- **No new email sender, no new domain** — reuse `src/lib/email/resend.ts` and the
  trainer address at `contact.coordonnees.email`.
- **No new `Intl` formatters** — reuse those in `src/lib/i18n/fr.ts` and
  `TIME_ZONE = "Europe/Paris"`.

### Claude's Discretion

- The exact zoned-date library (D-05 says: named on evidence by phase research).
- The exclusion-constraint syntax and its interaction with existing RLS.
- Whether `@base-ui/react` 1.7 ships a calendar primitive worth building on.
- The `.ics` shape (stable `UID`, `SEQUENCE`) so Lot 8 can send an update rather
  than a duplicate.
- Table, column and route naming inside the decisions above; plan/wave split;
  file layout; component decomposition.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope and requirements
- `.planning/ROADMAP.md` — Phase 4 section: goal, `**Mode**: mvp`, success criteria
- `.planning/REQUIREMENTS.md` — `AGD-01`..`AGD-09` (lines 67–75)
- `.planning/STATE.md` — project decisions and history
- `CLAUDE.md` — signed stack, lot table, no-`any`, no-hardcoded-text, role-gated UI
- `reference/Offre_1_Essentiel.pdf` — the single scope reference; where anything disagrees, the PDF wins
- `.planning/phases/03-comptes-connexion-et-espace-apprenant/03-CONTEXT.md` — Lot 3 locked decisions Lot 4 inherits
- `.planning/phases/03-comptes-connexion-et-espace-apprenant/03-UI-SPEC.md` — the design contract Lot 4 extends

### Data layer (read before any migration)
- `supabase/migrations/20260831160000_lot3_comptes.sql` — `app.profil`, `role`, RLS pattern to copy
- `supabase/migrations/20260831161000_lot3_grants.sql`
- `supabase/migrations/20260830090000_public_content.sql` — additive-migration + reversion-comment pattern
- `supabase/config.toml` — exposed schemas, redirect URLs, auth settings
- `src/types/database.types.ts` — regenerated via `npm run db:types`

### Supabase wiring
- `src/lib/supabase/public.ts` — cookie-free anonymous client; keeps public routes static (D-06)
- `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/service.ts`
- `src/lib/supabase/middleware.ts`, `src/middleware.ts` — session refresh + route matcher, extended for `/admin` (D-01)
- `src/lib/auth/session.ts` — how a session/role is read server-side

### Time, copy and email
- `src/lib/i18n/fr.ts` — `TIME_ZONE = "Europe/Paris"` and the existing `Intl` formatters (do not create new ones)
- `src/locales/fr/agenda.json` — `typesRendezVous` (0 € / 90 €) are Lot 1-validated: keep as is; only the legend changes (D-24)
- `src/locales/fr/reservation.json`, `src/locales/fr/paiement.json`, `src/locales/fr/espace.json`, `src/locales/fr/emails.json`, `src/locales/fr/common.json`
- `src/locales/fr/contact.json` — `coordonnees.email`, the trainer notification address (D-15, `AGD-06`)
- `src/lib/email/resend.ts`, `src/lib/email/render.ts` — the only outbound path
- `src/app/api/contact/route.ts`, `src/app/api/rgpd/suppression/route.ts` — existing consumers of that path
- `src/lib/env/server.ts`, `src/lib/env/client.ts` — Zod env schemas that throw at boot; the video-link var goes here (D-15)

### Surfaces Lot 4 rewrites (Lot 1 mockups, hard-coded data)
- `src/app/agenda/page.tsx`
- `src/app/reservation/page.tsx`
- `src/app/paiement/page.tsx`
- `src/app/espace/` — where the learner sees their reservation (D-11)

### Design system — consume, extend alongside, do not rewrite (D-16)
- `src/components/ui/` — `accordion`, `badge`, `button`, `card`, `checkbox`, `empty-state`, `field`, `input`, `message` (on `@base-ui/react` 1.7)
- `src/components/layout/` — header, footer
- `src/app/globals.css` — tokens

### Seed pattern (D-21, D-22)
- `scripts/seed-content.mjs` + `package.json` `content:seed` — the idempotent, env-driven model to copy
- `scripts/check-mock-content.mjs`, `scripts/gen-db-types.mjs`

</canonical_refs>

<specifics>
## Specific Ideas

- The exclusion constraint (D-03) must be proven by a **negative test**: a second
  overlapping insert is refused by the database, not by application code.
- The "slot taken while the learner was filling the form" path returns the learner
  to a refreshed list with an explicit message — never a raw error.
- The second discovery call (D-12) is refused with a message pointing to the
  individual session.
- Outside the booking window (D-13) the slot is simply not offered.
- The empty agenda is avoided at source by the seeded typical week (D-22); the
  honest empty state already exists in `agenda.json` (`aucunCreneau`) for periods
  genuinely without slots.
- Two outbound messages, both through the existing Resend path: (a) learner
  confirmation with `.ics` attached, (b) immediate trainer notification to
  `contact.coordonnees.email`. Both carry the fixed video link. An
  administrator cancellation or move notifies the learner. **No bulk sending, no
  automatic follow-up, no pre-session reminder.**
- RLS: the learner reads and writes only their own reservations; the
  administrator reads and writes all. The exclusion constraint is a database
  guardrail independent of RLS and must be verified as such.
- CSV export encoded for French Excel (D-19).
- The founder's visual review gate (D-26) is one blocking gate per
  surface-producing plan — `/agenda`, the three booking screens, the success
  surface, and each `/admin` screen.

</specifics>

<deferred>
## Deferred Ideas

- Learner-side cancellation or reschedule (D-11) → not planned, commercial event → CoS
- Per-meeting video link generation → Lot 8
- Google Calendar synchronisation → Lot 8
- Payment, formules, invoices → Lot 7 (the D-07 seam stays inert)
- Group sessions → Lot 6 (Lot 1 copy already mentions them; text, not surfaces)
- User and content administration, self-service deletion execution (`ADM-02`) → Lot 10
- Booking without an account (D-09) → never
- Public distinction between "réservé" and "bloqué" (D-23) → never
- Horizon and notice as back-office settings (D-13) → fixed values, not settings

</deferred>

<hosted_dependencies>
## Out of this seat's reach — blocks hosted recette, not local build

| Dependency | For | Owner |
|---|---|---|
| Environment variable carrying the trainer's fixed video link (D-15) | `AGD-06` | CIO |
| Running the administrator seed script on each environment (D-21) | `AGD-03`, `AGD-07`, `AGD-08` | CIO |
| Merge order to `main`: Lot 2 → Lot 3 → Lot 4, each a distinct production deployment | phase close | CIO |

The open Lot 3 items with the CIO — Google OAuth client, custom SMTP, private
`supports` bucket, publication of the Lot 3 migrations — are **not** Lot 4
dependencies. The SMTP debt concerns GoTrue auth emails, a different path; it does
not block `AGD-06`, which rides the existing Resend path.

</hosted_dependencies>

---

*Phase: 04-agenda-et-prise-de-rendez-vous*
*Context gathered: 2026-09-01 via PRD Express Path*
