# Phase 1: Cadrage, contenus et design - Pattern Map

**Mapped:** 2026-08-28
**Files analyzed:** ~25 new / 3 modified (design tokens, 5 component families, locale bundles, guard script, pictograms, 11 routes)
**Analogs found:** 6 real analogs for 7 requested pattern areas — the codebase is a Phase-0 socle only (15 files under `src/`)

> ⚠ **Correction to a stated assumption.** The mapping request said `src/components/ui/button.tsx`
> uses Radix `Slot`. **It does not.** It is built on **Base UI** (`@base-ui/react/button`) with the
> shadcn `base-nova` style. There is **no Radix dependency in `package.json`** and no `asChild` /
> `Slot` anywhere in the repo. Base UI uses a `render` prop, not `asChild`. Every new component
> family must follow Base UI, or the planner ships two incompatible primitive layers.

---

## Full inventory of `src/` (the whole analog surface)

```
src/app/{favicon.ico, globals.css, layout.tsx, page.tsx}
src/components/ui/button.tsx          <- the ONLY component
src/lib/env/{client.ts, index.ts, server.ts, site-url.ts}
src/lib/i18n/fr.ts
src/lib/supabase/{client.ts, server.ts}
src/lib/utils.ts
src/locales/fr/common.json            <- the ONLY locale file
src/types/database.types.ts           <- D-11: do not touch
```

Root: `components.json`, `postcss.config.mjs`, `eslint.config.mjs`, `next.config.ts`,
`vercel.json`, `tsconfig.json`, `.nvmrc` (`22`), `scripts/gen-db-types.mjs`,
`.github/workflows/ci.yml` (the only workflow), `public/` (**empty**), `docs/hebergement.md`.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/app/globals.css` (**modify**) | config / design tokens | n/a | itself (lines 5–52 replaced) | self |
| `src/components/ui/button.tsx` (**modify** — CTA variants + states) | component | n/a | itself | self |
| `src/components/ui/card.tsx` | component | n/a | `src/components/ui/button.tsx` | role-match |
| `src/components/ui/badge.tsx` | component | n/a | `src/components/ui/button.tsx` | role-match |
| `src/components/ui/accordion.tsx` | component (Base UI stateful) | event-driven | `src/components/ui/button.tsx` (cva/`cn`/`data-slot` only — no stateful primitive exists) | partial |
| `src/components/ui/{input,label,field}.tsx` | component | n/a | `src/components/ui/button.tsx` | role-match |
| pictogram set (e.g. `src/components/icons/*`) | component | n/a | **none** — `public/` is empty, no SVG in repo | ⛔ no analog |
| `src/locales/fr/*.json` (new namespaces) | content | n/a | `src/locales/fr/common.json` | exact |
| `src/locales/fr/common.json` (**modify** — drop `home.placeholder`) | content | n/a | itself | self |
| mock-content guard script | tooling / node CLI | batch, exit-code | `scripts/gen-db-types.mjs` | exact |
| `package.json` `scripts` entry | config | n/a | `"db:types"` (line 14) | exact |
| `src/app/page.tsx` (**modify**) | route (server component) | n/a | itself | self |
| `src/app/{programme,formation,a-propos,contact,inscription,connexion,agenda,reservation,paiement,espace}/page.tsx` | route (server component) | n/a | `src/app/page.tsx` | exact |
| exploration HTML (D-03, outside `src/`) | throwaway | n/a | **none** | ⛔ no analog |

---

## Pattern Assignments

### 1. `src/components/ui/*` — the component template

**Analog:** `C:\Users\Essakhi\Desktop\ElearningSAP\ElearningAriba\src\components\ui\button.tsx` (58 lines, the only component). Copy its shape exactly.

**Imports + primitive layer** (`button.tsx:1-4`):

```tsx
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
```

- Primitive: **Base UI**, subpath import `@base-ui/react/<part>`, aliased `XPrimitive`.
- `cn` from `@/lib/utils` (`src/lib/utils.ts:4` — `twMerge(clsx(inputs))`).
- **No `"use client"` directive.** The one existing component is a server-importable module; Base UI
  parts that need state (accordion) will require `"use client"` — that is a *new* pattern, no analog.
- **No semicolons, double quotes** in this file (shadcn-generated). Contrast: every hand-written
  file in `src/` (`fr.ts`, `page.tsx`, `layout.tsx`) **uses semicolons**. Two styles coexist; there
  is no Prettier config in the repo. Keep generated-component style inside `src/components/ui/`.

**cva shape** (`button.tsx:6-41`) — base string, then `variants: { variant, size }`, then
`defaultVariants`. Note the base string already carries the whole state vocabulary the planner
must reproduce for the other four families (D-23):

```tsx
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  { variants: { /* ... */ }, defaultVariants: { variant: "default", size: "default" } }
)
```

State conventions to copy verbatim:

| D-23 state | Existing mechanism (`button.tsx`) |
|---|---|
| default | `defaultVariants` (line 36–39) |
| hover | `hover:bg-primary/80` (line 11) |
| **focus-visible** | `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` (line 7) |
| active | `active:not-aria-[haspopup]:translate-y-px` (line 7) |
| disabled | `disabled:pointer-events-none disabled:opacity-50` (line 7) |
| error | `aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20` (line 7) |
| **loading** | ⛔ **no precedent** — button has no loading variant. Planner must invent it; recommend a `data-loading` attribute + `[&_svg]` spinner, matching the file's existing `data-*`/`[&_svg]` idiom rather than a boolean prop that leaks into markup. |
| group/compound context | `in-data-[slot=button-group]:rounded-lg` (lines 25–32) — the `in-data-[slot=…]` idiom is how children react to a parent slot; reuse for cards/fields. |
| icon slots | `has-data-[icon=inline-end]:pr-2` (line 24) |

**Component function + `data-slot` + export** (`button.tsx:43-58`):

```tsx
function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

