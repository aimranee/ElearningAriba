# Phase 4: Agenda et prise de rendez-vous — Research

**Researched:** 2026-09-01
**Domain:** Postgres temporal modelling (recurring availability + exceptions), concurrency-safe booking, Europe/Paris DST correctness, Next.js 16 App Router static-shell/client-island split, RFC 5545 `.ics`, French back-office
**Confidence:** HIGH on the data layer (proven empirically against this repo's own local Postgres 17.6), HIGH on the dependency question, MEDIUM on UI composition (no analog in repo). *The three upstream contradictions that were LOW are now resolved — see § Open Questions (RESOLVED); the 15-minute hold was confirmed in scope by the D-27/D-28/D-29 amendment to `04-CONTEXT.md`.*

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

All 26 decisions were taken by the founder on 2026-09-01 and are LOCKED. Copied verbatim from `04-CONTEXT.md`:

**D-01 — Back-office lives in a separate `/admin` route group.** Guarded by `profil.role = 'administrator'`. Lot 10 extends this shell rather than re-cutting it. This is the **first** exposure of the `administrator` role, which has existed at database level since Lot 3 without any surface (Lot 3 D-02).

**D-02 — Rules + exceptions model, free slots computed at read time.** Store recurring weekly hours and exceptions (holidays, blocks). **Free slots are never materialised** — no generation job, no slot table.

**D-03 — `AGD-05` lock is a Postgres exclusion constraint on `tstzrange`.** On the reservation table (`btree_gist`, `&&`). The database refuses overlap; the application code does not have to be right. **The locked range includes the buffer.**

**D-04 — Availability is declared as continuous ranges.** The trainer declares "mardi 9h–12h"; splitting happens at read time from the chosen type's duration + buffer. One range serves both the 30-min call and the 1-hour session.

**D-05 — Hand-written calendar UI, a library for zoned arithmetic.** The monthly grid is written by hand — the design system is bespoke and a third-party calendar would fight it. **Zoned date arithmetic goes to a proven library, named on evidence by phase research** (support + state of `Temporal` on Node 24 must be verified). Reason: recurring availabilities cross the DST switches (2026-03-29, 2026-10-25); "14 h" is not the same UTC instant on both sides, and that is exactly where hand-written arithmetic produces bugs no obvious test catches.

**D-06 — `/agenda` stays a static shell.** Availabilities are loaded client-side through the existing anonymous Supabase client (`src/lib/supabase/public.ts`). Titles and copy stay static and referenceable for Lot 5. **The static route count does not move.**

**D-07 — Lot 7 seam carried by the reservation (`AGD-09`).** `statut` (`confirmee | en_attente_paiement | annulee`) + `paiement_requis boolean` defaulting to `false`. Lot 4 always writes `confirmee`. Lot 7 flips the default, adds the payment screen and the slot-release path — without rewriting the flow. **No inert `commande` table.**

**D-08 — `on delete set null` on `reservation.utilisateur_id`.** When an account is erased the identity disappears, the reservation remains and the slot stays taken, displayed as "compte supprimé" in `/admin`.

**D-09 — Account required to book.** The visitor sees the calendar and free slots (`AGD-02`); the click sends to `/inscription` then returns to the chosen slot. One identity model, RLS unchanged.

**D-10 — Three screens: type → slot → recap to validate.** Screen 3 shows everything being booked (type, date in Europe/Paris, duration, price, location) and one button that commits. **The success page is a fourth surface, not a step.**

**D-11 — No cancellation, no reschedule on the learner side.** `AGD-08` gives that gesture to the administrator only. **Any request to the contrary is a commercial event → CoS.**

**D-12 — One discovery call per account, enforced in the database.** No more than one non-cancelled discovery call in an account's history. The error message points to the individual session.

**D-13 — Booking window: 8-week horizon, 24-hour notice.** Fixed values, not back-office settings.

**D-14 — Price displayed, settlement announced offline.** The confirmation screen says settlement happens with the trainer, and that the discovery call is free.

**D-15 — Meeting location: the trainer's fixed video link, from an env var.** Injected into the `.ics` and the emails. No third-party integration in Lot 4.

**D-16 — Dedicated, sober admin shell.** Side navigation, working-tool density, no marketing chrome, **built on the existing tokens and components — not a new design system.**

**D-17 — French public holidays pre-filled.** The eleven, Easter computed, closed by default, each date re-openable; the trainer adds their own closures.

**D-18 — Booking on a learner's behalf: existing accounts only.**

**D-19 — CSV export, encoded for French Excel.** Over a period chosen by the administrator, fixed and documented columns (date, type, duration, learner, email, statut). The scope of exported personal data is written down explicitly.

**D-20 — Default buffer: 15 minutes, configurable per type (`AGD-03`).**

**D-21 — Idempotent seed script, modelled on `npm run content:seed`.** Reads the trainer's email from the environment and promotes their profile to `administrator`. Replayable, versioned, **no personal data committed.**

**D-22 — The same script seeds a typical week.** Monday to Friday, 9h–12h and 14h–17h.

**D-23 — The visitor only ever sees "Indisponible".** Booked, blocked and holiday all present identically.

**D-24 — Consequence: the Lot 1 legend changes.** The public legend becomes **Libre / Indisponible / Passé**. "Réservé" and "Bloqué" survive on the `/admin` side. **FYI to the Chief of Staff.** Not a scope change.

**D-25 — Branch `gsd/phase-04-agenda-et-prise-de-rendez-vous`, existing worktree.**

**D-26 — One blocking visual review gate per surface-producing plan.** **Do not group the reviews onto a final plan.**

### Scope fence — hard rules for every plan

- **Never `git push`.**
- **Never switch branch.**
- **Do not modify the prices or the appointment-type labels** in `src/locales/fr/agenda.json`. Only the legend changes (D-24).
- **Verify on the rendered result**, never by grepping source.
- **All migrations are additive.** No already-applied migration is edited.
- **No new email sender, no new domain** — reuse `src/lib/email/resend.ts` and the trainer address at `contact.coordonnees.email`.
- **No new `Intl` formatters** — reuse those in `src/lib/i18n/fr.ts` and `TIME_ZONE = "Europe/Paris"`. *(See Open Question 3 — `04-UI-SPEC.md` D-U4 requires exactly two new ones inside that same file.)*

### Claude's Discretion

- The exact zoned-date library (D-05 says: named on evidence by phase research).
- The exclusion-constraint syntax and its interaction with existing RLS.
- Whether `@base-ui/react` 1.7 ships a calendar primitive worth building on. *(Resolved by `04-UI-SPEC.md`: it does not. Hand-written.)*
- The `.ics` shape (stable `UID`, `SEQUENCE`) so Lot 8 can send an update rather than a duplicate.
- Table, column and route naming inside the decisions above; plan/wave split; file layout; component decomposition.

### Deferred Ideas (OUT OF SCOPE)

- Learner-side cancellation or reschedule (D-11) → not planned, commercial event → CoS
- Per-meeting video link generation → Lot 8
- Google Calendar synchronisation → Lot 8
- Payment, formules, invoices → Lot 7 (the D-07 seam stays inert)
- Group sessions → Lot 6
- User and content administration, self-service deletion execution (`ADM-02`) → Lot 10
- Booking without an account (D-09) → never
- Public distinction between "réservé" and "bloqué" (D-23) → never
- Horizon and notice as back-office settings (D-13) → fixed values, not settings
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AGD-01 | Data model holds recurring availabilities per day, exceptions, reservations, and handles Europe/Paris | § Architecture Patterns → Pattern 1 (three-table model), Pattern 2 (wall-clock `time` + `AT TIME ZONE`, DST proven) |
| AGD-02 | Visitor sees a public monthly calendar and a list of free slots, past/blocked/taken greyed out | Pattern 3 (`app.creneaux_libres()` read-time expansion, `security definer`), Pattern 6 (static shell + client island) |
| AGD-03 | Administrator configures appointment types — label, duration, buffer, price | Pattern 1 → `app.type_rendez_vous`, seeded from `agenda.json` (D-21/D-22 seed idiom) |
| AGD-04 | Learner books in three screens from their account | Pattern 5 (`app.reserver_creneau()` RPC → typed outcome), Pattern 6, `04-UI-SPEC.md` surface table |
| AGD-05 | Two learners cannot book the same slot, enforced by a transactional lock in the database | Pattern 4 — **proven empirically**, SQLSTATE 23P01, incl. against an RLS-invisible row |
| AGD-06 | Confirmation email with `.ics`; trainer notified immediately | Pattern 7 (hand-rolled RFC 5545), Pattern 8 (extend `sendEmail` with Resend `attachments`) |
| AGD-07 | Administrator defines weekly hours, opens/greys/blocks ranges, sets holidays | Pattern 1 → `app.disponibilite_hebdomadaire` + `app.exception_agenda`; Pattern 9 (Easter computus, verified 2024–2028) |
| AGD-08 | Administrator views/moves/cancels reservations, books on behalf, exports the list | Pattern 5 (admin variants of the RPC), Pattern 10 (CSV for French Excel + injection guard) |
| AGD-09 | Reservation carries an order/confirmation state inert until Lot 7 | Pattern 4 → `statut` + `paiement_requis`; the partial `WHERE statut <> 'annulee'` on the exclusion constraint **is** the Lot 7 release mechanism |
</phase_requirements>

## Summary

Three findings dominate this phase, and all three cut against the shape the upstream documents assume.

**First, Postgres already owns the DST problem, so the JS side does not need a date library.** `((date + time '09:00') AT TIME ZONE 'Europe/Paris')` was run against this repo's own local Postgres 17.6 across both 2026 switches (2026-03-29 and 2026-10-25) and produced the correct, shifting UTC instants with a constant 8-hour wall-clock span. If the free-slot expansion happens in SQL — which D-02's "computed at read time" already implies — every instant the browser ever sees is already a correct `timestamptz`. What remains in JS is *formatting* (`Intl.DateTimeFormat` with `timeZone: "Europe/Paris"`, already pinned in `src/lib/i18n/fr.ts`) and *civil-calendar grid math* (which weekday the 1st falls on), neither of which is timezone arithmetic. `Temporal` is confirmed absent from the pinned runtime (`node v24.20.0`, `typeof Temporal === "undefined"`), so D-05's stated worry is real — but the right answer to it is **move the arithmetic to Postgres, not add a library**. Recommendation: **zero new dependencies**, with `temporal-polyfill@1.0.4` named as the fallback if the planner finds a case `Intl` genuinely cannot express.

**Second, the exclusion constraint works, needs no `btree_gist`, and PostgREST returns HTTP 400 for it — not 409.** All four claims were proven by running SQL and HTTP against the local stack (see § Code Examples). Because there is a single trainer, the constraint is range-only (`exclude using gist (plage with &&)`), and a range-only GiST exclusion needs no extension at all; `btree_gist` becomes necessary only the moment a scalar `=` column joins the constraint (proven: `42704 data type uuid has no default operator class for access method "gist"`). The HTTP 400 is the trap: `23P01` is not in PostgREST's status map, so a direct `.insert()` from the client surfaces as a generic bad request and the learner sees a raw error instead of `reservation.erreurs.creneauIndisponible`. The fix is structural — **all reservation writes go through a `security definer` RPC that catches `exclusion_violation` and `unique_violation` and returns a typed French-mappable outcome**, with direct `INSERT` on the reservation table revoked from `authenticated`. That single decision also collapses the booking-window check (D-13), the availability re-check, and the one-discovery-call rule (D-12) into one transaction, server-side, where a client cannot skip them.

**Third, three upstream statements contradicted the code or each other and had to be resolved before planning locked. All three are now resolved — see § Open Questions (RESOLVED) for each resolution; the paragraph below records what the contradictions were.** D-06 names `src/lib/supabase/public.ts` as the client-side loader, but that file opens with `import "server-only"` — it cannot be imported from a client island; the browser path is `src/lib/supabase/client.ts`. `04-UI-SPEC.md` introduces a **15-minute slot hold** (its decisions 27–29) that appears nowhere in `04-CONTEXT.md`'s 26 decisions and is structurally incompatible with D-07's "Lot 4 always writes `confirmee`" and with the exclusion constraint's `WHERE statut <> 'annulee'` predicate — a hold is a fourth reservation state or a fourth table, and either is a scope decision, not an implementation detail. And CLAUDE.md's "use queryKeys factory, prefer optimistic updates" presupposes TanStack Query, which is not in `package.json` and which the zero-dependency budget forbids. See § Open Questions.

**Primary recommendation:** Put the whole temporal model in Postgres — three tables (`type_rendez_vous`, `disponibilite_hebdomadaire`, `exception_agenda`), one reservation table with a partial range-only exclusion constraint, one `stable security definer` expansion function granted to `anon`, and one `volatile security definer` booking function granted to `authenticated` that returns a typed outcome. Add zero npm dependencies. Hand-roll the `.ics` (~40 lines, all times in UTC `Z`). Verify with SQL negative tests in `supabase/tests/`, exactly as `lot3_rls_isolation.sql` already does.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Zoned (Europe/Paris) date arithmetic, DST correctness | Database (Postgres) | — | `AT TIME ZONE` uses the server tzdata; proven correct across both 2026 switches. JS arithmetic is the exact failure mode D-05 fears. |
| Free-slot expansion from rules + exceptions (D-02) | Database (`stable security definer` function) | — | Reads `app.reservation`, which `anon` must never `SELECT` (D-23). A definer function is the only shape that hides the *reason* a slot is unavailable. |
| Double-booking refusal (AGD-05) | Database (exclusion constraint) | — | D-03 is explicit: "the application code does not have to be right". Constraints are enforced independently of RLS — proven. |
| Booking-window (D-13), one-discovery-call (D-12), availability re-check | Database (booking RPC, one transaction) | — | A client-side check is advisory only; the same transaction that inserts must be the one that validates. |
| Session + role gate for `/admin` (D-01) | Frontend Server (Next.js layout + middleware) | Database (RLS/grants) | Mirrors `/espace`'s `requireLearner()` redirect-before-markup pattern; RLS is the second, non-bypassable line. |
| Availability rendering, month navigation, slot grouping | Browser (client island) | Frontend Server (static shell) | D-06 requires `/agenda` prerendered; the island fetches after hydration. |
| Confirmation + trainer notification, `.ics` attachment (AGD-06) | Frontend Server (route handler) | External (Resend) | `RESEND_API_KEY` is server-only; `src/lib/email/resend.ts` is `server-only`. |
| CSV export (D-19) | Frontend Server (route handler, admin-gated) | Database (query) | Streaming personal data must pass the role gate on the server, never assembled in the browser. |
| Price/label source of truth (AGD-03) | Database (`type_rendez_vous`) | Static (`agenda.json` as seed input) | AGD-03 says "configurable"; D-24's fence says `agenda.json` is not edited. Seed DB *from* the JSON, exactly as `content:seed` does. |
| 15-minute slot retention (D-27) — grant, hide, lapse, release | Database (`app.maintien_creneau` + three `security definer` RPCs) | Browser (countdown display only) | *Added after the CONTEXT amendment.* Same reasoning as the two rows above it: the window is a server-side `interval '15 minutes'` literal so no client can widen it, the anti-join lives inside `creneaux_libres` so a hidden slot is indistinguishable from a booked one (D-23), and release-on-commit happens in the booking transaction. Expiry is a read-side predicate plus an inline purge — lazy, no scheduled job (D-02). **The browser tier owns only the countdown pixels: a lapsed timer must never gate a commit**, because the retention is advisory and the exclusion constraint decides (D-03, D-27). Lot 8 will need this row: a synced calendar must not treat a retention as a booking. |

## Standard Stack

### Core — nothing is added

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| PostgreSQL range types + GiST exclusion constraints | 17.6 (local; hosted Supabase matches) | Double-booking refusal, availability arithmetic | Built in. `[VERIFIED: run against this repo's local Postgres, see § Code Examples]` |
| `Intl.DateTimeFormat` (full ICU on Node 24) | native | All Europe/Paris rendering | `process.config` reports full ICU; `fr-FR` + `timeZone: "Europe/Paris"` verified on `node v24.20.0`. `[VERIFIED: local node]` |
| `@supabase/supabase-js` `.rpc()` | ^2.112.4 (installed) | Calling the two Postgres functions | Already the repo's only data path. `[VERIFIED: package.json]` |
| `@supabase/ssr` `createBrowserClient` | ^0.12.5 (installed) | The `/agenda` client island's anon read | `src/lib/supabase/client.ts` already wraps it with `<Database, "app">`. `[VERIFIED: source read]` |
| `zod` | ^4.4.3 (installed) | Boundary validation on every route handler + the new env var | CLAUDE.md mandate; `src/lib/validation/*.ts` is the idiom. `[VERIFIED: package.json]` |
| `@base-ui/react` | ^1.7.0 (installed) | The nine inherited primitives | No calendar primitive — confirmed in `04-UI-SPEC.md`. Grid is hand-written. `[CITED: 04-UI-SPEC.md]` |

### Deliberately NOT added

| Candidate | Weekly downloads | Why rejected |
|-----------|-----------------|--------------|
| `luxon@3.7.2` | 39.3M | Solves a problem Postgres already solved. ~70 kB into a bundle whose budget is zero. |
| `date-fns@4.4.0` + `@date-fns/tz@1.5.0` | 100M / 36M | Same. Note also that `date-fns-tz@3.2.0` (last published **2024-09-30**) is the *v3-era* package and is the wrong pairing for date-fns v4 — a common stale recommendation. |
| `temporal-polyfill@1.0.4` | 3.5M | The best of the three (tracks the finished Temporal spec, drops out cleanly when Node ships the global). **Named as the fallback**, not the default. |
| `ics@3.12.0` | 649k | Pulls `nanoid`, `runes2` and **`yup`** — a second validation library into a zod-only codebase. Not covered by the one-exception budget. |
| `ical-generator@11.1.1` | 674k | Zero runtime deps and the better of the two, but still not covered by the budget for a ~40-line output. |
| `@tanstack/react-query` | — | Would satisfy CLAUDE.md's queryKeys/optimistic-updates rule but is not installed and not budgeted. See Open Question 4. |

**Installation:** none. `package.json` and `package-lock.json` should show **zero diff** for this phase unless Open Question 1 or 4 is resolved in favour of a dependency.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Range-only `exclude using gist (plage with &&)` | `btree_gist` + `exclude (formateur_id with =, plage with &&)` | Only needed when a second resource exists (Lot 6 group sessions may need it). Adding `create extension if not exists btree_gist with schema extensions;` now costs nothing and future-proofs — **recommended anyway**, as a one-line additive migration, even though Lot 4 does not require it. |
| Read-time expansion in SQL | Expansion in a TypeScript service | Rejected: duplicates DST logic in a second language, and the anti-join against `app.reservation` would then need `anon` to read reservations, breaking D-23. |
| Booking through an RPC | Direct `.insert()` + client-side error mapping | Rejected: PostgREST returns 400 for `23P01` (proven), and the window/discovery-call checks would be client-side and skippable. |
| `.ics` hand-rolled | `ical-generator` | Hand-rolled wins on the dependency budget; the risk is RFC 5545 line folding and escaping, which the code example below handles explicitly. |

## Package Legitimacy Audit

> Run 2026-09-01. `slopcheck 0.6.1` was already installed. The `slopcheck install` wrapper crashed *after* the verdicts, at the `npm install` handoff — **no package was installed**; `git status --porcelain` is empty and `package.json` is untouched.

| Package | Registry | Age | Downloads/wk | Source Repo | slopcheck | Disposition |
|---------|----------|-----|--------------|-------------|-----------|-------------|
| `date-fns` | npm | 10+ yrs (4.4.0, 2026-05-29) | 100.0M | (slopcheck: none linked) | `[OK]` | **Not adopted** — Postgres owns the arithmetic |
| `@date-fns/tz` | npm | 1.5.0, 2026-05-21 | 36.0M | github.com/date-fns/tz | `[OK]` | **Not adopted** |
| `luxon` | npm | 3.7.2, 2025-09-05 | 39.3M | github.com/moment/luxon | `[OK]` | **Not adopted** |
| `temporal-polyfill` | npm | 1.0.4, 2026-08-13 | 3.5M | github.com/fullcalendar/temporal-polyfill | `[OK]` | **Fallback only** (Open Question 1) |
| `ics` | npm | 3.12.0, 2026-04-23 | 649k | github.com/adamgibbons/ics | `[OK]` | **Not adopted** — pulls `yup` |
| `ical-generator` | npm | 11.1.1, 2026-09-01 | 674k | github.com/sebbo2002/ical-generator | `[OK]` | **Not adopted** — budget |
| `date-fns-tz` | npm | 3.2.0, **2024-09-30** | 11.2M | github.com/marnusw/date-fns-tz | not run | **Rejected on staleness/version-pairing**, flagged so no plan reaches for it |

**Packages removed due to slopcheck `[SLOP]` verdict:** none.
**Packages flagged `[SUS]`:** none.
**`postinstall` scripts:** none on any candidate (`npm view <pkg> scripts.postinstall` empty for all six). `[VERIFIED: npm registry]`

Because the recommendation is **zero new dependencies**, no `checkpoint:human-verify` install gate is required. If Open Question 1 or 4 flips, the planner must add one.

## Architecture Patterns

### System Architecture Diagram

```
VISITOR (anonymous)                    LEARNER (authenticated)              ADMINISTRATOR
      │                                        │                                  │
      ▼                                        ▼                                  ▼
┌──────────────┐                     ┌──────────────────┐            ┌────────────────────┐
│ /agenda      │                     │ screens 1→2→3    │            │ /admin/*           │
│ STATIC shell │                     │ + success (4)    │            │ DYNAMIC, role-gated│
│ (prerendered)│                     │                  │            │ requireAdmin()     │
└──────┬───────┘                     └────────┬─────────┘            └─────────┬──────────┘
       │ hydrate                              │ POST                           │
       ▼                                      ▼                                ▼
┌──────────────────┐              ┌────────────────────────┐      ┌────────────────────────┐
│ client island    │              │ route handler (server) │      │ server components +    │
│ supabase/        │              │ zod → rpc → email      │      │ admin route handlers   │
│  client.ts (anon)│              │ session-scoped client  │      │ (hours, exceptions,    │
└──────┬───────────┘              └───────┬────────────────┘      │  reservations, CSV)    │
       │ .rpc()                           │ .rpc()                └───────┬────────────────┘
       │                                  │                               │
       ▼                                  ▼                               ▼
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║ POSTGRES — schema app                                                                  ║
║                                                                                        ║
║  app.creneaux_libres(type, du, au)          app.reserver_creneau(type, debut)          ║
║  STABLE · SECURITY DEFINER · grant anon     VOLATILE · SECURITY DEFINER · grant authed ║
║      │                                            │                                    ║
║      │ reads                                      │ 1. auth.uid() present?              ║
║      ▼                                            │ 2. re-check creneaux_libres         ║
║  disponibilite_hebdomadaire (dow, time, time)     │ 3. INSERT                           ║
║  exception_agenda (date, ouvert, motif)           │ 4. catch 23P01 → 'creneau_pris'     ║
║  type_rendez_vous (duree, tampon, prix)           │    catch 23505 → 'appel_deja_pris'  ║
║      │                                            ▼                                    ║
║      └──── anti-join ─────────────────────► reservation                                ║
║                                             ├ plage tstzrange GENERATED                ║
║                                             ├ EXCLUDE USING gist (plage &&)            ║
║                                             │   WHERE statut <> 'annulee'   ◄── AGD-05 ║
║                                             ├ UNIQUE (utilisateur_id)                  ║
║                                             │   WHERE type='decouverte' …   ◄── D-12   ║
║                                             ├ statut, paiement_requis        ◄── D-07  ║
║                                             └ RLS: self-read | admin-all               ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
                                       │
                                       ▼ (route handler, after commit)
                        ┌──────────────────────────────────┐
                        │ src/lib/email/resend.ts          │
                        │  + attachments[]  (NEW, additive)│
                        ├──────────────────────────────────┤
                        │ learner: confirmation + .ics     │
                        │ trainer: notification (contact.  │
                        │          coordonnees.email)      │
                        └──────────────────────────────────┘
```

### Recommended Project Structure

```
supabase/migrations/
  2026….._lot4_agenda.sql          # tables, constraints, functions, RLS
  2026….._lot4_agenda_grants.sql   # grants + execute grants (separate file — Lot 3 idiom)
supabase/tests/
  lot4_verrou_creneau.sql          # AGD-05 negative test (refusal-first, like lot3_rls_isolation.sql)
  lot4_rls_reservation.sql         # learner isolation + admin access
scripts/
  seed-agenda.mjs                  # D-21/D-22 — promote admin, seed types + typical week + holidays
src/lib/agenda/
  queries.ts                       # server reads (admin) — QueryResult<T> shape from content/queries.ts
  creneaux.ts                      # client-side grouping/grid helpers (Intl only, no TZ math)
  ics.ts                           # hand-rolled RFC 5545 VEVENT
  csv.ts                           # D-19, BOM + ';' + injection guard
src/lib/validation/
  reservation.ts                   # zod schemas (booking, admin hours, exceptions, export range)
src/lib/auth/
  session.ts                       # ADD requireAdministrator() alongside requireLearner()
src/app/api/reservation/route.ts   # POST — the booking commit
src/app/api/admin/…/route.ts       # admin writes + /export CSV
src/app/agenda/page.tsx            # static shell (rewrite)
src/app/reservation/…              # screens (rewrite)
src/app/admin/layout.tsx           # data-density="compact", role gate
src/components/agenda/…            # calendar grid, slot list, skeleton, stepper
src/components/admin/…             # shell, hours editor, holidays, reservation table
src/locales/fr/admin.json          # NEW — all admin copy
```

### Pattern 1: Three-table availability model (AGD-01, AGD-03, AGD-07)

**What:** Types, recurring weekly rules, and dated exceptions. No slot table (D-02).
**When to use:** This is the whole model.

```sql
-- Wall-clock, not instants: `time` (never `timetz`) so "9 h" survives both DST switches.
create table app.type_rendez_vous (
  id              text primary key,                       -- 'decouverte' | 'individuelle' (agenda.json ids)
  libelle         text not null,
  duree_minutes   int  not null check (duree_minutes > 0),
  tampon_minutes  int  not null default 15 check (tampon_minutes >= 0),   -- D-20
  prix_centimes   int  not null default 0 check (prix_centimes >= 0),     -- integer money, never float
  actif           boolean not null default true,
  ordre           int  not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table app.disponibilite_hebdomadaire (
  id            uuid primary key default gen_random_uuid(),
  jour_semaine  smallint not null check (jour_semaine between 1 and 7),  -- ISO-8601: 1=lundi … 7=dimanche
  heure_debut   time not null,
  heure_fin     time not null,
  actif         boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (heure_fin > heure_debut)
);

create table app.exception_agenda (
  id           uuid primary key default gen_random_uuid(),
  jour         date not null,
  ouvert       boolean not null default false,   -- D-17: a férié is seeded ouvert=false, reopened by flipping this
  motif        text not null default 'blocage' check (motif in ('blocage','ferie','ouverture')),
  libelle      text,                              -- "Lundi de Pâques"
  heure_debut  time,                              -- both null = whole day
  heure_fin    time,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check ((heure_debut is null) = (heure_fin is null)),
  check (heure_fin is null or heure_fin > heure_debut)
);

create unique index exception_agenda_ferie_unique
  on app.exception_agenda (jour) where motif = 'ferie';   -- makes the holiday seed idempotent (D-21)
```

**Notes for the planner.** `jour_semaine` must be documented as ISO (1=lundi) because Postgres offers both `extract(dow)` (0=dimanche) and `extract(isodow)` (1=lundi) — pick `isodow` and never mix. Prices live in centimes as integers; `agenda.json`'s `prix: 0 / 90` (euros) is the **seed input**, converted once in `scripts/seed-agenda.mjs`, so the D-24 fence on `agenda.json` holds while AGD-03 still gets a configurable price.

### Pattern 2: Wall clock → instant, at the database, per date

**What:** Materialise a rule's local hours onto a concrete date and get the correct UTC instant.
**Why it matters:** This is D-05's entire concern, resolved without JS.

```sql
-- VERIFIED against local Postgres 17.6 on 2026-09-01, session TZ = UTC:
--   2026-03-28 09:00 Paris → 2026-03-28 08:00+00   (CET,  UTC+1)
--   2026-03-29 09:00 Paris → 2026-03-29 07:00+00   (CEST, UTC+2)  ← spring switch
--   2026-10-24 09:00 Paris → 2026-10-24 07:00+00   (CEST)
--   2026-10-25 09:00 Paris → 2026-10-25 08:00+00   (CET)          ← autumn switch
-- In every case (17:00 - 09:00) = exactly 08:00:00 of wall-clock span.
select ((jour + heure_debut) at time zone 'Europe/Paris') as debut;
```

**Anti-pattern:** `debut + (duree || ' minutes')::interval` inside a `generated always as … stored` column. **Proven to fail**: `42P17 generation expression is not immutable`, because `timestamptz + interval` is `STABLE` (its day/month behaviour depends on `TimeZone`). Store `fin` as its own column and generate only the range from it (Pattern 4).

### Pattern 3: Read-time free-slot expansion (AGD-02, D-02, D-04, D-13, D-23)

**What:** One `stable security definer` function returning bookable instants for a type over a window.
**When to use:** Every public read; also the server-side re-check inside the booking RPC (Pattern 5).

```sql
create or replace function app.creneaux_libres(
  p_type_id text,
  p_du      date,
  p_au      date
)
returns table (debut timestamptz, fin timestamptz)
language sql
stable
security definer
set search_path = ''          -- mandatory: a definer function without this is CVE-shaped
as $$
  with t as (
    select duree_minutes, tampon_minutes
    from app.type_rendez_vous
    where id = p_type_id and actif
  ),
  jours as (
    select d::date as jour
    from generate_series(
      greatest(p_du, (now() at time zone 'Europe/Paris')::date),
      least(p_au,  ((now() + interval '8 weeks') at time zone 'Europe/Paris')::date),   -- D-13 horizon
      interval '1 day'
    ) d
  ),
  -- a day's open ranges: the weekly rules, unless a whole-day exception closes it,
  -- plus any `ouvert` exception range (a férié reopened, or an extra opening)
  plages as (
    select j.jour, r.heure_debut, r.heure_fin
    from jours j
    join app.disponibilite_hebdomadaire r
      on r.actif and r.jour_semaine = extract(isodow from j.jour)
    where not exists (
      select 1 from app.exception_agenda e
      where e.jour = j.jour and not e.ouvert and e.heure_debut is null
    )
    union all
    select e.jour, e.heure_debut, e.heure_fin
    from app.exception_agenda e
    join jours j on j.jour = e.jour
    where e.ouvert and e.heure_debut is not null
  ),
  -- D-04: one continuous declared range is chopped at read time by duree + tampon
  pas as (
    select
      (p.jour + p.heure_debut) at time zone 'Europe/Paris'
        + (g * (t.duree_minutes + t.tampon_minutes) * interval '1 minute') as debut,
      t.duree_minutes, t.tampon_minutes
    from plages p
    cross join t
    cross join lateral generate_series(
      0,
      (extract(epoch from (p.heure_fin - p.heure_debut))::int / 60
        - t.duree_minutes) / (t.duree_minutes + t.tampon_minutes)
    ) g
  )
  select
    pas.debut,
    pas.debut + (pas.duree_minutes * interval '1 minute') as fin
  from pas
  where pas.debut >= now() + interval '24 hours'                       -- D-13 notice
    -- partial-day blocages
    and not exists (
      select 1 from app.exception_agenda e
      where not e.ouvert and e.heure_debut is not null
        and tstzrange((e.jour + e.heure_debut) at time zone 'Europe/Paris',
                      (e.jour + e.heure_fin)   at time zone 'Europe/Paris', '[)')
            && tstzrange(pas.debut,
                         pas.debut + ((pas.duree_minutes + pas.tampon_minutes) * interval '1 minute'), '[)')
    )
    -- D-23: taken slots are simply absent — the visitor is never told *why*
    and not exists (
      select 1 from app.reservation res
      where res.statut <> 'annulee'
        and res.plage && tstzrange(pas.debut,
              pas.debut + ((pas.duree_minutes + pas.tampon_minutes) * interval '1 minute'), '[)')
    )
  order by 1;
$$;

grant execute on function app.creneaux_libres(text, date, date) to anon, authenticated;
```

**Why `security definer` is the correct choice here, not laziness:** the function anti-joins `app.reservation`, and `anon` must never hold `SELECT` on that table (it holds learner identities). A definer function is the only shape that lets an anonymous visitor learn "this instant is not offered" without learning *why*, which is precisely D-23. `set search_path = ''` plus fully-qualified names is mandatory — a definer function with a mutable search path is a privilege-escalation primitive.

**Anti-pattern:** returning a per-day `statut` enum (`libre | reserve | bloque | ferie`) to the public. That publishes the trainer's activity volume and directly violates D-23. Return **only the free instants**; the client derives `Libre / Indisponible / Passé` from presence, absence, and `now()`.

### Pattern 4: The reservation table and the lock (AGD-05, AGD-09, D-03, D-07, D-08, D-12)

```sql
create table app.reservation (
  id               uuid primary key default gen_random_uuid(),
  utilisateur_id   uuid references auth.users(id) on delete set null,   -- D-08
  type_id          text not null references app.type_rendez_vous(id),
  debut            timestamptz not null,
  fin              timestamptz not null,                 -- the meeting end — this is what the .ics carries
  fin_avec_tampon  timestamptz not null,                 -- D-03: "the locked range includes the buffer"
  plage            tstzrange generated always as (tstzrange(debut, fin_avec_tampon, '[)')) stored,
  statut           text not null default 'confirmee'
                     check (statut in ('confirmee','en_attente_paiement','annulee')),   -- D-07
  paiement_requis  boolean not null default false,                                       -- D-07
  lieu             text not null,                        -- D-15, snapshotted at booking time
  ics_uid          text not null unique,                 -- stable across Lot 8 updates
  ics_sequence     int  not null default 0,
  annulee_le       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (fin > debut and fin_avec_tampon >= fin),

  -- AGD-05. Partial by design: cancelling frees the slot, which is exactly the
  -- release path Lot 7 needs when a payment fails (AGD-09).
  constraint reservation_pas_de_chevauchement
    exclude using gist (plage with &&) where (statut <> 'annulee')
);

-- D-12: one non-cancelled discovery call per account.
create unique index reservation_un_seul_appel_decouverte
  on app.reservation (utilisateur_id)
  where type_id = 'decouverte' and statut <> 'annulee';

create trigger reservation_touch_updated_at
  before update on app.reservation
  for each row execute function app.touch_updated_at();   -- already exists, do not re-create
```

**Proven behaviours** (see § Code Examples for the transcripts):
- Overlapping insert → `SQLSTATE 23P01`, message `conflicting key value violates exclusion constraint`.
- Adjacent insert (`09:45` after a range ending `09:45`) → **accepted**, because `'[)')` is half-open. Do not use `'[]'`.
- Insert overlapping a row with `statut = 'annulee'` → accepted. The partial predicate works.
- Insert overlapping a row the inserting role **cannot `SELECT`** under RLS → still `23P01`. Constraints are evaluated independently of row-level security.
- Second discovery call → `SQLSTATE 23505`.
- Range-only exclusion needs **no `btree_gist`**; adding a scalar `=` column without it fails `42704`.

**On D-08 and the right to erasure.** Do **not** snapshot `apprenant_email` / `apprenant_nom` onto the reservation row "so the CSV export still works". `on delete set null` exists so the identity disappears; a snapshot would resurrect it and break CPT-09. Join `app.profil` at read time and render `"compte supprimé"` when `utilisateur_id is null`; the CSV exports the same. `[ASSUMED — A3]`

**RLS shape:**

```sql
alter table app.reservation enable row level security;
alter table app.type_rendez_vous enable row level security;
alter table app.disponibilite_hebdomadaire enable row level security;
alter table app.exception_agenda enable row level security;

-- helper, so every admin policy is one predicate instead of a repeated subquery
create or replace function app.est_administrateur()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from app.profil p
    where p.utilisateur_id = (select auth.uid()) and p.role = 'administrator'
  );
$$;

create policy reservation_self_select on app.reservation
  for select to authenticated using (utilisateur_id = (select auth.uid()));
create policy reservation_admin_all on app.reservation
  for all to authenticated using (app.est_administrateur()) with check (app.est_administrateur());

-- public reference data only. app.reservation gets NO anon policy at all.
create policy type_public_select on app.type_rendez_vous for select to anon, authenticated using (actif);
create policy dispo_admin_all   on app.disponibilite_hebdomadaire for all to authenticated
  using (app.est_administrateur()) with check (app.est_administrateur());
create policy exception_admin_all on app.exception_agenda for all to authenticated
  using (app.est_administrateur()) with check (app.est_administrateur());
```

Grants go in a **second** migration file, mirroring `20260831161000_lot3_grants.sql`. The critical one, and the reason it belongs in this document:

```sql
-- The learner NEVER holds INSERT on app.reservation. Every write is an RPC.
grant select on app.reservation, app.type_rendez_vous to authenticated;
grant select on app.type_rendez_vous to anon;
grant insert, update on app.reservation to authenticated;  -- ← DO NOT. See below.
```

Withhold `insert`/`update` on `app.reservation` from `authenticated` entirely. The `security definer` RPC owns every write; the admin's move/cancel go through admin RPCs or a service-role route handler behind `requireAdministrator()`. This is the same vertical-privilege-escalation control Lot 3 applied by withholding the `role` column privilege — RLS `with check` alone would let a learner write `paiement_requis = false` or `statut = 'confirmee'` directly, which is exactly the Lot 7 seam we are trying to protect.

### Pattern 5: Booking as a typed RPC (AGD-04, AGD-05, D-12, D-13)

**What:** One `volatile security definer` function; the only writer.
**Why:** PostgREST maps `23P01` to **HTTP 400**, not 409 — verified live. A raw `.insert()` cannot be turned into `reservation.erreurs.creneauIndisponible` reliably, and every business rule would be client-side.

```sql
create or replace function app.reserver_creneau(
  p_type_id text,
  p_debut   timestamptz,
  p_lieu    text
)
returns table (resultat text, reservation_id uuid)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := (select auth.uid());
  v_type  app.type_rendez_vous%rowtype;
  v_id    uuid;
begin
  if v_uid is null then
    return query select 'non_authentifie'::text, null::uuid; return;
  end if;

  select * into v_type from app.type_rendez_vous where id = p_type_id and actif;
  if not found then
    return query select 'type_inconnu'::text, null::uuid; return;
  end if;

  -- Never trust the client's instant: re-derive it from the same expansion the
  -- public list came from, inside this transaction.
  if not exists (
    select 1 from app.creneaux_libres(
      p_type_id,
      (p_debut at time zone 'Europe/Paris')::date,
      (p_debut at time zone 'Europe/Paris')::date
    ) c where c.debut = p_debut
  ) then
    return query select 'creneau_indisponible'::text, null::uuid; return;
  end if;

  begin
    insert into app.reservation (
      utilisateur_id, type_id, debut, fin, fin_avec_tampon, lieu, ics_uid
    ) values (
      v_uid, p_type_id, p_debut,
      p_debut + (v_type.duree_minutes * interval '1 minute'),
      p_debut + ((v_type.duree_minutes + v_type.tampon_minutes) * interval '1 minute'),
      p_lieu,
      gen_random_uuid()::text || '@formation-sap-ariba.fr'
    )
    returning id into v_id;
  exception
    when exclusion_violation then                 -- 23P01, AGD-05
      return query select 'creneau_indisponible'::text, null::uuid; return;
    when unique_violation then                    -- 23505, D-12
      return query select 'appel_decouverte_deja_reserve'::text, null::uuid; return;
  end;

  return query select 'ok'::text, v_id;
end;
$$;

grant execute on function app.reserver_creneau(text, timestamptz, text) to authenticated;
revoke execute on function app.reserver_creneau(text, timestamptz, text) from anon;
```

The route handler maps each `resultat` to a locale key. `'creneau_indisponible'` → `reservation.erreurs.creneauIndisponible` (already exists, unchanged per D-24 fence). `'appel_decouverte_deja_reserve'` → the new D-12 message pointing at the individual session.

**Anti-pattern:** advisory locks (`pg_advisory_xact_lock`). They are a second, weaker mechanism guarding what the exclusion constraint already guards absolutely, and they silently do nothing if a code path forgets to take one. D-03 chose the constraint precisely so "the application code does not have to be right".

**Anti-pattern:** `select … for update` on availability rows. There are no rows to lock — free slots are not materialised (D-02).

### Pattern 6: Static shell + client island (D-06, AGD-02)

**What:** `/agenda` prerenders; a `"use client"` island fetches after hydration.

```tsx
// src/components/agenda/agenda-booker.tsx
"use client";
import { createClient } from "@/lib/supabase/client";   // ← NOT supabase/public.ts (server-only)

const supabase = createClient();
const { data, error } = await supabase.rpc("creneaux_libres", {
  p_type_id: typeId, p_du: premierJour, p_au: dernierJour,
});
```

Two hard constraints for the planner:
1. `src/app/agenda/page.tsx` must not call `cookies()`, `headers()` or read `searchParams` at the top level — any of those forces the whole route dynamic in Next 16 and moves the static route count, which D-06 forbids. `[CITED: nextjs.org — "Accessing cookies, headers, or searchParams directly at the top level of a route forces the entire page into dynamic rendering"]`
2. Verify with `npm run build` and read the route table: `○` = static, `ƒ` = dynamic. The 13 pre-existing static routes must still show `○`.

### Pattern 7: Hand-rolled RFC 5545 `.ics` (AGD-06)

**What:** ~40 lines in `src/lib/agenda/ics.ts`. All instants emitted as UTC (`…Z`), so **no `VTIMEZONE` component is needed and DST cannot be got wrong**.

```ts
// src/lib/agenda/ics.ts
import "server-only";

const CRLF = "\r\n";

/** RFC 5545 §3.3.5 — basic-format UTC. */
function toIcsUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** RFC 5545 §3.3.11 — TEXT escaping. Backslash first, or it double-escapes. */
function escapeText(v: string): string {
  return v
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** RFC 5545 §3.1 — fold at 75 OCTETS (not chars): accented French copy is multi-byte. */
function fold(line: string): string {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let start = 0;
  while (start < bytes.length) {
    let end = Math.min(start + (out.length === 0 ? 75 : 74), bytes.length);
    // never split a UTF-8 continuation byte
    while (end > start && end < bytes.length && (bytes[end] & 0xc0) === 0x80) end -= 1;
    out.push((out.length === 0 ? "" : " ") + bytes.subarray(start, end).toString("utf8"));
    start = end;
  }
  return out.join(CRLF);
}

interface IcsInput {
  uid: string; sequence: number;
  debut: Date; fin: Date;
  titre: string; description: string; lieu: string;
  organisateurEmail: string; participantEmail: string;
  annule?: boolean;
}

export function construireIcs(e: IcsInput): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//formation-sap-ariba.fr//Agenda//FR",
    "CALSCALE:GREGORIAN",
    `METHOD:${e.annule ? "CANCEL" : "REQUEST"}`,
    "BEGIN:VEVENT",
    `UID:${e.uid}`,                       // stable across Lot 8 updates
    `SEQUENCE:${e.sequence}`,             // incremented on every move/cancel
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(e.debut)}`,
    `DTEND:${toIcsUtc(e.fin)}`,
    `SUMMARY:${escapeText(e.titre)}`,
    `DESCRIPTION:${escapeText(e.description)}`,
    `LOCATION:${escapeText(e.lieu)}`,
    `ORGANIZER;CN=${escapeText(e.titre)}:mailto:${e.organisateurEmail}`,
    `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED:mailto:${e.participantEmail}`,
    `STATUS:${e.annule ? "CANCELLED" : "CONFIRMED"}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join(CRLF) + CRLF;
}
```

`UID` uses the RFC 822 `localpart@domain` shape for maximum client compatibility `[CITED: github.com/adamgibbons/ics — configuration.md, "should ideally follow the RFC 822 format (localpart@domain)"]`. Persisting `ics_uid` and `ics_sequence` on the row is what lets Lot 8 send an update rather than a duplicate: same `UID`, `SEQUENCE + 1`, `METHOD:REQUEST` `[CITED: github.com/adamgibbons/ics — README FAQ, "increment the sequence number, provide the same uid, … set the method to 'REQUEST'"]`.

The `.ics` is served **twice**: as an email attachment (AGD-06) and as the screen-4 download CTA (`04-UI-SPEC.md`: "the `.ics` **is** the CTA"). Content type: `text/calendar; charset=utf-8; method=REQUEST`.

### Pattern 8: Attachments on the existing Resend transport (AGD-06)

`src/lib/email/resend.ts` currently posts `{from, to, subject, text}` only — **no attachment support exists**. Extend it additively; do not create a second sender (scope fence).

```ts
interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  attachments?: { filename: string; content: string; content_type?: string }[];
}
// … body: JSON.stringify({ from, to, subject, text, ...(attachments ? { attachments } : {}) })
```

`content` is a **base64 string** (`Buffer.from(ics, "utf8").toString("base64")`); `content_type` is derived from `filename` if omitted; the ceiling is 40 MB per email after base64 `[CITED: resend.com/docs/api-reference/emails/send-email]`.

Follow the contact route's failure discipline: the reservation row is already committed — **do not roll it back** if the send fails. Return the transport-error state; a booked slot with a failed email is recoverable by hand, a lost booking is not.

### Pattern 9: French public holidays, Easter in SQL (D-17, AGD-07)

The eleven French *jours fériés*: Jour de l'an (01-01), **Lundi de Pâques (Pâques + 1)**, Fête du Travail (05-01), Victoire 1945 (05-08), **Ascension (Pâques + 39)**, **Lundi de Pentecôte (Pâques + 50)**, Fête nationale (07-14), Assomption (08-15), Toussaint (11-01), Armistice (11-11), Noël (12-25). Easter Sunday itself is **not** a *jour férié* in France — do not seed it.

Anonymous Gregorian computus, **verified in this repo's Postgres against known dates**:

| Année | Pâques | Lundi de Pâques | Ascension | Lundi de Pentecôte |
|---|---|---|---|---|
| 2024 | 2024-03-31 ✓ | 2024-04-01 | 2024-05-09 | 2024-05-20 |
| 2025 | 2025-04-20 ✓ | 2025-04-21 | 2025-05-29 | 2025-06-09 |
| 2026 | 2026-04-05 ✓ | 2026-04-06 | 2026-05-14 | 2026-05-25 |
| 2027 | 2027-03-28 ✓ | 2027-03-29 | 2027-05-06 | 2027-05-17 |
| 2028 | 2028-04-16 ✓ | 2028-04-17 | 2028-05-25 | 2028-06-05 |

Ship it as `app.paques(annee int) returns date language sql immutable` (SQL text in § Code Examples) so no annual re-seed is ever needed, and generate the eleven rows for the current and next year from `scripts/seed-agenda.mjs`, upserting on the `exception_agenda_ferie_unique` index (D-21 idempotence).

Holiday labels are French copy → they belong in `src/locales/fr/admin.json` and are read by the seed script, exactly as `scripts/seed-content.mjs` reads `src/locales/fr/*.json`. Nothing French is authored inside a `.mjs` or `.sql` file.

### Pattern 10: CSV for French Excel (D-19, AGD-08)

```ts
const BOM = "﻿";           // without it, Excel FR renders é as Ã©
const SEP = ";";                // Excel FR's list separator; a comma puts every row in one cell
const EOL = "\r\n";

/** CSV/formula injection guard — a cell starting with these is executed by Excel. */
function cell(v: string): string {
  const neutralise = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${neutralise.replace(/"/g, '""')}"`;
}
```

Response: `Content-Type: text/csv; charset=utf-8`, `Content-Disposition: attachment; filename="reservations-YYYY-MM-DD.csv"`. Columns fixed by D-19: **date, type, durée, apprenant, email, statut** — and the UI must state them before the export runs (`04-UI-SPEC.md`). Erased accounts export as `"compte supprimé"` with an empty email (D-08).

### Anti-Patterns to Avoid

- **Expanding slots in TypeScript.** Duplicates the DST logic in a second language and forces `anon` to read `app.reservation`.
- **Trusting a client-supplied `debut`.** The RPC must re-derive it from `creneaux_libres`; otherwise a crafted request books outside the window (D-13) or on a *jour férié*.
- **Returning a per-day status enum to the public.** Violates D-23 by publishing activity volume.
- **`'[]'` range bounds.** Makes a 09:00–09:45 and a 09:45–10:30 appointment collide. Always `'[)')`.
- **A generated column that adds an `interval`.** `42P17`, proven.
- **Granting `insert` on `app.reservation` to `authenticated`.** Bypasses the window, the discovery-call rule, and the Lot 7 seam.
- **A `security definer` function without `set search_path = ''`.** Privilege-escalation primitive.
- **Storing `heure_debut` as `timetz`.** `timetz` pins a fixed offset and is exactly wrong across a DST switch; the SQL standard's own committee discourages it.
- **Re-creating `app.touch_updated_at()`.** It exists. Attach a trigger to it (Lot 3 precedent).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Two learners racing for a slot | An application-level "is it free?" check then insert | `exclude using gist (plage with &&) where (statut <> 'annulee')` | The check-then-act window is real under concurrency. D-03 is explicit. |
| Wall-clock → instant across DST | JS `Date` + offset arithmetic | Postgres `(date + time) at time zone 'Europe/Paris'` | Proven correct across both 2026 switches; JS `Date` has no IANA arithmetic at all. |
| Rendering a French date/hour/price | Template strings, hand-written `" h"` / `"€"` | `src/lib/i18n/fr.ts` formatters | The repo's existing `currencyFormatter`/`hourFormatter` comments say this is exactly the bug class they exist to prevent. |
| One discovery call per account | A `count(*)` before insert | Partial unique index | Same race. Proven: `23505`. |
| Easter | Hardcoding dates per year | `app.paques(annee)` computus, verified 2024–2028 | Never needs a re-seed. |
| Cookie/session handling on the booking POST | A new auth path | `src/lib/supabase/server.ts` + `requireLearner()` | Lot 3 solved it; `middleware.ts`'s positive matcher just gains `/admin`. |
| Signed/expiring links, role gating | New helpers | `src/lib/documents/signed-url.ts`, `src/lib/auth/session.ts` | Existing, tested, RLS-aware. |

**Key insight:** every genuinely hard problem in this phase is a *concurrency* or *timezone* problem, and Postgres solves both classes at the storage layer where they cannot be bypassed. The custom code that remains — the `.ics`, the CSV, the calendar grid — is the easy, deterministic part, which is exactly why hand-rolling those is cheap and adding libraries for them is not.

## Common Pitfalls

### Pitfall 1: Expecting HTTP 409 from a double-booking
**What goes wrong:** The route handler branches on `status === 409`; the learner sees a raw error instead of `reservation.erreurs.creneauIndisponible`.
**Why:** PostgREST maps `23503` and `23505` to 409 but has **no mapping for `23P01`**, so it falls through to 400. **Verified live** against this stack: body `{"code":"23P01", …}`, `http=400`.
**How to avoid:** Never branch on HTTP status. Route every write through the RPC (Pattern 5) and branch on the typed `resultat` string.
**Warning signs:** any `if (error.code === "23P01")` in TypeScript, or any `.from("reservation").insert(…)`.

### Pitfall 2: `import "server-only"` in the client island
**What goes wrong:** Following D-06 literally — importing `src/lib/supabase/public.ts` into a `"use client"` component — is a build error.
**Why:** That file is deliberately `server-only`. Its docblock says so.
**How to avoid:** Use `src/lib/supabase/client.ts` (`createBrowserClient`). Note this in the plan so a reviewer does not "fix" it back.

### Pitfall 3: `/agenda` silently going dynamic
**What goes wrong:** The static route count moves, breaking D-06 and Lot 2's recette criterion.
**Why:** Any top-level `cookies()`, `headers()` or `searchParams` read. `searchParams` is the likely accident here — "return the visitor to the chosen slot" (D-09) invites `?creneau=…`.
**How to avoid:** Keep slot state in client state or `sessionStorage`, or read `searchParams` inside the `"use client"` island via `useSearchParams()` under a `Suspense` boundary — never in the page's server component.
**Warning signs:** `ƒ /agenda` in `npm run build` output.

### Pitfall 4: Buffer double-counting
**What goes wrong:** The `.ics` shows a 45-minute discovery call, or slots are spaced 30 minutes apart with a 15-minute buffer that never applies.
**Why:** D-03 puts the buffer inside the **locked range** while the meeting itself is `duree_minutes`. Two different end instants.
**How to avoid:** Two columns — `fin` (the `.ics`, the recap, the CSV "durée") and `fin_avec_tampon` (the `plage` and therefore the constraint). The step between consecutive offered slots is `duree + tampon`.

### Pitfall 5: `dow` vs `isodow`
**What goes wrong:** Every availability lands one day off, and only sometimes visibly.
**Why:** `extract(dow)` is 0=Sunday; `extract(isodow)` is 1=Monday. Seeding "Monday–Friday" (D-22) with one and querying with the other is a silent shift.
**How to avoid:** Pick `isodow` (1–7), put it in the `check` constraint and the column comment, and make the seed script use the same numbering.

### Pitfall 6: A definer function with a mutable search path
**What goes wrong:** A privilege-escalation vector — `app.creneaux_libres` and `app.reserver_creneau` run as the owner.
**How to avoid:** `set search_path = ''` on every one, fully-qualify every identifier. Lot 3's `app.creer_profil_pour_nouvel_utilisateur()` already sets the precedent — copy it.

### Pitfall 7: Excel mangling the export
**What goes wrong:** Accents become mojibake, or all six columns land in one cell, or a learner name beginning `=` is executed as a formula.
**How to avoid:** UTF-8 BOM + `;` + CRLF + the injection guard in Pattern 10.

### Pitfall 8: Assuming a `db reset` is free
**What goes wrong:** The local Supabase stack is **shared between worktrees** (D-25/CONTEXT `<domain>`). A `supabase db reset` wipes seeded Lot 2 content that the Lot 2 worktree re-reads at build time.
**How to avoid:** Honour the stated execution precondition (Lot 2 merged first), and re-run `npm run content:seed` after every reset.

## Code Examples

All transcripts below are from commands run against this repository's own local Supabase Postgres (`supabase_db_ElearningAriba`, PostgreSQL 17.6) on 2026-09-01. Every probe object was dropped afterwards; `git status --porcelain` is empty and `\dt app.*` shows the same six Lot 1–3 tables.

### AGD-05 proof — the constraint, its SQLSTATE, and its half-open bound

```sql
create table scratch.t_b (
  id uuid primary key default gen_random_uuid(),
  debut timestamptz not null, fin timestamptz not null,
  statut text not null default 'confirmee',
  plage tstzrange generated always as (tstzrange(debut, fin, '[)')) stored,
  constraint t_b_pas_de_chevauchement
    exclude using gist (plage with &&) where (statut <> 'annulee')
);
insert into scratch.t_b (debut, fin) values ('2026-09-08 09:00+02','2026-09-08 09:45+02');   -- INSERT 0 1
insert into scratch.t_b (debut, fin) values ('2026-09-08 09:30+02','2026-09-08 10:15+02');   -- overlap
insert into scratch.t_b (debut, fin) values ('2026-09-08 09:45+02','2026-09-08 10:30+02');   -- adjacent
insert into scratch.t_b (debut, fin, statut)
  values ('2026-09-08 09:00+02','2026-09-08 09:45+02','annulee');                            -- cancelled overlap
