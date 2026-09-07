# Phase 3: Comptes, connexion et espace apprenant — Pattern Map

**Mapped:** 2026-08-31
**Files analyzed:** 31 new/modified files
**Analogs found:** 26 / 31
**Source:** `03-CONTEXT.md`, `03-UI-SPEC.md` (no RESEARCH.md — `--skip-research`)

> Read-only pass. Nothing under `src/`, `supabase/` or `scripts/` was modified.
> `src/components/ui/*`, `src/components/layout/*` and `src/app/globals.css` were **read as
> analogs only** — they stay write-forbidden for the whole phase (D-04).

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match |
|---|---|---|---|---|
| `src/middleware.ts` | middleware | request-response | `src/lib/supabase/server.ts` (cookie adapter only) | **none** — partial |
| `src/lib/supabase/middleware.ts` (session refresh helper) | utility | request-response | `src/lib/supabase/server.ts` | role-match |
| `supabase/migrations/2026…_comptes.sql` | migration | CRUD | `supabase/migrations/20260830090000_public_content.sql` | **exact** |
| `supabase/migrations/2026…_comptes_grants.sql` | migration | CRUD | `supabase/migrations/20260830093000_grant_service_role_content.sql` | **exact** |
| `supabase/config.toml` (modify) | config | — | itself (lines 158/162/181/184/225, `[auth.rate_limit]`) | self |
| `supabase/templates/*.html` | config | event-driven | `src/locales/fr/emails.json` + `src/lib/email/render.ts` (tone/keys only) | **none** |
| `src/types/database.types.ts` | model (generated) | — | itself — regenerate via `npm run db:types` | self |
| `src/lib/validation/auth.ts` | utility (validation) | transform | `src/lib/validation/contact.ts` | **exact** |
| `src/lib/validation/profil.ts` | utility (validation) | transform | `src/lib/validation/contact.ts` | **exact** |
| `src/lib/auth/session.ts` | service | request-response | `src/lib/content/queries.ts` + `src/lib/supabase/server.ts` | role-match |
| `src/lib/profil/queries.ts` | service | CRUD | `src/lib/content/queries.ts` | **exact** |
| `src/lib/documents/signed-url.ts` | service | file-I/O | `src/lib/content/queries.ts` (result shape) + `src/app/programme.pdf/route.ts` (delivery) | partial |
| `src/lib/rgpd/export.ts` | service | transform | `src/lib/content/queries.ts` | role-match |
| `src/lib/email/render.ts` (additive fns) | utility | transform | `src/lib/email/render.ts:31-61` | self |
| `src/app/api/auth/callback/route.ts` (OAuth + email confirm) | route handler | request-response | `src/app/api/contact/route.ts` | role-match |
| `src/app/api/auth/deconnexion/route.ts` | route handler | request-response | `src/app/api/contact/route.ts` | role-match |
| `src/app/api/documents/[id]/route.ts` | route handler | file-I/O | `src/app/programme.pdf/route.ts` | role-match |
| `src/app/api/rgpd/export/route.ts` | route handler | file-I/O | `src/app/programme.pdf/route.ts` | role-match |
| server actions / POST endpoints for the 5 forms | controller | request-response | `src/app/api/contact/route.ts` (+ island in `contact-form.tsx`) | role-match |
| `src/app/inscription/page.tsx` (replace) | page (static shell) | request-response | `src/app/contact/page.tsx` (shell + island split) | **exact** |
| `src/app/connexion/page.tsx` (replace) | page (static shell) | request-response | `src/app/contact/page.tsx` | **exact** |
| `src/app/mot-de-passe-oublie/page.tsx` | page (static shell) | request-response | `src/app/connexion/page.tsx:14-24` | **exact** |
| `src/app/nouveau-mot-de-passe/page.tsx` | page (static shell) | request-response | `src/app/connexion/page.tsx:14-24` | **exact** |
| `src/app/espace/layout.tsx` | layout | request-response | `src/app/layout.tsx` | role-match |
| `src/app/espace/page.tsx` (replace) | page (dynamic) | request-response | itself (composition preserved) + `content/queries.ts` for the read | self |
| `src/app/espace/profil/page.tsx` | page (dynamic) | CRUD | `src/app/inscription/page.tsx:23-141` | **exact** |
| `src/app/espace/donnees/page.tsx` | page (dynamic) | request-response | `src/app/espace/page.tsx` + `card.tsx` variants | role-match |
| `src/components/ui/checkbox.tsx` | component (primitive) | — | `src/components/ui/input.tsx` + `src/components/ui/accordion.tsx:1-45` | **exact** |
| `src/components/compte/auth-shell.tsx` | component | — | `src/app/connexion/page.tsx:16-22` | **exact** |
| `src/components/compte/submit-button.tsx` | component (client island) | — | `src/components/forms/contact-form.tsx:193-200` | **exact** |
| `src/components/compte/*-form.tsx` (5 islands) | component (client island) | request-response | `src/components/forms/contact-form.tsx` | **exact** |
| `src/components/espace/espace-nav.tsx` | component | — | `src/components/layout/header.tsx` (read-only) + `FOCUS_RING` in `src/lib/utils.ts:12` | role-match |
| `src/components/espace/documents-list.tsx` | component | CRUD (read) | `src/app/espace/page.tsx:63-78` (card + empty-state fallback) | **exact** |
| `src/locales/fr/mot-de-passe.json` | locale | — | `src/locales/fr/connexion.json` | **exact** |
| `src/locales/fr/profil.json` | locale | — | `src/locales/fr/inscription.json` | **exact** |
| `src/locales/fr/donnees.json` | locale | — | `src/locales/fr/espace.json` | **exact** |
| `src/locales/fr/espace.json` (additive keys) | locale | — | itself | self |

