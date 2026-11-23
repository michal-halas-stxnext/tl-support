# AGENTS.md — TL Support

Rules for AI agents working in this repo. Sourced from the project, its plans and earlier sessions (2026-11-23). Chat with the user follows the user's global instructions (reply in the user's language, be concise).

## Language
- Everything in the repo is English: UI strings, labels, buttons, statuses, errors, confirms, aria-labels, CSV headers, manifest description, code comments, README, `fixtures/NOTES.md`, commit messages, new plan files.
- Applies to future features too.
- Exception: chat replies follow the user's language.

## UI
- Any month picker uses the shared `src/ui/MonthNav.tsx` (←, label, →, "Today" button). Disabled, not hidden, when already on the current month. Do not reimplement.
- Confirmations, alerts and similar prompts use the in-panel dialog (`useDialog()` from `src/ui/Dialog.tsx`: `confirm`, `alert`), never native `confirm()`/`alert()`/`prompt()`. Styled with the plugin's tokens; Escape closes only the dialog. Applies to future features too.
- Accept tab (timesheet approval): Non-billable is the default filter.
- Only Billable hours count in totals. Non-billable is shown separately.
- Settings popup: closes on outside click or Escape. Escape must close only that popup, not the whole TL panel.
- Panel fullscreen: an icon next to Close toggles fullscreen ("Close fullscreen" when active). Panel keeps inset margins matching the open button. The TL button remembers fullscreen state. Escape in fullscreen returns to normal mode.
- Calendar grid: holiday and weekend cells must stay visually distinct from regular cells in both odd and even rows. Keep custom backgrounds and leave (absence) identification visible on hover. Same cell size; differ by colour and tooltip.
- UI changes: user reviews them in demo mode (`npm run dev` → `demo.html`) and in Chrome before they are accepted.

## Data and domain
- Intranet (`https://intranet.stxnext.pl`) has no public API. Data comes from HTML/JSON of intranet pages fetched with the user's session. Constants in `src/config.ts`.
- Nothing leaves the browser: storage is IndexedDB (local).
- Team filter `JS Team 04`:
  - users list: client-side (`teams[].name`).
  - absences: server-side (`team=1180`).
- Timesheet approval: `billability=ALL` returns both kinds. Distinguish by `project_non_billable`.
- Approve/reject requests: max 100 ids per request. Any response other than 200 is an error.
- Public holidays: Polish statutory holidays, including movable ones (Easter, Corpus Christi). User can add custom days off in settings.
- Working hours on days off are allowed and shown.

## Plans and workflow
- Plans live in `plans/<name>/`: `README.md` plus stage files `NN-*.md` (and `*.brief.md`).
- Planning: use the `_mapit` skill. Ask one question at a time.
- "Start stage N": execute only that stage.
- "Approved, don't start": approval only; do not start work.
- Closing a plan ("close the plan" / "archive it") = move it to `plans/archive/<name>/`, then PR if asked.
- Intranet samples: raw captures go to `fixtures/raw/` (gitignored). Anonymize before any file goes to `fixtures/`. Delete raw captures when the stage closes.
- `.history/` is gitignored but holds raw, non-anonymized data. Never commit it, never copy it into fixtures.

## Browser and live testing
- The user has two Chrome accounts (work and private) open at once. Before intranet browser work, confirm which profile/session is active. Intranet work must use the work account session.
- Claude in Chrome: use only when the user asks for it or the task needs it; never use the user's accounts beyond what the task needs.

## Build, test, git
- Build: `npm run build` (tsc + vite). `build:safari` needs full Xcode; do not run it without Xcode.
- Tests: after a change, run the narrowest test (`npx vitest run <path>`). Full `npm test` only when asked. Never claim tests pass without running them; report real output on failure. Do not weaken or delete tests to pass.
- Vite config: import with file extensions (e.g. `./manifest.config.ts`). Extensionless imports trigger a `configLoader: 'native'` warning.
- Git: use `git switch`, not `git checkout`.
- Commit only when the user asks ("make a commit").
- Push, PR creation, force operations, schema/migration changes, file deletion: ask first, every time.
- After a PR is created, enable Auto-fix only when the user asks.
- Never touch `.env` files. Never commit secrets.
