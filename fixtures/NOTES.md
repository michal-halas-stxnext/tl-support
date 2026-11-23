# Intranet — notatki z rozpoznania (etap 01)

Origin: `https://intranet.stxnext.pl`. Auth: sesja przeglądarki (cookie); nagłówki/CSRF do potwierdzenia (patrz "Otwarte").

## 1. Lista podopiecznych
- Strona: `/user/employees_list_view` (async, dane z API)
- Dane: `GET /api/intranet4/users/universal?active=true`
- Odpowiedź: tablica obiektów (`id` string, `name`, `contact`, `department`, `roles`, `teams[{id,name}]`, `lineManagerId`, `company`, `isActive`, `isEmployee`, …)
- Filtr Team = `JS Team 04`: **po stronie klienta** (API zwraca wszystkich aktywnych, ~480 osób). Filtrować po `teams[].name` (osoba może mieć kilka teamów). Id teamu w absences: 1180.
- Fixture: `users-universal.json` (10 osób JS Team 04 + 5 innych, zanonimizowane)

## 2. Absences (tabela zbiorcza)
- Strona: `GET /employees/table/absences?year=2026&team=1180&location=0&department=0` — filtrowanie **po stronie serwera** (zmiana filtra = przeładowanie, pełny HTML; brak osobnego API). `team`: 0 = All, -1 = My teams.
- Dane w inline `<script>`: `var data = {...};` (przed `generateTable(data)`). Tabele DOM buduje JS → parser czyta ten JSON, nie DOM.
- `data`: `users[{id,name,leave_mandated,leave_used,location_id}]`, `locations[]`, `year`, `holidays[]` (`YYYY-MM-DD`), `absences`, `absencesSum`, `absencesMonths`, …
- `absences[userId]["YYYY-MM-DD"] = [liczba_dni, typ, notatka]` — zakres od daty początkowej na N dni. Typ zawsze `bezplatny` → ignorować (nie ma innych typów). Notatka = wolny tekst, nieistotna. Czy N = dni kalendarzowe czy robocze: ustalić w etapie 03 na danych.
- Szczegóły osoby: `/employees/list/absence?user_id=<id>&limit=200&date_start=DD-MM-YYYY&date_end=DD-MM-YYYY`
- Id zalogowanego: `Globals.user.id` w inline script stron intranetu.
- Fixture: `absences-js-team-04.html` (minimalny: sam inline script, zanonimizowany)

## 3. Timesheet approval
- Strona: `/times/approval`
- Dane: `GET /api/times/approval?line_manager=<id>&month=<YYYY-MM-01>&billability=<ALL|BILLABLE|NON_BILLABLE>&state=<ALL|...>`
- `line_manager` = koordynator (w UI filtr "koordynator", domyślnie zalogowany). Brak filtra Team — zakres osób wyznacza koordynator.
- `billability=ALL` zwraca oba rodzaje (138 billable + 26 non-billable = 164 = `total_rows`); rozróżnienie: `project_non_billable`. Liczą się tylko godziny billable; non-billable pokazać osobno.
- Odpowiedź: `{total_rows, columns[], rows[][]}` — wiersze pozycyjne wg `columns`. Pola: `user_id`, `user_name`, `timeentry_date` (`DD.MM.YYYY`), `timeentry_time` (`HH:MM`, co 15 min, `00:15`…`10:30`), `project_non_billable` (bool), `timeentry_approval_state` (znane: `OPEN`), `timeentry_description` (wieloliniowy), `line_manager_id`, `department_name`, …
- Obserwacje: do 10 wpisów na osobę/dzień, suma dnia może > 8 h; są wpisy z przyszłości (bench na kolejne dni); w próbkach brak weekendów.
- Fixtures: `timesheet-approval-billable.json` (138 wierszy, 9 osób), `timesheet-approval-nonbillable.json` (26 wierszy, 3 osoby); zanonimizowane (nazwy klientów/projektów zastąpione).

## Otwarte (do etapu 02/03)
- Nagłówki/CSRF dla API (zakładane: same-origin cookie, bez tokenów).
- Paginacja `approval` (zakładane: jedna odpowiedź = cały miesiąc).
- Wartości `state` inne niż `OPEN`.
- Semantyka `liczba_dni` w absences.
