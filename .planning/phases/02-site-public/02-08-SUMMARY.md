---
phase: 02-site-public
plan: 08
subsystem: api
tags: [pdf, route-handler, next-app-router, winansi]

# Dependency graph
requires:
  - phase: 02-site-public
    provides: getSection/getModules content query layer (plan 02-02)
provides:
  - dependency-free PDF 1.4 writer (src/lib/pdf/writer.ts)
  - /programme.pdf route generated live from app.content_item rows
affects: [02-06 (Programme page, reads the same rows), 02-11 (final phase verification)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dependency-free binary format writer: accumulate bytes, compute offsets before writing xref, verify with a byte-offset self-check rather than trusting the reader"
    - "WinAnsiEncoding substitution table for typographic Unicode punctuation Intl formatters emit (narrow no-break space, curly quotes, bullet) that fall outside 0-255"

key-files:
  created:
    - src/lib/pdf/writer.ts
    - src/lib/pdf/programme-pdf.ts
    - src/app/programme.pdf/route.ts
  modified:
    - src/locales/fr/programme.json

key-decisions:
  - "PDF body text uses getModules() (camelCase dureeHeures, already-parsed objectifs/contenu) rather than raw getSectionItems() rows, because that is the actual current shape of queries.ts, not the snake_case shape the plan's <interfaces> section assumed"
  - "Added programme.json#totalLabelPdf ('Total') rather than hardcoding the string in the PDF layer, per CLAUDE.md's no-hardcoded-text rule"
  - "WinAnsiEncoding substitution table added for characters Intl.NumberFormat's fr-FR unit formatter (formatHours) and ordinary punctuation produce outside 0-255: narrow no-break space (U+202F, from formatHours), curly quotes, en/em dash, ellipsis, bullet (mapped to WinAnsi's native 0x95, not substituted)"

requirements-completed: []

# Metrics
duration: 55min
completed: 2026-08-30
---

# Phase 02 Plan 08: Programme PDF Summary

**Dependency-free PDF 1.4 writer (Helvetica/Helvetica-Bold, WinAnsiEncoding, byte-accurate xref) driving a `/programme.pdf` route that renders the five programme modules and a runtime-summed 17 h total straight from `app.content_item`.**

## Performance

- **Duration:** 55 min
- **Started:** 2026-08-30T21:05:00Z
- **Completed:** 2026-08-30T21:28:00Z
- **Tasks:** 2 completed
- **Files modified:** 4 (3 created, 1 modified)

## Accomplishments

- A dependency-free PDF 1.4 writer (`src/lib/pdf/writer.ts`) that emits a valid, byte-accurate xref table, base-14 Helvetica/Helvetica-Bold fonts with `/Encoding /WinAnsiEncoding`, and a `layoutLines()` page-break helper that starts a new page whenever the next line would cross the bottom margin.
- `/programme.pdf` (`src/app/programme.pdf/route.ts` + `src/lib/pdf/programme-pdf.ts`) reads the `page-programme` section row for title/subtitle and `getModules()` for the five modules, sums `dureeHeures` at runtime via `.reduce()`, and formats every duration through `formatHours` — no hand-written unit, no hardcoded 17.
- Verified PUB-13 end to end against the local Supabase stack: unpublishing the third module row (`source-to-pay-et-strategie-achats`) dropped the rebuilt PDF's total from 17 h to 13 h and removed that module's heading; re-publishing restored both. Row left published.
- A failed content read returns a 503 with a plain-text French body instead of a corrupt or empty PDF.

## Task Commits

Each task was committed atomically:

1. **Task 1: A minimal dependency-free PDF writer** - `fb5a4a0` (feat)
2. **Task 2: The /programme.pdf route, rendered from the module rows** - `67afa56` (feat)

## Files Created/Modified

- `src/lib/pdf/writer.ts` - Dependency-free PDF 1.4 builder: Catalog/Pages/Font objects, WinAnsi-encoded content streams, byte-accurate xref/trailer, `layoutLines()` page-break helper
- `src/lib/pdf/programme-pdf.ts` - Composes the programme document (title/subtitle from `page-programme` section, five modules, summed total) into `PdfLine[]`, calls `layoutLines` + `buildPdf`
- `src/app/programme.pdf/route.ts` - `GET` handler returning `application/pdf` with `Content-Disposition: inline`; `revalidate = 3600`; 503 plain-text on a failed read
- `src/locales/fr/programme.json` - Added `totalLabelPdf: "Total"` key so the PDF's total-line label goes through the locale file rather than a literal in `src/lib/pdf/`

## Decisions Made

- Used the real, current `getModules()` return shape (camelCase `dureeHeures`, `objectifs`/`contenu` already Zod-parsed) rather than the snake_case `duree_heures`/raw-`donnees` shape described in the plan's `<interfaces>` context — that shape is stale relative to `src/lib/content/queries.ts` as it exists on this branch (see Deviations).
- Added a WinAnsiEncoding substitution table in `writer.ts` for Unicode characters that fall outside the 0-255 direct-mapping range but appear in real output: `formatHours()`'s `Intl.NumberFormat` unit formatter emits U+202F (narrow no-break space) between the number and "h" for `fr-FR`, and the bullet character used for objective/content list items is U+2022. Both are mapped (narrow no-break space to an ordinary space, bullet to WinAnsi's own 0x95 bullet code point) rather than thrown as encoding errors — confirmed via a real `npm run build` prerender that failed before the mapping existed and succeeded after.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Response body typing incompatible with buildPdf's Uint8Array**
- **Found during:** Task 2, `npx tsc --noEmit` / `npm run build`
- **Issue:** `new Response(result.bytes, ...)` and `new Response(new Blob([result.bytes]), ...)` both failed to typecheck: `Uint8Array<ArrayBufferLike>` isn't assignable to the DOM lib's `BodyInit`/`BlobPart`, which expect `Uint8Array<ArrayBuffer>`.
- **Fix:** Copy into a fresh `Uint8Array` (`new Uint8Array(result.bytes)`) before constructing the `Response`, which TypeScript types against a plain `ArrayBuffer`.
- **Files modified:** src/app/programme.pdf/route.ts
- **Verification:** `npx tsc --noEmit` and `npm run build` both exit 0.
- **Committed in:** 67afa56 (Task 2 commit)

