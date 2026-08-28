---
quick_id: 260828-egy
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - package-lock.json
  - src/lib/env/site-url.ts
  - next.config.ts
  - .env.example
  - README.md
  - docs/hebergement.md
autonomous: true
requirements: [SOCLE-04, SOCLE-05]

must_haves:
  truths:
    - "npm ci succeeds in a clean node:22-bookworm container, then npm run lint / typecheck / build all pass in that same container"
    - "npm ci still succeeds natively on Windows after the container run, with no container-written residue left in the repo"
    - "NEXT_PUBLIC_SITE_URL uses an explicitly set value when present"
    - "On Vercel, when NEXT_PUBLIC_SITE_URL is unset, it derives from VERCEL_PROJECT_PRODUCTION_URL (production) or VERCEL_URL (preview/other)"
    - "When nothing resolves (no explicit value, not on Vercel), the app still fails loudly at boot naming NEXT_PUBLIC_SITE_URL as missing"
    - ".env.example, README.md and docs/hebergement.md describe the resolution logic accurately"
  artifacts:
    - path: "package-lock.json"
      provides: "A lockfile npm ci accepts unmodified on both Linux and Windows"
    - path: "src/lib/env/site-url.ts"
      provides: "Per-environment NEXT_PUBLIC_SITE_URL resolution, run before env schemas validate"
    - path: "next.config.ts"
      provides: "Wires the resolver in before the existing env/server validation import"
  key_links:
    - from: "next.config.ts"
      to: "src/lib/env/site-url.ts"
      via: "side-effect import placed before the existing `import \"./src/lib/env/server\"` line"
      pattern: "import \\\"./src/lib/env/site-url\\\""
    - from: "src/lib/env/site-url.ts"
      to: "process.env.NEXT_PUBLIC_SITE_URL"
      via: "direct mutation at module load, read afterwards by src/lib/env/server.ts and src/lib/env/client.ts's Zod schemas and by Next's client-bundle env inlining"
      pattern: "process\\.env\\.NEXT_PUBLIC_SITE_URL ="
---

<objective>
Fix two Phase 0 rework defects (SOCLE-04, SOCLE-05) in the ElearningAriba repo:

1. `package-lock.json` is stale relative to `package.json` in a way that breaks
   `npm ci` on Linux (works only by accident on Windows). Regenerate it so
   `npm ci` is reliable everywhere, without touching the `shadcn` devDependency
   pin or switching CI/Vercel off `npm ci`.
2. `NEXT_PUBLIC_SITE_URL` is a single static value used in every environment.
   Resolve it per environment: explicit value always wins; on Vercel, derive
   from the platform's own deployment-URL variables when unset; the Zod
   boundary must keep failing loudly, naming the variable, when nothing
   resolves.

Purpose: SOCLE-04 promises per-environment secrets/env vars and SOCLE-05
promises lint/typecheck/build as a real merge gate — both are currently only
accidentally true. This closes the gap so `main`'s branch-protection gate is
trustworthy and preview deployments don't silently report the production URL.

Output: a regenerated `package-lock.json`; a new `src/lib/env/site-url.ts`
resolver wired into `next.config.ts`; updated `.env.example`, `README.md` and
`docs/hebergement.md`. Exactly two commits, both prefixed `#fix:`.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@CLAUDE.md

@package.json
@package-lock.json
@next.config.ts
@src/lib/env/client.ts
@src/lib/env/server.ts
@src/lib/env/index.ts
@.env.example
@README.md
@docs/hebergement.md
@.github/workflows/ci.yml
@vercel.json
</context>

<interfaces>
Current `src/lib/env/server.ts` and `src/lib/env/client.ts` (unchanged by this
plan — do not edit either file):

```typescript
// src/lib/env/client.ts
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});
// reads: process.env.NEXT_PUBLIC_SITE_URL (static access — Next inlines this
// literally into the client bundle at build time from whatever process.env
// holds when the bundler starts)

// src/lib/env/server.ts
const serverEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});
const parsed = serverEnvSchema.safeParse(process.env);
if (!parsed.success) { throw new Error(`Invalid environment variables — ${issues}`); }
```

Current `next.config.ts` (this plan edits this file — add one import line,
nothing else):

```typescript
import type { NextConfig } from "next";
import "./src/lib/env/server"; // <- your new import must go BEFORE this line
const nextConfig: NextConfig = { turbopack: { root: __dirname } };
export default nextConfig;
```

