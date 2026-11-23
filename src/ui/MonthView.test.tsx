import { render } from 'preact';
import { describe, expect, it } from 'vitest';
import type { Snapshot } from '../domain/types';
import { MonthView, shiftMonth } from './MonthView';

const tick = () => new Promise((r) => setTimeout(r, 150));
const snap: Snapshot = {
  month: '2026-10',
  fetchedAt: '2026-11-23T10:00:00Z',
  holidays: [],
  people: [{ id: 'a', name: 'Anna', profileUrl: '' }],
  leaves: [],
  entries: [],
};

describe('MonthView', () => {
  it('shiftMonth przez granicę roku', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
  });
  it('brak snapshotu → komunikat; strzałki zmieniają miesiąc i ładują dane', async () => {
    const root = document.createElement('div');
    render(<MonthView demo initialMonth="2026-11" loadSnapshot={async (m) => (m === '2026-10' ? snap : undefined)} />, root);
    await tick();
    expect(root.querySelector('.no-data')?.textContent).toContain('Odśwież');
    (root.querySelector('.prev') as HTMLButtonElement).click();
    await tick();
    expect(root.querySelector('.month-label')?.textContent).toBe('2026-10');
    expect(root.querySelector('.no-data')).toBeNull();
    expect(root.querySelector('tr[data-person="a"]')).not.toBeNull();
    expect(root.querySelector('.fetched')).not.toBeNull();
    expect(root.querySelector('.legend')).not.toBeNull();
  });
  it('ustawienia są overlayem poza przepływem; nawigacja i treść bez zmian struktury', async () => {
    const root = document.createElement('div');
    render(<MonthView demo initialMonth="2026-10" loadSnapshot={async () => snap} />, root);
    await tick();
    const view = root.querySelector('.month-view') as HTMLElement;
    const before = Array.from(view.children).map((c) => c.className);
    const navBefore = root.querySelector('.month-nav')!.children.length;
    (root.querySelector('.settings-toggle') as HTMLButtonElement).click();
    await tick();
    const settings = root.querySelector('.settings') as HTMLElement;
    expect(settings.parentElement?.className).toBe('settings-anchor');
    expect(Array.from(view.children).map((c) => c.className)).toEqual(before);
    expect(root.querySelector('.month-nav')!.children.length).toBe(navBefore);
    expect(root.querySelector('.content .grid-wrap')).not.toBeNull();
  });
  it('ustawienia zamykają się na klik poza i Escape; Escape nie dociera do reszty', async () => {
    const root = document.createElement('div');
    document.body.append(root);
    render(<MonthView demo initialMonth="2026-10" loadSnapshot={async () => snap} />, root);
    await tick();
    const open = async () => {
      (root.querySelector('.settings-toggle') as HTMLButtonElement).click();
      await tick();
      expect(root.querySelector('.settings')).not.toBeNull();
    };
    await open();
    root.querySelector('.settings')!.dispatchEvent(new Event('pointerdown', { bubbles: true, composed: true }));
    await tick();
    expect(root.querySelector('.settings')).not.toBeNull();
    root.querySelector('.grid-wrap')!.dispatchEvent(new Event('pointerdown', { bubbles: true, composed: true }));
    await tick();
    expect(root.querySelector('.settings')).toBeNull();
    await open();
    let leaked = false;
    const spy = () => (leaked = true);
    document.addEventListener('keydown', spy);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await tick();
    document.removeEventListener('keydown', spy);
    expect(root.querySelector('.settings')).toBeNull();
    expect(leaked).toBe(false);
    root.remove();
  });
});
