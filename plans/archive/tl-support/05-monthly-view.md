# 05 — Widok miesięczny, święta, ustawienia

## Goal
Panel pokazuje siatkę miesiąca (podopieczni × dni) z godzinami, urlopami, weekendami i świętami PL, z sumami per osoba; ustawienia pozwalają korygować listę podopiecznych i dodać własne dni wolne.

## Scope
In:
- Moduł świąt PL: stałe + ruchome (Wielkanoc, Poniedziałek Wielkanocny, Zielone Świątki, Boże Ciało) liczone algorytmicznie; + 24.12 od 2025 r.; własne dni wolne z ustawień
- Siatka: wiersze = osoby, kolumny = dni miesiąca; komórka = godziny; kolory: urlop, weekend, święto; godziny w dzień wolny wyróżnione osobno (nie jako błąd)
- Kolumny podsumowania per osoba: suma godzin, norma miesiąca (dni robocze × 8h − urlopy), różnica, dni urlopu
- Przełącznik miesiąca (← →) czytający snapshoty z IndexedDB; „brak danych — Odśwież” gdy brak snapshotu
- Legenda kolorów, data ostatniego odświeżenia
- Ustawienia (`chrome.storage.local`): wykluczenie/dodanie osób do listy, własne dni wolne

Out:
- Trendy między miesiącami, alerty, powiadomienia
- Edycja danych w intranecie

## Decisions
Q6, Q7, Q9

## Acceptance criteria
- [x] Testy świąt: poprawne daty dla 2025, 2026, 2027 (w tym ruchome)
- [x] Testy obliczeń normy/różnicy: miesiąc ze świętem, z urlopem, z pracą w weekend
- [x] Testy komponentu siatki: klasy dla urlop/weekend/święto/praca w dzień wolny
- [x] Wykluczona w ustawieniach osoba nie pojawia się w siatce; dodana ręcznie — pojawia się
- [x] Siatka czytelna dla ~15 osób w panelu (przewijanie poziome, przyklejona kolumna z nazwiskami)

## Verification
`npx vitest run src/calendar src/ui`; użytkownik ogląda widok na danych z fixture'ów (tryb demo z `npm run dev`).

## Files / materials
`src/calendar/holidays-pl.ts`, `src/calendar/norm.ts`, `src/ui/MonthGrid.tsx`, `src/ui/Settings.tsx`, `src/settings/`

## Depends on
04 (`done`)
