# 03 — Parsery HTML i testy

## Goal
Czyste funkcje zamieniające HTML stron intranetu w typowane dane: lista podopiecznych, urlopy, godziny per dzień; pokryte testami na próbkach z etapu 01.

## Scope
In:
- Model domenowy: `Person { id, name, profileUrl }`, `Leave { personId, from, to, type }`, `TimeEntry { personId, date, hours }` (sumowane per dzień)
- Parsery `parseTeamList(html)`, `parseLeaves(html)`, `parseTimesheet(html, year, month)` oparte na `DOMParser`
- Selektory w jednym module per strona (łatwa naprawa po zmianie layoutu intranetu)
- Normalizacja formatów godzin/dat wg `fixtures/NOTES.md`
- Czytelne błędy parsowania (`ParseError` z nazwą strony i brakującym elementem) zamiast cichych pustych wyników

Out:
- Pobieranie stron (`fetch`), storage, UI

## Decisions
Q3, Q9

## Acceptance criteria
- [x] Każdy parser ma testy Vitest na każdej próbce z `fixtures/`
- [x] Testy obejmują: urlop wielodniowy, praca w weekend/święto, dzień z kilkoma wpisami (suma), pusty miesiąc
- [x] HTML bez oczekiwanej tabeli → `ParseError`, test to potwierdza
- [x] Brak zależności od DOM przeglądarki poza `DOMParser` (testy w `happy-dom`/`jsdom`)

## Verification
`npx vitest run src/parsers`

## Files / materials
`src/domain/types.ts`, `src/parsers/*.ts`, `src/parsers/*.test.ts`, `fixtures/*.html`, `fixtures/NOTES.md`

## Depends on
01 (`done`), 02 (`done`)
