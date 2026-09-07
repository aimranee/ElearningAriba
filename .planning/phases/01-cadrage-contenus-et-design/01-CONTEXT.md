# Phase 1: Cadrage, contenus et design - Context

**Gathered:** 2026-08-28
**Status:** Ready for planning
**Source:** PRD Express Path (`ariba-cto/notes/2026-08-28-brief-phase-1-cadrage-contenus-design.md`)

<domain>
## Phase Boundary

Phase 1 **is** Lot 1 of `Offre_1_Essentiel.pdf` — one-to-one, so a delivered
phase maps to a payment gate with no interpretation. Charged **2,5 j**,
payment gate **« à validation des maquettes »**.

**Delivers:** the framing record, the full French content layer (site copy +
automatic email copy), the design system (tokens, five signed component
families with their states, motion primitives), the pictogram half of the
visuals, and **eleven full-fidelity maquettes built as real Next.js routes on
the real design system** — so a validated maquette *is* the Lot 2 / Lot 3 page.

**Does not deliver:** any authenticated behaviour, any data fetching, any form
submission, any provider integration of any kind. Lot 1 ships no runtime
authorization — no auth, no session, no RLS, no guard. The espace-apprenant and
back-office routes ship **unguarded**, which is safe only because production
carries `X-Robots-Tag: noindex, nofollow` and holds no real data; Lot 3 adds the
gate.

**Stops at Lot 10.** Lots 11–18 are unsold. Building into them is unpaid work
that removes what the next offer would sell.

</domain>

<decisions>
## Implementation Decisions

Everything below is **locked**. Items D-01…D-06 are founder decisions taken
inline 2026-08-28; the rest are constraints carried from signed scope, the
design teardown, and the process ruling.

### Founder decisions — 2026-08-28

- **D-01** — Plan **all six** requirements now (`CADR-01` … `CADR-06`) with
  **mocked client content**. Client-dependent values — positioning, the
  commercial promise, the sale formulas, the five modules and their durations,
  the FAQ answers, the trust proofs — ship as **explicitly marked placeholder
  content** and are replaced with the client's real answers **before the gate
  closes**.
- **D-02** — The mock is a bridge with a known end, not a guess with no owner:
  `Cadrage_Formation_SAP_Ariba_Questions_Client.docx` is **already sent** to the
  client. The real answers replace the mocks before the Lot 1 gate closes.
- **D-03** — The exploration round is **throwaway static HTML outside `src/`**.
  Two or three directions for the hero plus one card/CTA cluster; deleted once a
  direction wins. Cheapest medium that still shows real type and real motion,
  leaves nothing in the app to unpick, and converts directly into the token set.
  **Typography is settled here.**
- **D-04** — **`CADR-02` (payment provider) is deferred to Lot 7.** The founder
  reaffirmed the deferral after the counter-argument was put. **No payment
  provider is named anywhere in this phase.** The commercial exposure — a signed
  Lot 1 requirement closing unmet — is routed to the Chief of Staff, not resolved
  here.
- **D-05** — **Full fidelity on all eleven screens**, built as **real Next.js
  routes on the real design system**. This is a fidelity-and-medium choice the
  offer does not specify — **not** a scope change. `CADR-06` already names the
  eleven screens and they are signed.
- **D-06** — The design reference is **26academy.com**. Tokens come first and
  are cheap; the quality bar is reachable with **no photography at all**, so
  `CADR-04`'s professional photography and SAP Ariba captures are an
  **enhancement, not a blocker**. Deliver the **pictograms**; photography waits
  on the client's library.

### The mock-content guardrail — three non-negotiable properties

D-01 creates a specific, dated failure: mocked French copy that looks finished,
surviving into Lot 2 and reaching the client as real. The maquettes are
deliberately full-fidelity, so nothing about *looking* at them reveals which
strings are real. Build the guard. The planner chooses the implementation; these
three properties are not negotiable.

- **D-07** — Every client-dependent string is mocked in **exactly one place**,
  and **marked in the data, never in the rendering**. The marker must be
  **invisible on screen** — the client reviews these maquettes and a visible
  « [MOCK] » badge destroys the fidelity the founder paid for. The marker lives
  in the content layer, not in the JSX.
