# Phase 2: Site public — UI Design Contract

**Created:** 2026-08-29
**Status:** Locked — founder-approved
**Source:** validated maquette, not a generated spec

---

## 0. The authority

The design contract for this phase is a **founder-approved maquette**, not this file:

`C:/Users/Essakhi/Desktop/ElearningSAP/ariba-cto/notes/2026-08-29-maquette-lot2-landing-validee.html`

A single self-contained HTML file. The founder reviewed and approved it on 2026-08-29
(*"yes that what I'm talking about"*, then *"go ahead, approved"*).

**Read the file.** Every token, timing and composition rule below was measured from it.
**Where this document and the file disagree, the file wins.**

The reference the maquette is built from is **26academy.com, taken literally** —
structure, treatment, components and palette (D-01).

---

## 1. Why this spec names applied outcomes

Lot 1 shipped twelve green plans whose maquettes the founder rejected on sight. Every
design criterion was a **presence check** — does the token exist, is there one
`cubic-bezier`. A grep cannot see timidity.

Every criterion in §7 names an **applied outcome**. A criterion that can pass while the
page still looks flat is a defective criterion. **Do not soften these back into presence
checks.**

Diagnosis: `ariba-cto/notes/2026-08-29-les-maquettes-lot-1-sont-insuffisantes.md`.

---

## 2. Tokens

Replaces the Lot 1 `:root` palette.

```css
--ink:#0A2540; --ink-soft:#28374B; --muted:#5C6B82; --muted2:#8A95A8;
--violet:#635BFF; --violet-l:#8B85FF; --deep:#4F46E5; --indigo:#4338CA;
--blue:#3B82F6; --sky:#38BDF8; --mint:#1FC79B; --amber:#FFB444;
--lav:#F1F0FF; --lav2:#F6F5FF; --soft:#FBFBFE; --paper:#FCFCFF;
--border:#E9ECF3; --border2:#F0F2F8; --card:#FFFFFF;
--ease:cubic-bezier(.16,1,.3,1);
```

⚠ The accent `#635BFF` **departs from `CADR-05`** (« palette bleu / blanc / vert » in the
signed offer). The conflict was raised and priced; the founder reaffirmed violet and
instructed it not be routed for pricing. Build as instructed.

**Shadows are paired** — a 1px contact shadow plus a large soft one — across four tiers
`--shadow-1` … `--shadow-4`, plus `--shadow-brand` = `0 30px 60px -24px rgba(99,91,255,.45)`
for anything wearing the accent.

**Typography is unchanged from Lot 1**, already wired through `next/font`: **Plus Jakarta
Sans** display at `letter-spacing:-.028em`, **Inter** body. No font from a CDN.

The Lot 1 fluid type scale and spacing scale in `src/app/globals.css` stay.

---

## 3. Motion

Exact values, measured from 26academy's source.

| Effect | Specification |
|---|---|
| H1 typewriter | 26 ms/char typing, 1050 ms hold, 15 ms/char erase, 140 ms between words; cycles the six signed competencies |
| Typewriter width | locked to the widest word, **re-locked on `document.fonts.ready`** — the H1 must never reflow (CLS) |
| Typewriter resync | on `visibilitychange`, restore the whole current word — background tabs throttle timers and freeze it mid-letter |
| Hero spotlight | 600 px radial `rgba(99,91,255,.16)`, positioned from `mousemove` **on the hero only**, `opacity` 0 → 1 |
| Magnetic buttons | `translate(mx*.12, my*.18 - 2)` on `.btn-primary`, cleared on `mouseleave` |
| Mesh atmosphere | 4 blurred blobs, `filter:blur(84px)`, `mix-blend-mode:multiply`, drifting on 24–32 s loops, plus a rAF-throttled whole-layer cursor drift of ±34 px |
| Reveal on scroll | `translateY(34px)` → none, 1 s, staggered `.09s` per `data-d` step |
| Scroll progress | indicator across the top |
| Header | blurred at rest, deepening on scroll |
| Curve | **`cubic-bezier(.16,1,.3,1)` and nothing else, anywhere** |

**The kit stops here.** No per-section cursor-reactive background — that is more than the
reference does and it endangers `GOL-02`.

**`prefers-reduced-motion: reduce` bypasses every one of them:** the typewriter renders
the full word, the spotlight is hidden, the mesh stops, reveals are visible.

**Budget.** `GOL-02` obliges **Lighthouse ≥ 90 on mobile** — contractual. One
rAF-throttled pointer listener for the mesh, one for the hero spotlight, CSS keyframes
for the rest. The landing page stays static or ISR; motion mounts in **small client
islands**, never by turning the page into a client component.

---

## 4. Composition — the rules Lot 1 broke

1. **The surface system is tri-level.** The unconditional hover-lift (`--shadow-3` rest /
   `--shadow-4` + `translateY(-7px)` hover) is scoped to **niveau 3** only — the page's
   two highest-emphasis elements. **Niveau 1** (`--tint` background, `--hairline` border,
   zero box-shadow) and **niveau 2** (white background, `--hairline` border,
   `--contact`/`--inset-hi`) change background tint, border color (`--hairline` →
   `--hairline-2`) and a 2-3px `translateY` on hover; niveau 2 additionally transitions
   its box-shadow from `--contact` to `--shadow-1` (both paired with `--inset-hi`) —
   niveau 1 never gains a box-shadow at any state.
