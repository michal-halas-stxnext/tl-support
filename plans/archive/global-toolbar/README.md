# Global toolbar: month and Settings outside tabs
Goal: month and Settings are panel-wide features, not part of the Time logged tab. Move them above the tabs so every tab uses them. (Refresh ended up in Time logged, see Q1.)
Planning: complete
Status: closed 2026-11-23, archived
Source: Conversation 2026-11-23: "Shouldn't Refresh and Settings be pulled out of a specific tab? They are general features."

## Stages
| NN | Stage | Executor | Status | Verification |
|----|-------|----------|--------|--------------|
| 01 | [Global toolbar](01-global-toolbar.md) | agent | done (PR #9, merged to dev) | vitest (Toolbar, Dialog, MonthView, ApprovalView, Tabs, Panel) + `npm run build` |
| 02 | [User review](02-user-review.md) | user | closed with the plan (no explicit confirmation recorded) | user confirms in demo + Chrome |

## Decisions
- Q1 (revised): Shared month for all tabs; MonthNav + Settings above the tabs. Refresh is NOT global: it lives in the Time logged action row only. Approval has no Refresh (it refetches on month change and after Accept/Reject). (Original: Refresh above the tabs acting on the active tab; dropped as redundant on Approval.)
- Q2: Settings button in the global toolbar (cog icon, right end); exclusions also apply to the Approval tab. (Makes Settings truly global.)
- Q3 (revised): Time logged action row, left to right: Refresh/Cancel, Clear data, Export CSV, progress/status, "Refreshed: …" label at the right. Errors list drops under the row. (Refresh logic lives in `useRefresh`, rendered by `DataActions`.)
- Q4: Two stages: 01 agent implementation, 02 user review in demo + Chrome. (AGENTS.md requires user review of UI changes.)
- Q5: Logged-in user detection (`detectLineManagerId`) moves to the shell context; one session message ("Could not detect the logged-in user…" / "Log in to the intranet") shown in the toolbar instead of per tab. Refresh in Time logged is disabled when no user is detected.
- Q6 (added): Approval: Accept/Reject selected on the left, status in the middle, filters (Hours type, State) on the right, one row.
- Q7 (added): Confirmations and alerts use the in-panel dialog (`useDialog` in `src/ui/Dialog.tsx`), never native `confirm()`/`alert()`/`prompt()`. Rule recorded in AGENTS.md.

## Assumptions
- Approval entries come from the intranet API for the line manager; manually added people only show in Approval if the API returns their entries. Q2 for Approval = exclusion filter only.
- The people list in Settings comes from the Time logged snapshot (published to the shell context); with no snapshot only manually added people are listed.
- In demo mode the dialog backdrop covers the nearest positioned ancestor (the real panel is `position: fixed`, so it covers the panel).
- Before this plan: `RefreshBar` (Refresh, Export CSV, Clear data) and the Settings popup lived in `src/ui/MonthView.tsx`; each tab had its own `month` state.
