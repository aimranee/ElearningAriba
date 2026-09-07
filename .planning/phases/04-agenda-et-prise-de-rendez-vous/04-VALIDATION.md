---
phase: 04
slug: agenda-et-prise-de-rendez-vous
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-09-01
reconciled: 2026-09-02
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `04-RESEARCH.md` § Validation Architecture.
>
> **Reconciled 2026-09-02 against the nine `04-NN-PLAN.md` files**, after the D-27/D-28/D-29
> amendment to `04-CONTEXT.md`. Three drifts were corrected: `lot4_dst.sql` never existed as a
> separate file (the DST assertions live in `lot4_verrou_creneau.sql` step 7, where they share the
> seeded fixture instead of duplicating it); the `.ics` assertion ships as `scripts/check-ics.mjs`
> behind `npm run ics:check`, not as a `.mts`; and `lot4_maintien_creneau.sql` — the D-27 retention
> proof — was missing entirely. Every ❌ below is now owned by a named plan and task, which is what
> `wave_0_complete` records: the Wave-0 artefacts are *planned and assigned*, not yet written.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | **None, deliberately.** No vitest/jest/playwright in `package.json`; CLAUDE.md forbids unrequested tests; the dependency budget is zero. The project's proven verification idiom is **SQL negative tests + build assertions on rendered output**. The SQL negative test for AGD-05 is explicitly requested by `04-CONTEXT.md` `<specifics>` — it is not an unrequested test. |
| **Config file** | none — see Wave 0 |
| **Existing harness** | `supabase/tests/lot3_rls_isolation.sql` — single transaction, `begin` … `rollback`, `raise exception` on failed assertion, refusal-first, with positive *and* negative controls |
| **Quick run command** | `npm run lint && npm run typecheck` |
| **SQL run command** | `docker exec -i supabase_db_ElearningAriba psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f supabase/tests/<file>.sql` (`psql` is **not** on PATH — always go through `docker exec`) |
| **Full suite command** | `npm run lint && npm run typecheck && npm run build` **plus** every file in `supabase/tests/` through the SQL run command |
| **Estimated runtime** | ~90 seconds (build dominates) |

---

## Sampling Rate

- **After every task commit:** `npm run lint && npm run typecheck`
- **After every DB task:** the relevant `supabase/tests/*.sql` file via `docker exec … psql -v ON_ERROR_STOP=1 -f`
- **After every plan wave:** `npm run build` + every `supabase/tests/*.sql`, **including Lot 3's `lot3_rls_isolation.sql`** — it must stay green, which is the proof that Lot 4 migrations are additive. From plan 04-01 onward that suite is six files: `lot3_rls_isolation`, `lot4_verrou_creneau`, `lot4_rls_reservation`, `lot4_maintien_creneau`, `lot4_creneaux_libres`, `lot4_feries`
- **Serialisation:** every plan in this phase runs alone — one wave, one plan. The local Supabase stack, the database and `.next` are shared between worktrees, and a plan running `supabase db reset --local` while a sibling builds or runs SQL would fail or, worse, pass against a half-applied schema. No D-26 gate is open while another plan writes
- **Before `/gsd:verify-work`:** full suite green **and** every D-26 visual gate signed off
- **Max feedback latency:** 90 seconds
- **No watch-mode flags** anywhere.

---

## Per-Task Verification Map

Task IDs are assigned by the planner. This map is keyed by requirement until plans
exist; the planner MUST attach each row's automated command to the task that
delivers it, and the executor updates Status.

