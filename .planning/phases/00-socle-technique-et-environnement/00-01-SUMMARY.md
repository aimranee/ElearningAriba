---
phase: 00-socle-technique-et-environnement
plan: 01
subsystem: infra
tags: [nextjs, react, typescript, tailwindcss, shadcn-ui, npm]

requires: []
provides:
  - Next.js (React, TypeScript) App Router application at the repository root, server-rendered by default
  - npm scripts dev, build, start, lint, typecheck
  - French (fr-FR) and Europe/Paris as application-wide defaults
  - src/lib/i18n/fr.ts locale/timezone constants and Intl formatters
  - src/locales/fr/common.json as the single home for phase-0 French user-facing strings
  - Tailwind v4 + shadcn/ui styling toolchain, all generated visual values untouched and labelled as Lot 1 placeholders
affects: [00-02, 00-03, 00-04, 00-05, 00-06]

tech-stack:
  added: [next@16.3.3, react@19.2.8, tailwindcss@4, "@tailwindcss/postcss", shadcn@4, clsx, tailwind-merge, class-variance-authority, lucide-react]
  patterns:
    - "@/*" import alias resolves to "./src/*"
    - French user-facing strings only in src/locales/fr/*.json, imported (never inlined) by server components
    - Locale/timezone formatting only through src/lib/i18n/fr.ts

key-files:
  created:
    - package.json
    - src/app/layout.tsx
    - src/app/page.tsx
    - src/app/globals.css
    - src/lib/i18n/fr.ts
    - src/locales/fr/common.json
    - components.json
    - src/lib/utils.ts
    - src/components/ui/button.tsx
  modified: []

key-decisions:
  - "Scaffold's own CLAUDE.md was not moved to the repository root — it would have overwritten the authoritative project CLAUDE.md that already governs this repo"
  - "Scaffold's AGENTS.md was moved as-is; it is Next.js's own auto-regenerated agent guidance file (re-written by `next dev`, not by build/typecheck), harmless to keep"
  - "Verification order was lint -> build -> typecheck (not lint -> typecheck -> build as literally written) because Next.js 16's global `LayoutProps<'/'>` type is generated into .next/types only after a build; typecheck run before any build fails on a type that doesn't exist yet"

patterns-established:
  - "Locale/timezone formatting only through src/lib/i18n/fr.ts"
  - "French user-facing strings only in src/locales/fr/*.json"

requirements-completed: [SOCLE-01]

duration: 20min
completed: 2026-08-27
---

# Phase 00 Plan 01: Application Scaffold Summary

**Next.js 16 (React 19, TypeScript) App Router scaffolded with npm, French/Europe-Paris as the runtime default, and Tailwind v4 + shadcn/ui installed with every generated visual value left untouched and labelled as a Lot 1 placeholder.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-08-27T13:44:00+01:00
- **Completed:** 2026-08-27T13:55:09+01:00
- **Tasks:** 3
- **Files modified:** 26 (across 3 commits)

## Accomplishments
- A production build, lint and typecheck all pass from a clean `npm ci`
- A running `npm run start` server answers `GET /` with HTTP 200 and the body declares `lang="fr"`
- No `en-US`/`lang="en"`/`en_US` remains anywhere in `src/`, `public/` or `next.config.ts`
- Tailwind v4 and shadcn/ui compile with library-default CSS variables, each labelled inline as a Lot 1 placeholder
- No CSS-in-JS runtime dependency, no `tailwind.config.js`/`.ts`, single `package-lock.json`

## Task Commits

1. **Task 1: Scaffold the Next.js application with npm and wire the npm scripts** - `ffcd245` (feat)
2. **Task 2: Make French and Europe/Paris the application defaults** - `31724cf` (feat)
3. **Task 3: Initialise shadcn/ui on the Tailwind v4 toolchain, with defaults marked as Lot 1 placeholders** - `2d9e206` (feat)

**Plan metadata:** pending (this commit)

## Files Created/Modified
- `package.json` - npm scripts (dev/build/start/lint/typecheck), name `elearning-ariba`, `engines.node >=22`
- `src/app/layout.tsx` - server root layout, `lang="fr"`, metadata sourced from `common.json`, Geist marked as Lot 1 placeholder
- `src/app/page.tsx` - minimal server component rendering the one placeholder string
- `src/app/globals.css` - Tailwind v4 entrypoint plus shadcn/ui CSS variables, labelled as untouched defaults
- `src/lib/i18n/fr.ts` - `LOCALE`/`TIME_ZONE` constants, date/date-time/number Intl formatters
- `src/locales/fr/common.json` - metadata title/description, one page placeholder string
- `components.json` - shadcn/ui configuration
- `src/lib/utils.ts` - `cn` utility
- `src/components/ui/button.tsx` - proof-of-pipeline component, unused/unrendered

## Decisions Made
- Excluded the scaffold's own `CLAUDE.md` from the tmp-scaffold relocation to protect the repository's authoritative project instructions (Rule 3 - blocking issue: a literal move would have destroyed governing project config)
- Ran `npm run build` before `npm run typecheck` in verification (rather than the literal `lint && typecheck && build` order) because Next.js 16 generates the `LayoutProps<'/'>` global type into `.next/types` only on build; this is a toolchain quirk, not a script contract change — `dev`/`build`/`start`/`lint`/`typecheck` names and behavior are unchanged

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Excluded scaffold's CLAUDE.md from the tmp-scaffold move**
- **Found during:** Task 1 (scaffolding)
- **Issue:** `create-next-app`'s new `--agents-md` default (on unless `--no-agents-md` is passed) writes a `CLAUDE.md` in the scaffold that references `AGENTS.md`. The plan's move instruction ("move every generated entry... including dotfiles" with only `.gitignore`/`node_modules` as exceptions) predates this create-next-app default and would have overwritten the repository's real, authoritative `CLAUDE.md`.
- **Fix:** Left the scaffold's `CLAUDE.md` unmoved (discarded with `tmp-scaffold`); moved `AGENTS.md` as-is since it doesn't conflict with anything.
- **Files modified:** none (an omission, not a modification)
- **Verification:** `git status --short` and a `cat` of the root `CLAUDE.md` confirm it is unchanged (still the 4229-byte project file, not the 11-byte scaffold stub)
- **Committed in:** ffcd245 (Task 1 commit)

**2. [Rule 3 - Blocking] Verification order adjusted: build before typecheck**
- **Found during:** Task 1 (running the plan's literal `npm run lint && npm run typecheck && npm run build` verification)
- **Issue:** `tsc --noEmit` failed with `error TS2304: Cannot find name 'LayoutProps'` — Next.js 16 scaffolds `RootLayout({ children }: LayoutProps<"/">)` where `LayoutProps` is a global ambient type generated into `.next/types/` only by `next build` (or `next dev`), not present on a fresh checkout before any build.
- **Fix:** Ran `npm run build` before `npm run typecheck` for verification purposes. No script name, script command or `package.json` contract changed — `typecheck` still runs `tsc --noEmit`, `build` still runs `next build`; only the order they're invoked in during CI/verification matters, and CI (plan 00-04) will need to run `build` at least once (or generate types) before `typecheck` for the same reason.
- **Files modified:** none
- **Verification:** with build run first, `npm run typecheck` exits 0 on a subsequent run
- **Committed in:** n/a (verification-only, no file change)

**3. [Rule 1 - Bug] Server cleanup trap did not kill the actual Next.js server process on Windows**
- **Found during:** Task 2 (production-server verification)
- **Issue:** On this Windows/Git-Bash environment, `npm run start &` followed by `kill $SRV`/`kill -- -$SRV` only killed the `npm` wrapper process; the actual `next-server` child kept listening on port 3000 across two separate verification attempts, requiring a manual `Stop-Process` (via PowerShell) targeting the PID bound to port 3000 (found via `netstat -ano`) to actually free the port.
- **Fix:** Verified the port was free before finishing Task 2 by killing the PID found through `netstat`/`Stop-Process`, confirmed with a failing `curl` against `localhost:3000`.
- **Files modified:** none (verification-only)
- **Verification:** `curl -sf http://localhost:3000/` fails after cleanup
- **Committed in:** n/a
- **Flag for plan 00-06:** the README's local walkthrough should account for `npm run start`'s child process outliving a simple `kill` of the `npm` PID on Windows — a hard-coded `Ctrl+C` in the same terminal works because it signals the whole process group, but any scripted/background kill needs to target the PID bound to the port, not the `npm` wrapper PID.

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 bug in verification tooling, none touching shipped code behavior)
**Impact on plan:** No scope creep. All three are toolchain/tooling realities the plan (written before `--agents-md` and possibly against a different Next.js typed-routes behavior) didn't anticipate. No committed file differs from what the plan specifies; the only material note for a later plan is the Windows `npm run start` kill caveat, flagged above for 00-06.

## Issues Encountered
None beyond the deviations above.

## User Setup Required
None - no external service configuration required in this plan.

## Next Phase Readiness
- `npm ci` succeeds from a clean checkout (lockfile complete); `lint`, `typecheck`, `build` all exit 0; `npm run start` serves `GET /` with HTTP 200 and `lang="fr"`.
- `@/*` alias, the five npm scripts, `src/lib/i18n/fr.ts` and `src/locales/fr/common.json` are all in place as the interfaces later plans in this phase (Supabase, environments, CI, README) and later lots can build on.
- No blockers for plan 00-02.
- Windows note for plan 00-06 (README walkthrough): killing `npm run start` reliably needs the PID bound to port 3000, not the `npm` wrapper PID — see deviation 3 above.

---
*Phase: 00-socle-technique-et-environnement*
*Completed: 2026-08-27*

## Self-Check: PASSED

All 9 created files verified present on disk; all 3 task commit hashes (ffcd245, 31724cf, 2d9e206) verified present in git log.
