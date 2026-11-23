# 02 — Parser wpisów + klient zapisu

## Goal
Czysta logika (bez UI): parsowanie odpowiedzi `/api/times/approval` na listę wpisów z polami potrzebnymi do akceptacji, grupowanie per osoba z sumami billable/non-billable, oraz klient accept/reject wg ustaleń z etapu 01.

## Scope
- In: typ `ApprovalEntry` (id, personId, personName, date ISO, minutes, nonBillable, state, project, description, canAccept, canReject); parser `parseApprovalEntries`; `groupByPerson` + filtry billability/state; `fetchApproval(month)`, `acceptEntries(ids)`, `rejectEntries(ids)` przez `intranetUrl`/fetch z wykrywaniem wylogowania; obsługa częściowej porażki przy wielu wpisach.
- Out: UI; zmiana istniejącego `parseTimesheet` (zostaje dla „Time logged”).

## Decisions
- Q1, Q2, Q3, Q4, Q5

## Detailed plan
- `src/parsers/approval.ts` (+ rozszerzenie `timesheet.selectors.ts` o potrzebne kolumny) — parser kolumnowy jak `parseTimesheet`, `ParseError` przy brakującej kolumnie.
- `src/approval/model.ts` — grupowanie, sumy, filtry (`billability: all|billable|non`, `state: OPEN|all|…`).
- `src/approval/api.ts` — GET + zapis; jedyna droga przez `intranetUrl` (blokada originu); metoda zapisu (POST/PUT…) i body wg `fixtures/NOTES.md` §4; jeśli brak hurtu → sekwencyjnie/pula z limitem (`collector/pool.ts`), wynik `{ok: id[], failed: {id, error}[]}`.
- Rozszerzenie `fetchText`/nowy helper dla żądań z body, jeśli potrzebny (bez zmiany zachowania GET).

## Acceptance criteria
- [ ] `parseApprovalEntries` na obu fixture'ach: 138 + 26 wpisów, poprawne `nonBillable`, daty ISO, minuty
- [ ] Brakująca kolumna → `ParseError`
- [ ] `groupByPerson`: sumy billable/non-billable per osoba zgodne z fixture'ami; filtry billability i state działają
- [ ] `acceptEntries`/`rejectEntries` wysyłają request zgodny z fixture'ami 01 (URL, metoda, body, nagłówki) — test z mockiem fetch
- [ ] Częściowa porażka zwraca listę ok/failed; 401/403 → `LoggedOutError`
- [ ] Żądanie poza origin intranetu zablokowane
- [ ] Istniejące testy `src/parsers`, `src/collector` zielone

## Verification
`npx vitest run src/parsers src/approval`, potem `npx vitest run src/collector`.

## Files
- `src/parsers/approval.ts`, `src/parsers/timesheet.selectors.ts`
- `src/approval/model.ts`, `src/approval/api.ts`, `src/approval/*.test.ts`
- `src/collector/http.ts` (ewentualny helper zapisu)
- `src/domain/types.ts`

## Depends on
01 (`done`)