---

## Pattern Assignments

### `src/middleware.ts` (middleware, request-response) — **no analog, build from the contract**

The repo has no middleware. The only in-repo description of what is expected is the `catch` in
`src/lib/supabase/server.ts:34-44` — copy its cookie contract exactly (`getAll` / `setAll`, the
`{ name, value, options }` triple), but in middleware there **is** a response to write to, so the
`try/catch` swallow disappears and cookies are written onto both `request` and the
`NextResponse`.

**Cookie adapter to mirror** — `src/lib/supabase/server.ts:30-45`:
```ts
cookies: {
  getAll() { return cookieStore.getAll(); },
  setAll(cookiesToSet) {
    try {
      for (const { name, value, options } of cookiesToSet) {
        cookieStore.set(name, value, options);
      }
    } catch {
      // Called from a Server Component with no request/response cycle
      // to write to — safe to ignore when middleware refreshes the
      // session instead. No middleware exists yet (Lot 3).
    }
  },
},
```

**Generic/schema pinning to copy verbatim** (`server.ts:21-29`) — every client in this repo is
`<Database, "app">` with `db: { schema: "app" }`; the middleware client must be the same:
```ts
return createServerClient<Database, "app">(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { db: { schema: "app" }, cookies: { /* … */ } },
);
```

**Matcher constraint (D-15/D-16, hard constraint 7).** The 14 public routes must stay static.
Today the static routes are the file-system routes under `src/app/` minus `/espace*`:
`/`, `/a-propos`, `/agenda`, `/connexion`, `/contact`, `/formation`, `/inscription`, `/paiement`,
`/programme`, `/programme.pdf`, `/reservation`. Four of them already pin ISR with
`export const revalidate = 3600` (`src/app/page.tsx:14`, `a-propos/page.tsx:17`,
`formation/page.tsx:17`, `programme/page.tsx:21`, `programme.pdf/route.ts:9`) — nothing in Lot 3
may add a cookie read to those files. Prefer a **positive** matcher (`/espace/:path*` plus the
auth callback/signout endpoints) over a negative one: it is the only shape that cannot
accidentally opt a public route into dynamic rendering.

**`server-only` (D-17):** `src/middleware.ts` runs on the Edge/Node middleware runtime and must
**not** import `src/lib/supabase/server.ts` (it is `server-only` and reads `cookies()` from
`next/headers`). Build the client inline from `@supabase/ssr` + `serverEnv`, anon key only.

---

### `supabase/migrations/2026…_comptes.sql` (migration, CRUD)

**Analog:** `supabase/migrations/20260830090000_public_content.sql` — the additive + reversion-
comment precedent named in D-21.

**Header + reversion line** (lines 1-8) — every Lot 3 migration copies this shape:
```sql
-- The public site reads content from the database, not from the JSON bundle
-- (D-24): … This migration sets the table/RLS precedent
-- for Lots 3-10. Strictly additive: it creates objects only, no `alter` and
-- no `drop` against anything Phase 0 made.
-- Reversible with:
--   drop table app.content_item, app.content_section, app.contact_message cascade;
```

**Table shape** (lines 10-23) — uuid PK + `gen_random_uuid()`, `timestamptz not null default
now()`, French column names, a `comment on table` explaining *why*:
```sql
create table app.content_section (
  id uuid primary key default gen_random_uuid(),
  cle text not null unique,
  …
  publie boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table app.content_section is 'Public landing/page sections …, keyed on a stable `cle` the seed upserts on (D-27).';
```

**`updated_at` trigger** (lines 56-75) — `app.touch_updated_at()` **already exists**; the Lot 3
profile table attaches to it, it does **not** re-create it (that would be a non-additive
redefinition):
```sql
create trigger content_section_touch_updated_at
  before update on app.content_section
  for each row
  execute function app.touch_updated_at();
```

