---
phase: quick
plan: 260904-mbc
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/motion/format-deroule.tsx
  - src/components/motion/confiance-faits.tsx
  - src/components/motion/assembly-card.tsx
  - .planning/phases/02-site-public/02-CONTEXT.md
autonomous: true
requirements: []
must_haves:
  truths:
    - "No literal *rem* font-size (text-[N.NNrem]) remains in format-deroule.tsx, confiance-faits.tsx, or assembly-card.tsx"
    - "Every migrated size carries its matching --line-height token, except assembly-card.tsx's two title sites which keep leading-[1.2] untouched (Rule 6 exemption)"
    - "No element ends up with two leading- utilities (one token, one literal) on the same class string"
    - "assembly-card.tsx lines 206 and 212 (title + its aria-hidden sizer twin) stay byte-identical to each other after migration"
  artifacts:
    - path: "src/components/motion/format-deroule.tsx"
      provides: "24 sites migrated to --text-micro/--text-small/--text-body tokens"
    - path: "src/components/motion/confiance-faits.tsx"
      provides: "5 sites migrated to --text-card/--text-micro/--text-body/--text-small tokens"
    - path: "src/components/motion/assembly-card.tsx"
      provides: "5 sites migrated to --text-body/--text-micro tokens, leading-[1.2] exemption preserved on the two title sites"
    - path: ".planning/phases/02-site-public/02-CONTEXT.md"
      provides: "D-92 through D-95 decision entries"
  key_links:
    - from: "src/components/motion/assembly-card.tsx:206"
      to: "src/components/motion/assembly-card.tsx:212"
      via: "identical className string (title and its aria-hidden sizer twin)"
      pattern: "font-heading text-\\[length:var\\(--text-body\\)\\] leading-\\[1\\.2\\] font-bold"
---

<objective>
Run 3b: migrate the three `src/components/motion/` components (`format-deroule.tsx`, `confiance-faits.tsx`, `assembly-card.tsx` — 34 literal-`rem` sites total) onto the typographic design tokens already defined in `globals.css`. Run 3 (`260903-cbb`) migrated `components/sections/` but these three files sit outside that directory and were missed.

Purpose: closes the gap the run-3 inventory found — these three components are the only remaining literal-`rem` sizes on the landing page.
Output: three components on tokens; four new decisions (D-92–D-95) recorded in `02-CONTEXT.md`.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/motion/format-deroule.tsx
@src/components/motion/confiance-faits.tsx
@src/components/motion/assembly-card.tsx
@.planning/phases/02-site-public/02-CONTEXT.md
@src/app/globals.css
</context>

<interfaces>
Tokens available in src/app/globals.css (lines 91-106), each with a matching `--text-X--line-height` token:
- `--text-card` (1.25rem / 20px), `--text-body` (1rem / 16px), `--text-small` (0.875rem / 14px), `--text-micro` (0.75rem / 12px)

Syntax rule (paid for in run 1, D-79): `text-[var(--text-X)]` compiles to `color:`, not `font-size` — the correct form is `text-[length:var(--text-X)]`.
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Migrate format-deroule.tsx (24 sites)</name>
  <files>src/components/motion/format-deroule.tsx</files>
  <action>
Apply these literal-string substitutions everywhere they occur in the file. Do not touch any other class on the same element (color, weight, tracking, padding, etc.) — only the size/leading tokens named below.

Rule 1 — replace each of `text-[0.8rem]`, `text-[0.68rem]`, `text-[0.72rem]`, `text-[0.6rem]`, `text-[0.78rem]` with `text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)]` (14 sites: lines 106, 131, 132, 157, 164, 180, 205, 208, 222, 250, 292, 308, 313, 343 — but match by literal string, not line number, since the file may have shifted).

Rule 2 — replace each of `text-[0.86rem]`, `text-[0.9rem]`, `text-[0.88rem]`, `text-[0.84rem]` with `text-[length:var(--text-small)] leading-[var(--text-small--line-height)]` (7 sites: lines 174, 178, 186, 277, 301, 322, 323).

Rule 3 — replace `text-[1.02rem]` (no existing leading) with `text-[length:var(--text-body)] leading-[var(--text-body--line-height)]` (1 site: line 169).

Rule 4 — replace the full pair `text-[0.98rem] leading-[1.55]` (appears twice, lines 113 and 114, in two different conditional branches of the same ternary — both must change identically) with `text-[length:var(--text-body)] leading-[var(--text-body--line-height)]`. The old `leading-[1.55]` must be removed, not left alongside the new token — two `leading-` utilities on one element render unpredictably (Tailwind emission order decides, not source order).

