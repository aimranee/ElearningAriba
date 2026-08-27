# Phase 0: Socle technique et environnement — Context

**Gathered:** 2026-08-27
**Status:** Ready for planning
**Source:** Approved decision brief (external, not stored in this repository)

<domain>
## Phase Boundary

Phase 0 stands up the technical foundation named in the signed offer's Section 1
"Socle technique" — a running Next.js application, a versioned database schema, a
deployment pipeline, per-environment secrets, and an automated quality gate.

It delivers **SOCLE-01 … SOCLE-05 and nothing else**.

**Out of scope — belongs to a later lot:**

- **Lot 1** — cadrage, French copy, visuals, the design system (`CADR-05`) and the
  client-validated mockups (`CADR-06`). Phase 0 installs the styling **toolchain**;
  it does **not** choose a palette, a typeface, a spacing scale or a component set.
  Any colour or font that lands in the repository in this phase is an untouched
  library default, explicitly marked as placeholder, never a design decision.
- **Lot 2** — any page, section or copy. `PUB-13` requires public content to come
  from the database; Phase 0 creates no content and no content table.
- **Lot 3** — accounts, roles, RLS policies, the espace apprenant.
- **Lots 4, 6, 7, 10** — availabilities, sessions, orders, payment, back-office.

**No domain table.** The migration mechanism must be proven end to end, but no
table for bookings, orders, sessions, modules, profiles or invoices may be created.

**No provider commitment.** No payment provider and no email provider is chosen,
configured or wired in this phase.

</domain>

<decisions>
## Implementation Decisions

### Runtime and package manager

- **D-01**: **npm** is the package manager. Node v22.21.1 and npm 10.9.4 are the
  measured local toolchain. pnpm is not installed and is not used. Reversible.
- **D-02**: The Supabase CLI and the Vercel CLI are **not installed globally** —
  invoke them through `npx`. Neither binary exists on the machine.

### Application

- **D-03**: **Next.js (React, TypeScript), App Router, server-rendered**, scaffolded
  with `create-next-app`. This is contractual (offer Section 1) and not an open
  choice. Source lives under `src/`; the `@/*` import alias is configured.
- **D-04**: **French and `Europe/Paris` are the defaults on the root layout.**
  `<html lang="fr">`; date, time and number formatting resolve to `fr-FR` and
  `Europe/Paris`. **No `en-US` default may remain anywhere** — an English date on
  the agenda (Lot 4) or a wrong decimal separator on a price (Lot 7) is a defect
  seeded here. Note: `create-next-app` scaffolds `<html lang="en">`; it must be
  changed.
- **D-05**: **Tailwind v4 + shadcn/ui** is the styling toolchain — CTO's call, the
  offer names no UI toolkit. Tailwind v4 installs as `tailwindcss`,
  `@tailwindcss/postcss` and `postcss`, with `@import "tailwindcss";` in the global
  stylesheet (there is no `tailwind.config.js` content array in v4). shadcn/ui is
  initialised with `npx shadcn@latest init`. **The generated CSS variables are the
  library's untouched defaults and are labelled as placeholders to be replaced by
  the Lot 1 design system.** Do not select a preset, a base colour, a font or a
  component beyond what is needed to prove the toolchain compiles.
- **D-06**: **No runtime CSS-in-JS and no unbounded client bundle in the root
  layout.** `Lighthouse ≥ 90 sur mobile` is contractual at Lot 5; Phase 0 does not
  have to reach it but must not make it unreachable.

### Database

- **D-07**: **The Supabase local stack runs via Docker** (`npx supabase init`,
  `npx supabase start`) so migrations are written and tested offline before
  anything hosted is touched. **Docker Desktop is installed but its daemon is not
  running** — starting it is a human step and must appear in the setup
  documentation and in any task that depends on it, never assumed.
- **D-08**: **The migration mechanism is proven, not the schema.** A migration is
  created with `npx supabase migration new`, applied locally with
  `npx supabase db reset`, and the effect is observed. It must create **no domain
  table** — prove the mechanism with a schema-level object that carries no product
  meaning and that a later lot can drop without consequence.
- **D-09**: `npx supabase db push` targets a **hosted** project and is therefore
  **out of this phase's reach**. Local application only.

### Environments and secrets

- **D-10**: Environment variables are separated per environment (local / preview /
  production) and **no secret is committed**. The repository carries a committed
  `.env.example` naming every variable with no value; real values live in
  `.env.local`, which `.gitignore` excludes.
- **D-11**: **A missing environment variable fails loudly at startup, naming the
  variable** — never silently at runtime inside a later lot. Validate the
  environment at boot with a schema (Zod) at the process boundary.
- **D-12**: **The empty state of this phase is a fresh clone.** `README` must take
  someone from `git clone` to a running application with no undocumented step,
  including starting Docker Desktop and the local Supabase stack.

### Delivery pipeline

- **D-13**: **Feature branch → preview deployment → pull request behind the CI gate
  → merge to `main`.** `SOCLE-03` promises a preview per branch and `SOCLE-05`
  promises a blocked broken merge; neither is meetable on a single-branch
  repository. `main` is the only branch today.
- **D-14**: **The CI gate is a GitHub Actions workflow running lint, type-check and
  build** on pull requests targeting `main`, committed in this phase. It must be
  runnable and green locally through the same npm scripts.
- **D-15**: **Never push to a remote in this phase.** Pushing this repository is
  owned by another party and is user-gated; a push to `main` is a production
  deploy. Commit locally and stop. The branch-protection rule that makes the CI
  gate blocking is applied on the hosting side, not by this phase.

