---
phase: 04-agenda-et-prise-de-rendez-vous
plan: 03
subsystem: frontend
tags: [nextjs, supabase, client-island, rate-limit, agenda, retention, d-27, d-29]

# Dependency graph
requires:
  - phase: 04-agenda-et-prise-de-rendez-vous (plan 01)
    provides: "app.type_rendez_vous, app.creneaux_libres, app.maintenir_creneau, app.liberer_creneau RPCs"
  - phase: 04-agenda-et-prise-de-rendez-vous (plan 02)
    provides: "idempotent agenda seed (typical week, holidays), D-13 horizon fix on app.creneaux_libres"
provides:
  - "two new Intl formatters in src/lib/i18n/fr.ts: formatHeureProse, formatDateAvecJour"
  - "src/lib/agenda/creneaux.ts — client-safe slot grouping/grid maths and the CLE_CRENEAU_CHOISI sessionStorage handoff"
  - "the anonymous D-27 retention route, POST/DELETE /api/creneaux/maintien"
  - "the public /agenda surface: static shell + client availability island"
  - "the D-24 three-entry public legend (Libre / Indisponible / Passé)"
affects: [04-04, 04-05, 04-06, 04-07, 04-08, 04-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "IP-ceiling-before-body-read rate limiting: a client-supplied value narrows a budget, never replaces it"
    - "sessionStorage single-owner constant (CLE_CRENEAU_CHOISI) for a cross-page D-28 handoff"
    - "unmount-vs-navigate-to-/reservation ref guard so a release-on-abandon effect does not delete the token it just wrote"
    - "amortised Map sweep (every 500th call) bounding an in-process rate limiter with no dependency"

key-files:
  created:
    - src/lib/agenda/creneaux.ts
    - src/lib/agenda/types-rendez-vous.ts
    - src/lib/validation/maintien.ts
    - src/app/api/creneaux/maintien/route.ts
    - src/components/agenda/agenda-booker.tsx
    - src/components/agenda/calendrier-mois.tsx
    - src/components/agenda/liste-creneaux.tsx
    - src/components/agenda/booker-skeleton.tsx
  modified:
    - src/lib/i18n/fr.ts
    - src/lib/rate-limit.ts
    - src/locales/fr/agenda.json
    - src/app/agenda/page.tsx

key-decisions:
  - "Route returns machine-readable agenda.erreurs.* keys, not resolved French text, mirroring src/app/api/contact/route.ts's field-error idiom — the client resolves the key against agenda.json itself"
  - "The D-24 legend is rendered by the static server component (page.tsx), not inside the client island, so it appears in the prerendered HTML rather than only after hydration"
  - "The interactive type chooser (tabs, used to refetch app.creneaux_libres) lives inside AgendaBooker; the existing price/duration overview cards stay server-rendered in page.tsx, both fed from the same app.type_rendez_vous read"
  - "D-29's opening day/month is set inside the async fetch callback (guarded by a ref), not in a second effect reacting to state — avoids eslint-plugin-react-hooks' set-state-in-effect cascading-render warning"
  - "Full 8-week horizon fetched once per type rather than month-scoped, since D-13 already bounds it; month navigation is client-side slicing of already-fetched data, no extra RPC round trip"

requirements-completed: [AGD-02]

# Metrics
duration: 85min
completed: 2026-09-02
---

# Phase 4 Plan 03: Public /agenda — static shell, availability island, D-27 retention Summary

**A visitor opens `/agenda`, sees the real monthly calendar and free-slot list computed from `app.creneaux_libres`, picks a slot with no sign-in and it is held for 15 minutes against an anonymous, IP-ceilinged retention route — the route table still prerenders `/agenda` as `○` static.**

## Performance

- **Duration:** ~85 min
- **Tasks:** 2 of 3 (Task 3 is the founder visual review gate — not run by the executor, see below)
- **Files modified:** 12 (4 modified, 8 created)

## Accomplishments

- `src/lib/i18n/fr.ts`: added `heureProseFormatter`/`formatHeureProse` (`14 h 30`) and `dateAvecJourFormatter`/`formatDateAvecJour` (`mardi 8 septembre`), the two missing formatters `04-CONTEXT.md` named. Verified against `2026-09-08T12:30:00Z`: outputs exactly `"14 h 30"` and `"mardi 8 septembre"`. The six pre-existing exports are untouched.
- `src/lib/agenda/creneaux.ts`: client-safe (no `import "server-only"`), `Intl`-only grouping/grid maths — `jourIsoParis` (en-CA `formatToParts` idiom), `grouperParJour`, `grouperMatinApresMidi`, `grilleDuMois`, `premierJourPorteur`, `joursPorteurs`, `estPasse` — plus the single-owner sessionStorage handoff: `CLE_CRENEAU_CHOISI = "ariba.creneau.choisi"`, a Zod schema and typed read/write/clear helpers. Verified `premierJourPorteur` returns the correct next-month day key and `null` on an empty list.
- `src/lib/rate-limit.ts`: widened `consume(key, { max?, windowMs? })` additively — the two existing callers (`contact`, `rgpd/suppression`) are byte-unchanged (`git diff` on both is empty) and keep 5-per-10-minutes. Added an amortised sweep (every 500th call) so the `hits` Map no longer grows unbounded now that an anonymous caller can influence the key space.
- `src/lib/validation/maintien.ts` + `src/app/api/creneaux/maintien/route.ts`: the D-27 anonymous retention route. **Verified end-to-end against the local stack:** a `POST` for a free instant returns 200 with a `jeton` and `expireLe` ~15 minutes out; a second `POST` for the same instant with a different token returns 409 with the `creneauIndisponible` key; `DELETE` with a malformed `jeton` returns 422 (never reaches the RPC); `DELETE` with the valid token returns 200 and `app.maintien_creneau` drops back to 0 rows.
- `src/app/agenda/page.tsx` + `src/components/agenda/*`: the static shell (header, intro, price/duration overview cards read from `app.type_rendez_vous`, the D-24 three-entry legend) plus the client island (`AgendaBooker`) that fetches `app.creneaux_libres` through the browser anon client, opens on the first day carrying slots (D-29), groups the selected day matin/après-midi behind a "voir plus" control, and retains a chosen slot with a bounded jeton-stale retry (never a loop) before navigating to `/reservation` with no sign-in gate (D-28).
- **Build verification:** `npm run lint && npm run typecheck && npm run build` all exit 0. Route table: `○ /agenda` (static, unchanged from 30 routes). Prerendered `.next/server/app/agenda.html` contains `Libre`, `Indisponible`, `Passé`, `90,00 €` (non-breaking space confirmed byte-for-byte), and neither `Réservé` nor `Bloqué`. Temporarily set `individuelle`'s `prix_centimes` to `12345` in the local DB, rebuilt with a cleared `.next` cache, confirmed `123,45 €` rendered, restored `9000` and rebuilt again — proves the chooser reads `app.type_rendez_vous`, not `agenda.json`.
- Structural/grep acceptance criteria all pass: no `any` in `src/components/agenda/` or `src/app/agenda/page.tsx`; no `destructive` variant in the agenda components (D-U3, muted-only grey-out); no institutional-blue token anywhere in the agenda surfaces; no `cookies()`/`headers()`/`searchParams` at `page.tsx`'s top level; `src/lib/agenda/creneaux.ts` carries no `server-only` and no `any`; the literal `ariba.creneau.choisi` appears exactly once, in `creneaux.ts`; `agenda.json.typesRendezVous` is byte-identical to its pre-plan value; `git diff --stat` on `globals.css`/`components/ui/`/`components/layout/`/`package.json`/`package-lock.json` is empty.

## Task Commits

1. **Task 1: Two formatters, the client-safe slot helpers, and the D-24 legend** — `fd90b8c` (feat)
2. **Task 2: The /agenda static shell and its client availability island** — `26aaa95` (feat, includes a same-commit fix to the maintien route's error-response shape — see Deviations)

## Files Created/Modified

- `src/lib/i18n/fr.ts` — `formatHeureProse`, `formatDateAvecJour`
- `src/lib/agenda/creneaux.ts` — grouping/grid maths, `CLE_CRENEAU_CHOISI` and its helpers
- `src/lib/agenda/types-rendez-vous.ts` — server-only read of `app.type_rendez_vous`
- `src/lib/rate-limit.ts` — additive `consume(key, options)`, amortised sweep
- `src/lib/validation/maintien.ts` — POST/DELETE boundary schemas, outcome-to-key mapper
- `src/app/api/creneaux/maintien/route.ts` — anonymous retention route, IP ceiling before body read, mint/replace sub-budgets, release fails open
- `src/locales/fr/agenda.json` — three-entry legend (D-24), loading/trust/error copy
- `src/app/agenda/page.tsx` — static shell, chooser fed from the store, static legend
- `src/components/agenda/agenda-booker.tsx` — the client island
- `src/components/agenda/calendrier-mois.tsx` — hand-written monthly grid
- `src/components/agenda/liste-creneaux.tsx` — slot list + trust signals
- `src/components/agenda/booker-skeleton.tsx` — layout-holding loading skeleton

## Decisions Made

- Route returns machine-readable `agenda.erreurs.*` keys (e.g. `"jetonInconnu"`), not resolved French text, so the client can branch reliably without string-matching translated copy — mirrors the existing contact route's field-error-map idiom.
- The D-24 legend renders in the static server component so it is present in the prerendered HTML; the interactive type-selector tabs (which drive the `creneaux_libres` refetch) live inside the client island, separate from the static overview cards which stay in `page.tsx`.
- D-29's "open on the first carrying day" logic runs inside the async fetch callback guarded by a ref, not a second `useEffect` reacting to `[statut, creneaux]` — the latter tripped `eslint-plugin-react-hooks`'s `set-state-in-effect` rule (cascading-render warning) and the ref-guarded in-callback version is functionally identical and cleaner.
- Added a `naviguantVersReservationRef` guard on the release-on-unmount effect: the same component unmount fires both when the visitor abandons `/agenda` (should release) and when it navigates to `/reservation` right after successfully retaining a slot (must not release its own just-written token). The ref is set immediately before that one deliberate `router.push`.
- Fetches the full 8-week D-13 horizon once per selected type rather than month-scoped requests; month navigation slices already-fetched data client-side. `app.creneaux_libres` already clamps to 8 weeks server-side, so this is not a widened attack surface, only a simpler client.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `/api/creneaux/maintien` originally returned resolved French text instead of a machine key**
- **Found during:** Task 2, wiring `agenda-booker.tsx`'s `jeton_inconnu` retry branch
- **Issue:** Task 1's first pass had the route pre-resolve the error to French text (`{ erreur: agenda.erreurs[cle] }`). The client then had no reliable way to distinguish `'jeton_inconnu'` (retry as mint) from `'creneau_indisponible'` (refetch and show a message) without string-comparing translated copy — fragile, and a text change in `agenda.json` would silently break the retry branch.
- **Fix:** Route now returns the key itself (`{ erreur: "jetonInconnu" }`); the client resolves `agenda.erreurs[corps.erreur]` for display. Matches `src/app/api/contact/route.ts`'s existing field-error-map pattern.
- **Files modified:** `src/app/api/creneaux/maintien/route.ts`, `src/lib/validation/maintien.ts` (exported `MaintienErreurKey` type)
- **Verification:** End-to-end retest of all four route scenarios (mint success, contention 409, malformed DELETE 422, valid DELETE 200) still passes; `agenda-booker.tsx`'s retry branch compiles and type-checks against the key union.
- **Committed in:** `26aaa95` (folded into the Task 2 commit — discovered while wiring the consumer this same task builds)

**2. [Rule 1 - Bug] Two comments accidentally matched grep-based acceptance criteria as false positives**
- **Found during:** Task 2 self-verification
- **Issue:** A prose comment in `agenda-booker.tsx` said "`src/lib/supabase/public.ts` is `import \"server-only\"`", matching the `grep -c "supabase/public"` criterion meant to assert zero references (the criterion is about the actual import, not prose explaining why it's absent). Similarly a comment in `page.tsx` explaining D-06 used the literal words "cookies()", "headers()", "searchParams", matching the `grep -nE "cookies\(|headers\(|searchParams"` criterion meant to assert none are *called*.
- **Fix:** Reworded both comments to describe the same rule without the literal matched substrings (e.g. "the cookie-free server-only anonymous client" instead of the file path; "no request-scoped dynamic API… is read" instead of naming the functions).
- **Files modified:** `src/components/agenda/agenda-booker.tsx`, `src/app/agenda/page.tsx`
- **Verification:** Both greps now return zero matches; the underlying code was already correct — only the comments moved.
- **Committed in:** `26aaa95`

**3. [Rule 1 - Bug] Straight apostrophes in newly authored `agenda.json` copy**
- **Found during:** Task 2 self-verification (typography sweep)
- **Issue:** `confiance.modification` and `erreurs.creneauIndisponible`/`erreurs.typeInconnu` were first written with the keyboard's straight apostrophe (`U+0027`), violating `04-CONTEXT.md`'s curly-apostrophe rule. (`agenda.titre`, pre-existing and protected from edits by the scope fence, still carries one — out of scope for this plan.)
- **Fix:** Replaced with the curly apostrophe (`U+2019`) in the three new/copied strings.
- **Files modified:** `src/locales/fr/agenda.json`
- **Verification:** Programmatic sweep of all `agenda.json` string values for `U+0027` returns zero matches outside the pre-existing, protected `titre` key.
- **Committed in:** `26aaa95`

---

**Total deviations:** 3 auto-fixed (all Rule 1 — bugs caught by this plan's own verification, in code this same plan produced).
**Impact on plan:** None are scope creep; all three are corrections to Task 1/2's own output, caught before commit or folded into the same commit that introduced them.

## Retention rate limits — ratify at the founder gate (Task 3, item 13)

Per client IP, over a 10-minute window, in `src/app/api/creneaux/maintien/route.ts`:

| Budget | Number | Purpose |
|---|---|---|
| `maintien:ip:<ip>` | **120** | Unconditional ceiling on every `POST`, checked before the body is read — the one identifier a caller cannot influence |
| `maintien:mint:<ip>` | **30** | New holds (no `jeton` in the body) — the number that actually bounds abuse, since `app.maintenir_creneau` refuses any token it did not issue |
| `maintien:jeton:<ip>:<jeton>` | **60** | Compare/replace on an existing hold — generous, since one visitor can only ever hold one slot regardless of how many times they change their mind |
| `maintien:liberation:<ip>` | **120** | Releases (`DELETE`) — exceeding it still lets the release through; never refuses to free a slot |

Worst case from one address: ~45 slots concealed at peak (30 mints × 15-minute lifetime), self-healing within 15 minutes.

## Issues Encountered

- **Stale Next.js build cache masked a live-data check.** The first attempt to prove the type chooser reads `app.type_rendez_vous` (by mutating `individuelle`'s `prix_centimes` to `12345` and rebuilding) produced a false negative — the prerendered HTML still showed the old `90,00 €`. Root cause: `npm run build` without clearing `.next` reused a prior static-render artifact. `rm -rf .next && npm run build` resolved it and confirmed the correct behaviour (`123,45 €` rendered, then `90,00 €` again after restoring the seed value). Not a code defect — a verification-methodology note for anyone re-running this check.
- Port 3000 was already occupied by a process this session did not start and could not stop (`Access is denied` from an elevated/different-context PID) — consistent with CLAUDE.md's "assume the dev server is already running" instruction. All functional route testing (the maintien route's mint/contention/release scenarios) was done against that already-running server via `curl`; all static/prerendered-HTML checks were done directly against `.next/server/app/agenda.html` build artifacts, independent of any running server.

## User Setup Required

None — all work is local-database and local-build only; nothing pushed, no CIO dependency for this plan (the video-link env var and hosted seed run are earlier/later plans' CIO items, not this one's).

## Founder Review Required — Task 3 (D-26 blocking gate, NOT approved by this executor)

**This plan stops here.** Task 3 (`checkpoint:human-verify`, `gate="blocking"`) has not been run or approved. Per the standing rule for this phase, the executor does not self-approve this gate. The founder must review `/agenda` directly and rule on the items below before any Wave 4 plan (04-04, 04-06) starts.

**What to look at:** `/agenda` in a browser, both at 375 px and narrowed to 320 px. `npm run build` already confirms the route is `○` static (see Accomplishments); the founder's review is the parts an automated check cannot see.

**What to verify (from the plan's Task 3 `<how-to-verify>`, condensed):**

1. The calendar opens on a day that has slots, not a blank month and not today's month if today's has none (D-29); days without slots are visibly inert with no indication of why.
2. The slot list shows 5–8 at a time, grouped matin/après-midi, behind "voir plus" rather than a flat dump.
3. Trust signals (photo placeholder, "confirmation immédiate", the D-11 no-self-service-cancellation note) sit next to the slot choice, never louder.
4. **D-27:** clicking a slot shows a 15-minute hold notice; a second browser profile no longer sees that instant while the first still does; closing the first tab frees it back within a reload of the second. *(This plan builds the retention and release mechanics — no visible countdown/hold-timer badge is rendered yet; if the founder expects a visible timer at this surface rather than only the underlying hold, flag it as a fix.)*
5. **D-28:** clicking a slot while signed out does not redirect to sign-in; the visitor lands on `/reservation` with the choice held.
6. The legend reads exactly Libre / Indisponible / Passé, nowhere "Réservé" or "Bloqué".
7. Every unavailable cell (past, holiday, blocked) looks identically muted grey — nothing red, nothing distinguishing why.
8. Switching between "Appel découverte" and "Session individuelle" recomputes the slot list at the correct 45/75-minute step.
9. Slot chips read `14:30`; the day heading reads `mardi 8 septembre`; prices read `90,00 €` and `0,00 €` with the non-breaking space.
10. The label/duration/price shown match `app.type_rendez_vous` (verified programmatically above; founder can eyeball against `/admin/types-de-rendez-vous` once plan 04-09 exists — not yet built).
11. Mobile: 44×44 px targets, primary action in the lower half, nothing hover-only; no sideways scroll or overflow at 320 px.
12. Palette check: no drift toward institutional blue (grep-verified absent from source; founder confirms visually).
13. The skeleton holds panel geometry during load — no content jump, no bare spinner.
14. **Ruling — slot density (research assumption A5):** step is `duration + buffer`, so a 30-minute call yields 09:00 / 09:45 / 10:30 / 11:15 on a 09:00–12:00 range. Confirm or redirect.
15. **Ruling — the CLAUDE.md queryKeys/optimistic-update waiver.** No TanStack Query in `package.json`, zero-dependency budget this phase; the `useState` status machine (`contact-form.tsx`'s idiom) is used instead across this phase's client islands. Confirm the waiver, or say to spend the dependency slot on `@tanstack/react-query`.
16. **Ruling — the four retention rate-limit numbers** (see table above: 120/30/60/120). Confirm, or name different ones.

**Resume signal:** the founder types "approved" or describes what is wrong; if something is wrong, the next executor session fixes it in this same plan and re-presents this gate — the plan does not advance to Wave 4 until then.

## Next Phase Readiness

- **Blocked pending founder approval of this gate.** Do not start 04-04 or 04-06 (Wave 4, both depend on 04-03) until Task 3 is explicitly approved.
- Everything Wave 4 needs structurally is in place: `CLE_CRENEAU_CHOISI` and its read/write/clear helpers (04-05's `/reservation` side reads through them), `formatHeureProse`/`formatDateAvecJour` (04-04's `.ics`/email prose, 04-05's recap), the retention route's four rate-limit numbers (pending ratification above).

---
*Phase: 04-agenda-et-prise-de-rendez-vous*
*Completed: 2026-09-02 (Tasks 1–2; Task 3 pending founder review)*

## Self-Check: PASSED

All 12 created/modified source files and this SUMMARY.md confirmed present on disk; both task commit hashes (`fd90b8c`, `26aaa95`) confirmed present in `git log --oneline --all`.
