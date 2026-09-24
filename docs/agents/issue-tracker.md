# Issue tracker: GitHub, one tracker for the workspace

Every lot, ticket and bug for ElearningAriba lives as a GitHub issue on
**`aimranee/ElearningWorkspace`** — product work included. The product
repo's own tracker (`aimranee/ElearningAriba`) is not used (decision
2026-09-15, founder): every manager seat's working directory is already this
repo, and this repo has no collaborator but the founder.

**Pass `-R aimranee/ElearningWorkspace` on every `gh issue` command.** `gh`
otherwise infers the repo from the working directory, and a session rooted
in the product repo would write to the wrong tracker without a warning.

GitHub is the single source of truth. Jira is not used.

**No day counts and no amounts in an issue.** A lot's charge, spend and price
stay in `ariba-chief-of-staff/knowledge/registre-lots.md` (its Ruling 1). An
issue may quote a payment gate's signed wording, never a figure.

## The milestone and the lots

- One milestone, `v1 — Essentiel`, holds the signed scope. Every lot issue
  and ticket for it carries that milestone.
- One issue per lot, titled `Lot N — <nom du lot>`, plus one for the
  technical foundation (Phase 0, no lot). They were migrated from the GSD
  roadmap on 2026-09-15 and quote its constraints verbatim.
- **The lot issue is the spec** (decision 2026-09-15, founder). Its tickets
  are sub-issues of the lot; there is no separate spec issue.
- **A lot issue closes when its engineering is done** — its branch merged
  (decision 2026-09-15, founder). The payment gate is a client act the Chief
  of Staff tracks; a closed lot issue does not mean the lot is billable.
- A signed requirement still owed when its lot closes is its own open issue,
  a sub-issue of the lot.
- A defect found in production between lot gates is its own `bug` issue,
  built on a `fix/` branch without waiting for a lot.

## Conventions

- **Create**: `gh issue create -R aimranee/ElearningWorkspace --title "..." --body "..." --label "..." --milestone "v1 — Essentiel"`. Use a heredoc for multi-line bodies.
- **Area label, required on every product issue**: `area:elearning` — the work lands in `ElearningAriba`. An issue about the manager layer or workspace tooling carries none.
- **Read**: `gh issue view <n> -R aimranee/ElearningWorkspace --comments`
- **List**: `gh issue list -R aimranee/ElearningWorkspace --state open --json number,title,labels,assignees` with `--label` / `--assignee` / `--milestone` filters.
- **Comment**: `gh issue comment <n> -R aimranee/ElearningWorkspace --body "..."`
- **Labels**: `gh issue edit <n> -R aimranee/ElearningWorkspace --add-label "..."` / `--remove-label "..."`
- **Claim**: `gh issue edit <n> -R aimranee/ElearningWorkspace --add-assignee @me` — the first write of any work session. An unassigned issue is unclaimed; assignment is the lock.
- **Close**: `gh issue close <n> -R aimranee/ElearningWorkspace --comment "..."`

## Tickets

- **From a lot**: the CTO grills the lot issue with the founder for decisions it still leaves open, then the founder runs `/to-tickets` on it in the CTO seat.
- **Tickets** are sub-issues of the lot (`gh issue create -R aimranee/ElearningWorkspace --parent <lot> ...`), labelled `area:elearning`. Blocking edges with `--blocked-by <n>` at creation, or `gh issue edit <n> -R aimranee/ElearningWorkspace --add-blocked-by <m>` afterwards. Requires `gh` 2.94 or later.
- **Check the graph by hand.** The skills do not reliably create the sub-issue link or the native blocking edge (mattpocock/skills#554, #513); read the result back with `gh issue view` and wire what is missing.
- **Paths**: a ticket may name file paths, because it is built within days.
- **Frontier**: open tickets whose blockers are all closed and that nobody is assigned to.
- **One ticket per dispatch.** The CTO claims it and dispatches the `engineer` agent with the full reference (`aimranee/ElearningWorkspace#42`) and the branch.
- **The CTO closes tickets by hand**, once it has re-run the evidence: `--comment "Red at base: <test>. Green at <sha>. CI: <run>."` Nothing closes them for you, and an unclosed blocker keeps the next ticket blocked. The engineer never closes an issue.

## Branches

- **`lot/<n>-<slug>`** — one per lot, off `master`; every ticket of the lot is committed to it.
- **`fix/<issue>-<slug>`** — one per production defect, off `master`.
- The engineer commits; the CTO pushes these two shapes and nothing else; only the CIO touches `master`. After a fix merges, `master` is merged into any open lot branch on an engineer dispatch.

## The QA loop — per lot or fix, before the merge

A merge to `ElearningAriba`'s `master` is a production deploy (MANAGER-CRAFT, "Only the CIO pushes `master`"), so the review comes first.

1. **CTO:** once a lot's (or fix's) tickets are closed, open a draft pull request on `aimranee/ElearningAriba` from its branch to `master`, comment the link and head SHA on the issue, and label it `needs-qa`.
2. **CQO:** review that SHA from a clone pinned to it, comment the verdict with the report path, and replace `needs-qa` with `qa-passed` or `qa-failed`.
3. A bug against the lot or fix becomes a new ticket: a sub-issue of that issue, labelled `bug`, `ready-for-agent` and `area:elearning`, built on the same branch. The issue stays `qa-failed` until those tickets close and the CTO pushes and relabels it `needs-qa` with the new head SHA.
4. **CIO:** only on `qa-passed`, with the founder's go-ahead — apply the branch's new migrations to the hosted project, merge the pull request, confirm the deploy, comment the deployed commit on the issue and close it.
5. A bug found after the issue closed is a standalone `bug` issue on its own `fix/` branch — never blocked by a closed issue.

## When a skill says "publish to the issue tracker"

Create a GitHub issue on `aimranee/ElearningWorkspace`, with `-R`.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> -R aimranee/ElearningWorkspace --comments`.

## Pull requests as a triage surface

**PRs as a request surface: no.** A pull request exists only to carry a lot or fix branch to its merge.
