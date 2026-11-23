import type { IsoDate } from '../domain/types';

const pad = (n: number) => String(n).padStart(2, '0');

export function toIso(d: Date): IsoDate {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function fromIso(s: IsoDate): Date {
  return new Date(`${s}T00:00:00Z`);
}

/** `DD.MM.YYYY` → `YYYY-MM-DD`; null gdy format nieprawidłowy. */
export function parsePlDate(s: unknown): IsoDate | null {
  const m = typeof s === 'string' ? /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s.trim()) : null;
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

/** `HH:MM` → minuty; null gdy format nieprawidłowy. */
export function parseHm(s: unknown): number | null {
  const m = typeof s === 'string' ? /^(\d{1,2}):(\d{2})$/.exec(s.trim()) : null;
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

export function isWeekend(d: Date): boolean {
  const dow = d.getUTCDay();
  return dow === 0 || dow === 6;
}

/**
 * Rozwija `count` dni roboczych (pn–pt, bez świąt) od `start` włącznie.
 * Semantyka N w absences wywnioskowana z danych (etap 03): dni robocze,
 * nie kalendarzowe (`absencesMonths` lutego = 4 pasuje tylko do dni roboczych).
 */
export function workingDaysFrom(start: IsoDate, count: number, holidays: Set<IsoDate>): IsoDate[] {
  const out: IsoDate[] = [];
  const d = fromIso(start);
  // zabezpieczenie przed nieskończoną pętlą przy absurdalnym count
  for (let guard = 0; out.length < count && guard < count * 7 + 14; guard++) {
    const iso = toIso(d);
    if (!isWeekend(d) && !holidays.has(iso)) out.push(iso);
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

/** Dni robocze (pn–pt, bez świąt) z zakresu `from..to` włącznie. */
export function workingDaysBetween(from: IsoDate, to: IsoDate, holidays: Set<IsoDate>): IsoDate[] {
  const out: IsoDate[] = [];
  const d = fromIso(from);
  const end = fromIso(to).getTime();
  while (d.getTime() <= end) {
    const iso = toIso(d);
    if (!isWeekend(d) && !holidays.has(iso)) out.push(iso);
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}
