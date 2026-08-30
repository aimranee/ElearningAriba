---
phase: 02-site-public
plan: 06
subsystem: ui
tags: [next.js, server-components, supabase, zod, tailwind-v4]

# Dependency graph
requires:
  - phase: 02-site-public
    provides: "02-01: raised Card variant, Section/SectionHeader eyebrow+titleAccent, EmptyState on a floating surface"
  - phase: 02-site-public
    provides: "02-02: content_section/content_item tables, RLS, cookieless read client, getSection/getSectionItems query layer, formatHours"
provides:
  - Programme, Formation and À propos pages rewritten as async Server Components reading Supabase, zero locale-JSON runtime imports
  - Extended idempotent seed covering page-formation and page-a-propos content items (a gap left open by 02-02), plus eyebrow/titre_accent for all three internal-page sections and the programme-PDF button label
  - PUB-13 (delete/unpublish a row, page changes) proven end to end on the Programme page by toggling publie and rebuilding
affects: [02-11]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Two-sentence H2 (D-22) split into titre/titre_accent at seed time against the known signed string, not at render time — SectionHeader's own comment forbids a runtime split on '.'"
    - "Per-page Zod schemas validate content_item.donnees inline in the Server Component (moduleDonneesSchema, derouleDonneesSchema, fourniDonneesSchema) rather than adding new queries.ts exports, matching the plan's interface note"

key-files:
  created: []
  modified:
    - src/app/programme/page.tsx
    - src/app/formation/page.tsx
    - src/app/a-propos/page.tsx
    - scripts/seed-content.mjs

key-decisions:
  - "Extended scripts/seed-content.mjs (outside this plan's files_modified) to seed page-formation and page-a-propos content_item rows — 02-02-SUMMARY.md's own Next Phase Readiness flagged these two sections as titre/lead-only with zero items, which blocks Formation and A propos entirely; Rule 3 (blocking) applies"
  - "eyebrow text for the three internal pages is seeded from common.json nav labels (Programme/Formation/À propos) rather than invented copy — no per-page eyebrow string exists in the signed JSON bundles"
  - "A propos narrative blocks (parcours/legitimite/approche) have no separate title in the source JSON — content_item.titre carries the narrative sentence itself, matching the pre-existing page's own treatment (CardTitle rendering the full sentence)"
  - "Programme PDF button label seeded as its own content_item (cle=telecharger-pdf, no duree_heures) rather than a new content_section column, keeping the additive-migration constraint (D-26) satisfied with zero schema change"

patterns-established: []

requirements-completed: [PUB-08, PUB-09, PUB-10]

# Metrics
duration: 55min
completed: 2026-08-30
---

# Phase 2 Plan 6: Programme, Formation and À propos from Supabase Summary

**Three internal pages rebuilt as Server Components reading Supabase content rows through raised-card sections, after extending the 02-02 seed to cover two content sections it had left with zero items.**

## Performance

