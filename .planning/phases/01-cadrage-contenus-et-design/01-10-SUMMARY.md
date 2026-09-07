---
phase: 01-cadrage-contenus-et-design
plan: 10
subsystem: public-routes
tags: [nextjs, react, tailwind, base-ui, design-system, accessibility, i18n]

# Dependency graph
requires:
  - phase: 01-cadrage-contenus-et-design
    provides: five signed component families (Button, Card, Badge, Accordion, Field — plans 01-05/01-06), content layer + mock-content guard (plan 01-03/01-08), Header/Footer chrome (plan 01-07)
provides:
  - Four of the eleven signed screens as real Next.js routes at their French slugs — /programme, /formation, /a-propos, /contact
affects: [02-site-public]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Section/SectionHeader rhythm reproduced inline with design tokens (--text-title, --text-lead, .reveal-rise) where the actual shared component (plan 01-09) had not landed in this worktree"
    - "A visually-hidden (sr-only) h2, reusing the existing nav label, keeps h1 -> h2 -> h3 unbroken wherever a page has card titles but no SectionHeader"
    - "Field family composed with Base UI's `render` prop for non-input controls (select, textarea), matching the existing `<Button render={<Link .../>}>` idiom from header.tsx"
    - "Server-rejected vs. client-invalid field states demonstrated side by side via Field's `rejected=\"server\"` prop and a plain `aria-invalid` example"

key-files:
  created:
    - src/app/programme/page.tsx
    - src/app/formation/page.tsx
    - src/app/a-propos/page.tsx
    - src/app/contact/page.tsx
  modified:
    - src/locales/fr/contact.json

key-decisions:
  - "No Section/SectionHeader import: plan 01-09 (which creates src/components/sections/section.tsx) had not executed in this worktree and 01-10 does not depend on it (depends_on: 01-03/05/06/07 only). This plan's own hard prohibition forbids modifying src/components/, so the section rhythm was reproduced inline with the same CSS tokens/utility classes instead."
  - "Module duration renders as a bare formatNumber(module.duree) with no unit suffix — no unit label (jours/heures) exists anywhere in the content layer (programme.json, landing.json, common.json). Inventing one would violate D-29's absolute 'no French literal in JSX, stop and report if a key is missing.' Flagged for plan 01-03 to add."
  - "Added contact.demonstration.titre (one new key) to contact.json: the D-23 states-demonstration block's acceptance criteria explicitly require 'a heading read from the bundle,' and no existing key fits. Treated as a UI-infrastructure label, not client-dependent mock content, so it is not registered in _mocks.public.json and does not affect the D-08 guard."
  - "Objectifs/contenu module sub-lists render as two plain <ul> blocks distinguished only by icon (Target vs. BookOpen), not by a text label, since no such label exists in the bundle and D-29 forbids inventing one."

requirements-completed: [CADR-06]

# Metrics
duration: 55min
completed: 2026-08-29
---

# Phase 01 Plan 10: Programme, Formation, À propos, Contact maquettes Summary

**Four of the eleven signed screens — programme, formation, à propos, contact — now exist as real Next.js routes at their French slugs, built on the five signed component families, with the contact form's full D-23 state set (including the server-rejected state) validated in place.**

## Performance

- **Duration:** ~55 min
- **Started:** 2026-08-29
- **Completed:** 2026-08-29
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- `/programme`: all five modules from `programme.json`, byte-identical to `landing.json`, rendered as cards with objectifs/contenu lists and a non-navigating "télécharger le programme" control (PDF is Lot 2)
- `/formation`: the live-session `deroule` as a numbered sequence, `fourni`/`prerequis`/`dureeAcces`, and the modality list in signed bundle order — *vidéos à venir* marked with `Badge variant="muted"`, never styled as included
- `/a-propos`: parcours/légitimité/approche, with the atmosphere layer + a pictogram standing in for a portrait — no photograph, no "coming soon" caption (D-06)
- `/contact`: full field-family form (nom, email, téléphone, profil, message) with no `action`/`onSubmit`/`fetch`, plus a dedicated states-demonstration block showing default, disabled, loading (`data-loading`), client-invalid (`aria-invalid` + `FieldError`) and server-rejected (`data-rejected="server"` + `FieldError` rendering `contact.erreurs.rejetServeur`)
- Heading outline kept intact (h1 → h2 → h3, no skipped level) on all four routes via a visually-hidden h2 reusing the existing nav label, in the absence of the `SectionHeader` component
- `npm run typecheck` exits 0; `npm run lint` clean; `npm run content:check` still exits non-zero and still lists the expected mocked keys

## Task Commits

1. **Task 1: /programme and /formation** - `cb7a0e2` (feat)
2. **Task 2: /a-propos and /contact, with the form in every state** - `4ade4b2` (feat)
3. **Task 3: Slug, outline and keyboard pass across the four routes** - `7ced961` (fix)

## Files Created/Modified
- `src/app/programme/page.tsx` - programme maquette, five modules as cards
- `src/app/formation/page.tsx` - formation maquette, live-session format
- `src/app/a-propos/page.tsx` - à propos maquette, no photograph
- `src/app/contact/page.tsx` - contact maquette with full form state demonstration
- `src/locales/fr/contact.json` - added `demonstration.titre` (see Deviations)

