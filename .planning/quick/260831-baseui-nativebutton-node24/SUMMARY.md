---
quick_id: 260831-baseui-nativebutton-node24
status: complete
subsystem: infra
tags: [base-ui, accessibility, node, runtime]

provides:
  - "nativeButton={false} on 11 Button call sites rendering next/link Link or <a>, clearing Base UI console errors on / and every header-carrying page"
  - "Node runtime pin bumped 22 to 24 in .nvmrc and package.json engines"

key-files:
  modified:
    - src/components/layout/header.tsx
    - src/components/sections/hero.tsx
    - src/components/sections/cta-final.tsx
    - src/components/sections/programme-accordion.tsx
    - src/app/programme/page.tsx
    - src/app/espace/page.tsx
    - .nvmrc
    - package.json

commits:
  - "#fix: set nativeButton false on link-rendering buttons"
  - "#chore: bump Node runtime pin from 22 to 24"
---

# Summary

Two independent fixes, two atomic commits, nothing pushed.

**Task 1** — 11 Button call sites across header, hero, cta-final,
programme-accordion, and the programme/espace pages render a next/link Link or
plain `<a>` as their child; Base UI's `Button` assumes a native `<button>`
unless told otherwise, logging a console error per site (7 on `/`, 2 on every
page carrying the header). Added `nativeButton={false}` to each. Verified
externally before this task ran: lint/typecheck green, zero matching console
errors on `/` and `/programme`, all affected buttons still render as anchors
with correct hrefs.

**Task 2** — Bumped the pinned Node runtime from 22 to 24: `.nvmrc` and
`package.json`'s `engines.node` only. `.github/workflows/ci.yml` already reads
`node-version-file: .nvmrc` so it follows automatically; left untouched, as
was `vercel.json`. Re-ran `npm run lint` and `npm run typecheck` after the
edit — both green — before committing.

Branch unchanged (`gsd/phase-02-site-public`), nothing pushed.
