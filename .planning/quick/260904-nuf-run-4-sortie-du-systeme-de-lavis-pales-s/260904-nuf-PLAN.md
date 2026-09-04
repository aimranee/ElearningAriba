---
phase: quick
plan: 260904-nuf
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/sections/section.tsx
  - src/app/layout.tsx
  - src/app/globals.css
  - src/components/motion/card-spotlight.tsx
  - src/components/sections/pour-qui.tsx
  - src/components/sections/competences.tsx
  - src/components/sections/programme-accordion.tsx
  - src/components/sections/confiance.tsx
  - src/components/sections/faq.tsx
  - .planning/phases/02-site-public/02-CONTEXT.md
autonomous: true
requirements: []
must_haves:
  truths:
    - "The landing page's four tinted bands are gone; the section background computes to pure white (#FFFFFF) except two soft washes on Programme and Confiance"
    - "No blurred-blob atmosphere or grid-fade node exists anywhere in the DOM"
    - "The six gradient tiles (five in Pour qui, six in Compétences) render a two-stop linear-gradient background with a white glyph on top"
    - "Each card's shadow is tinted by its own tile color via color-mix on --tuile-b, never the neutral navy contact shadow"
    - "Each Pour qui / Compétences card shows a pointer-following radial-gradient halo, and that halo node is display:none under prefers-reduced-motion"
    - "hero-spotlight.tsx and its reduced-motion behavior are unchanged"
  artifacts:
    - path: "src/components/motion/card-spotlight.tsx"
      provides: "pointer-following halo, mousemove+rAF, reduced-motion absent via CSS"
    - path: "src/app/globals.css"
      provides: "--paper: #ffffff, --wash-ground token, purged atmosphere rules, card-spotlight reduced-motion rule"
    - path: ".planning/phases/02-site-public/02-CONTEXT.md"
      provides: "D-96 through D-100 appended after D-95"
  key_links:
    - from: "src/components/sections/pour-qui.tsx"
      to: "src/components/motion/card-spotlight.tsx"
      via: "<CardSpotlight /> mounted inside each Card, reads --tuile-a from the ancestor's inline style"
      pattern: "CardSpotlight"
    - from: "src/components/sections/competences.tsx"
      to: "src/components/motion/card-spotlight.tsx"
      via: "<CardSpotlight /> mounted inside each tile card, reads --tuile-a from the ancestor's inline style"
      pattern: "CardSpotlight"
    - from: "src/app/globals.css"
      to: "[data-slot=\"card-spotlight\"]"
      via: "prefers-reduced-motion media query sets display:none, same rule as hero-spotlight (AC-7/D-11)"
      pattern: "card-spotlight"
---

<objective>
Run 4/5 of the scale/palette rework: reverse the landing's colour role. Today saturated colour washes the surfaces (bands, atmosphere blobs, soft-fill tiles); this run concentrates saturated colour into a small icon tile on a white card, matching 26academy's pattern. Four tinted bands and the four-blob atmosphere layer are removed; two soft one-off gradient washes replace them on Programme and Confiance only; the six gradient icon tiles get measured AA-passing stops; every card's shadow is tinted by its own tile; a new pointer-following halo (`card-spotlight.tsx`) is added to the Pour qui and Compétences cards, mirroring the hero's existing spotlight pattern and its reduced-motion rule.

Purpose: per `2026-09-04-brief-run-4-sortie-du-systeme-de-lavis-pales.md` — the founder judged the landing weak against 26academy; the audit found the defect is not the palette (identical tokens) but the role given to colour (surfaces tinted vs. one saturated tile on white).
Output: `section.tsx`'s `wash` tone + `--wash-ground` token; atmosphere layer removed; six measured gradient tiles across Pour qui and Compétences; tinted card shadows; `card-spotlight.tsx`; D-96 through D-100 recorded in `02-CONTEXT.md`.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/sections/section.tsx
@src/app/layout.tsx
@src/app/globals.css
@src/components/motion/hero-spotlight.tsx
@src/components/sections/pour-qui.tsx
@src/components/sections/competences.tsx
@.planning/phases/02-site-public/02-CONTEXT.md
</context>

