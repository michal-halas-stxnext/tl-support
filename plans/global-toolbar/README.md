# Global toolbar: Refresh and Settings outside tabs
Goal: Refresh and Settings are panel-wide features, not part of the Time logged tab. Move them (with a shared month) above the tabs so every tab uses them.
Planning: complete
Source: Conversation 2026-11-23: "Shouldn't Refresh and Settings be pulled out of a specific tab? They are general features."

## Stages
| NN | Stage | Executor | Status | Verification |
|----|-------|----------|--------|--------------|
| 01 | [Global toolbar](01-global-toolbar.md) | agent | planned | vitest (Toolbar, MonthView, ApprovalView, Tabs, Panel) + `npm run build` |
| 02 | [User review](02-user-review.md) | user | planned | user confirms in demo + Chrome |

## Decisions
- Q1: Shared month for all tabs; MonthNav + Refresh above the tabs; Refresh reloads the active tab (Time logged: collect from intranet, Approval: refetch entries). (Simpler and consistent; one month context.)
- Q2: Settings button in the global toolbar; exclusions also apply to the Approval tab. (Makes Settings truly global.)
- Q3: Export CSV and Clear data stay in the Time logged tab; only Refresh (+ Cancel, progress, status, errors) moves to the global toolbar. (They act on Time logged snapshots only.)
- Q4: Two stages: 01 agent implementation, 02 user review in demo + Chrome. (AGENTS.md requires user review of UI changes.)
- Q5: Logged-in user detection (`detectLineManagerId`) moves to the shell context; one session message ("Could not detect the logged-in user…" / "Log in to the intranet") shown in the toolbar instead of per tab. (Removes duplication in `RefreshBar.tsx:18` and `ApprovalView.tsx:51`.)

## Assumptions
- Approval entries come from the intranet API for the line manager; manually added people only show in Approval if the API returns their entries. Q2 for Approval = exclusion filter only.
- Current state: `RefreshBar` (Refresh, Export CSV, Clear data) and Settings popup live in `src/ui/MonthView.tsx:86-92`; Approval has no Refresh, refetches on month change (`src/ui/ApprovalView.tsx`); each tab has its own `month` state.
