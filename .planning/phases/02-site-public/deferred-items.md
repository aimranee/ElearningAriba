# Deferred Items — Phase 02 Site public

Out-of-scope discoveries logged during execution, not fixed (per SCOPE BOUNDARY).

## 02-01

- `src/components/ui/accordion.tsx`, `badge.tsx`, `input.tsx` still carry a bare
  Tailwind `transition-all` (compiles the Tailwind default curve
  `cubic-bezier(0.4,0,0.2,1)`), a second distinct curve alongside `--ease-brand`.
  Plan 02-01's task 2 scoped the single-curve fix to `card.tsx` and `button.tsx`
  only (per 02-PATTERNS.md §3.5, which flags exactly these two files). These
  three files are not in 02-01's `files_modified` and were not touched. If the
  phase-level `<verification>` "exactly one distinct `cubic-bezier` value"
  check is run against the *compiled* CSS bundle (not just `src/components/ui`
  by grep) it will still pass, since Tailwind's default transition curve is
  never spelled out as a literal `cubic-bezier(...)` in source — it only
  appears as `transition-all` with no explicit curve, which Tailwind resolves
  at build time. No source-level `cubic-bezier(...)` string exists for it, so
  the phase-level grep-for-cubic-bezier check is unaffected. Flagging so a
  later 02-site-public plan closes the same gap in these three files if it
  proves visible in the built stylesheet.
