# TL Support

Wtyczka przeglądarkowa (MV3: Chrome, Opera, Edge/Brave, Firefox, Safari) dla Koordynatora zespołu (Team Leadera). Intranet nie ma API, więc wtyczka wstrzykuje panel w stronę intranetu, pobiera HTML podstron z sesją użytkownika i pokazuje zagregowany obraz podopiecznych.

## Co robi
- **Time logged** — miesięczna siatka godzin per osoba per dzień; urlopy, weekendy i święta PL wyróżnione.
- **Approval** — akceptacja/odrzucanie wpisów (billable i non-billable) per osoba lub per wpis, przez API intranetu.
- **Ustawienia** — wykluczenia/dodatkowe osoby, własne dni wolne, dzienna norma godzin.
- Dane trzymane lokalnie w IndexedDB (nic nie opuszcza komputera); „Export CSV”, „Clear data”.

Konfiguracja (origin intranetu, team, limity zapytań): `src/config.ts`.

## Wspierane przeglądarki

| Przeglądarka | Build | Katalog | Status |
|---|---|---|---|
| Chrome, Opera, Edge, Brave (Chromium) | `npm run build` | `dist/` | ten sam build dla wszystkich |
| Firefox 115+ | `npm run build:firefox` | `dist-firefox/` | manifest z `browser_specific_settings.gecko` (id `tl-support@stxnext.pl`) |
| Safari (macOS) | `npm run build:safari` | `dist-safari/` | projekt Xcode generowany z `dist/`; wymaga Xcode |

Kod używa tylko `chrome.storage.local` (działa we wszystkich trzech silnikach), więc różnice są wyłącznie w manifeście i sposobie instalacji.

## Instalacja (tryb deweloperski)
Najpierw: `npm install`.

### Chrome / Opera / Edge / Brave
1. `npm run build`
2. Otwórz stronę rozszerzeń: `chrome://extensions` (Opera: `opera://extensions`, Edge: `edge://extensions`, Brave: `brave://extensions`).
3. Włącz „Tryb dewelopera” → „Załaduj rozpakowane” → wskaż `dist/`.

### Firefox
1. `npm run build:firefox`
2. Otwórz `about:debugging#/runtime/this-firefox` → „Załaduj tymczasowy dodatek…” → wskaż `dist-firefox/manifest.json`.
3. Dodatek znika po restarcie Firefoksa. Trwała instalacja wymaga podpisu przez AMO (addons.mozilla.org, kanał „unlisted”).
4. Jeśli panel nie pojawia się, sprawdź uprawnienia dodatku do intranetu: `about:addons` → TL Support → Uprawnienia.

### Safari (macOS)
Wymaga pełnego Xcode (nie samych Command Line Tools) i `xcode-select` wskazującego na Xcode.
1. `npm run build:safari` — buduje `dist/` i generuje projekt w `dist-safari/` przez `safari-web-extension-converter`.
2. Otwórz wygenerowany `.xcodeproj` w Xcode → wybierz schemat „TL Support (macOS)” → Run.
3. Safari → Ustawienia → Zaawansowane → „Pokaż menu Programowanie”; Programowanie → „Zezwalaj na niepodpisane rozszerzenia” (opcja resetuje się po restarcie Safari).
4. Safari → Ustawienia → Rozszerzenia → włącz TL Support i przyznaj dostęp do intranetu („Zawsze zezwalaj na tej stronie”).
5. Dystrybucja poza własnym Makiem wymaga konta Apple Developer.

## Użycie
1. Zainstaluj wtyczkę (patrz wyżej).
2. Otwórz intranet → przycisk „TL” w prawym dolnym rogu → panel → „Refresh”.

## Znane ograniczenia
- Firefox i Safari: nie przetestowane na żywo z intranetem; loader content scriptu generowany przez `@crxjs/vite-plugin` może wymagać poprawek.
- Safari: `build:safari` nie był uruchamiany na maszynie bez Xcode.
- Dane (IndexedDB, ustawienia) są osobne w każdej przeglądarce i profilu.

## Skrypty
- `npm run dev` — serwer deweloperski (HMR); tryb demo bez intranetu: `demo.html`
- `npm run build` — build do `dist/` (Chromium)
- `npm run build:firefox` — build do `dist-firefox/`
- `npm run build:safari` — build + projekt Xcode w `dist-safari/`
- `npm test` — Vitest