Rules the planner must hold for all five families:
- `function` declaration, **not** `const` + arrow, **not** `default export`.
- Props type = `<Primitive>.Props & VariantProps<typeof xVariants>` — never a hand-written
  `React.ComponentProps` and **never `any`** (CLAUDE.md).
- Every rendered root carries `data-slot="<kebab-name>"`. Multi-part families (card, accordion,
  field) get one `data-slot` per part: `card`, `card-header`, `card-title`, `accordion-item`,
  `accordion-trigger`, `accordion-panel`, `field`, `field-label`, `field-error`.
- Named export block at the bottom: `export { X, xVariants }`.
- `className` is threaded **into** `cva(...)` as the last key, so `twMerge` resolves conflicts.

**shadcn CLI config** (`components.json`) — if primitives are added via CLI they land correctly:

```json
{ "style": "base-nova", "rsc": true, "tsx": true,
  "tailwind": { "css": "src/app/globals.css", "baseColor": "neutral", "cssVariables": true },
  "iconLibrary": "lucide",
  "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui", "lib": "@/lib", "hooks": "@/hooks" } }
```

- `style: "base-nova"` is the Base UI style — confirms the non-Radix choice is deliberate.
- `iconLibrary: "lucide"`, and `lucide-react@^1.34.0` is already a dependency — the pictogram set
  (D-21, inline SVG) should *complement* lucide, not duplicate icons lucide already ships.
- `aliases.hooks` = `@/hooks` but **`src/hooks/` does not exist yet**.

---

### 2. `src/app/globals.css` — Tailwind v4 token structure (133 lines)

**Exact current structure, with what Lot 1 replaces vs. adds:**

