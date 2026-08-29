---
phase: 01-cadrage-contenus-et-design
plan: 01
subsystem: design-exploration
tags: [design-tokens, exploration, throwaway-html, wave-1]
dependency-graph:
  requires: []
  provides:
    - "design-exploration/README.md (decision sheet, comparison table filled, Direction retenue unfilled)"
    - "design-exploration/direction-01-clarte.html"
    - "design-exploration/direction-02-profondeur.html"
    - "design-exploration/direction-03-editorial.html"
  affects:
    - "Wave 2 (src/app/globals.css, src/app/layout.tsx) once founder picks a direction"
tech-stack:
  added: []
  patterns:
    - "Self-contained throwaway HTML outside src/, one <style> block, Google Fonts <link>, no build"
    - "Token names mirror the Wave 2 CSS custom-property contract verbatim (--primary, --success, --ease-brand, --shadow-1..4, etc.)"
key-files:
  created:
    - design-exploration/README.md
    - design-exploration/direction-01-clarte.html
    - design-exploration/direction-02-profondeur.html
    - design-exploration/direction-03-editorial.html
  modified: []
decisions:
  - "Direction 1 clarté: Inter/Inter, oklch(0.52 0.18 255) primary, near-flat surfaces, one linear gradient wash"
  - "Direction 2 profondeur: Manrope/Inter, deep radial+linear gradient hero, blurred blobs, feTurbulence grain overlay, zero raster images"
  - "Direction 3 éditorial: Fraunces/Inter, hairline rules, green as an editorial marker (kicker + rule), left-aligned hero"
metrics:
  duration: 25min
  completed: 2026-08-29
---

# Phase 1 Plan 1: Wave 1 design exploration Summary

Three throwaway, structurally-identical HTML directions (clarté, profondeur,
éditorial) proposing distinct bleu/blanc/vert oklch palettes, easing curves and
four-tier shadow ladders, plus a French decision sheet whose comparison table
is filled and whose founder block stays empty for the D-34 checkpoint.

## What was built

**Task 1** — `design-exploration/README.md` (comment discipline, "Comment
regarder", "Ce qui se décide ici", empty comparison table, `## Direction
retenue` fill-in block with the seven contractual keys) and
`design-exploration/direction-01-clarte.html` — Inter throughout, white ground,
sparse blue accent, near-flat `--shadow-1`/`--shadow-2` surfaces, one
`cubic-bezier` easing, rise-and-fade `@keyframes` reveal, visible
`:focus-visible` ring on both CTAs and all three cards.

**Task 2** — `direction-02-profondeur.html` (Manrope headings / Inter body,
deep blue radial+linear gradient hero, two `filter: blur(...)` colour blobs,
an inline `feTurbulence` data-URI grain overlay, white cards on
`--shadow-3`/`--shadow-4`, zero raster images) and
`direction-03-editorial.html` (Fraunces headings / Inter body, hairline
`<hr>` rules, green used as an editorial kicker/marker rather than only a
success colour, left-aligned hero). Both reproduce direction 1's block order,
markup skeleton and `:root` token names exactly.

**Task 3** — Filled the README comparison table with the literal
`oklch(...)`/`cubic-bezier(...)` strings read out of each file's `:root`
block, plus a `## Après la décision` section naming `src/app/globals.css` and
`src/app/layout.tsx` as Wave 2's destination. `## Direction retenue` was left
unfilled — that is the founder's block (D-33/D-34).

## Verification

- All three per-task Node verification one-liners passed (`ok`).
- `git status --porcelain src public supabase` returned empty before the
  Task 3 commit — nothing leaked into the app.
- Manual greps confirmed the exact CTA strings, absence of `<video>`,
  `animateMotion`, `stroke-dasharray`, the two D-15 struck phrases, and no
  payment-provider name.
- Line counts: direction-01 260, direction-02 287, direction-03 255 —
  all above the 120-line `min_lines` floor.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. Every mocked French copy block carries the required
`<!-- contenu factice — remplacé par les réponses client -->` comment marker,
invisible on screen, per D-07's intent (though the formal mock-content guard
itself is a Wave 3 deliverable, not this plan's).

## Threat Flags

None. All new surface is throwaway HTML under `design-exploration/` at the
repo root, outside `src/`, `public/`, `supabase/` and `reference/` — matching
the plan's `threat_model` disposition (T-01-01, mitigate).

## Execution stop (D-33)

Wave 1 is complete and committed. Execution stops here by design — the next
step is a manager session where the founder picks a direction and records the
choice in `## Direction retenue` (D-34), then Waves 2–4 are relaunched.

## Self-Check: PASSED

- FOUND: design-exploration/README.md
- FOUND: design-exploration/direction-01-clarte.html
- FOUND: design-exploration/direction-02-profondeur.html
- FOUND: design-exploration/direction-03-editorial.html
- FOUND commit 6624967 (Task 1)
- FOUND commit c3cac52 (Task 2)
- FOUND commit e6c7b86 (Task 3)