- **D-08** — A **command answers "is anything still mocked?" in one run**,
  listing every remaining placeholder with its key and the requirement it
  blocks, and **exiting non-zero while any remain**. It belongs in
  `package.json` scripts and in the phase verification.
- **D-09** — ⛔ That command **must NOT be wired into the PR gate** — not into
  `lint`, `typecheck`, `build`, or any CI workflow. It is *designed to fail* for
  the whole of Lot 1; adding it to CI would block every merge in the lot and the
  pressure would be to delete the guard. Keep mocked keys **structurally
  separable** from real ones, so swapping in the client's answers is a deletion
  from one place rather than a hunt.

### Scope fence — the stack is not an open decision

- **D-10** — Next.js (React, TypeScript) · Supabase · Vercel · Tailwind v4 +
  shadcn/ui. Stated to the client in Section 1 « Socle technique » of all three
  offer PDFs. Drift toward alternatives is an **offer event**, not a technical
  preference.
- **D-11** — ⛔ **Do not touch** `supabase/`, any migration, any auth surface,
  any RLS policy, or `src/types/database.types.ts`. Lot 1 ships no authenticated
  behaviour.
- **D-12** — `reference/` and the offer PDFs are **read-only input**.

### The three execution constraints — quoted from the ruling, non-negotiable

`PUB-01` and `PUB-05` are contractual deliverables of Lot 2, quoted verbatim
from `Offre_1_Essentiel.pdf` Section 2. They land in Lot 1 because **Lot 1 is
where the copy and the maquettes are written** — applying them late means
re-doing validated maquettes on a lot with no cushion.

- **D-13** — The **Hero video slot ships as a prepared component**. Do **not**
  render an empty player frame, a play button, or a « vidéo à venir » caption
  above the fold. *Ready* means the code accepts a video later, not that the
  visitor sees a hole.
- **D-14** — In « Format et modalités », keep the **signed order — « formations
  live » leads**, as in the offer text. *Vidéos à venir* stays a listed future
  item, **never presented as an included modality**.
- **D-15** — Everything struck in the item 8 mockup ruling **stays struck**.
  « Apprenez à votre rythme » and « Accès 24/7 » are **not** in the signed offer
  and do not come back through this door.

### Design-system constraints

- **D-16** — **Palette bleu / blanc / vert**, mandated by the offer. **Bleu** is
  the accent and primary action; **vert** is confirmation and success (a slot
  booked, a payment through); **blanc** is the ground. **Ink is never pure
  black** — tint the neutrals toward the accent. The exploration round proposes
  the exact values; the founder picks.
- **D-17** — **One easing curve for every transition on the site.** No `ease`,
  no `linear` — one token applied everywhere. Most of the distance between
  cheap-feeling and expensive-feeling motion, and it costs a variable.
- **D-18** — **A shadow ladder, always paired** — a 1px contact shadow plus a
  large soft one, four tiers.
- **D-19** — **`next/font` self-hosts the chosen typefaces.** Zero CLS is not
  cosmetic: `GOL-02` contractually requires **Lighthouse ≥ 90 on mobile** at
  Lot 5.
- **D-20** — ⛔ **Do not build a generative hero.** The reference's centrepiece
  (JS-computed Bézier paths, `stroke-dasharray` draw-on, comets via
  `animateMotion`, rebuilt on resize) is ~400 lines and roughly a day alone.
  **Lot 1 is 2,5 j total.** Build the atmosphere, the easing, the reveals and the
  component states — all cheap once tokens exist — and give the hero **one strong
  idea we can afford**.
- **D-21** — Prefer **CSS and inline SVG over images**. The reference's homepage
  loads five images and zero photography; all its richness is gradients, blurred
  colour blobs, a grain overlay and a symbol sprite. That is the bar, and it does
  not wait on the client's photo library.
- **D-22** — **The five signed component families are closed, not
  illustrative** (`CADR-05`): **CTA buttons (contrasted), cards, badges,
  accordions, form fields** — each **with its states**. Deliver all five.
