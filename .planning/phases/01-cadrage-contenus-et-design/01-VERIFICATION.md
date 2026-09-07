---
phase: 01-cadrage-contenus-et-design
verified: 2026-08-29T00:00:00Z
status: gaps_found
score: 5/6 must-haves verified
overrides_applied: 0
gaps:
  - truth: "CADR-02 — The payment provider is chosen and recorded (Stripe ou équivalent), so provider account verification can start"
    status: failed
    reason: "Deliberately deferred to Lot 7 by an explicit founder decision (D-04 in 01-CONTEXT.md), reaffirmed after a counter-argument was raised. No provider is named anywhere in the codebase. This is documented, not hidden — docs/cadrage-lot-1.md states plainly 'Cette exigence signée ferme donc non tenue dans ce lot.' The commercial exposure is routed to the Chief of Staff per the context doc, not resolved technically."
    artifacts:
      - path: "docs/cadrage-lot-1.md"
        issue: "Section 'Choix du prestataire de paiement — reporté' records the requirement as unmet by design, not implemented"
    missing:
      - "A payment provider selection (Stripe or equivalent) recorded anywhere in the repo — none exists, and none is planned until Lot 7 (Phase 7)."
deferred:
  - truth: "CADR-02 payment provider chosen and recorded"
    addressed_in: "Phase 7"
    evidence: "ROADMAP.md Phase 7 requirements include PAY-01..PAY-10 and the cross-phase dependency table states: 'Phase 1 | Phase 7 | The payment provider is chosen at cadrage ... Provider account verification has its own lead time, so the choice must be recorded at Phase 1.' The founder's own D-04 decision consciously overrides this cross-phase dependency and pushes the choice itself into Phase 7."
---

# Phase 1: Cadrage, contenus et design Verification Report

**Phase Goal:** Lot 1 — settle the positioning and the sale formulas, write every French text, prepare the visuals, define the design system, and get the mockups validated by the client before any integration.
**Verified:** 2026-08-29
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria, mapped to CADR-01..06)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | CADR-01 — Framing decisions recorded (positioning, promesse, formules, hiérarchie, priorités) | VERIFIED | `docs/cadrage-lot-1.md` (105 lines) contains all five sections: Positionnement, Promesse commerciale, Formules de vente (table of 4), Hiérarchie des pages (11 screens / 10 routes), Priorités. |
| 2 | CADR-02 — Payment provider chosen and recorded | FAILED | Deliberately deferred to Lot 7 by founder decision D-04. No provider named anywhere. `docs/cadrage-lot-1.md` documents the deferral explicitly rather than hiding it. See gap below. |
| 3 | CADR-03 — All French site copy written (accroches, bénéfices, modules, FAQ, form labels, emails) | VERIFIED (with documented cosmetic gaps) | 12 locale bundles under `src/locales/fr/` cover all 11 screens plus `emails.json` (4 automatic emails: confirmationInscription, confirmationReservation, rappel, reinitialisationMotDePasse). Client-dependent values marked in `_mocks.public.json` / `_mocks.journey.json`, invisible on screen. Three narrow cosmetic gaps are self-reported in 01-09/01-10/01-12 SUMMARY.md (missing duration-unit suffix, "gratuit" badge label, "recommandée" badge label) — explicitly flagged as follow-ups for plan 01-03/01-04, not fixed functionality. |
| 4 | CADR-04 — Visuals selected and prepared (photography, SAP Ariba captures, pictograms) | VERIFIED (pictograms only, by design) | `src/components/icons/pictograms.tsx` (199 lines) exports a `pictograms` registry consumed by the landing page and other routes. Photography and SAP Ariba interface captures are explicitly deferred as an enhancement per founder decision D-06, documented in `docs/cadrage-lot-1.md` § Visuels. Not a silent gap. |
| 5 | CADR-05 — Design system exists (bleu/blanc/vert palette, typography, spacing scale, 5 component families with states) | VERIFIED | `src/app/globals.css` (214 lines) defines tokens (`--ease-brand`, shadow ladder, oklch palette). All five signed families exist and are substantive: `button.tsx`, `card.tsx`, `badge.tsx`, `accordion.tsx`, `field.tsx` (+ `input.tsx`, `message.tsx`, `empty-state.tsx`). States (hover, focus-visible, active, disabled, loading, aria-invalid/error) confirmed present in `button.tsx` and `field.tsx` via `data-*`/`aria-*` selectors, not just class names with no logic. |
| 6 | CADR-06 — Mockups exist for all eleven screens (landing, internal pages, full journey) | VERIFIED | All 11 routes exist as real Next.js pages: `/`, `/programme`, `/formation`, `/a-propos`, `/contact`, `/inscription`, `/connexion`, `/agenda`, `/reservation`, `/paiement`, `/espace`. `next build` succeeds and statically generates all 11 plus `/_not-found`. Client validation itself ("has the client validated") is inherently a human/business step — see Human Verification below. |

