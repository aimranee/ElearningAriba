---
quick_id: 260831-hjn
status: complete
---

# Quick Task 260831-hjn: Landing v2 Run 4 — hero/CTA swap, assembly connector animation, selectable parcours

Run 4 of `ariba-cto/notes/2026-08-31-brief-lot2-refonte-visuelle.md`. Swapped the
hero console frame and CTA-final assembly card, animated the assembly card's
connectors as a client island (progressive trace + comet), and made the six
format-modalites parcours rows selectable (click/keyboard) with a key-matched
companion aside — plus a one-line fix for an invisible label.

## What was done

**Task 1 — Swap hero console ↔ CTA-final assembly card; rename criterion 1**
- `hero.tsx`: removed the console `.frame` markup, ported the `.asm` assembly
  card verbatim (`data-slot="hero-assembly"`), added `ASM_PILL_ICONS`/
  `ASM_PILL_GRADIENTS`, reused existing `getModules()` result for the resume
  line (`moduleCount`/`totalHours`), removed now-unused `liveModule`. Import
  set updated: dropped `Calendar`/`Play`, added `UserCheck`/`Radio`.
- `cta-final.tsx`: removed the `.asm` markup and its consts/computation,
  ported the console `.frame` markup verbatim, reusing the existing
  `getModules()` fetch for `liveModule`. Added explicit `text-[var(--ink)]`
  on the console's outer white wrapper to counter the panel's inherited
  `text-white` (same fix pattern as the outgoing `.asm` wrapper had). Import
  set updated: dropped `Check`/`FileText`/`GraduationCap`/`Radio`/`UserCheck`,
  added `Play`, kept `Calendar`.
- `02-CONTEXT.md`/`02-UI-SPEC.md`: criterion 1 / §7 sentence updated from
  "hero console frame, CTA-final assembly card" to "hero assembly card,
  CTA-final console frame" in both files.
- Not one word of either object's copy changed — only markup relocation.

**Task 2 — Animate the assembly connectors (client island)**
- New `src/components/motion/assembly-connectors.tsx` (`"use client"`),
  modeled on `typewriter.tsx`'s pattern: refs + one `useEffect`, direct DOM
  style writes, `matchMedia("(prefers-reduced-motion: reduce)")`, no
  `useState`. Renders the same static SVG (3 literal bezier paths, 3
  `linearGradient` defs) — paths are never computed from element positions.
- Progressive trace: each path's `strokeDasharray`/`strokeDashoffset` set to
  `getTotalLength()` on mount, then an `IntersectionObserver` (threshold
  0.4, disconnects after first trigger) sets `strokeDashoffset` to `0` per
  path with a `${index * 140}ms` stagger via `transitionDelay`; the
  transition itself is `stroke-dashoffset 1.1s var(--ease-brand)`.
- Comet: one `<circle>` per path using `offset-path`, animated via new
  `@keyframes comet` in `globals.css` (`offset-distance: 0% → 100%`),
  applied as `animation: comet 2.6s var(--ease-brand) infinite` with a
  `${index * 0.5}s` stagger; comets start at `opacity: 0` and flip to `1`
  inside the same intersection callback.
- Reduced motion: skips the observer entirely, writes
  `strokeDasharray:"none"`/`strokeDashoffset:"0"` directly (no transition)
  and sets comet circles to `display:none` synchronously — fully drawn,
  motionless curves, zero comet.
- `hero.tsx`'s inline static `<svg className="asm-wires">` replaced with
  `<AssemblyConnectors />`.

