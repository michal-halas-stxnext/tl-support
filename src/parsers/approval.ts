import type { ApprovalEntry } from '../domain/types';
import { parseHm, parsePlDate } from './dates';
import { ParseError } from './errors';
import { APPROVAL_COL as C, PAGE } from './timesheet.selectors';

/** Odpowiedź `GET /api/times/approval` → pojedyncze wpisy (bez filtrowania po miesiącu — robi to serwer). */
export function parseApprovalEntries(input: string | unknown): ApprovalEntry[] {
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

  const ix = {} as Record<keyof typeof C, number>;
  for (const [k, col] of Object.entries(C) as [keyof typeof C, string][]) {
    const i = (data.columns as string[]).indexOf(col);
    if (i < 0) throw new ParseError(PAGE, `column \`${col}\``);
    ix[k] = i;
  }

  const str = (v: unknown) => (typeof v === 'number' ? String(v) : typeof v === 'string' ? v : '');
  return data.rows.map((row: unknown[], n: number): ApprovalEntry => {
    const id = str(row[ix.id]);
    const personId = str(row[ix.userId]);
    const date = parsePlDate(row[ix.date]);
    const minutes = parseHm(row[ix.time]);
    if (!id || !personId || !date || minutes === null) {
      throw new ParseError(PAGE, `valid row #${n} (id/user_id/date/time)`);
    }
    return {
      id,
      personId,
      personName: str(row[ix.userName]),
      date,
      minutes,
      nonBillable: row[ix.nonBillable] === true,
      state: str(row[ix.state]) || 'OPEN',
      project: str(row[ix.project]),
      description: str(row[ix.description]),
      canAccept: row[ix.canAccept] === true,
      canReject: row[ix.canReject] === true,
    };
  });
}