<interfaces>
From `src/components/motion/hero-spotlight.tsx` — the pattern `card-spotlight.tsx` must mirror (pointer-following halo, `closest()` scoping, no `window` listener, reduced-motion via CSS `display:none` on the `data-slot`, never a React state toggle):

```typescript
"use client";
import { useEffect, useRef } from "react";
function HeroSpotlight() {
  const spotRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const spot = spotRef.current;
    const hero = spot?.closest<HTMLElement>('[data-slot="hero"]');
    if (!spot || !hero) return;
    const onMouseMove = (event: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      spot.style.left = `${event.clientX - rect.left}px`;
      spot.style.top = `${event.clientY - rect.top}px`;
      spot.style.opacity = "1";
    };
    // ...addEventListener("mousemove", onMouseMove, { passive: true }), cleanup on unmount
  }, []);
  return <span ref={spotRef} aria-hidden="true" data-slot="hero-spotlight" ... />;
}
```

globals.css reduced-motion rule this run extends (`src/app/globals.css` inside the existing `@media (prefers-reduced-motion: reduce)` block, `@layer components`):

```css
[data-slot="hero-spotlight"] {
  display: none;
}
```

`src/lib/utils.ts` exports `cn()` = `twMerge(clsx(inputs))` — later classes in the same utility group (e.g. `rounded-*`, `shadow-*`, `hover:-translate-y-*`) win over earlier ones. `components/ui/card.tsx`'s `variant="default"` base classes (not modified this run, read-only): `border-[var(--hairline)] bg-background shadow-[var(--contact),var(--inset-hi)] rounded-xl hover:-translate-y-[3px] hover:border-[var(--hairline-2)] hover:shadow-[var(--shadow-1),var(--inset-hi)]` — this run's `className` overrides on `<Card>` call sites replace the `rounded-*`, `shadow-*` and `hover:-translate-y-*` groups via `cn()`/`twMerge`; `bg-background` already resolves to white once `--paper` changes (no override needed) and the hairline border is already correct (no override needed).
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Remove the tinted bands and the atmosphere layer; lay the wash token</name>
  <files>src/components/sections/section.tsx, src/app/layout.tsx, src/app/globals.css, src/components/atmosphere/atmosphere-layer.tsx, src/components/atmosphere/mesh-drift.tsx</files>
  <action>
Per brief §A and §B.

In `src/components/sections/section.tsx`: remove the line `tone === "band" && "bg-[var(--violet-band)]"` from the `Section` component's `className`. Narrow `SectionTone` from `"default" | "band"` to `"default" | "wash"` and add a new conditional class:
`tone === "wash" && "bg-[linear-gradient(180deg,transparent_0%,var(--wash-ground)_50%,transparent_100%)]"`.
Update the component doc comment: the root atmosphere layer no longer exists (this run removes it) and `band` no longer exists as a tone — replace references accordingly.

In `src/app/globals.css` `:root`: change `--paper: #fcfcff;` to `--paper: #ffffff;`. Add a new token immediately after `--violet-band: #e7ebff;`: `--wash-ground: #f6f5ff;`. Leave `--violet-band` declared and unused (dead token, do not delete — other lots may read it; removal belongs to a cleanup run).

In `src/app/globals.css` `@layer components`: delete the `.bg-fixed`, `.mesh-layer`, `.mesh`, `.grid-fade` rule blocks and the `@keyframes m1`, `@keyframes m2`, `@keyframes m3`, `@keyframes m4` blocks entirely (currently lines ~237-319). Delete the now-dead `.mesh { animation: none; }` override inside the `@media (prefers-reduced-motion: reduce)` block. In the same reduced-motion block, extend the existing `[data-slot="hero-spotlight"] { display: none; }` rule to also cover the new halo this plan introduces in Task 2: change the selector to `[data-slot="hero-spotlight"], [data-slot="card-spotlight"] { display: none; }`. Update the stale comment above `.bg-fixed` (currently describing the atmosphere mount point) to note the atmosphere layer was removed 2026-09-04 (D-97) — do not describe a mount point that no longer exists.

