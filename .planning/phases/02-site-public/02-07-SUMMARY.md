---
phase: 02-site-public
plan: 07
subsystem: api

tags: [zod, resend, fetch, contact-form, honeypot, rate-limit, supabase]

requires:
  - phase: 02-site-public
    provides: "app.contact_message table + anon insert-only RLS policy (02-02); cookieless anon Supabase client (02-02); Field/FieldControl/FieldError/Message/Card/SectionHeader components (02-01/02-03/02-06)"
provides:
  - "POST /api/contact — validated, honeypot- and rate-limit-screened, stores a row and sends two emails"
  - "Dependency-free in-process rate limiter (src/lib/rate-limit.ts)"
  - "Resend fetch transport with request-time key validation (src/lib/email/resend.ts)"
  - "Two contact email bodies registered as unresolved mock keys (CADR-03)"
affects: [05-agenda-et-prise-de-rendez-vous, 07-paiement-en-ligne]

tech-stack:
  added: []
  patterns:
    - "Server-only fetch transport instead of an SDK — no new npm dependency for a single POST"
    - "Env var optional at boot, strictly re-validated at request time inside the module that uses it (D-48 vs D-34)"
    - "Mock registry (_mocks.*.json) as the sanctioned escape hatch for client-dependent copy, instead of inventing signed-sounding French"

key-files:
  created:
    - src/lib/validation/contact.ts
    - src/lib/rate-limit.ts
    - src/lib/email/resend.ts
    - src/lib/email/render.ts
    - src/app/api/contact/route.ts
    - src/components/forms/contact-form.tsx
  modified:
    - src/locales/fr/emails.json
    - src/locales/fr/_mocks.emails.json
    - src/lib/env/server.ts
    - .env.example
    - src/app/contact/page.tsx

key-decisions:
  - "RESEND_API_KEY: z.string().min(1).optional() in serverEnv, then strictly re-parsed inside resend.ts at send time — keeps next build green without the key while still never defaulting or logging it"
  - "Both new emails' from address reuses the already-signed contact@formation-sap-ariba.fr rather than inventing a new no-reply address"
  - "contact/page.tsx uses SectionHeader (h2) per the plan's explicit instruction, dropping the page's own h1 — matches the landing page's own existing gap (no h1 there either), not a new regression"

patterns-established:
  - "API route handler shape: Zod parse -> anti-spam/rate-limit gate -> DB insert -> best-effort side effect (email), with the DB write never rolled back on a downstream transport failure"

requirements-completed: []

duration: 30min
completed: 2026-08-30
---

# Phase 02 Plan 07: Contact form, email transport and env-optional Resend key Summary

**POST /api/contact validates with Zod, screens honeypot + 3s time-gate + 5-per-10-min rate limit before an anon Supabase insert, then sends two plain-text emails over a dependency-free fetch transport to Resend — RESEND_API_KEY stays optional at boot and next build passes without it.**

## Performance

- **Duration:** 30 min
- **Tasks:** 3
- **Files modified:** 11 (5 modified, 6 created)

## Accomplishments
- Two contact email bodies (`contactNotification`, `contactAccusReception`) added to `emails.json` and every leaf string registered in `_mocks.emails.json` — `npm run content:check` still exits 1, naming both as unresolved CADR-03 keys.
- `RESEND_API_KEY` is optional in `serverEnv` (boot-safe) and re-validated strictly at request time inside `src/lib/email/resend.ts` — `npm run build` with the var unset exits 0.
- `POST /api/contact` runs the full D-35/AC-9 order: parse -> honeypot + minimum-time-to-submit -> rate limit -> insert -> send two emails, never rolling back the row on a transport failure.
- `ContactForm` client island renders all four D-36 states (submitting, success, validation error, transport error) on the lifted Lot 1 markup; `contact/page.tsx` is now a server component with no bordered-flat card.

## Task Commits

1. **Task 1: Register the two missing contact emails as unresolved mock keys** - `cefdeed` (feat)
2. **Task 2: Validation schema, anti-spam, and the Resend transport that does not break the build** - `a8e1276` (feat)
3. **Task 3: The POST route and the four-state form** - `9ca38b4` (feat)