```

```
NOTICE:  TEST B: overlap refused SQLSTATE=23P01
         msg=conflicting key value violates exclusion constraint "t_b_pas_de_chevauchement"
INSERT 0 1        ← adjacent accepted ('[)')
INSERT 0 1        ← cancelled overlap accepted (partial WHERE)
 rows_in_t_b
-------------
           3
```

### `btree_gist` is not required for a range-only constraint

```
DROP EXTENSION
NOTICE:  TEST C: range-only EXCLUDE works WITHOUT btree_gist
NOTICE:  TEST D (no btree_gist): 42704 data type uuid has no default operator class
                                 for access method "gist"
```

`pg_available_extensions` reports `btree_gist 1.7` available and not installed. `pgcrypto` is installed **in schema `extensions`** — if the planner adds `btree_gist` for Lot 6 future-proofing, use `create extension if not exists btree_gist with schema extensions;` to match, not the bare form (which lands it in `public`).

### The generated-column trap

```
NOTICE:  TEST A FAILED: 42P17 / generation expression is not immutable
--        create table … plage tstzrange generated always as
--          (tstzrange(debut, debut + (duree || ' minutes')::interval, '[)')) stored
```

### D-12 — one discovery call per account

```sql
create unique index t_e_un_seul_appel on scratch.t_e (utilisateur_id)
  where type_id = 'decouverte' and statut <> 'annulee';
