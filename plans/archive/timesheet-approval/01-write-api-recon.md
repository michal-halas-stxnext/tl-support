# 01 — Rozpoznanie endpointów accept/reject

## Goal
Ustalić, jak intranet akceptuje i odrzuca wpisy godzin (URL, metoda, body, nagłówki/CSRF, odpowiedź, akcja hurtowa), i zapisać to w `fixtures/NOTES.md` z zanonimizowanymi fixture'ami.

## Scope
- In: accept i reject pojedynczego wpisu; czy jest endpoint hurtowy (wiele `timeentry_id`); wymagane nagłówki/CSRF; odpowiedź sukcesu i błędu; wartości `timeentry_approval_state` po akcji (np. ACCEPTED/REJECTED); czy da się cofnąć akcję.
- Out: implementacja; masowe akcje na prawdziwych danych.

## Decisions
- Q1, Q3

## Detailed plan
1. (user) Otwórz `/times/approval`, DevTools → Network (Preserve log). Zaakceptuj 1 wpis, odrzuć 1 wpis (jeśli intranet pozwala — na wpisie, który i tak trzeba odrzucić lub da się cofnąć), zaznacz 2+ wpisy i zaakceptuj hurtowo.
2. (user) Dla każdego requestu: „Copy as cURL” albo zapis HAR do `fixtures/raw/` (gitignored). Bez cookies/tokenów w wklejanej treści.
3. (agent) Z surowego materiału: opis w `fixtures/NOTES.md` (sekcja „4. Accept/reject”), zanonimizowane fixtures `fixtures/timesheet-approval-accept.json` (request + response), analogicznie reject.
4. (agent) Uzupełnij „Otwarte”: znane wartości `state`, CSRF.

## Acceptance criteria
- [ ] `fixtures/NOTES.md` opisuje accept i reject: URL, metodę, body, wymagane nagłówki, odpowiedź sukcesu
- [ ] Wiadomo, czy istnieje akcja hurtowa (i jej format) albo że trzeba wysyłać po jednym
- [ ] Znane wartości `timeentry_approval_state` po akceptacji i odrzuceniu
- [ ] Wiadomo, czy akcję można cofnąć (i jak)
- [ ] Fixtures zanonimizowane, bez cookies/tokenów
- [ ] Użytkownik potwierdza poprawność opisu

## Verification
Przegląd `fixtures/NOTES.md` + fixture'ów przez użytkownika; `grep -i "cookie\|token\|csrf" fixtures/*.json` bez wartości sekretów.

## Files
- `fixtures/NOTES.md`
- `fixtures/timesheet-approval-accept.json`, `fixtures/timesheet-approval-reject.json` (nowe)
- `fixtures/raw/` (surowe, gitignored)

## Depends on
—
