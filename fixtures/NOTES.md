# Intranet — reconnaissance notes (stage 01)

Origin: `https://intranet.stxnext.pl`. Auth: browser session (cookie); headers/CSRF to be confirmed (see "Open").

## 1. Team members list
- Page: `/user/employees_list_view` (async, data from API)
- Data: `GET /api/intranet4/users/universal?active=true`
- Response: array of objects (`id` string, `name`, `contact`, `department`, `roles`, `teams[{id,name}]`, `lineManagerId`, `company`, `isActive`, `isEmployee`, …)
- Team filter = `JS Team 04`: **client side** (the API returns all active users, ~480 people). Filter by `teams[].name` (a person may have several teams). Team id in absences: 1180.
- Fixture: `users-universal.json` (10 JS Team 04 people + 5 others, anonymized)

## 2. Absences (summary table)
- Page: `GET /employees/table/absences?year=2026&team=1180&location=0&department=0` — **server-side** filtering (changing the filter = reload, full HTML; no separate API). `team`: 0 = All, -1 = My teams.
- Data in an inline `<script>`: `var data = {...};` (before `generateTable(data)`). DOM tables are built by JS → the parser reads this JSON, not the DOM.
- `data`: `users[{id,name,leave_mandated,leave_used,location_id}]`, `locations[]`, `year`, `holidays[]` (`YYYY-MM-DD`), `absences`, `absencesSum`, `absencesMonths`, …
- `absences[userId]["YYYY-MM-DD"] = [number_of_days, type, note]` — a range from the start date spanning N days. Type is always `bezplatny` → ignore (there are no other types). Note = free text, irrelevant. Whether N is calendar or working days: to be determined in stage 03 from data.
- Person details: `/employees/list/absence?user_id=<id>&limit=200&date_start=DD-MM-YYYY&date_end=DD-MM-YYYY`
- Logged-in user id: `Globals.user.id` in inline scripts of intranet pages.
- Fixture: `absences-js-team-04.html` (minimal: just the inline script, anonymized)

## 3. Timesheet approval
- Page: `/times/approval`
- Data: `GET /api/times/approval?line_manager=<id>&month=<YYYY-MM-01>&billability=<ALL|BILLABLE|NON_BILLABLE>&state=<ALL|...>`
- `line_manager` = coordinator (the "coordinator" filter in the UI, defaults to the logged-in user). No Team filter — the set of people is determined by the coordinator.
- `billability=ALL` returns both kinds (138 billable + 26 non-billable = 164 = `total_rows`); distinguished by `project_non_billable`. Only billable hours count; show non-billable separately.
- Response: `{total_rows, columns[], rows[][]}` — rows are positional per `columns`. Fields: `user_id`, `user_name`, `timeentry_date` (`DD.MM.YYYY`), `timeentry_time` (`HH:MM`, every 15 min, `00:15`…`10:30`), `project_non_billable` (bool), `timeentry_approval_state` (known: `OPEN`), `timeentry_description` (multiline), `line_manager_id`, `department_name`, …
- Observations: up to 10 entries per person/day, a day's total may exceed 8 h; there are future entries (bench for upcoming days); no weekends in the samples.
- Fixtures: `timesheet-approval-billable.json` (138 rows, 9 people), `timesheet-approval-nonbillable.json` (26 rows, 3 people); anonymized (client/project names replaced).

## 4. Accept/reject
- `POST /api/times/approval` (same URL as GET), `content-type: application/json; charset=UTF-8`
- Body: `{"action":"ACCEPTED"|"REJECTED","ids":[<timeentry_id>, ...]}` — `ids` is an array → **native bulk action** (one request for many entries; confirmed with 2 ids: response = array with one object per id, shared `approvalTimestamp`).
- Auth: only the `beaker.session.id` session cookie (same-origin); **no CSRF/token** in headers. Also sent: `x-requested-with: XMLHttpRequest`, `origin`, `referer` (the browser sets them itself from the content script).
- Ids in the body = time entry id (`timeentry_id` from GET).
- No comment on rejection (per decision Q3).
- Response (200, JSON): array with one object per id: `{approvalState, approvalAuthor, approvalTimestamp ("YYYY-MM-DD HH:MM:SS"), timeEntryId, canAccept, canReject}` (camelCase, unlike GET).
- States after the action: `ACCEPTED` (canAccept=false, canReject=true), `REJECTED` (canAccept=true, canReject=false). Consistent with `action`.
- Undo: no separate action; ACCEPTED↔REJECTED are switched directly (after REJECTED you can ACCEPT and vice versa). Returning to `OPEN` is impossible (confirmed in the UI: after the first action only ACCEPTED↔REJECTED toggling).
- Fixtures: `timesheet-approval-accept.json`, `timesheet-approval-reject.json` (request + response, anonymized).

## Open (for stage 02/03)
- Headers/CSRF for the API (assumed: same-origin cookie, no tokens).
- `approval` pagination (assumed: one response = the whole month).
- `state` values in GET: known `OPEN`, `ACCEPTED`, `REJECTED`.
- Semantics of the number of days in absences.
- Limit of `ids` per request — unknown (consider batches, e.g. 100). Error response (e.g. missing permissions) — unknown.
