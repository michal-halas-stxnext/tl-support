import { describe, expect, it } from 'vitest';
import { ParseError } from './errors';
import { parseLeaves } from './leaves';
import { parseTeamList } from './teamList';
import { parseTimesheet } from './timesheet';

const files = import.meta.glob('../../fixtures/*.{html,json}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const fx = (n: string) => {
  const c = files[`../../fixtures/${n}`];
  if (c === undefined) throw new Error(`brak fixture ${n}`);
  return c;
};

describe('parseTeamList (users-universal.json)', () => {
  const people = parseTeamList(fx('users-universal.json'));
  it('zwraca tylko JS Team 04 (też gdy osoba ma kilka teamów)', () => {
    expect(people.map((p) => p.id)).toEqual(
      ['user-001', 'user-003', 'user-004', 'user-005', 'user-006', 'user-002', 'user-008', 'user-009', 'user-010', 'user-011'],
    );
    expect(people).toHaveLength(10);
  });
  it('wypełnia pola Person', () => {
    expect(people.find((p) => p.id === 'user-001')).toMatchObject({ name: 'Osoba A' });
    expect(people[0].profileUrl).toMatch(/^https:\/\/intranet\.stxnext\.pl\/.*user_id=/);
  });
  it('inny team / brak dopasowania → pusta lista', () => {
    expect(parseTeamList(fx('users-universal.json'), 'Nie ma takiego')).toEqual([]);
  });
  it('zły kształt → ParseError', () => {
    expect(() => parseTeamList('{}')).toThrow(ParseError);
    expect(() => parseTeamList('nie json')).toThrow(ParseError);
    expect(() => parseTeamList([{ id: 'x', name: 'y' }])).toThrow(/teams/);
  });
});

describe('parseLeaves (absences-js-team-04.html)', () => {
  const page = parseLeaves(fx('absences-js-team-04.html'));
  const of = (id: string, from: string) => page.leaves.find((l) => l.personId === id && l.from === from);

  it('rok i święta z intranetu', () => {
    expect(page.year).toBe(2026);
    expect(page.holidays).toContain('2026-11-11');
  });
  it('urlop jednodniowy', () => {
    expect(of('user-001', '2026-01-21')).toMatchObject({ to: '2026-01-21', type: 'bezplatny' });
  });
  it('urlop wielodniowy liczony w dniach roboczych (przez weekendy)', () => {
    expect(of('user-004', '2026-07-27')?.to).toBe('2026-08-11'); // 12 dni rob.
    expect(of('user-001', '2026-09-28')?.to).toBe('2026-10-15'); // 14 dni rob.
    expect(of('user-007', '2026-02-26')?.to).toBe('2026-03-05'); // 6 dni rob.
  });
  it('święto pomijane w zakresie', () => {
    // start 01.01 (święto) + 6 dni rob.: 2,5,7,8,9,12 (6.01 święto)
    expect(of('user-001', '2026-01-02')?.to).toBe('2026-01-12');
  });
  it('brak inline data → ParseError', () => {
    expect(() => parseLeaves('<html><body><table></table></body></html>')).toThrow(ParseError);
    expect(() => parseLeaves('<script>var data = {"year": 2026};</script>')).toThrow(/absences/);
  });
});

describe('parseTimesheet', () => {
  const bill = fx('timesheet-approval-billable.json');
  const non = fx('timesheet-approval-nonbillable.json');

  it('billable: suma godzin per osoba/dzień (dzień z wieloma wpisami)', () => {
    const e = parseTimesheet(bill, 2026, 11);
    expect(e).toHaveLength(78);
    expect(e.find((x) => x.personId === 'user-011' && x.date === '2026-11-02')).toEqual({
      personId: 'user-011',
      date: '2026-11-02',
      hours: 11,
      nonBillableHours: 0,
    });
    expect(e.reduce((s, x) => s + x.hours, 0)).toBe(634.5);
  });
  it('non-billable liczone osobno', () => {
    const e = parseTimesheet(non, 2026, 11);
    expect(e).toHaveLength(26);
    expect(e.reduce((s, x) => s + x.nonBillableHours, 0)).toBe(202);
    expect(e.every((x) => x.hours === 0)).toBe(true);
  });
  it('pusty miesiąc → []', () => {
    expect(parseTimesheet(bill, 2026, 10)).toEqual([]);
  });
  it('praca w weekend/święto jest zachowana, inne miesiące odfiltrowane', () => {
    const cols = ['user_id', 'timeentry_date', 'timeentry_time', 'project_non_billable'];
    const rows = [
      ['u1', '11.11.2026', '02:30', false], // święto
      ['u1', '11.11.2026', '01:15', false],
      ['u1', '14.11.2026', '04:00', false], // sobota
      ['u1', '01.12.2026', '08:00', false], // inny miesiąc
    ];
    expect(parseTimesheet({ columns: cols, rows }, 2026, 11)).toEqual([
      { personId: 'u1', date: '2026-11-11', hours: 3.75, nonBillableHours: 0 },
      { personId: 'u1', date: '2026-11-14', hours: 4, nonBillableHours: 0 },
    ]);
  });
  it('brak kolumny / złe dane → ParseError', () => {
    expect(() => parseTimesheet('{}', 2026, 11)).toThrow(ParseError);
    expect(() => parseTimesheet({ columns: ['user_id'], rows: [] }, 2026, 11)).toThrow(/timeentry_date/);
    expect(() =>
      parseTimesheet({ columns: ['user_id', 'timeentry_date', 'timeentry_time', 'project_non_billable'], rows: [['u', 'zła', '01:00', false]] }, 2026, 11),
    ).toThrow(ParseError);
  });
});

describe('id liczbowe', () => {
  it('timesheet i lista osób akceptują id jako liczby', () => {
    const cols = ['user_id', 'timeentry_date', 'timeentry_time', 'project_non_billable'];
    expect(parseTimesheet({ columns: cols, rows: [[1954, '02.11.2026', '01:00', false]] }, 2026, 11)[0].personId).toBe('1954');
    expect(parseTeamList([{ id: 7, name: 'A', teams: [{ name: 'JS Team 04' }] }])[0].id).toBe('7');
  });
  it('błąd wiersza wskazuje zły typ pola (bez wartości)', () => {
    const cols = ['user_id', 'timeentry_date', 'timeentry_time', 'project_non_billable'];
    expect(() => parseTimesheet({ columns: cols, rows: [[null, '02.11.2026', '1', false]] }, 2026, 11)).toThrow(/time.*user_id:object/);
  });
});
