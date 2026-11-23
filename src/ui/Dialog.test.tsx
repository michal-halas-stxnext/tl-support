import { render } from 'preact';
import { describe, expect, it } from 'vitest';
import { DialogProvider, useDialog } from './Dialog';

const tick = () => new Promise((r) => setTimeout(r, 30));

function mount() {
  const out: { result?: boolean; api?: ReturnType<typeof useDialog> } = {};
  const Probe = () => {
    out.api = useDialog();
    return null;
  };
  const root = document.createElement('div');
  document.body.append(root);
  render(<DialogProvider><Probe /></DialogProvider>, root);
  return { root, out };
}
const ask = (out: ReturnType<typeof mount>['out']) => {
  out.result = undefined;
  void out.api!.confirm({ title: 'T', message: 'Sure?', confirmLabel: 'Delete', danger: true }).then((v) => (out.result = v));
};

describe('Dialog', () => {
  it('confirm resolves true on the confirm button; shows title, message, label', async () => {
    const { root, out } = mount();
    ask(out);
    await tick();
    expect(root.querySelector('.dialog h4')?.textContent).toBe('T');
    expect(root.querySelector('.dialog p')?.textContent).toBe('Sure?');
    expect(root.querySelector('.dialog-ok')?.textContent).toBe('Delete');
    (root.querySelector('.dialog-ok') as HTMLButtonElement).click();
    await tick();
    expect(out.result).toBe(true);
    expect(root.querySelector('.dialog')).toBeNull();
    root.remove();
  });
  it('Cancel, backdrop click and Escape resolve false; Escape does not leak', async () => {
    const { root, out } = mount();
    ask(out);
    await tick();
    (root.querySelector('.dialog-cancel') as HTMLButtonElement).click();
    await tick();
    expect(out.result).toBe(false);
    ask(out);
    await tick();
    root.querySelector('.dialog-backdrop')!.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await tick();
    expect(out.result).toBe(false);
    expect(root.querySelector('.dialog')).toBeNull();
    ask(out);
    await tick();
    let leaked = false;
    const spy = () => (leaked = true);
    document.addEventListener('keydown', spy);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await tick();
    document.removeEventListener('keydown', spy);
    expect(out.result).toBe(false);
    expect(root.querySelector('.dialog')).toBeNull();
    expect(leaked).toBe(false);
    root.remove();
  });
  it('alert has a single OK button', async () => {
    const { root, out } = mount();
    void out.api!.alert({ message: 'Heads up' });
    await tick();
    expect(root.querySelector('.dialog-cancel')).toBeNull();
    expect(root.querySelector('.dialog-ok')?.textContent).toBe('OK');
    root.remove();
  });
});
