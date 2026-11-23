# 04 — Test na żywym intranecie

## Goal
Potwierdzić na prawdziwych danych, że akceptacja i odrzucenie z wtyczki działają i są zgodne z widokiem intranetu.

## Scope
- In: build, załadowanie `dist/`, akceptacja 1 wpisu, odrzucenie 1 wpisu (taki, który i tak ma być odrzucony), akceptacja całej osoby, porównanie z `/times/approval`.
- Out: zmiany kodu (znalezione problemy → gaps / nowy etap).

## Decisions
- Q1, Q6

## Detailed plan (checklista użytkownika)
1. `npm run build`, przeładuj wtyczkę w `chrome://extensions`.
2. Zakładka „Akceptowanie”, bieżący miesiąc: liczba wpisów OPEN i sumy zgadzają się z `/times/approval`.
3. Filtr Non-billable pokazuje tylko non-billable.
4. Akceptuj 1 wpis → po odświeżeniu znika z OPEN; w intranecie stan zaakceptowany.
5. Odrzuć 1 wpis → stan odrzucony w intranecie.
6. „Akceptuj wszystko” dla 1 osoby → potwierdzenie → wszystkie jej wpisy zaakceptowane.
7. Wyloguj się → komunikat „Zaloguj się”.

## Acceptance criteria
- [ ] Liczby/sumy zgodne z intranetem
- [ ] Akceptacja pojedynczego wpisu działa
- [ ] Odrzucenie działa
- [ ] Akceptacja całej osoby działa
- [ ] Wylogowanie wykrywane
- [ ] Użytkownik potwierdza

## Verification
Potwierdzenie użytkownika punkt po punkcie.

## Depends on
03 (`done`)
