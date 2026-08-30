# Phase 2: Site public — Pattern Map

**Mapped:** 2026-08-29
**Files analyzed:** 31 new/modified files
**Analogs found:** 22 / 31 (9 greenfield)
**Codebase size:** 118 tracked files, 24 source files under `src/` — the entire tree was read, not sampled.

---

## 0. Headline findings the planner must act on

These are not style notes. Each one invalidates a literal reading of a locked decision.

| # | Finding | Impact |
|---|---|---|
| **F-1** | **The easing token is named `--ease-brand`, not `--ease`.** `globals.css:54` declares `--ease-brand: cubic-bezier(0.16, 1, 0.3, 1)` inside `@theme inline`. D-05/§2 spell it `--ease`. Three files consume `--ease-brand` (`accordion.tsx:18,115`, `globals.css:180`). | Renaming forks the curve into two names and breaks AC-4. **Keep `--ease-brand`**; the *value* already matches D-05 exactly. |
| **F-2** | **`--shadow-brand` does not exist.** Grep for `shadow-brand` across `src/` returns zero. D-06 requires `0 30px 60px -24px rgba(99,91,255,.45)`. | Greenfield token — must be added to `@theme inline` beside `--shadow-1..4`. |
| **F-3** | **`--shadow-4` is declared and consumed nowhere.** Only hit: `globals.css:61`. Confirms D-23/AC-2. | Tailwind v4 `@theme inline` emits declared vars regardless of use, so "appears in compiled CSS" is satisfied trivially — **AC-2 must be verified by grepping `src/` for a `shadow-[var(--shadow-4)]` *call site*, not by grepping the CSS bundle.** |
| **F-4** | **`variant="raised"` is declared and used zero times.** Only hit: `card.tsx:14`. Confirms D-23. But `raised` maps to `--shadow-3` **at rest with no hover escalation** — the base cva string only escalates to `--shadow-2` and only when `data-interactive=true`. | D-19 (`--shadow-4` + `translateY(-7px)` on hover) is **not yet expressible**. Extend `cardVariants` in place; do not fork. |
| **F-5** | **`.btn-primary` does not exist.** D-12 targets `.btn-primary` for magnetic buttons. `button.tsx` is pure cva — no stable class name, no `data-slot` selector hook beyond `data-slot="button"`. | The magnetic island must hook `[data-slot="button"][data-magnetic]` or similar. Naming a `.btn-primary` class would be the forked second button implementation D-42/§6 forbids. |
| **F-6** | **`emails.json` contains NO contact-notification and NO contact-acknowledgement entry.** It has exactly four keys: `confirmationInscription`, `confirmationReservation`, `rappel`, `reinitialisationMotDePasse`. D-33 says both contact emails come "from Lot 1's signed `emails.json`". They are not there. | **Blocking.** Per D-25 the answer is the **mock registry, not invention**: add the two email bodies to `emails.json` and register every invented string in `_mocks.emails.json` so the guard keeps exiting 1. Do not silently author signed-looking French. |
| **F-7** | **The Phase 0 migration creates no table and no RLS policy.** `20260827131029_init_schema.sql` is 8 lines: `create schema if not exists app;` plus a comment. | **NO ANALOG EXISTS** for table naming, RLS policy shape, `updated_at` triggers, or PK convention. The new migration sets the precedent for every later lot. The only inherited convention is: **objects live in schema `app`**, and `db:types` generates `--schema public,app`. |
| **F-8** | **No API route, no server action, no `route.ts`, no `middleware.ts` exists anywhere.** Eleven `page.tsx` files, zero handlers. | Greenfield for the contact POST and for `/programme.pdf`. |
| **F-9** | **No email-sending code exists.** Grep for `resend`/`nodemailer` across `src/` and `scripts/` returns zero; neither is in `package.json`. | Greenfield. Resend is a new dependency **and** a new env var. |
| **F-10** | **Only two `"use client"` files exist:** `accordion.tsx:1` and `empty-state.tsx:1`. No `useEffect`, no rAF, no pointer listener anywhere in the repo. | The client-island *discipline* has a precedent (leaf components only, routes stay server); the **effect/listener/cleanup pattern is greenfield**. |
| **F-11** | The `:root` palette is **oklch bleu/vert** (`globals.css:77-120`), not the hex violet set of D-05. `--success` (`oklch(0.65 0.16 145)`) is consumed by `Button variant="success"`, `Card variant="success"`, `Message variant="success"`, and both atmosphere blobs. | Replacing `:root` per D-05 is not a find/replace — `--success` and `--primary` have live consumers whose meaning must be re-mapped, not dropped. |
| **F-12** | Mock registries hold **exactly 60** entries: `_mocks.public.json` 50 + `_mocks.journey.json` 6 + `_mocks.emails.json` 4. | Matches "~60 client-dependent keys". D-25's "a key that was unresolved stays unresolved" means the Supabase seed must carry the mock copy verbatim **and** leave the registry entries in place. The guard reads JSON bundles only — it never sees the database, so it will keep exiting 1 automatically. |

---

