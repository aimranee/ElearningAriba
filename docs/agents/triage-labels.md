# Triage labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the label strings used on `aimranee/ElearningWorkspace`.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

## Workspace labels beyond the five roles

| Label | Meaning | Set by |
| ----- | ------- | ------ |
| `bug` | A defect, filed as its own ticket | whoever finds it |
| `area:elearning` | The work lands in `ElearningAriba` | lot, spec and ticket authors |
| `needs-qa` | A lot's or fix's tickets are closed and its branch is pushed; waiting on the CQO review before the merge | CTO |
| `qa-passed` | The CQO review passed; the CIO may merge and deploy | CQO |
| `qa-failed` | The CQO review failed; bug tickets are filed under the lot or fix issue | CQO |
