# Phase 4: Agenda et prise de rendez-vous - Pattern Map

**Mapped:** 2026-09-01
**Files analyzed:** 34 (new or modified)
**Analogs found:** 27 / 34
**Scope note:** the 15-minute slot hold (`04-UI-SPEC.md` "decision 27") is **not** in `04-CONTEXT.md`'s locked D-01..D-26 and is **out of scope**. No file is mapped for it. Likewise no file is mapped for payment, Google Calendar or group sessions.

---

## File Classification

### Data layer

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `supabase/migrations/2026…_lot4_agenda.sql` | migration | DDL / batch | `supabase/migrations/20260831160000_lot3_comptes.sql` | exact |
| `supabase/migrations/2026…_lot4_agenda_grants.sql` | migration | DDL / batch | `supabase/migrations/20260831161000_lot3_grants.sql` | exact |
| `app.creneaux_libres()` (inside the migration) | RPC, `stable security definer` | request-response (read) | `app.creer_profil_pour_nouvel_utilisateur()` — `lot3_comptes.sql:64-83` | role-match (definer idiom only; no SQL-returning-table analog) |
| `app.reserver_creneau()` (inside the migration) | RPC, `volatile security definer` | request-response (write) | same as above | role-match |
| `app.est_administrateur()` (inside the migration) | RPC helper | request-response | same as above | role-match |
| `supabase/tests/lot4_verrou_creneau.sql` | test (SQL negative) | batch | `supabase/tests/lot3_rls_isolation.sql` | exact |
| `supabase/tests/lot4_rls_reservation.sql` | test (SQL negative) | batch | `supabase/tests/lot3_rls_isolation.sql` | exact |
| `supabase/tests/lot4_maintien_creneau.sql` **(D-27, added 2026-09-02)** | test (SQL negative) | batch | `supabase/tests/lot3_rls_isolation.sql`, then `lot4_verrou_creneau.sql` for the Lot 4 flavour | exact |
| `supabase/migrations/2026…_lot4_admin_reservation.sql` (04-07) | migration | DDL | `supabase/migrations/20260831160000_lot3_comptes.sql` (header + reversion comment); the three RPC bodies mirror `app.reserver_creneau` from the first Lot 4 migration | role-match |
| `app.maintien_creneau` + `app.maintenir_creneau()` / `app.liberer_creneau()` / `app.purger_maintiens_expires()` **(D-27)** | table + three `volatile security definer` RPCs | request-response (write) | `app.reserver_creneau()` in the same migration — same typed-outcome, `set search_path = ''`, exception-catching shape | role-match (no analog for a *policy-less, RLS-on* table anywhere in the repo — see § No Analog Found) |
| `src/types/database.types.ts` (regenerated) | generated artifact | build | `scripts/gen-db-types.mjs` (`npm run db:types`) | exact |

### Bootstrap

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `scripts/seed-agenda.mjs` | script | batch upsert | `scripts/seed-content.mjs` | exact |
| `package.json` (`agenda:seed`) | config | — | `package.json:14` `content:seed` | exact |

### Server libraries

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/lib/agenda/queries.ts` (new) | service / query | CRUD (read) | `src/lib/documents/queries.ts` | exact |
| `src/lib/validation/reservation.ts` (new) | validation | transform | `src/lib/validation/contact.ts` | exact |
| `src/lib/auth/session.ts` (add `requireAdministrator()`) | middleware / guard | request-response | `requireLearner()` — same file, `session.ts:41-52` | exact |
| `src/lib/i18n/fr.ts` (two new formatters, D-U4) | utility | transform | `hourFormatter` / `currencyFormatter` — same file, `fr.ts:32-59` | exact |
| `src/lib/email/resend.ts` (add `attachments?`) | service (transport) | request-response | itself, `resend.ts:26-51` | exact |
| `src/lib/email/render.ts` (add reservation renderers) | utility | transform | `renderSuppressionNotification` — same file, `render.ts:63-71` | exact |
| `src/lib/env/server.ts` (+ video-link var, D-15) | config | — | `RESEND_API_KEY` entry, `server.ts:21-26` | exact |
| `src/middleware.ts` (matcher gains `/admin`) | middleware | request-response | itself, `middleware.ts:22-29` | exact |
| `src/lib/agenda/ics.ts` (new) | utility | transform | — | **no analog** |
| `src/lib/agenda/csv.ts` (new) | utility | transform | — | **no analog** |
| `src/lib/agenda/creneaux.ts` (client grid helpers) | utility | transform | `src/lib/i18n/fr.ts` (formatter-only discipline) | partial |
| `src/lib/validation/maintien.ts` (new, D-27) | validation | transform | `src/lib/validation/contact.ts` | exact |
| `src/lib/rate-limit.ts` (widen `consume()` with a per-call-site budget, D-27) | middleware / guard | request-response | itself, `rate-limit.ts:17-31`; the additive-widening discipline from `src/lib/email/resend.ts` gaining `attachments?` | exact |
| `src/lib/validation/types-rendez-vous.ts` (new, 04-09) | validation | transform | `src/lib/validation/contact.ts`, then `src/lib/validation/agenda-admin.ts` for the mirror-the-table's-`check`-constraints discipline | exact |
| `src/lib/agenda/admin-queries.ts` (+ the 04-09 type read) | service / query | CRUD (read) | `src/lib/documents/queries.ts` | exact |

### Route handlers

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/app/api/reservation/route.ts` (POST) | route | request-response | `src/app/api/rgpd/suppression/route.ts` | exact |
| `src/app/api/admin/**/route.ts` (writes) | route | CRUD | `src/app/api/rgpd/suppression/route.ts` + `src/app/api/contact/route.ts` | role-match |
| `src/app/api/creneaux/maintien/route.ts` (POST + DELETE, **unauthenticated by design — D-27/D-28**) | route | request-response | `src/app/api/contact/route.ts` — the only other route in the repo that takes an untrusted body without a session, and the source of the zod-at-the-boundary + `consume()` opening | role-match (no analog for an unauthenticated route that *writes* server state) |
| `src/app/api/admin/types-de-rendez-vous/route.ts` (PATCH only, 04-09) | route | CRUD (write) | `src/app/api/admin/disponibilites/route.ts` (04-06), itself modelled on `src/app/api/rgpd/suppression/route.ts` | role-match |
| `src/app/api/admin/reservations/export/route.ts` (CSV) | route | file-I/O (download) | `src/app/api/documents/[id]/route.ts` | role-match |
| `.ics` download route (screen 4 CTA) | route | file-I/O (download) | `src/app/api/documents/[id]/route.ts` | role-match |

