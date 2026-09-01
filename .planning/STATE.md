---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: "Waves 1-5 of phase 02 complete (02-01..02-10); 02-11 not started — it is the founder's batched visual review of the deferred human-verify checkpoints and must not be run headless"
last_updated: "2026-08-31T00:00:00.000Z"
last_activity: 2026-08-31
progress:
  total_phases: 11
  completed_phases: 2
  total_plans: 29
  completed_plans: 28
  percent: 97
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-27)

**Core value:** The learner can book — and pay for — a real slot in the trainer's calendar, and the trainer sees it.
**Current focus:** Phase 02 — site-public

## Current Position

Phase: 02 (site-public) — EXECUTING
Plan: 02-01..02-10 complete; 02-11 not started. Unreviewed human-verify gates remain on 02-04 Task 3, 02-05 Task 4, 02-09 Task 3 and 02-10 Task 3 — all deliberately deferred to 02-11 by founder decision, so requirements PUB-01..PUB-07 correctly remain pending
Status: Waves 1-5 delivered and verified from the repo: next build green, all content routes static with 1h ISR, /programme.pdf renders five modules totalling 17 h from database rows
Last activity: 2026-09-01 - Completed quick task 260901-c0q: remove stats band section from landing (founder decision, figures restated elsewhere)

Progress: [█████████░] 97%

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
| Phase 02-site-public P02 | 45min | 1 task | 8 files |

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
- [Phase 02]: `app` added to `supabase/config.toml` `[api] schemas`, exposing it through the Data API/PostgREST; both Supabase clients (`src/lib/supabase/client.ts`, `server.ts`) default `db.schema` to `app` since no table lives in `public`. Verified locally: `GET app.content_section` with `Accept-Profile: app` and the anon key returns 200 with an empty array; `npm run build` and `npx tsc --noEmit` clean.
- [Phase 02-02]: `src/lib/supabase/public.ts` is a cookieless anon client (`createClient` from `@supabase/supabase-js`, not `createServerClient`) so public content reads never force dynamic rendering; `src/lib/supabase/server.ts` is untouched for Lot 3's session-aware path.
- [Phase 02-02]: `service_role` needed an explicit `grant usage on schema app` plus table grants beyond RLS bypass — added as a second additive migration (`20260830093000_grant_service_role_content.sql`) rather than editing the already-applied `20260830090000`. Not yet pushed to hosted; local-only so far.
- [Phase 02-02]: Seed script normalizes every row to the full column set before a batched upsert — PostgREST's bulk upsert sends an explicit `NULL` for any column a given row omits when other rows in the same batch carry it, so relying on the table's column default inside a heterogeneous batch silently fails.

### Pending Todos

*(none — 00-06 Task 4 closed; see `.planning/phases/00-socle-technique-et-environnement/00-06-SUMMARY.md`)*

### Blockers/Concerns

- **[Phase 02, hosted content is stale]** The CIO seeded both hosted projects on 2026-08-30 with the seed script as it stood at commit 879069c — 39 content items and no eyebrow or titre_accent on any section. Five later commits (425aaf2, 73a06a0, 81a337d, 36375bd, fab7474) extended the seed: local now holds 47 items and 10 of 11 sections carry eyebrow and titre_accent. A hosted build today would render section headers without their eyebrow and accent and the Formation and A-propos pages without their items. The seed is idempotent, so the fix is simply to re-run npm run content:seed against both hosted refs; it is requested from the CIO.

- **[Phase 02-02, resolved]** `20260830090000_public_content.sql` was pushed to
  both hosted Supabase projects by the CIO on 2026-08-30 (see the two handoffs
  cited in `02-02-SUMMARY.md`), and Task 3 has now run against the local
  stack: cookieless read client, generated types, query layer and the
  idempotent seed are all committed and verified (39 items / 11 sections,
  idempotent across two runs; `tsc`/`eslint`/`next build` all clean, all 14
  routes still static, `content:check` still exits 1).

- **[Phase 02-02, follow-up, not blocking local work]** A second additive
  migration, `supabase/migrations/20260830093000_grant_service_role_content.sql`,
  was written this session (service_role lacked schema/table grants needed to
  run the seed) and applied locally, but not pushed to either hosted project.
  It needs the same CIO push-and-verify sequence Task 2 used for
  `20260830090000` before a hosted seed run (`SUPABASE_SERVICE_ROLE_KEY`
  against the hosted DB) will succeed. Plans 02-05..02-11 are not blocked by
  this — they read against the local stack.

- Three scope questions the signed offer does not answer are open — package
  (« forfait ») limits, the certificate attendance threshold, and whether the
  free discovery call counts towards progression. See
  `.planning/REQUIREMENTS.md` § Open scope questions. They need a client answer
  before Phases 7 and 9 are planned.