**Score:** 5/6 truths verified (CADR-02 failed by deliberate, documented founder decision — see override suggestion below)

### Required Artifacts

All must-have artifacts from the twelve plan frontmatters exist and meet minimum-line thresholds. Spot-checked line counts:

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `design-exploration/README.md` | Comparison table + decision sheet | VERIFIED | 49 lines, outside `src/` per D-03 |
| `src/app/globals.css` | Tokens, atmosphere, motion | VERIFIED | 214 lines, contains `--ease-brand` |
| `src/app/layout.tsx` | next/font wiring, Header/Footer mount | VERIFIED | Imports and renders `<Header />` / `<Footer />` |
| `src/locales/fr/landing.json`, `_mocks.public.json`, `common.json` | Public copy + mock registry | VERIFIED | 169 / 55 / 56 lines |
| `src/locales/fr/paiement.json`, `espace.json`, `agenda.json`, `_mocks.journey.json` | Journey copy + mock registry | VERIFIED | 25 / 52 / 21 / 11 lines |
| `src/components/ui/{button,card,badge,message}.tsx` | 3+1 component families | VERIFIED | 65 / 125 / 47 / 47 lines, correct exports |
| `src/components/ui/{accordion,field,input,empty-state}.tsx` | 2 families + support | VERIFIED | 134 / 93 / 42 / 134 lines, correct exports |
| `src/components/icons/pictograms.tsx`, `layout/{header,footer}.tsx` | Pictograms + chrome | VERIFIED | 199 / 87 / 114 lines |
| `src/locales/fr/emails.json`, `scripts/check-mock-content.mjs`, `docs/cadrage-lot-1.md`, `package.json` | Emails + mock guard + framing record | VERIFIED | 62 / 98 / 105 lines; `content:check` script present |
| `src/app/page.tsx`, `sections/{hero,section}.tsx` | Landing maquette | VERIFIED | 188 / 75 / 72 lines |
| `src/app/{programme,formation,a-propos,contact}/page.tsx` | 4 internal pages | VERIFIED | 77 / 87 / 67 / 186 lines |
| `src/app/{inscription,connexion,espace}/page.tsx` | 3 account/journey screens | VERIFIED | 240 / 144 / 82 lines |
| `src/lib/i18n/fr.ts`, `src/app/{agenda,reservation,paiement}/page.tsx` | Formatters + last 3 screens | VERIFIED | 69 / 114 / 90 / 105 lines, exports `currencyFormatter`, `timeFormatter`, `formatCurrency`, `formatTime` |

No artifact was MISSING or a STUB (no artifact fell under any minimum-line threshold; no placeholder return values found).

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `src/app/layout.tsx` | `src/components/layout/header.tsx` / `footer.tsx` | mounted in root layout | WIRED | `<Header />` / `<Footer />` both present in layout.tsx |
| `src/app/espace/page.tsx` | `src/components/ui/empty-state.tsx` | EmptyState renders espace.json copy | WIRED | `EmptyState tone="waiting"` used with `espace.aucuneReservation.titre` |
| `src/app/inscription/page.tsx` | `src/components/ui/field.tsx` | server-rejected state | WIRED | `<Field data-rejected="server">` present |
| `src/app/paiement/page.tsx` | `src/lib/i18n/fr.ts` | formatCurrency for prices | WIRED | `formatCurrency` referenced; no literal price string; no provider name in copy or JSX |
| `scripts/check-mock-content.mjs` | `_mocks.*.json` registries | mock-content guard discovery | WIRED, FUNCTIONAL | Running `node scripts/check-mock-content.mjs` lists 60 remaining mocked keys grouped by requirement (CADR-03: 50, CADR-01: 10) and exits 1, matching D-08 exactly |
| `package.json` | `scripts/check-mock-content.mjs` | `content:check` script | WIRED | `"content:check": "node scripts/check-mock-content.mjs"` present in `package.json` |
| `content:check` | CI / lint / typecheck / build | must NOT be wired (D-09) | VERIFIED ABSENT | No reference to `content:check` or `check-mock-content` in `.github/workflows/ci.yml` or `vercel.json` |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Mock-content guard runs and fails loudly while mocks remain | `node scripts/check-mock-content.mjs` | Lists 60 keys with requirement + reason, exit code 1 | PASS |
| Mock guard is not wired into any automated gate | grep CI workflows + vercel.json | No match | PASS |
| Typecheck passes | `npx tsc --noEmit` | No output, exit 0 | PASS |
| Lint passes | `npx eslint .` | No output, exit 0 | PASS |
| Production build succeeds and statically generates all 11 routes | `npx next build` | All 11 routes + `/_not-found` generated as static content | PASS |
| No TODO/FIXME/XXX/TBD debt markers introduced | grep across `src/` | 3 files matched only on legitimate "à venir" copy content (vidéos à venir, per D-14; "aucun rendez-vous à venir" empty state), not debt markers | PASS |

