import { describe, expect, it } from 'vitest';
import { easterSunday, holidaysPl } from './holidays-pl';
import { daysOfMonth, summarize } from './norm';

describe('święta PL', () => {
  it('Wielkanoc', () => {
    expect([2025, 2026, 2027].map((y) => easterSunday(y).toISOString().slice(0, 10))).toEqual(['2025-04-20', '2026-04-05', '2027-03-28']);
  });
  it('2025 (w tym ruchome i 24.12)', () => {
    expect(holidaysPl(2025)).toEqual([
      '2025-01-01', '2025-01-06', '2025-04-20', '2025-04-21', '2025-05-01', '2025-05-03', '2025-06-08', '2025-06-19',
      '2025-08-15', '2025-11-01', '2025-11-11', '2025-12-24', '2025-12-25', '2025-12-26',
    ]);
  });
  it('2026', () => {
    const h = holidaysPl(2026);
    expect(h).toEqual(expect.arrayContaining(['2026-04-05', '2026-04-06', '2026-05-24', '2026-06-04', '2026-12-24']));
    expect(h).toHaveLength(14);
  });
  it('2027', () => {
    const h = holidaysPl(2027);
    expect(h).toEqual(expect.arrayContaining(['2027-03-28', '2027-03-29', '2027-05-16', '2027-05-27']));
  });
  it('24.12 tylko od 2025', () => {
    expect(holidaysPl(2024)).not.toContain('2024-12-24');
  });
});

describe('norma', () => {
  const none = { leaves: [], entries: [] };
  it('miesiąc ze świętem: listopad 2026 = 21 dni rob. − 11.11 = 20 → 160 h', () => {
    const days = daysOfMonth('2026-11');
    expect(days.find((d) => d.date === '2026-11-11')).toMatchObject({ holiday: true, off: true });
    expect(summarize(none, 'u', days).norm).toBe(160);
  });
  it('własny dzień wolny obniża normę', () => {
    expect(summarize(none, 'u', daysOfMonth('2026-11', ['2026-11-13'])).norm).toBe(152);
  });
  it('urlop (przez weekend i święto) obniża normę o dni robocze', () => {
    const s = { entries: [], leaves: [{ personId: 'u', from: '2026-11-09', to: '2026-11-13', type: 'x' }] };
    const r = summarize(s, 'u', daysOfMonth('2026-11'));
    expect(r.leaveDays).toBe(4); // 11.11 święto
    expect(r.norm).toBe(128);
    expect(r.diff).toBe(-128);
  });
  it('urlop wystający poza miesiąc liczy tylko dni z miesiąca', () => {
    const s = { entries: [], leaves: [{ personId: 'u', from: '2026-10-29', to: '2026-11-03', type: 'x' }] };
    expect(summarize(s, 'u', daysOfMonth('2026-11')).leaveDays).toBe(2);
  });
  it('praca w weekend wlicza się do sumy i różnicy; non-billable osobno', () => {
    const s = {
      leaves: [],
      entries: [
        { personId: 'u', date: '2026-11-14', hours: 4, nonBillableHours: 1 }, // sobota
        { personId: 'u', date: '2026-11-02', hours: 8, nonBillableHours: 0 },
        { personId: 'x', date: '2026-11-02', hours: 99, nonBillableHours: 0 },
      ],
    };
    expect(summarize(s, 'u', daysOfMonth('2026-11'))).toMatchObject({ hours: 12, nonBillableHours: 1, norm: 160, diff: -148 });
  });
});
