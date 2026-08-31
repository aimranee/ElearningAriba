---
quick_id: 260831-gyj
status: complete
---

# Quick Task 260831-gyj: Refonte visuelle landing — Run 3 (parcours, assemblage, photo) + 2 corrections — Summary

Run 3 of 3 (landing v2 refonte): rewrote Format et modalités as a numbered
parcours with a sticky companion aside, split CTA final into a two-column
layout with a decorative assembly card, added a photo placeholder to
Confiance, fixed the mobile-nav burger icon, and reworded the AC-1/D-19
"niveau 3" acceptance criterion in both CONTEXT.md and UI-SPEC.md.

## Tasks completed

1. **Format et modalités — numbered parcours + companion aside + rail**
   (`41d40ea`) — six items rewritten from icon-tile cards into a numbered
   `<ol>` (niveau 1, zero box-shadow ever), per-index gradient number pills,
   hover/first-item tint + vertical liseré, a decorative progression rail,
   and a sticky niveau-2 `Card variant="default"` aside with a checklist and
   a module/hour resume computed from `getModules()`.

2. **CTA final assembly card + Confiance photo slot** (`e7f076f`,
   `6fbf521`) — `cta-final.tsx` panel split into a two-column grid; left
   column keeps its existing copy/CTAs untouched, right column adds the
   `.asm` decorative assembly card (static SVG wire connectors, three pill
   rows, gradient module summary card) as the section's sole `--shadow-4`
   consumer, dropped from the outer panel. `confiance.tsx` gets a
   left-aligned header row plus a dashed 16:9 photo placeholder above the
   fact grid. A follow-up fix commit (`6fbf521`) replaced a raw-hex
   `linear-gradient(180deg,#fff,#FBFBFE)` top-bar background with a plain
   `bg-white` to keep the raw-hex exception list to the four documented
   colors.

3. **Mobile-nav burger icon** (`e43f1d6`) — replaced the visible text label
   with `Menu`/`X` lucide icons; `aria-label`/`aria-expanded` unchanged, icon
   carries `aria-hidden="true"`.

4. **AC-1 wording fix** — reworded the "niveau 3 on exactly two rendered
   elements" sentence in both `02-CONTEXT.md` and `02-UI-SPEC.md` to "niveau
   3 on exactly two persistent surfaces", explicitly excluding `Button`'s
   primary-variant `hover:shadow-[var(--shadow-4)]` hover micro-interaction
   from the count. Docs-only, not committed by this executor (per
   constraints — orchestrator commits docs).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - correctness] Raw-hex asm top-bar gradient replaced with a token-safe solid**
- **Found during:** Task 2 final verification (raw-hex scan)
- **Issue:** The mockup's `.asm-bar` uses `background:linear-gradient(180deg,#fff,#FBFBFE)`; copying it verbatim would introduce two new undocumented raw hex values (`#fff`, `#FBFBFE`), beyond the plan's four documented exceptions (`#B4771A`, `#0E9F6E`, `#FF5F57`/`#FEBC2E`/`#28C840`, `#D6D3F0`).
- **Fix:** Replaced with `bg-white` (a plain solid, no new token needed) — visually near-identical, keeps the raw-hex exception list exact.
- **Files modified:** `src/components/sections/cta-final.tsx`
- **Commit:** `6fbf521`

**2. [Rule 3 - blocking] Mockup file location corrected**
- **Found during:** Context gathering
- **Issue:** The plan references `ariba-cto/notes/2026-08-31-maquette-lot2-landing-v2.html`, which does not exist under the product repo (`ElearningAriba`). It lives in the sibling workspace directory `C:\Users\Essakhi\Desktop\ElearningSAP\ariba-cto\notes\`.
- **Fix:** Read the mockup from the correct absolute path; no source change needed.
- **Files modified:** none (read-only lookup)

No other deviations — plan executed as written otherwise.

## Verification

- `npm run lint`, `npm run typecheck`, `npm run build` all exit 0.
- 14 routes still static/ISR (`○ (Static)` count unchanged from before this run).
- Format-modalites section markup: zero `shadow-[var(--shadow-3|4]` hits inside the section (grep confirmed); item texts "Formations live"/"Prérequis" present verbatim.
- `shadow-[var(--shadow-4),var(--inset-hi)]` present on exactly two rendered elements (hero console frame, `.asm` card).
- Pill labels "Appel découverte" / "Session live" / "Support PDF" each present once as visible text.
- Mobile-nav: `aria-label="Ouvrir le menu"` present; literal text node `>Ouvrir le menu<` absent (count 0).
- No `ease-in`/`ease-out`/`linear` bare easing keyword on any transition/animation in the four touched files (only `linear-gradient`/`ease-[var(--ease-brand)]` false positives).
- No price, no payment-provider name introduced in the diff (only a pre-existing code comment referencing the D-45 constraint by name).
- Raw hex confined to the four documented exceptions (`#B4771A`, `#0E9F6E`, `#FF5F57`/`#FEBC2E`/`#28C840`, `#D6D3F0`) plus one pre-existing, untouched `#000` in cta-final's mask-image gradient and the pre-existing `#FFF4E3` futur-badge treatment (kept verbatim per plan instruction, not newly introduced).

## Self-Check: PASSED

- FOUND: `src/components/sections/format-modalites.tsx`
- FOUND: `src/components/sections/cta-final.tsx`
- FOUND: `src/components/sections/confiance.tsx`
- FOUND: `src/components/layout/mobile-nav.tsx`
- FOUND: `41d40ea`, `e7f076f`, `e43f1d6`, `6fbf521` (all present in `git log`)
