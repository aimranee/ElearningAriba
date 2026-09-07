---
status: complete
---

# Quick Task 260904-h5r: Run 5 — le héros Summary

Rewrote the hero's typewriter as a whole-word crossfade (was: per-character typing that left a
fragment or blank word 41.8% of the time, measured), dropped the H1's second flat-violet accent,
added a three-entry proof line under the CTA row, and tightened the hero's vertical padding.

## What changed

- `src/components/motion/typewriter.tsx`: full rewrite. Two `<span>`s stacked via
  `[grid-area:1/1]` inside an `inline-grid` box. On each cycle the outgoing span transitions
  `opacity 1→0` / `translateY(0→-0.22em)` while the incoming span (already holding the next word,
  instantly pre-positioned at `opacity:0`/`translateY(0.22em)` via a transition-disabled write)
  transitions the mirror path, both over 180ms `var(--ease-brand)` starting on the same frame
  (full overlap). Hold is 2200ms per word. All mutation is direct ref/style writes in a
  `setTimeout`/`requestAnimationFrame` chain — no React state per frame (D-08). Width lock (D-09)
  measures all words through the hidden sizer span and fixes the box at widest+4px, now load-bearing
  since both words coexist mid-crossfade (D-104); it re-runs on `document.fonts.ready` and on a
  180ms-debounced `resize`, unchanged. `prefers-reduced-motion: reduce` shows `words[0]` statically
  with no timer ever scheduled. `visibilitychange` resync (D-10) clears any in-flight crossfade and
  instantly restores the current word whole, then restarts the hold. Blinking-caret span and its
  `animate-[blink_...]` class removed.
- `src/app/globals.css`: removed the now-orphaned `@keyframes blink` (grep-confirmed sole consumer
  was `typewriter.tsx`).
- `src/components/sections/hero.tsx`: `accrocheLead`'s `text-[var(--violet)]` → `text-[var(--ink)]`
  (the cycled word's gradient is now the H1's sole accent; the `sr-only` full-sentence span is
  untouched). Added a proof-line `Reveal` (`dataD={4}`, chips bumped to `dataD={5}`) rendering
  three `·`-joined entries in `--text-small`/`--muted-ink`: entry 1 is
  `${moduleCount} modules · ${formatHours(totalHours)}`, both values derived from
  `getModules()`'s already-fetched result (`modulesResult.data`, same read used by the assembly
  card) via a `landing.hero.preuve.modules` template (`"{modules} modules · {heures} en direct"`,
  same `.replace()` pattern as `format-modalites.tsx`'s `formatModalitesAside.resume`); entries 2
  and 3 are `landing.hero.preuve.formateur`/`groupe`. Padding: `py-[clamp(7.5rem,13vw,10.5rem)]` →
  `py-[clamp(5rem,9vw,7rem)]`.
- `src/locales/fr/landing.json`: added `hero.preuve.modules` (template), `hero.preuve.formateur`
  ("Animé par un expert certifié SAP Ariba"), `hero.preuve.groupe` ("6 participants maximum par
  session") — verbatim placeholders from the brief, no testimonial/name/learner-count/logo/rating.
- `src/locales/fr/_mocks.public.json`: registered `hero.preuve.formateur` and `hero.preuve.groupe`
  under `CADR-03`, `awaiting: Cadrage_Formation_SAP_Ariba_Questions_Client.docx` — exact format
  given in the brief.
- `.planning/phases/02-site-public/02-CONTEXT.md`: appended D-101 through D-104 after D-100.

## Deviations from Plan

None the brief didn't already call for. One addition beyond the brief's literal JSON snippet:
`hero.preuve.modules` (a template key, not a value) was added to `landing.json` under
`hero.preuve` alongside `formateur`/`groupe` — needed so the "N modules · H h en direct" wrapper
text isn't hand-typed JSX (project rule: no hardcoded UI strings), following the exact
`{placeholder}`/`.replace()` pattern already established by `format-modalites.tsx`. It's a
template, carries no fictional number, and isn't a mock — not added to `_mocks.public.json`.

## Verification performed

- `npm run lint` → exit 0. 759 pre-existing errors/12694 warnings reported across the repo, none
  in any of the six files this run touched (grep-confirmed against the lint log).
- `npm run typecheck` → exit 0 (`next typegen && tsc --noEmit`), no errors.
- `npm run content:check` → exit 1 (expected — CADR-01/CADR-03 gate is still open on unrelated
  entries; not a regression). Output now names both
  `landing.json#hero.preuve.formateur` and `landing.json#hero.preuve.groupe` under CADR-03,
  confirming the registry addition is picked up.
- `git rev-parse --abbrev-ref HEAD` → `gsd/phase-02-site-public`, base `5f2c7a4`, confirmed before
  and after all commits.

## NOT verified this run

**No live-browser measurement.** The founder's own acceptance gate — the 8s H1 word-completeness
sample (must be 100% whole words / 0% fragments / 0% blank), the zero-CLS width-lock check across
a full cycle, the single-accent visual check, the proof line's rendered content, the 1440/375
overflow check, and the reduced-motion static-word check — all require Playwright against a
running `:3200` dev server and were not run here (headless session, brief explicitly reserves this
measurement pass for the CTO). The crossfade mechanics, width-lock necessity, and reduced-motion
branch were verified by code reading only, not by an animation-frame-driven DOM measurement.

## Commits

- `#feat: crossfade whole words in hero typewriter instead of typing letters`
- `#feat: single H1 accent, hero proof line, tighter hero padding`
- `#docs: record D-101 to D-104 hero run 5 decisions`

Nothing pushed. No seed script run. No database reset. `npm run build` intentionally not run
(brief instruction).
