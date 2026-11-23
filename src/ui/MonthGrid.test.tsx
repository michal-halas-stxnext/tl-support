import { render } from 'preact';
import { describe, expect, it } from 'vitest';
import type { Snapshot } from '../domain/types';
import { DEFAULT_SETTINGS, effectivePeople } from '../settings/settings';
import { MonthGrid } from './MonthGrid';

const snap: Snapshot = {
  month: '2026-11',
  fetchedAt: 'x',
  holidays: [],
  people: [
    { id: 'a', name: 'Anna', profileUrl: '' },
    { id: 'b', name: 'Bartek', profileUrl: '' },
  ],
  leaves: [{ personId: 'a', from: '2026-11-03', to: '2026-11-04', type: 'x' }],
  entries: [
    { personId: 'a', date: '2026-11-02', hours: 8, nonBillableHours: 0 },
    { personId: 'a', date: '2026-11-14', hours: 3.5, nonBillableHours: 0 }, // sobota
    { personId: 'a', date: '2026-11-11', hours: 2, nonBillableHours: 1 }, // holiday
  ],
};

function mount(settings = DEFAULT_SETTINGS) {
  const root = document.createElement('div');
  render(<MonthGrid snapshot={snap} settings={settings} />, root);
  return root;
}
const cell = (root: HTMLElement, person: string, day: number) =>
  root.querySelectorAll(`tr[data-person="${person}"] td.cell`)[day - 1] as HTMLElement;

describe('MonthGrid', () => {
  const root = mount();
  it('hours in the cell, regular day without special classes', () => {
    expect(cell(root, 'a', 2).textContent).toBe('8');
    expect(cell(root, 'a', 2).className).toBe('cell');
  });
  it('urlop', () => {
    expect(cell(root, 'a', 3).classList.contains('leave')).toBe(true);
    expect(cell(root, 'a', 4).classList.contains('leave')).toBe(true);
    expect(cell(root, 'b', 3).classList.contains('leave')).toBe(false);
  });
  it('weekend and holiday', () => {
    expect(cell(root, 'b', 7).classList.contains('weekend')).toBe(true);
    expect(cell(root, 'b', 11).classList.contains('holiday')).toBe(true);
  });
  it('work on a day off is highlighted separately (off-work), hours visible', () => {
    const sat = cell(root, 'a', 14);
    expect(sat.classList.contains('weekend') && sat.classList.contains('off-work')).toBe(true);
    expect(sat.textContent).toBe('3,5');
    const hol = cell(root, 'a', 11);
    expect(hol.classList.contains('holiday') && hol.classList.contains('off-work')).toBe(true);
    expect(hol.querySelector('.nb')?.textContent).toBe('1');
    expect(cell(root, 'b', 14).classList.contains('off-work')).toBe(false);
  });
  it('kolumny podsumowania', () => {
    const row = root.querySelector('tr[data-person="a"]')!;
    expect(row.querySelector('.total')?.textContent).toBe('13,5');
    expect(row.querySelector('.norm')?.textContent).toBe('144'); // (20−2)×8
    expect(row.querySelector('.leave-days')?.textContent).toBe('2');
  });
  it('a custom day off is marked as a holiday', () => {
    const r = mount({ ...DEFAULT_SETTINGS, customDaysOff: ['2026-11-13'] });
    expect(cell(r, 'b', 13).classList.contains('holiday')).toBe(true);
  });
  it('an excluded person disappears, a manually added one appears', () => {
    const r = mount({ ...DEFAULT_SETTINGS, excluded: ['b'], extraPeople: [{ id: 'z', name: 'Zofia' }] });
    expect(r.querySelector('tr[data-person="b"]')).toBeNull();
    expect(r.querySelector('tr[data-person="a"]')).not.toBeNull();
    expect(r.querySelector('tr[data-person="z"] th.name')?.textContent).toBe('Zofia');
  });
  it('effectivePeople: no duplicates, exclusion also applies to added people', () => {
    const s = { ...DEFAULT_SETTINGS, extraPeople: [{ id: 'a', name: 'dup' }, { id: 'z', name: 'Z' }], excluded: ['z'] };
    expect(effectivePeople(snap.people, s).map((p) => p.id)).toEqual(['a', 'b']);
  });
});