| Req | Behaviour under test | Test Type | Automated Command | Owning plan · task | File Exists | Status |
|-----|----------------------|-----------|-------------------|--------------------|-------------|--------|
| AGD-01 | Weekly rule at 09:00 Paris resolves to `08:00Z` before 2026-03-29 and `07:00Z` after, with a constant 8 h wall-clock span — DST correctness | SQL assertion | `psql -f supabase/tests/lot4_verrou_creneau.sql` (step 7) | 04-01 · T3 | ❌ W0 | ⬜ pending |
| AGD-02 | `creneaux_libres` omits past, blocked, holiday and taken instants; offers nothing < 24 h or > 8 weeks (D-13) | SQL assertion | `psql -f supabase/tests/lot4_creneaux_libres.sql` | 04-02 · T2 | ❌ W0 | ⬜ pending |
| AGD-02 | `/agenda` still prerenders `○` in the route table; the 13 pre-existing static routes stay `○` | build assertion | `npm run build` + `grep -E "^\s*○\s+/agenda"` on the captured log | 04-03 · T2 | ✅ | ⬜ pending |
| AGD-02 / D-27 | A retained slot is hidden from every other visitor, reappears on lapse, is released on commit — and a forged or expired token grants nothing | SQL negative test | `psql -f supabase/tests/lot4_maintien_creneau.sql` | 04-01 · T3 | ❌ W0 | ⬜ pending |
| AGD-02 / D-27 | The retention route mints and replaces on separate budgets; releases are never rate-limited | node + HTTP assertion | `node --experimental-strip-types` on `rate-limit.ts` + live POST/DELETE against the local stack | 04-03 · T1 | ❌ W0 | ⬜ pending |
| AGD-03 | Types seeded from `agenda.json`; a second seed run is a no-op and overwrites no configured value (D-21) | script assertion | `npm run agenda:seed` twice with three rows mutated in between, divide-by-zero guarded row counts | 04-02 · T1 | ❌ W0 | ⬜ pending |
| AGD-03 | An administrator changes label, duration, buffer and price; a learner cannot; a zero-row update is not a success | HTTP + SQL assertion | live `PATCH /api/admin/types-de-rendez-vous` as each role + `psql` row read | 04-09 · T1 | ❌ W0 | ⬜ pending |
| AGD-04 | 3 booking screens + 1 success surface; **screen 3 is where sign-in is requested (D-28)** and `/reservation` returns 200 with no `Location` when signed out | human visual gate (D-26) + `curl -i` | `checkpoint:human-verify` per surface plan; `curl -i` with no cookie jar | 04-05 · T1, T3 | ❌ W0 | ⬜ pending |
| AGD-04 / D-15 | The trainer's permanent video link is absent from the body of an unauthenticated `GET /reservation` | string assertion on the rendered body | `curl -s /reservation \| grep -c "$FORMATEUR_LIEN_VISIO"` returns 0 | 04-05 · T1 | ❌ W0 | ⬜ pending |
| **AGD-05** | **A second overlapping insert is refused by the DATABASE, including against an RLS-invisible row** | **SQL negative test — explicitly requested by CONTEXT `<specifics>`** | `psql -f supabase/tests/lot4_verrou_creneau.sql` | 04-01 · T3 | ❌ W0 | ⬜ pending |
| AGD-05 | `reserver_creneau` returns the typed outcome `'creneau_indisponible'`, never a raw `23P01` / HTTP 400 | SQL assertion | same file | 04-01 · T3 | ❌ W0 | ⬜ pending |
| AGD-06 | `.ics` parses: CRLF line endings, `UID` / `SEQUENCE` / `DTSTART…Z` present, accented `SUMMARY` folded at 75 octets | script assertion | `npm run ics:check` (`scripts/check-ics.mjs`) | 04-04 · T1 | ❌ W0 | ⬜ pending |
| AGD-06 | Both emails carry the video link and the `.ics` attachment | manual | hosted recette (see Manual-Only) | 04-04 · T3 | ❌ CIO | ⬜ pending |
| AGD-07 | Eleven *fériés* seeded closed for current + next year; Easter matches the verified table (D-17) | SQL assertion | `psql -f supabase/tests/lot4_feries.sql` | 04-02 · T2 | ❌ W0 | ⬜ pending |
| AGD-07 | Adding a weekly range makes instants appear; a whole-day block empties the day; a partial block removes only the overlap | SQL assertion via the admin routes | live writes then `select count(*) from app.creneaux_libres(...)` | 04-06 · T2 | ❌ W0 | ⬜ pending |
| AGD-07 / AGD-08 | A learner cannot read, write, move or cancel any reservation but their own; an administrator can do all; the three admin RPCs refuse a learner in-body | SQL negative test | `psql -f supabase/tests/lot4_rls_reservation.sql` | 04-01 · T3, extended 04-07 · T1 | ❌ W0 | ⬜ pending |
| AGD-08 | CSV opens in Excel FR with the six D-19 columns; a `=`-leading name is neutralised; UTF-8 BOM present, `;` separator, CRLF | byte assertion + manual | `xxd -l 3` on the export, split on `;`, then Excel FR at recette | 04-07 · T2, 04-08 · T2 | ❌ W0 | ⬜ pending |
| AGD-09 | Cancelling frees the slot; `paiement_requis` defaults `false`; `en_attente_paiement` still holds the lock | SQL assertion | `psql -f supabase/tests/lot4_verrou_creneau.sql` | 04-01 · T3 | ❌ W0 | ⬜ pending |
| all | lint / typecheck / build green; the 13 existing static routes stay `○`; `git diff package-lock.json` empty | build | `npm run lint && npm run typecheck && npm run build` | every plan | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Every artefact below is assigned to a plan and a task, which is what `wave_0_complete: true` records.
The files do not exist yet — they are written by the tasks named, and no later plan may verify
against a requirement whose artefact has not landed.

- [ ] `supabase/tests/lot4_verrou_creneau.sql` — AGD-05, AGD-09, **and AGD-01/D-05 (the DST
      assertions, step 7)** → **plan 04-01, Task 3**.
      *There is deliberately no separate `lot4_dst.sql`:* the DST pair needs the same seeded type,
      weekly rule and reservation fixture the lock assertions already build, and a second file would
      duplicate that fixture or, worse, assert against an empty one.
- [ ] `supabase/tests/lot4_rls_reservation.sql` — AGD-04, AGD-07, AGD-08 → **plan 04-01, Task 3**,
      extended in place by **plan 04-07, Task 1** with the three admin RPCs