**Import-order fact this plan depends on:** ES module `import` declarations in
the same file execute in the order they are written relative to each other
(both are hoisted above any other top-level statement in that file, but not
reordered relative to one another). So a new side-effect import placed above
`import "./src/lib/env/server"` in `next.config.ts` is guaranteed to run
first — its `process.env` mutation is visible by the time `server.ts`'s
top-level `safeParse(process.env)` executes, and by the time Next's bundler
reads `process.env.NEXT_PUBLIC_SITE_URL` to inline it for the client bundle.
Do NOT put the mutation inline in `next.config.ts` itself between the two
imports — both imports get hoisted above inline statements, so an inline
assignment there would run AFTER `server.ts` already validated.

**Vercel system env vars this plan relies on** (confirmed via Vercel's system
environment variables reference, current as of this session — verify still
current if this plan is executed much later):
- `VERCEL_ENV` — `production` | `preview` | `development`. Available at build
  and runtime. Not prefixed `NEXT_PUBLIC_`.
- `VERCEL_URL` — deployment domain, no protocol (e.g. `my-site.vercel.app`),
  available at build and runtime. Not prefixed `NEXT_PUBLIC_`.
- `VERCEL_PROJECT_PRODUCTION_URL` — the project's stable production domain,
  no protocol, always set (even on preview deployments), available at build
  and runtime. Not prefixed `NEXT_PUBLIC_`.
- None of the three carry a `NEXT_PUBLIC_` prefix and Next does not
  auto-inline them into the client bundle — that's why the resolver has to
  assign the derived value onto `process.env.NEXT_PUBLIC_SITE_URL` itself,
  early, rather than exposing the raw Vercel vars.
- These three variables require the Vercel project setting **"Enable access
  to System Environment Variables"** to be turned on — this is a dashboard
  action, out of scope for this repo, and belongs in `docs/hebergement.md`'s
  existing hosting checklist (owned by the party holding the Vercel account).
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Regenerate package-lock.json and prove it under node:22-bookworm</name>
  <files>package-lock.json</files>
  <action>
Do NOT touch package.json — the shadcn devDependency pin stays exactly as-is
(do not drop it, do not move it, do not add/remove/upgrade any dependency).

1. From the repo root on Windows, delete `node_modules` and `package-lock.json`
   entirely so the next install is a from-scratch resolution rather than an
   incremental patch of the stale lock: `rm -rf node_modules package-lock.json`.
2. Run `npm install` with no flags. This regenerates package-lock.json from
   the committed package.json only.
3. Confirm package.json is untouched: `git diff --stat -- package.json` must
   print nothing. If npm proposes any package.json change, stop — that is out
   of scope; report it instead of accepting it.
