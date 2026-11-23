# 01 — Rozpoznanie intranetu

## Goal
Zebrać materiał wejściowy do parserów: zanonimizowane próbki HTML trzech typów stron intranetu i opis ich adresów URL, tak żeby dalsze etapy dało się rozwijać offline.

## Scope
In:
- Origin intranetu (np. `https://intranet.<firma>`) i wzorce URL dla: listy podopiecznych, urlopów osoby, timesheetu osoby za miesiąc (jakie parametry: id osoby, rok, miesiąc)
- Próbki HTML (Ctrl+S → „Strona internetowa, tylko HTML” lub `view-source`) dla każdego typu strony, min. 2 warianty timesheetu (pełny miesiąc, miesiąc z urlopem i/lub pracą w weekend)
- Anonimizacja: imiona/nazwiska/e-maile/ID zastąpione placeholderami (`Osoba A`, `user-001`), struktura HTML bez zmian
- Notatka o paginacji, formatach dat i godzin (np. `7:30` vs `7.5`), typach urlopów

Out:
- Pisanie kodu
- Próbki z danymi osobowymi w niezanonimizowanej postaci

## Decisions
Q3, Q4, Q9

## Detailed plan
1. Na każdej z 3 stron zapisz URL (z placeholderami w miejscu ID) i kroki nawigacji, jak do niej dojść.
2. Zapisz HTML stron do `fixtures/raw/` (lokalnie, nie commitować).
3. Zanonimizuj do `fixtures/<typ>-<wariant>.html` (find & replace; agent może pomóc skryptem w etapie 03, jeśli wolisz).
4. Uzupełnij `fixtures/NOTES.md`: URL-e, parametry, formaty, typy urlopów, paginacja, czy strona wymaga dodatkowych nagłówków / tokenów CSRF.

## Acceptance criteria
- [x] `fixtures/NOTES.md` zawiera origin, wzorce URL 3 typów stron i opis parametrów
- [x] Min. 1 próbka listy podopiecznych, 1 urlopów, 2 timesheetu w `fixtures/`
- [x] Próbki nie zawierają prawdziwych danych osobowych (potwierdzenie użytkownika)
- [x] Opisane formaty dat/godzin i typy urlopów

## Verification
Użytkownik potwierdza kompletność i anonimizację; agent na starcie etapu 03 sprawdza, czy próbki zawierają tabele z potrzebnymi danymi.

## Files / materials
- `fixtures/NOTES.md`, `fixtures/*.html`, `fixtures/raw/` (tylko lokalnie)

## Depends on
—