| Lines | Content | Lot 1 action |
|---|---|---|
| 1–3 | `@import "tailwindcss"; @import "tw-animate-css"; @import "shadcn/tailwind.css";` | **keep** — `tw-animate-css` is the motion dependency already installed; build the D-17 easing token and D-23 reveals on it |
| 5 | `@custom-variant dark (&:is(.dark *));` | **keep** |
| **7–9** | the placeholder comment reserving the palette for Lot 1 | **delete** — this is the marker the phase closes |
| 10–52 | `@theme inline { … }` — 43 lines mapping `--color-*` → `var(--*)`, `--font-*`, `--radius-*` ladder | **additive + extend**: keep every existing mapping (button.tsx depends on `--color-primary`, `--color-destructive`, `--color-ring`, `--color-border`, `--color-muted`, `--color-secondary`, `--color-input`, `--radius-md`). **Add** the new token families here: `--color-success-*` (D-16 vert), `--ease-*` (D-17), `--shadow-*` four paired tiers (D-18), type scale |
| 54–87 | `:root { … }` — 33 neutral `oklch(… 0 0)` values (chroma 0 = pure grey) | **replace values in place** — this is where bleu/blanc/vert lands and where D-16 "ink is never pure black" is satisfied by giving `--foreground` non-zero chroma tinted toward the accent |
| 89–121 | `.dark { … }` | **decide, don't inherit.** No dark-mode toggle exists anywhere in the app and none is in signed scope. Keeping `.dark` costs 33 lines of values the founder never picks; deleting it is a divergence from shadcn defaults. Planner must make this an explicit call. |
| 123–133 | `@layer base { * { @apply border-border outline-ring/50 } body {…} html { @apply font-sans } }` | **keep**; the atmosphere layer (D-21 gradients, blobs, grain) is **additive** below it |

Concrete excerpt of the block to replace (`globals.css:5-14`):

```css
@custom-variant dark (&:is(.dark *));

/* These CSS custom properties are untouched shadcn/ui library defaults —
   a placeholder. The real palette, typography and spacing scale are defined
   by the Lot 1 design system after client validation. */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-sans);
```

⚠ **Latent bug the planner should fix while it is cheap.** `globals.css:13` declares
`--font-sans: var(--font-sans)` — self-referential and **never defined** in `:root`. Meanwhile
`layout.tsx:10` exposes the font as `--font-geist-sans`. So `html { @apply font-sans }`
(`globals.css:131`) resolves to nothing today and the app silently renders in the browser default,
not Geist. `--font-mono: var(--font-geist-mono)` (line 14) *is* correctly wired. `--font-heading`
(line 15) exists and is unused — free hook for the D-25 display headings. Wave 2 must define
`--font-sans` (and `--font-heading`) against the real `next/font` variable names.

⚠ **`--radius-sm` … `--radius-4xl` (lines 45–51) are derived** from a single `--radius: 0.625rem`
(line 78). The spacing/radius scale is therefore already one-knob; keep that shape.

⚠ **D-16's spacing scale has no home yet** — no `--spacing*` token exists. Tailwind v4's default
`--spacing: 0.25rem` is implicit. If the design system changes the base step, it is a one-line
addition in `@theme`.

**Reversibility claim in CONTEXT.md verified:** palette + radius scale genuinely live in this one
file. No `tailwind.config.*` exists (`components.json` → `"tailwind": { "config": "" }`), and
`postcss.config.mjs` has a single plugin `@tailwindcss/postcss`. So "a rejected direction is one
commit" is true.

---

### 3. Copy layer — `src/locales/fr/common.json` + `src/lib/i18n/fr.ts`

**The whole content layer today is 9 lines** (`src/locales/fr/common.json`):

```json
{
  "metadata": {
    "title": "Formation SAP Ariba",
    "description": "Plateforme de réservation de formations SAP Ariba en direct."
  },
  "home": {
    "placeholder": "Le contenu de cette page sera défini au Lot 2."
  }
}
```

**Access pattern — direct default import of the JSON, no i18n library** (D-28 confirmed by code):

- `src/app/page.tsx:1` — `import common from "@/locales/fr/common.json";`
- `src/app/layout.tsx:4` — same import, used for `metadata` (see §4).
- Consumption is plain property access: `{common.home.placeholder}` (`page.tsx:6`).
- Enabled by `tsconfig.json:13` `"resolveJsonModule": true` and `tsconfig.json:21-23` `"@/*": ["./src/*"]`.

**Typing:** the JSON is **not** explicitly typed — there is no `.d.ts`, no Zod schema, no
`as const satisfies …`. TypeScript infers the literal shape from the file itself, so
`common.home.placeholder` is `string` and a missing key is a **compile error** caught by
`npm run typecheck`. That is the free half of the mock guard: an unresolvable key already fails CI.
What it cannot catch is a key whose *value* is still mocked — which is exactly what D-08 must add.

