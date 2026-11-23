# Brief 03 — Zakładka UI „Akceptowanie”

Repo: `/Users/michal.halas@stxnext.pl/projects/tl-support` (Preact, Vitest + testing-library, CSS w `src/ui/styles.ts`). Plan: `plans/timesheet-approval/README.md`, spec: `plans/timesheet-approval/03-approval-tab.md` (obowiązuje w całości).

Kontekst:
- Rejestr tabów: `src/ui/Tabs.tsx` (`TABS` — nowy tab = jeden wpis). Wzorzec widoku i nawigacji miesiąca: `src/ui/MonthView.tsx` (props z wstrzykiwanymi zależnościami do testów, tryb `demo`), statusy: `src/ui/RefreshBar.tsx`. Zasady layoutu z planu `plans/archive/ui-ux/README.md` (Q3: statusy w zarezerwowanej linii, bez rozsuwania).
- Logika z etapu 02: `src/parsers/approval.ts`, `src/approval/model.ts`, `src/approval/api.ts`. Id koordynatora: jak w `src/collector/collect.ts`.

Spec (skrót, szczegóły w spec 03): `ApprovalView` z wstrzykiwalnymi `fetchApproval`/`acceptEntries`/`rejectEntries`; filtry billability + stan (domyślnie OPEN); lista osób z sumami i akcjami; rozwinięcie do wpisów z checkboxami; potwierdzenie dla >1 wpisu; odrzucenie bez komentarza; odświeżenie po akcji; obsługa `{ok, failed}` i `LoggedOutError`; demo na fixture'ach z mockiem zapisu.

Nie zmieniaj: `MonthView`, `MonthGrid`, logiki z 02 (poza bugfixem zgłoszonym w raporcie).
Ograniczenia: bez commitów, bez `.env`, bez nowych zależności, bez requestów do prawdziwego intranetu.
Done: `npx vitest run src/ui` i `npm run build` zielone, kryteria spec 03 spełnione (poza przeglądem użytkownika).