**RLS + grant pair** (lines 77-105) — note the last three lines: this repo learned the hard way
that **RLS alone does not confer privileges**. Every Lot 3 policy must be followed by its grant.
```sql
alter table app.content_section enable row level security;

create policy content_section_anon_select
  on app.content_section
  for select
  to anon
  using (publie = true);

-- RLS alone does not confer table privileges — grant the matching operations.
grant usage on schema app to anon;
grant select on app.content_section to anon;
```
For Lot 3 the role is `authenticated`, not `anon`, and the `using` clause is keyed on
`auth.uid()` (D-09):
```sql
-- shape to author (not copied from an existing file — no auth.uid() policy exists yet)
create policy <table>_self_select on app.<table>
  for select to authenticated using (utilisateur_id = (select auth.uid()));
```

**Second migration — grants only** (`20260830093000_grant_service_role_content.sql`, whole file,
13 lines): the precedent for a follow-up migration that adds *nothing but* privileges, with its
own `-- Reversible with:` `revoke` line. Copy it for `service_role` access to the Lot 3 tables:
```sql
-- Reversible with:
--   revoke all on app.content_section, … from service_role;
--   revoke usage on schema app from service_role;
grant usage on schema app to service_role;
grant all on app.content_section, app.content_item, app.contact_message to service_role;
```

**After applying:** `npm run db:types` regenerates `src/types/database.types.ts`
(`scripts/gen-db-types.mjs` wraps `supabase gen types … --schema public,app` and refuses to write
a truncated file). Never hand-edit that file — its banner says so.

---

### `supabase/config.toml` (config) — the four edits, with current values

| Line | Today | Lot 3 | Driver |
|---|---|---|---|
| 158 | `site_url = "http://127.0.0.1:3000"` | unchanged | — |
| 162 | `additional_redirect_urls = ["https://127.0.0.1:3000"]` | **carry, do not fix** | D-14 |
| 181 | `minimum_password_length = 6` | `8` | D-12 |
| 184 | `password_requirements = ""` | `"letters_digits"` | D-12 |
| 225 | `enable_confirmations = false` | `true` | D-13 |
| `[auth.rate_limit]` (≈l.196-210) | `sign_in_sign_ups = 30`, `token_verifications = 30`, `email_sent = 2` | tightened | D-08 (CPT-03) |

**Email templates** — the file already carries the commented pattern at lines 245-254; uncomment
and point at real files:
```toml
# Uncomment to customize email template
# [auth.email.template.invite]
# subject = "You have been invited"
# content_path = "./supabase/templates/invite.html"
```
`supabase/templates/` **does not exist** — Lot 3 creates it. The French copy source is
`src/locales/fr/emails.json` (`confirmationInscription`, `reinitialisationMotDePasse`, already
written). Note the placeholder syntax differs: Supabase templates use Go `{{ .ConfirmationURL }}`,
while `src/lib/email/render.ts:14-19` uses single-brace `{key}` substitution. **Do not import the
locale JSON into the template** — the templates are static HTML read by the Supabase container;
transcribe the strings, and note in the plan that they are then duplicated.

**Google provider** (`[auth.external.apple]` at l.321 is the shape to copy for `[auth.external.google]`):
```toml
[auth.external.apple]
enabled = false
client_id = ""
# DO NOT commit your OAuth provider secret to git. Use environment variable substitution instead:
secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
redirect_uri = ""
skip_nonce_check = false   # "Required for local sign in with Google auth"
```
Secrets via `env(...)` only — never a literal (D-06: credentials come from the CIO).

---

### `src/lib/validation/auth.ts` / `profil.ts` (utility, transform)

**Analog:** `src/lib/validation/contact.ts` — the whole file (73 lines) is the boundary-validation
idiom. Three parts to copy:

**1. Schema, no messages** (lines 12-22) — Zod carries no French text; the error *key* is mapped
afterwards, because Zod's defaults are English and `CLAUDE.md` forbids hardcoded strings:
```ts
export const contactSchema = z.object({
  nom: z.string().trim().min(1),
  email: z.email(),
  profil: z.enum(["acheteur", "consultant", "etudiant", "entreprise"]),
  rendu: z.coerce.number(),
});
export type ContactInput = z.infer<typeof contactSchema>;
```
The `profil` enum is **reused verbatim** by `/espace/profil` (UI-SPEC: same four options).

**2. Locale-key union + issue mapper** (lines 24-53) — the union's members are the leaf keys of
`<bundle>.erreurs`:
```ts
/** Matches the leaf keys of `contact.erreurs` in src/locales/fr/contact.json. */
export type ContactErreurKey = "nomRequis" | "emailRequis" | "emailInvalide" | …;

export function mapContactIssueToErreurKey(path: PropertyKey, code: string): ContactErreurKey | undefined {
  switch (path) {
    case "email": return code === "invalid_format" ? "emailInvalide" : "emailRequis";
    default: return undefined;
  }
}
```

