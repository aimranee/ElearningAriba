# Phase 3: Comptes, connexion et espace apprenant - Context

**Gathered:** 2026-08-31
**Status:** Ready for planning
**Source:** PRD Express Path (`C:/Users/Essakhi/Desktop/ElearningSAP/ariba-cto/notes/2026-08-31-brief-phase-3-comptes-connexion-espace-apprenant.md`)
**Mode:** mvp (from ROADMAP.md `**Mode**: mvp`)

<domain>
## Phase Boundary

Lot 3 makes the learner account the spine of the platform: sign-up with email
verification, sign-in (password + Google), password reset with throttling, a
profile, the learner space `/espace` with honest empty states, gated access to
supports via signed time-limited URLs, database-level role isolation, and the
GDPR rights (export + deletion request).

**Delivers exactly `CPT-01`..`CPT-09` and nothing else.**

**Where it stops:**
- No `/admin` route, no administration screen of any kind. The `administrator`
  role is created and isolated at the database level, never rendered. The
  `/admin` shell arrives in Lot 4 with the first feature that justifies it
  (`AGD-03`, `AGD-07`, `AGD-08`).
- No tables for Lots 4, 6, 7 or 9 — no `reservation`, no `facture`, no
  `progression`, not even as a shell. "Mes factures" and "mon avancement" are
  honest empty states (already recorded in `.planning/PROJECT.md:166`).
- Lots 11–18 (Business, Premium) are not sold. Nothing approaches them.
- No push, ever: no `git push`, no `supabase db push`, no deployment. Pushing to
  `main` in this repo is a Vercel deployment and belongs to the CIO alone.

**Table scope:** only Lot 3's own — learner profile, support access grant,
deletion request.

**Execution environment:** isolated worktree
`C:/Users/Essakhi/Desktop/ElearningAriba-lot3` on branch
`gsd/phase-03-comptes-connexion-et-espace-apprenant`, based on
`gsd/phase-02-site-public` @ `c124a82` (NOT `main`, which is still at the
Phase 0 placeholder `27ab022`). `.env.local` copied from the main clone;
`npm ci` already run (454 packages).

</domain>

<decisions>
## Implementation Decisions

### D-01 — Scope fence: nine requirements, nothing else
Only `CPT-01`..`CPT-09`. No requirement from another lot may appear in any plan.

### D-02 — Zero administration screens
Founder decision 2026-08-31. Lot 3 ships the *role* and the *isolation*, not an
admin surface. No plan may create an `/admin` route or any administration screen.

### D-03 — No tables for Lots 4, 6, 7, 9
No `reservation`, `facture`, or `progression` table, not even as a shell. The
"mes factures" and "mon avancement" surfaces stay honest empty states.

### D-04 — Merge rule: Lot 3 consumes the design system, never modifies it
**Write-forbidden for the entire phase:**
- `src/app/globals.css`
- `src/components/ui/*` (the eight existing components)
- `src/components/layout/*` (header, footer)

Reason: the founder is still editing these files in the parallel Lot 2 session.
By never touching them, the Lot 2 → Lot 3 merge stays unidirectional and
conflict-free. A new shared component that Lot 3 needs is created **alongside**,
never by modifying an existing one.

Known and accepted exception: `.planning/STATE.md` and
`.planning/REQUIREMENTS.md` will be modified on both sides and will conflict at
merge. Small, expected, resolved by hand.

### D-05 — `CPT-07` ships the mechanism, not the grant UI
`CPT-07` has no source of entitlement in Lot 3 (enrolment is Lot 6). Lot 3 ships
the **mechanism**: private bucket, signed URL generated per request, short TTL,
entitlement checked server-side. In Lot 3 the grant rows are written **by
migration/SQL, not by a UI**. Lot 6 makes enrolment the writer.

### D-06 — Google OAuth (`CPT-02`): build the code path now
The code path is built now; credentials are requested from the CIO **in
parallel** so they land before the wave that depends on them. Hosted recette of
`CPT-02` is not achievable from this seat.

