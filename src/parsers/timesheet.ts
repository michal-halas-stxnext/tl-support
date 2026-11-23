import type { TimeEntry } from '../domain/types';
import { parseHm, parsePlDate } from './dates';
import { ParseError } from './errors';
import { COL, PAGE } from './timesheet.selectors';

/**
 * Odpowiedź API approval (JSON) → godziny per osoba per dzień, tylko dla `year`/`month` (1–12).
 * Wiele wpisów z dnia sumowane; billable i non-billable osobno. Pusty miesiąc → [].
 */
export function parseTimesheet(input: string | unknown, year: number, month: number): TimeEntry[] {
  let data: any = input;
  if (typeof input === 'string') {
    try {
      data = JSON.parse(input);
    } catch {
      throw new ParseError(PAGE, 'poprawny JSON');
    }
  }
  if (!data || !Array.isArray(data.columns)) throw new ParseError(PAGE, 'pole `columns`');
  if (!Array.isArray(data.rows)) throw new ParseError(PAGE, 'pole `rows`');

  const ix: Record<string, number> = {};
  for (const key of Object.values(COL)) {
    const i = (data.columns as string[]).indexOf(key);
    if (i < 0) throw new ParseError(PAGE, `kolumna \`${key}\``);
    ix[key] = i;
  }

  const prefix = `${year}-${String(month).padStart(2, '0')}-`;
  const acc = new Map<string, { personId: string; date: string; bill: number; non: number }>();
  data.rows.forEach((row: unknown[], n: number) => {
    const date = parsePlDate(row[ix[COL.date]]);
    const minutes = parseHm(row[ix[COL.time]]);
    const rawId = row[ix[COL.userId]];
    const personId = typeof rawId === 'number' ? String(rawId) : rawId; // id bywa liczbą lub stringiem
    if (!date || minutes === null || typeof personId !== 'string' || personId === '') {
      const bad = [!date && 'data', minutes === null && 'czas', typeof personId !== 'string' && 'user_id']
        .filter(Boolean)
        .join('/');
      const types = [COL.date, COL.time, COL.userId].map((k) => `${k}:${typeof row[ix[k]]}`).join(', ');
      throw new ParseError(PAGE, `poprawny wiersz #${n} (zły: ${bad || 'user_id'}; typy: ${types})`);
    }
    if (!date.startsWith(prefix)) return;
    const key = `${personId}|${date}`;
    const e = acc.get(key) ?? { personId, date, bill: 0, non: 0 };
    if (row[ix[COL.nonBillable]] === true) e.non += minutes;
    else e.bill += minutes;
    acc.set(key, e);
  });

  return [...acc.values()]
    .sort((a, b) => a.personId.localeCompare(b.personId) || a.date.localeCompare(b.date))
    .map((e) => ({ personId: e.personId, date: e.date, hours: e.bill / 60, nonBillableHours: e.non / 60 }));
}