- **D-23** — **States are a named deliverable.** For each of the five families:
  default, hover, **focus-visible** (keyboard — the reference site has no `role=`
  attributes at all; do better for free), active, disabled, loading, and
  error-with-message. Plus the four surface-level states the journey screens
  need: an **agenda with no available slot**, an **espace apprenant with no
  booking yet**, a **form field rejected server-side**, and a **payment handoff
  that fails**. A maquette validated without its empty state is a Lot 2 re-do.
- **D-24** — The maquettes depict **two roles** and the design system must serve
  both: the **visiteur/apprenant** (landing, journey, espace apprenant) and the
  **formateur** (the French back-office). Design the component states for both
  surfaces **now** — a back-office discovered at Lot 4 to need a different
  density is a re-do of validated maquettes.

### Copy constraints

- **D-25** — **The copy device** (`CADR-03`): headings as **two short sentences
  with a full stop between them** — a claim, then a turn. It creates the
  display-type line break, carries the emotional payload in the second half, and
  reads aloud. The title tag is positioning, not description.
- **D-26** — `[ASSUMPTION — unverified]` SAP appears to have rebranded the Ariba
  Network as **"SAP Business Network"**. **Not verified** against SAP's own
  documentation and **must be before it enters French client-facing copy.** Until
  then, **prefer wording that does not depend on which name is current.**
- **D-27** — `CADR-03` includes « contenu des emails automatiques », so Lot 1
  **writes** the email copy — confirmation d'inscription, confirmation de
  réservation, rappel, réinitialisation de mot de passe — as marked,
  mocked-where-client-dependent text in the content layer. ⛔ **It sends nothing
  and wires no provider.** No transactional email service, no domain
  authentication, no webhook, no PDF.

### Locale, routes and formatting

- **D-28** — **French only, left-to-right, `fr-FR`, `Europe/Paris`.** No second
  locale exists in signed scope. **Do not add an i18n library or a locale
  switcher** — `src/locales/fr/common.json` is imported directly.
- **D-29** — Every new string goes in the **locale bundle, never inline in
  JSX** — that is what makes the client's real answers a one-place swap.
- **D-30** — Every date, time and number formats through `src/lib/i18n/fr.ts`.
  **Prices format through `numberFormatter` (`src/lib/i18n/fr.ts:39`)** — never
  hand-written — so the decimal separator is a comma and « € » sits where French
  expects it. **No price in this lot is a commitment**; four sale formulas are
  Lot 7's contract.
- **D-31** — **Route slugs are French**: `/programme`, `/formation`,
  `/a-propos`, `/contact`, `/inscription`, `/connexion`, `/agenda`,
  `/reservation`, `/paiement`, `/espace`. The audience and the Lot 5 keywords are
  French, nothing is indexed until Lot 5, so this is the cheap moment to fix
  them. Slugs are the CTO's call; keywords, meta and search copy remain the Head
  of SEO's.

### Payment maquette — provider-neutral by design

- **D-32** — The « paiement » screen does **not** need the provider named. Lot 7
  is contractually **hosted** payment (« paiement hébergé », `PAY-*`), and
  redirect-to-hosted-page is the shape every hosted provider shares. So the
  maquette is **provider-neutral**: an order summary, the formula and price, the
  consent line, and a primary action that hands off to an external payment page.
  Nothing on that screen changes when the provider is finally named.

### Wave shape — the exploration checkpoint

D-01 and D-03 together create a gap **no headless run can cross**: the founder
must choose a visual direction, and a headless child has no `AskUserQuestion`
tool at all. It never asks; it decides everything itself. A silent guess here is
a token set the founder did not choose, propagating into eleven full-fidelity
maquettes.

- **D-33** — **Wave 1 — exploration.** Two or three directions as throwaway
  static HTML outside `src/`. Ends. **Execution stops here.** Wave 1 must be
  **separately executable**.
- **D-34** — ⏸ **Checkpoint (manager session, not a run):** the CTO shows the
  founder the directions; the founder picks; the pick and the chosen typography
  are added to the brief; the run is relaunched.
- **D-35** — **Wave 2 — the design system.** Tokens, atmosphere layer, the five
  signed component families with their full state sets, motion primitives.
  `CADR-05`, and the pictogram half of `CADR-04`.