**3. Reducer to a field-keyed map** (lines 60-73) — this `{ errors }` object is exactly what the
route returns with `422` and the island maps back onto the locale bundle:
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
For Lot 3 the target bundles are `connexion.erreurs.*`, `inscription.erreurs.*`,
`motDePasse.erreurs.*`, `profil.erreurs.*`. **No `any`** anywhere — note the file uses
`PropertyKey` and a `readonly` structural param instead of `ZodIssue[]`.

---

### `src/lib/auth/session.ts`, `src/lib/profil/queries.ts`, `src/lib/rgpd/export.ts` (service)

**Analog:** `src/lib/content/queries.ts` — the server data-access idiom.

**Module header** (lines 1-22) — `server-only` first, then the discriminated result type that
avoids throwing across a Server Component boundary:
```ts
import "server-only";

export type QueryResult<T> = { ok: true; data: T } | { ok: false };

export type ContentSection = Database["app"]["Tables"]["content_section"]["Row"];
```
Row types are always derived from `Database["app"]["Tables"][…]["Row"]`, never hand-declared.

**Query body** (lines 24-37) — `maybeSingle()`, collapse `error || !data` into `{ ok: false }`:
```ts
export async function getSection(cle: string): Promise<QueryResult<ContentSection>> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("content_section").select("*").eq("cle", cle).eq("publie", true).maybeSingle();
  if (error || !data) return { ok: false };
  return { ok: true, data };
}
```

**Which client (critical, D-16/D-17).** `queries.ts` uses `createPublicClient()` **because** it
must stay cookie-free. Lot 3's session-scoped reads are the opposite case and must use
`createClient()` from `src/lib/supabase/server.ts`. The comment at `public.ts:8-17` is the rule:

```ts
/**
 * Cookieless anon read client for public content.
 * … Do not reuse the session-aware client here; Lot 3's authenticated path
 * still needs it untouched.
 */
```
→ **Do not contaminate `public.ts`.** Add no cookie, no auth option, no new export to it.

**jsonb / untrusted boundary** (lines 56-62) — the GDPR export and any `jsonb` preference column
get the same treatment:
```ts
/* why: `donnees` is jsonb — validated at the boundary (CLAUDE.md) rather than
   trusted as an unchecked value. Missing arrays default to empty … */
const moduleDonneesSchema = z.object({
  objectifs: z.array(z.string()).default([]),
});
```

---

### `src/app/api/**/route.ts` (route handler, request-response)

**Analog:** `src/app/api/contact/route.ts` (87 lines) — the only handler with a body, validation,
a DB write and side effects.

**Scope comment + POST-only export** (lines 12-17) — copy this discipline for the deletion-request
and export endpoints (personal data, no list route):
```ts
/*
 * why: contact messages are personal data (D-37) — this file exports POST
 * only. No GET (no public list route), no DELETE, no export endpoint;
 * deletion and export are Lot 5's RGPD work.
 */
export async function POST(request: Request) {
```

**Parse → 422 with locale keys** (lines 18-24):
```ts
const body = await request.json().catch(() => null);
const parsed = contactSchema.safeParse(body);
if (!parsed.success) {
  const errors = contactIssuesToFieldErrors(parsed.error.issues);
  return NextResponse.json({ errors }, { status: 422 });
}
```

**Rate limiting** (lines 39-43) — `src/lib/rate-limit.ts` `consume(key)` is dependency-free,
in-process, `server-only`. CPT-03 uses **Supabase native limits** (D-08), but this is the analog
if a per-IP guard is wanted on the reset-request endpoint:
```ts
const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
const { allowed } = consume(ip);
if (!allowed) return NextResponse.json({ ok: true }, { status: 200 });
```
Note the shape: a throttled request returns the **same success body** as a real one — reuse this
for the password-reset endpoint, which per D-A10 must not leak account existence.

**Side-effect failure does not roll back the row** (lines 78-84) — apply verbatim to the
deletion-request flow (record the row, then notify; a failed notification must not lose the
request):
```ts
} catch {
  /* why: the row is already stored — do not roll it back. A stored
     message with a failed notification is recoverable by hand; a lost
     message is not (T-02-11, accepted). … */
  return NextResponse.json({ errors: {} }, { status: 502 });
}
```

**Binary / file delivery** — `src/app/programme.pdf/route.ts` (33 lines):
```ts
export const revalidate = 3600;   // ← MUST NOT be copied onto a session-scoped route

export async function GET(): Promise<Response> {
  const result = await buildProgrammePdf();
  if (!result.ok) {
    return new Response("Le programme n'est pas disponible pour le moment.", {
      status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="programme-formation-sap-ariba.pdf"',
    },
  });
}
```
For the CPT-07 download route: same `Response` + `Content-Disposition` shape, but **no
`revalidate`** (a cached signed URL is a shareable link — the exact thing CPT-07 forbids), and the
entitlement check runs server-side against the grant table before `createSignedUrl` is called.
The GDPR export route reuses the same shape with
`Content-Type: application/json; charset=utf-8` and `attachment; filename=…`.