**Task 3 — Selectable parcours + invisible "à venir" label fix**
- `common.json`'s `formatModalitesAside` restructured: `items` now
  `{cle,label}[]`, `itemFutur` now `{cle,label}`. `cle` values are
  `slugify(titre)` of `landing.json`'s six `formatModalites.items` titles
  (verified against `scripts/seed-content.mjs`'s `slugify()`): confirmed
  each of the plan's six `cle` strings matches by hand-tracing the
  transliteration (accent-stripping, lowercase, non-alnum → `-`).
- New `src/components/motion/format-parcours.tsx` (`"use client"`):
  `useState(0)` selection, six `<li><Reveal><button onClick=…>` rows
  (native buttons — Enter/Space activation for free), rail pip/segment
  fill keyed off `selected` instead of the old hardcoded `index === 0`.
  Aside renders all 6 rows always visible, `aria-current="true"` plus a
  violet highlight applied by `cle` match against `items[selected].cle`
  (never by index — DB order and aside order differ for the "vidéo" row).
  Fixed the invisible-label bug in the same file: `text-[var(--muted)]`
  (a near-white surface token) on the "à venir" row replaced with
  `text-[var(--muted-ink)]`.
- `format-modalites.tsx`: server fetch/error-gate/`resume` computation
  unchanged; inline `<ol>`+rail+`<Card>` JSX replaced with
  `<FormatParcours items={items} aside={{...common.formatModalitesAside, resume}} />`.
  `STEP_GRADIENTS` const moved into the new client component (its only
  consumer); unused `Check`/`GraduationCap`/`Layers`/`Card`/`Reveal`
  imports dropped from `format-modalites.tsx`.

## Deviations from Plan

None — plan executed as written. The `02-UI-SPEC.md` edit alongside
`02-CONTEXT.md` in Task 1 was explicitly flagged by the plan itself as a
deliberate consistency fix, not an out-of-scope deviation.

## Verification results

- `npm run lint`: 0 errors.
- `npm run typecheck`: 0 errors (`next typegen && tsc --noEmit` clean).
- `npm run build`: exits 0, 14 routes listed, all previously-static routes
  still static/ISR (`/` at 1h/1y).
- `.next/server/app/index.html`: `data-slot="hero-assembly"` present,
  `data-slot="hero-console"` absent (0 matches); hero section contains
  assembly-card copy ("Votre parcours SAP Ariba — assemblage", 3 pill
  labels, "Parcours SAP Ariba" badge); cta-final section contains console
  copy ("Créneaux disponibles", 3 slot dates, "Emplacement vidéo de
  présentation…"); both floating badge strings ("Support PDF par module",
  "Préparation certification") remain in the hero section.
- `grep -n "cubic-bezier\|ease-in\|ease-out\|linear" src/components/motion/assembly-connectors.tsx`:
  only `linearGradient`/`linearGradient` matches, no bare easing keyword.
- `grep -n "@keyframes comet" src/app/globals.css`: present, uses
  `offset-distance`.
- Parcours `<ol>` in `.next/server/app/index.html` contains exactly 6
  `<button` elements (verified via node script scoping the match to the
  `<ol>` block, since the page has other unrelated buttons).
  `aria-current="true"` appears exactly once, on the row whose label is
  "Sessions animées en direct" (cle `formations-live`) — confirmed this is
  `landing.json`'s `formatModalites.items[0].titre` ("Formations live"),
  i.e. DB-order index 0, matching `useState(0)`'s default selection.
- `grep -rn "var(--muted)\]" src/components/` (excluding `--muted-ink`):
  zero matches — the format-modalites aside row was the only call site.
- `git log --oneline src/` across the diff for `cubic-bezier`: exactly one
  distinct value, `cubic-bezier(0.16, 1, 0.3, 1)`, codebase-wide.
- Raw hex audit of the full task diff: only pre-existing hex values were
  relocated between files (`#0E9F6E`, `#28C840`, `#B4771A`, `#D6D3F0`,
  `#EF4444`, `#FBFBFE`, `#FEBC2E`, `#FF5F57`, `#FFF4E3`, `#fff`) — all
  present in the pre-Run-4 versions of `hero.tsx`/`cta-final.tsx`/
  `format-modalites.tsx`; none newly introduced.
- Local dev server (`localhost:3000/`) returns HTTP 200, zero occurrences
  of "Une erreur est survenue", and contains both the swapped assembly
  card and console frame copy — local Supabase is up and serving content.
- `git status`: three commits on `gsd/phase-02-site-public`, nothing
  pushed.

## Manual/visual verification still owed

`prefers-reduced-motion: reduce` DevTools emulation for the assembly
connectors (static, fully-drawn curves, zero comet) was not run in this
session — the reduce-branch code path was verified statically (direct
style writes bypassing the transition, comet `display:none` set
synchronously before paint) per the plan's own note that "a static grep
cannot verify the rendered pixel outcome, only that the reduce-branch code
path exists." Per the founder's standing decision (STATE.md), all
mid-phase visual reviews for this phase batch into plan `02-11` — this one
should be added to that batch.

## Next-readiness

No blockers. Console/assembly copy audited byte-for-byte identical to the
pre-Run-4 source (only container/section changed, confirmed via source
diff — no text node edits in either ported block). Ready for the next
quick task or for phase-02-site-public's remaining plan 02-11.
