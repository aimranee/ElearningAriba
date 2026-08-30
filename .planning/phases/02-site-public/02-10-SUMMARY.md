---
phase: 02-site-public
plan: 10
subsystem: ui
tags: [next.js, server-components, supabase, tailwind-v4, base-ui-accordion]

# Dependency graph
requires:
  - phase: 02-site-public
    provides: "02-01: raised Card variant, Section/SectionHeader eyebrow+titleAccent, EmptyState on a floating surface, --shadow-4/--shadow-brand tokens"
  - phase: 02-site-public
    provides: "02-02: content_section/content_item tables, cookieless read client, getSection/getSectionItems query layer"
  - phase: 02-site-public
    provides: "02-05: Reveal primitive, magnetic Button island"
  - phase: 02-site-public
    provides: "02-09: pour-qui/competences/programme-accordion sections, the eyebrow-seed Rule-3 precedent this plan repeats"
provides:
  - FormatModalites, Confiance, CtaFinal and Faq Server Components, all reading Supabase, closing out the seven signed landing sections
  - The second required --shadow-4 call site (cta-final.tsx, alongside hero.tsx), paired with --shadow-brand
  - Nine more floating cards (six format items, three confiance faits), bringing the landing total to fourteen with plan 02-09's five profil tiles
  - page.tsx imports no locale JSON for landing content — every landing string now comes from Supabase (PUB-13 provable)
affects: [02-11]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Generic (non-domain) icons — shield/badge/refresh, radio/doc/play/clock/target/key — are mapped locally per component via a Record<cle, LucideIcon> keyed to the item's stable slugified cle, not stored in the DB and not added to pictograms.tsx's domain sprite. Matches pictograms.tsx's own header contract ('generic marks... are lucide-react at the call site, never redrawn here') and the existing programme/page.tsx precedent (Target/BookOpen imported directly)."
    - "A signed H2 that isn't literally two sentences (FAQ's single-sentence title with a mid-sentence maquette gradient turn) gets its own seed-time split helper (splitAtPhrase) keyed to the maquette's literal accent phrase, rather than forcing splitTwoSentences' period-based logic or splitting at render time."
    - "The confiance placeholder labels (Témoignages / Entreprises) are seeded into content_item.titre from a new landing.json label field, not hardcoded in the component — same D-25 no-invention discipline as every other seeded string, sourced from the maquette's own <span class=\"ph-lbl\"> text."

key-files:
  created:
    - src/components/sections/format-modalites.tsx
    - src/components/sections/confiance.tsx
    - src/components/sections/cta-final.tsx
    - src/components/sections/faq.tsx
  modified:
    - src/app/page.tsx
    - src/locales/fr/landing.json
    - scripts/seed-content.mjs

key-decisions:
  - "Extended scripts/seed-content.mjs (Rule 3, same class of gap 02-09 found) to seed eyebrow/titre_accent for format-modalites, confiance, cta-final and faq — none of the four carried them before this plan, and D-22/AC-8 require all seven sections to open eyebrow -> two-sentence H2 -> lead."
  - "Added a splitAtPhrase seed helper for faq.titre specifically: the signed string is one sentence, not two, but the maquette still gives it a gradient turn at 'trouvent leur réponse ici.' — splitTwoSentences' period-boundary logic can't find that split, so a second authored-split-point helper was added rather than forcing the general helper or deferring the split to render time (which SectionHeader's own comment forbids)."
  - "Confiance's two placeholder rows now carry titre from a new landing.json confiance.temoignages/logos.label field ('Témoignages'/'Entreprises', literal maquette copy) instead of a component-side cle ternary — keeps the label sourced from the same seeded JSON as everything else."
  - "Format-modalites and confiance icons (Radio/FileText/PlayCircle/Clock/Target/KeyRound; Shield/BadgeCheck/RefreshCw) are lucide-react imports mapped locally per component by the item's stable cle, not a new DB column — matches pictograms.tsx's own documented split between domain pictograms (DB-driven picto column) and generic marks (lucide-react at the call site, per its header comment) and the existing programme/page.tsx precedent."
  - "cta-final.tsx's white button reuses common.actions.reserver ('Réserver') for the /reservation link, matching 02-09's programme-accordion.tsx precedent, rather than inventing a second wording of the maquette's 'Prendre RDV'; the closing support line reuses common.hero.chips verbatim rather than authoring new copy."

requirements-completed: [PUB-05, PUB-06, PUB-07]

# Metrics
duration: ~55min
completed: 2026-08-30
---

# Phase 2 Plan 10: Format et modalités, Confiance et sécurité, CTA final et FAQ Summary

