---
phase: 02-site-public
plan: 09
subsystem: ui
tags: [next.js, server-components, supabase, tailwind-v4, base-ui-accordion]

# Dependency graph
requires:
  - phase: 02-site-public
    provides: "02-01: raised Card variant, Section/SectionHeader eyebrow+titleAccent, EmptyState on a floating surface, --ease-brand"
  - phase: 02-site-public
    provides: "02-02: content_section/content_item tables, cookieless read client, getSection/getSectionItems/getModules query layer, formatHours"
  - phase: 02-site-public
    provides: "02-05: Reveal primitive, magnetic Button island, motion-island precedent"
  - phase: 02-site-public
    provides: "02-08: /programme.pdf route, so the download CTA is a live link, not disabled"
provides:
  - PourQui, Competences and ProgrammeAccordion Server Components, all reading Supabase, mounted on the landing page between the figures band and the remaining Lot 1 sections
  - Five floating profil tiles (pour-qui) contributing to AC-1's eleven-card floating-surface count
  - The competency picto column and the eyebrow/titre_accent split extended to the three landing sections that were missing them (pour-qui, competences, programme), closing the same class of seed gap 02-06 found on the internal pages
affects: [02-10, 02-11]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Accordion defaultValue={[modules[0].id]} opens the first item without a second accordion implementation (D-42) — value keyed to the module's own id, not a positional index"
    - "Landing-section eyebrow/titre_accent seeded the same way 02-06 seeded the three internal pages: literal maquette copy added to landing.json, split at seed time via the existing splitTwoSentences helper, never split at render time"

key-files:
  created:
    - src/components/sections/pour-qui.tsx
    - src/components/sections/competences.tsx
    - src/components/sections/programme-accordion.tsx
  modified:
    - src/app/page.tsx
    - src/locales/fr/landing.json
    - scripts/seed-content.mjs

key-decisions:
  - "Extended scripts/seed-content.mjs (outside this plan's declared files_modified) to seed eyebrow and a seed-time two-sentence split for content_section rows pour-qui/competences/programme — none of the three carried eyebrow/titre_accent before this plan, and SectionHeader's own comment forbids a runtime split. Same Rule-3 pattern 02-06 used for the three internal pages, sourced from the same three literal eyebrow strings already visible in the approved maquette (Pour qui / Ce que vous allez apprendre / Programme détaillé)."
  - "Added an eyebrow field to landing.json's pourQui/competences/programme objects (verbatim maquette text) so the seed script has a JSON source to read from rather than inventing copy inline in the script itself, consistent with the file's own header comment ('nothing here is authored copy')"
  - "Reservation CTA in programme-accordion.tsx reuses common.actions.reserver (\"Réserver\") rather than the maquette's own \"Prendre RDV\" label — matches the existing /programme page's identical CTA (02-06), no new translation key invented for a second wording of the same action"

requirements-completed: [PUB-02, PUB-03, PUB-04]

# Metrics
duration: ~55min
completed: 2026-08-30
---

# Phase 2 Plan 9: Pour qui, competences and programme accordion Summary

**Landing sections two through four — five floating profil tiles, a six-row competency band, and a five-module accordion with a live PDF download — all rebuilt as Server Components reading Supabase, replacing the Lot 1 landing.json markup. Tasks 1-2 complete and verified; Task 3 (mount + human visual review) is executed for its automatable half — the mount, the build, and every grep/prerendered-HTML assertion — with the founder-facing visual review itself deferred to plan 02-11 per this phase's established batching precedent.**

## Performance

