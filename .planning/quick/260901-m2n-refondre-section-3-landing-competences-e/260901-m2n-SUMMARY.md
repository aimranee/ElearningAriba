---
phase: quick
plan: 260901-m2n
subsystem: landing-section-3-competences
tags: [landing, content, chromatic-wall, wcag, hero-coupling]
status: incomplete
requires: []
provides:
  - "landing.json competences.items as 6 {titre, description, picto} objects"
  - "seed-content.mjs competenceItems reshaped + RETIRED_ITEMS retirement of contrats-workflows"
  - "hero.tsx TYPEWRITER_WORDS updated (certification replaces contrats-workflows)"
  - "competences.tsx rewritten as chromatic-wall server component"
  - "globals.css competence-rule reveal + reduced-motion rules"
  - "02-CONTEXT.md D-51/D-52/D-53 recorded"
affects:
  - src/locales/fr/landing.json
  - scripts/seed-content.mjs
  - src/components/sections/hero.tsx
  - src/components/sections/competences.tsx
  - src/app/globals.css
  - .planning/phases/02-site-public/02-CONTEXT.md
tech-stack:
  added: []
  patterns:
    - "CARD_ACCENTS module-scope map by cle, violet fallback, inline --card-accent CSS var (mirrors pour-qui.tsx PROFIL_ACCENTS)"
    - "local icon resolver: Award (lucide) for certification, pictograms registry for the five domain cle, null for unknown"
key-files:
  created: []
  modified:
    - src/locales/fr/landing.json
    - scripts/seed-content.mjs
    - src/components/sections/hero.tsx
    - src/components/sections/competences.tsx
    - src/app/globals.css
    - .planning/phases/02-site-public/02-CONTEXT.md
decisions:
  - "02-UI-SPEC.md left untouched — section 3 was only named there ('Ce que vous allez apprendre — six compétences'), no further styling description to update, per brief instruction to not fabricate detail"
metrics:
  duration: "~35 min (blocked before full verification)"
  completed: "2026-09-01"
---

# Quick Task 260901-m2n: Refonte section 3 landing (compétences) Summary

Rebuilt landing section 3 from six subject labels into six verb-first result
headlines on a chromatic wall, restoring the signed "Préparer la
certification SAP Ariba" item by merging catalogues + contrats-workflows.
**Blocked before final verification** — local Supabase stack is not running
and starting it is explicitly forbidden by this run's constraints.

## What was done

### Task 1 — Content, seed, hero coupling (commit `4dcf589`)
- `src/locales/fr/landing.json`: `competences.items` is now 6 `{titre,
  description, picto}` objects, verbatim from the brief, in order
  ecosysteme-ariba, procure-to-pay, source-to-pay, rfq-rfp,
  gestion-catalogues, certification. `eyebrow`/`titre` untouched.
- `scripts/seed-content.mjs`: removed `COMPETENCE_PICTOS` + its comment;
  `competenceItems` now maps `landing.competences.items` on the
  `profilItems` shape (`cle`/`picto` from `competence.picto`). Added
  `RETIRED_ITEMS` after `upsertItems`, deleting `{section_cle:
  "competences", cle: "contrats-workflows"}` matching both columns, with
  the verbatim why-comment and `process.exit(1)` on error.
- `src/components/sections/hero.tsx`: `TYPEWRITER_WORDS` — removed
  `contrats-workflows`, added `certification: "la certification"`. Rewrote
  the why-comment above the table to describe the post-run state (result
  headlines + permanent sentence, cycler on short form, first item's `cle`
  load-bearing for the H1 split). Nothing else in `hero.tsx` touched.

### Task 2 — Chromatic wall rewrite (commit `d6fd5f6`)
- `src/components/sections/competences.tsx` rewritten in full as a server
  component (no `"use client"`): `CARD_ACCENTS` maps all 6 `cle` to
  `--card-accent` in the specified non-adjacent hue order with a violet
  fallback; local `resolvePictogram` uses `Award` for `certification`, the
  pictogram registry for the five domain keys, `null` otherwise (silent
  degrade). Four-layer tile (wash / filigrane / accent rule / text) built
  exactly to brief §6 class values — no shadow, no pastille, no link, no
  `--muted-ink`. Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
  gap-[1.25rem] grid-auto-rows-[1fr]`, `Reveal` cascade unchanged (6 tiles
  over 5-cycle).
- `src/app/globals.css`: added the `data-slot="competence-rule"` scaleX
  reveal (base + `.in` + five staggered `data-d` delays 0.34s–0.70s) inside
  the same `@layer` block as `.reveal`, plus exactly one line in the
  `prefers-reduced-motion` block forcing `transform: none`.

### Task 3 — Phase contract (commit `6327578`) — partial
- `.planning/phases/02-site-public/02-CONTEXT.md`: appended `D-51`, `D-52`,
  `D-53` verbatim from brief §10, following the existing `D-` form.
- `02-UI-SPEC.md` left as-is: section 3 is only named there with no further
  description to reconcile (brief §10 instruction).
- **Not done**: `npm run content:seed` re-seed, and the build + rendered-HTML
  verification gate. See Blocker below.

## Blocker — local Supabase stack unreachable

`npm run content:seed` failed: `content_section upsert failed: TypeError:
fetch failed`. Confirmed the local stack is not running at all (not merely
stopped):
- `docker ps -a` shows no `supabase_db_ElearningAriba` container (any state).
- `npx supabase status` → `LegacyStatusDbInspectError: No such container:
  supabase_db_ElearningAriba`.
- `curl http://127.0.0.1:54321/rest/v1/` → connection refused.

