---
status: complete
---

# Quick Task 260904-mbc: Run 3b — migrer les trois composants motion sur les crans typographiques

**Note:** reconstructed from the executor's returned final report — the in-worktree file
was inadvertently lost when the worktree was removed before a rescue-copy step ran (same
slip as `260903-cbb`, see that STATE.md entry).

## What was done

Migrated all 34 sites across the three files in scope, applying the six literal
substitution rules from section A of the brief:

- `src/components/motion/format-deroule.tsx` — 24 sites (rules 1-4)
- `src/components/motion/confiance-faits.tsx` — 5 sites (rules 1-6)
- `src/components/motion/assembly-card.tsx` — 5 sites (rules 1-6, rule 6 exemption
  preserved: `leading-[1.2]` left untouched)

Recorded **D-92 to D-95** in `.planning/phases/02-site-public/02-CONTEXT.md`.

## Commit

- `3b72513`: `#refactor: migrate motion components to typography tokens`

## Verification (re-run by orchestrator on the main tree, since the worktree lacked
Supabase env vars for `next typegen`)

- `npm run lint` — exit 0, no errors in the three touched files (13453 pre-existing
  project-wide problems unrelated to this change, confirmed by filtering output for
  the three filenames: zero matches)
- `npm run typecheck` — exit 0 (`next typegen && tsc --noEmit` clean)
- `npm run content:check` — exit 1, `faq.items` blocked in CADR-03 as expected —
  not a regression
- `npm run build` — not run (would overwrite `.next`)
- No grep on source used as a verification method

## Scope discipline

Only the three files in scope were touched, plus `02-CONTEXT.md` for the D-92–D-95
entries. `globals.css`, `components/sections/`, `components/ui/`, and the app shell
were not touched.

## Branch

Executed via worktree isolation (`worktree-agent-af52a51507e6432ab`), merged back
cleanly into `gsd/phase-02-site-public` with no file deletions. Final branch
confirmed: `gsd/phase-02-site-public`. Nothing pushed.
