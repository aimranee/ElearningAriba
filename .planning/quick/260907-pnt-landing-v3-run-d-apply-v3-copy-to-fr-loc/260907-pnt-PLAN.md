---
task: 260907-pnt
type: quick
branch: cto/landing-v3
autonomous: true
files_modified:
  - src/locales/fr/landing.json
  - src/locales/fr/common.json
  - .planning/quick/260907-pnt-landing-v3-run-d-apply-v3-copy-to-fr-loc/260907-pnt-SUMMARY.md
---

<objective>
Run D (last) of "Landing v3 - Le parcours": apply the v3 copy rewrite to the French locale
files, key by key, exactly as given in the signed content JSON, then reseed the local
Supabase content tables from that copy. Runs A, B, C and E already landed the structural
rework (night sections, illustrations, atmosphere layer, cursor glow) on `cto/landing-v3`;
this run touches no component, only the two locale bundles that feed them plus the local
database row set the seed script derives from those bundles.

Purpose: close brief J2 ("Contenu v3 - reecriture, memes faits") - same facts, new
sentences, verified against the seed's own upsert-key and H2-split invariants before either
commit lands.
Output: two commits on `cto/landing-v3` (copy, then the local reseed record); a final
verification pass (lint, typecheck, build, content:check, git status/branch) run once after
both commits.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md

Source brief and exact content (read-only, external to repo - do not modify):
@C:/Users/Essakhi/Desktop/ElearningSAP/ariba-cto/notes/2026-09-07-brief-refonte-landing-v3.md
@C:/Users/Essakhi/Desktop/ElearningSAP/ariba-cto/notes/2026-09-07-contenu-landing-v3.json

Files to change:
@src/locales/fr/landing.json
@src/locales/fr/common.json

Read-only reference:
@scripts/seed-content.mjs
@scripts/check-mock-content.mjs
@src/components/sections/hero.tsx
@src/locales/fr/_mocks.public.json
</context>

<interfaces>
<!-- Ground truth read directly from the files above. Executor must still re-read the live
     files before editing - this is a starting point, not a substitute. -->

**Exact key -> value map to apply** (from `2026-09-07-contenu-landing-v3.json`, sections
`"landing.json"` and `"common.json"`). Apply every value **verbatim** - copy the string from
the content JSON, do not retype or rephrase it. Dotted paths use array index (e.g.
`pourQui.profils.0.accroche` = `landing.pourQui.profils[0].accroche`):

- `hero.titre`, `hero.sousTitre`
- `pourQui.titre`, `pourQui.reassurance`
- `pourQui.profils.0.accroche`, `pourQui.profils.0.description`
- `pourQui.profils.1.accroche`, `pourQui.profils.1.description`
- `pourQui.profils.2.accroche`, `pourQui.profils.2.description`
- `pourQui.profils.3.description` (its `.accroche` does NOT change)
- `pourQui.profils.4.description` (its `.accroche` does NOT change)
- `competences.titre`
- `competences.items.0.titre`, `competences.items.0.description`
- `competences.items.1.description` (its `.titre` does NOT change)
- `competences.items.5.titre`, `competences.items.5.description`
- `programme.titre`
- `programme.modules.0.resume` through `programme.modules.4.resume` (all five; `.titre`/`.duree` do NOT change)
- `formatModalites.titre`
- `formatModalites.items.0.description` (its `.titre` does NOT change; items 1-5 do NOT change at all)
- `confiance.titre`, `confiance.lead`
- `ctaFinal.titre`, `ctaFinal.supportLine`
- `common.json`: `hero.chips` (whole array, 2 -> 3 entries)

**Every other key in both files is untouched** - no key added, none removed, no other value
edited. In particular these stay byte-identical (do not touch): `hero.preuve.*`,
`hero.flux.etapes`, `pourQui.profils[].titre`, `pourQui.profils[].picto`,
`pourQui.profils.3.accroche`, `pourQui.profils.4.accroche`, `competences.items[].picto`,
`competences.items[1].titre`, `competences.items[2..4]` (entire objects),
`programme.modules[].titre`, `programme.modules[].duree`, `formatModalites.apercu.*`,
`formatModalites.items[1..5]` (entire objects), `confiance.items`, `confiance.formateur`,
`confiance.preuve`, `faq.*` (entire block, including `faq.titre`), `ctaFinal.etapes`.

