# Brief: 01 Global toolbar

You are working in the TL Support browser extension repo (Preact + TS + Vite). Read `AGENTS.md` first and follow it (English-only repo content, shared `MonthNav`, Settings popup Escape rules, narrowest tests, `git switch`).

## Goal
Lift month, Refresh and Settings out of the Time logged tab into a toolbar above the tabs, shared by all tabs. Settings exclusions also apply to Approval.

## Context (current state)
- `src/ui/Tabs.tsx`: tab registry `TABS` (Time logged → `MonthView`, Approval → `ApprovalView`), renders tablist + active tab.
- `src/ui/Panel.tsx:95`: renders `<Tabs tabs={tabs} />` inside panel body.
- `src/ui/MonthView.tsx`: own `month` state, loads/saves Settings, Settings popup with outside-click/Escape close logic (lines 38-56), renders `RefreshBar` (line 92).
- `src/ui/RefreshBar.tsx`: Refresh/Cancel (collectMonth → saveSnapshot), Export CSV, Clear data, progress, status, errors.
- `src/ui/ApprovalView.tsx`: own `month`; refetches on `[month, reload]`; no Refresh button; does not use Settings.
- `src/settings/settings.ts`: `Settings` type, `loadSettings`/`saveSettings`, `effectivePeople`.
- `src/demo/main.tsx`: renders `MonthView` and `ApprovalView` standalone with fixtures.

## Spec
See `plans/global-toolbar/01-global-toolbar.md` (full copy below).

### Scope in
- Shared month state for all tabs (one `MonthNav` above the tabs).
- Global toolbar between tab list and tab panel: `MonthNav`, Refresh/Cancel, progress, status, errors, Settings button + popup.
- Refresh acts on the Time logged tab (collect from intranet + save snapshot); hidden on Approval (it refetches on its own).
- Settings state loaded/saved once at shell level; passed to tabs.
- Approval filters out excluded people (`settings.excluded`).
- Session (Q5): detect logged-in user once in the shell context (`lineManagerId`, injectable for tests/demo); tabs read it from context. Missing user / logged out (`LoggedOutError` or collect `loggedOut`) → one message in the toolbar, not in the tab.
- Demo renders the new shell (toolbar + tabs).

### Scope out
- Export CSV and Clear data stay in Time logged.
- Settings schema unchanged.
- Manually added people in Approval without API entries.
- Panel header unchanged.

### Detailed plan
1. Shell context (e.g. `src/ui/PanelContext.tsx`): `month`, `setMonth`, `settings`, `setSettings`, active-tab refresh handler registration (`useRefreshHandler(fn)`; handler gets `AbortSignal` + `onProgress`, returns status/errors).
2. Toolbar (e.g. `src/ui/Toolbar.tsx`): `MonthNav`, Refresh/Cancel, progress, status, errors, Settings anchor + `SettingsPanel`; move Settings close logic unchanged.
3. `MonthView`: use context; register Time logged refresh; keep "Refreshed: …", Export CSV, Clear data.
4. `ApprovalView`: use context; register refresh = refetch; filter by `settings.excluded`.
5. Keep injectable props for tests/demo (`initialMonth`, `loadSnapshot`, `deps`, `lineManagerId`).
6. Demo: render shell with both tabs, no intranet.
7. Move Settings tests to toolbar test; add tests for criteria.

### Acceptance criteria
- Toolbar with MonthNav, Refresh, Settings above tab panel, once, for every tab.
- Time logged has no own MonthNav/Refresh/Settings; Export CSV + Clear data work.
- Month change applies to both tabs.
- Refresh on Time logged = collect for shared month (Cancel/progress/status/errors as before).
- No Refresh button on Approval.
- Settings popup closes on outside click and Escape; Escape doesn't close panel.
- `detectLineManagerId` called only in the shell; tabs read `lineManagerId` from context.
- Missing user / logged out → one toolbar message for both tabs.
- Excluded person hidden in Time logged grid and Approval list.
- Demo shows toolbar + tabs with fixtures.
- English UI strings; `MonthNav` reused.
- `npm run build` passes.

## Constraints
- Do not commit. Do not touch `.env`. No new dependencies.
- Do not change `src/settings/settings.ts` schema, intranet API code, or panel header.
- Do not weaken or delete tests; move/adapt Settings tests, keep their assertions.
- Do not run `build:safari`.

## Definition of done
All criteria met; these pass and real output is reported:
- `npx vitest run src/ui/Toolbar.test.tsx src/ui/MonthView.test.tsx src/ui/ApprovalView.test.tsx src/ui/Tabs.test.tsx src/ui/Panel.test.tsx`
- `npm run build`
