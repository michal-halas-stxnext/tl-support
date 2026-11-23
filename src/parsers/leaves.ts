import type { IsoDate, Leave, LeavesPage } from '../domain/types';
import { workingDaysFrom } from './dates';
import { ParseError } from './errors';
import { DATA_MARKER, ENTRY, F, PAGE, SCRIPT_SELECTOR } from './leaves.selectors';

/** Cuts out the object literal `{...}` from `start` (deliberately ignores braces inside strings). */
function sliceObject(src: string, start: number): string | null {
  let depth = 0;
  let inStr = false;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === '\\') i++;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return src.slice(start, i + 1);
  }
  return null;
}

function extractData(html: string): Record<string, any> {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const scripts = Array.from(doc.querySelectorAll(SCRIPT_SELECTOR));
  for (const s of scripts) {
    const text = s.textContent ?? '';
    const m = DATA_MARKER.exec(text);
    if (!m) continue;
    const start = m.index + m[0].length;
    if (text[start] !== '{') continue;
    const literal = sliceObject(text, start);
    if (!literal) throw new ParseError(PAGE, 'closing of the `data` object');
    try {
      return JSON.parse(literal);
    } catch {
      throw new ParseError(PAGE, '`data` as valid JSON');
    }
  }
  throw new ParseError(PAGE, 'inline <script> with `var data = {...}`');
}

/** Absences page HTML → leaves (working-day ranges) + intranet holidays. */
export function parseLeaves(html: string): LeavesPage {
  const data = extractData(html);
  const absences = data[F.absences];
  if (!absences || typeof absences !== 'object' || Array.isArray(absences)) {
    throw new ParseError(PAGE, `field \`${F.absences}\``);
  }
  const year = data[F.year];
  if (typeof year !== 'number') throw new ParseError(PAGE, `field \`${F.year}\``);
  const holidays: IsoDate[] = Array.isArray(data[F.holidays]) ? data[F.holidays] : [];
  const holidaySet = new Set(holidays);

  const leaves: Leave[] = [];
  for (const [personId, byDate] of Object.entries<Record<string, any[]>>(absences)) {
    for (const [start, entry] of Object.entries(byDate)) {
      const n = entry?.[ENTRY.days];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !Number.isInteger(n) || n < 1) {
        throw new ParseError(PAGE, `valid absence entry (${personId} ${start})`);
      }
      const days = workingDaysFrom(start, n, holidaySet);
      if (days.length === 0) continue;
      leaves.push({ personId, from: days[0], to: days[days.length - 1], type: String(entry[ENTRY.type] ?? '') });
    }
  }
  leaves.sort((a, b) => a.personId.localeCompare(b.personId) || a.from.localeCompare(b.from));
  return { year, holidays, leaves };
}