In `src/app/layout.tsx`: remove the `import { AtmosphereLayer } from "@/components/atmosphere/atmosphere-layer";` and `import { MeshDrift } from "@/components/atmosphere/mesh-drift";` lines, and remove the `<AtmosphereLayer />` and `<MeshDrift />` elements from the JSX. Leave `RevealScope`, `ScrollProgress`, `Header`, `Footer` and everything else untouched.

Delete the files `src/components/atmosphere/atmosphere-layer.tsx` and `src/components/atmosphere/mesh-drift.tsx`.

Do not touch `hero-spotlight.tsx` — it is a distinct component mounted inside the hero and is not the atmosphere layer this task removes.

This deliberately invalidates AC-3 ("the atmosphere mounts once at the root") by founder decision — do not attempt to preserve it; it is recorded as D-97 in Task 3.
  </action>
  <verify>
    <automated>npm run typecheck</automated>
  </verify>
  <done>section.tsx has no "band" tone and a working "wash" tone using --wash-ground; globals.css has --paper: #ffffff, --wash-ground: #f6f5ff, and no .bg-fixed/.mesh-layer/.mesh/.grid-fade/m1-m4 rules; layout.tsx no longer imports or mounts AtmosphereLayer/MeshDrift; both atmosphere component files are deleted; npm run typecheck exits 0 (no dangling imports).</done>
</task>

<task type="auto">
  <name>Task 2: Six measured gradient tiles, white cards, tinted shadows, pointer halo</name>
  <files>src/components/motion/card-spotlight.tsx, src/components/sections/pour-qui.tsx, src/components/sections/competences.tsx</files>
  <action>
Per brief §C, §D, §E.

Create `src/components/motion/card-spotlight.tsx`, a client component `CardSpotlight` mirroring `hero-spotlight.tsx`'s pattern exactly: a `useEffect` that returns early under `window.matchMedia("(prefers-reduced-motion: reduce)").matches`, an outer `<span aria-hidden="true" data-slot="card-spotlight">` ref used with `closest('[data-slot="card"]')` to find its ancestor card element, a `mousemove` listener attached to that card element (never `window`) with `{ passive: true }`, rAF-throttled (a `pending` boolean gate around a single `requestAnimationFrame` call per frame, exactly like `mesh-drift.tsx`'s throttle pattern), mutating an inner glow span's `style.left`/`style.top` directly — no React state anywhere. The outer span's classes: `pointer-events-none absolute inset-0 overflow-hidden rounded-[22px]`. The inner glow span (a second ref, nested inside the outer span): classes `absolute size-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10`, inline `style={{ background: "radial-gradient(circle, var(--tuile-a) 0%, transparent 62%)" }}`. `--tuile-a` is not set by this component — it inherits from the ancestor card's own inline style (set in Task 2's Pour qui/Compétences edits below). Clean up the `mousemove` listener on unmount. Export `{ CardSpotlight }`.

In `src/components/sections/pour-qui.tsx`: import `CardSpotlight` from `@/components/motion/card-spotlight`. Replace `PROFIL_ACCENTS`'s and `FALLBACK`'s shape from `{ accent, ink }` to `{ tileA, tileB, ink }`, using these exact measured values (brief §C):
- `acheteur`: `{ tileA: "var(--violet)", tileB: "var(--indigo)", ink: "var(--violet-ink)" }`
- `category-manager`: `{ tileA: "var(--sky-ink)", tileB: "var(--azur-ink)", ink: "var(--azur-ink)" }`
- `supply-chain`: `{ tileA: "var(--mint-ink)", tileB: "var(--azur-ink)", ink: "var(--mint-ink)" }`
- `consultant`: `{ tileA: "var(--magenta-ink)", tileB: "var(--violet-ink)", ink: "var(--magenta-ink)" }`
- `etudiant`: `{ tileA: "var(--amber-ink)", tileB: "var(--coral-ink)", ink: "var(--amber-ink)" }`
- `FALLBACK`: `{ tileA: "var(--violet)", tileB: "var(--indigo)", ink: "var(--violet-ink)" }`