## 1. File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match |
|---|---|---|---|---|
| `src/app/globals.css` | config (tokens) | n/a | **itself** (modify) | exact |
| `src/components/ui/card.tsx` | component | n/a | **itself** (extend `raised`) | exact |
| `src/components/ui/button.tsx` | component | n/a | **itself** (add magnet hook) | exact |
| `src/components/sections/section.tsx` | component | n/a | **itself** (add `lav2` alternation) | exact |
| `src/components/sections/hero.tsx` | component | n/a | **itself** (rewrite to maquette) | exact |
| `src/components/layout/header.tsx` | component | n/a | **itself** (add blur + scroll depth) | exact |
| `src/components/layout/footer.tsx` | component | n/a | **itself** (already complete) | exact |
| `src/app/layout.tsx` | layout | n/a | **itself** (mount atmosphere once) | exact |
| `src/app/page.tsx` | page (RSC) | request-response (DB read) | **itself** + `programme/page.tsx` | exact |
| `src/app/programme/page.tsx` | page (RSC) | request-response (DB read) | `src/app/programme/page.tsx` | exact |
| `src/app/formation/page.tsx` | page (RSC) | request-response (DB read) | `src/app/programme/page.tsx` | exact |
| `src/app/a-propos/page.tsx` | page (RSC) | request-response (DB read) | `src/app/programme/page.tsx` | exact |
| `src/app/contact/page.tsx` | page (RSC shell) | request-response | `src/app/contact/page.tsx` | exact |
| `src/components/atmosphere/*.tsx` | client island | event-driven (rAF/pointer) | `src/components/ui/accordion.tsx` (discipline only) | partial |
| `src/components/motion/typewriter.tsx` | client island | event-driven (timer) | — | **none** |
| `src/components/motion/hero-spotlight.tsx` | client island | event-driven (pointer) | — | **none** |
| `src/components/motion/magnetic.tsx` | client island | event-driven (pointer) | — | **none** |
| `src/components/motion/reveal.tsx` | client island | event-driven (IO) | `globals.css:168-193` `.reveal-rise` | partial |
| `src/components/motion/scroll-progress.tsx` | client island | event-driven (scroll) | — | **none** |
| `src/components/forms/contact-form.tsx` | client island | request-response (POST) | `src/app/contact/page.tsx:60-122` (markup) | role-match |
| `src/app/api/contact/route.ts` *(or action)* | route handler | request-response | — | **none** |
| `src/lib/validation/contact.ts` | schema | transform | `src/lib/env/server.ts` | role-match |
| `src/lib/content/queries.ts` | service | CRUD (read) | `src/lib/supabase/server.ts` | partial |
| `src/lib/email/*.ts` | service | request-response (3rd party) | — | **none** |
| `src/lib/rate-limit.ts` | utility | event-driven | — | **none** |
| `src/app/programme.pdf/route.ts` | route handler | file-I/O | — | **none** |
| `supabase/migrations/2026XXXX_public_content.sql` | migration | n/a | `20260827131029_init_schema.sql` (schema name only) | partial |
| `supabase/migrations/2026XXXX_seed_content.sql` | migration (seed) | batch upsert | — | **none** |
| `src/types/database.types.ts` | generated | n/a | `scripts/gen-db-types.mjs` | exact |
| `src/lib/env/server.ts` | config | n/a | **itself** (add `RESEND_API_KEY`) | exact |
| `.env.example` | config | n/a | **itself** | exact |
| `src/locales/fr/emails.json` + `_mocks.emails.json` | content | n/a | **itself** (see F-6) | exact |

---

## 2. Pattern Assignments

### 2.1 Card family — `variant="raised"` (component)

**Analog:** `src/components/ui/card.tsx` — **the file itself. Extend, never fork (D-42).**

Base class string, `card.tsx:6-9`:

```tsx
const cardVariants = cva(
  "flex flex-col gap-4 rounded-xl border py-4 transition-all outline-none in-data-[density=compact]:gap-2 ... aria-invalid:ring-destructive/20" +
    /* why: a static card must never look clickable — hover/active lift only
       apply once the call site marks the card as an interactive control */
    " data-[interactive=true]:hover:shadow-[var(--shadow-2)] data-[interactive=true]:active:translate-y-px",
```

Variant map, `card.tsx:11-18` — **`raised` is the D-23 target, currently zero call sites**:

```tsx
    variants: {
      variant: {
        default: "border-border bg-background shadow-[var(--shadow-1)]",
        raised: "border-transparent bg-background shadow-[var(--shadow-3)]",
        outline: "border-border bg-background shadow-none",
        success: "border-transparent bg-success-muted shadow-[var(--shadow-1)]",
        muted: "border-transparent bg-muted shadow-none",
      },
```

**What the planner must change:**
- `raised` already satisfies "no visible border, `--shadow-3` at rest" (D-19 first half). The `border` in the base string stays but resolves transparent — that is fine and is *not* a bordered card.
- `raised` does **not** satisfy the hover half. Add to the `raised` variant string (not the base, not a new variant):
  `hover:shadow-[var(--shadow-4)] hover:-translate-y-[7px]`
  and keep `transition-all` from the base, which already inherits the single curve via Tailwind's default — **verify it emits `--ease-brand`, or add `ease-[var(--ease-brand)]` explicitly** (AC-4 forbids a bare `ease-*` default that compiles to `cubic-bezier(0.4,0,0.2,1)`).
- The `data-[interactive=true]` gate in the base comment exists so static cards don't look clickable. D-19 wants **all** floating cards to lift. Resolve by putting the lift on `raised` unconditionally — a design decision, documented, not a fork.
- This single edit is what makes **AC-1 (≥11 floating cards)** and **AC-2 (`--shadow-4` consumed)** reachable.

**Call-site migration:** `src/app/page.tsx` currently mounts `<Card>` (default, bordered, `--shadow-1`) at lines 54, 74 (`variant="outline"`), 114, 135 — **these are exactly the AC-1 "bordered-flat cards" that must reach zero**. Same for `programme/page.tsx:37`, `contact/page.tsx:42`, `connexion/page.tsx`.

---

### 2.2 Button family (component)

**Analog:** `src/components/ui/button.tsx` — **do not fork (D-42/§6).**

`button.tsx:1-11` — the render primitive and the `data-*` idiom:

```tsx
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none ... active:not-aria-[haspopup]:translate-y-px ..." +
    /* why: no boolean `loading` prop — a `data-loading` attribute is the API,
       matching this file's existing data-* idiom, and it never leaks an
       unknown attribute into the DOM the way a boolean prop would */
    " data-[loading=true]:pointer-events-none data-[loading=true]:opacity-70 ... [&_svg[data-slot=button-spinner]]:hidden data-[loading=true]:[&_svg[data-slot=button-spinner]]:block",
```