2. **The atmosphere layer is mounted once at the root**, visible behind **all seven**
   landing sections. Lot 1 reached 2 of 8.
3. **Sections alternate** transparent / `--lav2` tinted bands, so the atmosphere has
   something to read against.
4. **Every section opens eyebrow → two-sentence H2 → lead.** A claim, a full stop, then a
   turn. The second half carries the emotional payload and takes the gradient.
5. `variant="raised"` already exists on the Lot 1 Card family and is used zero times in
   eleven routes — **this lot uses it**. `--shadow-4` is defined and consumed nowhere —
   **this lot consumes it**. (Run 3 changes the CTA-final call site's shape — a
   card-assembly element replacing the current violet block — without changing this
   criterion.)

---

## 5. Structure

### Landing — the seven signed sections, in this order

1. **Hero** — accroche, sous-titre, CTA « Démarrer ma formation », CTA secondaire
   « Voir le programme », visuel principal, emplacement vidéo prêt
2. **Pour qui est cette formation ?** — five profils + « même sans expérience SAP »
3. **Ce que vous allez apprendre** — six compétences
4. **Programme détaillé** — five modules in an accordion + bouton PDF
5. **Format et modalités** — six repères
6. **Confiance et sécurité** — three faits + emplacements témoignages / logos
7. **CTA final et FAQ** — sept questions

Plus the **26academy-style bands** the founder approved: the animated figures band (the
five module durations 3 h / 4 h / 4 h / 3 h / 3 h — **17 h total**) and honest trust
placeholders.

### Other surfaces

- **Programme**, **Formation**, **À propos** — the three internal pages
- **Contact** — form: nom, email, téléphone, profil, message
- **Header** — nav; « Connexion » and « Prendre RDV » link to Lot 1 route shells. **This
  lot adds no auth logic.**
- **Footer** — complete. Every page reachable in **two clicks**.

---

## 6. Assets, states and content

- **No image is required.** 26academy's homepage loads five images total; all its richness
  is CSS and inline SVG. Pictograms are **inline SVG from a sprite**, as Lot 1 built them.
- **Tailwind v4 + shadcn/ui**, Lot 1 component families reused. **Do not fork a second
  button or card implementation.**
- **The four Lot 1 surface-state components** (loading, empty, error, success) are the
  only permitted states — used, not re-invented. A failed database read renders the error
  surface, never a blank section.
- The contact form covers **submitting, success, validation error, transport error**.
- **Témoignages and logos partenaires render as marked placeholders** with the signed
  placeholder copy — never as invented reviews.
- **Copy is never re-authored.** The signed French in `src/locales/fr/` is the source; it
  is seeded into Supabase and read from there. Where a string is missing, the mock
  registry is the answer, not invention.
- **French only** — `fr-FR`, LTR, `Europe/Paris`. Every date, time and number goes through
  the formatters exported by `src/lib/i18n/fr.ts`. No hand-written « € ».
- **No price** appears on the public site in this lot.

---

## 7. Acceptance criteria — applied outcomes

1. The surface map is verifiable **section by section**: **niveau 1** on compétences,
   the programme and FAQ accordions, and the Format parcours rows; **niveau 2** on the
   Pour-qui tiles, the Confiance tiles, and the parcours' side frame; **niveau 3** on
   **exactly two persistent surfaces** page-wide (hero assembly card, CTA-final
   console frame) — the ceiling counts rendered elements that carry the niveau-3
   rest/hover treatment (raised Card variant or an equivalent hand-styled surface),
   not a `Button` primary variant's `hover:shadow-[var(--shadow-4)]` hover
   micro-interaction, which is excluded from the count. The criterion is the
   **ceiling on niveau 3** (max 2), not a floor on total card count.
2. `--shadow-4` appears in the **compiled CSS output** — consumed by the hero visual frame
   and the final CTA — not only declared in `globals.css`.
3. The atmosphere layer is behind **all seven** landing sections, verifiable by mounting
   it once at the root rather than per section.
4. A search of the codebase for `cubic-bezier` returns **exactly one distinct value**. A
   search for `ease-in`, `ease-out` or `linear` on a `transition` or `animation` returns
   nothing.
5. The H1 cycles the six signed competencies at the measured timings, the headline never
   reflows while cycling, and the whole word is restored after a tab switch.
6. The header is blurred at rest and deepens on scroll.
7. Under `prefers-reduced-motion: reduce`: the H1 shows a complete word, the spotlight is
   absent, the mesh is static, reveals are visible.
8. Each of the seven sections opens eyebrow → two-sentence H2 → lead.
9. Every page is reachable in two clicks; the footer is complete.
10. `next build` 0, and Lighthouse mobile ≥ 90 remains achievable under the motion budget.

---

*Phase: 02-site-public*
*Derived from the founder-approved maquette on 2026-08-29. The maquette file is the authority.*