After migration, confirm no `leading-[` followed by a bare number remains anywhere in this file.
  </action>
  <verify>
    <automated>npm run lint -- --no-cache 2>&1 | tail -20</automated>
  </verify>
  <done>All 24 literal text-[N.NNrem] sizes replaced per the four rules above; no bare-number leading-[ remains; file still compiles (checked in Task 3).</done>
</task>

<task type="auto">
  <name>Task 2: Migrate confiance-faits.tsx and assembly-card.tsx (10 sites)</name>
  <files>src/components/motion/confiance-faits.tsx, src/components/motion/assembly-card.tsx</files>
  <action>
In `confiance-faits.tsx`:
- Replace the full pair `text-[1.08rem] leading-[1.3]` (line 57, the accordion-trigger title) with `text-[length:var(--text-card)] leading-[var(--text-card--line-height)]` (D-93: this fact title is an accordion trigger like the module titles and FAQ questions run 3 already sent to --text-card; one role, one token).
- Replace `text-[0.78rem]` (line 60) with `text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)]`.
- Replace both occurrences of the full pair `text-[0.94rem] leading-[1.6]` (lines 76 and 92 — the closed description and the open preuve, same value, must change identically) with `text-[length:var(--text-body)] leading-[var(--text-body--line-height)]`.
- Replace `text-[0.85rem]` (line 98) with `text-[length:var(--text-small)] leading-[var(--text-small--line-height)]`.

In `assembly-card.tsx`:
- Replace `text-[1.05rem]` at both line 206 (the visible title `<p>`) and line 212 (its `aria-hidden` sizer twin) with `text-[length:var(--text-body)]` — size only. **Leave `leading-[1.2]` untouched on both** (Rule 6 exemption, D-94: no token pairs a tight 1.2 leading with a 16px size, and 212 is the sizer that reserves the card's title box — pairing it to `--text-body--line-height` (1.6) would grow the box from ~20px to ~26px in a geometry-constrained animated card). After this change lines 206 and 212 must remain byte-identical to each other (same className string), as they were before.
- Replace `text-[0.78rem]` (lines 216 and 251) and `text-[0.68rem]` (line 228) with `text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)]`.

After migration, confirm the only `leading-[` followed by a bare number left in either file are the two `leading-[1.2]` sites in assembly-card.tsx.
  </action>
  <verify>
    <automated>npm run lint -- --no-cache 2>&1 | tail -20</automated>
  </verify>
  <done>All 10 sites replaced per the rules above; assembly-card.tsx's two leading-[1.2] sites are the only bare-number leading- left across both files; lines 206/212 in assembly-card.tsx remain identical to each other.</done>
</task>

<task type="auto">
  <name>Task 3: Record D-92–D-95, commit, verify</name>
  <files>.planning/phases/02-site-public/02-CONTEXT.md</files>
  <action>
Append four new decision entries after D-91, same list, same bullet format as existing entries in that section (`- **D-9N** (2026-09-04, fondateur): ...`):

- **D-92**: the three `components/motion/` components (`format-deroule.tsx`, `confiance-faits.tsx`, `assembly-card.tsx`) are migrated onto the typographic tokens; run 3's inventory scoped `components/sections/` and treated a section as its own file, missing these three, which sections delegate rendering to.
- **D-93**: `confiance-faits.tsx`'s fact title (line 57) moves to `--text-card` (20px) — it is an accordion trigger, same role as the module titles and FAQ questions run 3 already sent to `--text-card`.
- **D-94**: `assembly-card.tsx`'s title (lines 206/212) moves to `--text-body` (16px) but keeps `leading-[1.2]` — the sole exemption of this run. No token pairs a tight 1.2 leading with a 16px size, and line 212 is the sizer that reserves the animated card's title box; pairing it to `--text-body--line-height` would grow that box from ~20px to ~26px in a geometry-constrained card.
- **D-95**: a token `leading-` never cohabits with a literal `leading-` on the same element — migration always replaces the full size+leading pair together, never the size alone (except D-94's named exemption).

Commit the three source files and this CONTEXT.md update as one atomic commit: `git add src/components/motion/format-deroule.tsx src/components/motion/confiance-faits.tsx src/components/motion/assembly-card.tsx .planning/phases/02-site-public/02-CONTEXT.md && git commit -m "#refactor: migrate motion components to typography tokens"`.

Commit before running verification (not after). Then run, in order, and report the real output of each:
1. `npm run lint`
2. `npm run typecheck`
3. `npm run content:check` — expected to exit 1 (`faq.items` blocked in CADR-03, pre-existing, not a regression; do not attempt to fix it)

Do not run `npm run build` (would overwrite `.next` and serve stale code to the next Playwright verification pass).

Finally run `git rev-parse --abbrev-ref HEAD` and confirm it reports `gsd/phase-02-site-public`.
  </action>
  <verify>
    <automated>git rev-parse --abbrev-ref HEAD</automated>
  </verify>
  <done>D-92 through D-95 present in 02-CONTEXT.md; one atomic commit made before verification; lint and typecheck exit 0; content:check exits 1 with the expected pre-existing faq.items reason (no new registry gaps); branch confirmed as gsd/phase-02-site-public; nothing pushed.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

None — pure client-side presentational class-name substitution, no new input surface, no data flow change, no new dependency.

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|------------------|
| T-mbc-01 | Tampering | format-deroule.tsx / confiance-faits.tsx / assembly-card.tsx typography classes | accept | Literal string substitution only, no logic/behavior change; verified by lint/typecheck and the leading-pair invariant check in each task's <done> |
</threat_model>

<verification>
1. `npm run lint` exits 0.
2. `npm run typecheck` exits 0.
3. `npm run content:check` exits 1, reason unchanged (faq.items / CADR-03), no new gaps.
4. No `text-[N.NNrem]` literal remains in any of the three files.
5. No bare-number `leading-[` remains except assembly-card.tsx's two `leading-[1.2]` sites.
6. assembly-card.tsx lines 206/212 remain identical to each other.
7. D-92–D-95 present in 02-CONTEXT.md.
8. `git rev-parse --abbrev-ref HEAD` reports `gsd/phase-02-site-public`.
9. One atomic commit made, nothing pushed.
</verification>

<success_criteria>
- 34 literal-rem sites across the three motion components migrated per the six substitution rules.
- Rule 6 exemption (leading-[1.2] on assembly-card.tsx's two title sites) preserved exactly.
- D-92 through D-95 recorded in 02-CONTEXT.md.
- lint/typecheck exit 0; content:check exits 1 for the known pre-existing reason.
- Branch stays gsd/phase-02-site-public, nothing pushed.
</success_criteria>

<output>
Create `.planning/quick/260904-mbc-run-3b-migrer-format-deroule-confiance-f/260904-mbc-SUMMARY.md` when done
</output>
