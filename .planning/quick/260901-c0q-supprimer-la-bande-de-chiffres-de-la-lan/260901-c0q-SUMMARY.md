---
status: complete
---

# Quick Task 260901-c0q — Summary

Removed the stats band section from the landing page per the founder's
2026-09-01 decision (all four figures are restated elsewhere on the page).

## Commits

- `d061cbe`: #fix: remove stats band section from landing
- `323bfe3`: #fix: remove statsBand locale block
- `9ad7459`: docs: record 2026-09-01 stats band removal in D-03 and UI-SPEC

## Key files

- `src/app/page.tsx` — StatsBand import/element removed, `<Hero />` directly followed by `<PourQui />`
- `src/components/sections/stats-band.tsx` — deleted
- `src/components/motion/count-up.tsx` — deleted (grep-confirmed no consumer outside stats-band.tsx before deletion)
- `src/locales/fr/common.json` — `statsBand` block (4 keys) removed, sole-consumer verified, valid JSON confirmed
- `.planning/phases/02-site-public/02-CONTEXT.md` — D-03 rewritten (dated 2026-09-01 removal, rationale, no signed requirement affected)
- `.planning/phases/02-site-public/02-UI-SPEC.md` — 26academy-style-bands paragraph rewritten (17h total still computed/shown elsewhere)

## Verification

`npm run lint`, `npm run typecheck`, `npm run build` all exit 0. 14 routes
(13 static + `/api/contact` dynamic), matching prior baseline.

`.next/server/app/index.html`:
- Zero occurrences of "modules progressifs", "compétences pratiquées", "prérequis SAP exigé"
- "de formation live", "Pour qui", and the Format et modalités summary text ("5 modules · 17 h de formation live") all still present

## Notes

`src/lib/i18n/fr.ts` (formatNumber/formatHours), `cta-final.tsx`,
`format-modalites.tsx`, `competences.tsx`, `pour-qui.tsx`, `hero.tsx`: none
touched. No `tone=` prop changed on any section — Hero and PourQui both
transparent in sequence is the intended, approved outcome of this run.

Nothing pushed. Stayed on branch `gsd/phase-02-site-public` throughout.
