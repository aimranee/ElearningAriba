---
phase: 260907-pik-auth-v2-correctifs
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/globals.css
  - src/components/compte/mot-de-passe-oublie-form.tsx
  - src/components/compte/nouveau-mot-de-passe-form.tsx
  - src/components/illustrations/espace-fenetre.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "The auth compact-panel media query rule actually applies at 1024-1279px width and short-viewport heights (currently dead inside @layer components)"
    - "Password-reset form fields are 44px tall like every other auth field"
    - "The login illustration's live badge dot and halo share the same coral hue, and no unauthorized raw colour literals remain"
  artifacts:
    - path: "src/app/globals.css"
      provides: "unlayered auth compact-panel media block"
      contains: "@media (min-width: 1024px) and (max-width: 1279px), (min-width: 1024px) and (max-height: 860px)"
  key_links:
    - from: "src/app/globals.css"
      to: "[data-slot=\"auth-panel\"], [data-slot=\"fenetre-puces\"]"
      via: "unlayered media query selector"
      pattern: "data-slot=\"auth-panel\""
---

<objective>
Fix three measured defects left by the auth v2 run (commits 627d90b..cedc609 on cto/landing-v3):
1. A compact-panel CSS rule in globals.css is dead because it sits inside `@layer components`, which always loses to Tailwind's utilities layer.
2. The two password-reset forms (`mot-de-passe-oublie-form.tsx`, `nouveau-mot-de-passe-form.tsx`) still render 32px fields instead of the 44px standard used everywhere else in auth.
3. The login illustration (`espace-fenetre.tsx`) uses a raw hex literal instead of a design token, and its "live" badge dot/halo colours don't match.

Purpose: close out auth v2 correctness gaps without touching anything outside their stated scope.
Output: three atomic commits, each independently verifiable.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/app/globals.css
@src/components/illustrations/espace-fenetre.tsx
@src/components/compte/mot-de-passe-oublie-form.tsx
@src/components/compte/nouveau-mot-de-passe-form.tsx
@src/components/compte/connexion-form.tsx
</context>

