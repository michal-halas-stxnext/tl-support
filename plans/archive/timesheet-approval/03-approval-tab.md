# 03 — Zakładka UI „Akceptowanie”

## Goal
Zakładka w panelu: lista osób z godzinami do akceptacji w wybranym miesiącu, rozwijana do wpisów, z akceptacją/odrzuceniem per osoba i per zaznaczone wpisy.

## Scope
- In: wpis w rejestrze `TABS`; nawigacja miesiąca ←/→; filtry billability (Wszystkie/Billable/Non-billable) i stanu (domyślnie OPEN); wiersz osoby: imię, suma billable, suma non-billable, liczba wpisów, „Akceptuj wszystko”, „Odrzuć wszystko”; rozwinięcie: wpisy (data, czas, projekt, opis skrócony, badge non-billable, stan, checkbox); akcja na zaznaczonych; potwierdzenie dla akcji >1 wpisu; stany ładowania/błędu/wylogowania w zarezerwowanej linii statusu; odświeżenie po akcji; wynik częściowej porażki widoczny; wersja demo na fixture'ach.
- Out: komentarz przy odrzuceniu (Q3); współdzielenie miesiąca z „Time logged”; zapis do IndexedDB.

## Decisions
- Q2, Q3, Q4, Q5; README → Assumptions (potwierdzenie hurtu, `can_accept`/`can_reject`)

## Acceptance criteria
- [ ] Tab „Akceptowanie” widoczny obok „Time logged”, aktywny tab zapamiętywany (istniejący mechanizm)
- [ ] Domyślnie widać tylko wpisy OPEN bieżącego miesiąca; zmiana filtrów/miesiąca zmienia listę
- [ ] Sumy billable i non-billable per osoba poprawne (test na fixture'ach)
- [ ] „Akceptuj wszystko” osoby → potwierdzenie → wywołanie `acceptEntries` z id widocznych wpisów osoby (wg filtrów) → odświeżenie
- [ ] Zaznaczenie wpisów + akcja → wywołanie z zaznaczonymi id
- [ ] Przyciski nieaktywne dla wpisów bez `can_accept`/`can_reject`
- [ ] Błąd/wylogowanie/częściowa porażka komunikowane bez rozsuwania layoutu
- [ ] Demo (`demo.html`) pokazuje zakładkę na fixture'ach z mockiem zapisu
- [ ] `npm run build` OK

## Verification
`npx vitest run src/ui`, `npm run build`, przegląd demo przez użytkownika.

## Files
- `src/ui/ApprovalView.tsx` (+ test), `src/ui/Tabs.tsx`, `src/ui/styles.ts`, `src/demo/main.tsx`

## Depends on
02 (`done`)