On the `<Card>` element: remove `group-hover:bg-[linear-gradient(160deg,var(--card-wash)_0%,white_62%)] group-focus-within:bg-[linear-gradient(160deg,var(--card-wash)_0%,white_62%)]` from `className` entirely (the hover wash disappears — cards stay white always). Replace the remaining `className` with: `"relative h-full p-[1.7rem] rounded-[22px] shadow-[0_1px_2px_var(--carte-ombre-1),0_24px_50px_-28px_var(--carte-ombre-2)] duration-[var(--duration-reveal)] hover:-translate-y-[7px] hover:shadow-[0_1px_2px_var(--carte-ombre-1),0_24px_50px_-28px_color-mix(in_srgb,var(--tuile-b)_55%,transparent)]"`. Replace the inline `style` object's `"--card-wash"` key with `"--tuile-a": accentInk.tileA, "--tuile-b": accentInk.tileB` and add `"--carte-ombre-1": "color-mix(in srgb, var(--tuile-b) 8%, transparent)"`, `"--carte-ombre-2": "color-mix(in srgb, var(--tuile-b) 42%, transparent)"`; keep `"--card-ink": accentInk.ink` unchanged. As the first child inside `<Card>`, render `<CardSpotlight />`.

Replace the pastille span's classes from `bg-[var(--card-wash)] text-[var(--card-ink)]` to `bg-[linear-gradient(140deg,var(--tuile-a)_0%,var(--tuile-b)_100%)] text-white` (keep `flex size-[52px] shrink-0 items-center justify-center rounded-[16px] transition-transform duration-[500ms] ease-[var(--ease-brand)] group-hover:scale-[1.08] group-hover:-rotate-[4deg] group-focus-within:scale-[1.08] group-focus-within:-rotate-[4deg]` unchanged). `Picto` keeps `className="size-6"` (now renders white via inherited `text-white`).

Leave the name span (`text-[var(--card-ink)]`) and the `ArrowRight` icon (`text-[var(--card-ink)]`) untouched — they keep reading the same `--card-ink` custom property, still pointed at the same `-ink` token values as before.

In `src/components/sections/competences.tsx`: import `CardSpotlight`. Replace `CARD_TEINTES`'s shape from `{ soft, ink }` to `{ a, b }`, using these exact measured values (brief §C):
- `"ecosysteme-ariba"`: `{ a: "var(--violet)", b: "var(--indigo)" }`
- `"procure-to-pay"`: `{ a: "var(--sky-ink)", b: "var(--azur-ink)" }`
- `"source-to-pay"`: `{ a: "var(--mint-ink)", b: "var(--azur-ink)" }`
- `"rfq-rfp"`: `{ a: "var(--amber-ink)", b: "var(--coral-ink)" }`
- `"gestion-catalogues"`: `{ a: "var(--magenta-ink)", b: "var(--violet-ink)" }`
- `certification`: `{ a: "var(--coral-ink)", b: "var(--magenta-ink)" }`
Fallback (when `item.cle` doesn't match): `{ a: "var(--violet)", b: "var(--indigo)" }`.

Replace the item wrapper `<div>`'s className with: `"relative flex h-full min-h-[13.5rem] flex-col gap-[0.9rem] rounded-[22px] border border-[var(--hairline)] bg-white p-[1.6rem] shadow-[0_1px_2px_var(--carte-ombre-1),0_24px_50px_-28px_var(--carte-ombre-2)] transition-[transform,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-brand)] hover:-translate-y-[7px] hover:shadow-[0_1px_2px_var(--carte-ombre-1),0_24px_50px_-28px_color-mix(in_srgb,var(--tuile-b)_55%,transparent)]"`, and its inline `style` to `{ "--tuile-a": teinte.a, "--tuile-b": teinte.b, "--carte-ombre-1": "color-mix(in srgb, var(--tuile-b) 8%, transparent)", "--carte-ombre-2": "color-mix(in srgb, var(--tuile-b) 42%, transparent)" } as React.CSSProperties`. Render `<CardSpotlight />` as the first child of this div.

Replace the bare conditional `{Picto ? (<Picto aria-hidden="true" className="size-7 shrink-0 text-[var(--tuile-ink)]" />) : null}` with a pastille wrapper matching Pour qui's tile shape:
`{Picto ? (<span aria-hidden="true" className="flex size-[52px] shrink-0 items-center justify-center rounded-[16px] bg-[linear-gradient(140deg,var(--tuile-a)_0%,var(--tuile-b)_100%)]"><Picto className="size-6 text-white" /></span>) : null}`.
Leave the title (`text-[var(--ink)]`) and description (`text-[var(--ink-soft)]`) paragraphs untouched — they never read the tile tokens.

Also in `pour-qui.tsx`: change both `<Section tone="band">` occurrences (the error-state branch and the main return, two lines) to `<Section tone="default">` — Pour qui loses its tint per brief §A's reassignment table.

`color-mix` is explicitly authorized here (brief §D) — these are shadow color computations, never ink read over a surface; the run-3 "no color-mix" rule applied to ink-bearing surfaces only.
  </action>
  <verify>
    <automated>npm run typecheck</automated>
  </verify>
  <done>card-spotlight.tsx exports CardSpotlight following hero-spotlight.tsx's pattern (mousemove+rAF+closest+no-state, reduced-motion return); pour-qui.tsx and competences.tsx cards are white with rounded-[22px], render a two-stop --tuile-a/--tuile-b gradient tile with a white glyph, a --tuile-b-tinted shadow via color-mix, and mount <CardSpotlight />; pour-qui.tsx's --card-wash hover gradient is gone; pour-qui.tsx renders tone="default" (both branches); npm run typecheck exits 0.</done>
</task>

<task type="auto">
  <name>Task 3: Flip remaining section tones, record D-96 to D-100, run the verification suite</name>
  <files>src/components/sections/programme-accordion.tsx, src/components/sections/confiance.tsx, src/components/sections/faq.tsx, .planning/phases/02-site-public/02-CONTEXT.md</files>
  <action>
Per brief §A and §G. `pour-qui.tsx`'s tone flip to `default` is handled in Task 2 (that file's sole `tone=` edit); do not touch it again here.