`button.tsx:15-16` — the primary variant already climbs the shadow ladder:

```tsx
        default:
          "bg-primary text-primary-foreground shadow-[var(--shadow-2)] hover:bg-primary/80 hover:shadow-[var(--shadow-3)] active:shadow-[var(--shadow-1)]",
```

**Polymorphic `render` prop is how a Button becomes a Link** — `hero.tsx:51-57`:

```tsx
<Button render={<Link href="/inscription" />} variant="success" size="lg">
  {common.actions.demarrer}
</Button>
```

**Magnetic-button hook (D-12, see F-5):** there is no `.btn-primary`. Follow the file's own `data-*` idiom — the client island should query `[data-slot="button"][data-magnetic="true"]`, and the prop is spread through `ButtonPrimitive` by `{...props}` at `button.tsx:60`. Adding `--shadow-brand` to the `default` variant is the D-06 accent hook.

---

### 2.3 The four surface-state components (component)

**Verdict: three files, not four.** The "four states" are covered by three component families. Map them precisely — do not re-invent (D-32/§6).

| State | Component | File | Excerpt |
|---|---|---|---|
| loading | `CardSkeleton` + `data-loading="true"` | `card.tsx:99-114` | below |
| empty | `EmptyState tone="neutral"` | `empty-state.tsx:35-52` | below |
| error | `EmptyState tone="error"` → delegates to `Message` | `empty-state.tsx:82-104` | below |
| success | `Message variant="success"` | `message.tsx:5-19` | below |

**Loading** — `card.tsx:99-114`, ancestor-driven via `in-data-[loading=true]`:

```tsx
function CardSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-skeleton"
      className={cn("hidden animate-pulse flex-col gap-2 in-data-[loading=true]:flex", className)}
      {...props}
    >
      <div className="bg-muted h-4 w-3/4 rounded-[var(--radius-sm)]" />
```

**Empty / error** — `empty-state.tsx:35-52`. Note it is `"use client"` and renders `Card variant="outline"`:

```tsx
function EmptyState({ className, tone = "neutral", size = "default", ...props }) {
  return (
    <EmptyStateContext.Provider value={tone ?? "neutral"}>
      <Card
        variant="outline"
        data-slot="empty-state"
        role={tone === "error" ? "alert" : undefined}
        className={cn(emptyStateVariants({ tone, size, className }))}
        {...props}
      />
    </EmptyStateContext.Provider>
  )
}
```

⚠ **`EmptyState` hardcodes `variant="outline"`** (`empty-state.tsx:44`) — a bordered, `shadow-none` card. Under AC-1 ("zero bordered-flat cards on any public page") a failed DB read rendering this surface would violate the criterion. The planner must either accept the error surface as exempt (documented) or add a `raised` path. **Flag this explicitly; it is a live contradiction between D-32 and AC-1.**

**Error delegation** — `empty-state.tsx:87-104`:

```tsx
  const tone = React.useContext(EmptyStateContext)
  /* why: a failed payment handoff must be announced like any other server
     rejection (D-23, T-01-20) — the error tone renders the shared Message
     part instead of a silent paragraph */
  if (tone === "error") {
    return (
      <Message data-slot="empty-state-description" variant="error" className={...} {...props}>
        {children}
      </Message>
    )
  }
```

**Success / error / info announcement** — `message.tsx:5-36`:

```tsx
const messageVariants = cva(
  "flex items-center gap-1.5 text-sm in-data-[density=compact]:text-xs [&_svg]:pointer-events-none ...",
  { variants: { variant: { error: "text-destructive", success: "text-success", info: "text-muted-foreground" } },
    defaultVariants: { variant: "error" } }
)

function Message({ className, variant = "error", ...props }) {
  if (variant === "error") {
    return <p data-slot="message" role="alert" aria-live="polite" className={...} {...props} />
  }
```

**Contact-form state mapping (D-36):** submitting → `Button data-loading="true"` + `FieldControl data-loading="true"`; success → `Message variant="success"` with `contact.succes.message`; validation error → `FieldError` (`field.tsx:82-91`); transport error → `Field rejected="server"` + `contact.erreurs.rejetServeur`. **All four already have a rendered demo at `src/app/contact/page.tsx:126-183` — copy it, it is the founder-validated state contract.**

---

### 2.4 `src/app/globals.css` (config — tokens)

**Analog: itself.** Two blocks matter and they behave differently.