### Surfaces

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/app/agenda/page.tsx` (rewrite, static shell) | page (server) | static | `src/app/a-propos/page.tsx` (structure) + current `agenda/page.tsx` (markup) | role-match |
| `src/app/reservation/page.tsx` + screens (rewrite) | page (server/client) | request-response | `src/app/espace/page.tsx` | role-match |
| success surface (screen 4) | page | request-response | `src/app/espace/page.tsx` | role-match |
| `src/app/espace/page.tsx` (populate `rendezVous`) | page (server) | CRUD (read) | itself, `espace/page.tsx:24-27, 63-83` | exact |
| `src/app/admin/layout.tsx` (new) | layout / guard | request-response | `src/app/espace/layout.tsx` | exact |
| `src/app/admin/*/page.tsx` (horaires, jours fériés, réservations) | page (server) | CRUD | `src/app/espace/page.tsx` | role-match |
| `src/components/agenda/agenda-booker.tsx` (client island) | component (client) | request-response | `src/components/forms/contact-form.tsx` (state machine) — **but no browser-Supabase analog exists** | partial |
| `src/components/agenda/*` (grid, slot list, stepper) | component | — | `src/app/agenda/page.tsx:65-96` (grid markup, maquette) | partial |
| `src/components/agenda/booker-skeleton.tsx` (drawn loading state) | component | — | — | **no analog** — the repo has no skeleton anywhere; see § No Analog Found |
| `src/components/reservation/compte-a-rebours-maintien.tsx` (D-27 countdown) | component (client) | — | `src/components/forms/contact-form.tsx` for the `useState` machine and the set-mount-time-values-in-an-effect hydration comment; the arithmetic itself comes from `maintienRestant()` in `creneaux.ts` | partial |
| `src/app/admin/types-de-rendez-vous/page.tsx` + `src/components/admin/types-editeur.tsx` (04-09) | page (server) + editor (client) | CRUD | `src/app/admin/horaires/page.tsx` + `src/components/admin/horaires-editeur.tsx` (04-06) — the closest analog in the phase, same server-reads/client-edits/posts-to-a-route-handler split | exact |
| `src/components/admin/admin-nav.tsx` — fourth entry (04-09) | component | — | itself, as built in 04-06 from a single array precisely so a fourth entry is an added element | exact |
| `src/components/admin/*` (shell nav, editors, table) | component | CRUD | `src/components/espace/espace-nav.tsx`, `src/components/espace/documents-list.tsx` | role-match |
| admin cancel / delete-override confirmation | component (client) | request-response | `src/components/compte/suppression-compte.tsx` | exact |

### Copy

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/locales/fr/admin.json` (new) | config (copy) | — | `src/locales/fr/espace.json` / `donnees.json` shape | exact |
| `src/locales/fr/agenda.json` (legend only, D-24) | config (copy) | — | itself, `agenda.json:6-11` | exact |
| `src/locales/fr/reservation.json`, `emails.json`, `espace.json` (additive keys) | config (copy) | — | `emails.json` entry shape consumed by `render.ts:21-45` | exact |

---

## Pattern Assignments

### `supabase/migrations/2026…_lot4_agenda.sql` (migration, DDL)

**Analog:** `supabase/migrations/20260831160000_lot3_comptes.sql`

**Header + reversion-comment pattern** (`lot3_comptes.sql:1-11`) — every migration opens with *why*, an explicit "strictly additive" statement, and a runnable reversion block:

```sql
-- Lot 3's data spine: the single identity anchor every learner surface reads
-- from (CPT-04), … Lot 3 owns exactly these three tables and nothing else (D-03).
-- Strictly additive: creates objects only, no `alter` and no `drop` against
-- anything Phase 0 or Lot 2 made.
-- Reversible with:
--   drop trigger creer_profil_apres_inscription on auth.users;
--   drop function app.creer_profil_pour_nouvel_utilisateur();
--   drop table app.demande_suppression, app.acces_support, app.profil cascade;
```

**Table + check-constraint + `comment on` pattern** (`lot3_comptes.sql:13-30`) — enum-like columns are `text` + `check (… in (…))`, never a Postgres enum type; every table and every non-obvious column carries a `comment on` naming the decision it serves:

```sql
create table app.profil (
  utilisateur_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'learner'
    check (role in ('learner', 'administrator')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column app.profil.role is 'The administrator value is created and isolated at the database level and is never rendered by any Lot 3 surface (D-02).';
```

→ Lot 4's `statut text … check (statut in ('confirmee','en_attente_paiement','annulee'))` (D-07) copies this exactly. Do **not** introduce `create type … as enum`.

**Partial unique index pattern** (`lot3_comptes.sql:53-55`) — the direct template for D-12's one-discovery-call rule:

```sql
create unique index demande_suppression_une_en_attente
  on app.demande_suppression (utilisateur_id)
  where statut = 'enregistree';
```

**`security definer` function pattern** (`lot3_comptes.sql:64-83`) — the repo's only definer function today; `set search_path = ''` is already the precedent:

```sql
create function app.creer_profil_pour_nouvel_utilisateur()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- why: client-supplied raw_user_meta_data must not be able to mint an
  -- administrator — role is never read from it, only the column default applies.
  insert into app.profil (utilisateur_id, email, prenom, nom, profil_professionnel)
  values (…);
  return new;
end;
$$;
```

**`updated_at` trigger — reuse, never recreate** (`lot3_comptes.sql:59-62`). `app.touch_updated_at()` was created once in `20260830090000_public_content.sql:57-65`; Lot 3 only attaches:

```sql
create trigger profil_touch_updated_at
  before update on app.profil
  for each row
  execute function app.touch_updated_at();
```

**RLS pattern** (`lot3_comptes.sql:90-124`) — `alter table … enable row level security` for every new table, then one narrowly-named policy per (table, operation, role), always with `(select auth.uid())` wrapped in a subselect:

```sql
alter table app.profil enable row level security;

create policy profil_self_select
  on app.profil
  for select
  to authenticated
  using (utilisateur_id = (select auth.uid()));

create policy profil_self_update
  on app.profil
  for update
  to authenticated
  using (utilisateur_id = (select auth.uid()))
  with check (utilisateur_id = (select auth.uid()));
```

**Anon-read policy pattern for reference data** (`20260830090000_public_content.sql:83-93`) — the template for `app.type_rendez_vous` being readable by `anon`:

```sql
create policy content_section_anon_select
  on app.content_section
  for select
  to anon
  using (publie = true);
```

**No analog in the repo for:** range types, `tstzrange`, `exclude using gist`, `generated always as … stored`, `btree_gist`, `at time zone`. Nothing in `supabase/migrations/` uses any of them — take those verbatim from `04-RESEARCH.md` Patterns 1–5, which were proven empirically against this repo's own Postgres 17.6.

---

### `supabase/migrations/2026…_lot4_agenda_grants.sql` (migration, grants)

**Analog:** `supabase/migrations/20260831161000_lot3_grants.sql` (whole file, 33 lines)

**Why a second file at all** (`lot3_grants.sql:1-10`):

```sql
-- RLS confers no table privilege by itself (the same lesson
-- 20260830093000_grant_service_role_content.sql recorded for the content
-- tables). Strictly additive: grants only, no `create`, `alter` or `drop`
-- against anything the prior migration made.
-- Reversible with:
--   revoke all on app.profil, … from service_role;
--   revoke update (prenom, …) on app.profil from authenticated;
--   revoke usage on schema app from authenticated;
```

**The withheld-privilege pattern** (`lot3_grants.sql:18-33`) — this is the exact control `04-RESEARCH.md` Pattern 4 asks Lot 4 to repeat by withholding `insert`/`update` on `app.reservation` from `authenticated`:

```sql
-- why: this column list is the vertical-privilege-escalation control for
-- CPT-08/D-09. The RLS `using` predicate on profil_self_update alone would
-- let a learner run `update app.profil set role = 'administrator' where
-- utilisateur_id = auth.uid()` on their own row — withholding the column
-- privilege on `role` (and `email`, `utilisateur_id`, `created_at`,
-- `updated_at`) is what refuses it.
grant update (
  prenom, nom, telephone, profil_professionnel,
  preference_rappels, preference_actualites
) on app.profil to authenticated;

grant all on app.profil, app.acces_support, app.demande_suppression to service_role;
```

`grant usage on schema app to anon;` is already granted (`public_content.sql:102`) — do not re-grant.

---

### `supabase/tests/lot4_verrou_creneau.sql` and `lot4_rls_reservation.sql` (SQL negative tests)

**Analog:** `supabase/tests/lot3_rls_isolation.sql` (whole file, 140 lines) — copy its structure section for section.

**Harness header + run command** (`lot3_rls_isolation.sql:1-12`):

```sql
-- D-18 forbids a proof that only shows the passing case: learner A reading
-- their own row proves nothing about isolation. This file asserts REFUSALS …
-- Local-only: it lives under supabase/tests/, never under
-- supabase/migrations/, and is never pushed.
--
-- Run with: psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/lot3_rls_isolation.sql
-- Single transaction, rolled back at the end so it leaves no data and can be
-- re-run at will.

begin;
```

(On this machine `psql` is not on PATH — `04-RESEARCH.md` verified `docker exec -i supabase_db_ElearningAriba psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f <file>` works.)

**Seeding auth users directly** (`lot3_rls_isolation.sql:17-27`) — the exact `insert into auth.users (…)` column list to reuse; the Lot 3 trigger then creates both `app.profil` rows for free:

```sql
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  is_sso_user, is_anonymous, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-00000000000a',
   'authenticated', 'authenticated', 'learner-a@example.test', 'x',
   now(), '{}'::jsonb, '{}'::jsonb, false, false, now(), now()),
  …
```

**Identity switch** (`lot3_rls_isolation.sql:51-52`) — `04-RESEARCH.md` flags that its own probe did this *outside* a transaction and warns the Lot 4 test must do it properly. This is the correct form, inside the `begin;`:

```sql
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';
```

**Control-then-negate structure** (`lot3_rls_isolation.sql:37-48`, `57-62`, `65-74`) — every negative test is preceded by a control assertion so a green run cannot come from missing data or a broken harness:

```sql
-- 2. Control assertion (bypass path, superuser): B's rows demonstrably exist.
do $$
begin
  if (select count(*) from app.profil where utilisateur_id = '…b') != 1 then
    raise exception 'control failed: learner B profile row missing';
  end if;
end $$;

-- 5. Negative assertion 1 — horizontal read
do $$
declare leaked_count int;
begin
  select count(*) into leaked_count from app.profil where utilisateur_id = '…b';
  if leaked_count != 0 then
    raise exception 'RLS-ISOLATION LEAK: learner A read % of learner B profil row(s)', leaked_count;
  end if;
  raise notice 'RLS-ISOLATION: profil cross-read DENIED';
end $$;
```

**Catch-the-refusal idiom, named SQLSTATE** (`lot3_rls_isolation.sql:107-123`) — this is the shape `lot4_verrou_creneau.sql` needs, swapping `insufficient_privilege` for `exclusion_violation` (23P01) and `unique_violation` (23505):

```sql
do $$
declare escalation_raised boolean := false;
begin
  begin
    update app.profil set role = 'administrator' where utilisateur_id = '…a';
  exception
    when insufficient_privilege then
      escalation_raised := true;
  end;

  if not escalation_raised then
    raise exception 'RLS-ISOLATION LEAK: learner A escalated their own role to administrator';
  end if;

  raise notice 'RLS-ISOLATION: role escalation DENIED';
end $$;
```

**Closing** (`lot3_rls_isolation.sql:140`): `rollback;`

---

### `scripts/seed-agenda.mjs` (script, batch upsert)

**Analog:** `scripts/seed-content.mjs`

**Header + locale-reading pattern** (`seed-content.mjs:1-17`) — states idempotence, the natural key it upserts on, and that no French string is authored in the `.mjs`:

```js
// Idempotent seed: moves the signed src/locales/fr/*.json bundles into the
// app.content_section / app.content_item tables (D-24). Upserts on the
// stable natural key (cle, or section_cle+cle) so a second run is a no-op
// (D-27). Every French string below is read from a JSON file — nothing here
// is authored copy. Connects with SUPABASE_SERVICE_ROLE_KEY: RLS grants anon
// no insert on the content tables (D-28).
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const localesDir = join(rootDir, "src/locales/fr");

function readJson(name) {
  return JSON.parse(readFileSync(join(localesDir, name), "utf8"));
}
```

→ D-21's trainer email and D-17's holiday labels follow this: the email from `process.env`, the labels from `src/locales/fr/admin.json`.

**Env guard + service client** (`seed-content.mjs:76-89`) — the exact template for D-21's extra `ADMIN_EMAIL`-style variable:

```js
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "content:seed: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  db: { schema: "app" },
  auth: { persistSession: false, autoRefreshToken: false },
});
```

**Idempotent upsert + fail-loud** (`seed-content.mjs:100-111`):

```js
async function upsertSections(rows) {
  const { error } = await supabase
    .from("content_section")
    .upsert(rows.map(normalizeSection), {
      onConflict: "cle",
      ignoreDuplicates: false,
    });
  if (error) {
    console.error(`content:seed: content_section upsert failed: ${error.message}`);
    process.exit(1);
  }
}
```

**Bulk-upsert trap to carry over** (`seed-content.mjs:113-117`) — every row in one call must carry every column explicitly, or omitted keys become explicit `NULL` rather than falling back to the column default. Directly relevant to seeding `disponibilite_hebdomadaire` and `exception_agenda` in one batch.

**`package.json` script shape** (`package.json:14`):

```json
"content:seed": "node --env-file-if-exists=.env.local scripts/seed-content.mjs"
```

---

### `src/lib/agenda/queries.ts` (service, CRUD read)

**Analog:** `src/lib/documents/queries.ts` (whole file, 40 lines)

**Imports + result type** (`documents/queries.ts:1-7`):

```ts
import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { QueryResult } from "@/lib/content/queries";

export type AccesSupport = Database["app"]["Tables"]["acces_support"]["Row"];
```

**Deliberate absence of an application-level owner filter** (`documents/queries.ts:9-13`) — the reasoning transfers to `app.reservation` unchanged:

```ts
/* why: neither function below filters on the owning-learner column — RLS
   (acces_support_self_select, plan 03-01) is the filter. Adding an
   application-level `.eq()` here would hide a policy regression behind
   application code; the negative proof in
   supabase/tests/lot3_rls_isolation.sql is what guards this choice. */
