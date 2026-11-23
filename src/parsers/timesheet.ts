import type { TimeEntry } from '../domain/types';
import { parseHm, parsePlDate } from './dates';
import { ParseError } from './errors';
import { COL, PAGE } from './timesheet.selectors';

/**
 * Approval API response (JSON) → hours per person per day, only for `year`/`month` (1–12).
 * Multiple entries on a day are summed; billable and non-billable separately. Empty month → [].
 */
export function parseTimesheet(input: string | unknown, year: number, month: number): TimeEntry[] {
  let data: any = input;
  if (typeof input === 'string') {
    try {
      data = JSON.parse(input);
    } catch {
      throw new ParseError(PAGE, 'valid JSON');
    }
  }
  if (!data || !Array.isArray(data.columns)) throw new ParseError(PAGE, 'field `columns`');
  if (!Array.isArray(data.rows)) throw new ParseError(PAGE, 'field `rows`');

  const ix: Record<string, number> = {};
  for (const key of Object.values(COL)) {
    const i = (data.columns as string[]).indexOf(key);
    if (i < 0) throw new ParseError(PAGE, `column \`${key}\``);
    ix[key] = i;
  }

  const prefix = `${year}-${String(month).padStart(2, '0')}-`;
  const acc = new Map<string, { personId: string; date: string; bill: number; non: number }>();
  data.rows.forEach((row: unknown[], n: number) => {
    const date = parsePlDate(row[ix[COL.date]]);
    const minutes = parseHm(row[ix[COL.time]]);
    const rawId = row[ix[COL.userId]];
    const personId = typeof rawId === 'number' ? String(rawId) : rawId; // id may be a number or a string
    if (!date || minutes === null || typeof personId !== 'string' || personId === '') {
      const bad = [!date && 'date', minutes === null && 'time', typeof personId !== 'string' && 'user_id']
        .filter(Boolean)
        .join('/');
      const types = [COL.date, COL.time, COL.userId].map((k) => `${k}:${typeof row[ix[k]]}`).join(', ');
      throw new ParseError(PAGE, `valid row #${n} (bad: ${bad || 'user_id'}; types: ${types})`);
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
