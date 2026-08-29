---
phase: 01-cadrage-contenus-et-design
plan: 03
subsystem: content-layer
tags: [i18n, locale, copy, CADR-03]
dependency-graph:
  requires: ["01-01"]
  provides: ["locale bundle for public screens", "mock-content registry (public)"]
  affects: ["01-04 (email copy)", "01-09..01-14 (Wave 4 maquettes consume these keys)"]
tech-stack:
  added: []
  patterns: ["direct JSON import per locale namespace, no barrel", "sidecar mock registry (D-07/D-09)"]
key-files:
  created:
    - src/locales/fr/landing.json
    - src/locales/fr/programme.json
    - src/locales/fr/formation.json
    - src/locales/fr/a-propos.json
    - src/locales/fr/contact.json
    - src/locales/fr/_mocks.public.json
  modified:
    - src/locales/fr/common.json
decisions:
  - "hero and ctaFinal client-dependent values registered under blocks: CADR-01 (positioning/commercial promise); all other mocked copy under CADR-03, matching the distinction the plan draws between framing-workshop values and site copy."
  - "pourQui.profils, competences.items, faq.items and confiance.items registered as whole-array entries rather than per-index, since every value in each array is equally client-dependent and there is no title-drift risk to guard per-entry (unlike programme modules, which are duplicated across two files)."
metrics:
  duration: "35min"
  completed: 2026-08-29
---

# Phase 1 Plan 3: French copy for the five public screens Summary

Wrote every French string the landing, programme, formation, à propos and
contact screens need — plus shared nav/footer/action labels — into six locale
files, and registered all 50 client-dependent values in a sidecar mock
registry so Wave 4's maquettes have a stable, typed content layer to consume
and the Lot 1 gate has a single deletable file to check before close.

## What Was Built

**Task 1 — `common.json` + `landing.json`.** Extended `common.json` with `nav`
(ten French routes + `accueil` + mobile menu toggle), `footer` (baseline,
column headings, copyright, five Lot-5 legal link labels), `actions` (ten
shared button labels) and `etats` (four shared state strings). Created
`landing.json` with the eight signed-order namespaces (`hero` → `ctaFinal`),
each heading using the D-25 two-sentence device, `formatModalites` with
formations live leading and vidéos à venir marked as a future item, and no
video key anywhere in `hero` (D-13).

**Task 2 — `programme.json`, `formation.json`, `a-propos.json`,
`contact.json`.** Developed the five modules with objectives and content,
byte-identical titles/durations to `landing.json`. `formation.json` mirrors
the live-leads/vidéos-à-venir order. `contact.json` carries field labels,
hints, per-field errors including `erreurs.rejetServeur` (consumed by the
D-23 server-rejected field state and the inscription maquette), and success
copy — no submission logic, no endpoint.

**Task 3 — `_mocks.public.json`.** A `mocks` array of 50 entries, each with
`file`, `key`, `blocks` (`CADR-01` or `CADR-03`) and `awaiting` (the client
questionnaire filename). Registers every client-dependent value from Tasks 1
and 2: hero/ctaFinal positioning, the five modules in both `landing.json` and
`programme.json`, the five target profiles, the six competencies, FAQ
answers, trust proofs, and the whole of `a-propos.json`. Navigation, footer,
button, form-label and error-message keys are deliberately not registered —
they are ours, not the client's.

## Verification

- All three tasks' automated `node -e` verification scripts (from the plan)
  ran and passed after each task, before commit (D-39).
- `grep -ri "apprenez à votre rythme\|accès 24/7" src/locales` returns nothing
  across all locale files (D-15).
- All seven JSON files parse via `require()` (valid JSON, no trailing commas).
- Manually confirmed `landing.formatModalites` and `formation.modalites` both
  lead with formations live and mark vidéos à venir as `statut: "futur"`
  (D-14).
- Confirmed no `[MOCK]`, `[FACTICE]` or `__mock` string in any bundle (D-07),
  no `{ value, mock }` wrapper introduced, no npm script added, and
  `scripts/check-mock-content.mjs` was not created (that guard is plan
  01-08's).
- `ls scripts/` still shows only `gen-db-types.mjs`; `package.json` has no new
  script entry.

## Deviations from Plan

None — plan executed exactly as written. Two clarifications made under
Claude's Discretion (both explicitly left open by the plan):
- Split `blocks` between `CADR-01` (hero/ctaFinal positioning and commercial
  promise) and `CADR-03` (everything else) rather than using `CADR-03`
  everywhere, matching the plan's own parenthetical ("`CADR-03` for copy,
  `CADR-01` for the framing values").
- Registered the five target profiles / six competencies / FAQ / trust proofs
  as whole-array entries rather than one registry line per array index, since
  D-09's "deletion from one place" property holds either way and per-index
  registration would have added ~20 more mechanically identical lines with no
  additional guard value.

## Known Stubs

Every value listed in `src/locales/fr/_mocks.public.json` is an intentional,
explicitly-registered placeholder awaiting the client's answers to
`Cadrage_Formation_SAP_Ariba_Questions_Client.docx` (D-01/D-02). This is not a
stub in the "forgotten" sense — it is the registry the plan asked for, and it
is the gate-close mechanism, not a defect. No other stub exists: navigation,
footer, action, state and form-field strings are final copy, not
placeholders.

## Note — out of scope

`npm run typecheck` currently fails in this worktree with `Invalid
environment variables — NEXT_PUBLIC_SUPABASE_URL … received undefined`. This
is a pre-existing Phase 0 environment condition (no `.env.local` in this
worktree) unrelated to any file this plan touches — this plan wrote only
`src/locales/fr/*.json`. Verified instead by `require()`-parsing every locale
file (all valid JSON) and by manual grep/inspection against every acceptance
criterion. Logged here rather than fixed, per the scope-boundary rule (out of
scope for this plan's files).

## Self-Check: PASSED

- FOUND: src/locales/fr/landing.json
- FOUND: src/locales/fr/programme.json
- FOUND: src/locales/fr/formation.json
- FOUND: src/locales/fr/a-propos.json
- FOUND: src/locales/fr/contact.json
- FOUND: src/locales/fr/_mocks.public.json
- FOUND: src/locales/fr/common.json (modified)
- FOUND commit cf2adcf
- FOUND commit 38ab494
- FOUND commit 193bc40