```

**Query shape** (`documents/queries.ts:15-26`):

```ts
export async function listerSupports(): Promise<QueryResult<AccesSupport[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("acces_support")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { ok: false };
  }
  return { ok: true, data };
}
```

**`QueryResult<T>` definition** (`src/lib/content/queries.ts:22`) — import it, do not redefine:

```ts
export type QueryResult<T> = { ok: true; data: T } | { ok: false };
```

**jsonb / untrusted-shape validation at the boundary** (`content/queries.ts:56-62`) — the idiom for validating an RPC's returned rows if the generated types are loose:

```ts
/* why: `donnees` is jsonb — validated at the boundary (CLAUDE.md) rather than
   trusted as an unchecked value. Missing arrays default to empty instead of
   failing the whole section on one malformed row. */
const moduleDonneesSchema = z.object({
  objectifs: z.array(z.string()).default([]),
  contenu: z.array(z.string()).default([]),
});
```

---

### `src/lib/validation/reservation.ts` (validation, transform)

**Analog:** `src/lib/validation/contact.ts` (whole file, 73 lines)

**Docblock + schema** (`contact.ts:3-22`):

```ts
/**
 * Contact form input, validated at the API boundary (src/app/api/contact).
 *
 * why: mirrors the src/lib/env/server.ts idiom — schema, safeParse, mapped
 * issues — but the messages resolve to contact.json's `erreurs.*` French
 * keys instead of Zod's English defaults (CLAUDE.md: no hardcoded strings).
 */
export const contactSchema = z.object({
  nom: z.string().trim().min(1),
  email: z.email(),
  profil: z.enum(["acheteur", "consultant", "etudiant", "entreprise"]),
  rendu: z.coerce.number(),
});

export type ContactInput = z.infer<typeof contactSchema>;
```

**French-key error mapping** (`contact.ts:24-53`) — the shape Lot 4 reuses to map the booking RPC's typed `resultat` and any field failure onto `reservation.erreurs.*`:

```ts
/** Matches the leaf keys of `contact.erreurs` in src/locales/fr/contact.json. */
export type ContactErreurKey =
  | "nomRequis" | "emailRequis" | "emailInvalide" | "messageRequis" | "profilRequis";

export function mapContactIssueToErreurKey(
  path: PropertyKey,
  code: string,
): ContactErreurKey | undefined {
  switch (path) {
    case "nom": return "nomRequis";
    case "email": return code === "invalid_format" ? "emailInvalide" : "emailRequis";
    default: return undefined;
  }
}
```

**Reducer to a field-keyed map** (`contact.ts:60-73`) — returned by the route as `{ errors }` and mapped back in the client component:

```ts
export function contactIssuesToFieldErrors(
  issues: readonly { path: PropertyKey[]; code: string }[],
): Partial<Record<keyof ContactInput, ContactErreurKey>> {
  const errors: Partial<Record<keyof ContactInput, ContactErreurKey>> = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field !== "string") continue;
    const key = mapContactIssueToErreurKey(field, issue.code);
    if (key) errors[field as keyof ContactInput] = key;
  }
  return errors;
}
```

---

### `src/lib/auth/session.ts` — add `requireAdministrator()` (guard)

**Analog:** the same file's `getLearner()` / `requireLearner()` pair (`session.ts:1-52`)

**Imports + typed row** (`session.ts:1-9`):

```ts
import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { QueryResult } from "@/lib/content/queries";

export type Learner = { id: string } & Database["app"]["Tables"]["profil"]["Row"];
```

**The session read** (`session.ts:11-39`):

```ts
/**
 * The single session read every /espace surface uses. Reads the auth user,
 * then the matching app.profil row — the RLS `utilisateur_id = auth.uid()`
 * filter makes the explicit .eq() redundant, kept anyway as defence in depth.
 */
