---
task: 260907-opw
type: quick
branch: cto/landing-v3
---

# Auth v2 "panneau + formulaire" — Summary

## Setup discrepancy found before execution

The worktree's `worktree_branch_check` merge-base returned `27ab022...` (main/gsd
lineage), not the plan's required base `86cbfe07e4fb61e56c6c926638ae75e00d5d0ba4`
(tip of `cto/landing-v3`) — the worktree had been created from the wrong base and
was missing every prior landing-v3 file (`auth-shell.tsx`, `connexion-form.tsx`,
etc. did not exist). Corrected with `git reset --hard 86cbfe07...` before starting
any task, per the mandatory setup step. Re-verified the worktree tree matched the
`cto/landing-v3` tip after the reset, then proceeded.

The worktree also had no `node_modules` (fresh checkout) and no `.env.local`
(gitignored, per-worktree). Ran `npm ci` from the existing `package-lock.json`
(no new package names, no install of anything not already pinned) and copied
`.env.local` from the main checkout (gitignored, not committed) so `next build`
could resolve Supabase env vars. Neither change is tracked by git.

## Commits

1. `627d90b` — `#feat: add the Google mark icon and the form separator string`
   New `src/components/icons/google-mark.tsx` (4-path Google "G", brand hex
   exception). `common.json` gains `formulaires.ou`. `inscription.json` gains
   `google`.
2. `5342bb0` — `#feat: recompose AuthShell as a night panel beside the form column`
   `auth-shell.tsx` rewritten: optional `entete`/`illustration`, title accent
   split on first `". "`, two-column `lg:grid` layout, sticky night panel
   (`data-slot="auth-panel"`/`"auth-panel-inner"`). New illustrations
   `espace-fenetre.tsx` (`EspaceFenetre`) and `parcours-etapes.tsx`
   (`ParcoursEtapes`). `globals.css` gains one compact-viewport media rule
   inside the existing `@layer components`.
3. `8fbf420` — `#feat: move the four auth pages onto the new shell`
   All four auth pages (`connexion`, `inscription`, `mot-de-passe-oublie`,
   `nouveau-mot-de-passe`) dropped `Card`/`CardContent`/`CardFooter`, pass the
   per-page `entete`/`illustration` per brief §C-02/03/04, cross-links moved to
   a centred `<p>` inside the form column. No session-helper imports added.
4. `0aa4e60` — `#feat: lead both auth forms with Google and raise fields to 44px`
   `connexion-form.tsx`: Google button + word separator moved to top, `LogIn`
   import removed, both `FieldControl`s + submit button at `h-11`,
   forgot-password link at `font-semibold py-3`. `inscription-form.tsx`: Google
   button + separator added at top of the non-success form branch, all six
   `FieldControl`s at `h-11`, success-state `Card` untouched.

## FieldControl count discrepancy (brief vs. code)

Brief §C-05 claims **seven** `FieldControl` elements in `inscription-form.tsx`.
Re-counted the live file before editing: **six** (`prenom`, `nom`, `email`,
`motDePasse`, `confirmation`, `profil`'s select render) — confirmed by
`grep -c "<FieldControl"` = 6. Applied `h-11` to all six actually present.
No seventh field exists in the file; the brief's count is wrong, not the code.

## Final verification (run once, after all four commits)

| Check | Result |
|---|---|
| `npm run lint` | **PASS** — zero problems reported |
| `npm run typecheck` | **PASS** — `next typegen` + `tsc --noEmit` clean |
| `npm run build` | **PASS** — exited 0, see route table and `/` size below |
| `npm run content:check` | **exit 1 (expected)** — 84 pre-existing placeholders (73 CADR-03 + 11 CADR-01), none in files touched this run, none new |
| `git status --short` | **clean** |
| `git rev-parse --abbrev-ref HEAD` | `worktree-agent-afe76b329cac5152e` — expected per worktree isolation; this branch merges into `cto/landing-v3`, no extra branch was created |

### Build route table (relevant rows)

```
Route (app)                          Revalidate  Expire
┌ ○ /                                        1h      1y
├ ○ /connexion
├ ○ /inscription
├ ○ /mot-de-passe-oublie
├ ○ /nouveau-mot-de-passe
```

All four auth routes are static (`○`), none dynamic (`ƒ`).

### `/` prerendered size

`.next/server/app/index.html` = **319,107 bytes (~312 KB)** — well above the
~44 KB empty-database failure threshold. Content queries are populated;
**not** a failure.

### Auth page prerendered sizes (for reference)

- `connexion.html` — 53,009 bytes
- `inscription.html` — 56,617 bytes
- `mot-de-passe-oublie.html` — 37,702 bytes
- `nouveau-mot-de-passe.html` — 38,850 bytes

### `content:check` placeholder list (baseline, unchanged by this run)

`emails.json` (26 signature/objet/corps keys, CADR-03), `paiement.json`
(4 `formules`, CADR-01), `agenda.json` (2 `prix`, CADR-01), `landing.json`
(hero/ctaFinal/pourQui/competences/faq/confiance/programme, mixed CADR-01/03),
`programme.json` (5 modules × titre/duree/objectifs/contenu, CADR-03),
`a-propos.json` (5 keys, CADR-03). Totals: CADR-03: 73, CADR-01: 11. Zero new
placeholders introduced by this run's files.

## Deviations from plan

None beyond the setup-time worktree base correction and the FieldControl
count report above, both already covered. No Rule 1-4 fixes were needed in
the four tasks themselves — the plan's interfaces section matched the live
files exactly (title split point, token names, `Reveal` signature, section.tsx
night-tone precedent, format-deroule.tsx dot-colour precedent, `landing.json`
nested path, `common.json` keys).

## Threat Flags

None — no new network endpoints, auth paths, or trust-boundary changes beyond
what the plan's own threat register already covers (`/api/auth/google` link
reused unchanged, illustrations are pure decorative aria-hidden markup).

## Self-Check

- `src/components/icons/google-mark.tsx` — FOUND
- `src/components/illustrations/espace-fenetre.tsx` — FOUND
- `src/components/illustrations/parcours-etapes.tsx` — FOUND
- Commit `627d90b` — FOUND
- Commit `5342bb0` — FOUND
- Commit `8fbf420` — FOUND
- Commit `0aa4e60` — FOUND

## Self-Check: PASSED