### Requirements Coverage

| Requirement | Description | Status | Evidence |
|---|---|---|---|
| CADR-01 | Framing workshop output recorded | SATISFIED | `docs/cadrage-lot-1.md` |
| CADR-02 | Payment provider chosen and recorded | BLOCKED (by design) | Deferred to Lot 7, D-04, `docs/cadrage-lot-1.md` § "Choix du prestataire de paiement — reporté" |
| CADR-03 | All French copy written | SATISFIED (3 cosmetic gaps self-flagged) | 12 locale bundles + `emails.json`; gaps documented in 01-09/01-10/01-12 SUMMARY.md |
| CADR-04 | Visuals selected and prepared | SATISFIED (pictograms only, by design) | `pictograms.tsx`; photography deferred per D-06 |
| CADR-05 | Design system defined | SATISFIED | tokens + 5 component families with states |
| CADR-06 | Mockups exist for all 11 screens | SATISFIED (client sign-off is a human step) | all 11 routes build and render |

### Anti-Patterns Found

None classified as blocker or warning. Grep for `TODO|FIXME|XXX|TBD|coming soon|not yet implemented` across `src/` returned 3 files, all false positives (legitimate "à venir" copy content specified by D-14, not debt markers).

### Human Verification Required

### 1. Client sign-off on the eleven maquettes

**Test:** Confirm with the client/founder that the eleven maquettes (landing, programme, formation, à propos, contact, inscription, connexion, agenda, réservation, paiement, espace) have actually been reviewed and validated, per CADR-06's "validated by the client" language and the payment gate "à validation des maquettes."
**Expected:** A recorded client approval (email, meeting note, or signed acceptance) exists outside the repo.
**Why human:** Client validation is a business/communication event, not something the codebase can prove. The codebase can only prove the maquettes *exist* and *render correctly* — not that a human outside the repo has approved them. No approval artifact was found in `.planning/` or `docs/`.

### 2. Visual quality bar vs. 26academy reference (D-06, D-16..D-21)

**Test:** Open the 11 routes in a browser and visually compare palette, motion, atmosphere layer and shadow ladder against the intended design direction.
**Expected:** Bleu/blanc/vert palette reads as intentional and premium-feeling; one consistent easing curve is perceptible; no generic shadcn grey remains.
**Why human:** Visual/aesthetic judgment cannot be verified by grep or build success — CSS variables being present does not guarantee they read well.

### Gaps Summary

One requirement (CADR-02) is contractually unmet in this phase, and it is unmet by explicit, reaffirmed founder decision (D-04), not by an oversight or a silent scope drop. `docs/cadrage-lot-1.md` documents the deferral plainly, names the consequence (provider-account verification lead time lost), and routes the commercial exposure to the Chief of Staff. Because this creates a direct conflict between ROADMAP.md's Phase 1 Success Criterion #2 ("the payment provider is chosen and recorded") and the actual, intentional codebase state, it is reported as a gap rather than silently passed — but it is flagged for override consideration given the paper trail already exists in `01-CONTEXT.md`.

**This looks intentional.** To accept this deviation, add to VERIFICATION.md frontmatter:

```yaml
overrides:
  - must_have: "CADR-02 — the payment provider is chosen and recorded (Stripe ou équivalent)"
    reason: "Founder decision D-04 (01-CONTEXT.md), reaffirmed after counter-argument: payment provider selection is deferred to Lot 7 (Phase 7). Documented as an unmet requirement in docs/cadrage-lot-1.md; commercial exposure routed to Chief of Staff, not resolved technically in this phase."
    accepted_by: "<name>"
    accepted_at: "<ISO timestamp>"
```

The three cosmetic content gaps (duration-unit suffix, "gratuit" badge label, "recommandée" badge label) are self-reported in SUMMARY.md files as narrow follow-ups for plan 01-03/01-04, do not affect any artifact's substantiveness or wiring, and do not block the phase goal — they are noted for completeness, not scored as gaps.

---

_Verified: 2026-08-29_
_Verifier: Claude (gsd-verifier)_