### D-07 — Email verification (`CPT-01`): local proof only
`enable_confirmations` goes to `true` and verification is proven **locally**.
`CPT-01` is **not** provable on hosted at phase close — and that must be written
into the phase record, not hidden under a green check.

### D-08 — Attempt throttling (`CPT-03`): Supabase native limits only
Supabase's native rate limits, tightened in `config.toml` and documented.
**No captcha** — a third-party dependency that no signed line asks for.

### D-09 — Roles (`CPT-08`): `role` column + RLS on `auth.uid()`
Two roles only: `learner` and `administrator`. A `role` column on the profile
table plus RLS keyed on `auth.uid()`. **No JWT claims hook** — that would be one
more hosted configuration, therefore one more CIO round-trip.

### D-10 — Account deletion (`CPT-09`) closes without an admin screen
Export is **fully autonomous** (JSON generated on demand). The deletion request
is recorded, acknowledged to the learner, and notified to the trainer; the
deletion itself is executed in SQL until `ADM-02` in Lot 10.

### D-11 — The lane writes the missing French copy
The Lot 1 copy already covers more than expected: `connexion.json` carries
`google` ("Continuer avec Google") and `erreurs.tropDeTentatives`; `emails.json`
carries `confirmationInscription` and `reinitialisationMotDePasse`;
`inscription.json` carries the profile fields, the errors, the success message.

**What exists nowhere:** the profile page labels (`CPT-05`, beyond the sign-up
fields) and the whole GDPR surface (`CPT-09`) — export, deletion request,
acknowledgement.

Founder decision 2026-08-31: the lane writes the missing strings, in the voice
established by Lot 1 — full sentences, *vouvoiement*, no technical formulas,
never technical vocabulary exposed to the learner ("RGPD" is said, "export JSON"
is not). The founder validates them at Lot 3 recette, in the end-of-phase
grouped human-verification batch. This is not a scope change — these are
surfaces Lot 3 introduces.

**Tone reference: `src/locales/fr/espace.json` and `inscription.json`.** Plans
must make these read before a single string is written. New strings live in the
same `src/locales/fr/*.json` files, never hardcoded in a component.

### D-12 — Contradiction 1: password rule — configuration joins the copy
`src/locales/fr/inscription.json` → `aideParChamp.motDePasse` says *"Huit
caractères minimum, avec au moins un chiffre."*
`supabase/config.toml:181` says `minimum_password_length = 6`, and `:184`
`password_requirements = ""`.
→ **Configuration must move to `8` and `letters_digits`.** Never the reverse —
the copy is signed.

### D-13 — Contradiction 2: address confirmation — configuration joins the copy
`src/locales/fr/inscription.json` → `succes.titre` says *"Vérifiez votre boîte
mail. Un lien de confirmation vous attend."*, and `CPT-01` requires verification.
`supabase/config.toml:225` says `enable_confirmations = false`.
→ **Move to `true`.** The existing success message becomes true.

### D-14 — Third contradiction: carry it, do not fix it yet
`supabase/config.toml:162` declares
`additional_redirect_urls = ["https://127.0.0.1:3000"]` — in **`https`**, while
`site_url:158` is `http`. The local OAuth callback will fail on this value.
To be checked when wiring Google, not before.

### D-15 — The middleware is the session entry point
`src/middleware.ts` does not exist. `src/lib/supabase/server.ts`'s `catch`
already carries the comment *"No middleware exists yet (Lot 3)"* — the only
place in the repo that says so. Lot 3 creates it; it refreshes the token. Its
`matcher` must **exclude the 14 public routes** — otherwise they become dynamic
and Lot 2 regresses.

### D-16 — The 14 public routes stay static
Verifiable in `next build` output and a Lot 2 recette criterion. Lot 3 must not
break it. `src/lib/supabase/public.ts` (cookie-free anonymous client,
deliberately separate) must not be contaminated.

### D-17 — The service role never reaches the browser
`server-only` is already the guard; it stays.

### D-18 — Isolation is proven, not declared
Plans must require a **negative** proof: learner A attempts to read learner B's
row and **receives a refusal from the database**. A test that only shows the
passing case proves nothing — that is exactly the "false green" that cost three
findings on this project.

