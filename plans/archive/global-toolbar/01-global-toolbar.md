# 01 Global toolbar (shared month, Settings)

Status: done (PR #9 merged to `dev`). Revised after implementation: Refresh moved to the Time logged row (see README Q1/Q3).

## Goal
Lift month and Settings out of the Time logged tab into a toolbar above the tabs, shared by all tabs. Settings exclusions also apply to Approval.

## Scope
In:
- Shared month state for all tabs (one `MonthNav` above the tabs).
- Global toolbar between tab list and tab panel: `MonthNav`, session message, Settings cog button (right) + popup.
- Time logged action row: Refresh/Cancel, Clear data, Export CSV, progress/status, errors, "Refreshed: …" at the right. No Refresh on Approval.
- Settings state loaded/saved once at shell level; passed to tabs.
- Approval filters out excluded people (`settings.excluded`); Approval actions and filters share one row.
- Session (Q5): detect logged-in user once in the shell context (`lineManagerId`, injectable for tests/demo); tabs read it from context. Missing user / logged out (`LoggedOutError` or collect `loggedOut`) → one message in the toolbar, not in the tab.
- In-panel dialog (`useDialog`) replaces native `confirm()` (Clear data, Accept/Reject many).
- Demo (`src/demo/main.tsx`) renders the new shell (toolbar + tabs) so it can be reviewed.

Out:
- Settings content/format (`src/settings/settings.ts` schema unchanged).
- Showing manually added people in Approval when the API returns no entries for them.
- Panel header (Fullscreen/Close) unchanged.

## Decisions
See README (Q1 revised, Q2, Q3 revised, Q5, Q6, Q7).

## Implementation (as built)
1. `src/ui/PanelContext.tsx`: `PanelProvider` (`month`, `settings`/`changeSettings`, `lineManagerId`, `loggedOut`, `people`), wraps children in `DialogProvider`. Props `initialMonth`, `lineManagerId` for tests/demo; `Tabs` takes `shell` and `Panel` passes it through.
2. `src/ui/Toolbar.tsx`: `MonthNav`, session message, Settings cog + `SettingsPanel` (outside click / Escape close, Escape does not reach the panel; popup anchored right).
3. `src/ui/useRefresh.ts`: busy/progress/status/errors around a refresh handler; `LoggedOutError` → shell `loggedOut`. `src/ui/DataActions.tsx` (renamed from `RefreshBar`) renders the Time logged row; `src/ui/labels.ts` holds error source labels.
4. `MonthView`: reads month/settings from context; refresh = collect → save → reload (`collect`/`save` injectable); demo mode: Refresh only reloads, no Clear/Export.
5. `ApprovalView`: reads month from context; filters `settings.excluded`; no refresh handler; single `approval-bar` row.
6. `src/ui/Dialog.tsx`: `DialogProvider`, `useDialog()` → `confirm`, `alert`; styles in `styles.ts`.
7. Tests moved/added: `Toolbar.test.tsx`, `Dialog.test.tsx`, plus updates in `MonthView`, `ApprovalView`, `Tabs` tests.

## Acceptance criteria
- [x] Toolbar with MonthNav and Settings renders above the tab panel, once, for every tab.
- [x] Time logged has no own MonthNav or Settings; Refresh, Clear data, Export CSV in this order, "Refreshed" at the right.
- [x] Changing month in the toolbar changes the month in both tabs (switch tab → same month).
- [x] Refresh on Time logged runs collect for the shared month (Cancel, progress, status, errors behave as before).
- [x] No Refresh button on Approval.
- [x] Settings popup: closes on outside click and Escape; Escape does not close the TL panel.
- [x] `detectLineManagerId` is called only in the shell; neither tab calls it.
- [x] Missing user or logged-out session shows one message in the toolbar (both tabs), not inside the tab.
- [x] Person excluded in Settings disappears from both Time logged grid and Approval list.
- [x] Clear data and multi-entry Accept/Reject use the in-panel dialog, not native `confirm()`.
- [ ] Demo (`npm run dev` → `demo.html`) shows toolbar + tabs with fixtures. (built; visual check pending, stage 02)
- [x] All UI strings English; MonthNav reused (`src/ui/MonthNav.tsx`), not reimplemented.
- [x] `npm run build` passes.

## Verification
- `npx vitest run src/ui` (7 files, 47 tests passed)
- `npm run build`

## Files
- `src/ui/Tabs.tsx`, `src/ui/Panel.tsx`, `src/ui/MonthView.tsx`, `src/ui/ApprovalView.tsx`, `src/ui/styles.ts`, `src/demo/main.tsx`, `AGENTS.md`
- New: `src/ui/PanelContext.tsx`, `src/ui/Toolbar.tsx`, `src/ui/DataActions.tsx` (was `RefreshBar.tsx`), `src/ui/useRefresh.ts`, `src/ui/labels.ts`, `src/ui/Dialog.tsx`
- Tests: `src/ui/*.test.tsx`

## Depends on
—
