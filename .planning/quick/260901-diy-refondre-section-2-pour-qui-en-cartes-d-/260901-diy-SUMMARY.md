---
phase: quick
plan: 260901-diy
subsystem: ui
tags: [nextjs, react, tailwind, supabase, jsonb, zod, wcag]

requires:
  - phase: 02-site-public
    provides: pour-qui.tsx/competences.tsx landing sections, content_item schema
provides:
  - Five accent-mapped intention cards replacing the "Pour qui" tile grid
  - profilDonneesSchema jsonb boundary validation for content_item.donnees.accroche
  - Three AA-passing ink tokens (--blue-ink, --mint-ink, --amber-ink)
  - D-49/D-50 phase decisions recorded
affects: [02-site-public]

tech-stack:
  added: []
  patterns:
    - "Inverse 0fr/1fr grid pair for reserved-height hover reveal"
    - "jsonb boundary validation with non-throwing safeParse + silent degradation"

key-files:
  created: []
  modified:
    - src/locales/fr/landing.json
    - scripts/seed-content.mjs
    - src/lib/content/queries.ts
    - src/app/globals.css
    - src/components/sections/pour-qui.tsx
    - src/components/sections/competences.tsx
    - .planning/phases/02-site-public/02-CONTEXT.md
    - .planning/phases/02-site-public/02-UI-SPEC.md

key-decisions:
  - "D-49: Pour qui rebuilt as intention cards (accroche headline, profile name in footer, hover-reveal description, tone=band)"
  - "D-50: extend D-05 token set with --blue-ink/--mint-ink/--amber-ink (measured AA contrast fix)"

patterns-established:
  - "Accent decorates (pastille/wash), AA-passing ink variant reads (card body text)"

requirements-completed: [PUB-02]

duration: 25min
completed: 2026-09-01
---

# Quick Task 260901-diy: Pour qui intention cards Summary

**Rebuilt "Pour qui" as five accent-mapped intention cards with first-person accroche headlines, hover-reveal descriptions via reserved-height inverse grid, and new AA-passing ink tokens.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-09-01T08:40:00Z
- **Completed:** 2026-09-01T09:05:00Z
- **Tasks:** 5
- **Files modified:** 8

## Accomplishments
- Five profile cards now open on a signed first-person accroche, with profile name moved to footer as `/programme` link
- Hover/focus reveals description under a reserved-height two-block inverse-grid technique — row height never shifts
- Three new AA-passing ink tokens (`--blue-ink`, `--mint-ink`, `--amber-ink`) fix the measured contrast failures of `--blue`/`--mint`/`--amber` as card-body ink
- Section tone flip: "Pour qui" → `band`, Competences → `default`, preserving alternation
- `02-CONTEXT.md`/`02-UI-SPEC.md` updated with D-49/D-50

## Task Commits

1. **Task 1: Content contract — locale, seed, zod schema, ink tokens** - `88e5591` (feat)
2. **Task 2: Re-seed local content** - (no commit — DB-only, verified via REST query)
3. **Task 3: Rebuild pour-qui.tsx; flip competences.tsx tone** - `96960ad` (feat)
4. **Task 4: Record D-49/D-50 decisions** - `eab031b` (docs)
5. **Task 5: Full verification chain** - no code change (verification only)
6. Housekeeping: deferred-items note - `f360f6c` (docs)

## Files Created/Modified
- `src/locales/fr/landing.json` - added `accroche` to each of the five `pourQui.profils` objects
- `scripts/seed-content.mjs` - `profilItems` mapping now includes `donnees: { accroche }`
- `src/lib/content/queries.ts` - exported `profilDonneesSchema` (non-throwing jsonb boundary validation)
- `src/app/globals.css` - added `--blue-ink`/`--mint-ink`/`--amber-ink` after `--amber`
- `src/components/sections/pour-qui.tsx` - rebuilt as five `Link`-wrapped `Card` intention cards
- `src/components/sections/competences.tsx` - tone flipped `band` → `default` (both occurrences)
- `.planning/phases/02-site-public/02-CONTEXT.md` - appended D-49/D-50
- `.planning/phases/02-site-public/02-UI-SPEC.md` - added paragraph after "Pour qui" structure entry