export async function getLearner(): Promise<QueryResult<Learner>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data, error } = await supabase
    .from("profil").select("*").eq("utilisateur_id", user.id).maybeSingle();

  if (error || !data) return { ok: false };
  return { ok: true, data: { id: user.id, ...data } };
}
```

**Redirect-before-markup guard** (`session.ts:41-52`) — copy this shape exactly for `requireAdministrator()`, adding the `data.role !== "administrator"` branch:

```ts
/**
 * why (D-27): a session failure must never render a half-authenticated page
 * — no greeting with an empty name, no card grid behind a spinner. Redirect
 * happens before any markup is produced by the caller.
 */
export async function requireLearner(): Promise<Learner> {
  const result = await getLearner();
  if (!result.ok) {
    redirect("/connexion");
  }
  return result.data;
}
```

**Note for the planner:** `role` is already on the `profil` row `getLearner()` returns — `requireAdministrator()` needs no second query, only a role check plus a redirect target decision (`/espace` vs `/connexion`). D-01 is the first surface to read this column.

---

### `src/lib/rate-limit.ts` — widen `consume()` with a per-call-site budget (guard, D-27)

**Analog:** itself, `src/lib/rate-limit.ts:17-31`. **Discipline analog:** `src/lib/email/resend.ts`
gaining an optional `attachments` field — the repo's established way of widening a shared utility
without touching its callers.

**What to copy:** the existing `Map<string, number[]>`, its cutoff pruning and its `why:` comment
about being a per-instance best-effort limiter with no third-party store (D-35). Keep all of it.

**What changes:** `consume(key: string)` becomes
`consume(key: string, options?: { max?: number; windowMs?: number })`, with both defaulting to the
existing `MAX_PER_WINDOW = 5` / `WINDOW_MS = 10 * 60 * 1000` module constants. The two existing
callers — `src/app/api/contact/route.ts` and `src/app/api/rgpd/suppression/route.ts` — are then
**byte-unchanged** and keep their current budget, which is the acceptance criterion.

**Why it is needed at all:** the D-27 retention route cannot live on a 5-per-10-minutes budget. Every
slot choice and every slot *change* is a `POST`, so a visitor comparing créneaux — the behaviour D-27
exists to support — would be refused on the phase's primary conversion path, and a corporate NAT
shares one egress IP across many visitors.

**The rule that governs the keying, and it is worth stating as a pattern because this is the repo's
first unauthenticated write path:** on such a route the **client IP is the only identifier the caller
does not control**, so a client-supplied value may *narrow* a budget but may never *replace* one.
Plan 04-03 therefore applies an unconditional `maintien:ip:<ip>` ceiling of 120/10 min to every
`POST` **before the body is read**, then narrows from the zod-validated body: `maintien:mint:<ip>` at
30/10 min on the only branch that can create state, and `maintien:jeton:<ip>:<jeton>` at 60/10 min on
the branch a slot-comparing visitor travels. `DELETE` carries a 120/10 min ceiling that **fails
open** — the release is attempted anyway, because refusing to let go of a slot is the opposite of
what the limiter is for. An earlier draft selected the budget *from* the `jeton` and was bypassable
with a fresh uuid per request; do not reintroduce that shape.

**One behavioural change beyond the signature:** the `hits` Map gains an amortised sweep (every 500th
`consume()` call, drop entries whose newest timestamp predates the widest window seen). Entries were
previously only ever `set`, which was fine for a handful of IPs and is not fine once an anonymous
caller influences the key space.

**Do not:** add a store, a dependency, or a second limiter module.

---

### `src/app/api/creneaux/maintien/route.ts` (route, unauthenticated write — D-27/D-28)

**Analog:** `src/app/api/contact/route.ts` — the only other route in the repo that accepts an
untrusted body with no session. Copy its opening exactly: the method-surface comment naming which
verbs the file exports, `consume()` before anything is parsed, zod at the boundary returning a
field-error map with 422, and never returning a raw error.

**Where the analog stops, and it is the important part:** `api/contact/route.ts` only *sends an
email*; this route **writes server state that hides a slot from every other visitor.** There is no
analog in the repo for that, so the plan compensates with four controls that must all be present:
split mint/replace budgets (above), a server-generated opaque token the caller never chooses, a
fifteen-minute ceiling that is a SQL literal inside `app.maintenir_creneau` and therefore
unreachable from the body, and `Cache-Control: no-store` so no shared cache hands one visitor
another's token.

**Client used:** `src/lib/supabase/public.ts` — this is a server route, so the `server-only` fence is
satisfied; the naming slip recorded against D-06 concerns *client components* only.

**Do not:** call `getLearner()` or `requireLearner()` here. D-28 puts sign-in at screen 3, so the
visitor retaining a slot has no session yet, and gating this route would restore the exact barrier
D-28 removes.

---

### `supabase/tests/lot4_maintien_creneau.sql` (SQL negative test, D-27)

**Analog:** `supabase/tests/lot3_rls_isolation.sql` for the harness — `begin;`, a positive control
before every negative assertion, `raise exception` on failure and `raise notice` on success, closing
`rollback;` — and `lot4_verrou_creneau.sql` for the Lot 4 fixture shape (seeding a type, a weekly
rule and `auth.users` rows).

**The one thing this file exists to prove, and it is not "the retention works":** that the retention
**grants nothing**. D-03 and D-27 both keep the exclusion constraint as the only source of truth, so
step 9 retains an instant with one token, then books it with a *forged* token and asserts the refusal
comes from the constraint rather than from the retention. Step 3 proves the neighbouring and distinct
property that a never-minted token cannot *create* a retention at all. A file that only asserted the happy path
would pass against an implementation that had quietly made the hold authoritative.

**Order matters:** the early-morning `00:30` Europe/Paris assertion runs first, before the ordinary
cases, so a green suite cannot come from never touching the `at time zone` boundary in
`app.maintenir_creneau`.

---

### `src/components/agenda/booker-skeleton.tsx` (component, drawn loading state)

**Analog:** none — there is no skeleton anywhere in the repo (see § No Analog Found). The nearest
thing is `EmptyState`, which is a *content* state, not a *loading* one, and must not be reused here.

**What to build:** the exact geometry of the panel it replaces — a seven-column grid of day-cell
placeholders at the real cell height, and a matin/après-midi placeholder list at the real chip
height. `04-CONTEXT.md` § Parcours is explicit that D-06's static-shell-plus-client-read *creates*
this loading instant, so it is designed rather than tolerated: never a bare spinner, never an empty
box, and no height change when the data lands.

**Do not:** add a second animation curve. The codebase has exactly one `cubic-bezier`
(`--ease-brand`) and this phase adds none.

---

### `src/components/reservation/compte-a-rebours-maintien.tsx` (client, D-27 countdown)

**Analog:** `src/components/forms/contact-form.tsx` for the `useState` machine and for the
hydration-safety comment at lines 38-46 explaining why mount-time values are set in an effect rather
than during render — a countdown is exactly that case.

**Arithmetic:** none of its own. It calls `maintienRestant(expireLe, now)` from
`src/lib/agenda/creneaux.ts`, so `/agenda` and `/reservation` cannot drift apart on when a hold has
lapsed.

**The rule that outranks the component:** a lapsed countdown **must not disable the commit button.**
Only the database knows whether the slot is gone; if nobody took it, the commit still succeeds.
Binding the button's `disabled` to the timer would make the retention a second source of truth,
which D-27 and D-03 both forbid. Use `--warning`/`muted` semantics on the lapse state, never
`destructive`: an expired hold is not a system failure.

**Cleanup:** one interval, cleared in the effect's return. `grep` for `setInterval` across
`src/components/reservation/` must find it only here.

---

### `src/lib/i18n/fr.ts` — two new formatters (utility, D-U4)

**Analog:** the same file, `fr.ts:32-59`. Follow the existing "why" comments verbatim in spirit — they name the bug class these formatters exist to prevent, which is exactly `04-UI-SPEC.md`'s argument for the two new ones:

```ts
/* why: numberFormatter has no currency style, so it never produces a "€" —
   a maquette that hand-writes the symbol next to a plain number would
   violate D-29/D-30, so every price must go through this formatter instead */
