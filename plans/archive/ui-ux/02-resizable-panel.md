# 02 Resize popupu, reset, limity
Goal: Użytkownik zmienia rozmiar popupu przeciągając krawędź/narożnik; rozmiar jest zapamiętany; ikona resetu przywraca domyślny.
## Scope
In: uchwyty (lewa, górna, lewo-górny narożnik; kursory resize), pointer events z `setPointerCapture`, klamrowanie do min/max, zapis `tl-support:size` (jak fullscreen, `try/catch`), ikona resetu obok fullscreen/close widoczna tylko przy ręcznie zmienionym rozmiarze i poza fullscreen, reakcja na zmianę rozmiaru okna przeglądarki, treść dopasowuje się (flex, bez sztywnego `width:720px`).
Out: fullscreen (bez zmian zachowania), taby.
## Decisions
Q4–Q7.
## Acceptance criteria
- [ ] Drag lewej/górnej krawędzi i narożnika zmienia rozmiar; prawo-dół zakotwiczone
- [ ] Min ≈ 480×320; max = obszar fullscreen; klamrowanie także po resize okna
- [ ] Rozmiar przetrwa zamknięcie/otwarcie i reload (localStorage)
- [ ] Ikona resetu: tylko po ręcznej zmianie i poza fullscreen; klik czyści zapis i wraca do domyślnego
- [ ] W fullscreen brak uchwytów i ikony resetu; wyjście z fullscreen przywraca zapisany rozmiar
- [ ] Testy jednostkowe: klamrowanie, persist, widoczność resetu, fullscreen
## Verification
`npx vitest run src/ui/Panel.test.tsx` (+ nowy test resize); ręcznie w Chrome (unpacked).
## Files
src/ui/Panel.tsx, App.tsx, nowy src/ui/useResize.ts (lub w App), styles.ts, Panel.test.tsx
Depends on: 01 (done)