**Closes out all seven signed landing sections — six format repères and three confiance faits as floating cards (nine more, bringing the total to fourteen), the second `--shadow-4` call site on the gradient final CTA, and a seven-entry FAQ reusing the Lot 1 accordion — all rebuilt as Server Components reading Supabase, replacing the last of the Lot 1 `landing.json` markup. Tasks 1-2 complete and verified; Task 3's mount and every automatable assertion ran and passed, with the founder-facing visual review deferred to plan 02-11 per this phase's established batching precedent.**

## Performance

- **Duration:** ~55 min (including `npm install`/`.env.local` provisioning for this fresh worktree, and a preparatory seed-data fix before Task 1)
- **Tasks:** 3 of 3 (Task 3's automated verification ran; its `checkpoint:human-verify` visual review did not — see Unresolved questions)
- **Files modified:** 7 (4 created, 3 modified)

## Accomplishments

- Closed a seed-data gap discovered before Task 1, same class 02-09 found for the first three landing sections: `content_section` rows for `format-modalites`, `confiance`, `cta-final` and `faq` carried only `titre` — no `eyebrow`, no `titre_accent`. Extended `landing.json` with the four literal maquette eyebrow strings (`Format et modalités`, `Confiance et sécurité`, `Votre prochaine étape`, `Vous avez des questions`) and `scripts/seed-content.mjs`'s `upsertSections` call for these four rows. FAQ's signed title is one sentence, not two, so it needed a second seed-time helper (`splitAtPhrase`) keyed to the maquette's own mid-sentence gradient phrase rather than `splitTwoSentences`' period-boundary logic. Also seeded the two confiance placeholder rows' `titre` from a new `landing.json` `label` field (`Témoignages`/`Entreprises`, literal maquette `.ph-lbl` text) instead of a component-side conditional. Ran `npm run content:seed` and confirmed all four sections and both placeholders carry the expected columns.
- Built `src/components/sections/format-modalites.tsx`: six `Card variant="raised"` items from `getSectionItems("format-modalites")` on the `--lav2` band, two-column grid collapsing to one below 640px, 42px `var(--lav)`/`var(--deep)` icon tile per item (lucide marks mapped by item `cle`), the `futur` item (Vidéos à venir) wearing the honest amber `#FFF4E3`/`#B4771A` treatment and "À venir" tag.
- Built `src/components/sections/confiance.tsx`: three faits as `Card variant="raised"` tiles with the same 52x52 gradient icon treatment as pour-qui's profils, plus the two `statut === "placeholder"` rows rendered as dashed `#D6D3F0` honest placeholder blocks — no invented testimonial, name, company, rating or logo.
- Built `src/components/sections/cta-final.tsx`: the gradient panel (`linear-gradient(125deg, var(--indigo), var(--deep) 45%, var(--violet))`) carrying `shadow-[var(--shadow-4),var(--shadow-brand)]` — the second required `--shadow-4` call site (hero.tsx's console frame is the first) — a masked 52px grid overlay, and a white magnetic `Button` linking `/reservation`.
- Built `src/components/sections/faq.tsx`: seven entries from `getSectionItems("faq")` (Zod-validated `donnees.question`/`donnees.reponse`) through the reused Lot 1 `Accordion` family, no second accordion implementation.
- Mounted all four in `src/app/page.tsx` after `<ProgrammeAccordion />`, removing the remaining `landing.json`/`common.json` imports and the inline Lot 1 markup for `formatModalites`/`confiance`/`faq`/`ctaFinal`. `page.tsx` now imports no locale bundle for landing content (D-24, PUB-13).
- `npm run build` exits 0, `/` still prerendered static at `revalidate: 1h`; `tsc`/`eslint` both clean; `npm run content:check` still exits 1 on the unresolved `page-programme`/`page-a-propos` mocks (D-48, unaffected by this plan); phase-level `cubic-bezier` count is still 1; no `landing.json`/`programme.json`/`formation.json`/`a-propos.json` reader remains under `src/app/`.

## Task Commits

1. **Task 1: « Format et modalités » and « Confiance et sécurité »** — `2e4b15a` (feat)
2. **Task 2: The final CTA and the FAQ** — `31df4a3` (feat)
3. **Task 3: Mount the seven sections and confirm the landing page against the maquette** — `0ab93a2` (feat) — mount + automated verification only; visual review not executed, see below

**Preparatory fix commit (Rule 3, before Task 1):**
- `fab7474` (fix) — seed eyebrow/titre_accent for the four remaining landing sections, plus the confiance placeholder labels

## Files Created/Modified

- `src/components/sections/format-modalites.tsx` — async Server Component, `getSection`/`getSectionItems("format-modalites")`, six raised-card tiles, honest amber `futur` marker
- `src/components/sections/confiance.tsx` — async Server Component, `getSection`/`getSectionItems("confiance")`, three raised-card faits + two dashed placeholders
- `src/components/sections/cta-final.tsx` — async Server Component, `getSection("cta-final")`, gradient panel on `--shadow-4` + `--shadow-brand`, magnetic white CTA
- `src/components/sections/faq.tsx` — async Server Component, `getSection`/`getSectionItems("faq")`, seven entries through the reused `Accordion`
- `src/app/page.tsx` — mounts the four new sections, drops the last `landing.json`/`common.json` imports and inline Lot 1 blocks
- `src/locales/fr/landing.json` — added `eyebrow` to `formatModalites`/`confiance`/`faq`/`ctaFinal`, added `label` to `confiance.temoignages`/`confiance.logos`
- `scripts/seed-content.mjs` — seeds `eyebrow`/`titre_accent` for the four sections (new `splitAtPhrase` helper for FAQ's single-sentence title), seeds `titre` for the two confiance placeholders

## Decisions Made

See `key-decisions` in frontmatter.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Seeded eyebrow/titre_accent for format-modalites, confiance, cta-final, faq, plus the two confiance placeholder labels**
- **Found during:** pre-Task-1 verification of the plan's data assumptions (Task 1/2's own acceptance criteria require `eyebrow=`/`titleAccent=` to be present, and the placeholder blocks need a label)
- **Issue:** All four remaining `content_section` rows carried only `titre` (`cta-final` also had `lead`) — `eyebrow` and `titre_accent` were both `null`, matching the exact gap 02-09 found and fixed for the first three landing sections. Separately, `content_item` rows for the two confiance placeholders carried `titre: null`, with no seeded source for the maquette's `Témoignages`/`Entreprises` `.ph-lbl` labels.
- **Fix:** Added the four literal maquette eyebrow strings and the two placeholder labels to `landing.json`. Extended `scripts/seed-content.mjs`: `format-modalites`/`confiance`/`cta-final` used the existing `splitTwoSentences` helper (their signed titles are genuinely two sentences); `faq`'s title is one sentence with a mid-sentence maquette gradient turn, so a new `splitAtPhrase(value, phrase)` helper splits at the maquette's own literal accent phrase (`"trouvent leur réponse ici."`) instead — same "authored split point against the known signed string" discipline `splitTwoSentences`'s own comment establishes, extended to a different boundary shape.
- **Files modified:** `src/locales/fr/landing.json`, `scripts/seed-content.mjs`
- **Verification:** `npm run content:seed` run once, confirmed via a direct Supabase query that all four sections carry the expected `eyebrow`/`titre`/`titre_accent` split (including FAQ's non-period split) and both confiance placeholders carry `titre`; `grep -n "eyebrow="`/`"titleAccent="` both match in all four new component files.
- **Committed in:** `fab7474`

---

**Total deviations:** 1 auto-fixed (Rule 3, blocking — the plan's own data assumptions were incomplete, same class of gap 02-09 found and fixed for the first three landing sections; FAQ additionally needed a new split helper since its signed title isn't two full sentences).
**Impact on plan:** Required for Task 1/2's own stated acceptance criteria to be satisfiable at all. No scope creep — every new string is literal maquette text already used verbatim in this plan's own task text (eyebrows, `.ph-lbl` placeholder labels), never invented.

## Verify-command literalism note (per this session's environment_notes)

The plan's Task 3 `<acceptance_criteria>` prescribes `grep -c 'shadow-\[var(--shadow-3)\]' .next/server/app/index.html` and `grep -c 'rounded-\[22px\]' .next/server/app/index.html` each `-ge 9`. `grep -c` counts **matching lines**, not occurrences — and Next's prerendered `index.html` is emitted as a single unbroken line (`wc -l` reports 0), so `grep -c` on either pattern returns `1` regardless of how many times the pattern actually appears, always failing a `-ge 9` literal read. Counting **occurrences** instead (`grep -o ... | wc -l`) gives `50` for `shadow-[var(--shadow-3)]` and `28` for `rounded-[22px]` — both far above the required floor of 9 (in fact `card.tsx`'s `raised` variant bakes both classes into its base string, so every `variant="raised"` card anywhere on the page — including 02-09's five profil tiles and every `raised` empty-state fallback — contributes to the count, not just this plan's nine). Same artifact affects `data-tone="band"`/`"default"`/`data-magnetic="true"` counts (each also `-ge 1`, trivially satisfied either way). Left the plan's verify commands as written per this session's instruction not to deform code or grep syntax to chase a literal count on a minified single-line file — the underlying design outcome (>=9 raised cards from this plan, alternating tone bands, a magnetic CTA) is independently confirmed above with occurrence-accurate greps and via the rendered HTML text spot-checks (section eyebrows, "À venir" tag, "Témoignages" label all present verbatim).

## Issues Encountered

- This worktree had no `node_modules` and no `.env.local` (fresh worktree, same as 02-09's precedent) — ran `npm install` and copied `.env.local` from the parent checkout (gitignored, not committed) before Task 1's build/lint checks could run.

## User Setup Required

None for local development — the local stack carries every migration and the extended seed ran against it directly (confirmed via direct query).

**External/CIO action still owed (unchanged from 02-02/02-06/02-09):** hosted Supabase projects need `npm run content:seed` re-run so hosted content matches local — data only, no new migration.

## Next Phase Readiness

- PUB-05, PUB-06 and PUB-07 are now provably sourced from Supabase on the landing page: six format repères, three confiance faits plus two honest placeholders, a gradient final CTA, and a seven-entry FAQ.
- `src/app/page.tsx` now imports **no** locale JSON for landing content — the whole-phase verification line (`grep -rn "locales/fr/\(landing\|programme\|formation\|a-propos\)\.json" src/app/`) returns zero lines for `src/app/page.tsx`.
- AC-1 (>=11 floating cards): fourteen confirmed (`data-slot="card"` occurs 14 times in the prerendered HTML) — five profils (02-09) + six format items + three confiance faits (this plan).
- AC-2 (`--shadow-4` consumed at >=2 call sites): four consumers now exist in `src/` (`hero.tsx`, `cta-final.tsx`, `card.tsx`'s `raised` hover, `button.tsx`'s `default` hover) — both required call sites plus two legitimate extras.
- **Task 3's `checkpoint:human-verify` visual review was NOT executed.** Per this phase's established precedent (02-04's deferred header/nav review, 02-05's deferred hero review, 02-09's deferred pour-qui/competences/programme review, all documented in `.planning/STATE.md` Blockers/Concerns) and this session's explicit operating instructions, the automatable half of Task 3 ran and passed: mount, `npm run build`, and every grep/prerendered-HTML assertion in the plan's own `<acceptance_criteria>`/`<verify>` blocks (occurrence-corrected where `grep -c` undercounted on the minified single-line HTML — see the literalism note above). The eight manual checks in `<how-to-verify>` — section order and count scrolled live, atmosphere visibility behind the FAQ, the final CTA's lifted shadow depth read visually, the fourteen floating cards' hover lift, the dashed placeholders reading honest rather than invented, the eyebrow/gradient heading pattern across all seven sections, and the no-price/no-provider sweep read visually rather than by grep — are unconfirmed by a human. Whoever executes plan 02-11's batched review must walk all eight, plus everything 02-04/02-05/02-09 deferred before it.

## Unresolved questions

- Does this plan's Task 3 founder review get folded into plan 02-11's batch, or does it need a separate pass? Same open question 02-04/02-05/02-09 left; not resolved here, only deferred consistently with them.
- The plan's own verify commands for the Task 3 shadow-3/rounded-22 card counts use `grep -c` against a minified single-line prerendered HTML file, which always returns 1 regardless of actual occurrence count — see the literalism note above. Whoever runs 02-11 or a later phase verification pass should be aware the literal command as written cannot fail informatively either way (it will read `1 -ge 9` as false even when the true count is 50), and should re-check with `grep -o | wc -l` if this exact assertion is re-run.

## Self-Check: PASSED

All four created files exist on disk (`src/components/sections/format-modalites.tsx`, `confiance.tsx`, `cta-final.tsx`, `faq.tsx`); `src/app/page.tsx`, `src/locales/fr/landing.json` and `scripts/seed-content.mjs` carry the described changes. `git log --oneline -5` shows `0ab93a2`, `31df4a3`, `2e4b15a`, `fab7474` present in the worktree branch history. Final `npm run build` exits 0 with `/` listed `○ (Static)` at `revalidate: 1h`; `tsc`/`eslint` both clean; `npm run content:check` still exits 1 on the two pre-existing unresolved page mocks (D-48, out of this plan's scope).

---
*Phase: 02-site-public*
*Completed (Tasks 1-2, Task 3 automated portion): 2026-08-30 — Task 3 visual review pending*
