import type { Snapshot } from '../domain/types';
import { workingDaysBetween } from '../parsers/dates';

export const CSV_SEPARATOR = ';'; // Excel w polskich ustawieniach regionalnych
export const CSV_BOM = '﻿';
export const CSV_HEADERS = ['Osoba', 'Data', 'Godziny', 'Godziny non-billable', 'Urlop'] as const;

function cell(v: string | number): string {
  const s = typeof v === 'number' ? String(v).replace('.', ',') : v;
  return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV miesiąca: wiersz per osoba per dzień z godzinami lub urlopem. UTF-8 z BOM, CRLF. */
export function snapshotToCsv(s: Snapshot): string {
  const holidays = new Set(s.holidays);
  const rows = new Map<string, { name: string; date: string; h: number; nb: number; leave: boolean }>();
  const names = new Map(s.people.map((p) => [p.id, p.name]));
  const row = (id: string, date: string) => {
    const k = `${id}|${date}`;
    let r = rows.get(k);
    if (!r) rows.set(k, (r = { name: names.get(id) ?? id, date, h: 0, nb: 0, leave: false }));
    return r;
  };
  for (const e of s.entries) {
    const r = row(e.personId, e.date);
    r.h += e.hours;
    r.nb += e.nonBillableHours;
  }
  for (const l of s.leaves) {
    for (const d of workingDaysBetween(l.from, l.to, holidays)) {
      if (d.startsWith(s.month)) row(l.personId, d).leave = true;
    }
  }
  const sorted = [...rows.entries()].sort(([a], [b]) => (a < b ? -1 : 1));
  const lines = [CSV_HEADERS.join(CSV_SEPARATOR)];
  for (const [, r] of sorted) {
    lines.push([cell(r.name), r.date, cell(r.h), cell(r.nb), r.leave ? 'tak' : ''].join(CSV_SEPARATOR));
  }
  return CSV_BOM + lines.join('\r\n') + '\r\n';
}

export function downloadCsv(s: Snapshot): void {
  const blob = new Blob([snapshotToCsv(s)], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `tl-support-${s.month}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}
