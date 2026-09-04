---
quick_id: 260904-mpc
status: incomplete
---

# Summary — correctif borné calendrier / plancher 16px / densité admin

## What shipped

Three commits, one per defect, plus a decisions commit:

1. `#fix: calendrier mensuel en cellules fluides, plus de debordement a 375 et 320`
   — `src/components/agenda/calendrier-mois.tsx`: `CardContent` grid gap/padding
   split below `sm:`, both day-cell branches (`min-w-11` → `w-full`, `h-11`
   kept). Nav buttons untouched (out of the 7-column grid, don't fix component
   width).
2. `#fix: plancher de 16px sur les champs admin en densite compacte`
   — `src/components/ui/input.tsx` line 7: `in-data-[density=compact]:text-[0.8rem]`
   → `in-data-[density=compact]:text-base`; `src/components/admin/reservation-creation.tsx`:
   dropped the now-redundant local `className="text-base"` on the type selector.
   `exceptions-editeur.tsx` (date + select) and `export-panel.tsx` (two dates)
   verified to already route through `FieldControl`/`inputVariants` — no edit
   needed, per the brief's own instruction to check before touching.
3. `#fix: densite compacte admin remonte les hauteurs de controle a 44px`
   — `src/components/ui/button.tsx` and `src/components/ui/input.tsx` line 7:
   `in-data-[density=compact]:h-7` → `in-data-[density=compact]:h-11`. Scoped:
   `data-density="compact"` is set once, at `src/app/admin/layout.tsx:17`;
   `src/app/espace/page.tsx` sets `data-density="default"`. `admin-nav.tsx`
   entries are already `Button`s — no separate change needed there per the
   brief's own conditional (§D.4).
4. `#docs: consigne les decisions D-30 a D-33 du correctif borne` —
   `.planning/phases/04-agenda-et-prise-de-rendez-vous/04-CONTEXT.md`.

No file outside the brief's section A scope was touched.

## Real command output

**`npm run lint`** — clean, no output beyond the script header.

**`npm run typecheck`** — clean:
```
> next typegen && tsc --noEmit
Generating route types...
✓ Types generated successfully
```

**`npm run build`** — **fails**, unrelated to this change:
```
Creating an optimized production build ...
✓ Compiled successfully
Running TypeScript ...
Finished TypeScript in ...
Collecting page data using 27 workers ...
Generating static pages using 27 workers (0/41) ...
Failed to build /a-propos/page, /agenda/page, /formation/page, /page:
  "took more than 60 seconds" (retried 3x)
Export encountered an error on /agenda/page: /agenda, exiting the build.
```
Root cause confirmed independent of the diff: `curl http://127.0.0.1:54321/rest/v1/`
returns nothing (`000`) — the local Supabase stack is down. `docker version`
returns `500 Internal Server Error` from the Docker Desktop backend API, and
`com.docker.service` (Windows service) is `Stopped`; starting it requires
privileges this session does not have. The four pages that time out
(`/`, `/a-propos`, `/agenda`, `/formation`) are exactly the ones that call
Supabase-backed data functions during static generation (`getTypesRendezVous()`
on `/agenda`, confirmed by reading the page source) — every other route built
fine before the worker died. This is a pre-existing environment outage, not a
regression from the CSS-class edits in this run: the same build was already
guaranteed to fail before this run touched anything, because the sole runtime
input is the local Docker/Supabase state.

## Section E — measurement protocol: partially blocked

**Blocker:** the brief's protocol requires `npm run build` + `next start` on
port 3016, seeded via `agenda:seed`/`content:seed`, and login as the
administrator. All three depend on the local Supabase stack, which is down for
the reason above (Docker Desktop backend unresponsive, no privilege to restart
its service in this session). This could not be resolved without either
elevated OS privileges or the user restarting Docker Desktop by hand — outside
this run's authority to fix silently.

**What was measured instead, honestly, not a grep:** `next dev` on port 3016
(the one route that needs no Supabase call — `/connexion`, confirmed
static/no-fetch by reading `src/app/connexion/page.tsx` and
`src/app/layout.tsx`), Playwright **Chrome channel**, `location.pathname`
asserted in the probe before every read, at 1440/375/320:

- `document.documentElement.scrollWidth === window.innerWidth` at all three
  widths — no overflow (expected: `/connexion` is untouched by this run).
- The two `<input>` fields (email, password) render at **`font-size: 14px`**
  at all three widths, `data-density` absent on this route (no compact
  ancestor) — this is exactly the **D-33 constat**: the `text-sm` base of
  `input.tsx` is 14 px, under the 16 px floor, on every surface outside
  `/admin`. Left as-is per the brief; consigned here as required.
- Button/input heights on `/connexion` are **32px** (the app's Lot-3 default,
  `h-8`), unaffected by this run's `in-data-[density=compact]:*` edits because
  no `data-density` ancestor is present on this route — confirms the D-31
  scoping claim (compact-density edits cannot reach `/connexion`) empirically,
  though only for this one route.

**Not measured — requires a working Supabase stack, could not be done in this
environment:**
- `/agenda` and `/admin/reservations` `scrollWidth` at 375/320 and calendar
  cell width/height (Défaut 1 truth).
- Computed `font-size` of the four flagged admin fields (Défaut 2 truth).
- Control heights on `/admin`, `/admin/horaires`, `/admin/jours-feries`,
  `/admin/reservations` (Défaut 3 truth).
- `/espace` before/after control-height comparison.

**Consequence:** the three code fixes are traceable to the exact mechanism the
brief diagnosed (tailwind-merge not treating a variant-prefixed utility and a
bare one as conflicting; `min-w-11` fighting a 7-column grid), and lint/typecheck
are real green, but **the DOM truth this brief requires as the sole acceptable
proof is not fully established**. Re-run Section E once the local Supabase
stack is reachable (`docker version` returns without error, then
`npx supabase start`, `npm run agenda:seed && npm run content:seed`) before
treating this as gate-ready.

## Git state

Branch: `gsd/phase-04-agenda-et-prise-de-rendez-vous` (unchanged, not pushed).
Base: `c367685` (unchanged).
4 new commits, all local, no `git checkout`/`switch`/`rebase` run.
