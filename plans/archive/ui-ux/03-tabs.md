# 03 Taby
Goal: Panel ma pasek tabów; obecny ekran jest w pierwszym tabie „Time logged”.
## Scope
In: komponent `Tabs` (role tablist/tab/tabpanel, nawigacja strzałkami), rejestr tabów (lista `{id,label,component}`), zapamiętanie aktywnego tabu, `MonthView` jako zawartość „Time logged”.
Out: nowe taby/funkcje (w przyszłości).
## Decisions
Q8.
## Acceptance criteria
- [ ] Pasek tabów z jednym tabem „Time logged”, aktywnym domyślnie
- [ ] Dodanie tabu = jeden wpis w rejestrze (test z tabem testowym)
- [ ] ARIA + klawiatura (←/→, Home/End)
- [ ] Aktywny tab zapamiętany; pasek tabów nie zmienia layoutu przy przełączaniu
## Verification
`npx vitest run src/ui`
## Files
src/ui/Panel.tsx, nowy src/ui/Tabs.tsx, styles.ts, testy
Depends on: 02 (done)
