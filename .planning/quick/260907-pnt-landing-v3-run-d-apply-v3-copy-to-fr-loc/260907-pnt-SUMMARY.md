---
task: 260907-pnt
type: quick
subsystem: content
tags: [i18n, locales, supabase, seed]

key-files:
  modified:
    - src/locales/fr/landing.json
    - src/locales/fr/common.json

key-decisions: []

duration: 10min
completed: 2026-09-07
---

# Quick Task 260907-pnt: Landing v3 Run D (copy + local reseed) Summary

**Applied the signed v3 copy rewrite to `landing.json`/`common.json` (11 keys, same facts) and reseeded the local Supabase content tables from it.**

## Performance

- **Duration:** ~10 min
- **Tasks:** 2
- **Files modified:** 3 (2 locale files + this summary)

## Accomplishments
- All 11 listed keys (hero, pour-qui, competences, programme, format-modalites, confiance, cta-final in `landing.json`; `hero.chips` in `common.json`) now carry the exact v3 copy, verbatim from the signed content JSON.
- Node invariant script confirmed 47/47 checks pass: upsert-key fields (`picto`, `titre`, `duree`) byte-identical, all six H2 titles retain their `". "` split point, `hero.titre` retains its period plus "SAP Ariba", and every untouched block (`faq.*`, `confiance.items/formateur/preuve`, `hero.preuve/flux`, `ctaFinal.etapes`, `formatModalites.apercu/items[1..5]`, `competences.items[2..4]`) is unchanged.
- `npm run content:seed` ran clean against the local stack; database rows confirmed via anon-key curl reads (not the JSON) to reflect the new copy with no orphaned rows.

## Task Commits

1. **Task 1: Apply v3 copy to landing.json and common.json** - `dfd3e7f` (feat)
2. **Task 2: Reseed local Supabase and record the result** - see this commit (docs)

## Files Created/Modified
- `src/locales/fr/landing.json` - 9 keys rewritten with v3 copy (hero, pourQui, competences, programme, formatModalites, confiance, ctaFinal)
- `src/locales/fr/common.json` - `hero.chips` extended 2→3 entries
- `.planning/quick/260907-pnt-.../260907-pnt-SUMMARY.md` - this file

## Local Database Verification (post-`content:seed`)

Three anon-key `curl` reads against `127.0.0.1:54321` with `Accept-Profile: app`:

1. `content_section?cle=eq.hero` → 1 row, `titre` = `"En direct, avec un expert. Maîtrisez SAP Ariba"` (matches new `landing.json#hero.titre`).
2. `content_item?section_cle=eq.pour-qui` → exactly 5 rows, `cle` values unchanged (`acheteur`, `category-manager`, `supply-chain`, `consultant`, `etudiant`), `description` matches the new copy, `donnees.accroche` matches the new accroches for indices 0-2 and is present (unchanged) for indices 3-4.
3. `content_item?section_cle=eq.programme` → exactly 5 rows, `cle` values (`slugify(titre)`) unchanged — no orphan row created.

**The hosted database is NOT touched by this run.** The CIO reseeds the hosted project(s) separately via their own handoff, per existing STATE.md blocker notes on hosted content staleness.

## Decisions Made
None - followed plan as specified.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## Next Phase Readiness
Local landing copy and local database now hold the full v3 rewrite. Hosted reseed remains a separate CIO-owned step (unchanged from prior STATE.md notes on stale hosted content).

---
*Task: 260907-pnt*
*Completed: 2026-09-07*
