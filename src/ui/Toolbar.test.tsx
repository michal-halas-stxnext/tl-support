import { render } from 'preact';
import { describe, expect, it } from 'vitest';
import type { Snapshot } from '../domain/types';
import { MonthView } from './MonthView';
import { PanelProvider } from './PanelContext';
import { Toolbar } from './Toolbar';

const tick = () => new Promise((r) => setTimeout(r, 150));
const snap: Snapshot = {
  month: '2026-10',
  fetchedAt: '2026-11-23T10:00:00Z',
  holidays: [],
  people: [{ id: 'a', name: 'Anna', profileUrl: '' }],
  leaves: [],
  entries: [],
};

async function mount() {
  const root = document.createElement('div');
  document.body.append(root);
  render(
    <PanelProvider initialMonth="2026-10" lineManagerId="1">
      <Toolbar />
      <MonthView demo loadSnapshot={async () => snap} />
    </PanelProvider>,
    root,
  );
  await tick();
  return root;
}

describe('Toolbar', () => {
  it('renders MonthNav and Settings once, no Refresh', async () => {
    const root = await mount();
    expect(root.querySelectorAll('.toolbar')).toHaveLength(1);
    expect(root.querySelectorAll('.month-label')).toHaveLength(1);
    expect(root.querySelectorAll('.toolbar .refresh')).toHaveLength(0);
    expect(root.querySelectorAll('.settings-toggle')).toHaveLength(1);
    root.remove();
  });
  it('settings are an overlay outside the flow; toolbar and content keep their structure', async () => {
    const root = await mount();
    const view = root.querySelector('.month-view') as HTMLElement;
    const before = Array.from(view.children).map((c) => c.className);
    const navBefore = root.querySelector('.toolbar')!.children.length;
    (root.querySelector('.settings-toggle') as HTMLButtonElement).click();
    await tick();
    const settings = root.querySelector('.settings') as HTMLElement;
    expect(settings.parentElement?.className).toBe('settings-anchor');
    expect(Array.from(view.children).map((c) => c.className)).toEqual(before);
    expect(root.querySelector('.toolbar')!.children.length).toBe(navBefore);
    expect(root.querySelector('.content .grid-wrap')).not.toBeNull();
    root.remove();
  });
  it('settings close on outside click and Escape; Escape does not reach the rest', async () => {
    const root = await mount();
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
