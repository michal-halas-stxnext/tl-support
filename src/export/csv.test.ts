import { describe, expect, it } from 'vitest';
import type { Snapshot } from '../domain/types';
import { CSV_BOM, snapshotToCsv } from './csv';

const s: Snapshot = {
  month: '2026-11',
  fetchedAt: 'x',
  people: [
    { id: 'u1', name: 'Anna "Ania" Ż;ółć', profileUrl: '' },
    { id: 'u2', name: 'Bartek', profileUrl: '' },
  ],
  entries: [{ personId: 'u1', date: '2026-11-02', hours: 7.5, nonBillableHours: 0.25 }],
  leaves: [{ personId: 'u2', from: '2026-11-10', to: '2026-11-12', type: 'bezplatny' }],
  holidays: ['2026-11-11'],
};

describe('snapshotToCsv', () => {
  const csv = snapshotToCsv(s);
  const lines = csv.split('\r\n');
  it('UTF-8 BOM, headers, ; separator', () => {
    expect(csv.startsWith(CSV_BOM)).toBe(true);
    expect(lines[0]).toBe(CSV_BOM + 'Person;Date;Hours;Non-billable hours;Leave');
  });
  it('row with hours, decimal comma and escaping', () => {
    expect(lines[1]).toBe('"Anna ""Ania"" Ż;ółć";2026-11-02;7,5;0,25;');
  });
  it('leave expanded to working days excluding holidays', () => {
    expect(lines.slice(2, 4)).toEqual(['Bartek;2026-11-10;0;0;yes', 'Bartek;2026-11-12;0;0;yes']);
    expect(lines[4]).toBe('');
  });
});