`npm run lint` and `npm run typecheck` both pass (0 errors) — they don't
need a live DB. `npm run build` also **exits 0** and produces 14 routes
(`/`, `/_not-found`, `/a-propos`, `/agenda`, `/api/contact` ƒ, `/connexion`,
`/contact`, `/espace`, `/formation`, `/inscription`, `/paiement`,
`/programme`, `/programme.pdf` ƒ, `/reservation`) — but because Supabase is
unreachable, every server component's `getSection`/`getSectionItems` calls
resolve `{ok: false}` and the build renders the **error-state branch**
everywhere, not real content. Confirmed on `.next/server/app/index.html`:
none of the six new titles are present; the generic error string is.

This run's hard constraints explicitly forbid `supabase db reset`,
`supabase stop`, and `supabase start` — and the brief's own non-negotiable
constraints repeat the same prohibition, on the stated assumption the stack
was already running (shared with the Lot 3 worktree). That assumption did
not hold in this session. Starting the local stack is the fix, but doing so
is outside what this run is permitted to do.

**What's needed to finish:** start the local Supabase stack through a
permitted channel (outside this run), then run, in order: `npm run
content:seed`, then re-run `npm run build` and assert against
`.next/server/app/index.html` per the plan's Task 3 verification block (six
titles, six sentences, the certification phrase, zero occurrences of the
five retired strings, both hero H1 fragments), then confirm exactly 6
published `competences` content_item rows with `contrats-workflows` gone.

## Deviations from Plan

None — all code changes match the brief and plan verbatim. The only
departure from the plan's execution sequence is that Task 3's re-seed and
build-content verification could not run (infrastructure blocker, not a
plan/code issue).

## Verification results

| Check | Result |
|---|---|
| `npm run lint` | ✅ 0 errors |
| `npm run typecheck` | ✅ 0 errors |
| `npm run build` | ✅ exits 0, 14 routes, but content is the error-fallback (DB unreachable) — **not a valid content verification** |
| `npm run content:seed` | ❌ failed — local Supabase unreachable |
| Six titles/sentences + certification phrase in `index.html` | ❌ not verifiable (error branch rendered instead) |
| Five retired strings absent | not checked (moot until real content renders) |
| Hero H1 `Maîtrisez`/`SAP Ariba` present | not re-verified against this build's HTML (error branch) — code path unchanged from the working, previously-verified `f35185c` state |
| Discipline: `--muted-ink` in `competences.tsx` | ✅ 0 occurrences |
| Discipline: `cubic-bezier` outside `--ease-brand` | ✅ 0 occurrences |
| Discipline: raw hex in JSX | ✅ 0 occurrences |
| Discipline: new `shadow-` | ✅ 0 occurrences |
| Discipline: new `"use client"` | ✅ none |
| Discipline: new `min-[` | ✅ none |
| Branch unchanged | ✅ `gsd/phase-02-site-public` |
| No `git push` | ✅ local commits only |

## Self-Check

- `src/locales/fr/landing.json` — FOUND, contains 6-object `competences.items`
- `scripts/seed-content.mjs` — FOUND, `RETIRED_ITEMS` present
- `src/components/sections/hero.tsx` — FOUND, `TYPEWRITER_WORDS` has `certification`
- `src/components/sections/competences.tsx` — FOUND, `CARD_ACCENTS`/`Award` present
- `src/app/globals.css` — FOUND, `data-slot="competence-rule"` rules present
- `.planning/phases/02-site-public/02-CONTEXT.md` — FOUND, D-51/D-52/D-53 present
- Commit `4dcf589` — FOUND in `git log`
- Commit `d6fd5f6` — FOUND in `git log`
- Commit `6327578` — FOUND in `git log`

## Self-Check: PASSED (code/docs) — plan-level status: INCOMPLETE (build/seed verification blocked)

## Next Phase Readiness

Once the local Supabase stack is running: run `npm run content:seed`, then
`npm run build`, then re-check `.next/server/app/index.html` against the six
titles/sentences and the five retired strings per this plan's Task 3
`<done>` criteria. No code change should be needed — only re-verification.