**Note:** the 503 body above is a **hardcoded French string in a route handler** — a pre-existing
deviation from `CLAUDE.md`. Lot 3 routes must pull their messages from `src/locales/fr/*.json`
instead (the island already does; see `contact/route.ts:3` importing `contact.json`).

---

### Auth page shells — `/inscription`, `/connexion`, `/mot-de-passe-oublie`, `/nouveau-mot-de-passe`

**Analog for the split:** `src/app/contact/page.tsx` — a server component with **no** `"use client"`
and **no** `revalidate`, rendering an island as its last child. This is the only place in the repo
where D-A3's "static shell + client island" already exists:
```tsx
import { ContactForm } from "@/components/forms/contact-form";

export default function Contact() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-12 sm:py-16 lg:py-20">
      <SectionHeader … />
      <Card variant="raised" className="reveal-rise">…</Card>
      <ContactForm />
    </div>
  );
}
```

**Analog for the auth-shell chrome:** `src/app/connexion/page.tsx:16-22` — this exact block is
repeated on five surfaces and is what `src/components/compte/auth-shell.tsx` extracts:
```tsx
<div className="mx-auto flex max-w-md flex-col gap-12 px-4 py-16">
  <div className="flex flex-col gap-2 text-center">
    <h1 className="font-heading text-3xl font-semibold text-foreground">{connexion.titre}</h1>
    <p className="text-muted-foreground">{connexion.intro}</p>
  </div>
  {/* Card … CardContent … CardFooter with the accent Link */}
</div>
```
(`max-w-2xl` on `/inscription` — `inscription/page.tsx:25`.)

**Footer link idiom** (`connexion/page.tsx:75-82`) — the accent inline link, reused for
*Mot de passe oublié ?* which becomes a `Link` keeping the same class string:
```tsx
<CardFooter>
  <Link href="/inscription" className="text-sm text-primary hover:underline">
    {connexion.pasDeCompte}
  </Link>
</CardFooter>
```

**What to delete when replacing:** both files end with a `<section id="…-etats">` demo block
(`inscription/page.tsx:152-237`, `connexion/page.tsx:85-141`). Those exist only to prove the field
states to the founder in Lot 1; Lot 3 renders those states for real and removes the demos. The
Google `Button` at `connexion/page.tsx:69-72` is currently inert (`type="button"`, no handler) —
Lot 3 wires it, keeping `variant="outline"` and the `LogIn` icon.

**Select field** (`inscription/page.tsx:117-129`) — the `FieldControl render={<select>}`
polymorphism, reused verbatim by `/espace/profil`:
```tsx
<FieldControl
  id="inscription-profil"
  name="profil"
  render={
    <select>
      {PROFIL_OPTIONS.map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  }
/>
```
with `const PROFIL_OPTIONS = Object.entries(inscription.champs.profil.options);` at module scope
(`inscription/page.tsx:21`).

**Success block** (`inscription/page.tsx:231-236`) — the shape UI-SPEC names for the post-submit
confirmation:
```tsx
<Card>
  <CardHeader>
    <CardTitle>{inscription.succes.titre}</CardTitle>
    <CardDescription>{inscription.succes.message}</CardDescription>
  </CardHeader>
</Card>
```

---

### `src/components/compte/*-form.tsx` (client islands, request-response)

**Analog:** `src/components/forms/contact-form.tsx` (203 lines) — the single form-island precedent.

**Header + state model** (lines 1-35):
```tsx
"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import contact from "@/locales/fr/contact.json";
import { Message } from "@/components/ui/message";
import { Field, FieldLabel, FieldControl, FieldDescription, FieldError } from "@/components/ui/field";

type Status = "idle" | "submitting" | "success" | "error";
type FieldErrors = Partial<Record<"nom" | "email" | "profil" | "message", keyof typeof contact.erreurs>>;
```
Note `keyof typeof contact.erreurs` — the error key type is derived from the imported JSON, so a
renamed locale key is a type error. Reuse this for every Lot 3 island.

**Submit + 422 branch** (lines 48-89):
```tsx
const response = await fetch("/api/contact", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
});
if (response.status === 422) {
  const body = (await response.json()) as { errors?: FieldErrors };
  setFieldErrors(body.errors ?? {});
  setStatus("error");
  return;
}
if (!response.ok) { setStatus("error"); return; }
setStatus("success");
```
The `as { errors?: FieldErrors }` cast is the existing idiom — Lot 3 may tighten it with a Zod
parse, but must not widen it to `any`.

**Field with all four state hooks** (lines 105-116) — the exact per-field markup to reproduce:
```tsx
<Field>
  <FieldLabel htmlFor="contact-nom">{contact.champs.nom}</FieldLabel>
  <FieldControl
    id="contact-nom" name="nom" autoComplete="name"
    data-loading={isSubmitting ? "true" : undefined}
    aria-invalid={fieldErrors.nom ? "true" : undefined}
  />
  <FieldDescription>{contact.aideParChamp.nom}</FieldDescription>
  {fieldErrors.nom ? <FieldError>{contact.erreurs[fieldErrors.nom]}</FieldError> : null}
</Field>
```