export const currencyFormatter: Intl.NumberFormat = new Intl.NumberFormat(
  LOCALE, { style: "currency", currency: "EUR" },
);

export const timeFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(
  LOCALE, { timeZone: TIME_ZONE, timeStyle: "short" },
);

/* why: numberFormatter/formatNumber render a bare digit with no unit
   (D-30/D-43 of Lot 2) — a hand-written " h" at a call site is the same
   class of violation as a hand-written "€" … */
export const hourFormatter: Intl.NumberFormat = new Intl.NumberFormat(LOCALE, {
  style: "unit", unit: "hour", unitDisplay: "short",
});
```

**Pairing rule** (`fr.ts:61-83`): every exported formatter has a matching `formatX(value)` wrapper. Both new formatters must ship with theirs.

**Pinned constants** (`fr.ts:8-9`) — never re-declare:

```ts
export const LOCALE = "fr-FR" as const;
export const TIME_ZONE = "Europe/Paris" as const;
```

**Tension to record:** CONTEXT's scope fence says "no new `Intl` formatters"; `04-UI-SPEC.md` D-U4 requires exactly two, in this file, in this idiom. `04-RESEARCH.md` Open Question 3 flags it. The fence's intent (no formatting outside this file) is satisfied by adding them here.

---

### `src/lib/email/resend.ts` — add `attachments?` (service, transport)

**Analog:** itself. Additive edit only — the scope fence forbids a second sender.

**Current input + call** (`resend.ts:26-51`):

```ts
interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
}

/** Sends one plain-text email over fetch. No SDK — one POST does not warrant a dependency (§2.13). */
export async function sendEmail({ to, subject, text }: SendEmailInput): Promise<void> {
  const parsedKey = resendKeySchema.safeParse(serverEnv.RESEND_API_KEY);
  if (!parsedKey.success) {
    throw new EmailTransportError("RESEND_API_KEY is not configured");
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${parsedKey.data}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: "contact@formation-sap-ariba.fr", to, subject, text }),
  });

  if (!response.ok) {
    throw new EmailTransportError(`Resend responded with ${response.status}`);
  }
}
```

**Request-time key validation rationale to preserve** (`resend.ts:9-17`) — the new video-link env var in `src/lib/env/server.ts` follows the same optional-at-boot / strict-at-use precedent:

```ts
/*
 * why (D-48 vs D-34): RESEND_API_KEY is optional in serverEnv so `next
 * build` stays green while the CIO provisions the key — but this transport
 * re-validates it strictly, at request time … Never log the key.
 */
const resendKeySchema = z.string().min(1);
```

**Extension shape** — from `04-RESEARCH.md` Pattern 8; the attachment key must stay optional so the two existing callers (`api/contact`, `api/rgpd/suppression`) are untouched.

---

### `src/lib/email/render.ts` — add reservation renderers (utility, transform)

**Analog:** the same file, `render.ts:1-71`.

**Locale-entry contract** (`render.ts:21-45`) — the shape any new `emails.json` entry must have; `renderEntry` is reused, not duplicated:

```ts
interface EmailEntry {
  objet: string;
  preheader: string;
  salutation: string;
  corps: string[];
  action: { libelle: string; contexte: string };
  signature: string;
  pied: string;
}

function renderEntry(entry: EmailEntry, values: Record<string, string>): RenderedEmail {
  const subject = substitute(entry.objet, values);
  const lines = [
    substitute(entry.salutation, values), "",
    ...entry.corps.map((line) => substitute(line, values)), "",
    substitute(entry.action.libelle, values),
    substitute(entry.action.contexte, values), "",
    substitute(entry.signature, values),
    substitute(entry.pied, values),
  ];
  return { subject, text: lines.join("\n") };
}
```

**Per-email export** (`render.ts:63-71`) — one typed function per email; three new ones for Lot 4 (learner confirmation, trainer notification, admin cancellation/move notice):

```ts
/** The notification sent to the trainer when a learner requests account deletion. */
export function renderSuppressionNotification(values: {
  prenom: string; nom: string; email: string; date: string;
}): RenderedEmail {
  return renderEntry(emails.suppressionCompteNotification as EmailEntry, values);
}
```

**Substitution** (`render.ts:10-19`): single-brace `{key}` via `replaceAll`. No templating library.

---

### `src/lib/env/server.ts` — video-link var (config, D-15)

**Analog:** the `RESEND_API_KEY` and `SUPABASE_SUPPORTS_BUCKET` entries (`server.ts:16-34`):

```ts
const serverEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  /**
   * why (D-48): boot-time-required would break `next build` until the CIO
   * provisions the key — optional here, strictly re-validated at request
   * time inside src/lib/email/resend.ts (D-34).
   */
  RESEND_API_KEY: z.string().min(1).optional(),
  /**
   * why: a bucket name, not a secret — defaulted rather than required so a
   * missing value never breaks `next build`. …
   */
  SUPABASE_SUPPORTS_BUCKET: z.string().min(1).default("supports"),
});
```

**Fail-loud parse** (`server.ts:38-50`) — unchanged; the new var just joins the object:

```ts
const parsed = serverEnvSchema.safeParse({ ...process.env, NEXT_PUBLIC_SITE_URL: resolveSiteUrl(process.env) });
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  throw new Error(`Invalid environment variables — ${issues}`);
}
export const serverEnv: Readonly<ServerEnv> = Object.freeze(parsed.data);
```

The video link is server-only (it goes into the `.ics` and the emails) → `server.ts`, **not** `client.ts`. `.env.example` must gain the same line (the docblock says the schema "mirrors .env.example exactly").

---

### `src/middleware.ts` — matcher gains `/admin` (middleware)

**Analog:** itself, whole file (29 lines).

```ts
export default async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);

  // why (T-03-03): getSession() returns whatever is in the cookie without
  // contacting the auth server, so a forged or stale cookie would be
  // trusted. getUser() validates the token against the auth server.
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }

  return response;
}

// why (D-15/D-16): a positive matcher is the only shape that cannot
// accidentally opt a public route into dynamic rendering — a negative
// matcher would silently make the fourteen static routes dynamic and
// regress Lot 2's recette criterion. …
export const config = {
  matcher: ["/espace", "/espace/:path*"],
};
```

→ Lot 4 adds `"/admin", "/admin/:path*"` to that array and nothing else. The middleware only proves a session exists; the **role** gate is `requireAdministrator()` in `src/app/admin/layout.tsx` plus RLS. Adding a role check here would need a DB read per request and would not be the non-bypassable layer anyway.

---

### `src/app/api/reservation/route.ts` (route, request-response)

**Analog:** `src/app/api/rgpd/suppression/route.ts` (session-scoped write + email, whole file) crossed with `src/app/api/contact/route.ts` (zod boundary).

**Zod-at-the-boundary opening** (`api/contact/route.ts:17-24`):

```ts
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    const errors = contactIssuesToFieldErrors(parsed.error.issues);
    return NextResponse.json({ errors }, { status: 422 });
  }
```

**Method-surface comment** (`api/rgpd/suppression/route.ts:11-16`) — every route states which verbs it exports and why:

```ts
/*
 * why: this endpoint records a deletion request, it does not delete
 * anything … This file exports POST only. No GET/PUT/PATCH/DELETE.
 */