- **D-36** — **Wave 3 — the content layer.** All French copy and the automatic
  email text, in the locale bundle, with the mock-content guard built and every
  client-dependent value marked. `CADR-03`, and the recorded framing output of
  `CADR-01`.
- **D-37** — **Wave 4 — the eleven maquettes.** Real Next.js routes at the
  French slugs, on the real design system, consuming the content layer.
  `CADR-06`. The « paiement » screen is provider-neutral (D-32).
- Waves 2–4 have no founder gap in them and can run in one launch.

### Process constraints

- **D-38** — ⛔ **Never publish to the remote**, and never instruct a child to.
  Only the CIO publishes, user-gated, because publishing `main` here is a Vercel
  **production deploy**. No `git push`, no `vercel deploy`, no PR creation in any
  plan.
- **D-39** — **Commit before verifying.** A headless child ends its turn when
  nothing is left to do synchronously: if it backgrounds a long command it
  terminates, and three runs in a row have discarded finished work by verifying
  before committing. **Never put a verification longer than a few minutes inside
  a run** — commit, then let the manager session verify.
- **D-40** — **MVP mode is off for this phase**, despite `**Mode**: mvp` in
  ROADMAP.md. A design-system-and-copy lot has no user-facing vertical slice to
  split, and SPIDR splitting a token set produces noise. The dependency waves
  (D-33 … D-37) carry the sequencing MVP mode would otherwise supply.

### Negative space — explicitly NOT in Lot 1

- **D-41** — No page logic, no data fetching, no form submission, no
  contact-form backend (Lot 2). No account, session, role, RLS policy or Google
  sign-in (Lot 3). No availability, booking or agenda logic (Lot 4). No SEO
  metadata, structured data, legal page or RGPD text (Lot 5). No group session
  (Lot 6). No payment provider, order or invoice (Lot 7). No Google Calendar
  (Lot 8). No attendance or certificate (Lot 9). No admin CRUD (Lot 10). Nothing
  whatsoever from lots 11–18. **No hero video player frame, play button, or
  « vidéo à venir » caption.**
- **D-42** — **No tenancy concept.** Single-tenant by construction: one trainer,
  one catalogue, one client. No organisation, workspace or tenant appears
  anywhere in the signed offer and none may be invented here.

### Claude's Discretion

- The **implementation shape of the mock-content guard** (D-07…D-09) — as long
  as the three properties hold.
- The **number and file layout of PLAN.md files** within the four waves.
- The exact **token names, CSS custom-property naming, and Tailwind v4 `@theme`
  structure** — provided everything lives in one CSS file (see Reversibility).
- The **content-layer file split** inside `src/locales/fr/` (one bundle vs.
  several namespaced files).
- The **pictogram set and its SVG sprite technique**.
- The **two-or-three count** of exploration directions, and what each proposes.
- Component **file placement** under `src/components/`, and whether shadcn/ui
  primitives are added via CLI or hand-written.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Signed scope — the single source of truth
- `reference/Offre_1_Essentiel.pdf` — the signed scope. Section 1 « Socle
  technique » fixes the stack; Section 2 carries `PUB-01`/`PUB-05` verbatim.
  Where anything disagrees with it, the PDF wins.
- `.planning/REQUIREMENTS.md` — `CADR-01` … `CADR-06` at lines 30–35.
- `.planning/ROADMAP.md` — Phase 1 section: goal, success criteria, payment gate.
- `CLAUDE.md` — project rules: no `any`, no hardcoded strings, French locale
  bundle, commit format `#<type>: <one sentence>`.

### The brief and its upstream notes
- `ariba-cto/notes/2026-08-28-brief-phase-1-cadrage-contenus-design.md` — this
  context's source.
- `ariba-cto/notes/2026-08-28-reference-26academy-et-la-direction-design-lot-1.md`
  — the 26academy teardown; the design direction and why `CADR-04`'s photography
  is an enhancement, not a blocker.
- `ariba-cto/notes/2026-08-28-contraintes-portees-vers-lot-1-et-lot-5.md` —
  where D-13 … D-15 come from.
- `ariba-cto/notes/2026-08-28-phase-0-close-et-ce-que-la-verification-a-corrige.md`
  — the phase this one builds on.