**Server-rejection state** (lines 187-191) — note `rejected="server"` is the **prop**, not the raw
attribute (`field.tsx:17,21` converts it):
```tsx
{isTransportError ? (
  <Field rejected="server">
    <FieldError>{contact.erreurs.rejetServeur}</FieldError>
  </Field>
) : null}
```
⚠️ `inscription/page.tsx:217` and `connexion/page.tsx:116,128` write `data-rejected="server"`
directly. **`rejected="server"` is the correct API** — `Field` spreads `{...props}` after, so the
raw attribute happens to work, but the prop is the contract.

**Submit button** (lines 193-200) — the pattern `submit-button.tsx` wraps in `useFormStatus`,
plus the `h-11` call-site override (D-A5, idiom from `header.tsx:100`):
```tsx
<Button
  type="submit"
  className="self-start"
  data-loading={isSubmitting ? "true" : undefined}
  disabled={isSubmitting}
>
  {common.actions.envoyer}
</Button>
```

**Form element** (lines 100-104) — `gap-5` rhythm and the `aria-label` from the locale bundle:
```tsx
<form onSubmit={handleSubmit} className="reveal-rise flex flex-col gap-5" aria-label={contact.titre}>
```

**Hydration-safe DOM writes** (lines 38-46) — reuse the `useEffect` + `ref` pattern for anything
time- or `window`-dependent (e.g. reading the recovery token from the URL fragment on
`/nouveau-mot-de-passe`):
```tsx
/* why: set on mount, not during render — "use client" components still
   render once on the server … avoids a hydration mismatch */
useEffect(() => { if (renduInputRef.current) renduInputRef.current.value = String(Date.now()); }, []);
```

---

### `src/components/ui/checkbox.tsx` (new primitive)

**Analogs:** `src/components/ui/input.tsx` (42 lines, closest in size and role) and
`src/components/ui/accordion.tsx:1-8` (the `"use client"` + Base UI import idiom).
`node_modules/@base-ui/react/checkbox` is present — no install needed.

**Whole-file skeleton to mirror** (`input.tsx:1-42`):
```tsx
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "border-input bg-background flex h-8 w-full … in-data-[density=compact]:h-7 … focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20" +
    /* why: no boolean `loading` prop — a `data-loading` attribute matches
       button.tsx's existing data-* idiom rather than a boolean prop that
       could leak into the DOM */
    " data-[loading=true]:pointer-events-none data-[loading=true]:opacity-70 …",
  { variants: { size: { default: "", sm: "h-7 …" } }, defaultVariants: { size: "default" } }
)

function Input({ className, size = "default", ...props }:
  Omit<InputPrimitive.Props, "size"> & VariantProps<typeof inputVariants>) {
  return <InputPrimitive data-slot="input" className={cn(inputVariants({ size, className }))} {...props} />
}

export { Input, inputVariants }
```

Non-negotiable house rules visible in all eight files:
- `"use client"` **only if** the primitive holds state (`accordion.tsx:1`, `empty-state.tsx:1`);
  `input`, `field`, `button`, `badge`, `card`, `message` are server-safe. Base UI's
  `Checkbox.Root` is stateful → `"use client"` at the top, with a one-line `why` comment as in
  `accordion.tsx:2-3`.
- No semicolons, double quotes, 2-space indent (the `ui/` folder differs from `src/app` here —
  match the folder, not the app).
- `cva(...)` base string + `variants` + `defaultVariants`, exported alongside the component:
  `export { Checkbox, checkboxVariants }`.
- `data-slot="checkbox"` on the root, `data-slot="checkbox-indicator"` on the indicator —
  `field.tsx:28` selects on `[data-slot=field-control]`, so slots are load-bearing.
- `in-data-[density=compact]:` variants on every sizing class (the back-office density contract).
- The shared state suffixes: `focus-visible:ring-3 focus-visible:ring-ring/50`,
  `disabled:pointer-events-none disabled:opacity-50`,
  `aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20`,
  `data-[loading=true]:pointer-events-none data-[loading=true]:opacity-70`.
- Prop type is `<Primitive>.Props & VariantProps<typeof checkboxVariants>`; `Omit` any native
  attribute that collides with a variant name (`input.tsx:29-32` explains why for `size`).
- Class merging always through `cn(...)` (`src/lib/utils.ts:4`).
- `h-8 w-full` from `inputVariants` is wrong for a checkbox (UI-SPEC) — author a `size-4`/`size-5`
  square; `badge.tsx:6` is the analog for a small, non-full-width control.

---

### `src/components/espace/espace-nav.tsx` + `src/app/espace/layout.tsx`

**Analog:** `src/components/layout/header.tsx` (read-only). The two reusable excerpts:

