# Brief 01 — Rozpoznanie endpointów accept/reject (część agenta)

Kontekst: wtyczka Chrome MV3 TL Support (`/Users/michal.halas@stxnext.pl/projects/tl-support`). Obecnie czyta tylko `GET /api/times/approval` (opis: `fixtures/NOTES.md` sekcja 3, fixtures `fixtures/timesheet-approval-*.json`). Plan: `plans/timesheet-approval/`, spec: `01-write-api-recon.md`.

Zadanie (po dostarczeniu przez użytkownika surowych requestów w `fixtures/raw/` lub w czacie):
1. Dopisz do `fixtures/NOTES.md` sekcję „4. Accept/reject”: URL, metoda, body, nagłówki (CSRF?), odpowiedź sukcesu/błędu, akcja hurtowa, stany po akcji, cofanie.
2. Utwórz zanonimizowane `fixtures/timesheet-approval-accept.json` i `fixtures/timesheet-approval-reject.json` (`{request:{method,path,headers(bez sekretów),body}, response:{status,body}}`). Id/nazwy zastąp jak w istniejących fixture'ach (`user-0xx`, `te-N`, „Osoba A”).
3. Zaktualizuj sekcję „Otwarte”.

Nie zmieniaj: kodu w `src/`. Ograniczenia: bez commitów, bez `.env`, żadnych cookies/tokenów/danych osobowych w plikach poza `fixtures/raw/`; nie wykonuj żadnych requestów do intranetu.

Done: kryteria z spec 01 (poza potwierdzeniem użytkownika) spełnione.
