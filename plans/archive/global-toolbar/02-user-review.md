# 02 User review (demo + Chrome)

## Goal
User accepts the global toolbar in demo mode and in Chrome on the intranet (AGENTS.md: UI changes are reviewed by the user).

## Scope
In: review in `demo.html` and in Chrome (work account) on both tabs.
Out: new features; fixes found here go back as a fix in 01 or a new stage.

## Decisions
- Q4: stage split 01 agent + 02 user review.

## Detailed plan
1. `npm run dev` → `demo.html`: toolbar above tabs (month, cog Settings at right), switch tabs, change month, open/close Settings, exclude a person; Time logged row order (Refresh, Clear data, Export CSV, Refreshed at right); Approval row (actions left, filters right); Clear data shows the in-panel dialog.
2. `npm run build`, reload extension in Chrome (work account session), open intranet, repeat on real data: Refresh on Time logged; Accept/Reject confirmation dialog on Approval.

## Acceptance criteria
- [ ] User confirms layout and behaviour in demo.
- [ ] User confirms Refresh works on Time logged in Chrome with real intranet data, and that Approval has no Refresh.
- [ ] User confirms the in-panel dialogs (Clear data, Accept/Reject many) look right.
- [ ] User confirms exclusions apply in Approval.

## Verification
User's explicit confirmation in chat.

## Depends on
01 (`done`)