`src/lib/utils.ts:12-13` — the shared focus ring for interactive non-`Button` elements:
```ts
export const FOCUS_RING =
  "outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring rounded-md"
```

`src/components/layout/header.tsx:96-100` — `Button` rendering a `Link`, with the `h-11` override
(D-A5) and the `nativeButton={false}` flag Base UI requires:
```tsx
<Button
  render={<Link href="/inscription" />}
  nativeButton={false}
  className="h-11 gap-[0.7rem] rounded-full pr-1.5 pl-5 text-sm font-bold"
>
```
Same pattern at `espace/page.tsx:43`:
```tsx
<Button render={<Link href="/agenda" />} nativeButton={false}>
```

The *Se déconnecter* control is a `POST` form (UI-SPEC) → a plain `<form action="/api/auth/deconnexion" method="post">`
wrapping `<Button type="submit" variant="ghost">`. No analog exists for a POST form in this repo;
this is new.

`src/app/layout.tsx` is the only layout analog for the file shape (nav band + `{children}`).

---

### `src/components/espace/documents-list.tsx` + `src/app/espace/page.tsx`

**Analog:** `src/app/espace/page.tsx:59-79` — the grid and the card-with-empty-state fallback,
which must survive the rewrite byte-for-byte on the five non-documents cards:
```tsx
<div data-density="default" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {SURFACES.map(({ key, tone }) => {
    const surface = espace[key];
    return (
      <Card key={key}>
        <CardHeader><CardTitle>{surface.titre}</CardTitle></CardHeader>
        <EmptyState tone={tone} size="sm">
          <EmptyStateTitle>{surface.vide.titre}</EmptyStateTitle>
          <EmptyStateDescription>{surface.vide.message}</EmptyStateDescription>
        </EmptyState>
      </Card>
    );
  })}
</div>
```

**The one line Lot 3 replaces** (`espace/page.tsx:12-16, 53`):
```tsx
/* why: this route ships with no session in Lot 1 (D-11) — the placeholder
   stands in for the learner's first name so the interpolation is proven
   before Lot 3 replaces the source with the session's real value, not the
   copy itself. */
const PRENOM_MAQUETTE = "…";
…
{espace.bienvenue.replace("{prenom}", PRENOM_MAQUETTE)}
```
→ the `.replace("{prenom}", …)` call stays; only the source changes. The repo-wide substitution
idiom is the same single-brace `{key}` used by `src/lib/email/render.ts:14-19` and `footer.tsx:109`.

`Card variant="muted"` / `variant="default"` for `/espace/donnees` are already defined at
`card.tsx:19-31` — no new variant is needed.

---

### `src/locales/fr/{mot-de-passe,profil,donnees}.json`

**Analog:** `src/locales/fr/connexion.json` (whole file, 17 lines) — flat top-level `titre` /
`intro`, then nested `champs`, `erreurs`, and single-string leaves:
```json
{
  "titre": "Retrouvez votre espace apprenant. Votre parcours vous attend là où vous l'avez laissé.",
  "intro": "Connectez-vous avec votre email et votre mot de passe, ou en un clic avec Google.",
  "champs": { "email": "Adresse email", "motDePasse": "Mot de passe" },
  "erreurs": {
    "identifiantsInvalides": "Adresse email ou mot de passe incorrect.",
    "rejetServeur": "La connexion n'a pas pu être établie. Réessayez dans quelques instants."
  },
  "pasDeCompte": "Pas encore de compte ? Inscrivez-vous."
}
```
And `espace.json` for the `titre`/`vide.{titre,message}` nesting and the `{prenom}` placeholder
convention. Full sentences, *vouvoiement*, terminal punctuation on every string — the exact copy
is already written in `03-UI-SPEC.md` § *New copy this phase authors*.

**`npm run content:check` (D-20).** `scripts/check-mock-content.mjs` scans `_mocks.*.json`
registries in `src/locales/fr/` and resolves each listed key against its bundle. It is
**deliberately not wired into lint/build**, and it currently exits `1` on one unresolved key. Lot 3
must not add entries to any `_mocks.*.json` and must not change that exit code — "green" here
means "unchanged".

---

## Shared Patterns

### 1. Server-only guard (D-17)
**Source:** `src/lib/supabase/server.ts:1`, `public.ts:1`, `email/resend.ts:1`, `email/render.ts:1`,
`rate-limit.ts:1`, `content/queries.ts:1`
**Apply to:** every new file under `src/lib/` that touches the session, the service role or a secret.
```ts
import "server-only";
```
Not on `src/middleware.ts` (different runtime) and not on client islands.