## Decisions Made
- Reproduced the `Section`/`SectionHeader` rhythm inline (max-width container, `.reveal-rise`, `--text-title`/`--text-lead` tokens) instead of importing the shared component, since plan 01-09 had not executed in this worktree and this plan does not depend on it
- Rendered module durations as a bare `formatNumber(module.duree)` with no unit word, since no unit label exists anywhere in the content layer
- Added one new locale key (`contact.demonstration.titre`) as UI-infrastructure text for the states-demonstration heading, not client-dependent mock content

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking issue] `src/components/sections/section.tsx` (Section, SectionHeader) did not exist**
- **Found during:** Task 1, `read_first` step
- **Issue:** The plan's interfaces section lists `Section`/`SectionHeader` as "available from earlier plans (plan 01-09)," but plan 01-09 is wave 5 and had not executed in this worktree (base commit predates it; 01-10's own `depends_on` lists only 01-03/05/06/07). The plan's own hard prohibition forbids modifying/creating files under `src/components/`.
- **Fix:** Reproduced the section shell (container, spacing, tone via alternating `bg-background`/atmosphere classes, `.reveal-rise` entrance) directly in each route file using the same design tokens, rather than creating or importing the missing component. Documented with a `/* why */` comment in each file.
- **Files modified:** all four route files
- **Verification:** each task's automated verify script passes; `npm run typecheck` exits 0
- **Committed in:** `cb7a0e2`, `4ade4b2`

**2. [Rule 2 - Missing critical functionality] No bundle heading for the contact states-demonstration block**
- **Found during:** Task 2
- **Issue:** Acceptance criteria require "a heading read from the bundle" for the D-23 states-demonstration block; no key in `contact.json` (or elsewhere) fits.
- **Fix:** Added `contact.demonstration.titre` to `src/locales/fr/contact.json` — a UI-only label, not client-dependent copy, so it is not registered in `_mocks.public.json` and does not interact with the D-08 mock-content guard.
- **Files modified:** `src/locales/fr/contact.json`
- **Verification:** `npm run content:check` output unchanged (still lists only the pre-existing mocked keys); Task 2 automated verify passes
- **Committed in:** `4ade4b2`

**3. [Rule 1 - Bug] Heading outline skipped h2 on all four routes**
- **Found during:** Task 3
- **Issue:** With no `SectionHeader`, each page went straight from `<h1>` to `<h3>` (card titles), skipping a level — a violation of Task 3's own acceptance criteria.
- **Fix:** Added a visually-hidden (`sr-only`) `<h2>` before the first card-title block on each route, reusing the existing `common.nav.*` label for that page (no new string).
- **Files modified:** all four route files
- **Verification:** manual heading-level review; `npm run typecheck` exits 0
- **Committed in:** `7ced961`

---

**Total deviations:** 3 auto-fixed (1 blocking dependency gap, 1 missing critical content key, 1 bug)
**Impact on plan:** No scope change. The Section/SectionHeader gap is a same-wave sequencing gap (01-10 vs. 01-09), not a plan-content flaw — the visual rhythm this plan asks for is preserved. When plan 01-09 lands and this worktree merges, a follow-up cleanup could re-point these four routes at the shared `Section`/`SectionHeader` component, but nothing here blocks that.

## Known Stubs

None — every rendered string comes from the bundle (four already-registered mocks under CADR-03 for `a-propos.json`, unaffected by this plan) or from live component/JS logic. The "télécharger le programme" button is intentionally non-navigating (Lot 2 scope), not a stub.

## Threat Flags

None. All threats in this plan's threat model (`T-01-35`, `T-01-36`, `T-01-20`, `T-01-37`, `T-01-16`) are mitigated as specified: no form submission surface, `a-propos.json` already registered in `_mocks.public.json`, `data-rejected="server"` demonstrated with `FieldError`/`role="alert"`, directory names asserted exactly, and full keyboard/focus-ring coverage inherited from the existing component families.

## Issues Encountered
- Fresh worktree had no `.env.local`; `next typegen` (part of `npm run typecheck`) failed on missing Supabase env vars. Copied `.env.local` verbatim from the parent checkout (local Supabase CLI demo placeholders, not secrets) — same fix documented in the 01-05 and 01-06 summaries. Not committed (git-ignored by design).
- First bash command of the session (worktree branch/merge-base check) was rejected as "too complex" by the sandbox before it could run the `git reset --hard`, leaving the worktree at the Phase-0-only commit (`27ab022`) for several steps. Corrected by re-running the reset to `809d9c3` (the orchestrator-provided base) before any file edits were made.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Four of the eleven signed screens (`/programme`, `/formation`, `/a-propos`, `/contact`) are validated-ready
- `npm run typecheck` exits 0, `npm run lint` clean, nothing pushed
- Recommended follow-up once plan 01-09 merges: re-point these four routes' inline section markup at the shared `Section`/`SectionHeader` component for full consistency
- Open content gap for plan 01-03: no unit label (jours/heures) exists for module durations anywhere in the content layer

---
*Phase: 01-cadrage-contenus-et-design*
*Completed: 2026-08-29*
