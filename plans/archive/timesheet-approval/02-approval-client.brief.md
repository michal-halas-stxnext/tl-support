# Brief 02 — Parser wpisów + klient zapisu

Repo: `/Users/michal.halas@stxnext.pl/projects/tl-support` (Chrome MV3, Preact, Vitest, TS). Plan: `plans/timesheet-approval/README.md`, spec: `plans/timesheet-approval/02-approval-client.md` (pełna treść poniżej obowiązuje).

Kontekst:
- API odczytu: `GET /api/times/approval?line_manager=<id>&month=<YYYY-MM-01>&billability=ALL&state=<…>` → `{total_rows, columns[], rows[][]}` (wiersze pozycyjne). Opis: `fixtures/NOTES.md` §3; zapis (accept/reject): §4 + `fixtures/timesheet-approval-accept.json`, `-reject.json`.
- Wzorce do naśladowania: `src/parsers/timesheet.ts` (parser kolumnowy, `ParseError`), `src/parsers/timesheet.selectors.ts`, `src/collector/http.ts` (`intranetUrl`, `fetchText`, `LoggedOutError`), `src/collector/pool.ts`, `src/collector/collect.ts:96` (budowa URL approval).

Spec:
- Typ `ApprovalEntry` w `src/domain/types.ts`: id, personId, personName, date (ISO), minutes, nonBillable, state, project, description, canAccept, canReject.
- `src/parsers/approval.ts`: `parseApprovalEntries(input)`; brak kolumny → `ParseError`; `user_id` może być liczbą → string.
- `src/approval/model.ts`: `groupByPerson(entries)` z sumami billable/non-billable minut; filtry `billability: 'all'|'billable'|'non'`, `state: 'OPEN'|'all'|<inne z §4>`.
- `src/approval/api.ts`: `fetchApproval(fetchFn, {lineManagerId, month})`, `acceptEntries(fetchFn, ids)`, `rejectEntries(fetchFn, ids)` wg §4; bez hurtu w API → pula z limitem; wynik `{ok, failed}`; 401/403 → `LoggedOutError`; wszystko przez `intranetUrl`.
- Kryteria: patrz spec (checkboxy).

Nie zmieniaj: `parseTimesheet` i jego testów, UI, `manifest.config.ts` (chyba że zapis wymaga uprawnień — wtedy zatrzymaj się i zgłoś).
Ograniczenia: bez commitów, bez `.env`, bez nowych zależności, bez requestów do prawdziwego intranetu (tylko mock fetch).
Done: `npx vitest run src/parsers src/approval src/collector` zielone, kryteria spełnione.