```

**Session gate + session-scoped client** (`api/rgpd/suppression/route.ts:17-24`):

```ts
export async function POST() {
  const learnerResult = await getLearner();
  if (!learnerResult.ok) {
    return NextResponse.json({ erreur: donnees.suppression.erreur }, { status: 401 });
  }

  const { data: learner } = learnerResult;
  const supabase = await createClient();
```

**Identity never read from the request body** (`api/rgpd/suppression/route.ts:26-32`) — the same discipline the booking RPC enforces server-side (`auth.uid()` inside the function, never a client-supplied user id):

```ts
/* why: the identity column has no database default …, so PostgREST requires
   it in the insert payload regardless of RLS — the value below is the
   session's own id from getLearner(), never read from a request body …, and
   the RLS `with check` … still refuses any other value. */
```

**SQLSTATE branching** (`api/rgpd/suppression/route.ts:39-57`) — the *existing* precedent for mapping a constraint code to a French key. **Lot 4 must NOT copy this to the reservation write**: `04-RESEARCH.md` Pitfall 1 proves PostgREST returns HTTP 400 for `23P01`, so the booking path branches on the RPC's typed `resultat` string instead:

```ts
  if (insertError) {
    if (insertError.code === "23505") {
      …
      return NextResponse.json({ erreur: "dejaDemandee", date: … }, { status: 409 });
    }
    return NextResponse.json({ erreur: donnees.suppression.erreur }, { status: 502 });
  }
```

**Send-after-commit, never roll back** (`api/rgpd/suppression/route.ts:59-90`) — this is the exact discipline AGD-06 needs (booked slot + failed email is recoverable; a lost booking is not):

```ts
  try {
    const notification = renderSuppressionNotification({ …,
      /* why: the trainer-facing email date reuses the same fr-FR/
         Europe/Paris formatter instance … (see src/lib/i18n/fr.ts). */
      date: i18n.dateFormatter.format(new Date(inserted.demandee_le)),
    });

    await sendEmail({
      to: contact.coordonnees.email,   // ← the trainer address, D-15/AGD-06
      subject: notification.subject,
      text: notification.text,
    });
  } catch (error) {
    /* why: the row is already stored — do not roll it back. A recorded
       request with a failed notification is recoverable by hand; a lost
       request is a broken GDPR obligation (T-03-10). */
    if (!(error instanceof EmailTransportError)) {
      throw error;
    }
  }

  /* why: a deliberate divergence from api/contact/route.ts, which returns
     502 on a send failure because there the notification IS the
     deliverable. Here the row is … */
  return NextResponse.json({ ok: true }, { status: 200 });
```

**Two-recipient send** (`api/contact/route.ts:68-77`) — learner + trainer, sequential awaits:

```ts
    await sendEmail({ to: contact.coordonnees.email, subject: notification.subject, text: notification.text });
    await sendEmail({ to: email, subject: acknowledgement.subject, text: acknowledgement.text });
```

**No `.rpc()` call exists anywhere in `src/` today** (verified by grep). The `.rpc("creneaux_libres", …)` / `.rpc("reserver_creneau", …)` call shape comes from `04-RESEARCH.md` Patterns 3, 5 and 6 — there is no in-repo analog to copy.

---

### `src/app/api/admin/reservations/export/route.ts` (route, file download) and the `.ics` download route

**Analog:** `src/app/api/documents/[id]/route.ts` (whole file, 58 lines)

**Method-surface + cache-declaration reasoning** (`documents/[id]/route.ts:7-18`) — directly applicable: a CSV of personal data and a per-reservation `.ics` must not inherit a cache declaration:

```ts
/*
 * why: a signed support download is personal data behind a session (D-37) —
 * this file exports GET only. No POST/PUT/PATCH/DELETE.
 *
 * why: programme.pdf/route.ts:9 declares a one-hour cache lifetime, because
 * that PDF is the same for every visitor. This route is the opposite —
 * copying that declaration here would cache one learner's signed URL and
 * serve it to the next caller … No such declaration is made in this file.
 */

const idSchema = z.uuid();
```

**Param validation + non-oracle 404** (`documents/[id]/route.ts:20-45`):

```ts
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ erreur: espace.documents.erreur }, { status: 404 });
  }
  …
  /* why: the same 404, same body shape, whether the id does not exist or
     the learner is not entitled — this endpoint must never become an
     existence oracle (T-03-38). Never return the storage path, the bucket
     name, the service key or a raw Supabase error. */
