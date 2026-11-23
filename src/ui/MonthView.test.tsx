import { render } from 'preact';
import { describe, expect, it, vi } from 'vitest';
import type { Snapshot } from '../domain/types';
import { MonthView, shiftMonth } from './MonthView';
import { PanelProvider } from './PanelContext';
import { Toolbar } from './Toolbar';

const tick = () => new Promise((r) => setTimeout(r, 150));
const snap: Snapshot = {
  month: '2026-10',
  fetchedAt: '2026-11-23T10:00:00Z',
  holidays: [],
  people: [{ id: 'a', name: 'Anna', profileUrl: '' }, { id: 'b', name: 'Bob', profileUrl: '' }],
  leaves: [],
  entries: [],
};

function mount(view: preact.JSX.Element, month: string, lineManagerId: string | null = '1') {
  const root = document.createElement('div');
  document.body.append(root);
  render(
    <PanelProvider initialMonth={month} lineManagerId={lineManagerId}>
      <Toolbar />
      {view}
    </PanelProvider>,
    root,
  );
  return root;
}
const q = <T extends Element>(r: Element, s: string) => r.querySelector(s) as T;

describe('MonthView', () => {
  it('shiftMonth across the year boundary', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
  });
  it('no snapshot → message; toolbar arrows change the month and load data', async () => {
    const root = mount(<MonthView demo loadSnapshot={async (m) => (m === '2026-10' ? snap : undefined)} />, '2026-11');
    await tick();
    expect(root.querySelector('.no-data')?.textContent).toContain('Refresh');
    (root.querySelector('.prev') as HTMLButtonElement).click();
    await tick();
    expect(root.querySelector('.month-label')?.textContent).toBe('2026-10');
    expect(root.querySelector('.no-data')).toBeNull();
    expect(root.querySelector('tr[data-person="a"]')).not.toBeNull();
    expect(root.querySelector('.fetched')?.textContent).toContain('Refreshed');
    expect(root.querySelector('.legend')).not.toBeNull();
    root.remove();
  });
  it('"Today" returns to the current month', async () => {
    const root = mount(<MonthView demo loadSnapshot={async () => undefined} />, '2000-01');
    await tick();
    (root.querySelector('.today') as HTMLButtonElement).click();
    await tick();
    expect(root.querySelector('.month-label')?.textContent).toBe(new Date().toISOString().slice(0, 7));
    root.remove();
  });
  it('has no own MonthNav / Settings; Refresh, Clear data, Export CSV in this order', async () => {
    const root = mount(<MonthView loadSnapshot={async () => snap} />, '2026-10');
    await tick();
    const view = q(root, '.month-view');
    expect(view.querySelector('.month-label, .settings-toggle')).toBeNull();
    expect(view.querySelector('.refresh')).not.toBeNull();
    expect(root.querySelectorAll('.month-label')).toHaveLength(1);
    expect(view.querySelector('.export')).not.toBeNull();
    expect(view.querySelector('.clear')).not.toBeNull();
    expect(Array.from(view.querySelectorAll('.refresh-bar > *')).map((e) => e.className.split(' ').find((c) => ['refresh', 'clear', 'export', 'fetched'].includes(c)))).toEqual(['refresh', 'clear', 'export', undefined, 'fetched']);
    root.remove();
  });
  it('Refresh collects for the shared month, saves and reloads', async () => {
    const collect = vi.fn(async () => ({ snapshot: snap, errors: [], loggedOut: false, cancelled: false }));
    const save = vi.fn(async () => {});
    const load = vi.fn(async () => snap);
    const root = mount(<MonthView loadSnapshot={load} collect={collect as any} save={save} />, '2026-10');
    await tick();
    (q(root, '.refresh-bar .refresh') as HTMLButtonElement).click();
    await tick();
    expect(collect).toHaveBeenCalledWith(expect.objectContaining({ month: '2026-10', lineManagerId: '1' }));
    expect(save).toHaveBeenCalledWith(snap);
    expect(load).toHaveBeenCalledTimes(2);
    expect(q(root, '.refresh-bar .status').textContent).toBe('Saved 2026-10');
    root.remove();
  });
  it('incomplete fetch → not saved, errors listed in the toolbar', async () => {
    const collect = vi.fn(async () => ({ snapshot: snap, errors: [{ source: 'leaves', message: 'HTTP 500' }], loggedOut: false, cancelled: false }));
    const save = vi.fn(async () => {});
    const root = mount(<MonthView loadSnapshot={async () => snap} collect={collect as any} save={save} />, '2026-10');
    await tick();
    (q(root, '.refresh-bar .refresh') as HTMLButtonElement).click();
    await tick();
    expect(save).not.toHaveBeenCalled();
    expect(q(root, '.refresh-bar .status').textContent).toBe('Not saved — fetch incomplete');
    expect(q(root, '.refresh-bar .errors').textContent).toContain('leaves: HTTP 500');
    root.remove();
  });
  it('logged out → one session message in the toolbar, none in the tab', async () => {
    const collect = vi.fn(async () => ({ snapshot: undefined, errors: [], loggedOut: true, cancelled: false }));
    const root = mount(<MonthView loadSnapshot={async () => snap} collect={collect as any} />, '2026-10');
    await tick();
    (q(root, '.refresh-bar .refresh') as HTMLButtonElement).click();
    await tick();
    expect(q(root, '.toolbar .status.session').textContent).toBe('Log in to the intranet');
    expect(q(root, '.month-view').textContent).not.toContain('Log in to the intranet');
    root.remove();
  });
  it('no detected user → toolbar message, Refresh disabled', async () => {
    const root = mount(<MonthView demo loadSnapshot={async () => snap} />, '2026-10', null);
    await tick();
    expect(q(root, '.toolbar .status.session').textContent).toContain('Could not detect the logged-in user');
    expect(q<HTMLButtonElement>(root, '.refresh-bar .refresh').disabled).toBe(true);
    root.remove();
  });
  it('person excluded in Settings disappears from the grid', async () => {
    localStorage.setItem('tl-support:settings', JSON.stringify({ excluded: ['b'] }));
    const root = mount(<MonthView demo loadSnapshot={async () => snap} />, '2026-10');
    await tick();
    localStorage.removeItem('tl-support:settings');
    expect(root.querySelector('tr[data-person="a"]')).not.toBeNull();
    expect(root.querySelector('tr[data-person="b"]')).toBeNull();
    root.remove();
  });
  it('Clear data asks via the in-panel dialog, not native confirm', async () => {
    const native = vi.spyOn(window, 'confirm');
    const root = mount(<MonthView loadSnapshot={async () => snap} />, '2026-10');
    await tick();
    (q(root, '.clear') as HTMLButtonElement).click();
    await tick();
    expect(native).not.toHaveBeenCalled();
    expect(q(root, '.dialog-ok').textContent).toBe('Delete');
    (q(root, '.dialog-cancel') as HTMLButtonElement).click();
    await tick();
    expect(root.querySelector('.dialog')).toBeNull();
    native.mockRestore();
    root.remove();
  });
});
