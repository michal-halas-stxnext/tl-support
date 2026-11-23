# 04 — Kolektor i storage

## Goal
Przycisk „Odśwież” w panelu pobiera w tle wszystkie potrzebne podstrony intranetu dla wybranego miesiąca, parsuje je i zapisuje snapshot do IndexedDB; dane można wyczyścić i wyeksportować do CSV.

## Scope
In:
- Kolektor: `fetch` z sesją użytkownika (`credentials: 'include'`, same-origin z content scriptu) → parsery z etapu 03
- Kolejność: lista podopiecznych → per osoba urlopy + timesheet miesiąca
- Limit tempa: maks. N równoległych zapytań (domyślnie 2) + opóźnienie między nimi; konfigurowalne w `src/config.ts`
- Postęp w panelu (`x / y stron`), anulowanie, raport błędów per osoba (błąd jednej osoby nie przerywa całości)
- Wykrycie wylogowania (przekierowanie na login) → komunikat „Zaloguj się do intranetu”
- IndexedDB (np. `idb`, mała biblioteka — wymaga zgody na zależność): snapshot per miesiąc `{ month, fetchedAt, people, leaves, entries }`, historia zachowana
- „Wyczyść dane” (z potwierdzeniem) i eksport CSV miesiąca

Out:
- Automatyczne / harmonogramowe odświeżanie
- Wysyłka danych poza przeglądarkę
- Widok siatki (etap 05)

## Decisions
Q4, Q5

## Acceptance criteria
- [x] Testy kolektora z zamockowanym `fetch` (próbki z `fixtures/`): pełny przebieg, błąd jednej osoby, wylogowanie, limit równoległości
- [x] Testy storage (`fake-indexeddb`): zapis, odczyt, nadpisanie snapshotu tego samego miesiąca, zachowanie innych miesięcy, czyszczenie
- [x] Eksport CSV: test formatu (nagłówki, separator, kodowanie UTF-8 z BOM dla Excela)
- [x] Żadne żądanie sieciowe nie wychodzi poza origin intranetu (test/asercja w kodzie)

## Verification
`npx vitest run src/collector src/storage src/export`

## Files / materials
`src/collector/`, `src/storage/`, `src/export/`, `src/ui/RefreshBar.tsx`

## Depends on
03 (`done`)
