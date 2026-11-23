import type { IsoDate } from '../domain/types';
import { toIso } from '../parsers/dates';

/** Wielkanoc (algorytm Gaussa/„Anonymous Gregorian”), UTC. */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

const plusDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);

/** Ustawowe dni wolne w PL dla roku (+ 24.12 od 2025). Posortowane. */
export function holidaysPl(year: number): IsoDate[] {
  const p = (m: number, d: number) => `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const easter = easterSunday(year);
  const days = [
    p(1, 1), p(1, 6),
    toIso(easter), toIso(plusDays(easter, 1)),
    p(5, 1), p(5, 3),
    toIso(plusDays(easter, 49)), // Zielone Świątki
    toIso(plusDays(easter, 60)), // Boże Ciało
    p(8, 15), p(11, 1), p(11, 11),
    p(12, 25), p(12, 26),
  ];
  if (year >= 2025) days.push(p(12, 24));
  return days.sort();
}