## Decisions Made
- D-49 (founder): Pour qui → intention cards, accroche headline, profile name to footer, hover-reveal description, `/programme` link, tone=band (Competences → default)
- D-50 (CTO): extend D-05 token set with three AA-passing darkened ink variants; accent decorates, ink reads

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `profil.titre` typed `string | null`, not `string` as the plan's interface note stated**
- **Found during:** Task 3 (tsc --noEmit)
- **Issue:** `ContentItem.titre` from `Database["app"]["Tables"]["content_item"]["Row"]` is `string | null`, not `string`. Using it directly in the `aria-label` ternary produced `TS2322` (Link's `aria-label` requires `string | undefined`, not `string | null`).
- **Fix:** Introduced `const titre = profil.titre ?? ""` and used it everywhere `profil.titre` was referenced (aria-label, footer span, accroche fallback), preserving the plan's silent-degradation intent.
- **Files modified:** `src/components/sections/pour-qui.tsx`
- **Verification:** `npx tsc --noEmit -p tsconfig.json` clean (only the pre-existing, unrelated `layout.tsx` error remains)
- **Committed in:** `96960ad` (Task 3 commit)

**2. [Rule 3 - Blocking] Worktree had no local `node_modules`, so `npm run build` (Turbopack) failed to resolve the `next` package**
- **Found during:** Task 5 (verification chain)
- **Issue:** This worktree checkout had no `node_modules` of its own; Node module resolution fell back to the parent repo's `node_modules` (works for `tsc`/`eslint`), but Turbopack's build refuses to resolve `next` outside the configured `turbopack.root` filesystem boundary — a plain symlink/junction to the parent's `node_modules` was explicitly rejected by Turbopack for the same reason ("points out of the filesystem root").
- **Fix:** Ran `npm ci --no-audit --no-fund` inside the worktree to materialize a real local `node_modules` from the existing `package-lock.json` (no new/different packages — the exact locked set).
- **Files modified:** none tracked (`node_modules/` is git-ignored)
- **Verification:** `npm run build` exits 0, 14 routes reported (13 static + `/api/contact` dynamic)
- **Committed in:** not committed (git-ignored, environment-only fix)

**3. [Rule 3 - Blocking] Worktree had no `.env.local`, so `npm run content:seed` (Task 2) failed on missing Supabase env vars**
- **Found during:** Task 2
- **Issue:** `.env.local` is git-ignored and per-checkout; this worktree didn't have one, so `content:seed` errored on missing `NEXT_PUBLIC_SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`.
- **Fix:** Copied the existing local-Supabase `.env.local` (same values already in the main checkout, `npx supabase status` local stack) into the worktree — no secret was created or changed, purely a per-checkout local-dev file.
- **Files modified:** `.env.local` (git-ignored, not committed)
- **Verification:** `npm run content:seed` exits 0; verified via direct PostgREST query that all five `pour-qui` rows carry `donnees.accroche`
- **Committed in:** not committed (git-ignored, environment-only fix)

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking/environment)
**Impact on plan:** All three necessary to complete the plan as specified; none touch tracked application behavior beyond the `titre` null-safety fix. No scope creep.

## Issues Encountered
- Pre-existing, unrelated `TS2304: Cannot find name 'LayoutProps'` in `src/app/layout.tsx` surfaces only when running bare `tsc --noEmit` before `next typegen` has run; `npm run typecheck` (which runs `next typegen && tsc --noEmit`) is clean. Confirmed pre-existing via a scoped check against the unmodified tree. Logged in `deferred-items.md`, not fixed (out of scope — file not in this plan's `files_modified`).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- "Pour qui" cards ready for CTO visual review at 1440px/375px (hover/focus/touch wash, row-height stability, keyboard-focus parity) — no browser available in this environment, per plan's verification note #7.
- No blockers for subsequent Phase 2 sections.

---
*Quick task: 260901-diy*
*Completed: 2026-09-01*

## Self-Check: PASSED

All 8 modified/created files verified present on disk. All 4 task commits
(`88e5591`, `96960ad`, `eab031b`, `f360f6c`) verified present in `git log`.