<interfaces>
<!-- Confirmed line references (as of this plan's authoring) — no discrepancies found. -->

globals.css:245 opens `@layer components`, closes at line 460 (the auth compact-panel media block is the last rule inside it, lines 452-459):
```css
  /* Auth v2 (brief §C-01): compact the night panel on short/mid viewports so
     the sticky panel and form column both fit without scrolling the panel
     itself — keyed on the two auth-shell data-slot hooks, no new token. */
  @media (min-width: 1024px) and (max-width: 1279px), (min-width: 1024px) and (max-height: 860px) {
    [data-slot="auth-panel"] h1 { font-size: 1.75rem; }
    [data-slot="auth-panel-inner"] { padding-top: 2rem; padding-bottom: 2rem; }
    [data-slot="fenetre-puces"] { display: none; }
  }
}
```

connexion-form.tsx:143-151 shows the established h-11 FieldControl pattern:
```tsx
<FieldControl
  id="connexion-email"
  name="email"
  type="email"
  autoComplete="email"
  className="h-11"
  data-loading={isSubmitting ? "true" : undefined}
  aria-invalid={fieldErrors.email ? "true" : undefined}
/>
```

espace-fenetre.tsx:23-30, the "En direct" badge (before fix):
```tsx
<span className="ml-auto inline-flex flex-none items-center gap-[0.4rem] whitespace-nowrap rounded-full bg-[rgba(31,199,155,.16)] px-[0.6rem] py-[0.25rem] text-[length:var(--text-micro)] font-extrabold uppercase tracking-[0.06em] text-[var(--mint-soft)]">
  <span
    aria-hidden="true"
    className="size-[7px] rounded-full bg-[var(--mint)]"
    style={{ animation: "pulse-live 1.8s var(--ease-brand) infinite" }}
  />
  En direct
</span>
```

globals.css:198 `--success-muted: #e6faf3;` and `@theme inline` (line 52) exposes `--color-success-muted: var(--success-muted)`, giving Tailwind utility `bg-success-muted`.

globals.css:219 `--live: #ff5f57;` and the `@keyframes pulse-live` (lines 352-362) animate a box-shadow built on `rgba(255, 95, 87, 0.55)` (same hue as `--live`).
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Lift the auth compact-panel rule out of the components layer</name>
  <files>src/app/globals.css</files>
  <action>Move the entire `@media (min-width: 1024px) and (max-width: 1279px), (min-width: 1024px) and (max-height: 860px) { ... }` block (currently the last rule inside `@layer components`, lines 452-459) out of that layer to the top level of the file, placed immediately after the closing `}` of `@layer components` (currently line 460). Keep the block's existing "why" comment and its three declarations (`[data-slot="auth-panel"] h1`, `[data-slot="auth-panel-inner"]`, `[data-slot="fenetre-puces"]`) unchanged, but extend the comment to state that the rule must stay unlayered because unlayered author CSS beats every `@layer` rule regardless of specificity — inside `@layer components` it always lost to Tailwind's utilities layer, which is why the compact treatment never actually applied. Do not change anything else in globals.css: no other rule moves, no token changes, no reordering of unrelated blocks.</action>
  <verify>
    <automated>MISSING — no automated CSS-cascade test exists in this repo; verify by reading the file: the media block must appear after the `@layer components` closing brace, and grep -v '^//' src/app/globals.css | grep -c '@layer components' must still equal 1 (block moved, not duplicated).</automated>
  </verify>
  <done>The `@media (min-width: 1024px)...` block for the auth compact panel sits unlayered, after `@layer components` closes; its three declarations and slot selectors are unchanged; the comment now explains why it must stay unlayered; no other part of globals.css was touched.</done>
</task>

<task type="auto">
  <name>Task 2: Raise the password-reset fields to 44px</name>
  <files>src/components/compte/mot-de-passe-oublie-form.tsx, src/components/compte/nouveau-mot-de-passe-form.tsx</files>
  <action>In mot-de-passe-oublie-form.tsx, add `className="h-11"` to the `FieldControl` for the email field (currently lines 89-96, no className prop). In nouveau-mot-de-passe-form.tsx, add `className="h-11"` to both `FieldControl` elements: the `motDePasse` field (currently lines 101-108) and the `confirmation` field (currently lines 119-126). Match connexion-form.tsx's existing pattern exactly (className as a plain string prop, no other prop reordering). Do not touch `SubmitButton` in either file — it already carries `h-11`. No other change to either file.</action>
  <verify>
    <automated>grep -c 'className="h-11"' src/components/compte/mot-de-passe-oublie-form.tsx (expect 1) &amp;&amp; grep -c 'className="h-11"' src/components/compte/nouveau-mot-de-passe-form.tsx (expect 2)</automated>
  </verify>
  <done>All three password-reset FieldControl elements (one in mot-de-passe-oublie-form.tsx, two in nouveau-mot-de-passe-form.tsx) carry className="h-11"; nothing else in either file changed.</done>
</task>

<task type="auto">
  <name>Task 3: Use tokens for the login illustration colours and match the live pulse</name>
  <files>src/components/illustrations/espace-fenetre.tsx</files>
  <action>In espace-fenetre.tsx: (a) on the "Confirmé" pill (line 45), replace `bg-[#e6faf3]` with `bg-success-muted`. (b) On the "En direct" badge (lines 23-30): change the dot's className from `size-[7px] rounded-full bg-[var(--mint)]` to `size-[7px] rounded-full bg-[var(--live)]`; change the badge span's className from `ml-auto inline-flex flex-none items-center gap-[0.4rem] whitespace-nowrap rounded-full bg-[rgba(31,199,155,.16)] px-[0.6rem] py-[0.25rem] text-[length:var(--text-micro)] font-extrabold uppercase tracking-[0.06em] text-[var(--mint-soft)]` to `ml-auto inline-flex flex-none items-center gap-[0.4rem] whitespace-nowrap rounded-full bg-[color-mix(in_srgb,var(--live)_18%,transparent)] px-[0.6rem] py-[0.25rem] text-[length:var(--text-micro)] font-extrabold uppercase tracking-[0.06em] text-white/90`. Keep the inline `style={{ animation: "pulse-live 1.8s var(--ease-brand) infinite" }}` on the dot, keep `whitespace-nowrap` and `flex-none` on the badge, and keep the "En direct" text content unchanged. The three window-chrome dots (`#FF5F57`, `#FEBC2E`, `#28C840` at lines 17-19) must NOT change. Do not touch parcours-etapes.tsx — it was checked during planning and contains no unauthorized raw hex/rgba literals beyond its own three window-chrome dots, which are the same recorded exception.</action>
  <verify>
    <automated>grep -c 'bg-\[#e6faf3\]' src/components/illustrations/espace-fenetre.tsx (expect 0) then grep -c 'rgba(31,199,155' (expect 0) then grep -c 'mint-soft' (expect 0) then grep -c 'bg-\[var(--live)\]' (expect 1) then grep -c 'color-mix(in_srgb,var(--live)_18%,transparent)' (expect 1)</automated>
  </verify>
  <done>The "Confirmé" pill uses bg-success-muted; the "En direct" dot and badge background both derive from --live; the badge text is text-white/90; the mint-soft class and the rgba literal are gone; the three window-chrome dots and the inline pulse-live animation are untouched; parcours-etapes.tsx is unmodified.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

None — this is a pure presentational CSS/styling fix with no new data input, no new endpoints, no user-controlled values.

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-260907-01 | Tampering | globals.css cascade layer move | accept | Pure static CSS reorg, no runtime input, verified by grep gate and visual review; no attack surface introduced |
</threat_model>

<verification>
1. `git diff --stat` shows exactly the four files listed in `files_modified`, no others.
2. Each of the three commits is atomic and scoped to exactly its stated file(s):
   - Commit 1: `src/app/globals.css` only.
   - Commit 2: `src/components/compte/mot-de-passe-oublie-form.tsx` and `src/components/compte/nouveau-mot-de-passe-form.tsx` only.
   - Commit 3: `src/components/illustrations/espace-fenetre.tsx` only.
3. Run the grep verification commands listed in each task's `<verify>` block.
4. `npx tsc --noEmit` (or the project's existing typecheck script) passes — no TypeScript errors introduced by className additions.
</verification>

<success_criteria>
- The auth compact-panel media query is unlayered and sits after `@layer components` closes, with an extended comment explaining why.
- All three password-reset FieldControl elements are 44px (`h-11`), matching connexion-form.tsx.
- espace-fenetre.tsx's "Confirmé" pill uses the `success-muted` token; its "En direct" dot and halo both derive from `--live`; no unauthorized raw hex/rgba literals remain outside the three recorded window-chrome dots.
- parcours-etapes.tsx is untouched (confirmed clean during planning — no findings to report).
- Exactly three commits exist, each matching the required message and scope.
</success_criteria>

<output>
Create `.planning/quick/260907-pik-auth-v2-correctifs-lift-dead-compact-pan/260907-pik-SUMMARY.md` when done
</output>
