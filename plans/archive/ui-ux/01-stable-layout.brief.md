# Brief: 01-stable-layout
Projekt: /Users/michal.halas@stxnext.pl/projects/tl-support (Preact, Shadow DOM, Vitest). Kontekst: src/ui/*, styles.ts, README.md, plan w plans/ui-ux/README.md. Wykonaj dokładnie poniższą specyfikację; nie commituj, nie ruszaj .env, bez nowych zależności, nie zmieniaj poza zakresem; nie osłabiaj testów. Definition of done: wszystkie kryteria spełnione, testy ze sekcji Verification zielone.

# 01 Stabilny layout
Goal: Przełączanie filtrów/ustawień oraz komunikaty odświeżania nie zmieniają pozycji pozostałych elementów.
## Scope
In: `Settings` jako overlay (popover pod przyciskiem lub boczny drawer), stała linia statusu/błędów w `RefreshBar`, treść wypełnia dostępną wysokość (`.body` flex, grid-wrap `flex:1`), „Brak danych”/ładowanie bez skoku.
Out: resize, taby, nowa kolorystyka.
## Decisions
Q3, Q8 (README).
## Acceptance criteria
- [ ] Otwarcie/zamknięcie Ustawień nie zmienia pozycji nawigacji miesiąca, paska odświeżania ani siatki (test: pozycje/klasy; ustawienia poza przepływem)
- [ ] Postęp, status i lista błędów nie przesuwają siatki (stała wysokość lub overlay)
- [ ] Siatka wypełnia wysokość ciała panelu, przewija się wewnątrz
- [ ] Istniejące testy zielone
## Verification
`npx vitest run src/ui`; ręcznie `npm run dev` → demo.html.
## Files
src/ui/MonthView.tsx, Settings.tsx, RefreshBar.tsx, Panel.tsx, styles.ts
Depends on: —