- The milestone map is pending verification by the Chief of Staff before any
  phase is planned.

- **[Phase 02-04, unreviewed gate]** Task 3 (checkpoint:human-verify) was
  deferred rather than executed, per founder decision to batch mid-phase visual
  reviews into plan 02-11. Nobody has confirmed the header's scroll behavior,
  that the scroll-progress bar behaves correctly, or that the mobile nav is
  usable — only `npm run build`/`lint`/`tsc` and grep-based acceptance
  criteria passed. **Superseded 2026-08-31 (quick task 260831-grv, landing v2
  Run 2):** the header's resting state is no longer `rgba(252,252,255,.55)` —
  it is now fully transparent (no background/blur/shadow) at rest, with the
  scrolled state at `rgba(252,252,255,.72)`, `blur(28px) saturate(1.7)`, per
  `ariba-cto/notes/2026-08-31-maquette-lot2-landing-v2.html`. See
  `.planning/quick/260831-grv-refonte-visuelle-landing-run-2-en-tete-e/260831-grv-SUMMARY.md`
  for what changed. Still unreviewed by a human — do not treat as approved.

## Quick Tasks Completed

| Date | Task | Result |
|------|------|--------|
| 2026-08-30 | Repair brittle verification commands in plans 02-05..02-11 | Widened literal-JSX-shape greps (variant="raised", tone="band", data-magnetic="true", literal nav href) to also accept expression/data-driven forms; fixed two over-strict counts (hardcoded "17" check in 02-08, exact shadow-4 count in 02-10). No source touched. |
| 2026-08-30 | Correct prior sweep: replace value-blind ("literal"\|{expr}) greps with prerendered-HTML value assertions | The previous widening accepted `variant={anything}`/`data-magnetic={false}` as a pass — a false positive. Converted 02-05 (hero data-magnetic) and 02-06 (programme/formation/a-propos raised-card + band-tone) to assert the actual value in `.next/server/app/*.html` after `npm run build`, since those files are routes rendered directly. Left 02-09/02-10's own per-file checks unconverted: those components mount into `src/app/page.tsx` only in each plan's later checkpoint task, so no route exists yet at their verification point to assert against — explained in each plan and covered by that checkpoint's human visual review. 02-11's nav-href widening left as-is (different shape, out of scope of this correction). No source touched. |
| 2026-08-30 | Close the human-visual-review gap in 02-09/02-10: add prerendered-HTML assertions to each plan's Task 3 (the mount point) | The fallback named in the prior entry — Task 3's human visual review — does not exist; all mid-phase human-verify gates in this phase auto-advance unreviewed. Added to Task 3 in both plans, run against `.next/server/app/index.html` after `npm run build`: `data-tone="band"` and `data-tone="default"` each ≥1 (D-21 alternation); `data-magnetic="true"` ≥1 (02-09: ProgrammeAccordion's reservation CTA; 02-10: CtaFinal's white button). `shadow-[var(--shadow-3)]` and `rounded-[22px]` (Card variant="raised"'s literal base classes, confirmed in card.tsx) ≥5 in 02-09 — "These five cards are five of the eleven floating surfaces AC-1 counts" (Task 1) — and ≥9 in 02-10 — six format-modalites items + three confiance faits, per "this task brings the landing page to at least fourteen floating cards" (Task 1), i.e. 14 minus 02-09's 5. Competences.tsx's rows and confiance's two placeholders were excluded from the shadow-3/rounded-22 count: competences uses shadow-2 base / 18px radius per its own plan text, and the placeholders are explicitly "DELIBERATELY not floating cards". Task 1/2's existing source greps left untouched. No source touched. |
| 2026-08-31 | Set `nativeButton={false}` on 11 Button call sites rendering a next/link Link or `<a>`, across header/hero/cta-final/programme-accordion/programme page/espace page; then bump Node runtime pin 22→24 in `.nvmrc` and `package.json` engines | Clears 7 Base UI console errors on `/` and 2 on every page carrying the header. Node bump touched only the two pin files — CI already reads `node-version-file: .nvmrc`. `npm run lint` and `npm run typecheck` green after both commits. Two atomic commits, nothing pushed. |
| 2026-08-31 | Landing v2 Run 2 (header + hero): header transparent at rest, `before:` safety gradient, "Prendre RDV" CTA (new `common.actions.prendreRdv` key) with arrow-chip pastille hidden below 1000px alongside Connexion; H1 accroche rewritten in `landing.json` to end on its animated word, `hero.tsx` split into lead-sentence (violet) + typewriter-on-its-own-line | Matches `ariba-cto/notes/2026-08-31-maquette-lot2-landing-v2.html` §Run 2. Re-seeded local Supabase content only. `npm run lint`/`typecheck`/`build` all 0, 14 routes still static, prerendered `index.html` confirms transparent header base classes and the new H1 split. Two atomic source commits, nothing pushed. See `260831-grv-SUMMARY.md`. |
| 2026-08-31 | Hero assembly card: re-anchor the 3 hand-written connector curves onto the measured pastille-edge (x=44.6) → card-edge (x=52) gap, raise the connectors SVG to `z-[2]` above the violet card (`z-[1]`) so traces terminate visibly on it; remove the obsolete 100%-fixed white progress bar under the module/hours summary | Prior coordinates (x=40→66) were ported unchanged from `cta-final.tsx`'s old column split — 86% of each curve sat hidden behind the opaque pastilles and card. Curves stay hand-written in the viewBox, never computed from element positions (unchanged since 2026-08-28). Trace/comet/stagger/reduced-motion behavior untouched. `npm run lint`/`typecheck`/`build` all 0, 14 routes still static; prerendered `index.html` confirms `z-[2]` on the connectors SVG, the new path coordinates, and the absence of the white bar markup. Two atomic commits, nothing pushed. Visual check at 1440px pending CTO review. |
| 2026-08-31 | Landing v2 Run 3 (parcours, assemblage, photo) + 2 corrections: `format-modalites.tsx` rewritten as a numbered parcours (niveau 1, zero box-shadow) with a sticky niveau-2 companion aside and progression rail; `cta-final.tsx` split two-column with a decorative `.asm` assembly card (sole remaining `--shadow-4` consumer alongside the hero console, dropped from the outer panel) with static SVG bezier connectors; `confiance.tsx` gained a 16:9 photo placeholder on the À-propos anchor; `mobile-nav.tsx` burger text replaced with `Menu`/`X` lucide icons (aria-label/aria-expanded unchanged); AC-1 "niveau 3" wording reworded in `02-CONTEXT.md`/`02-UI-SPEC.md` to exclude `Button`'s primary-variant hover `--shadow-4` from the two-surface ceiling | Matches `ariba-cto/notes/2026-08-31-maquette-lot2-landing-v2.html` §Run 3. Six format-modalites items' signed text unchanged, only treatment. `npm run lint`/`typecheck`/`build` all 0, 14 routes still static, prerendered `index.html` confirms exactly two non-hover `--shadow-4` consumers. Four atomic source commits, nothing pushed. See `260831-gyj-SUMMARY.md`. |
| 2026-08-31 | Third contrast-trap fix on the hero assembly card: connector cable gradients (`asm-w1/w2/w3`) and comet fill switched from `var(--violet)` to `var(--card)` (white) at the terminal stop, plus a new 40% mid-course stop so the transition completes before the card's measured left edge (~50% of each path's bounding box); `strokeWidth` 1.6→2 | Prior two Run 3/4 fixes covered a white-on-white pastille and a violet-on-violet console; this run covers the connector cables themselves, which were violet at both ends and vanished the instant they crossed onto the violet card. Only color stops/opacity and stroke width changed — coordinates, z-index, trace/comet motion, stagger and reduced-motion behavior untouched. `npm run lint`/`typecheck`/`build` all 0, 14 routes unchanged (13 static + `/api/contact` dynamic). One atomic commit, nothing pushed. No browser available this run — visual confirmation left to the CTO. See `260831-cnx-SUMMARY.md`. |
| 2026-08-31 | Fix hero assembly card mobile overflow measured at 375px (382px card vs 360px usable width, clipped by hero's `overflow:hidden`): internal grid `grid-cols-1 sm:grid-cols-[.92fr_1.08fr]` (pills first, violet card second — DOM order already matched, no reorder needed), `min-w-0` added on the Reveal wrapper + both grid-item children so the card can shrink instead of forcing overflow, hand-authored SVG connectors hidden below 640px (`hidden sm:block`) since their side-by-side paths don't connect anything once stacked | Root cause: the two-column grid had no breakpoint and no `min-w-0`, so `min-width:auto` on grid items pinned the card to its 382px content width and pushed it past the viewport. Desktop (≥640px) layout, coordinates, z-index, gradients, stroke, comet, and `--ease-brand` easing all untouched. `npm run lint`/`typecheck`/`build` all 0, 14 routes unchanged (13 static + `/api/contact` dynamic); prerendered `index.html` confirms both the `grid-cols-1 ... sm:grid-cols-[.92fr_1.08fr]` and `hidden size-full sm:block` classes. Two atomic commits, nothing pushed. No browser available this run — 375px/1440px pixel confirmation left to the CTO. See `260831-n81-SUMMARY.md`. |
| 2026-09-01 | Remove the animated stats band section from the landing (founder decision 2026-09-01: its four figures are all restated elsewhere on the page) — deleted `stats-band.tsx` and `count-up.tsx` (sole consumer, grep-confirmed), removed the `StatsBand` import/element from `page.tsx` (Hero now directly followed by PourQui), removed the `statsBand` locale block (4 keys), rewrote D-03 in `02-CONTEXT.md` and the 26academy-style-bands paragraph in `02-UI-SPEC.md` | No `tone=` prop changed on any section — Hero and PourQui both transparent in sequence is the intended, approved outcome. `src/lib/i18n/fr.ts`, `cta-final.tsx`, `format-modalites.tsx`, `competences.tsx`, `pour-qui.tsx`, `hero.tsx` untouched; removed figures not relocated. `npm run lint`/`typecheck`/`build` all 0, 14 routes unchanged (13 static + `/api/contact` dynamic); prerendered `index.html` confirms zero occurrences of "modules progressifs", "compétences pratiquées", "prérequis SAP exigé" while "de formation live", "Pour qui" and the Format et modalités summary remain. Three atomic commits, nothing pushed. See `260901-c0q-SUMMARY.md`. |
| 2026-08-31 | **Section 01 (header + hero) rebuilt under the new maquette-retired regime.** Header: monogram pastille (`--violet`→`--indigo`) beside the wordmark, `min-w-0`/`truncate` so it can't push the burger off 375px; `Accueil` dropped from nav (4 links remain). Hero: eyebrow removed; typewriter split now guarded by `hasValidSplit` — degrades to static accroche with no duplicated word instead of failing silently as it did before; single CTA "Prendre RDV" (`actions.demarrer` retired); `hero.chips` deduped to 2 (repercusses onto `cta-final.tsx`'s `.join`, that file otherwise untouched); two floating badges + `bob`/`bob2` keyframes removed; assembly card's violet panel no longer repeats the three pills — shows badge "Sessions ouvertes" + live aggregate (module count, hours, certification prep) instead. `landing.json hero.sousTitre` shortened, local content re-seeded. `D-04` in `02-CONTEXT.md` and `02-UI-SPEC.md`'s §0 rewritten: **the maquette is no longer visual authority — the rendered app is**, and the landing is now rebuilt section by section. | Per `ariba-cto/notes/2026-08-31-brief-section-01-entete-et-heros.md`. `npm run lint`/`typecheck`/`build` all 0, 14 routes still static. 12/13 brief checks confirmed against `.next/server/app/index.html`; checks 10-11 (375px overflow, burger edge) reasoned from flex `min-width:auto` rules and the applied fix, **not measured in a live browser** — no browser-automation tool was authorized this run. Four atomic source commits, nothing pushed. See `260831-meh-SUMMARY.md`. |
| 2026-08-31 | Hero assembly card gets real mechanics: new `AssemblyCard` client island (single `useEffect`, height-locked title box, 3.2s carousel across the 5 modules fading via `--ease-brand`, honest progress bar/label from `module.position`, 3-row checklist reusing the pills' labels that validates once on viewport entry via `IntersectionObserver`, decoupled from the looping carousel); `assemblage.resume`/`assemblage.certification` locale keys replaced by `moduleLigne`/`progression` templates; `assembly-connectors.tsx` cables shortened to terminate on a small static node at `x≈47.8` instead of crossing onto the card, dropping the `var(--card)` white-crossing gradient stop entirely (now solid single accent color end to end, comet recolored to match) | Per `ariba-cto/notes/2026-08-31-brief-section-01-mecanique-carte-assemblage.md`. One Rule-3 auto-fix: renamed `module` locals to `mod` in the new island (Next's `no-assign-module-variable` lint rule, invisible to `tsc --noEmit`). `npm run lint`/`typecheck`/`build` all 0, 14 routes unchanged; prerendered `index.html` confirms the first module's title and all three checklist labels render; zero banned easing tokens (`ease-in`/`ease-out`/`ease-in-out`/`linear`, excluding pre-existing `linear-gradient(...)` calls) across the four touched files; zero `var(--card)`/`<linearGradient>` remain in `assembly-connectors.tsx`. Four atomic commits, nothing pushed. No browser available this run — 1440px/375px pixel confirmation (node placement, dimmed-row contrast, carousel CLS) left to the CTO. See `260831-nf5-SUMMARY.md`. |

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-08-30T17:17:32.000Z
Stopped at: 02-02 complete (Task 3 executed against the local stack, deviation fix for
service_role grants committed separately). 02-01, 02-02, 02-03, 02-04 all complete.
Resume file: None — resume with 02-05-PLAN.md. CIO still owes a hosted push of
`20260830093000_grant_service_role_content.sql` (see Blockers/Concerns) but that does not block
02-05..02-11, which read against the local stack. Separately, plan 02-11 owes a real human
review of the 02-04 header/footer/nav chrome (see unreviewed-gate note in Blockers/Concerns).
