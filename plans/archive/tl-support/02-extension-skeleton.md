# 02 — Szkielet wtyczki

## Goal
Działająca wtyczka Chrome (MV3) ładowana jako unpacked, która na stronach intranetu wstrzykuje przycisk w rogu; klik otwiera/zamyka pusty panel w Shadow DOM.

## Scope
In:
- Projekt TS + Vite + CRXJS + Preact + Vitest w katalogu głównym `tl-support/`
- `manifest.json`: content script i `host_permissions` tylko dla originu intranetu (z `fixtures/NOTES.md`; do tego czasu placeholder w jednym pliku konfiguracyjnym)
- Content script: pływający przycisk (prawy dolny róg), panel w Shadow DOM (izolacja stylów), stan otwarty/zamknięty
- Skrypty `dev`, `build`, `test`; README z instrukcją instalacji unpacked

Out:
- Pobieranie i parsowanie danych, storage, widoki danych
- Publikacja w Chrome Web Store

## Decisions
Q8

## Acceptance criteria
- [x] `npm run build` tworzy `dist/` ładowalny jako unpacked bez błędów w `chrome://extensions`
- [x] Na stronie intranetu widoczny przycisk; klik otwiera/zamyka panel
- [x] Style intranetu nie wpływają na panel i odwrotnie (Shadow DOM)
- [x] Wtyczka nie aktywuje się na innych domenach
- [x] `npm test` przechodzi (min. 1 test smoke komponentu panelu)

## Verification
`npm run build`, `npm test`; użytkownik ładuje `dist/` i potwierdza przycisk/panel na intranecie.

## Files / materials
`package.json`, `vite.config.ts`, `manifest.config.ts`, `src/content/`, `src/ui/`, `src/config.ts`

## Depends on
01 (`done`) — origin intranetu z `fixtures/NOTES.md`