- **Duration:** ~55 min (including `npm ci` to provision this worktree's `node_modules`, and three DB-seed fix cycles before the page rewrites)
- **Tasks:** 3
- **Files modified:** 4 (3 pages + 1 seed script)

## Accomplishments
- Confirmed and closed a data gap left open by 02-02: `page-formation` and `page-a-propos` had `content_section` rows but zero `content_item` rows, which would have made Task 2 and Task 3 impossible as written
- Extended `scripts/seed-content.mjs`: modalités/déroulé/fourni items for Formation, three narrative-block items for À propos, an `eyebrow` value and a seed-time `titre`/`titre_accent` split (D-22) for all three internal-page sections, and the programme-PDF button label as its own item — verified idempotent across repeated `npm run content:seed` runs
- Rewrote `src/app/programme/page.tsx`: five modules as numbered `Card variant="raised"` blocks with objectifs/contenu lists, durations through `formatHours`, download-PDF and réserver CTAs from the database, `EmptyState tone="error"` on a failed read
- Rewrote `src/app/formation/page.tsx`: three alternating sections (modalités grid with the honest amber "À venir" tag on `statut="futur"`, déroulé ordered list, fourni block with prérequis/durée d'accès)
- Rewrote `src/app/a-propos/page.tsx`: three narrative blocks as raised cards, no invented credential
- Proved PUB-13 concretely on the Programme page: set one module's `publie=false`, rebuilt, confirmed the module disappeared from `.next/server/app/programme.html`; restored and rebuilt again to confirm it returned
- All three routes remain prerendered static with `revalidate = 3600` (D-38); `tsc` 0, `eslint` 0, `next build` 0, `content:check` still exits 1 (60 registry entries, unchanged)

## Task Commits

1. **Task 1: Programme page from the module rows** - `fb620bf` (feat)
2. **Task 2: Formation page from the format rows** - `941f96e` (feat)
3. **Task 3: À propos page from the trainer row** - `280bc0e` (feat)

**Preparatory fix commits (Rule 3, before Task 1):**
- `425aaf2` (fix) — seed missing page-formation/page-a-propos content items
- `73a06a0` (fix) — seed eyebrow + two-sentence title split
- `81a337d` (fix) — seed programme-PDF button label

## Files Created/Modified
- `src/app/programme/page.tsx` - async Server Component, `getSection`/`getSectionItems("page-programme")`, Zod-validated `donnees`, floating cards
- `src/app/formation/page.tsx` - async Server Component, `getSection`/`getSectionItems("page-formation")`, alternating default/band/default sections
- `src/app/a-propos/page.tsx` - async Server Component, `getSection`/`getSectionItems("page-a-propos")`, three narrative blocks
- `scripts/seed-content.mjs` - extended with formation/a-propos items, eyebrow, title split, PDF label item

## Decisions Made
See `key-decisions` in frontmatter.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Extended the seed to cover page-formation and page-a-propos content items**
- **Found during:** pre-Task-1 verification of the plan's data assumptions
- **Issue:** `02-02-SUMMARY.md`'s own "Next Phase Readiness" section flagged that `page-formation` and `page-a-propos` carried only a `content_section` row (titre/lead) with zero `content_item` rows — confirmed against the running local stack (`content_item` query for both `section_cle`s returned `[]`). Task 2 and Task 3 as written are unexecutable without this data.
- **Fix:** Added `pageFormationModaliteItems`, `pageFormationDerouleItem`, `pageFormationFourniItem` and `pageAProposItems` to `scripts/seed-content.mjs`, sourced verbatim from `formation.json`/`a-propos.json` (no re-authoring, D-25). Ran `npm run content:seed` twice to confirm idempotency (same 7 new rows both times).
- **Files modified:** `scripts/seed-content.mjs` (outside this plan's stated `files_modified`, justified by Rule 3's blocking-issue exception)
- **Verification:** direct Supabase query confirmed the 7 rows exist with the expected shape; `npm run build` prerenders `/formation` and `/a-propos` with real content
- **Committed in:** `425aaf2`

**2. [Rule 3 - Blocking] Seeded eyebrow and split the two-sentence title for the three internal-page sections**
- **Found during:** Task 1, first attempt to satisfy `eyebrow=`/`titleAccent=` acceptance criteria
- **Issue:** `content_section.eyebrow` and `content_section.titre_accent` were `null` for `page-programme`/`page-formation`/`page-a-propos` — D-22 (eyebrow → two-sentence H2 → lead) has no runtime-safe split point per `SectionHeader`'s own comment ("splitting on '.' in JavaScript would break on any abbreviation")
- **Fix:** Added a `splitTwoSentences` helper in the seed script that performs the split once, at seed time, against the known signed string; sourced `eyebrow` from `common.json` nav labels (already-signed chrome copy, not invented)
- **Files modified:** `scripts/seed-content.mjs`
- **Verification:** direct Supabase query confirmed `eyebrow`/`titre`/`titre_accent` values for all three sections; `grep -n "eyebrow="` and `grep -n "titleAccent="` both match in `programme/page.tsx`
- **Committed in:** `73a06a0`

**3. [Rule 3 - Blocking] Seeded the programme-PDF button label as a content item**
- **Found during:** Task 1, composing the download-PDF CTA
- **Issue:** the plan requires the label come from the database (D-24); no existing column or item carried it
- **Fix:** Added a `telecharger-pdf` item (no `duree_heures`, so it is excluded from the modules list by the existing null-filter) carrying `programme.telechargerPdf` verbatim
- **Files modified:** `scripts/seed-content.mjs`
- **Verification:** `programme.html` renders "Télécharger le programme en PDF" from the query result, not a hardcoded string
- **Committed in:** `81a337d`

---

**Total deviations:** 3 auto-fixed, all Rule 3 (blocking — the plan's own data assumptions were incomplete)
**Impact on plan:** All three were prerequisites for Task 2/Task 3 to be executable at all and for Task 1's D-22 criteria to pass. No scope creep beyond what the plan's own acceptance criteria required.

## Issues Encountered

**Acceptance-criteria grep false positive (verify-command literalism, not fixed).** Task 3's acceptance criteria include a language-agnostic regex intended to catch hardcoded French sentences (`grep -n "[a-zA-ZÀ-ÿ]\{4,\} [a-zA-ZÀ-ÿ]\{4,\} [a-zA-ZÀ-ÿ]\{4,\}" src/app/a-propos/page.tsx | grep -v "^\s*[0-9]*:\s*[/*]"`). It also matches ordinary TypeScript/English syntax with three consecutive ≥4-letter words separated by single spaces — e.g. `import common from "@/locales/fr/common.json";` (import/common/from), `export const revalidate = 3600;` (export/const/revalidate), a multi-line `/* */` comment's continuation line (not excluded by the filter, which only excludes lines whose content starts with `/` or `*`), and a Tailwind `className` string (`...items-center justify-center overflow-hidden...`). None of these are French sentences outside a JSX expression — they are code and utility classes required for the page to function. Per this session's environment_notes on verify-command literalism, the code was left in its natural shape rather than deformed (e.g. rewriting normal imports or Tailwind classes) to dodge this grep. This acceptance-criteria line is not part of the task's `<verify><automated>` block (which only runs `next build && next lint && ! grep locales-import && ! grep variant=outline`, all of which pass), so it does not gate the task's automated verification — it is flagged here as a criteria-writing defect in the plan itself.

## User Setup Required

None for local development — the local stack carries every migration and the extended seed ran against it directly (verified idempotent, two consecutive runs).

**External/CIO action still owed:** the hosted Supabase projects need `npm run content:seed` re-run (no new migration — only new/changed rows in already-migrated tables) so the hosted content matches local. This is data, not schema, so it does not need the same migration-push sequence 02-02 flagged; it can run whenever the CIO next seeds hosted content.

## Next Phase Readiness

- PUB-08, PUB-09 and PUB-10 are now provably met: a visitor reading each of the three pages finds real database-sourced content, not JSON-bundle copy
- The `page-formation`/`page-a-propos` data gap flagged at the end of 02-02 is closed — any later plan reading those sections will find real items, not an empty array
- `formatHours`, `Card variant="raised"`, `SectionHeader eyebrow/titleAccent`, and `EmptyState tone="error"` are now each consumed on three additional routes, beyond the landing page's own eventual re-authoring (02-09/02-10)
- The whole-phase verification line `grep -rn "locales/fr/\(landing\|programme\|formation\|a-propos\)\.json" src/app/` still matches one hit — `src/app/page.tsx` (the landing page) still imports `landing.json`. That file is out of this plan's `files_modified` and is explicitly owned by plans 02-09/02-10 per the phase pattern map; not a regression introduced here.

## Unresolved questions
None.

## Self-Check: PASSED

All three modified page files exist on disk with the expected content; `scripts/seed-content.mjs` extension exists and was run successfully (idempotent, verified twice per change). All six commit hashes (`425aaf2`, `73a06a0`, `81a337d`, `fb620bf`, `941f96e`, `280bc0e`) are present in `git log`.

---
*Phase: 02-site-public*
*Completed: 2026-08-30*