**How a second namespaced bundle wires in** (D-28 discretion — one bundle vs. several): nothing to
configure. Add `src/locales/fr/<namespace>.json`, then
`import agenda from "@/locales/fr/agenda.json";`. No barrel file, no registry, no index — and
**do not create one**, because a barrel re-export would erase the per-file literal inference that
gives the copy layer its type safety. Recommended namespacing that matches the eleven screens:
`common.json` (nav, footer, actions), one file per screen or per Lot-2 section, plus
`emails.json` for D-27.

**Formatters — `src/lib/i18n/fr.ts` (43 lines, read in full):**

```ts
export const LOCALE = "fr-FR" as const;      // line 8
export const TIME_ZONE = "Europe/Paris" as const;  // line 9

export const dateFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE, dateStyle: "long",
});                                          // lines 11-17
export const dateTimeFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE, dateStyle: "long", timeStyle: "short",
});                                          // lines 19-26
export const numberFormatter: Intl.NumberFormat = new Intl.NumberFormat(LOCALE); // lines 28-30

export function formatDate(date: Date): string { … }      // 32-34
export function formatDateTime(date: Date): string { … }  // 36-38
export function formatNumber(value: number): string { … } // 40-42
```

- Every export carries an **explicit return/value type annotation** — copy that.
- Module-scope singleton `Intl.*` instances, then thin `formatX` wrappers. New formatters follow
  the same two-step shape.
- ⚠ **`numberFormatter` (line 28) has no currency style.** D-30 says prices format through it, but
  `formatNumber(1500)` yields `"1 500"` — **no « € »**. The euro symbol is not produced by any
  existing code. Planner must either add a `currencyFormatter`
  (`style: "currency", currency: "EUR"`) to `fr.ts` or append the symbol from the locale bundle.
  Do not let a maquette hand-write `"1 500 €"` in JSX — that violates D-29 and D-30 at once.
- ⚠ **No time-only formatter exists.** The agenda maquette (`/agenda`, `/reservation`) needs slot
  times; add a `timeFormatter` here, not inline.

---

### 4. Routes — `src/app/page.tsx` and `src/app/layout.tsx`

**`src/app/page.tsx` (9 lines) — the exact template for the ten new routes:**

```tsx
import common from "@/locales/fr/common.json";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-16">
      <p>{common.home.placeholder}</p>
    </div>
  );
}
```

- **Server component. No `"use client"`.** Every new route stays a server component; only
  interactive leaves (accordion, form field) get the directive.
- `export default function <PascalName>()` — synchronous, **not** `async` (no data fetching, D-41).
- **No `metadata` export on the page.** Only `layout.tsx` exports it. Per-route metadata is
  `GOL-01`/Lot 5 (D-41 excludes SEO metadata) — so a `<title>` per route is a deliberate planner
  call, not a copy-the-analog default. Recommend: no page-level `metadata` in Lot 1.
- Layout owns the flex chrome: `body` is `min-h-full flex flex-col` (`layout.tsx:30`) and the page
  uses `flex-1`. New routes must keep that contract or they will not fill the viewport.
- **No shared header/footer/nav component exists.** `PUB-12` (nav in two clicks, complete footer)
  is Lot 2 — but eleven full-fidelity maquettes (D-05) without a shared nav will look unfinished.
  Planner must decide explicitly whether Lot 1 ships a presentational `Header`/`Footer` (no
  routing logic) under `src/components/layout/`. There is no analog either way.

**`src/app/layout.tsx` (33 lines):**

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import common from "@/locales/fr/common.json";

// Geist is the untouched create-next-app library default, kept as a
// placeholder: the real typography is defined by the Lot 1 design system
// after client validation.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: common.metadata.title,
  description: common.metadata.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