### D-19 — No new dependency without written justification
`@supabase/ssr` `^0.12.5` and `@supabase/supabase-js` `^2.112.4` are already
direct dependencies. Everything `CPT-01`..`CPT-09` needs is already installed.
The UI library is **`@base-ui/react`** — not Radix, not shadcn.

### D-20 — Green gates at the end of every plan
`tsc`, `eslint`, `next build` green, and `npm run content:check` still exiting
`1` on the single unresolved content key (that guard must stay green in the
sense of "unchanged").

### D-21 — Migrations are strictly additive and grouped
They create; they neither alter nor drop, and each carries its reversion line as
a comment, as `20260830090000` did. Each Lot 3 migration must be pushed by the
CIO — this seat has no `SUPABASE_ACCESS_TOKEN`. The plan must **group** them,
not scatter them, to limit round-trips.

### D-22 — Human verification is grouped at end of phase
`human_verify_mode: "end-of-phase"` (`.planning/config.json:33`), as in Lot 2.

### D-23 — Outward messages: none may actually leave
Supabase Auth sends outbound email (confirmation, reset). Locally they land in
the stack's collector; **no real email may leave during planning or execution.**
Supabase Auth's email templates have their **own** files — they must be
francised, otherwise the learner receives an English email.

### D-24 — Tenancy: single-tenant, natural persons only
One trainer, one catalogue. A learner is a natural person — **multi-seat company
accounts are excluded from every offer** and must not appear in the model.

### D-25 — Locale: French only, LTR
Every label via `src/locales/fr/*.json`.

### D-26 — Existing data untouched
No existing table is modified. `app.content_section`, `app.content_item` and
`app.contact_message` are untouched. The `app` schema is the only namespace.
Types in `src/types/database.types.ts` regenerate via `npm run db:types`.

### D-27 — Empty and error states
The six `/espace` surfaces keep their honest empty states. A session failure must
never render a half-authenticated page: redirect to `/connexion`. The error
messages already exist in `connexion.json.erreurs` — use them, do not invent new
ones.

### D-28 — Lot 1 shells that Lot 3 replaces
| File | Lines | What it is today |
|---|---|---|
| `src/app/inscription/page.tsx` | 240 | Static form, no `action`, no validation |
| `src/app/connexion/page.tsx` | 144 | Static form, no Google button rendered |
| `src/app/espace/page.tsx` | 82 | Six empty-state cards; `PRENOM_MAQUETTE = "…"` hardcoded |

`src/app/espace/page.tsx:12-15` carries the contract explicitly: *"this route
ships with no session in Lot 1 — the placeholder stands in for the learner's
first name so the interpolation is proven before Lot 3 replaces the source with
the session's real value, not the copy itself."*
**Lot 3 replaces the source, not the copy.**

### Claude's Discretion
- Table, column and constraint naming inside the `app` schema (subject to D-21,
  D-26).
- Plan decomposition, wave assignment, and file-level task breakdown.
- Server-action vs route-handler shape for each form, provided D-15/D-16/D-17
  hold.
- Zod schema placement and shape at the boundaries (per `CLAUDE.md`).
- Signed-URL TTL value (short), provided the entitlement check is server-side.
- The exact French wording of the new strings, within the voice constraints of
  D-11.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope and requirements
- `.planning/ROADMAP.md` — Phase 3 section: goal, `**Mode**: mvp`, success criteria
- `.planning/REQUIREMENTS.md` — `CPT-01`..`CPT-09` (lines 55–63)
- `.planning/PROJECT.md` — line 166: honest-empty-state decision for later-lot surfaces
- `CLAUDE.md` — signed stack, lot table, no-`any`, no-hardcoded-text rules
- `reference/Offre_1_Essentiel.pdf` — the single scope reference; where anything disagrees, the PDF wins

