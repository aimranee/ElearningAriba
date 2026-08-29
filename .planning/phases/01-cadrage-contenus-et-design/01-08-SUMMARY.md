---
phase: 01-cadrage-contenus-et-design
plan: 08
subsystem: content-layer, tooling
tags: [locale-bundle, mock-guard, framing-doc]
dependency_graph:
  requires: ["01-03", "01-04"]
  provides: ["src/locales/fr/emails.json", "scripts/check-mock-content.mjs", "docs/cadrage-lot-1.md"]
  affects: []
tech_stack:
  added: []
  patterns:
    - "Node ESM script, node:-prefixed builtins only, path resolved from module not cwd"
    - "_mocks.*.json sidecar registry pattern, discovered by filename, not enumerated"
key_files:
  created:
    - src/locales/fr/emails.json
    - src/locales/fr/_mocks.emails.json
    - scripts/check-mock-content.mjs
    - docs/cadrage-lot-1.md
  modified:
    - package.json
decisions:
  - "Registered only the signature line as mocked in the email bundle — subject lines, action labels and transactional boilerplate are ours, not client-dependent"
metrics:
  duration: "35min"
  completed: "2026-08-29"
---

# Phase 01 Plan 08: Automatic emails, the mock-content guard, and the Lot 1 framing record Summary

Wrote the four automatic email texts, built a dependency-free CLI that answers
"is anything still mocked?" in one run and is provably unreachable from CI or
Vercel, and recorded `CADR-01`'s framing output while closing `CADR-02` as
deferred with no payment provider named.

## What Was Built

**Task 1 — `src/locales/fr/emails.json` and its mock registry.** Four
namespaces (`confirmationInscription`, `confirmationReservation`, `rappel`,
`reinitialisationMotDePasse`), each with `objet`, `preheader`, `salutation`,
a non-empty `corps` array, `action.libelle`/`action.contexte`, `signature`,
`pied`. Interpolation tokens (`{prenom}`, `{dateHeure}`, `{duree}`,
`{typeRendezVous}`, `{montant}`) are written literally; no formatted date or
price is stored, matching `src/lib/i18n/fr.ts`'s formatting contract. Plain
strings only — no HTML, no MJML, no provider name. `_mocks.emails.json`
registers only the four `signature` fields (the only wording asserting
something about the trainer); subject lines and boilerplate are ours and are
not registered.

**Task 2 — `scripts/check-mock-content.mjs` and `package.json`'s
`content:check` script.** Discovers every `_mocks.*.json` registry by
filename pattern (no hardcoded list), resolves each `key` as a dotted path
(numeric segments address arrays) into its bundle, and reports one line per
outstanding placeholder plus a per-`blocks` count. Finding zero registries is
a hard error, not a clean pass. An unresolvable key is a distinct hard error
from a still-mocked one. Exits non-zero while any placeholder remains, exits
0 with one line when all registries are empty. Dependency-free (`node:fs`,
`node:path`, `node:url` only), lint-clean, opens with a comment stating why
it exists and why it must never enter `lint`/`typecheck`/`build`/CI. Not
wired into `.github/workflows/ci.yml` or `vercel.json` — both confirmed
unmodified.

**Task 3 — `docs/cadrage-lot-1.md`.** Records `CADR-01`'s framing output in
French: positionnement, promesse commerciale, quatre formules de vente with
prices written as prose numerals (never `€` symbol, so no hand-written price
string), hiérarchie des pages (eleven screens, ten French slugs and why),
priorités, and the outstanding mocked-content table (60 keys across three
registries, naming the questionnaire and `content:check`). Records `CADR-02`
as deferred to a later lot, closing unmet, with no payment provider named in
any casing. No day rate, margin, internal calendar, phase number, or mention
of how the work was produced.

## Verification

- `npm run content:check` exits 1 and lists 60 outstanding placeholders
  (`CADR-03`: 50, `CADR-01`: 10) grouped by requirement — expected, per D-39
  the guard is designed to fail for the whole of the lot.
- `git diff --stat` against `.github` and `vercel.json` since before this
  plan is empty.
- `node -e "...Object.keys(p.scripts)..."` prints exactly `dev build start
  lint typecheck db:types content:check`.
- `npm run lint -- scripts/check-mock-content.mjs` reports no error.
- Each task's own automated verification (embedded in PLAN.md) passed before
  its commit.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None beyond what the plan intentionally documents: the email `signature`
fields and the client-dependent copy already registered by plans 01-03/01-04
remain mocked by design, tracked in the three `_mocks.*.json` registries and
in `docs/cadrage-lot-1.md`'s "Contenus en attente du client" table. They are
closed by the client's answers before the Lot 1 gate, not by this plan.

## Self-Check: PASSED

- FOUND: src/locales/fr/emails.json
- FOUND: src/locales/fr/_mocks.emails.json
- FOUND: scripts/check-mock-content.mjs
- FOUND: docs/cadrage-lot-1.md
- FOUND: package.json content:check entry
- FOUND commit 856c470 (Task 1)
- FOUND commit e936826 (Task 2)
- FOUND commit 602fc7c (Task 3)
