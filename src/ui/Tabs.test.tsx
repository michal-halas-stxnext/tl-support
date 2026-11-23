import { render } from 'preact';
import { beforeEach, describe, expect, it } from 'vitest';
import { Tabs, type TabDef } from './Tabs';

const tick = () => new Promise((r) => setTimeout(r, 20));
const mk = (id: string): TabDef => ({ id, label: id.toUpperCase(), component: () => <p class={`c-${id}`}>{id}</p> });
const tabs = [mk('a'), mk('b'), mk('c')];

describe('Tabs', () => {
  beforeEach(() => localStorage.clear());

  it('pierwszy tab aktywny, ARIA', () => {
    const root = document.createElement('div');
    render(<Tabs tabs={tabs} />, root);
    const t = root.querySelectorAll('[role=tab]');
    expect(t).toHaveLength(3);
    expect(t[0].getAttribute('aria-selected')).toBe('true');
    expect(t[1].getAttribute('aria-selected')).toBe('false');
    expect(root.querySelector('[role=tabpanel]')?.getAttribute('aria-labelledby')).toBe('tab-a');
    expect(root.querySelector('.c-a')).not.toBeNull();
  });

  it('default registry: Time logged + Approval', () => {
    const root = document.createElement('div');
    render(<Tabs />, root);
    expect(Array.from(root.querySelectorAll('[role=tab]')).map((x) => x.textContent)).toEqual(['Time logged', 'Approval']);
  });

  it('click and keyboard (←/→, Home/End), remembers selection, constant number of bar nodes', async () => {
    const root = document.createElement('div');
    document.body.append(root);
    render(<Tabs tabs={tabs} />, root);
    const list = root.querySelector('[role=tablist]') as HTMLElement;
    const key = (k: string) => list.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    const active = () => root.querySelector('[role=tab][aria-selected=true]')?.textContent;
    const before = list.children.length;
    key('ArrowRight'); await tick();
    expect(active()).toBe('B');
    key('End'); await tick();
    expect(active()).toBe('C');
    key('ArrowRight'); await tick();
    expect(active()).toBe('A');
    key('ArrowLeft'); await tick();
    expect(active()).toBe('C');
    key('Home'); await tick();
    expect(active()).toBe('A');
    (root.querySelectorAll('[role=tab]')[1] as HTMLButtonElement).click(); await tick();
    expect(root.querySelector('.c-b')).not.toBeNull();
    expect(list.children.length).toBe(before);
    expect(localStorage.getItem('tl-support:tab')).toBe('b');
    const root2 = document.createElement('div');
    render(<Tabs tabs={tabs} />, root2);
    expect(root2.querySelector('[role=tab][aria-selected=true]')?.textContent).toBe('B');
    root.remove();
  });
});