4. Run the mandatory Docker verification command exactly as specified,
   substituting the real absolute path to this repo for `<repo>` (from Git
   Bash, `$(pwd)` resolves correctly for Docker Desktop's Windows integration):
   `docker run --rm -v "<repo>:/app" -w /app node:22-bookworm bash -lc "npm ci && npm run lint && npm run typecheck && npm run build"`
5. If it fails on `npm ci` pointing at a different unresolved/missing nested
   dependency: repeat steps 1–4 (regenerate via npm again — never hand-edit
   package-lock.json's JSON directly). If it fails on lint/typecheck/build
   for reasons unrelated to the lockfile, stop and report — that is a
   separate, out-of-scope defect, not something to silently patch here.
6. Do not proceed to Task 2 until the full Docker command chain
   (`npm ci && npm run lint && npm run typecheck && npm run build`) exits 0.
  </action>
  <verify>
    <automated>docker run --rm -v "&lt;repo&gt;:/app" -w /app node:22-bookworm bash -lc "npm ci && npm run lint && npm run typecheck && npm run build"</automated>
  </verify>
  <done>package.json is byte-identical to before this task; package-lock.json is regenerated; the Docker command chain (npm ci, lint, typecheck, build) exits 0 inside node:22-bookworm.</done>
</task>

<task type="auto">
  <name>Task 2: Clean up container residue, prove Windows parity, commit defect 1</name>
  <files>package-lock.json</files>
  <action>
1. The container run in Task 1 wrote a Linux-built `node_modules` (and a
   Linux-compiled `.next`) into the mounted repo path via the bind mount —
   remove both now, since Linux-built artifacts are incompatible with native
   Windows tooling: `rm -rf node_modules .next`. If permission errors occur
   removing it via `rm`, fall back to `cmd //c rmdir /s /q node_modules` or
   PowerShell `Remove-Item -Recurse -Force node_modules`.
2. Run `git status --porcelain` — it must show no changes outside
   `package-lock.json` (node_modules is gitignored, so it won't appear even
   if present; the point of step 1 is to keep the working directory usable
   for native Windows tooling afterward, not git hygiene).
3. Run `npm ci` natively on Windows (fresh install) to prove the regenerated
   lock also resolves correctly there, not only inside the Linux container.
   Must exit 0.
4. Confirm the branch has not changed:
   `git rev-parse --abbrev-ref HEAD` must print
   `gsd/phase-00-socle-technique-et-environnement`. If it does not, STOP —
   do not commit, do not switch branches yourself; report the discrepancy.
5. Stage only `package-lock.json` and commit:
   `git commit -m "#fix: regenerate package-lock.json for npm ci parity on Linux"`
   One sentence, no AI/phase/plan references (per CLAUDE.md).
6. Do NOT run `git push` at any point — this is a hard constraint for the
   entire plan, not just this task.
  </action>
  <verify>
    <automated>npm ci</automated>
  </verify>
  <done>node_modules from the container run is removed; native `npm ci` exits 0 on Windows; exactly one new commit exists, containing only package-lock.json, message "#fix: regenerate package-lock.json for npm ci parity on Linux"; branch unchanged; nothing pushed.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Resolve NEXT_PUBLIC_SITE_URL per environment</name>
  <files>src/lib/env/site-url.ts, next.config.ts</files>
  <action>
Create `src/lib/env/site-url.ts` as a side-effect module (no exports needed —
this file's only job is to mutate `process.env.NEXT_PUBLIC_SITE_URL` before
anything reads it). Logic, in order:
1. If `process.env.NEXT_PUBLIC_SITE_URL` is already truthy, leave it alone —
   an explicit value always wins, in every environment including local.
2. Else if `process.env.VERCEL_ENV === "production"` and
   `process.env.VERCEL_PROJECT_PRODUCTION_URL` is set, assign
   `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`.
3. Else if `process.env.VERCEL_URL` is set (covers preview and any other
   non-production Vercel deployment), assign `https://${process.env.VERCEL_URL}`.
4. Else leave `process.env.NEXT_PUBLIC_SITE_URL` unset — do NOT invent a
   `http://localhost:3000` fallback in code. Local dev keeps setting it
   explicitly in `.env.local` per the existing README instructions; if it's
   missing and nothing above resolves, `src/lib/env/server.ts`'s existing
   `z.url()` check must still throw naming `NEXT_PUBLIC_SITE_URL` — this
   module must never swallow that failure.

Edit `next.config.ts`: add `import "./src/lib/env/site-url";` on its own line
immediately ABOVE the existing `import "./src/lib/env/server";` line (source
order is load-bearing here — see `<interfaces>` above for why). Do not modify
`src/lib/env/client.ts` or `src/lib/env/server.ts` — their schemas are
already correct and will read the resolved value once this wiring is in
place. Do not add a `NEXT_PUBLIC_` alias for `VERCEL_URL` or
`VERCEL_PROJECT_PRODUCTION_URL` — they must stay unexposed; only the derived
`NEXT_PUBLIC_SITE_URL` value is ever public.

Then smoke-test both resolver branches natively on Windows, with `.env.local`
temporarily out of the way so its real local values can't mask the test:
a. `mv .env.local .env.local.smoketest-bak`
b. Fail-loud path — run with NEXT_PUBLIC_SITE_URL and all VERCEL_* vars
   unset: `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder SUPABASE_SERVICE_ROLE_KEY=placeholder npm run build`
   — must fail fast with an error naming `NEXT_PUBLIC_SITE_URL`.
c. Vercel-derive path — run with VERCEL_ENV/VERCEL_URL set and
   NEXT_PUBLIC_SITE_URL unset: `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder SUPABASE_SERVICE_ROLE_KEY=placeholder VERCEL_ENV=preview VERCEL_URL=example-preview.vercel.app npm run build`
   — must succeed (exit 0).
d. Explicit-wins path — same as (c) but also set
   `NEXT_PUBLIC_SITE_URL=https://explicit.example.com` — must succeed (exit 0).
e. Restore `.env.local`: `mv .env.local.smoketest-bak .env.local`.
f. Remove build artifacts from these smoke runs: `rm -rf .next`.
Also run `npm run typecheck` and `npm run lint` — both must pass.
  </action>
  <verify>
    <automated>NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder SUPABASE_SERVICE_ROLE_KEY=placeholder npm run build 2>&amp;1 | grep -q "NEXT_PUBLIC_SITE_URL" &amp;&amp; npm run typecheck &amp;&amp; npm run lint</automated>
  </verify>
  <done>src/lib/env/site-url.ts implements the three-tier resolution and is wired into next.config.ts before the server.ts validation import; the fail-loud smoke run exits non-zero naming NEXT_PUBLIC_SITE_URL; both the Vercel-derive and explicit-wins smoke runs exit 0; .env.local is restored byte-identical; no stray .next or .env.local.smoketest-bak files remain; typecheck and lint pass.</done>
</task>

<task type="auto">
  <name>Task 4: Update docs to match the new resolution logic</name>
  <files>.env.example, README.md, docs/hebergement.md</files>
  <action>
Update `.env.example`'s `NEXT_PUBLIC_SITE_URL` comment block to state: local
still requires the explicit `http://localhost:3000` value; on Vercel, leaving
it unset lets it derive automatically from `VERCEL_PROJECT_PRODUCTION_URL`
(production) or `VERCEL_URL` (preview/other) — set it explicitly only to
override that derived value.

Update `README.md`'s "Variables d'environnement" section with one sentence
noting this exception for `NEXT_PUBLIC_SITE_URL` on Vercel, referencing
`docs/hebergement.md` for the hosting-side detail. Do not change the local
dev walkthrough (step 5) — it is still correct as written (local requires the
explicit value).

Update `docs/hebergement.md`:
- Add a checklist item under "Vercel — connexion du dépôt et déploiement":
  enabling "Enable access to System Environment Variables" in the project's
  Vercel settings — required for `VERCEL_URL` / `VERCEL_PROJECT_PRODUCTION_URL`
  / `VERCEL_ENV` to be populated at all, otherwise the derivation silently
  never fires and preview deployments would still need an explicit value.
- In the "Variables d'environnement" table, adjust the `NEXT_PUBLIC_SITE_URL`
  row's Preview and Production cells to indicate the value is optional there
  (auto-derived if absent, explicit value always overrides) — Local stays
  required. Add a short footnote explaining the derivation source per
  environment.
  </action>
  <verify>
    <automated>git diff --stat -- .env.example README.md docs/hebergement.md</automated>
  </verify>
  <done>All three docs describe the explicit-wins / Vercel-derives / local-stays-explicit resolution accurately; the clean-clone walkthrough in README.md remains accurate; git diff --stat shows exactly these three files changed by this task.</done>
</task>

<task type="auto">
  <name>Task 5: Final full verification and commit defect 2</name>
  <files>src/lib/env/site-url.ts, next.config.ts, .env.example, README.md, docs/hebergement.md</files>
  <action>
1. Confirm branch: `git rev-parse --abbrev-ref HEAD` must print
   `gsd/phase-00-socle-technique-et-environnement`. Abort and report if not —
   do not switch branches.
2. Re-run the mandatory Docker verification command on the full combined
   final state (lockfile fix + site-url resolution + docs), substituting the
   real absolute repo path for `<repo>`:
   `docker run --rm -v "<repo>:/app" -w /app node:22-bookworm bash -lc "npm ci && npm run lint && npm run typecheck && npm run build"`
   Must exit 0. If it fails, diagnose and fix within this task's scope
   (defect 2's code/docs only — do not reopen defect 1's lockfile unless the
   failure is clearly caused by Task 3/4's changes).
3. Remove the container-written `node_modules` and `.next` residue again:
   `rm -rf node_modules .next`.
4. Re-run `npm ci` natively on Windows to reconfirm parity; must exit 0.
5. Check `git status --porcelain` before staging: it must show no changes to
   `package-lock.json` (defect 1 already committed it — if `npm ci` somehow
   mutated it, stop and investigate before committing anything) and no
   changes under `.planning/`.
6. Stage exactly: `src/lib/env/site-url.ts`, `next.config.ts`,
   `.env.example`, `README.md`, `docs/hebergement.md`. Commit:
   `git commit -m "#fix: resolve NEXT_PUBLIC_SITE_URL per environment on Vercel"`
7. Do NOT run `git push`.
8. Final guardrail check: `git log --oneline -5` shows exactly two new
   `#fix:` commits since the start of this task; `git rev-parse --abbrev-ref HEAD`
   still prints `gsd/phase-00-socle-technique-et-environnement`;
   `git status --porcelain` is clean (ignoring gitignored node_modules/.next).
  </action>
  <verify>
    <automated>docker run --rm -v "&lt;repo&gt;:/app" -w /app node:22-bookworm bash -lc "npm ci &amp;&amp; npm run lint &amp;&amp; npm run typecheck &amp;&amp; npm run build" &amp;&amp; npm ci</automated>
  </verify>
  <done>Final Docker chain (npm ci, lint, typecheck, build) exits 0; container residue removed; native npm ci exits 0 on Windows afterward; exactly two commits total exist for this task, both prefixed #fix:, both unpushed; branch unchanged; working tree clean.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Vercel platform → build process | `VERCEL_ENV`/`VERCEL_URL`/`VERCEL_PROJECT_PRODUCTION_URL` are platform-supplied, not user input — trusted within Vercel's own deployment pipeline |
| CI/local shell → npm install | package-lock.json regeneration must not introduce new transitive dependencies beyond what package.json already declares |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-quick-01 | Tampering | package-lock.json regeneration | mitigate | Regeneration is `npm install` only against the existing, already-audited package.json — no new packages added; Docker verification (Task 1, Task 5) proves the resulting tree resolves and builds cleanly before commit |
| T-quick-02 | Information Disclosure | site-url.ts / VERCEL_* vars | accept | VERCEL_URL/VERCEL_PROJECT_PRODUCTION_URL are deployment domain names, not secrets — safe to derive a public NEXT_PUBLIC_SITE_URL from them |
| T-quick-03 | Denial of Service (fail-open) | env boot validation | mitigate | site-url.ts never invents a fallback for the "nothing resolves" case — server.ts's existing z.url() check keeps failing loudly, per Task 3's fail-loud smoke test |
| T-quick-SC | Tampering | npm ci / npm install | accept | No new packages are introduced by this plan; package-lock.json is regenerated from the already-reviewed package.json only, not modified to add dependencies |
</threat_model>

<verification>
1. `docker run --rm -v "<repo>:/app" -w /app node:22-bookworm bash -lc "npm ci && npm run lint && npm run typecheck && npm run build"` exits 0 (run twice: end of Task 1, end of Task 5).
2. After each Docker run, `node_modules` written by the container is removed from the repo before continuing (`rm -rf node_modules`).
3. `npm ci` run natively on Windows exits 0 after each cleanup (Task 2, Task 5).
4. Exactly two commits exist in this repo when done, both prefixed `#fix:`, both unpushed:
   - `#fix: regenerate package-lock.json for npm ci parity on Linux`
   - `#fix: resolve NEXT_PUBLIC_SITE_URL per environment on Vercel`
5. `git rev-parse --abbrev-ref HEAD` is `gsd/phase-00-socle-technique-et-environnement` throughout — never switched or created.
6. `git status --porcelain` is clean at the end (ignoring gitignored paths).
</verification>

<success_criteria>
- npm ci succeeds inside node:22-bookworm, then lint/typecheck/build all pass there (proven twice: after the lockfile fix, and again after the full change set).
- npm ci still succeeds on Windows after each Docker run's cleanup.
- NEXT_PUBLIC_SITE_URL: explicit value wins; Vercel derives it from VERCEL_PROJECT_PRODUCTION_URL/VERCEL_URL when unset; boot-time Zod validation still fails loudly naming the variable when nothing resolves; .env.example/README.md/docs/hebergement.md match.
- Exactly two atomic #fix: commits, nothing pushed, branch unchanged, working tree clean, no node_modules residue from the container run.
- No auth code, no migrations, no unrelated feature work touched.
</success_criteria>

<output>
Create `.planning/quick/260828-egy-fix-package-lock-json-sync-for-npm-ci-on/260828-egy-SUMMARY.md` when done.
</output>
