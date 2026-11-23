# TL Support

Wtyczka Chrome (MV3) dla Koordynatora zespołu (Team Leadera). Intranet nie ma API, więc wtyczka wstrzykuje panel w stronę intranetu, pobiera HTML podstron z sesją użytkownika i pokazuje zagregowany obraz podopiecznych.

## Co robi
- **Time logged** — miesięczna siatka godzin per osoba per dzień; urlopy, weekendy i święta PL wyróżnione.
- **Approval** — akceptacja/odrzucanie wpisów (billable i non-billable) per osoba lub per wpis, przez API intranetu.
- **Ustawienia** — wykluczenia/dodatkowe osoby, własne dni wolne, dzienna norma godzin.
- Dane trzymane lokalnie w IndexedDB (nic nie opuszcza komputera); „Export CSV”, „Clear data”.

Konfiguracja (origin intranetu, team, limity zapytań): `src/config.ts`.

## Użycie
1. `npm install && npm run build`
2. Chrome → `chrome://extensions` → włącz „Tryb dewelopera” → „Załaduj rozpakowane” → `dist/`
3. Otwórz intranet → przycisk „TL” w prawym dolnym rogu → panel → „Refresh”.

## Skrypty
- `npm run dev` — serwer deweloperski (HMR); tryb demo bez intranetu: `demo.html`
- `npm run build` — build do `dist/`
- `npm test` — Vitest
