# TL Support

Wtyczka Chrome (MV3) dla Koordynatora zespołu. Origin intranetu: `src/config.ts`.

## Skrypty
- `npm run dev` — serwer deweloperski (HMR), ładuj `dist/` jako unpacked
- `npm run build` — build do `dist/`
- `npm test` — Vitest

## Instalacja (unpacked)
1. `npm install && npm run build`
2. Chrome → `chrome://extensions` → włącz „Tryb dewelopera”
3. „Załaduj rozpakowane” → wybierz katalog `dist/`
4. Otwórz intranet — w prawym dolnym rogu pojawi się przycisk „TL”.
