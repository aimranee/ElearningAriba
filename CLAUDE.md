# CLAUDE.md

You are on Windows (native, not WSL) — paths are `C:\...` and shell commands run through PowerShell or Git Bash.

## What this is

The **product** repo for the SAP Ariba e-learning site: a live-training booking
platform — the learner creates an account, books and pays for a slot in the
trainer's calendar, and follows their progression. A French back-office runs
availability, sessions, attendance and payments.

Remote `github.com/aimranee/ElearningAriba.git`, default branch `main`, private.
It sits inside the workspace repo, which ignores it — two separate histories.
Never commit product code to the parent.

## Communication Guidelines

**IMPORTANT**: Before answering any question, rephrase it into a clearer form first — the user may not know how to phrase it precisely.

## Rules

- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.
- At the end of each plan, list unresolved questions (extremely concise).
- DO NOT write tests unless explicitly requested
- DO NOT run dev server — assume already running
- Add code comments sparingly — focus on "why", not "what"
- Use GitHub CLI for all GitHub interactions
- NEVER use `any` type — use proper TypeScript types, `unknown`, or generics, use Zod at boundaries
- NEVER hardcode text; use translation keys; all strings in `src/locales/fr/`
- show/hide based on user role
- use queryKeys factory, prefer optimistic updates

## Git Commits

Format: `#<type>: <one sentence>`
Example: `#feat: add halaqah schedule tab`
Types: feat / fix / refactor / chore / docs

## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.

<!-- GSD:profile-end -->
