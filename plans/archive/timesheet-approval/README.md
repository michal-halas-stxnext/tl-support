# Zakładka „Akceptowanie godzin”
Goal: Nowa zakładka w panelu TL Support do akceptowania i odrzucania godzin podopiecznych — billable i non-billable — bezpośrednio z wtyczki, przez API intranetu.
Planning: complete
Source: rozmowa 2026-11-23 — „nowa zakładka: Akceptowanie godzin, bilowalnych i nie billowalnych”

## Stages
| NN | Stage | Executor | Status | Verification |
|----|-------|----------|--------|--------------|
| 01 | [Rozpoznanie endpointów accept/reject](01-write-api-recon.md) | mixed | done | wpis w `fixtures/NOTES.md` + fixture requestu/odpowiedzi, potwierdzenie użytkownika |
| 02 | [Parser wpisów + klient zapisu](02-approval-client.md) | agent | done | `npx vitest run src/parsers src/approval` |
| 03 | [Zakładka UI](03-approval-tab.md) | agent | done | `npx vitest run src/ui`, `npm run build`, przegląd demo |
| 04 | [Test na żywym intranecie](04-live-test.md) | user | done | potwierdzenie użytkownika |

## Decisions
- Q1: Akceptacja z wtyczki (zapis przez API intranetu), nie tylko przegląd
- Q2: Granulacja: osoba (akceptuj/odrzuć wszystkie widoczne wpisy osoby) + pojedyncze wpisy (rozwinięcie z checkboxami, akcja na zaznaczonych)
- Q3: Odrzucenie w zakresie, bez komentarza
- Q4: Jedna lista; badge „non-billable”, sumy billable/non-billable osobno per osoba; filtr Wszystkie/Billable/Non-billable; jeden fetch `billability=ALL`
- Q5: Wybór miesiąca jak w „Time logged”; domyślnie stan OPEN, filtr stanu pokazuje też zaakceptowane/odrzucone; po akcji odświeżenie listy
- Q6: 4 etapy: rozpoznanie → logika z testami → UI → test na żywo

## Assumptions
- Endpoint(y) accept/reject nieznane — etap 01 (fixtures/NOTES.md opisuje tylko GET `/api/times/approval`)
- Zakładka pobiera dane na żywo (nie ze snapshotu IndexedDB „Time logged”), bo akcje wymagają aktualnego stanu
- Miesiąc w zakładce: własny stan (ten sam wzorzec nawigacji ←/→ co MonthView), nie współdzielony z „Time logged”
- Akcja hurtowa (cała osoba / >1 wpis) wymaga potwierdzenia w UI; pojedynczy wpis — bez
- Przyciski akcji tylko dla wpisów z `can_accept` / `can_reject` = true
- Zakres osób = `line_manager` = zalogowany (jak w kolektorze), bez dodatkowego filtra teamu