## Files Created/Modified
- `src/locales/fr/emails.json` - adds `contactNotification` and `contactAccusReception`, plain functional French, no price/delay promise
- `src/locales/fr/_mocks.emails.json` - 22 new leaf-key registry entries (CADR-03), guard keeps exiting 1
- `src/lib/env/server.ts` - `RESEND_API_KEY: z.string().min(1).optional()`
- `.env.example` - documents `RESEND_API_KEY=` under the server-only-secret block, empty
- `src/lib/validation/contact.ts` - Zod schema + issue-to-`contact.erreurs.*`-key mapper
- `src/lib/rate-limit.ts` - in-process sliding-window limiter, 5/10min per IP
- `src/lib/email/resend.ts` - `EmailTransportError`, fetch to `api.resend.com/emails`, request-time key validation
- `src/lib/email/render.ts` - `{placeholder}` substitution via `String.replace`, matches `footer.tsx:109`
- `src/app/api/contact/route.ts` - `POST` only, no GET/DELETE/export
- `src/components/forms/contact-form.tsx` - client island, honeypot + `rendu` mount-time timestamp, four states
- `src/app/contact/page.tsx` - server component: `SectionHeader`, raised `Card`, `<ContactForm />`

## Decisions Made
- Both new emails' `from` reuses `contact.coordonnees.email` (the one signed address in this lot) instead of inventing a `no-reply@` address that no one has confirmed exists.
- `contact/page.tsx` follows the plan's explicit instruction to use `SectionHeader` (which renders an `h2`), dropping the page's prior custom `h1`. The landing page (`src/app/page.tsx`) has the same gap already — not a regression introduced here, and out of this task's scope to fix repo-wide.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed worktree dependencies**
- **Found during:** Task 2, first `npm run build` attempt
- **Issue:** This worktree had no `node_modules` at all (Turbopack's `turbopack.root: __dirname` in `next.config.ts` refuses to resolve outside the worktree, so it could not fall back to the main checkout's `node_modules`)
- **Fix:** Ran `npm ci` against the existing, unmodified `package-lock.json` — no new or changed dependency, purely installing what was already pinned
- **Files modified:** none (node_modules is gitignored)
- **Verification:** `npm run build`, `npm run lint`, `npx tsc --noEmit` all subsequently ran and passed
- **Committed in:** n/a (not a source change)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Environment setup only; no scope creep, no source-shape changes.

### Verify-command literalism note (not a deviation, no code changed)

Task 3's acceptance criteria include: "the honeypot check appears at a lower line number than the first call to the email sender: `grep -n "societe"` ... and `grep -n "sendEmail\|resend"` ... — the first must be smaller." As written this grep also matches the `import { sendEmail } from "@/lib/email/resend"` line, which necessarily precedes any usage — so the literal line-number comparison fails (import at line 7, honeypot check at line 32) even though the actual *execution order* is correct: the honeypot/time-gate check (line 32) runs and can short-circuit long before the first `sendEmail(...)` call site (line 68). Per the environment note on verify-command literalism, the import was not reordered or hidden to force the grep to pass — the code stays in its natural shape. All of Task 3's actual `<verify><automated>` block (the authoritative check, which does not include this specific grep pair) passed: `npm run build && npm run lint && ! grep ... DELETE && ! grep ... recaptcha && grep -n 'name="societe"' ...`.

The plan's Task 3 acceptance criteria also describe a curl-based behavioral proof "run against the dev server (already running — do not start it)". No dev server was reachable on this isolated worktree (port 3000 unreachable), and starting one is out of scope per CLAUDE.md ("DO NOT run dev server"). The local Supabase stack (port 54321) was confirmed running and used to supply real env values for `npm run build`/`tsc`, which is the plan's actual `<verify>` gate and passed.

## Issues Encountered
- The build initially failed with a stale/partial `node_modules` state after a transient `npm ci` in the background — resolved by a clean `rm -rf node_modules && npm ci`, which completed successfully (see deviation above).

## User Setup Required
None for this plan. `RESEND_API_KEY` still needs CIO provisioning before real emails can send in any environment — tracked already via the optional-env-var pattern; nothing new to hand off here.

## Next Phase Readiness
- PUB-11 is satisfiable end to end locally: insert verified via the anon insert-only policy from 02-02, honeypot/time-gate/rate-limit all run before any send, and the build stays green without `RESEND_API_KEY`.
- Real Resend sends remain unverified (no key in any environment yet) — the transport throws `EmailTransportError` and the route returns 502 in that case, which the form surfaces as the D-36 transport-error state; this is the intended degrade-gracefully path, not a gap.
- `npm run content:check` still exits 1 (72 CADR-03 + 10 CADR-01 entries outstanding across the whole registry, including the 22 added here) — expected until the client returns `Cadrage_Formation_SAP_Ariba_Questions_Client.docx`.

---
*Phase: 02-site-public*
*Completed: 2026-08-30*

## Self-Check: PASSED

All 11 files created/modified verified present on disk. All 3 task commits (`cefdeed`, `a8e1276`, `9ca38b4`) verified in `git log`.