In `src/components/sections/programme-accordion.tsx`: change both `<Section tone="band">` occurrences (error-state branch, line ~36, and the main return, line ~56) to `<Section tone="wash">`.

In `src/components/sections/confiance.tsx`: change both `<Section tone="band">` occurrences (error-state branch, line ~36, and the main return, line ~48) to `<Section tone="wash">`.

In `src/components/sections/faq.tsx`: change both `<Section tone="band">` occurrences (error-state branch, line ~42, and the main return, line ~61) to `<Section tone="default">`.

Do not touch `format-modalites.tsx` or `cta-final.tsx` — both stay `tone="default"`, unchanged, per brief §F's do-not-touch list. Do not touch `components/ui/`, the header/footer/mobile-nav shell, `format-deroule.tsx`, `confiance-faits.tsx`, `assembly-card.tsx`, `hero.tsx`, or any Lot 3/Lot 4 page. The 11 `--tint` call sites (the secondary grey block, legitimate per brief §F) stay untouched.

In `.planning/phases/02-site-public/02-CONTEXT.md`, append the following five entries to the decision list immediately after the existing D-95 bullet (same list, same `- **D-NN** (date, attribution): text` format), before the `### Claude's Discretion` heading — copy verbatim, do not paraphrase:

- **D-96** (2026-09-04, fondateur) — le lavis pâle sur les surfaces est abandonné ; la couleur saturée se concentre dans la tuile d'icône, le fond reste blanc.
- **D-97** (2026-09-04, fondateur) — AC-3 est retirée : l'atmosphère est supprimée par décision du fondateur.
- **D-98** (2026-09-04, fondateur) — aucun jeton `-soft` ne peut porter un glyphe blanc ; les six dégradés sont bâtis sur la famille `-ink`, valeurs mesurées au brief.
- **D-99** (2026-09-04, fondateur) — l'ombre de carte est teintée par `--tuile-b` via `color-mix`, usage autorisé parce qu'aucune encre n'est lue par-dessus.
- **D-100** (2026-09-04, fondateur) — `card-spotlight` suit la règle AC-7 du héros : absent, pas figé, sous reduce-motion.