- **Duration:** ~55 min (including `npm install`/`.env.local` provisioning for this fresh worktree, and closing a seed-data gap before Task 1)
- **Tasks:** 3 of 3 (Task 3's automated verification ran; its `checkpoint:human-verify` visual review did not — see Unresolved questions)
- **Files modified:** 6 (3 created, 3 modified)

## Accomplishments

- Closed a seed-data gap discovered before Task 1: `content_section` rows for `pour-qui`, `competences` and `programme` carried only `titre` (+`lead` on `pour-qui`) — no `eyebrow`, no `titre_accent`. D-22 (eyebrow → two-sentence H2 → lead) needs both. Extended `landing.json` with the three literal maquette eyebrow strings and `scripts/seed-content.mjs` with the same seed-time `splitTwoSentences` call 02-06 used for the internal pages; ran `npm run content:seed` and confirmed the three rows now carry `eyebrow`/`titre`/`titre_accent` as expected.
- Built `src/components/sections/pour-qui.tsx`: five `Card variant="raised"` profil tiles from `getSectionItems("pour-qui")`, asymmetric six-column grid (2/2/2/3/3) collapsing to two columns below 1000px and one below 640px, gradient icon tile with `group-hover` scale/rotate, picto resolved from the row's own `picto` column.
- Built `src/components/sections/competences.tsx`: six competency rows from `getSectionItems("competences")` on a `--lav2` tinted band, numbered badge, picto mark where present, translateY hover lift to `--shadow-3`.
- Built `src/components/sections/programme-accordion.tsx`: five modules from `getModules()` through the reused Lot 1 `Accordion` (no second accordion), first module open via `defaultValue`, `formatHours` duration pill hidden below 640px, ghost PDF-download CTA now linking the live `/programme.pdf` route (02-08), primary reservation CTA carrying `data-magnetic="true"`.
- Mounted all three in `src/app/page.tsx` between `<StatsBand />` and the remaining Lot 1 sections, removed the `landing.json` reads and the positional `COMPETENCE_PICTOS` array for these three sections, kept `formatModalites`/`confiance`/`faq`/`ctaFinal` untouched for plan 02-10.
- `npm run build` exits 0, `/` still prerendered static at `revalidate: 1h`; `tsc`/`eslint` both clean; phase-level `cubic-bezier` count is still 1.

## Task Commits

1. **Task 1: « Pour qui » — five floating profil tiles** — `1940ce6` (feat)
2. **Task 2: « Ce que vous allez apprendre » and « Programme détaillé »** — `9898594` (feat)
3. **Task 3: Mount the three sections and confirm the cards float** — `23768cc` (feat) — mount + automated verification only; visual review not executed, see below

**Preparatory fix commit (Rule 3, before Task 1):**
- `36375bd` (fix) — seed eyebrow + two-sentence title split for pour-qui/competences/programme

## Files Created/Modified

- `src/components/sections/pour-qui.tsx` — async Server Component, `getSection`/`getSectionItems("pour-qui")`, five raised-card tiles
- `src/components/sections/competences.tsx` — async Server Component, `getSection`/`getSectionItems("competences")`, tinted-band rows
- `src/components/sections/programme-accordion.tsx` — async Server Component, `getSection`/`getModules`/`getSectionItems("programme")`, reused Accordion, PDF/reservation CTAs
- `src/app/page.tsx` — mounts the three new sections, drops the three now-obsolete `landing.json` blocks and `COMPETENCE_PICTOS`
- `src/locales/fr/landing.json` — added `eyebrow` to `pourQui`/`competences`/`programme`
- `scripts/seed-content.mjs` — seeds `eyebrow`/`titre_accent` for the three landing sections via the existing `splitTwoSentences` helper

## Decisions Made

See `key-decisions` in frontmatter.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Seeded eyebrow and split the two-sentence title for pour-qui, competences and programme sections**
- **Found during:** pre-Task-1 verification of the plan's data assumptions (Task 1's own acceptance criteria require `eyebrow=` and `titleAccent=` to be present)
- **Issue:** `content_section` rows for `pour-qui`/`competences`/`programme` carried only `titre` (`pour-qui` also had `lead`) — `eyebrow` and `titre_accent` were both `null`. Confirmed against the running local stack via a direct Supabase query before writing any component. `SectionHeader`'s own comment forbids a runtime split on the sentence boundary.
- **Fix:** Added the three literal maquette eyebrow strings (`Pour qui`, `Ce que vous allez apprendre`, `Programme détaillé`) to `landing.json`, then extended `scripts/seed-content.mjs`'s `upsertSections` call for these three rows to pass `eyebrow` and the existing `splitTwoSentences(...)` result for `titre`/`titre_accent` — the identical pattern 02-06 used for `page-programme`/`page-formation`/`page-a-propos`.
- **Files modified:** `src/locales/fr/landing.json`, `scripts/seed-content.mjs`
- **Verification:** `npm run content:seed` run once, confirmed idempotent shape via a direct Supabase query returning the expected `eyebrow`/`titre`/`titre_accent` for all three rows; `grep -n "eyebrow="` and `grep -n "titleAccent="` both match in all three new component files.
- **Committed in:** `36375bd`