### Supabase wiring (read before touching auth)
- `src/lib/supabase/server.ts` — `createServerClient`, cookies, `db.schema = app`; its `catch` expects the Lot 3 middleware
- `src/lib/supabase/public.ts` — cookie-free anonymous client; keeps the 14 public routes static
- `src/lib/supabase/client.ts` — browser client
- `supabase/config.toml` — `:13` exposed schemas, `:158` `site_url`, `:162` `additional_redirect_urls`, `:181` `minimum_password_length`, `:184` `password_requirements`, `:225` `enable_confirmations`
- `supabase/migrations/20260827131029_init_schema.sql` — creates the `app` schema, no business table ("Lot 3 and later lots own the schema")
- `supabase/migrations/20260830090000_public_content.sql` — the additive-migration + reversion-comment pattern to copy
- `supabase/migrations/20260830093000_grant_service_role_content.sql`
- `src/types/database.types.ts` — regenerated via `npm run db:types`

### Environment and email
- `src/lib/env/client.ts`, `src/lib/env/server.ts` — Zod schemas that throw at boot
- `src/lib/email/resend.ts` — `RESEND_API_KEY` optional at boot, strictly validated at send

### Copy — tone reference, read before writing any string
- `src/locales/fr/espace.json` — tone reference
- `src/locales/fr/inscription.json` — profile fields, errors, success, `aideParChamp.motDePasse`
- `src/locales/fr/connexion.json` — `google`, `erreurs.tropDeTentatives`
- `src/locales/fr/emails.json` — `confirmationInscription`, `reinitialisationMotDePasse`

### Surfaces Lot 3 replaces
- `src/app/inscription/page.tsx`
- `src/app/connexion/page.tsx`
- `src/app/espace/page.tsx` (see lines 12–15 for the placeholder contract)

### Design system — READ-ONLY for this phase (D-04)
- `src/components/ui/` — `accordion`, `badge`, `button`, `card`, `empty-state`, `field`, `input`, `message` (built on `@base-ui/react`)
- `src/components/layout/` — header, footer
- `src/app/globals.css`

</canonical_refs>

<specifics>
## Specific Ideas

- `src/middleware.ts` must be created, with a `matcher` that excludes the 14
  public routes.
- `supabase/config.toml` edits: `minimum_password_length = 8`,
  `password_requirements = "letters_digits"`, `enable_confirmations = true`,
  plus tightened native rate limits for `CPT-03`.
- Supabase Auth email templates must be francised so the learner never receives
  an English email.
- One plan must carry the **negative** RLS isolation proof explicitly (learner A
  denied on learner B's row).
- `CPT-07` grant rows in Lot 3 are seeded by migration/SQL, not by a UI.
- The GDPR export is a JSON generated on demand; the deletion request is
  recorded + acknowledged + notified, and executed in SQL until Lot 10.

</specifics>

<deferred>
## Deferred Ideas

- `/admin` shell and any administration screen → Lot 4 (`AGD-03`, `AGD-07`, `AGD-08`)
- Enrolment as the writer of support-access grants → Lot 6
- `reservation`, `facture`, `progression` tables → Lots 4, 7, 9
- Self-service account deletion execution (`ADM-02`) → Lot 10
- The `https` vs `http` `additional_redirect_urls` mismatch (D-14) → checked when Google is wired, not before
- Lots 11–18 (Business, Premium) → not sold, never approached

</deferred>

<hosted_dependencies>
## Out of this seat's reach — blocks hosted recette, not local build

| Dependency | For | Owner |
|---|---|---|
| Google OAuth client + provider configuration on both Supabase projects | `CPT-02` | CIO |
| Custom SMTP on Supabase Auth (`RESEND_API_KEY` unprovisioned, no domain) | `CPT-01`, `CPT-03` | CIO |
| Private storage bucket | `CPT-07` | CIO |
| Push of every Lot 3 migration | `CPT-05`, `CPT-08` | CIO |

Plus two open debts that touch Lot 3 without being part of it: the
`master` → `main` rename (disarmed CI gate, frozen Vercel production) and the
pausing of the Free-plan Supabase projects.

</hosted_dependencies>

---

*Phase: 03-comptes-connexion-et-espace-apprenant*
*Context gathered: 2026-08-31 via PRD Express Path*
