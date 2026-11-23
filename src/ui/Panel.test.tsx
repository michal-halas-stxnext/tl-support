import 'fake-indexeddb/auto';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from 'preact';
import { Panel } from './Panel';
import { App } from './App';

describe('Panel', () => {
  beforeEach(() => localStorage.clear());

  it('renderuje się i wywołuje onClose', () => {
    const root = document.createElement('div');
    const onClose = vi.fn();
    render(<Panel onClose={onClose} />, root);
    expect(root.textContent).toContain('TL Support');
    (root.querySelector('.close') as HTMLButtonElement).click();
    expect(onClose).toHaveBeenCalled();
  });

  it('przycisk otwiera i zamyka panel', async () => {
    const root = document.createElement('div');
    render(<App />, root);
    const fab = root.querySelector('.fab') as HTMLButtonElement;
    expect(root.querySelector('.panel')).toBeNull();
    fab.click();
    await new Promise((r) => setTimeout(r));
    expect(root.querySelector('.panel')).not.toBeNull();
    fab.click();
    await new Promise((r) => setTimeout(r));
    expect(root.querySelector('.panel')).toBeNull();
  });

  it('fullscreen ukrywa przycisk TL, wyjście go przywraca', async () => {
    const root = document.createElement('div');
    render(<App />, root);
    const tick = () => new Promise((r) => setTimeout(r));
    (root.querySelector('.fab') as HTMLButtonElement).click();
    await tick();
    (root.querySelector('.fs') as HTMLButtonElement).click();
    await tick();
    expect(root.querySelector('.panel.fullscreen')).not.toBeNull();
    expect(root.querySelector('.fab')).toBeNull();
    (root.querySelector('.fs') as HTMLButtonElement).click();
    await tick();
    expect(root.querySelector('.panel.fullscreen')).toBeNull();
    expect(root.querySelector('.fab')).not.toBeNull();
  });

  it('Escape wychodzi z fullscreen, zamknięcie zapamiętuje tryb', async () => {
    const root = document.createElement('div');
    render(<App />, root);
    const tick = () => new Promise((r) => setTimeout(r));
    (root.querySelector('.fab') as HTMLButtonElement).click();
    await tick();
    (root.querySelector('.fs') as HTMLButtonElement).click();
    await new Promise((r) => setTimeout(r, 50)); // efekt Preact odpala się po renderze
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await tick();
    expect(root.querySelector('.panel.fullscreen')).toBeNull();
    expect(root.querySelector('.panel')).not.toBeNull();
    // fullscreen, zamknij przez ×, otwórz ponownie → nadal fullscreen
    (root.querySelector('.fs') as HTMLButtonElement).click();
    await tick();
    (root.querySelector('.close') as HTMLButtonElement).click();
    await tick();
    (root.querySelector('.fab') as HTMLButtonElement).click();
    await tick();
    expect(root.querySelector('.panel.fullscreen')).not.toBeNull();
  });
});
