# 01 Global toolbar (shared month, Refresh, Settings)

## Goal
Lift month, Refresh and Settings out of the Time logged tab into a toolbar above the tabs, shared by all tabs. Settings exclusions also apply to Approval.

## Scope
In:
- Shared month state for all tabs (one `MonthNav` above the tabs).
- Global toolbar between tab list and tab panel: `MonthNav`, Refresh/Cancel, progress, status, errors, Settings button + popup.
- Refresh acts on the Time logged tab (collect from intranet + save snapshot); hidden on Approval (it refetches on its own).
- Settings state loaded/saved once at shell level; passed to tabs.
- Approval filters out excluded people (`settings.excluded`).
- Session (Q5): detect logged-in user once in the shell context (`lineManagerId`, injectable for tests/demo); tabs read it from context. Missing user / logged out (`LoggedOutError` or collect `loggedOut`) → one message in the toolbar, not in the tab.
- Demo (`src/demo/main.tsx`) renders the new shell (toolbar + tabs) so it can be reviewed.

Out:
- Export CSV and Clear data: stay in Time logged (Q3).
- Settings content/format (`src/settings/settings.ts` schema unchanged).
- Showing manually added people in Approval when the API returns no entries for them.
- Panel header (Fullscreen/Close) unchanged.

## Decisions
- Q1: shared month; MonthNav + Refresh above tabs; Refresh = active tab.
- Q2: Settings global; exclusions apply to Approval.
- Q3: Export CSV / Clear data stay in Time logged.
- Q5: session detection + session message global (toolbar).

## Detailed plan
1. Shell state: a context (e.g. `src/ui/PanelContext.tsx`) with `month`, `setMonth`, `settings`, `setSettings`, and a way for the active tab to register its refresh handler (`useRefreshHandler(fn)` returning `Promise`, with `AbortSignal` + `onProgress`). Provided by `Tabs` (or a new `Shell` wrapping it).
2. Toolbar component (e.g. `src/ui/Toolbar.tsx`): `MonthNav`, Refresh/Cancel, progress, status, errors list, Settings anchor + `SettingsPanel`. Settings close-on-outside-click / Escape logic moves here unchanged (Escape stops propagation, does not close the panel).
3. `MonthView`: drop own month, settings, Settings popup; read from context; register Time logged refresh (collect → save → reload). Keep "Refreshed: …" and an Export CSV + Clear data row (strip Refresh out of `RefreshBar`, or rename to `DataActions`).
4. `ApprovalView`: drop own month; read from context; register refresh = refetch (`setReload`); filter entries by `settings.excluded` before `groupByPerson`.
5. Props for tests/demo stay injectable (`initialMonth`, `loadSnapshot`, `deps`, `lineManagerId`) — via shell/context props.
6. Demo: render the shell with both tabs; Refresh in demo re-reads fixtures / mock (no intranet).
7. Update tests: move Settings tests from `MonthView.test.tsx` to toolbar test; add tests listed below.

## Acceptance criteria
- [ ] Toolbar with MonthNav, Refresh and Settings renders above the tab panel, once, for every tab.
- [ ] Time logged no longer renders its own MonthNav, Refresh or Settings; Export CSV and Clear data still there and work.
- [ ] Changing month in the toolbar changes the month in both tabs (switch tab → same month).
- [ ] Refresh on Time logged runs collect for the shared month (Cancel, progress, status, errors behave as before).
- [ ] No Refresh button on Approval.
- [ ] Settings popup: closes on outside click and Escape; Escape does not close the TL panel.
- [ ] `detectLineManagerId` is called only in the shell; neither tab calls it.
- [ ] Missing user or logged-out session shows one message in the toolbar (both tabs), not inside the tab.
- [ ] Person excluded in Settings disappears from both Time logged grid and Approval list.
- [ ] Demo (`npm run dev` → `demo.html`) shows toolbar + tabs with fixtures.
- [ ] All UI strings English; MonthNav reused (`src/ui/MonthNav.tsx`), not reimplemented.
- [ ] `npm run build` passes.

## Verification
- `npx vitest run src/ui/Toolbar.test.tsx` (new)
- `npx vitest run src/ui/MonthView.test.tsx src/ui/ApprovalView.test.tsx src/ui/Tabs.test.tsx src/ui/Panel.test.tsx`
- `npm run build`

## Files
- `src/ui/Tabs.tsx`, `src/ui/Panel.tsx`, `src/ui/MonthView.tsx`, `src/ui/ApprovalView.tsx`, `src/ui/RefreshBar.tsx`, `src/ui/Settings.tsx`, `src/ui/styles.ts`, `src/demo/main.tsx`
- New: `src/ui/PanelContext.tsx`, `src/ui/Toolbar.tsx`, `src/ui/Toolbar.test.tsx` (names indicative)
- Tests: `src/ui/*.test.tsx`

## Depends on
—