```
```
NOTICE:  TEST E: second discovery call refused SQLSTATE=23505
```

### The constraint fires against a row RLS hides from the inserter

```
NOTICE:  RLS TEST: overlap with an INVISIBLE row refused, SQLSTATE=23P01
```

*(The `set local role` in that probe warned it was outside a transaction block, so the identity switch was incomplete. The refusal itself is real and matches settled Postgres semantics — table constraints are evaluated before and independently of RLS. **The plan must still prove this properly**, with a real `request.jwt.claims`, inside `supabase/tests/lot4_verrou_creneau.sql`, exactly as CONTEXT `<specifics>` demands.)*

### PostgREST returns 400, not 409 — verified over HTTP

```
POST /rest/v1/zz_probe  (Content-Profile: app)  → insert1 http=201
POST /rest/v1/zz_probe  (overlapping)           →
{"code":"23P01","details":"Key conflicts with existing key.","hint":null,
 "message":"conflicting key value violates exclusion constraint \"zz_probe_plage_excl\""}
http=400
```

### Europe/Paris across both 2026 DST switches

```
    jour    |       debut_utc        |        fin_utc         | duree_reelle
------------+------------------------+------------------------+--------------
 2026-03-28 | 2026-03-28 08:00:00+00 | 2026-03-28 16:00:00+00 | 08:00:00
 2026-03-29 | 2026-03-29 07:00:00+00 | 2026-03-29 15:00:00+00 | 08:00:00   ← spring
 2026-10-24 | 2026-10-24 07:00:00+00 | 2026-10-24 15:00:00+00 | 08:00:00
 2026-10-25 | 2026-10-25 08:00:00+00 | 2026-10-25 16:00:00+00 | 08:00:00   ← autumn
