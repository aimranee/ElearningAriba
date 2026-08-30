---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: 02-04-PLAN.md complete (Task 3 checkpoint deferred to 02-11 by founder decision); 02-02 Task 2/3 still blocked on external Supabase operator
last_updated: "2026-08-30T13:00:00.000Z"
last_activity: 2026-08-30
progress:
  total_phases: 11
  completed_phases: 2
  total_plans: 29
  completed_plans: 21
  percent: 72
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-27)

**Core value:** The learner can book — and pay for — a real slot in the trainer's calendar, and the trainer sees it.
**Current focus:** Phase 02 — site-public

## Current Position

Phase: 02 (site-public) — EXECUTING
Plan: 02-01, 02-03, 02-04 complete; 02-02 still blocked at Task 2/3 (hosted Supabase push, external operator); 02-05..02-08 held back (depend on the un-pushed content migration); 02-09..02-11 not started
Status: Wave 2 (02-03) and wave 3's 02-04 done; waves 3's remaining plans and waves 4+ wait on the Supabase migration reaching the hosted projects
Last activity: 2026-08-30

Progress: [███░░░░░░░] 27%

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 00 P01 | 20min | 3 tasks | 26 files |
| Phase 00 P02 | 15min | 2 tasks | 9 files |
| Phase 00-socle-technique-et-environnement P03 | 12min | 4 tasks | 3 files |
| Phase 00 P04 | 1min | 2 tasks | 3 files |
| Phase 00 P05 | 20min | 4 tasks | 5 files |
| Phase 02-site-public P01 | 25min | 3 tasks | 7 files |
| Phase 02-site-public P03 | 22min | 3 tasks | 6 files |
| Phase 02-site-public P04 | 45min | 2 tasks | 8 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Init: One milestone, `v1 — Essentiel`, covering the whole signed scope
- Init: Eleven phases — Phase 0 socle, then Phase N = Lot N for lots 1–10
- Init: Go-live stays at Lot 5 / Phase 5, mid-scope
- Init: Booking and enrolment carry an inert order/confirmation seam from Phases 4 and 6
- Init: Payment provider left undecided — it is a Lot 1 / Phase 1 decision
- [Phase 00-01]: Excluded scaffold CLAUDE.md from tmp-scaffold relocation to protect authoritative project CLAUDE.md
- [Phase 00-01]: Verification runs build before typecheck: Next.js 16 LayoutProps global type is only generated into .next/types after a build
- [Phase 00-02]: zod was already transitive via shadcn; npm install promoted it to a direct dependency
- [Phase 00-03]: Kept CLI-generated project_id (local container namespace) in config.toml as-is, not a hosted-project reference
- [Phase 00-04]: Placeholder build-env values in CI kept obviously non-secret (localhost/127.0.0.1/literal placeholder strings) to satisfy both the boot-time Zod validator and the secret-shape acceptance check
- [Phase 00-05]: Session-aware server Supabase client reads the anon key, not the service-role key; a service-role/admin client has no consumer yet
- [Phase 02-01]: Renamed raw --muted colour token to --muted-ink in :root to avoid shadowing shadcn's --muted surface alias
- [Phase 02-01]: Remapped tone=muted/tone=atmosphere call sites in page.tsx to tone=band in the same commit as narrowing the Section tone union, to keep tsc green
- [Phase 02-04]: Founder decided to batch all mid-phase visual-review checkpoints for this phase into plan 02-11 rather than gating each one individually; 02-04 Task 3 (header resting/scrolled states, scroll-progress bar, mobile nav) was built but not reviewed — see Blockers/Concerns

### Pending Todos

*(none — 00-06 Task 4 closed; see `.planning/phases/00-socle-technique-et-environnement/00-06-SUMMARY.md`)*

### Blockers/Concerns

- **[Phase 02-02, blocking]** The additive content migration
  (`supabase/migrations/20260830090000_public_content.sql`) is written and
  verified locally (`supabase db reset` green) but not pushed to the hosted
  preview (`urmtwbcsqodjnwsnxcqd`) or production (`toxegyhxdoxjuyijgemx`)
  Supabase projects. This environment has no `SUPABASE_ACCESS_TOKEN` and the
  hosted projects belong to a different operator. Resume by running, in order:
  `supabase link --project-ref urmtwbcsqodjnwsnxcqd && supabase db push`, then
  the same for `toxegyhxdoxjuyijgemx`. Verify with
  `npx supabase migration list --linked`. 02-02 Task 3 and phase waves 2-6
  cannot start until this push lands.

- Three scope questions the signed offer does not answer are open — package
  (« forfait ») limits, the certificate attendance threshold, and whether the
  free discovery call counts towards progression. See
  `.planning/REQUIREMENTS.md` § Open scope questions. They need a client answer
  before Phases 7 and 9 are planned.

- The milestone map is pending verification by the Chief of Staff before any
  phase is planned.

- **[Phase 02-04, unreviewed gate]** Task 3 (checkpoint:human-verify) was
  deferred rather than executed, per founder decision to batch mid-phase visual
  reviews into plan 02-11. Nobody has confirmed the header's resting state
  (`rgba(252,252,255,.55)`, `blur(10px) saturate(1.25)`, no shadow) is visually
  distinct from its scrolled state (`rgba(252,252,255,.82)`, `blur(20px)
  saturate(1.45)`, two-part shadow), that the scroll-progress bar behaves
  correctly, or that the mobile nav is usable — only `npm run build`/`lint`/
  `tsc` and grep-based acceptance criteria passed. See
  `.planning/phases/02-site-public/02-04-SUMMARY.md` for the exact values to
  check. Do not treat this as approved.

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-08-30T13:00:00.000Z
Stopped at: 02-03 and 02-04 complete. 02-02 still blocked at Task 2 (hosted Supabase push,
external operator). 02-05 through 02-08 cannot start until that push lands — they read the
Supabase content tables. Do not start them against the local-only schema.
Resume file: None — resume by pushing the migration (see Blockers/Concerns), then continuing
02-02 Task 3 and waves 3 (remainder)-6. Separately, plan 02-11 owes a real human review of the
02-04 header/footer/nav chrome (see unreviewed-gate note in Blockers/Concerns).
