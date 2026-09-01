---
phase: 04
slug: agenda-et-prise-de-rendez-vous
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-09-01
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `04-RESEARCH.md` § Validation Architecture.

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
- **After every plan wave:** `npm run build` + every `supabase/tests/*.sql`, **including Lot 3's `lot3_rls_isolation.sql`** — it must stay green, which is the proof that Lot 4 migrations are additive
- **Before `/gsd:verify-work`:** full suite green **and** every D-26 visual gate signed off
- **Max feedback latency:** 90 seconds
- **No watch-mode flags** anywhere.

---

## Per-Task Verification Map

Task IDs are assigned by the planner. This map is keyed by requirement until plans
exist; the planner MUST attach each row's automated command to the task that
delivers it, and the executor updates Status.

| Req | Behaviour under test | Test Type | Automated Command | File Exists | Status |
|-----|----------------------|-----------|-------------------|-------------|--------|
| AGD-01 | Weekly rule at 09:00 Paris resolves to `08:00Z` before 2026-03-29 and `07:00Z` after — DST correctness | SQL assertion | `psql -f supabase/tests/lot4_dst.sql` | ❌ W0 | ⬜ pending |
| AGD-02 | `creneaux_libres` omits past, blocked, holiday and taken instants; offers nothing < 24 h or > 8 weeks (D-13) | SQL assertion | `psql -f supabase/tests/lot4_creneaux_libres.sql` | ❌ W0 | ⬜ pending |
| AGD-02 | `/agenda` still prerenders `○` in the route table | build assertion | `npm run build` | ✅ | ⬜ pending |
| AGD-03 | Types seeded from `agenda.json`; a second seed run is a no-op (D-21) | script assertion | run `seed-agenda` twice, compare row counts | ❌ W0 | ⬜ pending |
| AGD-04 | 3 booking screens + 1 success surface; screen 3 is the only auth gate | human visual gate (D-26) | `checkpoint:human-verify` per surface plan | ❌ W0 | ⬜ pending |
| **AGD-05** | **A second overlapping insert is refused by the DATABASE, including against an RLS-invisible row** | **SQL negative test — explicitly requested by CONTEXT `<specifics>`** | `psql -f supabase/tests/lot4_verrou_creneau.sql` | ❌ W0 | ⬜ pending |
| AGD-05 | `reserver_creneau` returns the typed outcome `'creneau_indisponible'`, never a raw `23P01` / HTTP 400 | SQL assertion | same file | ❌ W0 | ⬜ pending |
| AGD-06 | `.ics` parses: CRLF line endings, `UID` / `SEQUENCE` / `DTSTART…Z` present, accented `SUMMARY` folded at 75 octets | script assertion | `node --experimental-strip-types scripts/check-ics.mts` | ❌ W0 | ⬜ pending |
| AGD-06 | Both emails carry the video link and the `.ics` attachment | manual | hosted recette (see Manual-Only) | ❌ CIO | ⬜ pending |
| AGD-07 | Eleven *fériés* seeded closed for current + next year; Easter matches the verified table (D-17) | SQL assertion | `psql -f supabase/tests/lot4_feries.sql` | ❌ W0 | ⬜ pending |
| AGD-07 / AGD-08 | A learner cannot read, write, move or cancel any reservation but their own; an administrator can do all | SQL negative test | `psql -f supabase/tests/lot4_rls_reservation.sql` | ❌ W0 | ⬜ pending |
| AGD-08 | CSV opens in Excel FR with the six D-19 columns; a `=`-leading name is neutralised; UTF-8 BOM present, `;` separator | manual + string assertion | inspect exported bytes | ❌ W0 | ⬜ pending |
| AGD-09 | Cancelling frees the slot; `paiement_requis` defaults `false`; `en_attente_paiement` still holds the lock | SQL assertion | `psql -f supabase/tests/lot4_verrou_creneau.sql` | ❌ W0 | ⬜ pending |
| all | lint / typecheck / build green; the 13 existing static routes stay `○` | build | `npm run lint && npm run typecheck && npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `supabase/tests/lot4_verrou_creneau.sql` — AGD-05, AGD-09
- [ ] `supabase/tests/lot4_rls_reservation.sql` — AGD-04, AGD-07, AGD-08
- [ ] `supabase/tests/lot4_creneaux_libres.sql` — AGD-02, D-13
- [ ] `supabase/tests/lot4_dst.sql` — AGD-01, D-05
- [ ] `supabase/tests/lot4_feries.sql` — AGD-07, D-17
- [ ] `.ics` shape assertion (`scripts/check-ics.mts` or a build step) — AGD-06
- [ ] **Framework install: none — do not add one.** Zero-dependency budget.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Learner confirmation email arrives with `.ics` attached; trainer notification arrives | AGD-06 | `RESEND_API_KEY` is empty locally — no end-to-end send possible on this machine | Send from the hosted recette environment; open the `.ics` in Google Calendar and Outlook; confirm the video link is present in both emails |
| CSV export opens correctly in Excel FR | AGD-08 | Excel's separator/encoding behaviour is not observable from a script | Export from `/admin`, open in Excel FR, confirm six D-19 columns split on `;`, accents intact, `=`-leading name shown as text |
| Each booking / admin surface matches `04-UI-SPEC.md` | AGD-04, AGD-07, AGD-08 (D-26) | Founder's blocking visual review gate, one per surface-producing plan | `checkpoint:human-verify` at the end of each surface plan |

---

## Validation Sign-Off

- [ ] All tasks have an `<automated>` verify command or a declared Wave 0 dependency
- [ ] Sampling continuity: no 3 consecutive tasks without an automated verify
- [ ] Wave 0 covers all ❌ references above
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] Lot 3's `lot3_rls_isolation.sql` still green (migrations are additive)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
