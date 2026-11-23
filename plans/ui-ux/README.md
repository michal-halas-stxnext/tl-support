# Podniesienie jakości UI/UX wtyczki TL Support
Goal: Popup z możliwością zmiany rozmiaru (zapamiętywaną), stabilny layout bez „rozsuwania” elementów, taby (pierwszy: „Time logged”) i przyjemniejszy wygląd.
Planning: complete
Source: rozmowa 2026-11-23 — lista uwag użytkownika do UI/UX

## Stages
| NN | Stage | Executor | Status | Verification |
|----|-------|----------|--------|--------------|
| 01 | [Stabilny layout](01-stable-layout.md) | agent | planned | `npx vitest run src/ui` + przegląd demo |
| 02 | [Resize popupu, reset, limity](02-resizable-panel.md) | agent | planned | `npx vitest run src/ui` + przegląd w Chrome |
| 03 | [Taby](03-tabs.md) | agent | planned | `npx vitest run src/ui` |
| 04 | [Redesign wizualny](04-visual-polish.md) | agent | planned | `npm run build`, `npx vitest run src/ui` + przegląd użytkownika |

## Decisions
- Q1: 4 etapy w kolejności 01→04 (osobna weryfikacja, mały diff)
- Q2: Kierunek wizualny: jasny, nowoczesny, tokeny CSS; bez trybu ciemnego
- Q3 (autonomous): Ustawienia = popover/drawer nakładany (position absolute), nie wpychany w przepływ; statusy/błędy odświeżania w zarezerwowanej linii o stałej wysokości lub toast
- Q4 (autonomous): Resize: uchwyty na lewej/górnej krawędzi i lewo-górnym narożniku (panel kotwiczony prawy-dół); rozmiar w localStorage jak fullscreen (`tl-support:size`)
- Q5 (autonomous): Min ≈ 480×320 px; max = obszar fullscreen (viewport − 16 px marginesu); przy zmniejszeniu okna przeglądarki rozmiar jest klampowany
- Q6 (autonomous): Reset rozmiaru = ikona obok fullscreen/close, widoczna tylko gdy rozmiar zmieniony ręcznie i nie w fullscreen; wraca do rozmiaru domyślnego (kontentu) i czyści zapis
- Q7 (autonomous): Resize/reset nie dotyczą fullscreen (uchwyty ukryte, zapis rozmiaru nietknięty)
- Q8 (autonomous): Taby: pasek tabów w Panel, aktywny tab zapamiętany; dziś jeden tab „Time logged” (= obecny MonthView); rejestr tabów jako lista, by dodawanie było jedną linią

## Assumptions
- „Rozmiar kontentu” przy resecie = obecny domyślny rozmiar panelu (szerokość 720 px, wysokość 60vh), nie auto-fit do tabeli
- Brak nowych zależności (czysty CSS + pointer events)