- [ ] `supabase/tests/lot4_maintien_creneau.sql` — **D-27** → **plan 04-01, Task 3**.
      *Added 2026-09-02 with the CONTEXT amendment.* It is the file that proves the retention hides a
      slot, lapses, releases on commit, and — step 7 — **grants no right to book**
- [ ] `supabase/tests/lot4_creneaux_libres.sql` — AGD-02, D-13, D-23 → **plan 04-02, Task 2**
- [ ] `supabase/tests/lot4_feries.sql` — AGD-07, D-17 → **plan 04-02, Task 2**
- [ ] `scripts/check-ics.mjs` + the `ics:check` npm script — AGD-06 → **plan 04-04, Task 1**.
      *`.mjs`, not `.mts`:* it follows `scripts/check-mock-content.mjs`, the repo's plain-node script
      idiom, and is deliberately not wired into `lint`, `typecheck` or `build`
- [ ] `src/lib/rate-limit.ts` widened with a per-call-site budget — D-27 → **plan 04-03, Task 1**.
      A Wave-0 item because without it the retention route cannot be given a budget that lets a
      visitor compare slots
- [ ] **Framework install: none — do not add one.** Zero-dependency budget.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Learner confirmation email arrives with `.ics` attached; trainer notification arrives | AGD-06 | `RESEND_API_KEY` is empty locally — no end-to-end send possible on this machine | Send from the hosted recette environment; open the `.ics` in Google Calendar and Outlook; confirm the video link is present in both emails |
| CSV export opens correctly in Excel FR | AGD-08 | Excel's separator/encoding behaviour is not observable from a script | Export from `/admin`, open in Excel FR, confirm six D-19 columns split on `;`, accents intact, `=`-leading name shown as text |
| Each booking / admin surface matches `04-UI-SPEC.md` | AGD-04, AGD-07, AGD-08 (D-26) | Founder's blocking visual review gate, one per surface-producing plan | `checkpoint:human-verify` at the end of each surface plan — five gates: 04-03, 04-05, 04-06, 04-08, 04-09 |
| The calendar opens on the first carrying day; non-carrying days are inert; the skeleton holds the layout with no content jump | AGD-02 (D-29) | Requires a browser, a throttled network and a seeded next-month fixture; an autonomous task asserting it would be self-certifying | Plan 04-03 gate, steps 3, 3b, 10 — the pure `premierJourPorteur` function is unit-asserted in the task itself |
| A retained slot disappears for a second visitor and returns on abandon; the countdown decreases and lapses honestly | AGD-02, AGD-04 (D-27) | Needs two browser profiles and real elapsed time; proven at the database level by `lot4_maintien_creneau.sql`, but the *experience* is only observable by a human | Plan 04-03 gate step 3d, plan 04-05 gate step 1b |
| Signed out, a slot click does not ask for sign-in; identification is requested at screen 3 and the slot survives the detour | AGD-04 (D-28) | Click-through across three surfaces and an auth round trip | Plan 04-03 gate step 3e, plan 04-05 gate steps 1 and 3f |
| Every surface holds at 320 px with 44×44 px targets, 16 px inputs, the primary action in the lower half, and nothing critical on hover | all surfaces (`04-CONTEXT.md` § Mobile) | Layout, thumb reach and hover behaviour are not observable from a script; the greps only prove no CSS escape hatch exists | The mobile step on each of the five D-26 gates |
| The French reads as French: sentence case, vouvoiement, `« … »`, curly apostrophes, non-breaking spaces, `14 h 30` in prose | all surfaces (`04-CONTEXT.md` § Culture et typographie) | The JSON-level assertions catch the mechanical rules; register and tone need a native reader | The typography step on each of the five D-26 gates |
| The palette has not drifted toward institutional blue | all surfaces | A grep catches `--blue` and `text-blue`; it cannot catch a violet nudged toward blue in a token value | The palette step on each of the five D-26 gates |
| Two rulings the planner made that CONTEXT's discretion list does not cover | — | CLAUDE.md's queryKeys/optimistic-updates rule waived; the retention rate-limit numbers chosen | Plan 04-03 gate, items 12 and 13 — one-line ratification each |

---

## Validation Sign-Off

- [x] All tasks have an `<automated>` verify command or a declared Wave 0 dependency — checked
      against all nine plans on 2026-09-02
- [x] Sampling continuity: no 3 consecutive tasks without an automated verify — every task in every
      plan carries one
- [x] Wave 0 covers all ❌ references above, each assigned to a named plan and task
- [x] No watch-mode flags
- [x] Feedback latency < 90s (the build dominates; the SQL suite is a few seconds)
- [x] Lot 3's `lot3_rls_isolation.sql` still green (migrations are additive) — asserted in 04-01 T2
      and re-asserted in 04-07 T1 after the third migration
- [x] Human-only behaviour is asserted on a D-26 gate, never in an autonomous task — reconciled
      2026-09-02 across 04-03 and 04-05, matching the discipline 04-06 already stated
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** reconciled against the nine plans 2026-09-02. Two items remain for the founder rather
than for validation, both on plan 04-03's gate: ratifying the CLAUDE.md queryKeys/optimistic-updates
waiver, and ratifying the retention rate-limit numbers.
