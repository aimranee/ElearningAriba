---
quick_id: 260901-iag
status: complete
commit: f35185c
---

# Summary — 260901-iag

## Change

Fixed `tone=` prop in 3 landing section files to restore strict transparent/tinted
alternation (D-21). Two occurrences each (error-state render + main render):

- `src/components/sections/programme-accordion.tsx`: `tone="default"` → `tone="band"` (lines 34, 49)
- `src/components/sections/format-modalites.tsx`: `tone="band"` → `tone="default"` (lines 26, 44)
- `src/components/sections/confiance.tsx`: `tone="default"` → `tone="band"` (lines 34, 47)

No other files touched. No other values changed (colors, tokens, classes, shadows,
content, durations, grid all untouched).

## Verification

- `git diff --stat` before commit: only 3 files, 4 lines changed each (2 insertions/2 deletions) — confirmed scope.
- `npm run content:seed`: done.
- `npm run lint`: exit 0.
- `npm run typecheck`: exit 0.
- `npm run build`: exit 0.
- Route table: 13 static (○) routes (`/`, `/_not-found`, `/a-propos`, `/agenda`,
  `/connexion`, `/contact`, `/espace`, `/formation`, `/inscription`, `/paiement`,
  `/programme`, `/programme.pdf`, `/reservation`) + exactly 1 dynamic (ƒ) route
  (`/api/contact`). `/programme.pdf` is static, confirming content was seeded correctly.
- `.next/server/app/index.html`: 0 occurrences of "pas disponible", 0 occurrences of "erreur".
- Tone sequence grep across the 7 landing sections, in `src/app/page.tsx` render order:
  `pour-qui=band, competences=default, programme-accordion=band, format-modalites=default,
  confiance=band, cta-final=default, faq=band` — matches band/default/band/default/band/default/band exactly.

## Commit

`f35185c` — "#fix: restore strict tone alternation across landing sections" (3 files, no other artifacts staged).
