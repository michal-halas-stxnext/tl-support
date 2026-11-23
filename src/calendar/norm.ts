import { holidaysPl } from './holidays-pl';
import type { IsoDate, Leave, Snapshot, TimeEntry } from '../domain/types';
import { fromIso, isWeekend, workingDaysBetween } from '../parsers/dates';

export const DEFAULT_DAILY_NORM = 8;

export interface DayInfo {
  date: IsoDate;
  day: number;
  weekend: boolean;
  holiday: boolean;
  /** Weekend, holiday or custom day off. */
  off: boolean;
}

export function daysOfMonth(month: string, customDaysOff: Iterable<IsoDate> = []): DayInfo[] {
  const [y, m] = month.split('-').map(Number);
  const hol = new Set<IsoDate>([...holidaysPl(y), ...customDaysOff]);
  const n = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from({ length: n }, (_, i) => {
    const date = `${month}-${String(i + 1).padStart(2, '0')}`;
    const weekend = isWeekend(fromIso(date));
    const holiday = hol.has(date);
    return { date, day: i + 1, weekend, holiday, off: weekend || holiday };
  });
}

export interface PersonSummary {
  hours: number;
  nonBillableHours: number;
  norm: number;
  diff: number;
  leaveDays: number;
}

/** A person's leave days in the month (working days, excluding holidays/custom days off). */
export function leaveDaysInMonth(leaves: Leave[], personId: string, days: DayInfo[]): Set<IsoDate> {
  const off = new Set(days.filter((d) => d.off).map((d) => d.date));
  const inMonth = new Set(days.map((d) => d.date));
  const out = new Set<IsoDate>();
  for (const l of leaves) {
    if (l.personId !== personId) continue;
    for (const d of workingDaysBetween(l.from, l.to, off)) if (inMonth.has(d)) out.add(d);
  }
  return out;
}

/** Norm = (working days − leave days) × daily norm; difference = total − norm (work on days off counts toward the total). */
export function summarize(
  s: Pick<Snapshot, 'leaves' | 'entries'>,
  personId: string,
  days: DayInfo[],
  dailyNorm = DEFAULT_DAILY_NORM,
): PersonSummary {
  const leave = leaveDaysInMonth(s.leaves, personId, days);
  const workdays = days.filter((d) => !d.off).length;
  const mine: TimeEntry[] = s.entries.filter((e) => e.personId === personId);
  const hours = mine.reduce((a, e) => a + e.hours, 0);
  const nonBillableHours = mine.reduce((a, e) => a + e.nonBillableHours, 0);
  const norm = Math.max(0, workdays - leave.size) * dailyNorm;
  return { hours, nonBillableHours, norm, diff: hours - norm, leaveDays: leave.size };
}