### 2. Environment access — never `process.env` at a call site
**Source:** `src/lib/env/server.ts:16-43`, `client.ts:17-38`
**Apply to:** every new server module and island.
```ts
const serverEnvSchema = z.object({ NEXT_PUBLIC_SUPABASE_URL: z.url(), SUPABASE_SERVICE_ROLE_KEY: z.string().min(1) });
const parsed = serverEnvSchema.safeParse({ ...process.env, NEXT_PUBLIC_SITE_URL: resolveSiteUrl(process.env) });
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  throw new Error(`Invalid environment variables — ${issues}`);
}
export const serverEnv: Readonly<ServerEnv> = Object.freeze(parsed.data);
```
If Lot 3 needs a new variable (e.g. a bucket name), add it to **both** the schema and `.env.example`.
The optional-at-boot / strict-at-use exception is `resend.ts:17,34-37` — copy that if a Lot 3
credential is CIO-pending:
```ts
const parsedKey = resendKeySchema.safeParse(serverEnv.RESEND_API_KEY);
if (!parsedKey.success) throw new EmailTransportError("RESEND_API_KEY is not configured");
```
Redirect URLs must be built from `serverEnv.NEXT_PUBLIC_SITE_URL` (`src/lib/env/site-url.ts`
resolves Vercel prod/preview/local), never hardcoded — this is what makes the OAuth and
email-confirmation callbacks work on preview deployments.

### 3. Transactional email
**Source:** `src/lib/email/resend.ts:33-56`, `src/lib/email/render.ts:31-45`
**Apply to:** the trainer notification for a deletion request (CPT-09).
```ts
export async function sendEmail({ to, subject, text }: SendEmailInput): Promise<void> { /* one fetch POST, no SDK */ }
export class EmailTransportError extends Error { … }
```
Render first (`renderEntry(emails.<clé>, values)`), send second, and never let a send failure lose
the row (see the `catch` in `api/contact/route.ts:78-84`). **D-23: no real email may leave** —
`RESEND_API_KEY` is unprovisioned, so `sendEmail` throws by design; the caller must survive that.
Supabase Auth's own emails (confirmation, reset) go through the local collector, not this path.

### 4. Explanatory comments
**Source:** every file above.
The house style is a `why:` comment on any non-obvious decision, often citing the decision id
(`D-38`, `T-02-11`). `CLAUDE.md`: comments explain *why*, not *what*. Lot 3 comments should cite
`03-CONTEXT.md` ids (D-15, D-16, D-21, …) the same way.

### 5. Typing discipline
- No `any` anywhere in the repo today — verified. Boundaries use `unknown`+Zod, `PropertyKey`,
  or a narrow structural type (`validation/contact.ts:61`).
- Supabase generics are always `<Database, "app">`.
- Row/Insert types are always derived: `Database["app"]["Tables"]["x"]["Row"]`.
- Exported const objects are `Object.freeze`d and typed `Readonly<T>` (`env/server.ts:43`).

### 6. Formatting / date rules
**Source:** `src/lib/i18n/fr.ts`
`suppression.dejaDemandee.message` interpolates a `{date}` → must go through `formatDate()`
(`fr-FR`, `Europe/Paris`, pinned). Never `toLocaleDateString()` at a call site.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `src/middleware.ts` | middleware | request-response | No middleware exists in the repo. Only the cookie adapter and the `server.ts:42` comment describe the intent. Build from `@supabase/ssr` docs + the cookie contract above. |
| `supabase/templates/*.html` | config | event-driven | `supabase/templates/` does not exist; `config.toml:245-254` only shows the commented `content_path` shape. Go-template placeholders (`{{ .ConfirmationURL }}`) have no precedent here. |
| Server actions (`"use server"`) | controller | request-response | Zero server actions in the repo. Every mutation today is a `fetch` → route handler (`contact-form.tsx` → `api/contact/route.ts`). **Recommendation: stay on route handlers** — it is the proven path, and `useFormStatus`/`useActionState` would be introduced with no in-repo precedent. If the planner chooses actions, the island shape from `contact-form.tsx` still applies. |
| Signed-URL generation (`storage.createSignedUrl`) | service | file-I/O | No Supabase Storage call exists anywhere. `programme.pdf/route.ts` is the closest *delivery* analog only. |
| `auth.uid()` RLS policy | migration | — | Every existing policy targets `anon` with a static predicate; no `authenticated` role and no `auth.uid()` policy exists yet. `20260830090000:83-99` gives the policy *syntax*, not the predicate. |
| POST form without JS (`<form method="post">`) | component | request-response | Every form in the repo is JS-driven. The déconnexion form and the deletion confirmation are new shapes. |

---

## Metadata

**Analog search scope:** `src/app/`, `src/components/`, `src/lib/`, `src/locales/fr/`,
`src/types/`, `supabase/`, `scripts/`, `package.json`
**Files scanned:** 34 read, ~60 listed
**Pattern extraction date:** 2026-08-31
**Constraint check:** no excerpt above proposes modifying `src/app/globals.css`,
`src/components/ui/{accordion,badge,button,card,empty-state,field,input,message}.tsx` or
`src/components/layout/*`; no new dependency is implied; every user-visible string routes through
`src/locales/fr/*.json`.