Answers to the specific questions asked:
- **`next/font` is already used** — but it is `next/font/google` (`layout.tsx:2`), i.e. Google-hosted
  fonts fetched at build and self-hosted by Next. D-19 ("`next/font` self-hosts the chosen
  typefaces") is satisfied by `next/font/google` for a Google-catalogue face; a non-Google face
  requires `next/font/local` plus committed font files under `src/app/fonts/` or `public/` — **no
  such directory or font file exists** (`public/` is empty). The exploration round (D-03) settles
  typography, so this fork must be resolved before Wave 2 writes the token file.
- **Pattern to copy:** one `const x = Font({ variable: "--font-…", subsets: ["latin"] })` per face,
  variables composed onto `<html className>`, consumed via `@theme` in `globals.css`.
  ⚠ The consumption half is currently broken — see §2's `--font-sans` note.
- `lang="fr"` is hardcoded on `<html>` (`layout.tsx:27`). No locale routing, no `[lang]` segment.
- **`LayoutProps<"/">`** (`layout.tsx:24`) — a Next 16 **typed-routes global**, generated by
  `next typegen` (which `npm run typecheck` runs first, `package.json:13`). The page equivalent is
  `PageProps<"/programme">`. Routes taking no params can omit props entirely, as `page.tsx` does.
  **Do not hand-write a props interface.**
- Geist import + the placeholder comment at `layout.tsx:6-8` is the **third** artifact this phase
  replaces — CONTEXT.md names only two (`globals.css:5-8` and `home.placeholder`). Flag it.

---

### 5. The mock-content guard script + `package.json`

**Analog: `scripts/gen-db-types.mjs` (49 lines).** This is an exact structural match: a node CLI,
invoked from `package.json`, that inspects something and **exits non-zero on failure**.

Conventions to copy:

```js
// Wrapper around `supabase gen types`: the CLI has no header/banner flag, and a
// shell redirect would truncate the committed file if generation fails.
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
```

- **`.mjs`, ESM, `node:`-prefixed builtins.**
- Leading comment states **why the script exists**, not what it does (CLAUDE.md).
- Path resolution from the module, never from `cwd`
  (`gen-db-types.mjs:14-17`): `join(dirname(dirname(fileURLToPath(import.meta.url))), "src/…")`.
- **Failure discipline** — `console.error("<script-name>: <message>")` then `process.exit(1)`, at
  three separate gates (lines 26–42). Success logs `console.log("db:types: wrote …")`. The guard's
  D-08 output should follow: prefix every line with the script name, list key + blocking
  requirement, `process.exit(1)` while any mock remains, exit 0 and a one-line confirmation when
  clean.
- Windows-awareness is a live concern in this repo: `shell: true` for `npx` (line 20, with the
  comment explaining why) and `EOL` normalisation on write (lines 44–47). A read-only guard avoids
  both, but if it ever writes a report, normalise line endings the same way.

**Location:** `scripts/` at the repo root **exists** and holds exactly one file. Put the guard there
— `scripts/check-mock-content.mjs`. Do not invent `tools/`, `bin/`, or `src/scripts/`.

**Typing note:** `tsconfig.json:25-32` includes `**/*.ts`, `**/*.tsx`, `**/*.mts` — **not `.mjs`**.
So a `.mjs` guard is *not* type-checked, matching `gen-db-types.mjs`. Writing it as `.ts`/`.mts`
would pull it into `tsc --noEmit` and require a runner. `.mjs` is the conforming choice.
It **will** be linted: `npm run lint` = bare `eslint` (`package.json:12`), and `eslint.config.mjs`
ignores only `.next/**`, `out/**`, `build/**`, `next-env.d.ts` — so keep it lint-clean.

**`package.json` scripts today (lines 8-15):**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "typecheck": "next typegen && tsc --noEmit",
  "db:types": "node scripts/gen-db-types.mjs"
}
```

New entry follows `db:types` exactly: `"content:check": "node scripts/check-mock-content.mjs"`.
Engine pin: `"engines": { "node": "22.x" }` (lines 5–7), matched by `.nvmrc` = `22`.
⛔ Adding a `postbuild`, `prebuild`, `prelint` or `pretypecheck` hook would make the guard
CI-reachable — **forbidden by D-09.**

**D-09 evidence — the guard is provably unreachable from CI.**
`.github/workflows/ci.yml` is the **only** file under `.github/` (verified: `find .github -type f`
returns one path). Its single job `quality` runs exactly five steps, of which three invoke npm
scripts:

| ci.yml line | Step | Command |
|---|---|---|
| 55–56 | Lint | `npm run lint` → `eslint` |
| 58–59 | Type-check | `npm run typecheck` → `next typegen && tsc --noEmit` |
| 61–62 | Build | `npm run build` → `next build` |

Triggers: `pull_request` → `main`, `push` → `main` and `gsd/**`, `workflow_dispatch`
(ci.yml:9–14). Nothing else runs anything.
Second reachable surface: **Vercel**. `vercel.json` sets `"installCommand": "npm ci"` and
`"buildCommand": "npm run build"` — again only `build`. There is no `postinstall` script.

**Conclusion for the planner:** a new script named anything other than `lint`, `typecheck`,
`build`, or a `pre*`/`post*` hook on those three is unreachable from CI and from the Vercel deploy.
`content:check` satisfies D-08 and D-09 simultaneously. The verification step for this phase must
be a **manual/manager-session** invocation (consistent with D-39: commit, then verify outside the run).

**Marker technique (D-07) — no analog, planner's call.** The requirement is a marker *in the data,
invisible in the JSX*. The existing untyped-JSON + literal-inference pattern (§3) constrains the
options: a wrapper object (`{ "value": "…", "mock": "CADR-03" }`) would change every call site from
`common.x` to `common.x.value` and force a rendering-layer helper — which is close to marking in
the rendering, and costs a refactor at gate-close. A **structurally separable** shape better matches
D-09's "deletion from one place": e.g. a sibling `src/locales/fr/_mocks.json` (or a top-level
`"_mock"` key per namespace) listing the mocked key paths and the requirement each blocks, which the
guard reads and cross-checks against the real bundles. Rendering is untouched; removal is one file.

---

### 6. Pictograms — ⛔ no analog

- `public/` is **empty** (verified). No `.svg` anywhere in the repo.
- No `src/components/icons/` directory.
- `lucide-react@^1.34.0` is installed and `components.json` sets `"iconLibrary": "lucide"`, but
  **no component imports it yet** — so there is no precedent for icon sizing/color either. The
  `button.tsx` base string does define the contract icons must satisfy:
  `[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`
  (`button.tsx:7`) — i.e. an icon is an inline `<svg>` child that inherits `currentColor` and
  accepts a `size-*` override. Build the pictogram set to that contract.
- Sprite-vs-inline-component is genuinely open (D-21 discretion). Recommendation grounded in the
  repo: inline React components under `src/components/icons/`, exported named, `currentColor`
  fills, no `width`/`height` attributes — because a `public/sprite.svg` referenced by `<use>` is a
  second network request the `GOL-02` Lighthouse budget does not need, and `public/` has no
  established convention to follow.

---

### 7. Not present — the planner must not assume these exist

| Assumed thing | Reality |
|---|---|
| Radix UI / `Slot` / `asChild` | ⛔ Not a dependency. Base UI only. |
| `tailwind.config.ts` | ⛔ Does not exist. Tailwind v4, CSS-first (`components.json` → `"config": ""`). |
| Prettier config | ⛔ None. Two formatting styles coexist (see §1). |
| `src/hooks/` | ⛔ Does not exist, though `components.json` aliases `@/hooks`. |
| `src/components/layout/`, header, footer, nav | ⛔ None. |
| Any second component | ⛔ `button.tsx` is the only one. |
| `--font-sans` definition | ⛔ Referenced in `@theme`, never defined. Latent bug. |
| Currency / euro formatting | ⛔ `numberFormatter` is plain decimal. No « € » anywhere in code. |
| Time-only formatter | ⛔ Only `date` (long) and `dateTime` (long + short). |
| Any test file, test runner, test script | ⛔ None. CLAUDE.md: do not write tests unless asked. |
| Loading state on any component | ⛔ No precedent. |
| Empty-state / error-state component | ⛔ No precedent — all four D-23 surface states are net new. |
| Second locale, i18n library, locale switcher | ⛔ None, and D-28 forbids adding one. |
| Font files, `next/font/local` usage | ⛔ None. Only `next/font/google` (Geist). |
| Additional CI workflow | ⛔ `ci.yml` is the only one. |
| `postinstall` / `pre*` / `post*` npm hooks | ⛄ None — keep it that way (D-09). |

---

## Shared Patterns

### Import style
**Source:** `src/app/page.tsx:1`, `src/components/ui/button.tsx:4`, `src/app/layout.tsx:4`
**Apply to:** every new file under `src/`
`@/*` → `./src/*` (`tsconfig.json:21-23`). Always alias-import inside `src/`. Relative imports are
used **only** in `next.config.ts:2,8`, and there is a comment explaining why
(`next.config.ts:5-7`: config loads outside the app module graph, so the alias does not apply).

### `cn` class merging
**Source:** `src/lib/utils.ts:1-6`
**Apply to:** every component
```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```
Never string-concatenate classNames in a component. (`layout.tsx:28` does use a template literal —
that is font-variable composition on `<html>`, not variant merging.)

### Copy indirection (D-29)
**Source:** `src/app/page.tsx:1,6`
**Apply to:** all eleven routes, all five component families' default labels, all email copy
Import the namespace, read the key. Zero literal French strings in JSX. The typecheck gate turns a
missing key into a build failure for free.

### Explicit types, never `any` (CLAUDE.md)
**Source:** `src/lib/i18n/fr.ts:11,19,28,32,36,40` — every export annotated
**Apply to:** all new `.ts`/`.tsx`
Component props derive from the primitive's `.Props` + `VariantProps` (`button.tsx:48`), never a
hand-rolled interface, never `any`.

### Comment discipline (CLAUDE.md: "why", not "what")
**Source:** `next.config.ts:4-8,23-26`, `scripts/gen-db-types.mjs:1-2,19,44-45`,
`src/lib/i18n/fr.ts:1-6`, `globals.css:7-9`, `layout.tsx:6-8`
**Apply to:** every non-obvious decision, and **especially** to the mock-content guard, whose whole
justification (why it is not in CI) must be written down at the top of the script or it will be
"helpfully" added to CI by a later run.

### Placeholder comments are the phase's own to-do list
**Source:** `globals.css:7-9`, `layout.tsx:6-8`, `common.json` → `home.placeholder`,
`next.config.ts:23-26` (Lot 5's, **leave it**)
Phase 0 deliberately left dated placeholders. Lot 1 closes the first three and must delete the
comments with the code. Leaving a stale "defined by the Lot 1 design system" comment behind is a
verification failure.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| pictogram set | component | n/a | `public/` empty, no SVG in repo, lucide installed but unused |
| accordion (stateful Base UI part) | component | event-driven | no client component and no stateful primitive exists yet |
| loading / empty / error-surface states | component | n/a | `button.tsx` covers hover/focus-visible/active/disabled/aria-invalid only |
| shared header / footer / nav | component | n/a | no layout components exist; Lot 2 owns nav logic |
| mock-marker data shape | content | n/a | no marker convention; JSON is plain and untyped |
| exploration HTML directions (D-03) | throwaway | n/a | nothing outside `src/` resembles it; keep out of `src/`, out of `public/`, and out of the tsconfig `include` globs |
| currency / time formatting | utility | transform | `fr.ts` has neither |
| framing record (CADR-01 output) | doc | n/a | `docs/` holds one unrelated file (`hebergement.md`); it is the conforming home for a French framing record |

## Metadata

**Analog search scope:** whole repo — `src/**` (15 files, all read or classified), `scripts/`,
`.github/**`, root config files, `public/`, `docs/`.
**Files scanned:** 15 under `src/`; 12 root/config/tooling files read in full.
**Files read in full:** `button.tsx`, `globals.css`, `fr.ts`, `common.json`, `page.tsx`,
`layout.tsx`, `package.json`, `tsconfig.json`, `components.json`, `ci.yml`, `gen-db-types.mjs`,
`next.config.ts`, `eslint.config.mjs`, `vercel.json`, `utils.ts`, `postcss.config.mjs`, `.nvmrc`.
**Not read (out of bounds, D-11 / D-12):** `supabase/**`, `src/types/database.types.ts`,
`src/lib/env/**`, `src/lib/supabase/**`, `reference/**`.
**Project skills:** none — neither `.claude/skills/` nor `.agents/skills/` exists.
**Pattern extraction date:** 2026-08-28