**`@theme inline` — Tailwind v4 theme layer, `globals.css:53-74`.** Vars declared here are emitted into the compiled bundle whether or not a utility uses them (this is why F-3's AC-2 needs a call-site check):

```css
  /* D-17: the only easing curve on the site. Never add a second one. */
  --ease-brand: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-base: 220ms;

  /* D-18: four paired shadow tiers — a 1px contact shadow plus a large soft one. */
  --shadow-1: var(--shadow-contact), 0 4px 10px oklch(0.26 0.06 251 / 0.08);
  --shadow-2: var(--shadow-contact), 0 10px 20px oklch(0.26 0.06 251 / 0.12);
  --shadow-3: var(--shadow-contact), 0 20px 40px oklch(0.26 0.06 251 / 0.18);
  --shadow-4: var(--shadow-contact), var(--shadow-soft);

  /* CADR-05 spacing scale — explicit home rather than Tailwind's implicit default. */
  --spacing: 0.25rem;

  /* Type scale (CADR-05). Display and title are fluid via clamp() for mobile. */
  --text-display: clamp(2.25rem, 1.7rem + 2.5vw, 3.75rem);
  --text-display--line-height: 1.1;
  --text-title: clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem);
  --text-title--line-height: 1.15;
  --text-section: 1.5rem;
  --text-section--line-height: 1.3;
  --text-lead: 1.125rem;
  --text-lead--line-height: 1.6;
```

**These four type tokens and the spacing scale STAY (§2 "The Lot 1 fluid type scale and spacing scale in `src/app/globals.css` stay").** Only the palette is replaced.

**`:root` — the palette to replace per D-05, `globals.css:77-120`.** The two shadow colour components live here, at the bottom:

```css
  /* D-18 shadow ladder's two colour components. */
  --shadow-contact: 0 1px 2px oklch(0.26 0.06 251 / 0.12);
  --shadow-soft: 0 32px 64px oklch(0.26 0.06 251 / 0.22);
```

**Consumer inventory before replacing `:root` (F-11)** — `--success` is live in four places (`button.tsx:25-26`, `card.tsx:16`, `message.tsx:12`, `section.tsx:34`, `hero.tsx:33`) and `--primary` in ~15. Every `@theme inline` `--color-*` alias at `globals.css:8-44` bridges the two blocks; the aliases stay, only the `:root` values change.

**Existing atmosphere + motion primitives to supersede** — `globals.css:139-204`. Current implementation is `blur(60px)` on `.atmosphere-blob` (D-13 wants `84px`), no `mix-blend-mode: multiply`, no drift keyframes, `translateY(20px)` reveal (D-14 wants `34px`), and three hardcoded delay classes (D-14 wants staggered `.09s` per `data-d`):

```css
  .atmosphere-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    pointer-events: none;
  }

  /* Motion primitives (D-17): every transition/animation uses --ease-brand and
     --duration-base — no `ease`, no `linear`, no second curve anywhere. */
  @keyframes reveal-rise {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .reveal-rise { animation: reveal-rise calc(var(--duration-base) * 3.4) var(--ease-brand) both; }
  .reveal-delay-1 { animation-delay: 90ms; }
```

**The reduced-motion bypass already exists and is global** — `globals.css:195-204`. It is a blunt `animation-duration: 0.01ms !important` sweep. **It does not satisfy AC-7**: it will not make the typewriter render a full word, will not hide the spotlight, will not stop a JS-driven mesh drift. Every client island needs its own `matchMedia("(prefers-reduced-motion: reduce)")` guard **in addition** to this block.

```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
```

---

### 2.5 `src/lib/i18n/fr.ts` — the only permitted formatters (utility)

**Analog: itself. Do not add a second formatting path (D-43).** Exports, `fr.ts:8-69`: `LOCALE`, `TIME_ZONE`, `dateFormatter`, `dateTimeFormatter`, `numberFormatter`, `currencyFormatter`, `timeFormatter`, and wrappers `formatDate`, `formatDateTime`, `formatNumber`, `formatCurrency`, `formatTime`.

```ts
export const LOCALE = "fr-FR" as const;
export const TIME_ZONE = "Europe/Paris" as const;

/* why: numberFormatter has no currency style, so it never produces a "€" —
   a maquette that hand-writes the symbol next to a plain number would
   violate D-29/D-30, so every price must go through this formatter instead */
export const currencyFormatter: Intl.NumberFormat = new Intl.NumberFormat(LOCALE, {
  style: "currency", currency: "EUR",
});
```

**Established call-site pattern** — module durations, `page.tsx:93` and `programme/page.tsx:41`:

```tsx
<Badge variant="outline">{formatNumber(module.duree)}</Badge>
```

⚠ `formatNumber(3)` renders `"3"` — **no « h » unit**. The figures band (D-30, "3 h / 4 h / 4 h / 3 h / 3 h — 17 h total") needs a unit suffix. `Intl.NumberFormat` supports `{ style: "unit", unit: "hour" }`; **adding a `hourFormatter` export to this file is the compliant path**, appending a hand-written `" h"` at a call site is not. The 17 h total must be **computed by summing the DB rows**, then formatted — not stored as a string.

---

### 2.6 `src/locales/fr/*.json` — the seed source (content)

**`landing.json`** — the seed shape for the Supabase content tables. Eight top-level keys matching the seven sections plus `ctaFinal`:

| Key | Shape | Rows to seed |
|---|---|---|
| `hero` | `{ titre, sousTitre }` | 1 singleton |
| `pourQui` | `{ titre, reassurance, profils[5] }`, each `{ titre, description, picto }` | 5 |
| `competences` | `{ titre, items[6] }` — **plain string array, no picto key** | 6 |
| `programme` | `{ titre, telechargerPdf, modules[5] }`, each `{ titre, duree: number, resume }` | 5 |
| `formatModalites` | `{ titre, items[6] }`, each `{ titre, description, statut? }` — `statut` optional | 6 |
| `confiance` | `{ titre, items[3], temoignages.placeholder, logos.placeholder }` | 3 + 2 placeholders |
| `faq` | `{ titre, items[7] }`, each `{ question, reponse }` | 7 |
| `ctaFinal` | `{ titre, supportLine }` | 1 singleton |

`duree` is **already a number** (3/4/4/3/3) — D-30's 17 h is `SUM(duree)`, and the column must stay numeric so the PDF and the band both compute it.

**The `picto` gap** — `page.tsx:26-38`, a positional mapping the copy layer does not carry:

```tsx
// why: `competences.items` (landing.json) is a plain string array — the copy
// layer has no per-item picto key. The registry's six PUB-03 competency
// pictograms already exist in the same order as the signed competency list,
// so the mapping is positional rather than a locale-bundle key this plan is
// not allowed to invent.
const COMPETENCE_PICTOS: readonly PictogramName[] = [
  "ecosysteme-ariba", "procure-to-pay", "source-to-pay",
  "rfq-rfp", "gestion-catalogues", "contrats-workflows",
];
```

**Moving to the DB is the chance to make this a real column** (`picto text`), removing the positional fragility. `pourQui.profils[].picto` already carries one (`"acheteur"`, `"category-manager"`, …) — mirror that.

**`common.json`** — `metadata`, `nav` (13 keys + `menu.ouvrir/fermer`), `footer` (`baseline`, `colonnes.{formation,compte,informations}`, `copyright` with `{annee}`, five legal-page labels), `actions` (10), `etats` (`chargement`, `erreurGenerique`, `champRequis`, `aucunResultat`). **`common.json` is chrome, not content — it stays a JSON import.** D-24 scopes the migration to *public content*; the header/footer read `common.json` at build time and that is correct.

**`contact.json`** — already carries every string the form needs: `champs`, `profil` (4 options), `aideParChamp`, `erreurs` (6, incl. `rejetServeur`), `succes.{titre,message}`, `coordonnees.email` = `contact@formation-sap-ariba.fr`. **No new contact copy needs authoring.**

**`emails.json` — see F-6. The two contact emails do not exist.** The four existing entries share this exact shape, which the two new ones must copy:

```json
  "confirmationInscription": {
    "objet": "…", "preheader": "…", "salutation": "Bonjour {prenom},",
    "corps": ["…", "…"],
    "action": { "libelle": "…", "contexte": "…" },
    "signature": "Votre formateur, expert certifié SAP Ariba",
    "pied": "…"
  },
```

Placeholders are `{prenom}`-style single braces, substituted by a `.replace()` (see `footer.tsx:109`, `common.footer.copyright.replace("{annee}", String(annee))`) — there is no templating library.

---

### 2.7 The mock registry (script + data)

**Script:** `scripts/check-mock-content.mjs`. **Registries:** `src/locales/fr/_mocks.{public,journey,emails}.json` — 50 + 6 + 4 = **60**. **Run:** `npm run content:check` (`package.json` scripts). **Deliberately outside CI** — see the header comment, `check-mock-content.mjs:1-11`.

The exit-1 logic, `check-mock-content.mjs:88-98` — note it exits 1 on **both** outstanding mocks and unresolvable keys:

```js
if (unresolvable > 0) {
  console.error(`check-mock-content: ${unresolvable} clé(s) de registre non résolvable(s)`);
}
if (outstanding > 0 || unresolvable > 0) {
  process.exit(1);
}
console.log("check-mock-content: aucune valeur mockée restante");
```

Registry entry shape (`_mocks.emails.json`):

```json
{ "file": "emails.json", "key": "confirmationInscription.signature", "blocks": "CADR-03", "awaiting": "Cadrage_Formation_SAP_Ariba_Questions_Client.docx" }
```

**Two guard rails the planner must honour (D-25, D-48):**
1. The script resolves keys **against the JSON bundle only** (`resolvePath`, lines 33-40). It never reads Supabase. So migrating content to the DB **cannot** silently satisfy the guard — good. But it also means **the JSON bundles must not be deleted**, or every registry entry becomes "unresolvable" and the guard still exits 1 for the wrong reason.
2. There is a self-defence branch at lines 25-31: deleting all registries also exits 1. Do not attempt it.
3. **Every string invented for the two new contact emails (F-6) must gain a `_mocks.emails.json` entry**, `"blocks": "CADR-03"`.

---

### 2.8 Supabase — migration, clients, generated types

**Migration analog — `supabase/migrations/20260827131029_init_schema.sql`, the file in full (8 lines):**

```sql
-- Proves the migration mechanism end to end before any real schema depends on it:
-- created, applied locally with `supabase db reset`, and its effect observed in
-- the running database. Reversible with a single `drop schema app cascade;`.
-- No domain table is created here — Lot 3 and later lots own the schema.

create schema if not exists app;

comment on schema app is 'Namespace later lots place their objects in.';
```

**NO ANALOG EXISTS for table/RLS/naming conventions (F-7).** What *is* established and must be matched:
- Objects go in schema **`app`**, not `public`.
- Lowercase `snake_case` SQL, no quoted identifiers.
- A leading `--` comment block stating *why*, and the reversal command.
- `comment on <object> is '…'` is used — carry that forward per table.
- Filename: `<UTC timestamp>_<snake_case_name>.sql`.
- D-26 makes this trivially satisfiable: nothing exists to alter or drop.

**Server client — `src/lib/supabase/server.ts:1-24`.** This is the RSC read path for content:

```ts
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/env/server";
import type { Database } from "@/types/database.types";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); }, ... } },
  );
}
```

⚠ **`cookies()` opts the route out of static rendering.** D-38 requires the landing page stay **static or ISR**. Calling this `createClient()` from `page.tsx` makes the route dynamic and breaks the "eleven routes prerendered static" property. **The content read path needs a cookieless client** — `createClient` from `@supabase/supabase-js` with the anon key, no cookie adapter — since anon published-row reads carry no session. This is a real architectural decision the planner must make explicitly, not inherit.

**Browser client — `src/lib/supabase/client.ts:14-19`**, anon key only, kept structurally apart from the service-role key.

**Generated types — `src/types/database.types.ts`.** Currently `app.Tables` and `public.Tables` are both `{ [_ in never]: never }` — empty. Regenerate with `npm run db:types` after the migration; the wrapper is `scripts/gen-db-types.mjs`, which runs `npx supabase gen types typescript --local --schema public,app`, refuses to write on non-zero exit, and normalises line endings to `EOL`. **Never hand-edit the file** (its own header says so).

---

### 2.9 Route / page composition (page — RSC)

**Analog for a landing composed of sections — `src/app/page.tsx:40-66`.** Server component, static imports, `.map()` over locale data:

```tsx
export default function Home() {
  return (
    <>
      <Hero />
      <Section id="pourQui" tone="default">
        <SectionHeader title={landing.pourQui.titre} lead={landing.pourQui.reassurance} />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {landing.pourQui.profils.map((profil) => {
            const Picto = pictograms[profil.picto as PictogramName];
            return (
              <Card key={profil.titre}>
                <CardHeader>
                  <Picto className="text-primary size-8" />
                  <CardTitle>{profil.titre}</CardTitle>
                </CardHeader>
```

The seven `<Section>` mounts are at `page.tsx:45, 68, 85, 110, 131, 161, 175`. Under D-24 every `landing.*` static import becomes an `await` on a DB query — the JSX shape is otherwise reusable verbatim.

**`Section` shell — `src/components/sections/section.tsx:16-44`.** Currently three tones; D-21 wants transparent / `--lav2` alternation, and D-20 wants the atmosphere **out** of here and mounted once at the root:

```tsx
function Section({ className, tone = "default", children, ...props }: SectionProps) {
  return (
    <section
      data-slot="section" data-tone={tone}
      className={cn("relative py-16 sm:py-20 lg:py-24",
        tone === "muted" && "bg-muted",
        tone === "atmosphere" && "atmosphere-wash overflow-hidden text-primary-foreground",
        className)}
      {...props}
    >
      {tone === "atmosphere" && (
        <>
          <span aria-hidden="true" className="atmosphere-blob top-[-20%] right-[-10%] size-72 bg-success/30 sm:size-96" />
          <span aria-hidden="true" className="atmosphere-grain" />
        </>
      )}
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
```

**This per-section atmosphere mount is exactly the D-20/AC-3 failure** ("Lot 1 reached 2 of 8"): only `Section tone="atmosphere"` (`page.tsx:175`) and `Hero` (`hero.tsx:31-35`) carry it. **Delete both mounts; mount once in `layout.tsx`.**

**`SectionHeader` — `section.tsx:57-70`.** Takes `title` + optional `lead`. **D-22/AC-8 requires eyebrow → two-sentence H2 → lead — there is no `eyebrow` prop.** Add one. The comment at `section.tsx:52-56` explains why the two-sentence device is one string, not a split:

```tsx
/**
 * The title stays in one element so the browser wraps the two-sentence
 * copy device naturally (D-25) — splitting on "." in JavaScript would break
 * on any abbreviation the copy layer later introduces.
 */
```

**Internal-page shell analog — `src/app/programme/page.tsx:18-33`** (same shape in `formation`, `a-propos`, `contact`). Note all four reproduce the section rhythm **inline** with a documented reason:

```tsx
export default function Programme() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12 sm:py-16 lg:py-20">
      <header className="reveal-rise flex flex-col gap-3">
        <h1 className="font-heading text-[length:var(--text-title)] leading-[var(--text-title--line-height)] font-semibold">
          {programme.titre}
        </h1>
```

The reason has expired — `Section`/`SectionHeader` now exists. **The three internal pages should be refactored onto `Section`/`SectionHeader`**, which also removes the `sr-only` h2 workaround at `programme/page.tsx:33`.

**Root layout — `src/app/layout.tsx:19-44`**, the D-20 single-mount point. `next/font` is already wired at lines 8-12 (D-40 satisfied — no CDN):

```tsx
const bodyFont = Inter({ variable: "--font-body", subsets: ["latin"] });
const headingFont = Plus_Jakarta_Sans({ variable: "--font-heading-face", subsets: ["latin"] });

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a href="#contenu-principal" className="sr-only focus:not-sr-only ...">{common.nav.allerAuContenu}</a>
        <Header />
        <main id="contenu-principal" className="flex-1">{children}</main>
        <Footer />
```

`LayoutProps<"/">` is Next 16's generated type — use it, do not hand-write props. **Insert `<AtmosphereLayer />` as the first child of `<body>`**; the existing `min-h-full flex flex-col` means it must be `fixed inset-0 -z-10 pointer-events-none` to sit behind all seven sections.

**Lot 1 route shells for « Connexion » / « Prendre RDV »** — `src/app/connexion/page.tsx` (form maquette, no auth) and `src/app/inscription/page.tsx`. The header links to them at `header.tsx:43-51`. Note the header CTA points at `/inscription` with the label `common.actions.demarrer` (« Démarrer ma formation »); there is **no `/reservation` link in the header** and no « Prendre RDV » string in `common.json` — `common.actions.reserver` is « Réserver ». D-38's "adds no auth logic" is already true.

---

### 2.10 Client-island pattern

**Analog — `src/components/ui/accordion.tsx:1-3`.** The only precedent, and it establishes the *discipline*, not the effect mechanics:

```tsx
"use client"
/* why: the first stateful leaf in the repository — every route stays a
   server component, only this interactive collapsible needs client state */
```

**Single-curve discipline inside an island — `accordion.tsx:16-18` and `:115`.** Every transition names the token explicitly rather than relying on a Tailwind `ease-*` default (this is what keeps AC-4 true):

```tsx
    /* why: the chevron rotates on Base UI's own trigger-side open indicator
       (`data-panel-open`) — the single site curve, no second easing value */
    " [&_svg[data-slot=accordion-chevron]]:transition-transform [&_svg[data-slot=accordion-chevron]]:duration-[var(--duration-base)] [&_svg[data-slot=accordion-chevron]]:ease-[var(--ease-brand)] data-[panel-open]:[&_svg[data-slot=accordion-chevron]]:rotate-180",
```

```tsx
        /* why: the panel's own `--accordion-panel-height` css var (set by the
           primitive) drives a plain transition — no new keyframes, no second
           easing curve (D-17) */
        "h-[var(--accordion-panel-height)] overflow-hidden text-sm transition-[height,opacity] duration-[var(--duration-base)] ease-[var(--ease-brand)] ...",
```

**NO ANALOG EXISTS** for: `useEffect`, `requestAnimationFrame`, `addEventListener` + cleanup, `matchMedia`, `IntersectionObserver`, `document.fonts.ready`, `visibilitychange`. Zero occurrences repo-wide. Every motion island (D-08 → D-18) is greenfield mechanics under an existing discipline. The pattern to establish and repeat: `"use client"` + a *why* comment + one `useEffect` with an explicit cleanup + a `matchMedia("(prefers-reduced-motion: reduce)")` early return.

---

### 2.11 Inline-SVG sprite / pictograms

**Analog — `src/components/icons/pictograms.tsx` (199 lines).** Header contract, lines 1-35:

```tsx
/**
 * Domain pictograms only (CADR-04). Generic marks — chevron, calendar,
 * mail, check, arrow, user, download, alert, clock, shield, badge, refresh —
 * are lucide-react at the call site, never redrawn here.
 *
 * Contract: viewBox 24x24, no width/height (size-* utility governs it),
 * currentColor, consistent stroke weight across the set (D-21).
 */
const STROKE_WIDTH = 1.75;

function PictogramBase({ className, children, ...props }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={STROKE_WIDTH}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
      className={cn(className)} {...props}>
      {children}
    </svg>
  );
}
```

Each pictogram is a `PictogramBase` wrapper with a doc-comment naming its requirement:

```tsx
/** PUB-02 target profile — acheteur (buyer): briefcase with a handshake tick. */
function Acheteur(props: ComponentProps<"svg">) {
  return (
    <PictogramBase {...props}>
      <path d="M5 8h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />
```

The file exports a `pictograms` record and a `PictogramName` union (consumed at `page.tsx:21,52,72`). **Two-registry rule: domain marks here, generic marks from `lucide-react` at the call site** (`contact/page.tsx:1` `import { Mail }`, `programme/page.tsx:1` `import { Target, BookOpen }`). D-41 is satisfied by this file — add new domain marks to it, never a second sprite.

---

### 2.12 API route / server action / Zod boundary

**NO ANALOG EXISTS for route handlers or server actions (F-8).** Zero `route.ts`, zero `"use server"`, zero `middleware.ts`. `src/app/` is eleven `page.tsx` files plus `layout.tsx`, `globals.css`, `favicon.ico`.

**Zod boundary analog — `src/lib/env/server.ts:15-38`.** The repo's one validation idiom: schema, `safeParse`, `.issues.map(...).join("; ")`, then throw/reject. Zod v4 (`z.url()`, not `z.string().url()`):

```ts
const serverEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

const parsed = serverEnvSchema.safeParse({ ...process.env, NEXT_PUBLIC_SITE_URL: resolveSiteUrl(process.env) });

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  throw new Error(`Invalid environment variables — ${issues}`);
}
export const serverEnv: Readonly<ServerEnv> = Object.freeze(parsed.data);
```

**Contact schema must copy this shape**, mapping `issue.path` → the matching `contact.erreurs.*` key rather than surfacing Zod's English messages (CLAUDE.md: no hardcoded strings). `contact.erreurs` already has `nomRequis`, `emailRequis`, `emailInvalide`, `messageRequis`, `profilRequis`. The `profil` enum values are `contact.profil`'s keys: `acheteur | consultant | etudiant | entreprise`.

**Existing form markup to lift — `src/app/contact/page.tsx:60-122`.** Field names are already `nom`, `email`, `telephone`, `profil`, `message`, matching D's five fields. The current comment states the negative space that Lot 2 now fills:

```tsx
      {/* why: PUB-11 (submission, spam protection) is Lot 2 (D-41) — this is a
          maquette of a form; no action, no onSubmit, no fetch, no validation
          function, no zod schema, no honeypot, no captcha */}
      <form className="reveal-rise flex flex-col gap-5" aria-label={contact.titre}>
        <Field>
          <FieldLabel htmlFor="contact-nom">{contact.champs.nom}</FieldLabel>
          <FieldControl id="contact-nom" name="nom" autoComplete="name" />
          <FieldDescription>{contact.aideParChamp.nom}</FieldDescription>
        </Field>
```

`FieldControl` is polymorphic via `render` — `<select>` at lines 96-105 and `<textarea rows={4}>` at line 114. Reuse both.

⚠ **`queryKeys` factory (CLAUDE.md) has no analog** — no TanStack Query in `package.json`, no `queryKeys` anywhere. The contact form is a single POST; introducing a query library for it would be scope creep. Flag as N/A for this lot.

---

### 2.13 Email transport

**NO ANALOG EXISTS — greenfield (F-9).** No `resend`, no `nodemailer`, no `sendgrid`, no `mail` module. Not in `package.json` dependencies.

**What exists to build on:**
- `emails.json` copy shape (§2.6) — but **the two contact emails are absent (F-6)**.
- `{placeholder}` substitution by `String.replace` (`footer.tsx:109`) — no templating library.
- The env pattern for the new `RESEND_API_KEY` — add to `serverEnvSchema` (`server.ts:15-20`) as `RESEND_API_KEY: z.string().min(1)` **and** to `.env.example` under the existing comment block:

```
# Server-only, secret — never prefix with NEXT_PUBLIC_, never exposed to the browser
SUPABASE_SERVICE_ROLE_KEY=
```

D-34 ("read from validated env, never committed") maps exactly onto this file's stated contract: *"Throws instead of defaulting: a later lot reading an undefined payment or calendar credential would fail against a live third party, at the worst possible moment."*

⚠ **`serverEnv` is evaluated at module load.** Adding a required `RESEND_API_KEY` will break `next build` and every existing route until the var is set in `.env.local` and on Vercel. The planner must sequence this (or make it lazily-validated) or D-48's "`next build` 0" fails.

---

## 3. Shared Patterns

### 3.1 `cn` + `cva` component idiom
**Source:** `src/lib/utils.ts`, consumed by all eight `src/components/ui/*` files.
**Apply to:** every new component.
Shape: `cva(baseString, { variants, defaultVariants })` → `function X({ className, variant, size, ...props }: PrimitiveProps & VariantProps<typeof xVariants>)` → `<Primitive data-slot="x" className={cn(xVariants({ variant, size, className }))} {...props} />` → `export { X, xVariants }`.

### 3.2 `data-*` attributes over boolean props
**Source:** `button.tsx:8-11`, restated at `accordion.tsx:12-14`.
**Apply to:** every state a component must react to (`data-loading`, `data-interactive`, `data-density`, `data-rejected`).
```tsx
/* why: no boolean `loading` prop — a `data-loading` attribute is the API,
   matching this file's existing data-* idiom, and it never leaks an
   unknown attribute into the DOM the way a boolean prop would */
```
The ancestor-driven variant `in-data-[…]:` is the companion (`globals.css:206-214` explains the density contract).

### 3.3 The shared focus ring
**Source:** `header.tsx:5-6`, duplicated verbatim at `footer.tsx:4-5`.
**Apply to:** every new link and interactive non-Button element.
```tsx
const FOCUS_RING =
  "outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring rounded-md";
```
Duplicated in two files already — a third copy justifies extracting it to `src/lib/utils.ts`.

### 3.4 The "why" comment convention
**Source:** every file. `card.tsx:7-8`, `button.tsx:8-10`, `section.tsx:52-56`, `supabase/server.ts:9-17`.
**Apply to:** every non-obvious decision. Per CLAUDE.md: comments explain *why*, never *what*. The codebase cites decision IDs inline (`D-17`, `PUB-11`, `CADR-05`) — continue with this phase's D-numbers, and **disambiguate**, since D-numbers collide across lots (`fr.ts:32-34` cites Lot 1's D-29/D-30, which are different decisions from this phase's D-29/D-30).

### 3.5 Single-curve enforcement
**Source:** `globals.css:53-54` (declaration), `accordion.tsx:18,115` (consumption).
**Apply to:** every transition and animation.
Never write a bare Tailwind `transition-*` without `ease-[var(--ease-brand)]` — Tailwind's default `transition` shorthand emits `cubic-bezier(0.4, 0, 0.2, 1)`, a **second distinct curve** that fails AC-4. ⚠ `card.tsx:6` and `button.tsx:7` both currently use bare `transition-all`. **Audit these two before claiming AC-4.**

### 3.6 Server-only boundary
**Source:** `src/lib/supabase/server.ts:1` (`import "server-only"`), `src/lib/env/client.ts:11-14` (the mirrored prohibition).
**Apply to:** the email module, the rate limiter, and any module touching `RESEND_API_KEY`.

---

## 4. No Analog Found — greenfield, explicit verdicts

| Concern | Verdict |
|---|---|
| Email sending (Resend or otherwise) | **NO ANALOG EXISTS — greenfield.** No dependency, no module, no env var. |
| The two contact email bodies in `emails.json` | **DO NOT EXIST.** Blocking; see F-6. |
| API route handler / server action | **NO ANALOG EXISTS — greenfield.** Zero `route.ts`, zero `"use server"`. |
| PDF generation | **NO ANALOG EXISTS — greenfield.** No pdf dependency. `landing.programme.telechargerPdf` renders as a **disabled** Button today (`page.tsx:101-106`). |
| Rate limiting | **NO ANALOG EXISTS — greenfield.** No store, no cache, no KV. Must be dependency-free (D-35). |
| Honeypot / anti-spam | **NO ANALOG EXISTS — greenfield.** `contact/page.tsx:57-59` states its absence explicitly. |
| Supabase table + RLS conventions | **NO ANALOG EXISTS — greenfield.** Phase 0 created a schema and nothing else (F-7). This migration sets the precedent for Lots 3-10. |
| Idempotent seed / upsert (D-27) | **NO ANALOG EXISTS — greenfield.** No `supabase/seed.sql`. |
| Client-side effects (rAF, listeners, `matchMedia`, `IntersectionObserver`, `document.fonts.ready`, `visibilitychange`) | **NO ANALOG EXISTS — greenfield.** Zero occurrences repo-wide. |
| `--shadow-brand` token | **DOES NOT EXIST.** Must be added (F-2). |
| `.btn-primary` class (D-12 target) | **DOES NOT EXIST.** Use `[data-slot="button"]` (F-5). |
| `--ease` token (D-05 name) | **DOES NOT EXIST** under that name — it is `--ease-brand`, correct value (F-1). |
| `eyebrow` prop on `SectionHeader` (D-22/AC-8) | **DOES NOT EXIST.** Must be added. |
| Static-safe (cookieless) Supabase read client | **DOES NOT EXIST.** Both existing clients are cookie/browser bound; see §2.8 warning against D-38. |
| Hour-unit formatter for D-30 | **DOES NOT EXIST.** `formatNumber` emits no unit; add to `fr.ts` (§2.5). |
| `queryKeys` factory / TanStack Query | **DOES NOT EXIST** and is not warranted by this lot's single POST. |
| Tests | None exist. CLAUDE.md: do not write tests unless asked. |

---

## 5. Contradictions the planner must resolve, not inherit

1. **AC-1 vs D-32.** `EmptyState` hardcodes `Card variant="outline"` — a bordered, shadow-none card. AC-1 demands zero bordered-flat cards on any public page. The mandated error surface violates the mandated card rule.
2. **D-33 vs reality.** The two contact emails are not in `emails.json` (F-6). D-25 forbids re-authoring; the mock registry is the sanctioned escape hatch.
3. **D-38 vs `supabase/server.ts`.** `cookies()` forces dynamic rendering; the landing page must stay static/ISR.
4. **D-48 vs adding a required env var.** `serverEnv` validates at module load; a new required `RESEND_API_KEY` breaks `next build` until provisioned (D-34 says the CIO provisions it).
5. **AC-2 is not falsifiable as written.** Tailwind v4 `@theme inline` emits `--shadow-4` into the bundle already, with zero call sites. Verify at the call site, not in the compiled CSS.
6. **AC-4 vs existing `transition-all`.** `card.tsx:6` and `button.tsx:7` use Tailwind's bare `transition-all`, which compiles a second `cubic-bezier`. This is a **pre-existing Lot 1 violation** that Lot 2's AC-4 inherits.

---

## Metadata

**Analog search scope:** whole repository — `src/` (24 files), `scripts/` (2), `supabase/migrations/` (1), `package.json`, `.env.example`. Nothing sampled.
**Files scanned:** 118 tracked; 31 read in full.
**Pattern extraction date:** 2026-08-29
**Baseline commit:** `4f44f71`