```

### Easter computus, SQL, verified

```sql
create or replace function app.paques(annee int) returns date
language sql immutable set search_path = '' as $$
  with c as (select annee/100 as siecle, annee%19 as g),
  h as (select ((siecle - siecle/4 - (8*siecle+13)/25 + 19*g + 15) % 30) as h, siecle, g from c),
  i as (select h - (h/28)*(1 - (29/(h+1))*((21-g)/11)) as i, siecle, g, h from h),
  j as (select i, (annee + annee/4 + i + 2 - siecle + siecle/4) % 7 as j, siecle, g from i),
  l as (select i - j as l from j)
  select make_date(annee, 3 + (l+40)/44, l + 28 - 31*((l+40)/44)) from l;
$$;
```

### `Intl` covers every rendering need — no library

```
node v24.20.0 · typeof Temporal === "undefined" · full ICU
local date of 2026-10-25T00:30Z (Europe/Paris) = 2026-10-25
fr time (timeStyle:'short')                    = 02:30
weekday+date (weekday/day/month long)          = dimanche 25 octobre
h23 formatToParts                              = hour:02 literal:: minute:30
```

The `en-CA`/`sv-SE` `formatToParts` idiom yields an ISO `YYYY-MM-DD` **in Europe/Paris** — that is how the client groups a list of `timestamptz` into calendar days without any date library.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `date-fns-tz` for zoned work | date-fns v4 with `@date-fns/tz`'s `TZDate` | date-fns v4, 2024 | `date-fns-tz@3.2.0` (2024-09-30) is v3-era; a plan that pairs it with date-fns v4 is pairing across a major. Moot here — neither is adopted. |
| `moment-timezone` | Luxon / Temporal / native `Intl` | Moment in maintenance mode since 2020 | Nothing should reach for moment. |
| Temporal as "coming soon" | Stage-4, shipping; `temporal-polyfill@1.0.4` (2026-08-13) tracks the finished spec | 2026 | **Not on Node 24.20.0** — verified. Re-verify before Lot 8; if the global lands, the fallback becomes free. |
| Application-level booking locks | Postgres `EXCLUDE USING gist` on ranges | Postgres 9.0 (2010) — long settled | The standard answer; PG18 adds temporal `PRIMARY KEY … WITHOUT OVERLAPS`, irrelevant on PG17. |
| Pages Router `getServerSideProps` | App Router server components + `Suspense`-scoped dynamic reads | Next 13→16 | Dynamic APIs at the top level force the whole route dynamic — the D-06 constraint. |

**Deprecated/outdated:** `moment`/`moment-timezone`; `date-fns-tz` for date-fns v4; `timetz` as a column type; PostgREST 409 as the assumed status for any class-23 error.

## Project Constraints (from CLAUDE.md)

| Directive | How Lot 4 complies | Risk |
|---|---|---|
| Never `any`; Zod at boundaries | `npm run db:types` after each migration gives typed `.rpc()` returns; a zod schema per route handler in `src/lib/validation/reservation.ts` | RPC return types come through as typed rows once regenerated — do not cast |
| Never hardcode text; all strings in `src/locales/fr/` | New `src/locales/fr/admin.json`; additive keys in `agenda.json` (legend), `reservation.json`, `espace.json`, `emails.json`. Holiday labels read by the seed script from JSON | The `.ics` `SUMMARY`/`DESCRIPTION` and every email line are French copy → locale files, not the `.ts` |
| show/hide based on user role | `requireAdministrator()` beside `requireLearner()`; `/admin` redirects before markup; RLS + withheld grants as the non-bypassable layer | A UI-only gate is not a gate |
| queryKeys factory, prefer optimistic updates | **Cannot be satisfied as written** — no TanStack Query in `package.json`, zero-dependency budget. See Open Question 4 | Blocking ambiguity for the planner |
| DO NOT write tests unless explicitly requested | CONTEXT `<specifics>` **explicitly requests** the AGD-05 negative test. Scope tests to `supabase/tests/*.sql` only — no JS test framework | Adding vitest/jest would breach both this rule and the dependency budget |
| DO NOT run dev server | Verify with `npm run build` + `psql` transcripts, never `npm run dev` | — |
| Comments explain "why", not "what" | Match the density of `resend.ts` / `middleware.ts` / the Lot 3 migrations | — |
| Commit format `#<type>: <sentence>`, never mention AI/phases | `#feat: add availability model and booking lock` | — |
| Never `git push`, never switch branch | Scope fence | — |

## Runtime State Inventory

> Lot 4 is additive/greenfield, not a rename — but it does introduce **new** runtime state whose bootstrap lives outside git, so the categories are answered rather than omitted.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None pre-existing. Lot 4 **creates** four tables; `app.reservation` becomes the first table holding appointment personal data → must be added to the Lot 5 RGPD register and to `src/lib/rgpd/export.ts` | Extend the existing RGPD export path; do not create a second one |
| Live service config | None. No n8n/Datadog/Cloudflare in this project. Vercel project `elearning-ariba` needs the new video-link env var per environment (CIO) | CIO sets `NEXT_PUBLIC_…` or server-only var on preview + production |
| OS-registered state | None — verified: no scheduled tasks, no pm2, no cron. D-02 forbids a generation job, so Lot 4 introduces no scheduled work at all | none |
| Secrets / env vars | `.env.local` currently sets 4 of 6 documented vars. **`RESEND_API_KEY` is empty locally** → AGD-06 cannot be sent end-to-end on this machine. New var for D-15 (trainer video link) must be added to `src/lib/env/server.ts`, `.env.example`, and every hosted environment | Add zod entry (optional-at-boot, strict-at-use, following `RESEND_API_KEY`'s D-48 precedent); CIO provisions hosted values |
| Build artifacts | `src/types/database.types.ts` is generated and **will be stale** the moment the migration lands | `npm run db:types` is a required step in the same plan as the migration, and its diff is committed |
| Database bootstrap | The administrator promotion (D-21) and the typical week (D-22) live in a seed script, not a migration — so a fresh environment has zero availability until it is run | `scripts/seed-agenda.mjs` + a `package.json` script; CIO runs per environment (already in CONTEXT `<hosted_dependencies>`) |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | everything | ✓ | v24.20.0 (matches `.nvmrc` / `engines`) | — |
| Full ICU (`fr-FR` + Europe/Paris) | all rendering | ✓ | full-icu confirmed | — |
| `Temporal` global | D-05 (if a library route were chosen) | ✗ | `undefined` | `temporal-polyfill@1.0.4` — **not needed** under this research's recommendation |
| Docker | local Supabase stack | ✓ | running | — |
| Supabase local stack | migrations, RLS/lock tests | ✓ | 10 containers up (`imgproxy`, `analytics`, `vector`, `pooler` stopped — none needed) | — |
| PostgreSQL | data layer | ✓ | 17.6, schema `app` exposed via `config.toml` | — |
| `btree_gist` | only if a scalar `=` joins the constraint | ✓ available, ✗ installed | 1.7 | Not required for Lot 4's range-only constraint |
| Supabase CLI | `db reset`, `gen types` | ✓ | 2.116.0 (via `npx`) | — |
| `psql` on PATH | running `supabase/tests/*.sql` | ✗ | — | **`docker exec -i supabase_db_ElearningAriba psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f <file>`** — verified working |
| `RESEND_API_KEY` | AGD-06 send | ✗ (empty in `.env.local`) | — | `sendEmail` throws `EmailTransportError` by design; verify the `.ics` string and the payload shape locally, gate the real send on the CIO |
| Trainer video-link env var (D-15) | AGD-06, `.ics` `LOCATION` | ✗ (does not exist yet) | — | Add to the zod schema now; CIO supplies the value (already a listed hosted dependency) |
| Google OAuth / custom SMTP / `supports` bucket | — | ✗ | — | **Not Lot 4 dependencies** — CONTEXT is explicit |

**Missing with no fallback:** none blocking local build or planning.
**Missing with fallback:** `psql` (use `docker exec`); `RESEND_API_KEY` (local send unverifiable — this is a hosted-recette item, not a build blocker).

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | **None, deliberately.** No vitest/jest/playwright in `package.json`; CLAUDE.md forbids unrequested tests; the dependency budget is zero. The project's proven verification idiom is **SQL negative tests + build assertions on rendered output** |
| Config file | none — see Wave 0 |
| Existing harness | `supabase/tests/lot3_rls_isolation.sql` — single transaction, `begin` … `rollback`, `raise exception` on a failed assertion, refusal-first, with positive *and* negative controls |
| Quick run command | `docker exec -i supabase_db_ElearningAriba psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f supabase/tests/lot4_verrou_creneau.sql` |
| Full suite command | `npm run lint && npm run typecheck && npm run build` **plus** every file in `supabase/tests/` through the command above |

### Phase Requirements → Test Map

| Req | Behaviour | Type | Automated command | Exists? |
|-----|-----------|------|-------------------|---------|
| AGD-01 | Weekly rule at 09:00 Paris resolves to `08:00Z` before 2026-03-29 and `07:00Z` after | SQL assertion | `psql -f supabase/tests/lot4_dst.sql` | ❌ Wave 0 |
| AGD-02 | `creneaux_libres` omits past, blocked, holiday and taken instants; offers nothing < 24 h or > 8 weeks | SQL assertion | `psql -f supabase/tests/lot4_creneaux_libres.sql` | ❌ Wave 0 |
| AGD-02 | `/agenda` still prerenders `○` | build assertion | `npm run build` → route table shows `○ /agenda` | ✅ (`build` exists) |
| AGD-03 | Types seeded from `agenda.json`; a second seed run is a no-op | script assertion | run `seed-agenda` twice, compare row counts | ❌ Wave 0 |
| AGD-04 | 3 screens + 1 success surface; screen 3 is the only auth gate | human visual gate (D-26) | `checkpoint:human-verify` per surface plan | ❌ Wave 0 |
| **AGD-05** | **A second overlapping insert is refused by the DATABASE, incl. against an RLS-invisible row** | **SQL negative test — explicitly requested by CONTEXT `<specifics>`** | `psql -f supabase/tests/lot4_verrou_creneau.sql` | ❌ Wave 0 |
| AGD-05 | `reserver_creneau` returns `'creneau_indisponible'`, never a raw error | SQL assertion | same file | ❌ Wave 0 |
| AGD-06 | `.ics` parses: CRLF endings, `UID`/`SEQUENCE`/`DTSTART…Z` present, accented `SUMMARY` folded at 75 octets | script assertion | `node --experimental-strip-types scripts/check-ics.mts` *(or fold into the build)* | ❌ Wave 0 |
| AGD-06 | Both emails carry the video link and the attachment | manual (no local Resend key) | hosted recette | ❌ CIO |
| AGD-07 | Eleven *fériés* seeded closed for the current + next year; Easter matches the verified table | SQL assertion | `psql -f supabase/tests/lot4_feries.sql` | ❌ Wave 0 |
| AGD-07/08 | A learner cannot read, write, move or cancel any reservation but their own; an administrator can do all | SQL negative test | `psql -f supabase/tests/lot4_rls_reservation.sql` | ❌ Wave 0 |
| AGD-08 | CSV opens in Excel FR with the six D-19 columns; a `=`-leading name is neutralised | manual + string assertion | inspect bytes: BOM present, `;` separator | ❌ Wave 0 |
| AGD-09 | Cancelling frees the slot; `paiement_requis` defaults `false`; `en_attente_paiement` still holds the lock | SQL assertion | `psql -f supabase/tests/lot4_verrou_creneau.sql` | ❌ Wave 0 |
| all | typecheck/lint/build green; the 13 static routes stay `○` | build | `npm run lint && npm run typecheck && npm run build` | ✅ |

### Sampling Rate

- **Per task commit:** `npm run lint && npm run typecheck`
- **Per DB task:** the relevant `supabase/tests/*.sql` file via `docker exec … psql -v ON_ERROR_STOP=1 -f`
- **Per wave merge:** `npm run build` + every `supabase/tests/*.sql` (including Lot 3's `lot3_rls_isolation.sql`, which must stay green — proof the migrations are additive)
- **Phase gate:** full suite green + every D-26 visual gate signed off, before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `supabase/tests/lot4_verrou_creneau.sql` — AGD-05, AGD-09
- [ ] `supabase/tests/lot4_rls_reservation.sql` — AGD-04, AGD-07, AGD-08
- [ ] `supabase/tests/lot4_creneaux_libres.sql` — AGD-02, D-13
- [ ] `supabase/tests/lot4_dst.sql` — AGD-01, D-05
- [ ] `supabase/tests/lot4_feries.sql` — AGD-07, D-17
- [ ] `.ics` shape assertion (script or build step) — AGD-06
- [ ] Framework install: **none** — do not add one

## Security Domain

ASVS level 1, `security_block_on: high`.

### Applicable ASVS Categories

| Category | Applies | Standard control in this phase |
|---|---|---|
| V2 Authentication | yes (consumer) | Supabase GoTrue via Lot 3. No new auth path. `middleware.ts`'s positive matcher gains `/admin`. |
| V3 Session Management | yes (consumer) | `supabase.auth.getUser()` (validates against the auth server) — never `getSession()`. Precedent already in `src/middleware.ts`. |
| V4 Access Control | **yes — the phase's main surface** | Three layers: `requireAdministrator()` redirect; RLS policies via `app.est_administrateur()`; **withheld table privileges** (no `insert`/`update` on `app.reservation` for `authenticated`). `security definer` functions all carry `set search_path = ''`. |
| V5 Input Validation | yes | zod on every route handler; **`reserver_creneau` re-derives the instant server-side** rather than trusting `p_debut`; CSV injection guard on export. |
| V6 Cryptography | no | No new crypto. `gen_random_uuid()` (pgcrypto, already installed) for ids and `.ics` `UID`. |
| V7 Error Handling / Logging | yes | Never surface a raw `PostgrestError` to the learner — the RPC's typed `resultat` maps to a locale key. Never log the Resend key (`resend.ts` already says so). |
| V8 Data Protection / Privacy | yes | Appointment data is personal data: `anon` gets **no** policy on `app.reservation`; D-23 hides *why* a slot is unavailable; `on delete set null` with **no identity snapshot**; D-19's exported columns documented in the UI. |
| V12 Files / Resources | yes (light) | `.ics` and `.csv` are generated, never uploaded. Sanitise the filename; set `Content-Disposition: attachment`. |
| V13 API | yes | POST-only handlers, no GET list of reservations, mirroring `api/contact/route.ts`'s stated discipline. |

### Known Threat Patterns for Next.js + Supabase + Postgres

| Pattern | STRIDE | Mitigation |
|---------|--------|------------|
| Learner forges `p_debut` to book outside the window / on a férié | Tampering | RPC re-derives from `creneaux_libres` in the same transaction |
| Learner writes `statut`/`paiement_requis` directly, pre-empting Lot 7 | Elevation of Privilege | Withhold `insert`/`update` grants; RPC is the only writer |
| Learner promotes self to `administrator` to reach `/admin` | Elevation of Privilege | Lot 3 already withholds the `role` column privilege; Lot 4 must not grant it back. Assert in `lot4_rls_reservation.sql`. |
| `security definer` + mutable `search_path` | Elevation of Privilege | `set search_path = ''` + fully-qualified names on all three new functions |
| Visitor enumerates the trainer's bookings via the public agenda | Information Disclosure | D-23 — return only free instants; `anon` holds no privilege on `app.reservation` |
| Race to the same slot | Tampering | Exclusion constraint (proven) |
| Free-account spam to hoard discovery calls | Denial of Service | D-12 partial unique index (per account) **plus** the existing IP-keyed `src/lib/rate-limit.ts` on the booking route — CONTEXT names the IP-only limit as insufficient alone |
| CSV formula injection into the trainer's Excel | Tampering / RCE-adjacent | Prefix-quote `= + - @ \t \r` |
| Service-role key reaching the browser | Information Disclosure | `src/lib/supabase/service.ts` is `server-only`; Lot 4 has **no** legitimate service-role caller — prefer the session-scoped client behind `requireAdministrator()` |
| Header injection via `Content-Disposition` filename | Tampering | Filename derived from a date, never from user input |

## Assumptions Log

| # | Claim | Section | Risk if wrong |
|---|---|---|---|
| A1 | Hosted Supabase (`eu-west-3`) runs the same PG major and offers `btree_gist`, matching the local 17.6 probe | Standard Stack, Pattern 4 | Low — verified locally only; the range-only constraint needs no extension at all, so the risk is confined to a future Lot 6 need |
| A2 | The eleven French *jours fériés* listed are the complete national set for a Paris-based trainer (Alsace-Moselle has two more) | Pattern 9 | Low — D-17 says "the eleven"; the trainer can add their own closures anyway |
| A3 | Not snapshotting learner identity on the reservation is the correct reading of D-08 + CPT-09 | Pattern 4 | Medium — if the founder wants the historical name preserved for accounting, this reverses, and RGPD advice is then needed |
| A4 | `text/calendar; method=REQUEST` + `ORGANIZER`/`ATTENDEE` is the right `.ics` shape for Lot 8 updates (vs `METHOD:PUBLISH` for a plain download) | Pattern 7 | Medium — `REQUEST` makes Gmail/Outlook render an RSVP invite, which may not be the founder's intent for a "Ajouter à mon agenda" button |
| A5 | The step between offered slots is `duree + tampon` (not `duree`, with the buffer only trailing the last) | Pattern 3 | Medium — changes how many slots a 9h–12h range yields; a founder-visible product decision |
| A6 | `isodow` (1=lundi) is the numbering to standardise on | Pattern 1 | Low — internal, but must be consistent between seed and query |
| A7 | Prices stored in centimes as `int`, seeded from `agenda.json`'s euro values | Pattern 1 | Low |
| A8 | The trainer video link is a server-only env var (not `NEXT_PUBLIC_`) since only the `.ics`/emails/recap need it | Runtime State Inventory | Low — if screen 3 must render it client-side, it becomes `NEXT_PUBLIC_` and is then public |
| A9 | Booking-window bounds (24 h / 8 weeks) are enforced in SQL as literals, not as a settings table | Pattern 3 | Low — D-13 says "fixed values, not back-office settings" |

## Open Questions (RESOLVED)

> **All six resolved 2026-09-01/02.** Questions 1, 3 and 6 were answered by the founder's amendment
> to `04-CONTEXT.md` (commit `4bafd24`, adding D-27, D-28, D-29 plus the mobile and typography
> sections); 2, 4 and 5 were answered by planner ruling recorded in the plan set. Each resolution is
> recorded inline below. Nothing here is outstanding and nothing blocks planning.

1. **The 15-minute slot hold is in `04-UI-SPEC.md` but not in `04-CONTEXT.md`.**

   **RESOLVED — in scope, by founder amendment.** `04-CONTEXT.md` now carries **D-27** (the slot is
   retained for 15 minutes, visibly, then becomes free again), **D-28** (sign-in is requested at
   screen 3, not on slot click — amending D-09) and **D-29** (the calendar opens on the first day
   carrying slots). `04-UI-SPEC.md`'s hold-timer badge, hold-expired message and acceptance criterion
   7 are therefore binding, and the whole of that document applies.
   The shape chosen is the cheaper of the two this question named, and close to the recommendation
   below: a **separate `app.maintien_creneau` table** — token, `plage tstzrange` generated,
   `expire_le` — and **no fourth `statut` value**, so D-07's closed three-value `check` and "Lot 4
   always writes `confirmee`" are untouched. Two deviations from the recommendation, both forced:
   the exclusion constraint on that table is **unqualified**, because an exclusion predicate must be
   `immutable` and `now()` is only `stable`; and expiry is therefore a **read-side predicate
   (`expire_le > now()`) plus an inline `app.purger_maintiens_expires()`** called at the top of every
   retention and booking transaction — lazy, no scheduled job, so D-02's "no generation job" holds.
   It cost no extra plan: the schema and RPCs landed in plan 04-01, the anonymous route in 04-03, the
   commit seam in 04-04 and the countdown in 04-05.
   The load-bearing constraint the founder restated: **the retention is the experience, the exclusion
   constraint remains the only source of truth.** A token grants no right to book — it is passed only
   into the availability re-derivation's anti-join — and `supabase/tests/lot4_maintien_creneau.sql`
   proves that with a forged token.
   - What we know: `04-UI-SPEC.md` requires a hold-timer badge, "Ce créneau vous est réservé pendant 15 minutes.", a hold-expired message, and acceptance criterion 7 tests it. It attributes this to "decision 27" and speaks of "29 founder decisions".
   - What's unclear: `04-CONTEXT.md` lists **D-01…D-26** and contains no hold. A hold is structurally significant: it is either a fourth `statut` value (contradicting D-07's closed three-value `check` and "Lot 4 always writes `confirmee`") or a separate `maintien_creneau` table with its own expiry and its own exclusion-constraint interaction (contradicting D-02's "no slot table" spirit) — plus an expiry mechanism, and D-02 forbids a scheduled job.
   - Recommendation: **escalate to the founder before planning locks.** The cheapest compatible shape, if it is confirmed in scope: a `app.maintien_creneau(utilisateur_id, plage, expire_le)` table with its own `exclude using gist (plage with &&) where (expire_le > now())` and lazy expiry (no job), plus a matching anti-join in `creneaux_libres`. That is roughly one extra plan. If it is **not** confirmed, the hold copy and acceptance criterion 7 must be struck from `04-UI-SPEC.md`.

2. **D-06 names a `server-only` module for a client-side load.**
   - What we know: `src/lib/supabase/public.ts` line 1 is `import "server-only"`; importing it from a `"use client"` component is a build error. `src/lib/supabase/client.ts` is the browser factory, already typed `<Database, "app">`.
   - Recommendation: treat this as a naming slip in D-06, not a decision. Use `client.ts`; record the substitution in the plan so no reviewer reverts it. The **intent** of D-06 — anonymous, cookie-free-in-effect, `/agenda` stays static — is fully preserved.

   **RESOLVED — recommendation adopted, and the split is finer than the question assumed.**
   `src/lib/supabase/client.ts` for the **live free-slot read** from the browser island;
   `src/lib/supabase/public.ts` — which is exactly what that module exists for — for the
   **appointment-type read**, which happens server-side at build/revalidate time, cookie-free, and
   for the server-side retention route. The substitution and its reason are carried as a
   `scope_ruling` in plan 04-03 and as a code comment, so no reviewer reverts it. D-06's intent is
   preserved: the route is still prerendered `○`.

3. **"No new `Intl` formatters" (CONTEXT scope fence) vs. "two new `Intl` formatters required" (`04-UI-SPEC.md` D-U4).**
   - What we know: the fence reads "*No new `Intl` formatters — reuse those in `src/lib/i18n/fr.ts`*". D-U4 requires a prose hour-of-day formatter (`14 h 30`) and a weekday-bearing date formatter (`mardi 8 septembre`), **added to that same file**, and acceptance criterion 4 tests them.
   - Recommendation: read the fence as "no formatter authored outside `src/lib/i18n/fr.ts`, no hand-written `" h"`/`"€"` at a call site" — which is what its own in-file comments say it exists to prevent. Adding two to `fr.ts` honours the spirit. Low risk, but worth one line of acknowledgement in the plan.

   **RESOLVED — recommendation adopted, and since confirmed by the founder.** The amended
   `04-CONTEXT.md` § Culture et typographie françaises now names both formatters as **required** and
   gives the reason directly: a hand-written `" h"` at a call site is the same defect as the
   hand-written `"€"` that `currencyFormatter` exists to prevent, and a call-site weekday
   concatenation is the second. Plan 04-03 Task 1 adds exactly two, inside `src/lib/i18n/fr.ts`,
   named `heureProseFormatter` / `formatHeureProse` (`14 h 30`) and `dateAvecJourFormatter` /
   `formatDateAvecJour` (`mardi 8 septembre`). The existing `timeFormatter` (`14:30`) stays the dense
   register for slot pills; the two registers coexist and are never interchanged. Every consumer in
   plans 04-04 through 04-09 imports one of the two identifiers.

4. **CLAUDE.md's "use queryKeys factory, prefer optimistic updates" has no library behind it.**
   - What we know: `@tanstack/react-query` is not in `package.json`; the whole repo uses server components plus `fetch`-in-island. `04-UI-SPEC.md` sets a zero-new-dependency budget with exactly one named exception (the zoned-date library, which this research recommends **not** spending).
   - Recommendation: either (a) declare the rule not-applicable for this phase and record it, or (b) spend the one dependency slot on `@tanstack/react-query` instead of a date library. **(a) is recommended** — optimistic updates are actively wrong for a booking commit, where the whole point is that only the database knows whether the slot is still free.

   **RESOLVED — (a), by planner ruling, recorded as a `scope_ruling` in plans 04-03, 04-04, 04-05,
   04-06, 04-08 and 04-09.** The in-repo idiom is the `useState` status machine in
   `src/components/forms/contact-form.tsx`. **Caveat, and it is deliberately not swept under the
   ruling:** `04-CONTEXT.md`'s Claude's-Discretion list does not cover waiving a CLAUDE.md
   instruction, so this is a project rule being set aside without the founder. It is therefore
   surfaced for one-line ratification at the phase's first D-26 gate (plan 04-03 Task 3, item 12)
   rather than left in the rulings alone. If the founder prefers (b), the dependency slot is still
   unspent — this phase adds zero packages.

5. **Does a new API route handler violate D-06's "the static route count does not move"?**
   - What we know: the phase needs at least `POST /api/reservation`, the admin write handlers, and `GET /api/admin/reservations/export`. Route handlers appear in the build route table.
   - Recommendation: read D-06 as scoped to the **public page routes** it is about (`/agenda` and the 13 prerendered pages stay `○`). Confirm at the first plan-check; the verification command should assert *the existing 13 remain static*, not *the total route count is unchanged*.

   **RESOLVED — recommendation adopted.** Every surface plan asserts "the build output's count of `○`
   routes is greater than or equal to the 13 recorded before this phase; no previously-static public
   page has become `ƒ`", and plan 04-03 additionally asserts the line `○ /agenda` specifically, with
   a falsification step (temporarily add a top-level `await cookies()`, watch the command fail,
   remove it). New route handlers and the `ƒ` `/admin` and `/reservation` routes are therefore not a
   D-06 violation. Note one consequence recorded late, in plan 04-09: `/reservation` became `ƒ` with
   the D-28 change, so it has no cached render and must **not** be `revalidatePath`-ed.

6. **`.ics` `METHOD` (assumption A4) and slot step (assumption A5)** — both are founder-visible product behaviour and belong on a D-26 review gate rather than being silently chosen by the executor.

   **RESOLVED — both placed on gates, as recommended.** A5 (the `duration + buffer` step, and the
   resulting slot density) is item 11 of plan 04-03's gate; A4 (`METHOD:REQUEST` with `ORGANIZER` and
   `ATTENDEE`, which makes Gmail and Outlook render an RSVP invitation, versus `METHOD:PUBLISH`,
   which renders a plain attachment but removes the seam Lot 8 uses to update against the same `UID`
   with `SEQUENCE + 1`) is item 5b of plan 04-05's gate, stated with its trade-off. Two further
   founder-visible items joined them from the same reasoning: the CLAUDE.md waiver and the retention
   rate-limit numbers, both on plan 04-03's gate.

## Sources

### Primary (HIGH confidence)
- **This repository's own local Supabase Postgres 17.6** (`supabase_db_ElearningAriba`) — every SQL and HTTP transcript in § Code Examples was produced there on 2026-09-01 and the probe objects dropped afterwards
- **This repository's Node 24.20.0** — `Temporal` absence, full ICU, `Intl` output
- Repo source read directly: `package.json`, `supabase/config.toml`, `supabase/migrations/20260831160000_lot3_comptes.sql`, `…161000_lot3_grants.sql`, `supabase/tests/lot3_rls_isolation.sql`, `scripts/seed-content.mjs`, `scripts/gen-db-types.mjs`, `src/lib/i18n/fr.ts`, `src/lib/email/{resend,render}.ts`, `src/lib/auth/session.ts`, `src/lib/supabase/{client,server,public,service,middleware}.ts`, `src/lib/env/{server,client}.ts`, `src/lib/rate-limit.ts`, `src/middleware.ts`, `src/app/agenda/page.tsx`, `src/app/espace/{page,layout}.tsx`, `src/app/api/contact/route.ts`, `src/locales/fr/{agenda,reservation,espace}.json`, `next.config.ts`, `.env.example`
- `.planning/phases/04-agenda-et-prise-de-rendez-vous/{04-CONTEXT.md,04-UI-SPEC.md}`, `.planning/{REQUIREMENTS,ROADMAP,STATE,config.json}`, `.planning/phases/03-…/03-PATTERNS.md`, `CLAUDE.md`
- Context7 `/vercel/next.js` — dynamic APIs forcing dynamic rendering; `next build --debug` route markers
- Context7 `/adamgibbons/ics` — `UID` RFC 822 shape; update semantics (same `UID`, `SEQUENCE + 1`, `METHOD:REQUEST`)
- resend.com/docs/api-reference/emails/send-email — `attachments` field shape, base64 `content`, 40 MB ceiling
- npm registry (`npm view`) — versions, publish dates, dependency trees, absent `postinstall` scripts
- api.npmjs.org/downloads — weekly download counts
- `slopcheck 0.6.1` — all six candidates `[OK]`

### Secondary (MEDIUM confidence)
- postgrest.org/en/stable/references/errors.html — class-23 status mapping (documents 23503/23505 → 409; **the 23P01 → 400 behaviour was confirmed by live probe, not by the doc**)
- WebSearch cross-read on `btree_gist` + `EXCLUDE` booking patterns (Neon docs, supabase.com/blog/range-columns, postgresql.org rangetypes) — all consistent with the local probes

### Tertiary (LOW confidence)
- The eleven French *jours fériés* list and the Alsace-Moselle exception — training knowledge, not re-verified this session (A2)
- CSV/Excel conventions for `fr-FR` (BOM + `;`) — training knowledge; the planner should confirm on the trainer's actual Excel at recette

## Metadata

**Confidence breakdown:**
- Data model, lock, DST, RLS: **HIGH** — proven by execution against this project's own database, not by citation
- Dependency decision (zero new packages): **HIGH** — `Temporal` absence and `Intl` capability both measured on the pinned runtime
- `.ics` and CSV shapes: **MEDIUM** — RFC/vendor-doc backed, but `METHOD` choice (A4) is a product decision
- UI composition: **MEDIUM** — no analog exists in the repo for a calendar grid or an admin shell; `04-UI-SPEC.md` is the contract
- Scope coherence: **HIGH as of 2026-09-02** — all six Open Questions are resolved and recorded inline. The three that were blocking (1–3) were settled by the founder's D-27/D-28/D-29 amendment to `04-CONTEXT.md` and by planner rulings carried in the plan set; the one remaining judgement call, waiving CLAUDE.md's queryKeys/optimistic-updates rule, is surfaced for ratification at the first D-26 gate rather than assumed

**Research date:** 2026-09-01
**Valid until:** 2026-10-01 (Postgres/RFC facts are stable indefinitely; re-verify the `Temporal` global and PostgREST's error map before Lot 8)

---

*Phase: 04-agenda-et-prise-de-rendez-vous*