**Why picto/titre/duree are load-bearing (`scripts/seed-content.mjs`):** `content_item.cle`
is the upsert key - `pourQui.profils[].picto` and `competences.items[].picto` are used
directly as `cle`; `programme.modules[].cle` is `slugify(module.titre)`. Changing any of
these three fields creates an orphan row instead of updating the existing one. Do not touch
them even though this run also edits sibling fields (`description`, `resume`) on the same
objects.

**Why the H2 split point matters (`scripts/seed-content.mjs`'s `splitTwoSentences`):** the
seed cuts each of `pourQui.titre`, `competences.titre`, `programme.titre`,
`formatModalites.titre`, `confiance.titre`, `ctaFinal.titre` at the first literal `". "` to
produce `titre`/`titre_accent` in the database. Every new value above already contains
exactly one such break in the intended place (verified by the invariant check in Task 1) -
do not add or remove a period elsewhere in these six strings. `faq.titre` uses a different
split (`splitAtPhrase` on the literal phrase "trouvent leur reponse ici.") and is not in
this run's edit list at all.

**Why `hero.titre`'s split matters (`src/components/sections/hero.tsx`):** the component
cuts the string at its own first `.` for the lead sentence, then locates `words[0]` (the
first `TYPEWRITER_WORDS` entry in competence order, currently `"SAP Ariba"` for
`ecosysteme-ariba`) inside the remainder to place the typewriter. The new `hero.titre`
("En direct, avec un expert. Maitrisez SAP Ariba") preserves both: one period before the
rest, and "SAP Ariba" present after it.
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1 (COMMIT 1): Apply the v3 copy to landing.json and common.json</name>
  <files>src/locales/fr/landing.json, src/locales/fr/common.json</files>
  <action>
Edit `src/locales/fr/landing.json` and `src/locales/fr/common.json` so every key listed in
`<interfaces>` above carries exactly the value given in
`C:/Users/Essakhi/Desktop/ElearningSAP/ariba-cto/notes/2026-09-07-contenu-landing-v3.json`
under `"landing.json"` / `"common.json"`. Copy each string verbatim from that file - never
author or rephrase French copy, never add a key, never remove a key. Every key not listed in
`<interfaces>` stays byte-for-byte as it is today, including array entries that sit next to
an edited sibling (e.g. `pourQui.profils.3.accroche` next to the edited
`pourQui.profils.3.description`).

Once both files are edited, commit them with message
`#feat: apply landing v3 copy to hero, pour-qui, competences, programme, format, confiance, cta-final`.
Commit before running the verify step below - do not fix the working tree based on the
verify step's output; if it fails, stop and report what failed instead.
  </action>
  <verify>
    <automated>node --input-type=module -e "
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const before = JSON.parse(execSync('git show HEAD~1:src/locales/fr/landing.json').toString());
const after = JSON.parse(readFileSync('src/locales/fr/landing.json', 'utf8'));
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const checks = [];
const firstPeriodSpace = (s) => s.indexOf('. ');
checks.push(['hero.titre has \". \" then SAP Ariba after it', (() => {
  const i = after.hero.titre.indexOf('. ');
  return i !== -1 && after.hero.titre.slice(i + 2).includes('SAP Ariba');
})()]);
for (const k of ['pourQui.titre','competences.titre','programme.titre','formatModalites.titre','confiance.titre','ctaFinal.titre']) {
  const val = k.split('.').reduce((o, s) => o[s], after);
  checks.push([k + ' contains \". \"', firstPeriodSpace(val) !== -1]);
}
checks.push(['faq.titre unchanged', eq(before.faq, after.faq)]);
for (let i = 0; i < 5; i++) checks.push(['pourQui.profils.' + i + '.picto unchanged', eq(before.pourQui.profils[i].picto, after.pourQui.profils[i].picto)]);
for (let i = 0; i < 5; i++) checks.push(['pourQui.profils.' + i + '.titre unchanged', eq(before.pourQui.profils[i].titre, after.pourQui.profils[i].titre)]);
checks.push(['pourQui.profils.3.accroche unchanged', eq(before.pourQui.profils[3].accroche, after.pourQui.profils[3].accroche)]);
checks.push(['pourQui.profils.4.accroche unchanged', eq(before.pourQui.profils[4].accroche, after.pourQui.profils[4].accroche)]);
for (let i = 0; i < 6; i++) checks.push(['competences.items.' + i + '.picto unchanged', eq(before.competences.items[i].picto, after.competences.items[i].picto)]);
checks.push(['competences.items.1.titre unchanged', eq(before.competences.items[1].titre, after.competences.items[1].titre)]);
checks.push(['competences.items.2..4 entire unchanged', eq(before.competences.items.slice(2, 5), after.competences.items.slice(2, 5))]);
for (let i = 0; i < 5; i++) {
  checks.push(['programme.modules.' + i + '.titre unchanged', eq(before.programme.modules[i].titre, after.programme.modules[i].titre)]);
  checks.push(['programme.modules.' + i + '.duree unchanged', eq(before.programme.modules[i].duree, after.programme.modules[i].duree)]);
}
checks.push(['formatModalites.apercu unchanged', eq(before.formatModalites.apercu, after.formatModalites.apercu)]);
checks.push(['formatModalites.items.0.titre unchanged', eq(before.formatModalites.items[0].titre, after.formatModalites.items[0].titre)]);
checks.push(['formatModalites.items.1..5 entire unchanged', eq(before.formatModalites.items.slice(1), after.formatModalites.items.slice(1))]);
checks.push(['confiance.items unchanged', eq(before.confiance.items, after.confiance.items)]);
checks.push(['confiance.formateur unchanged', eq(before.confiance.formateur, after.confiance.formateur)]);
checks.push(['confiance.preuve unchanged', eq(before.confiance.preuve, after.confiance.preuve)]);
checks.push(['hero.preuve unchanged', eq(before.hero.preuve, after.hero.preuve)]);
checks.push(['hero.flux unchanged', eq(before.hero.flux, after.hero.flux)]);
checks.push(['ctaFinal.etapes unchanged', eq(before.ctaFinal.etapes, after.ctaFinal.etapes)]);
const failed = checks.filter((c) => !c[1]);
if (failed.length) { console.error('INVARIANT FAILURES:', failed.map((f) => f[0])); process.exit(1); }
console.log('all', checks.length, 'invariants hold');
"</automated>
  </verify>
  <done>
`landing.json` and `common.json` carry every new value from
`2026-09-07-contenu-landing-v3.json` at the exact dotted paths listed in `<interfaces>`, no
other key changed, the commit landed before this verify ran, and the node invariant script
above reports all checks passing (upsert-key fields byte-identical, H2 split points present,
`faq.titre`/`confiance.*`/`hero.preuve`/`hero.flux`/`ctaFinal.etapes` untouched).
  </done>
</task>

<task type="auto">
  <name>Task 2 (COMMIT 2): Reseed local Supabase and record the result</name>
  <files>.planning/quick/260907-pnt-landing-v3-run-d-apply-v3-copy-to-fr-loc/260907-pnt-SUMMARY.md</files>
  <action>
Run `npm run content:seed` against the local Supabase stack (already up on
`127.0.0.1:54321`; the script reads `.env.local` itself via `--env-file-if-exists`). This is
an idempotent upsert on `(cle)` for sections and `(section_cle, cle)` for items (D-27) - it
only updates rows whose key already exists, per Task 1's untouched upsert-key fields.

Then assert the result from the **database**, not the JSON, via `curl` against
`$NEXT_PUBLIC_SUPABASE_URL/rest/v1/...` using the anon key
(`NEXT_PUBLIC_SUPABASE_ANON_KEY`) from `.env.local` and header `Accept-Profile: app` (see
the verify block for the exact three requests and what each must show).

Write `.planning/quick/260907-pnt-landing-v3-run-d-apply-v3-copy-to-fr-loc/260907-pnt-SUMMARY.md`
recording: which command ran, the row counts observed from each of the three curl checks,
and this exact statement - the **hosted** database is NOT touched by this run; the CIO
reseeds the hosted project(s) separately via their own handoff. Commit only this SUMMARY.md
file with message `#docs: record local content reseed for landing v3 run D`.
  </action>
  <verify>
    <automated>set -a; source .env.local 2>/dev/null; set +a; curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/content_section?cle=eq.hero&select=titre,lead" -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" -H "Accept-Profile: app"; echo; curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/content_item?section_cle=eq.pour-qui&select=cle,description,donnees&order=position" -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" -H "Accept-Profile: app"; echo; curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/content_item?section_cle=eq.programme&select=cle" -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" -H "Accept-Profile: app"</automated>
  </verify>
  <done>
`npm run content:seed` completed without error against the local stack. The three curl
checks show: `content_section?cle=eq.hero` returns a `titre` equal to the new
`landing.json#hero.titre`; `content_item?section_cle=eq.pour-qui` returns exactly 5 rows,
`cle` values unchanged from before, `description` matching the new values (and
`donnees.accroche` matching the new accroches for indices 0-2, unchanged for indices 3-4);
`content_item?section_cle=eq.programme` returns exactly 5 rows (no orphan `cle`). SUMMARY.md
exists with the row counts and the explicit "hosted database not touched" note, and is
committed.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|--------------|
| Locale JSON -> Supabase seed | `content:seed` reads only `src/locales/fr/*.json` (trusted, repo-committed) and writes via the service-role key; no user input in this run |
| SUMMARY.md curl assertions | Read-only anon-key requests against the local stack only; no write path |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-260907pnt-01 | Tampering | `scripts/seed-content.mjs` upsert keys | mitigate | Task 1's invariant check blocks the commit's own downstream reseed from creating orphan rows by asserting `picto`/`titre`/`duree` byte-identical before Task 2 runs |
| T-260907pnt-02 | Information Disclosure | `.env.local` anon/service-role keys | accept | Keys read into shell variables for local curl/seed calls only, never echoed or written to SUMMARY.md, never sent to a non-local host |
| T-260907pnt-03 | Repudiation | Hosted DB left unseeded | accept | Explicitly documented in SUMMARY.md so no one assumes the hosted reseed happened as a side effect of this run |

No package installs this run - package legitimacy gate not applicable.
</threat_model>

<verification>
Run once, after both commits land, in this exact order. Do not run any of these in the
background; do not start a dev server.

1. `npm run lint` - must report zero problems.
2. `npm run typecheck` - must pass.
3. `npm run build` - must pass. Report the prerendered size of `/` from the build output.
   Roughly 250 KB is expected; a `/` around 44 KB means an empty local database (content
   queries returned nothing) and must be reported as a **FAILURE**, not a success.
4. `npm run content:check` - must exit 1, naming exactly the same placeholder keys as
   before this run started (compare against the output captured from `HEAD~2` or a
   git-stash baseline taken before Task 1's commit) - no key added, none removed.
5. `git status --short` must be clean.
6. `git rev-parse --abbrev-ref HEAD` must read `cto/landing-v3`.

Verification is evidence-based only: JSON parsed with node, database rows via curl, exit
codes, build output. Do not verify by grepping source. Never run `git push`. If any fact in
the brief or content JSON is wrong on the ground (a listed key doesn't exist, an invariant
is unsatisfiable, a referenced file is missing), STOP and report precisely - do not invent a
substitute value or author French copy.
</verification>

<success_criteria>
- Two commits exist on `cto/landing-v3`, in order: copy edit, then reseed record - each
  committed before its own verify step ran.
- Every key listed in `<interfaces>` carries its new value verbatim from
  `2026-09-07-contenu-landing-v3.json`; no other key in either locale file changed.
- Task 1's node invariant script passes in full (upsert keys, H2 split points, untouched
  blocks) before Task 2 starts.
- Local Supabase reflects the new copy: `content_section.hero.titre` matches, `pour-qui`
  has exactly 5 items with unchanged `cle`, `programme` has exactly 5 items (no orphan).
- SUMMARY.md records the row counts and states plainly that the hosted database was not
  touched.
- Final verification (lint, typecheck, build with reported `/` size, content:check with an
  unchanged key set, clean git status, correct branch) all pass, reported honestly.
</success_criteria>

<output>
Create `.planning/quick/260907-pnt-landing-v3-run-d-apply-v3-copy-to-fr-loc/260907-pnt-SUMMARY.md`
in Task 2 (per that task's own instructions) - do not create a second summary afterward.
Report the final verification results (all six checks, including the `/` prerender size and
the `content:check` placeholder list) directly at the end of execution.
</output>