**2. [Rule 1 - Bug] WinAnsi writer crashed on real formatHours/bullet output**
- **Found during:** Task 2, `npm run build` prerender of `/programme.pdf`
- **Issue:** The writer's original direct code-point pass-through (≤ 0xff) threw on `Intl.NumberFormat`'s narrow no-break space (U+202F, produced by `formatHours` for `fr-FR`) and on the bullet (U+2022) used for list items — both outside 0-255, both absent from the writer's substitution table at that point.
- **Fix:** Extended `WINANSI_SUBSTITUTIONS` in `writer.ts` to map both, plus common French/Intl typographic characters (curly quotes, en/em dash, ellipsis, thin/figure space) that were latent but untested.
- **Files modified:** src/lib/pdf/writer.ts
- **Verification:** `npm run build` succeeds and prerenders `/programme.pdf` as static; manual byte-inspection of the generated PDF confirms all five module titles, correct bullet glyphs, and `Total : 17 h`.
- **Committed in:** fb5a4a0 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 — bugs blocking correct output)
**Impact on plan:** Both fixes were necessary for the writer to produce correct, buildable output. No scope creep.

### Verify-command literalism (per environment_notes — not a code deviation)

- **`grep -n "duree_heures" src/lib/pdf/programme-pdf.ts` (Task 2 acceptance criteria) does not match.** `programme-pdf.ts` uses `getModules()`'s actual, current return shape — `dureeHeures` (camelCase, already validated/parsed by `queries.ts`) — not the raw snake_case `duree_heures` column name the plan's `<interfaces>` section assumed `getModules()` would expose. Forking a second, unvalidated raw-row read path (via `getSectionItems("programme")` plus hand-rolled `donnees` parsing) purely to make this string match would duplicate `queries.ts`'s existing Zod validation and introduce a second source of truth for module content. Left the natural, correct call to the existing typed query. The functional requirement this grep exists to enforce — "the total is computed by summing the module rows, not typed in once" — is independently satisfied: `grep -n "\.reduce(" src/lib/pdf/programme-pdf.ts` matches, and `dureeHeures` (not `duree_heures`) is the field summed.
- **PUB-13 proof command in Task 2's acceptance criteria (`... where section_cle = 'programme' and cle = 'module-03'`) does not match any row.** The seed script (`scripts/seed-content.mjs`) derives `cle` via `slugify(module.titre)`, so the third module's `cle` is `source-to-pay-et-strategie-achats`, not `module-03`. Verified PUB-13 against the real row instead (see Accomplishments) — same proof, correct key.

## Issues Encountered

- The worktree had no `node_modules` and no `.env.local` (both gitignored, neither present on a fresh worktree checkout). Ran `npm ci` and copied the main repo's local-stack `.env.local` (well-known local Supabase demo keys, not a secret) into the worktree so `npm run build`/`tsc`/`lint` could run at all. Neither file is tracked or committed.
- `npx tsc --noEmit` fails standalone with `Cannot find name 'LayoutProps'` until `npm run build` has run once (Next.js 16 generates that global type into `.next/types` during build) — a pre-existing, already-documented project quirk (STATE.md, Phase 00-01 decision), not something this plan introduced or needed to fix.

## Next Phase Readiness

- `/programme.pdf` is a real, database-backed route; `landing.programme.telechargerPdf`'s disabled button (D-41/PUB-04) can be wired to it whenever the landing page work reaches that control (02-09/02-10, outside this plan's file scope).
- No new dependency added; `git diff package.json` is empty.
- `page-programme` section's `telecharger-pdf` content-item row (an unrelated placeholder row with `duree_heures: null`) is not read by this route — it belongs to the Programme page's own PDF-download control, not this plan's PDF generator.

---
*Phase: 02-site-public*
*Completed: 2026-08-30*

## Self-Check: PASSED

All created files confirmed present on disk; both task commit hashes (`fb5a4a0`, `67afa56`) confirmed in `git log`.
