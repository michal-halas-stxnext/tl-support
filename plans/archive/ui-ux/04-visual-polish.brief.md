# Brief: 04-visual-polish
Projekt: /Users/michal.halas@stxnext.pl/projects/tl-support (Preact, Shadow DOM, Vitest). Kontekst: src/ui/*, styles.ts, README.md, plan w plans/ui-ux/README.md. Wykonaj dokładnie poniższą specyfikację; nie commituj, nie ruszaj .env, bez nowych zależności, nie zmieniaj poza zakresem; nie osłabiaj testów. Definition of done: wszystkie kryteria spełnione, testy ze sekcji Verification zielone.

# 04 Redesign wizualny
Goal: Jasny, nowoczesny, spójny wygląd podnoszący UX — bez fajerwerków.
## Scope
In: tokeny CSS (`--tl-*`: kolory, odstępy, promienie, cienie, typografia), przyciski (primary/secondary/ghost, stany hover/focus-visible/disabled), ikony SVG zamiast znaków (⤢ × reset), nagłówek panelu, taby, nawigacja miesiąca, tabela (zebra/hover wiersza, sticky nagłówek/kolumna, czytelniejsze oznaczenia urlop/weekend/święto/praca w wolne, kolumny sum), legenda, puste stany/loader, formularz Ustawień, płynne krótkie przejścia (respect `prefers-reduced-motion`), kontrast WCAG AA.
Out: tryb ciemny, nowe funkcje.
## Decisions
Q2.
## Acceptance criteria
- [ ] Wszystkie style na tokenach; brak „magicznych” kolorów w regułach
- [ ] Stany focus-visible na wszystkich interaktywnych elementach
- [ ] Kontrast tekstu ≥ AA (sprawdzone dla kluczowych par)
- [ ] `npm run build` i testy zielone
- [ ] Użytkownik akceptuje wygląd w demo i w intranecie (user confirmation)
## Verification
`npm run build`, `npx vitest run src/ui`; przegląd w demo.html i Chrome.
## Files
src/ui/styles.ts, Panel/MonthView/RefreshBar/Settings/MonthGrid.tsx (klasy, ikony)
Depends on: 03 (done)
