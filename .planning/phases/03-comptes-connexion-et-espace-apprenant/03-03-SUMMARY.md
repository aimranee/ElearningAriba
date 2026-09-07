---
phase: 03-comptes-connexion-et-espace-apprenant
plan: 03
subsystem: lot3-shared-copy-and-boundaries
tags: [locale, ui-primitive, validation, zod]
dependency-graph:
  requires: []
  provides:
    - src/locales/fr/mot-de-passe.json
    - src/locales/fr/profil.json
    - src/locales/fr/donnees.json
    - src/locales/fr/espace.json (additive keys)
    - src/locales/fr/emails.json (suppressionCompteNotification)
    - src/components/ui/checkbox.tsx
    - src/components/compte/auth-shell.tsx
    - src/components/compte/submit-button.tsx
    - src/lib/validation/auth.ts
    - src/lib/validation/profil.ts
  affects:
    - src/app/inscription/page.tsx (later plan, consumes auth-shell + validation)
    - src/app/connexion/page.tsx (later plan)
    - src/app/mot-de-passe-oublie, /nouveau-mot-de-passe (later plan)
    - src/app/espace/* (later plan, consumes espace.json nav/documents additions)
tech-stack:
  added: []
  patterns:
    - "boundary Zod schema + locale-key union + issues-to-field-errors reducer (mirrors src/lib/validation/contact.ts)"
    - "cva primitive with data-slot, in-data-[density=compact], shared focus/disabled/invalid/loading suffixes (mirrors src/components/ui/input.tsx)"
key-files:
  created:
    - src/locales/fr/mot-de-passe.json
    - src/locales/fr/profil.json
    - src/locales/fr/donnees.json
    - src/components/ui/checkbox.tsx
    - src/components/compte/auth-shell.tsx
    - src/components/compte/submit-button.tsx
    - src/lib/validation/auth.ts
    - src/lib/validation/profil.ts
  modified:
    - src/locales/fr/espace.json (additive: nav.*, deconnexion, documents.expiration, documents.erreur)
    - src/locales/fr/emails.json (additive: suppressionCompteNotification)
decisions:
  - "submit-button.tsx uses an explicit `pending` prop instead of useFormStatus, per the plan's own documented deviation from 03-UI-SPEC.md — this repo has zero server actions, every mutation is a fetch to a route handler, and useFormStatus would silently report pending:false forever against that pattern. Flagged for founder review at recette."
  - "nouveauMotDePasseSchema's field-level Zod issues (motDePasseFaible, confirmationDifferente) map to InscriptionErreurKey, not a bespoke MotDePasseErreurKey, because mot-de-passe.json's own erreurs bundle only carries page/transport-level strings (lienExpire, rejetServeur) — the per-field failure copy is the existing inscription.erreurs.* pair, reused cross-bundle exactly as D-11/D-A6 anticipate."
metrics:
  duration: ~70min
  completed: 2026-09-01
---

# Phase 03 Plan 03: Shared Lot 3 copy, UI primitives, and validation boundaries Summary

Front-loaded every French string and shared building block ([`mot-de-passe.json`](../../../src/locales/fr/mot-de-passe.json), [`profil.json`](../../../src/locales/fr/profil.json), [`donnees.json`](../../../src/locales/fr/donnees.json), plus additive keys in `espace.json`/`emails.json`), a ninth `checkbox.tsx` UI primitive built on the already-installed `@base-ui/react/checkbox`, the `auth-shell.tsx`/`submit-button.tsx` compte components, and the `auth.ts`/`profil.ts` Zod validation boundaries — so no later Lot 3 slice has to invent copy, a component, or a boundary contract.

## What Was Built

**Task 1 — French copy.** Three new locale files (`mot-de-passe.json` for `CPT-03`, `profil.json` for `CPT-05`, `donnees.json` for `CPT-09`), transcribed verbatim from `03-UI-SPEC.md`. `espace.json` gained six additive keys (`nav.apercu/profil/donnees`, `deconnexion`, `documents.expiration`, `documents.erreur`) and `emails.json` gained one additive entry (`suppressionCompteNotification`, the trainer notification for a deletion request) — neither registered in `_mocks.emails.json` (D-20). All five existing `espace.json` keys and the `_mocks.emails.json` registry are byte-identical; `npm run content:check` still exits `1` with unchanged totals (`CADR-03: 72`, `CADR-01: 10`).

**Task 2 — Shared components.** `src/components/ui/checkbox.tsx` is a new file (the eight existing `ui/` components are untouched) built on `@base-ui/react/checkbox`, following the `input.tsx` cva skeleton and `accordion.tsx`'s `"use client"` idiom, zero new dependency. `src/components/compte/auth-shell.tsx` extracts the five-surface title-block-then-card chrome as a server component. `src/components/compte/submit-button.tsx` is a client island wrapping `Button` with an explicit `pending` prop (see Decisions).

**Task 3 — Validation boundaries.** `src/lib/validation/auth.ts` exports `inscriptionSchema`, `connexionSchema`, `demandeResetSchema`, `nouveauMotDePasseSchema`, each with a locale-key union and an issues-to-field-errors reducer, mirroring `contact.ts`. The shared `motDePasseSchema` (`min(8)` + digit regex) is commented as mirroring `supabase/config.toml`'s `minimum_password_length`/`password_requirements` per D-12 — those config values are still `6`/`""` in this worktree (unchanged by this plan; owned by a sibling plan in this phase, not in this plan's `files_modified`). `connexionSchema` deliberately validates only password presence, never strength, to avoid a sign-in oracle. `src/lib/validation/profil.ts` exports `profilSchema` with a French-tolerant phone regex, the four-value professional-profile enum, and two coerced-boolean preferences — no `email` field (D-A7), no company field (D-24).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed a duplicate top-level `documents` key in `espace.json`**
- **Found during:** Task 2 typecheck (`npm run typecheck` failed on `src/app/espace/page.tsx` with a type error on `espace.documents.titre`)
- **Issue:** The first draft of Task 1's `espace.json` edit appended `documents: { expiration, erreur }` as a second, colliding top-level key instead of nesting those two strings inside the existing `documents: { titre, vide }` object — a JSON object literal silently keeps only the last declaration of a duplicate key, which changed the inferred type of `espace.documents` and broke every existing read site.
- **Fix:** Nested `expiration`/`erreur` inside the existing `documents` object (before `vide`, so no existing line needed a trailing-comma edit) and moved `nav`/`deconnexion` to sit after `bienvenue` (also before a line that already had a trailing comma) — this keeps the diff against the pre-Lot-3 baseline purely additive: `git diff --numstat` reports `8   0` for `espace.json`, satisfying the plan's zero-deletions acceptance criterion.
- **Files modified:** `src/locales/fr/espace.json`
- **Commit:** `37e02ca`

### Environment setup (not a plan deviation, recorded for the next agent)

- This worktree had no `node_modules` and no `.env.local` at spawn time. Ran `npm ci` (installs the already-declared/locked dependencies only — no new package). Copied `.env.local` from the sibling main-clone worktree (gitignored, local-only Supabase demo stack credentials, not a secret) so `npm run typecheck`/`build` could resolve `src/lib/env/server.ts`'s boot-time Zod validation. Neither file is tracked or committed.

## Hosted / Cross-Plan Notes

- `supabase/config.toml`'s `minimum_password_length`/`password_requirements` are still `6`/`""` in this worktree — D-12 requires moving them to `8`/`letters_digits` to match the signed copy and this plan's `motDePasseSchema`. That edit is not in this plan's `files_modified` and is presumed owned by a sibling Lot 3 plan; the `motDePasseSchema` `why:` comment names the dependency explicitly so it is not lost.
- The new French copy (`mot-de-passe.json`, `profil.json`, `donnees.json`, the `espace.json`/`emails.json` additions) is written, not approved — founder validation happens at Lot 3 recette per D-11/D-22, grouped end-of-phase.
- No hosted dependency (Google OAuth, SMTP, private bucket, migration push) was touched or required by this plan.

## Verification

- `npm run typecheck`, `npm run lint`, `npm run build` all exit `0`; `next build` shows the same fourteen routes (thirteen `○` static + `ƒ /api/contact`) as before this plan — `programme.pdf` also `ƒ` as before.
- `npm run content:check` exits `1`, totals unchanged (`CADR-03: 72`, `CADR-01: 10`).
- `git diff --name-only src/components/ui/ src/components/layout/ src/app/globals.css` — only `checkbox.tsx` is new; the eight existing `ui/` components, `layout/`, and `globals.css` are untouched.
- `git diff package.json` is empty — zero new dependencies.
- Password schema: 7 chars rejected, 8 letters no digit rejected, `abcdefg1` accepted; mismatched confirmation maps to `confirmationDifferente`; sign-in accepts a 1-character password (no strength oracle).
- `profilSchema` accepts a valid French phone number, rejects `"abc"` mapped to `telephoneInvalide`; contains no `email` field.
- No `: any` / `as any` in any new file; no French-accented character in `auth.ts`/`profil.ts`.

## Known Stubs

None — this plan ships no route or page; it is copy, primitives, and validation only, consumed by later Lot 3 plans.

## Unresolved Questions

- Which sibling plan in this phase owns the `supabase/config.toml` password-rule edit (D-12)? Confirm before the plan that wires `inscriptionSchema` against a live signup runs, or the client-side/server-side rules will disagree.