### Client-owned repository

- **D-16**: **The client owns this repository.** Nothing internal goes in it: no day
  rate, no margin, no internal calendar or dated schedule, no reference to offers
  or lots outside the signed lots 1–10. `reference/` is read-only input and is not
  modified.

### Claude's Discretion

- The exact shape of the placeholder migration object, provided it creates no
  domain table and is trivially reversible.
- File and directory layout inside `src/`, npm script names, and the internal
  structure of the environment-validation module.
- The GitHub Actions runner version, Node version pin and caching strategy.
- `README` structure and wording, provided D-12 holds.

</decisions>

<external_dependencies>
## External Dependencies — cannot be done inside this phase

Two requirements need cloud accounts owned outside this working session. They are
**split into a local half this phase delivers and a hosted half it declares**. No
task may assume the hosted half exists, and no task may block on it.

| Requirement | Local half — this phase owns it | Hosted half — external, declared |
|---|---|---|
| `SOCLE-02` | Supabase local stack via Docker, `supabase/config.toml`, versioned migrations in the repository, generated database types, client wiring driven by environment variables | Creation of the hosted Supabase project **in an EU region**, with database, authentication and file storage provisioned; its URL and keys |
| `SOCLE-03` | Repository shape and configuration that a Vercel import consumes: build command, Node version, framework preset, documented environment-variable names | Connecting the repository to Vercel, the per-branch preview deployment over HTTPS, and the production domain |

**The Supabase project's region is permanent once created and must be an EU
region** — Lot 3 promises database-level isolation of learner data and Lot 5
promises RGPD compliance; French learners' personal data outside the EU undermines
both.

**Hosting plan tier is a cost decision made outside this phase.** No task may
depend on a Supabase or Vercel feature that requires a paid tier.

The phase closes when the hosted halves land. Until then every local half must be
verifiable on a machine with no cloud credentials.

</external_dependencies>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope and contract
- `.planning/REQUIREMENTS.md` — `SOCLE-01` … `SOCLE-05` (lines 18–22) are this
  phase's complete requirement set
- `.planning/ROADMAP.md` — Phase 0 goal and success criteria
- `.planning/PROJECT.md` — Constraints, quoting Section 1 "Socle technique" of the
  signed offer
- `CLAUDE.md` — project rules: no `any`, Zod at boundaries, translation keys in
  `src/locales/fr/`, commit format `#<type>: <sentence>`, no tests unless asked

### Framework documentation (consulted 2026-08-27 via context7 — do not write setup
commands from memory)
- Next.js — `create-next-app` prompts (TypeScript / linter / Tailwind / `src/` /
  App Router / import alias); the root layout sets `lang` as a JSX prop on `<html>`,
  the Metadata API does not control it
- Tailwind v4 — `npm install tailwindcss @tailwindcss/postcss postcss`, PostCSS
  plugin moved to `@tailwindcss/postcss`, `@import "tailwindcss";` in the global
  stylesheet, no `postcss-import`/`autoprefixer` needed
- shadcn/ui — `npx shadcn@latest init` in an existing Next.js project; requires
  Tailwind installed and the `@/*` alias resolving to `./src/*` under a `src/`
  layout; writes `components.json` and the `cn` util
- Supabase CLI — `supabase init` → `supabase start` → `supabase status`;
  `supabase migration new <name>`; `supabase db reset` applies migrations locally;
  `supabase db push` targets the remote and is out of scope here

</canonical_refs>

<specifics>
## Specific Ideas

**Measured environment, 2026-08-27** — the plan must not contradict it:

| Tool | State | Consequence |
|---|---|---|
| Node | v22.21.1 | present |
| npm | 10.9.4 | present — the package manager |
| `gh` | 2.86.0 | present |
| Docker | 29.1.3 installed, **daemon not running** | a human starts Docker Desktop; no automated step can |
| pnpm | absent | not used |
| Supabase CLI | absent | `npx supabase` |
| Vercel CLI | absent | `npx vercel`; provisioning is external regardless |

**Repository state:** root holds exactly `.git/`, `.gitignore`, `.gsd-headless/`,
`.planning/`, `CLAUDE.md`, `reference/`. There is **no `package.json`, no
application, no `supabase/` directory and no migration**. True greenfield — nothing
is migrated, adapted or preserved, and there is no existing code pattern to follow.

</specifics>

<deferred>
## Deferred Ideas

- Palette, typography, spacing scale, component design — Lot 1 (`CADR-05`,
  `CADR-06`), validated by the client.
- Payment provider selection — Lot 1 (`CADR-02`).
- Transactional email provider and domain authentication — Lots 2 and 5.
- Roles, RLS policies, learner data isolation — Lot 3 (`CPT-08`).
- Any domain table — Lots 3, 4, 6, 7, 10.
- Branch protection making the CI gate blocking, and the production domain —
  applied on the hosting side once the repository is connected.

</deferred>

<scope_fence>
## Scope Fence — a plan that crosses any of these is wrong

1. No task chooses a palette, a typeface, a spacing scale, a component design, a
   payment provider or an email provider.
2. No task creates a domain table.
3. No task pushes to any remote.
4. No task assumes a hosted Supabase project or a live Vercel connection exists.
5. No task writes a day rate, a margin, an internal schedule, or a reference to
   anything outside the signed lots 1–10 into this repository.
6. No task creates a page, a section or site copy.
7. Every task traces to one of `SOCLE-01` … `SOCLE-05`.

</scope_fence>

---

*Phase: 00-socle-technique-et-environnement*
*Context recorded 2026-08-27*