---

**Total deviations:** 1 auto-fixed (Rule 3, blocking — the plan's own data assumptions were incomplete, same class of gap 02-06 found and fixed for the internal pages)
**Impact on plan:** Required for Task 1's own stated acceptance criteria to be satisfiable at all. No scope creep — no new business copy was invented, only literal maquette text already visible in the approved HTML and already used verbatim elsewhere in this plan's task text.

## Issues Encountered

None beyond the seed-data gap documented above.

## User Setup Required

None for local development — the local stack carries every migration and the extended seed ran against it directly (idempotent, confirmed via direct query).

**External/CIO action still owed (unchanged from 02-02/02-06):** hosted Supabase projects need `npm run content:seed` re-run so hosted content matches local — data only, no new migration.

## Next Phase Readiness

- PUB-02, PUB-03 and PUB-04 are now provably sourced from Supabase on the landing page: five profil tiles, six competencies, five accordion modules with a live PDF download.
- `src/app/page.tsx` now imports only `Accordion`/`AccordionItem`/`AccordionHeader`/`AccordionTrigger`/`AccordionPanel` for the FAQ block and `Card`/`CardHeader`/`CardTitle`/`CardContent`/`CardDescription`/`Badge`/`Button` for the `formatModalites`/`confiance`/`ctaFinal` blocks plan 02-10 owns — nothing from this plan's three sections remains inline.
- The whole-phase verification line `grep -rn "locales/fr/\(landing\|programme\|formation\|a-propos\)\.json" src/app/` — `src/app/page.tsx` still imports `landing.json` for the three sections plan 02-10 has not yet rebuilt (`formatModalites`, `confiance`, `faq`, `ctaFinal`); that import is not a regression, it is exactly the surface 02-10 is scoped to close.
- **Task 3's `checkpoint:human-verify` visual review was NOT executed.** Per this phase's established precedent (02-04's deferred header/nav review, 02-05's deferred hero review, both documented in `.planning/STATE.md` Blockers/Concerns), and per this session's explicit operating instructions, the automatable half of Task 3 (mount, `npm run build`, every grep and prerendered-HTML assertion in the plan's own `<acceptance_criteria>`/`<verify>` blocks) ran and passed. The seven manual checks in `<how-to-verify>` — profil-card hover lift and shadow depth, the lavender band's visual isolation against the transparent sections either side of it, the eyebrow/two-sentence-gradient heading pattern read live, the first accordion module's smooth expand and its "3 h" pill, and the PDF download actually opening — are unconfirmed by a human. Whoever executes plan 02-11's batched review must walk all seven.

## Unresolved questions

- Does plan 02-09's Task 3 founder review get folded into plan 02-11's batch, or does it need a separate pass? Same open question 02-04/02-05 left; not resolved here, only deferred consistently with them.

## Self-Check: PASSED

All three created files exist on disk (`src/components/sections/pour-qui.tsx`, `competences.tsx`, `programme-accordion.tsx`); `src/app/page.tsx`, `src/locales/fr/landing.json` and `scripts/seed-content.mjs` carry the described changes. `git log --oneline -5` shows `23768cc`, `9898594`, `1940ce6`, `36375bd` present in the worktree branch history. Final `npm run build` exits 0 with `/` listed `○ (Static)` at `revalidate: 1h`; `tsc`/`eslint` both clean.

---
*Phase: 02-site-public*
*Completed (Tasks 1-2, Task 3 automated portion): 2026-08-30 — Task 3 visual review pending*