Commit the source changes (Tasks 1-3's component/CSS edits) and the D-96..D-100 CONTEXT.md append as separate atomic commits, per project convention (`#type: one sentence`, no AI/phase/plan reference) — commit before running the verification suite below, not after.

Then run, in sequence, and report the real exit codes and output of each:
1. `npm run lint`
2. `npm run typecheck`
3. `npm run content:check`

`content:check` is expected to exit 1 with 82 blocked keys (CADR-03/CADR-01) — this is the pre-existing gate, not a regression; do not attempt to fix it. Do not run `npm run build`.
  </action>
  <verify>
    <automated>npm run lint &amp;&amp; npm run typecheck</automated>
  </verify>
  <done>pour-qui/programme-accordion/confiance/faq render the correct tone prop (default/wash/wash/default respectively); D-96 through D-100 appear verbatim in 02-CONTEXT.md immediately after D-95; git log shows atomic commits made before verification; npm run lint and npm run typecheck both exit 0; npm run content:check exits 1 with the pre-existing 82-key count (not a new regression); npm run build was not run.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

None new. This run is a client-rendered visual/styling change (CSS custom properties, gradient tokens, a pointer-tracking motion component) with no new input surface, no data flow change, no new external dependency, and no new package installed.

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|------------------|
| T-nuf-01 | Information Disclosure | card-spotlight.tsx mousemove listener | accept | Reads only `event.clientX/clientY` (already public via any DOM listener) and writes only to its own node's `style.left/top`; no data leaves the client, no new listener scope beyond the card element itself (mirrors hero-spotlight.tsx, already accepted) |
| T-nuf-02 | Denial of Service (perf) | card-spotlight.tsx mousemove + rAF | accept | rAF-throttled (max one style write per frame), listener is `{ passive: true }`, scoped to the individual card element (not `window`), removed on unmount — same budget precedent as mesh-drift.tsx and hero-spotlight.tsx |
| T-nuf-03 | Tampering | npm/pip/cargo installs | accept | No package installs in this run — zero new dependencies added |
</threat_model>

<verification>
1. `npm run typecheck` exits 0 after each of Tasks 1 and 2.
2. `npm run lint` exits 0 after Task 3.
3. `npm run content:check` exits 1, flagging the pre-existing 82 blocked keys (CADR-03/CADR-01) — not a new regression.
4. `npm run build` is never run this plan.
5. `.planning/phases/02-site-public/02-CONTEXT.md` contains D-96 through D-100, verbatim, directly after D-95.
6. Manual code read: section.tsx has no "band" tone remaining anywhere in src/; --paper is #ffffff and --wash-ground: #f6f5ff exist in globals.css; atmosphere-layer.tsx and mesh-drift.tsx are deleted and unreferenced; card-spotlight.tsx exists and mirrors hero-spotlight.tsx's pattern; pour-qui.tsx and competences.tsx cards use --tuile-a/--tuile-b gradient tiles with white glyphs and color-mix-tinted shadows.
7. Commits are atomic and precede the verification suite run, per project convention.
</verification>

<success_criteria>
- Four tinted `band` sections are gone; `wash` tone (two soft gradient washes, Programme + Confiance) and `default` (transparent) are the only two tones left.
- `--paper` is pure white (#ffffff); no section renders the old `#e7ebff`/`#fcfcff` tint.
- Atmosphere layer (blobs + grid-fade + keyframes m1-m4) fully removed from layout.tsx, globals.css, and the filesystem.
- Six gradient icon tiles (Pour qui: 5, Compétences: 6) render measured two-stop gradients with white glyphs, AA ≥ 4.50 per the brief's table.
- Every Pour qui / Compétences card is white, rounded-[22px], with a --tuile-b-tinted shadow via color-mix and a pointer-following halo that is display:none under reduced motion.
- D-96 through D-100 recorded verbatim in 02-CONTEXT.md.
- lint/typecheck exit 0; content:check exits 1 at the pre-existing 82-key count; build not run.
- Commits are atomic, made before verification, on branch gsd/phase-02-site-public, nothing pushed.
</success_criteria>

<output>
Create `.planning/quick/260904-nuf-run-4-sortie-du-systeme-de-lavis-pales-s/260904-nuf-SUMMARY.md` when done
</output>
