---
quick_id: 260831-baseui-nativebutton-node24
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/layout/header.tsx
  - src/components/sections/hero.tsx
  - src/components/sections/cta-final.tsx
  - src/components/sections/programme-accordion.tsx
  - src/app/programme/page.tsx
  - src/app/espace/page.tsx
  - .nvmrc
  - package.json
autonomous: true
requirements: []

must_haves:
  truths:
    - "npm run lint and npm run typecheck stay green after both commits"
    - "Zero console errors matching 'Base UI: A component that acts as a button' on / and /programme"
    - "Every affected button still renders as an anchor with the correct href"
    - ".github/workflows/ci.yml and vercel.json are untouched"
  artifacts:
    - path: ".nvmrc"
      provides: "Node 24 runtime pin"
    - path: "package.json"
      provides: "engines.node 24.x, no other change"
---

<objective>
Two unrelated fixes, committed atomically and separately:

1. Base UI logs a console error when its `Button` renders a `next/link` `Link`
   or a plain `<a>` as its child without `nativeButton={false}` — Base UI
   defaults to assuming the child is a native `<button>`. 11 call sites across
   header, hero, cta-final, programme-accordion, and the programme/espace
   pages render link-like children, producing 7 errors on `/` and 2 on every
   page carrying the header. Set `nativeButton={false}` on each.
2. Bump the pinned Node runtime from 22 to 24 in `.nvmrc` and
   `package.json`'s `engines.node`. CI already reads
   `node-version-file: .nvmrc`, so no workflow change is needed.

Output: two commits, both `#fix`/`#chore`, nothing pushed.
</objective>

<tasks>

<task type="auto">
  <name>Task 1: nativeButton={false} on link-rendering Button call sites</name>
  <files>src/components/layout/header.tsx, src/components/sections/hero.tsx, src/components/sections/cta-final.tsx, src/components/sections/programme-accordion.tsx, src/app/programme/page.tsx, src/app/espace/page.tsx</files>
  <action>Add `nativeButton={false}` to each Button call site whose child is a next/link Link or plain &lt;a&gt;.</action>
  <verify>
    <automated>npm run lint && npm run typecheck</automated>
  </verify>
  <done>Six files committed alone; lint/typecheck green; console clear of Base UI button errors on / and /programme; every affected button still renders as an anchor with correct href.</done>
</task>

<task type="auto">
  <name>Task 2: bump Node runtime pin 22 to 24</name>
  <files>.nvmrc, package.json</files>
  <action>Change .nvmrc from 22 to 24; change package.json engines.node from "22.x" to "24.x". Nothing else in package.json. Do not touch .github/workflows/ci.yml or vercel.json.</action>
  <verify>
    <automated>npm run lint && npm run typecheck</automated>
  </verify>
  <done>Both files bumped; lint/typecheck stay green; committed separately from Task 1.</done>
</task>

</tasks>

<output>
Create `.planning/quick/260831-baseui-nativebutton-node24/SUMMARY.md` when done.
</output>
