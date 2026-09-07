---
phase: 260907-pik-auth-v2-correctifs
plan: 01
subsystem: auth-ui
tags: [css, cascade-layers, forms, illustration, design-tokens]
dependency-graph:
  requires: []
  provides: [unlayered-auth-compact-panel-rule, 44px-password-reset-fields, tokenized-espace-fenetre-live-badge]
  affects: [connexion-panel-layout, mot-de-passe-oublie-form, nouveau-mot-de-passe-form, espace-fenetre-illustration]
tech-stack:
  added: []
  patterns: [unlayered-css-media-query-outranks-at-layer, h-11-field-control-standard, color-mix-token-derived-badge]
key-files:
  created: []
  modified:
    - src/app/globals.css
    - src/components/compte/mot-de-passe-oublie-form.tsx
    - src/components/compte/nouveau-mot-de-passe-form.tsx
    - src/components/illustrations/espace-fenetre.tsx
decisions: []
metrics:
  duration: ~20min
  completed: 2026-09-07
---

# Quick Task 260907-pik: Auth v2 correctifs Summary

Three atomic fixes closing measured defects from the auth v2 run: an unlayered CSS cascade bug, two 32px form fields, and a stray hex/mint-hued badge that should have matched the coral `--live` token.

## What Was Done

**Task 1 — `src/app/globals.css`:** Moved the auth compact-panel `@media` block (three declarations keyed on `[data-slot="auth-panel"]`, `[data-slot="auth-panel-inner"]`, `[data-slot="fenetre-puces"]`) out of `@layer components` to the top level of the file, immediately after the layer's closing brace. It was previously the last rule inside the layer, where unlayered Tailwind utility classes always outrank it regardless of specificity — the compact treatment never applied at 1024-1279px width or short-viewport heights. Comment extended to state why it must stay unlayered.

**Task 2 — password-reset forms:** Added `className="h-11"` to the email `FieldControl` in `mot-de-passe-oublie-form.tsx`, and to both the `motDePasse` and `confirmation` `FieldControl` elements in `nouveau-mot-de-passe-form.tsx`. Matches the existing `connexion-form.tsx` pattern; all auth fields are now 44px.

**Task 3 — `espace-fenetre.tsx`:** "Confirmé" pill's raw `bg-[#e6faf3]` replaced with the `bg-success-muted` token utility. "En direct" badge's dot recolored from `bg-[var(--mint)]` to `bg-[var(--live)]`; badge background changed from a raw `rgba(31,199,155,.16)` literal to `bg-[color-mix(in_srgb,var(--live)_18%,transparent)]`; badge text changed from `text-[var(--mint-soft)]` to `text-white/90`. The dot and halo now share the same coral hue as the live pulse keyframe. Window-chrome dots and the inline `pulse-live` animation left untouched.

## Deviations from Plan

None — plan executed exactly as written. All interface line references matched the live files with no discrepancies.

## Verification Results

Commits landed before verification, per constraint.

- `npm run lint` — exit 0, zero problems.
- `npm run typecheck` — exit 0 (`next typegen` + `tsc --noEmit` both clean).
- `npm run build` — exit 0. `/connexion`, `/inscription`, `/mot-de-passe-oublie`, `/nouveau-mot-de-passe` all listed static (○) in the route table.
- `git status --short` — clean of tracked changes (only untracked `.planning/` quick-task directories remain, out of this plan's commit scope).
- `git rev-parse --abbrev-ref HEAD` — `cto/landing-v3`, unchanged.

## Commits

1. `04ea2d8` — fix: lift the auth compact-panel rule out of the components layer
2. `f5f1089` — fix: raise the password-reset fields to 44px
3. `fe96eeb` — fix: use tokens for the login illustration colours and match the live pulse

## Self-Check: PASSED

- FOUND: src/app/globals.css (unlayered media block after `@layer components` close)
- FOUND: src/components/compte/mot-de-passe-oublie-form.tsx (`className="h-11"`)
- FOUND: src/components/compte/nouveau-mot-de-passe-form.tsx (`className="h-11"` ×2)
- FOUND: src/components/illustrations/espace-fenetre.tsx (`bg-success-muted`, `bg-[var(--live)]`, `color-mix(in_srgb,var(--live)_18%,transparent)`)
- FOUND commit 04ea2d8
- FOUND commit f5f1089
- FOUND commit fe96eeb

## Unresolved Questions

None.