```

**Download headers** (`documents/[id]/route.ts:47-57`) — the accent-safe `Content-Disposition` idiom the French CSV filename and `.ics` need:

```ts
  return NextResponse.redirect(result.data.url, {
    status: 302,
    headers: {
      "Cache-Control": "no-store, no-cache, private",
      /* why: filename* (RFC 5987) instead of a bare quoted filename — the
         titre carries French accents, which are not valid in a raw HTTP
         header value (ByteString), while encodeURIComponent's output is
         always ASCII-safe. */
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(result.data.titre)}`,
    },
  });
```

Lot 4 returns a body rather than a redirect (`new NextResponse(csv, { headers })`), but keeps the header discipline and the `Cache-Control: no-store, no-cache, private`.

---

### `src/app/admin/layout.tsx` (layout, guard)

**Analog:** `src/app/espace/layout.tsx` (whole file, 18 lines)

```tsx
import { requireLearner } from "@/lib/auth/session";
import { EspaceNav } from "@/components/espace/espace-nav";

// why (D-27): requireLearner() runs before anything is rendered, so an
// absent or broken session redirects to /connexion rather than producing
// partial markup.
export default async function EspaceLayout({ children }: LayoutProps<"/espace">) {
  await requireLearner();

  return (
    // why: py-16 is the page's own responsibility (see espace/page.tsx),
    // not this layout's — do not add a second one here.
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4">
      <EspaceNav />
      {children}
    </div>
  );
}
```

→ `/admin` copies this exactly, substituting `requireAdministrator()`, an `AdminNav` side nav, and adding `data-density="compact"` at the root (D-U1). Note the typed `LayoutProps<"/admin">` generic — Next 16 `next typegen` supplies it; do not hand-write a props interface.

**The density attribute precedent** (`src/app/espace/page.tsx:56-62`) — the one existing call site that names the contract:

```tsx
      {/* why: the back-office reuses this component set at a tighter
          density (D-24) — the contract is one attribute away, left at its
          default value here. */}
      <div
        data-density="default"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
```

---

### `src/app/agenda/page.tsx` (page, static shell rewrite)

**Analogs:** `src/app/a-propos/page.tsx:15-17` (static declaration) and the current `src/app/agenda/page.tsx` (markup to preserve).

**Static/ISR declaration** (`a-propos/page.tsx:15-17`):

```tsx
// why (D-38): keeps the route static/ISR through the cookieless public read
// client.
export const revalidate = 3600;
```

**Markup and copy wiring to keep** (`agenda/page.tsx:32-63`) — the header, the type chooser and the `formatCurrency`/`formatNumber` call sites survive the rewrite; only the data source changes:

```tsx
export default function Agenda() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">{agenda.titre}</h1>
        <p className="text-muted-foreground">{agenda.intro}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {agenda.typesRendezVous.map((type) => (
          <Card key={type.id}>
            <CardHeader>
              {/* why: no h2 precedes the chooser (no copy key exists for a
                  section title here); a heading tag would skip a level, so
                  the type name is a styled paragraph, not CardTitle's h3 */}
              <p className="font-heading text-base font-semibold">{type.libelle}</p>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground text-sm">{formatNumber(type.dureeMinutes)}</span>
              <Badge variant={type.prix === 0 ? "success" : "outline"}>{formatCurrency(type.prix)}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
```

**The maquette block to delete** (`agenda/page.tsx:13-30, 74-96`) — the file names its own successor:

```tsx
/* why: Lot 4 owns real availability (recurrence, locks, conflicts); this grid
   is illustrative maquette data only, replaced wholesale in that lot */
const joursMaquette = [ … ] as const;

const legendeVariant = {
  libre: "success",
  reserve: "default",
  passe: "muted",
  bloque: "destructive",
} as const;
```

→ D-24 collapses this map to three public entries (**Libre / Indisponible / Passé**); D-U3 forces `Indisponible` onto `muted`, never `destructive`.

**Empty state to keep verbatim** (`agenda/page.tsx:98-111`) — `EmptyState tone="waiting"` wired to `agenda.aucunCreneau.*`.

**Hard constraint (Pitfall 3):** this page must not read `cookies()`, `headers()` or `searchParams` at the top level, or the route goes dynamic and D-06 breaks. Verify with `npm run build` and the `○` / `ƒ` route table.

---

### `src/components/agenda/agenda-booker.tsx` (client island) — **weakest analog in the phase**

**Verified gap:** `grep -rn "supabase/client" src/` returns **only** a comment reference in `src/lib/supabase/server.ts:16`. `src/lib/supabase/client.ts` has **zero consumers**. Every existing client component talks to a route handler over `fetch`, never to Supabase directly. This island is the first browser-side Supabase reader in the codebase.

**The factory it must use** (`src/lib/supabase/client.ts:14-26`) — note the `<Database, "app">` generic and the schema default; no `.schema("app")` call is needed:

```ts
export function createClient() {
  return createBrowserClient<Database, "app">(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      // Every table lives in schema app, nothing in public — default here
      // instead of calling .schema('app') on every content read.
      db: { schema: "app" },
    },
  );
}
```

**Do not import `src/lib/supabase/public.ts`** despite D-06's wording — it opens with `import "server-only"` (`public.ts:1`) and is a build error inside a `"use client"` file. `04-RESEARCH.md` Pitfall 2 records this; the plan should carry the note so a reviewer does not "fix" it back.

**State-machine + fetch analog** (`src/components/forms/contact-form.tsx:22-97`) — the closest existing client-component shape: a union status type, an early success return, a field-error map read back from the response:

```tsx
type Status = "idle" | "submitting" | "success" | "error";

type FieldErrors = Partial<Record<"nom" | "email" | "profil" | "message", keyof typeof contact.erreurs>>;

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  …
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 422) {
        const body = (await response.json()) as { errors?: FieldErrors };
        setFieldErrors(body.errors ?? {});
        setStatus("error");
        return;
      }
      if (!response.ok) { setStatus("error"); return; }
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return <Message variant="success">{contact.succes.message}</Message>;
  }
```

**Hydration-safety precedent** (`contact-form.tsx:38-46`) — directly relevant to a calendar that opens on "today" or on the first slot-carrying day:

```tsx
  /* why: set on mount, not during render — "use client" components still
     render once on the server, so writing Date.now() to the hidden input's
     DOM node inside an effect (not as a React-controlled value) avoids a
     hydration mismatch */
  useEffect(() => { … }, []);
```

**CLAUDE.md conflict to surface:** "use queryKeys factory, prefer optimistic updates" presupposes TanStack Query, which is not installed and which the zero-dependency budget forbids (`04-RESEARCH.md` Open Question 4). The `useState` state machine above is the in-repo idiom.

---

### Admin destructive actions (cancel a reservation, delete a holiday override)

**Analog:** `src/components/compte/suppression-compte.tsx` (whole file, 140 lines) — exact match, and `04-UI-SPEC.md` D-U2 mandates reusing it.

**In-page two-step reveal, no modal** (`suppression-compte.tsx:11-38`):

```tsx
type Etat = "repos" | "confirmation" | "envoi" | "enregistree" | "dejaDemandee" | "erreur";

/*
 * why (D-A4): the confirmation step reveals in place, on the same page —
 * no overlay, no focus trap, no portal. This survives without JavaScript
 * in a way a hand-rolled overlay would not.
 */
export function SuppressionCompte({ demandeDejaEnCours, dateDemandeExistante }: SuppressionCompteProps) {
  const [etat, setEtat] = useState<Etat>(demandeDejaEnCours ? "dejaDemandee" : "repos");
  const [confirme, setConfirme] = useState(false);
```

**The trigger → panel → confirm sequence** (`suppression-compte.tsx:92-137`):

```tsx
  if (etat === "repos") {
    return (
      <Button variant="outline" onClick={() => setEtat("confirmation")}>
        {donnees.suppression.action}
      </Button>
    );
  }

  const enEnvoi = etat === "envoi";

  return (
    <Card variant="default" className="gap-4">
      <CardContent className="flex flex-col gap-4">
        …
        <label className="flex items-start gap-3">
          <Checkbox checked={confirme} onCheckedChange={(value) => setConfirme(value === true)} />
          <span className="text-sm text-foreground">{donnees.suppression.confirmation.caseACocher}</span>
        </label>

        {etat === "erreur" ? <Message variant="error">{donnees.suppression.erreur}</Message> : null}

        <Button
          variant="destructive"
          className="h-11"
          disabled={!confirme || enEnvoi}
          data-loading={enEnvoi ? "true" : undefined}
          onClick={handleConfirmer}
        >
          {donnees.suppression.confirmation.confirmer}
        </Button>
      </CardContent>
    </Card>
  );
```

Note `className="h-11"` — the 44 px touch-target call-site override `04-UI-SPEC.md` requires, applied as a class, never as a component edit.

**Status-code branching in the handler** (`suppression-compte.tsx:39-61`) — the shape for the admin cancel/move calls.

---

### `src/app/espace/page.tsx` — populate "Mes prochains rendez-vous" (page, CRUD read)

**Analog:** itself, `espace/page.tsx:24-27` and `63-83`. Only the data source changes; `04-UI-SPEC.md` forbids changing the composition.

```tsx
export default async function Espace() {
  const learner = await requireLearner();
  const supports = await listerSupports();
```

```tsx
        {SURFACES.map(({ key, tone }) => {
          const surface = espace[key];
          return (
            <Card key={key}>
              <CardHeader><CardTitle>{surface.titre}</CardTitle></CardHeader>
              {key === "documents" ? (
                <DocumentsList supports={supports.ok ? supports.data : []} />
              ) : (
                <EmptyState tone={tone} size="sm">
                  <EmptyStateTitle>{surface.vide.titre}</EmptyStateTitle>
                  <EmptyStateDescription>{surface.vide.message}</EmptyStateDescription>
                </EmptyState>
              )}
            </Card>
          );
        })}
```

→ Lot 4 adds a `key === "rendezVous"` branch alongside the existing `documents` one, fed by `src/lib/agenda/queries.ts` in the same `QueryResult` shape (`supports.ok ? supports.data : []`). `src/components/espace/documents-list.tsx` is the component analog for the list itself.

---

### `src/locales/fr/admin.json` (new) and the D-24 legend edit

**Analog for structure:** `src/locales/fr/agenda.json` (21 lines) and `src/locales/fr/reservation.json` (20 lines) — flat `titre` / `intro` / `champs` / `erreurs` / `succes` nesting, French copy only, no interpolation beyond `{placeholder}` handled by `render.ts:14-19` / `espace/page.tsx:53`.

**The one sanctioned edit** (`agenda.json:6-11`):

```json
  "legende": {
    "libre": "Libre",
    "reserve": "Réservé",
    "passe": "Passé",
    "bloque": "Bloqué"
  },
```

→ public legend becomes three entries (Libre / Indisponible / Passé); "Réservé"/"Bloqué" move to `admin.json`.

**Hard fence — byte-identical, no Lot 4 diff** (`agenda.json:12-15`):

```json
  "typesRendezVous": [
    { "id": "decouverte", "libelle": "Appel découverte", "dureeMinutes": 30, "prix": 0 },
    { "id": "individuelle", "libelle": "Session individuelle", "dureeMinutes": 60, "prix": 90 }
  ],
```

These two `id` values are the natural keys `app.type_rendez_vous.id` uses and `scripts/seed-agenda.mjs` reads (prix in **euros** here → **centimes** in the DB, converted once in the seed).

**Existing error key to reuse unchanged** (`reservation.json:17-19`):

```json
  "erreurs": {
    "creneauIndisponible": "Ce créneau vient d'être réservé par quelqu'un d'autre. Choisissez un autre horaire."
  }
```

→ the target of the RPC's `'creneau_indisponible'` outcome.

---

## Shared Patterns

### 1. `import "server-only"` as the server/browser fence
**Source:** `src/lib/supabase/public.ts:1`, `src/lib/email/resend.ts:1`, `src/lib/email/render.ts:1`, `src/lib/auth/session.ts:1`, `src/lib/documents/queries.ts:1`, `src/lib/content/queries.ts:1`
**Apply to:** `src/lib/agenda/queries.ts`, `src/lib/agenda/ics.ts`, `src/lib/agenda/csv.ts`
**Do NOT apply to:** `src/lib/agenda/creneaux.ts` (imported by the client island) — that file must stay `Intl`-only and side-effect free.

### 2. `QueryResult<T>` discriminated read result
**Source:** `src/lib/content/queries.ts:11-22`
**Apply to:** every function in `src/lib/agenda/queries.ts`, and `requireAdministrator()`'s `get*` half.
```ts
export type QueryResult<T> = { ok: true; data: T } | { ok: false };
```
Callers render an error/empty surface rather than throwing across a Server Component boundary.

### 3. Zod at the boundary, French keys out
**Source:** `src/lib/validation/contact.ts` + `src/app/api/contact/route.ts:17-24`
**Apply to:** every Lot 4 route handler (booking POST, admin writes, CSV date range) and the new env var.
Never return a raw Supabase error or an English Zod message to the client — return a locale **key**, mapped in the component.

### 4. RLS is the filter; grants are the escalation control; a SQL negative test is the proof
**Source:** `src/lib/documents/queries.ts:9-13` + `supabase/migrations/20260831161000_lot3_grants.sql:18-31` + `supabase/tests/lot3_rls_isolation.sql`
**Apply to:** `app.reservation`, `app.disponibilite_hebdomadaire`, `app.exception_agenda`.
Three layers, in this order: (a) no application `.eq()` on the owner column, (b) withhold the table/column privilege that RLS's `with check` cannot refuse, (c) prove the refusal negatively in `supabase/tests/`.

### 5. Email: render from locale, send after commit, never roll back
**Source:** `src/lib/email/render.ts:31-45` + `src/app/api/rgpd/suppression/route.ts:59-90`
**Apply to:** AGD-06 (learner confirmation + `.ics`, trainer notification) and the admin cancel/move notice.
Trainer address is always `contact.coordonnees.email` from `src/locales/fr/contact.json` — never a literal.

### 6. Redirect before markup for every gated surface
**Source:** `src/lib/auth/session.ts:41-52` + `src/app/espace/layout.tsx:4-8`
**Apply to:** `src/app/admin/layout.tsx` and any authenticated booking screen.
No partial render, no spinner behind a failed session.

### 7. No hand-written date, hour, price or unit anywhere
**Source:** `src/lib/i18n/fr.ts:32-59` (the "why" comments are the rule)
**Apply to:** every Lot 4 surface, the `.ics` description, the CSV, every email body.
Two new formatters are added to this same file (D-U4); nothing formats outside it.

### 8. Additive-only migrations, with a runnable reversion comment
**Source:** `supabase/migrations/20260831160000_lot3_comptes.sql:1-11`, `20260831161000_lot3_grants.sql:1-10`, `20260830090000_public_content.sql:1-8`
**Apply to:** both Lot 4 migrations. No `alter`, no `drop` against Lot 1–3 objects. `app.touch_updated_at()` is attached, never recreated.

### 9. `security definer` ⇒ `set search_path = ''`
**Source:** `supabase/migrations/20260831160000_lot3_comptes.sql:64-68`
**Apply to:** `app.creneaux_libres()`, `app.reserver_creneau()`, `app.est_administrateur()`, `app.paques()`, and every admin RPC.

### 10. Regenerate types in the same plan as the migration
**Source:** `scripts/gen-db-types.mjs` (`npm run db:types`, `package.json:12`)
The script fails loudly and leaves the committed file untouched on a bad run (`gen-db-types.mjs:38-42`), and normalises line endings to avoid a spurious Windows diff (`gen-db-types.mjs:44-47`). `src/types/database.types.ts` is stale the moment the migration lands; its diff is committed.

---

## No Analog Found

The planner should take these from `04-RESEARCH.md` (all empirically verified against this repo's own stack) rather than from the codebase.

| File / concern | Role | Data Flow | Reason | Where the pattern comes from |
|---|---|---|---|---|
| `tstzrange` + `exclude using gist` + generated column | migration | DDL | No range type, no exclusion constraint, no generated column exists anywhere in `supabase/migrations/` | `04-RESEARCH.md` Pattern 4 + § Code Examples (proven transcripts, SQLSTATE 23P01) |
| `at time zone 'Europe/Paris'` day expansion, `generate_series`, `isodow` | RPC (SQL) | transform | No temporal SQL exists in the repo | `04-RESEARCH.md` Patterns 2, 3 + the DST transcript |
| `security definer` function **returning a table / typed outcome** | RPC | request-response | The only definer function in the repo returns `trigger` (`lot3_comptes.sql:64`); no `returns table`, no plpgsql outcome enum | `04-RESEARCH.md` Patterns 3, 5 |
| `.rpc()` call from TypeScript | client / route | request-response | Zero occurrences of `.rpc(` in `src/` (verified) | `04-RESEARCH.md` Pattern 6 |
| Browser-side Supabase read (client island) | component (client) | request-response | `src/lib/supabase/client.ts` has **zero consumers**; every client component today fetches a route handler | `04-RESEARCH.md` Pattern 6; state-machine shell from `contact-form.tsx` |
| `src/lib/agenda/ics.ts` | utility | transform | No RFC 5545 code, no `.ics`, no folding/escaping anywhere | `04-RESEARCH.md` Pattern 7 (~40 lines, all-UTC, no `VTIMEZONE`) |
| `src/lib/agenda/csv.ts` | utility | transform | No CSV generation anywhere; `programme.pdf/route.ts` is a static asset, not a generated document | `04-RESEARCH.md` Pattern 10 (BOM + `;` + CRLF + injection guard) |
| Hand-written monthly calendar grid | component | — | Only the 7-badge maquette at `agenda/page.tsx:74-84`; no real grid, no `@base-ui/react` calendar primitive | `04-UI-SPEC.md` § New components; grid math via `Intl` `formatToParts` (`04-RESEARCH.md` § Code Examples) |
| `requireAdministrator()` / any role-gated surface | guard | request-response | `profil.role` has existed since Lot 3 but **no surface reads it** (Lot 3 D-02, `lot3_comptes.sql:30`). D-01 is its first exposure. | Shape copied from `requireLearner()` (`session.ts:41-52`); the role check itself is new |
| Admin side-nav shell at `data-density="compact"` | component | — | The attribute is declared in `globals.css:378-386` with **zero call sites** at `compact` today (`espace/page.tsx:60` sets `default`) | `04-UI-SPEC.md` D-U1; nav structure from `src/components/espace/espace-nav.tsx` |
| A table with RLS **enabled and no policy at all** (`app.maintien_creneau`) | migration | DDL | Every RLS table in the repo carries at least one policy; a policy-less table reachable only through its own `security definer` RPCs has no precedent | `04-CONTEXT.md` D-27 + D-23: a readable retention table would publish "someone is about to take this", the activity signal D-23 withholds. Grants and policy both withheld; `service_role` only |
| An **unauthenticated route that writes server state** (`/api/creneaux/maintien`) | route | request-response | `api/contact/route.ts` is the only sessionless route and it only sends mail; nothing in the repo lets an anonymous caller mutate a table | `04-CONTEXT.md` D-27 + D-28; controls enumerated in § Pattern Assignments for that file |
| A **loading skeleton** of any kind | component | — | Zero skeletons in `src/components/`; `EmptyState` is a content state, not a loading one | `04-CONTEXT.md` § Parcours ("a drawn loading state, not a void"); geometry from the panel it replaces |
| A **countdown / ticking display** | component (client) | — | No `setInterval` anywhere in `src/` | `contact-form.tsx` for the effect-not-render discipline; arithmetic from `maintienRestant()` |

---

## Metadata

**Analog search scope:** `supabase/migrations/`, `supabase/tests/`, `scripts/`, `src/lib/**`, `src/app/**`, `src/components/**`, `src/locales/fr/`, `package.json`
**Files scanned:** 34 read in full or in targeted ranges; directory listings and greps across ~120 source files
**Greps that produced negative findings (recorded because they define the gaps):** `supabase/client` (1 hit, a comment), `\.rpc\(` (0 hits), `export const revalidate|dynamic` (5 hits, all Lot 2 public pages)
**Pattern extraction date:** 2026-09-01
**Extended:** 2026-09-02, after the D-27/D-28/D-29 amendment to `04-CONTEXT.md` and the addition of
plan 04-09. Added classifications and assignments for `src/lib/agenda/creneaux.ts`,
`src/lib/validation/maintien.ts`, `src/lib/rate-limit.ts`, `src/app/api/creneaux/maintien/route.ts`,
`supabase/tests/lot4_maintien_creneau.sql`, `supabase/migrations/2026…_lot4_admin_reservation.sql`,
`src/components/agenda/booker-skeleton.tsx`,
`src/components/reservation/compte-a-rebours-maintien.tsx`, and the seven plan-04-09 files
(`src/lib/validation/types-rendez-vous.ts`, the admin type read, the `PATCH` route, the page, the
editor and the fourth nav entry). Four new rows in § No Analog Found record the genuinely
unprecedented shapes: a policy-less RLS table, an unauthenticated route that writes state, a loading
skeleton, and a ticking display.