### Live code the plans must respect
- `src/lib/i18n/fr.ts` — `LOCALE = "fr-FR"` and `TIME_ZONE = "Europe/Paris"` are
  **pinned, not inferred** (lines 8–9); `numberFormatter` at line 39 is the only
  legal price formatter.
- `src/locales/fr/common.json` — the copy home; imported directly at
  `src/app/page.tsx:1`. Holds `home.placeholder` = « Le contenu de cette page
  sera défini au Lot 2. » — one of exactly two artifacts this phase *replaces*.
- `src/app/globals.css:5–8` — untouched shadcn/ui defaults plus a comment
  reserving the real palette for Lot 1. Nothing to undo. The other replaced
  artifact.
- `src/components/ui/button.tsx` — the only file under `src/components/`.

</canonical_refs>

<specifics>
## Specific Ideas

**The eleven screens of `CADR-06`**, enumerated so none is dropped:

1. landing
2. Programme
3. Formation
4. À propos
5. Contact
6. inscription
7. connexion
8. agenda
9. réservation
10. paiement
11. espace apprenant

**Verified facts — checked 2026-08-28 against the services and the remote:**

| Fact | Evidence |
|---|---|
| Phase 0 is merged. PR #1 `MERGED`, `mergedAt` 2026-08-28T15:24:58Z, `mergeCommit` `27ab022` | `gh pr view 1 --json state,mergedAt,mergeCommit` |
| `origin/main` is at `27ab022` and carries the application | `git ls-tree origin/main` lists `package.json`, `src`, `supabase`, `.github`, `vercel.json` |
| Production is live and publicly reachable — HTTP 200 from `cdg1` (Paris) | `curl -I https://elearning-ariba.vercel.app` |
| The repo-wide noindex guard shipped | same response carries `X-Robots-Tag: noindex, nofollow` |
| `globals.css` holds untouched shadcn/ui defaults + a comment reserving the palette | `src/app/globals.css:5–8` |
| One component exists | `src/components/ui/button.tsx` |
| Copy already has a home, and no i18n library | `src/locales/fr/common.json`, imported at `src/app/page.tsx:1` |
| Locale and timezone are pinned | `src/lib/i18n/fr.ts:8–9` |
| The home page is an explicit placeholder | `common.json` → `home.placeholder` |

**Existing data:** nothing to migrate, and verifiably so. The app holds no
production data. Exactly two artifacts are *replaced* rather than added — the
shadcn token block at `src/app/globals.css:5–8` and `home.placeholder` in
`src/locales/fr/common.json`. Both were written as placeholders by Phase 0 with
a comment saying so.

**Reversibility:** the palette, type scale and spacing live in **one CSS file**,
so a rejected direction is one commit. The exploration round is throwaway HTML
outside `src/`, so two of three directions cost a deletion. The mock-content
guard **is** the reversibility guarantee for copy: while it exits non-zero, no
one can mistake the lot for finished. What is *not* cheaply reversible is the
**route shape** once Lot 5 indexes it (hence D-31) and the **five signed
component families**, which every later lot builds on.

</specifics>

<deferred>
## Deferred Ideas

- **`CADR-02` — the payment provider — deferred to Lot 7** (D-04). Founder
  reaffirmed after the counter-argument. The signed Lot 1 requirement will close
  unmet; that record is routed to the Chief of Staff as a **commercial** event,
  not resolved technically. The « paiement » maquette is unaffected (D-32).
- **`CADR-04`'s professional photography and SAP Ariba interface captures** —
  enhancement, not blocker (D-06). Waits on the client's photo library. The
  **pictograms** ship in this phase.
- **The client's real answers** to
  `Cadrage_Formation_SAP_Ariba_Questions_Client.docx` — replace the mocked
  content before the Lot 1 gate closes (D-02).
- **The generative hero** of the 26academy reference — out of budget at 2,5 j
  (D-20).
- **Photography-dependent visual richness**, **transactional email sending**,
  **domain authentication**, and everything in D-41's negative-space list.

</deferred>

---

*Phase: 01-cadrage-contenus-et-design*
*Context gathered: 2026-08-28 via PRD Express Path*
