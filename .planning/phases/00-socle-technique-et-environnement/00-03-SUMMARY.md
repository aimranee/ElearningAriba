---
phase: 00-socle-technique-et-environnement
plan: 03
subsystem: infra
tags: [supabase, docker, postgres, migrations]

requires:
  - phase: 00-socle-technique-et-environnement (plan 02)
    provides: .gitignore already excluding supabase/.temp/ and supabase/.branches/
provides:
  - Local Supabase stack running through Docker (API, DB, Studio, Mailpit)
  - supabase/config.toml committed, no hosted project_id
  - supabase/migrations/ as the versioned migration directory, one migration proving the mechanism
  - Local API URL and anon key for plan 00-05's .env.local
affects: [00-05, 00-06]

tech-stack:
  added: [supabase-cli (invoked via npx, not a package.json dependency)]
  patterns:
    - "Schema changes only through supabase/migrations/*.sql, applied locally with npx supabase db reset"
    - "npx supabase link and npx supabase db push are forbidden until a hosted project exists (plan 00-06 handover)"

key-files:
  created:
    - supabase/config.toml
    - supabase/.gitignore
    - supabase/migrations/20260827131029_init_schema.sql
  modified: []

key-decisions:
  - "config.toml's generated project_id (\"ElearningAriba\") is the local Docker-container namespace, not a hosted-project reference — left as generated per plan instruction to accept defaults as-is"

requirements-completed: [SOCLE-02]

duration: 12min
completed: 2026-08-27
---

# Phase 00 Plan 03: Local Supabase Stack and First Migration Summary

**Local Supabase stack running through Docker, `supabase/config.toml` committed with no hosted-project reference, and one versioned migration (`create schema app`) proven end to end with `db reset` and observed by direct query — no domain table, nothing hosted touched.**

## Performance

- **Duration:** ~12 min
- **Completed:** 2026-08-27
- **Tasks:** 4 (1 pre-cleared checkpoint, 3 auto)
- **Files modified:** 3 (across 2 commits; task 4 was observation-only, no file change)

## Docker Checkpoint Evidence (Task 1)

Pre-cleared by the developer before this run (headless session). Verified directly:

```
$ docker info
Client: Version: 29.1.3 ...
Server: Server Version: 29.1.3
```

Exit code 0, `Server Version` line present. Proceeded without pausing, per the pre-cleared instruction.

## Accomplishments

- `npx supabase init` generated `supabase/config.toml` and `supabase/.gitignore`, accepted as-is, no ports tuned, no `project_id` pointing at a hosted project (the generated `project_id = "ElearningAriba"` is the local container-namespace value, not a remote reference)
- `npx supabase start` pulled and started the local container stack (db, auth, rest, storage, studio, realtime, edge-runtime, postgres-meta, mailpit)
- `npx supabase status` exits 0 and reports:
  - `API URL`: `http://127.0.0.1:54321`
  - `DB URL`: `postgresql://postgres:postgres@127.0.0.1:54322/postgres` (standard local-only credential, identical on every Supabase CLI install, not a secret)
  - `Studio URL`: `http://127.0.0.1:54323`
  - `ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0` — for plan 00-05's `.env.local`
  - `SERVICE_ROLE_KEY` was printed to the terminal by the CLI (unavoidable) but is **not** quoted or pasted anywhere in this summary or any committed file — named only, per the plan's instruction
- `docker ps --filter name=supabase_db` prints `supabase_db_ElearningAriba`
- `git status --porcelain` after staging showed only `supabase/config.toml` and `supabase/.gitignore` — nothing under `supabase/.temp` or `supabase/.branches`
- One migration created: `supabase/migrations/20260827131029_init_schema.sql` — `create schema if not exists app;` with a schema comment, a leading comment explaining why it exists and how to reverse it (`drop schema app cascade;`), zero `create table`/`create policy`/`create trigger`/`create function`/`create type` statements
- `npx supabase db reset` exited 0, dropped and recreated the **local** database, applied the one migration in order
- Effect observed by direct query inside the running container (not inferred from exit code):

```
$ docker exec supabase_db_ElearningAriba psql -U postgres -d postgres -tAc \
    "select count(*) from information_schema.schemata where schema_name='app'"
1

$ docker exec supabase_db_ElearningAriba psql -U postgres -d postgres -tAc \
    "select version from supabase_migrations.schema_migrations order by version desc limit 5"
20260827131029
```

  - `app` schema exists (count = 1)
  - Migration version `20260827131029` matches the timestamp prefix of `supabase/migrations/20260827131029_init_schema.sql`, registered as applied
- No `supabase link` and no `supabase db push` executed at any point

## Task Commits

1. **Task 1: Start the Docker Desktop daemon** — pre-cleared checkpoint, no commit (verification only)
2. **Task 2: Initialise the Supabase local stack and bring it up** — `6e3ee8f` (feat)
3. **Task 3: Create the first versioned migration** — `e889816` (feat)
4. **Task 4: Apply the migration and observe the effect** — no commit (verification/observation only, no file changed)

**Plan metadata:** pending (this commit)

## Files Created/Modified

- `supabase/config.toml` — local stack configuration generated by `supabase init`, no hosted-project reference
- `supabase/.gitignore` — excludes `.branches`, `.temp`, `.env.keys`, `.env.local`, `.env.*.local` (generated by `supabase init`)
- `supabase/migrations/20260827131029_init_schema.sql` — creates the `app` schema, no domain table

## Decisions Made

- Kept the CLI-generated `project_id = "ElearningAriba"` in `config.toml` as-is: it namespaces local Docker container names (e.g. `supabase_db_ElearningAriba`) and is not a hosted-project reference — setting or changing it was explicitly out of scope for this plan.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None for this plan. The hosted half of SOCLE-02 (creating the EU-region Supabase project, provisioning auth/storage, obtaining its URL and keys) remains an **open external dependency**, explicitly out of reach here and handed over in plan 00-06.

## Next Phase Readiness

- Local API URL (`http://127.0.0.1:54321`) and anon key recorded above are ready for plan 00-05 to write into `.env.local`.
- `supabase/migrations/` is the versioned directory every later lot appends its schema to.
- The local stack is currently running (`npx supabase status` reports it up); plan 00-05 can generate database types against it directly.
- No blockers for plan 00-05.

---
*Phase: 00-socle-technique-et-environnement*
*Completed: 2026-08-27*

## Self-Check: PASSED

All 3 created files verified present on disk; both task commit hashes (6e3ee8f, e889816) verified present in git log.
