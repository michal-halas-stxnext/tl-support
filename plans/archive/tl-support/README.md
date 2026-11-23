# TL Support — wtyczka Chrome dla Koordynatora zespołu
Goal: Wtyczka Chrome wstrzykiwana w intranet (przycisk w rogu → panel), która zbiera dane z ekranów intranetu (brak API) i pokazuje Koordynatorowi zagregowany obraz podopiecznych: listę, urlopy, zarejestrowany czas pracy w miesiącu.
Planning: complete
Plan: closed 2026-11-23
Status: MVP zaakceptowane 2026-11-23 (etap 06)
Source: rozmowa 2026-11-23 — wstępne założenia użytkownika (brak API, dane tylko w intranecie, wtyczka Chrome, panel wstrzykiwany w stronę)

## Stages
| NN | Stage | Executor | Status | Verification |
|----|-------|----------|--------|--------------|
| 01 | [Rozpoznanie intranetu](01-intranet-recon.md) | user | done | potwierdzenie użytkownika (próbki, anonimizacja, NOTES.md) |
| 02 | [Szkielet wtyczki](02-extension-skeleton.md) | agent | done | `npm run build`, `npm test` + potwierdzenie przycisku/panelu |
| 03 | [Parsery HTML i testy](03-parsers.md) | agent | done | `npx vitest run src/parsers` |
| 04 | [Kolektor i storage](04-collector-storage.md) | agent | done | `npx vitest run src/collector src/storage src/export` |
| 05 | [Widok miesięczny, święta, ustawienia](05-monthly-view.md) | agent | done (przegląd demo czeka na użytkownika) | `npx vitest run src/calendar src/ui` + przegląd w trybie demo |
| 06 | [Test na żywym intranecie](06-live-acceptance.md) | user | done |  potwierdzenie użytkownika |

## Decisions
- Q1: Zakres MVP danych: (a) lista podopiecznych, (b) ich zarejestrowane urlopy, (c) zarejestrowany czas w miesiącu — ile godzin w jakie dni (wybór użytkownika)
- Q2: Plan w `./plans/tl-support/` (katalog nie jest repo git)
- Q3: Pozyskanie danych = parsowanie HTML (DOM scraping), adapter per podstrona (intranet to stary system w Pythonie, server-side rendering, pełne przeładowania, brak XHR/fetch)
- Q4: Zbieranie aktywne na żądanie: przycisk „Odśwież” w panelu → wtyczka sama pobiera HTML podstron (`fetch` z sesją użytkownika) i parsuje `DOMParser`em w tle; z limitem tempa zapytań (pełne dane bez ręcznego chodzenia po stronach)
- Q5: Przechowywanie lokalne w IndexedDB, nic nie opuszcza komputera; historia snapshotów miesięcznych (trendy); przycisk „Wyczyść dane” + eksport CSV
- Q6: Główny widok MVP = miesięczne podsumowanie godzin per podopieczny per dzień, z oznaczeniem dni urlopu; weekendy i święta wyróżnione wizualnie; godziny zarejestrowane w dni wolne są pokazywane (praca w dni wolne dozwolona)
- Q7: Święta liczone w kodzie: ustawowe dni wolne w PL, w tym ruchome (Wielkanoc, Boże Ciało); możliwość dodania własnych dni wolnych w ustawieniach (offline, bez kolejnego adaptera)
- Q8: Stack: TypeScript + Vite + CRXJS (Manifest V3) + Preact (UI w Shadow DOM) + Vitest (testy parserów na próbkach HTML)
- Q9: Lista podopiecznych scrapowana ze strony intranetu; w ustawieniach ręczne wykluczenie/dodanie osób
- Q10: Podział na 6 etapów: 01 rozpoznanie (user) → 02 szkielet → 03 parsery → 04 kolektor+storage → 05 widok → 06 test na żywo (user)

## Assumptions
- Intranet działa w Chrome, użytkownik jest w nim zalogowany i ma uprawnienia do podglądu danych podopiecznych
- Wtyczka do użytku własnego (instalacja unpacked / developer mode), nie publikowana w Chrome Web Store
- Polityka firmy dopuszcza lokalną wtyczkę przetwarzającą dane, do których użytkownik ma już dostęp (potwierdzone przez użytkownika 2026-11-23)
- Norma dzienna = 8 h, konfigurowalna (potwierdzone 2026-11-23)
- 24.12 dzień wolny od 2025 r. (potwierdzone 2026-11-23)
- Kod wtyczki w katalogu głównym `tl-support/`; `fixtures/raw/` nie trafia do repo
