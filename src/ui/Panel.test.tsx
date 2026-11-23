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

describe('resize', () => {
  beforeEach(() => localStorage.clear());
  const tick = () => new Promise((r) => setTimeout(r));
  const vp = { w: 1280, h: 800 };

  it('clampSize: min i max', async () => {
    const { clampSize } = await import('./useResize');
    expect(clampSize({ w: 100, h: 100 }, vp)).toEqual({ w: 480, h: 320 });
    expect(clampSize({ w: 5000, h: 5000 }, vp)).toEqual({ w: 1248, h: 708 });
    expect(clampSize({ w: 600, h: 400 }, vp)).toEqual({ w: 600, h: 400 });
    // małe okno: nie schodzi poniżej minimum
    expect(clampSize({ w: 600, h: 400 }, { w: 300, h: 300 })).toEqual({ w: 480, h: 320 });
  });

  it('drag lewej krawędzi i narożnika zmienia rozmiar (prawo-dół zakotwiczone)', () => {
    const root = document.createElement('div');
    const onResize = vi.fn();
    render(<Panel onClose={() => {}} viewport={vp} onResize={onResize} />, root);
    const panel = root.querySelector('.panel') as HTMLElement;
    panel.getBoundingClientRect = () => ({ width: 720, height: 480 }) as DOMRect;
    const ev = (t: string, x: number, y: number) => new MouseEvent(t, { clientX: x, clientY: y, bubbles: true });
    const l = root.querySelector('.rz-l') as HTMLElement;
    l.dispatchEvent(ev('pointerdown', 500, 300));
    l.dispatchEvent(ev('pointermove', 400, 250));
    expect(onResize).toHaveBeenLastCalledWith({ w: 820, h: 480 });
    l.dispatchEvent(ev('pointerup', 400, 250));
    const tl = root.querySelector('.rz-tl') as HTMLElement;
    tl.dispatchEvent(ev('pointerdown', 500, 300));
    tl.dispatchEvent(ev('pointermove', 450, 200));
    expect(onResize).toHaveBeenLastCalledWith({ w: 770, h: 580 });
    const t = root.querySelector('.rz-t') as HTMLElement;
    t.dispatchEvent(ev('pointerdown', 500, 300));
    t.dispatchEvent(ev('pointermove', 100, 100));
    expect(onResize).toHaveBeenLastCalledWith({ w: 720, h: 680 });
  });

  it('reset widoczny tylko po ręcznej zmianie i poza fullscreen; fullscreen bez uchwytów', () => {
    const root = document.createElement('div');
    render(<Panel onClose={() => {}} />, root);
    expect(root.querySelector('.reset-size')).toBeNull();
    const onReset = vi.fn();
    render(<Panel onClose={() => {}} size={{ w: 600, h: 400 }} onReset={onReset} />, root);
    expect((root.querySelector('.panel') as HTMLElement).style.width).toBe('600px');
    (root.querySelector('.reset-size') as HTMLButtonElement).click();
    expect(onReset).toHaveBeenCalled();
    render(<Panel onClose={() => {}} fullscreen size={{ w: 600, h: 400 }} />, root);
    expect(root.querySelector('.reset-size')).toBeNull();
    expect(root.querySelector('.rz')).toBeNull();
    expect((root.querySelector('.panel') as HTMLElement).style.width).toBe('');
  });

  it('App: rozmiar persist, reset czyści zapis, fullscreen zachowuje zapis', async () => {
    localStorage.setItem('tl-support:size', JSON.stringify({ w: 600, h: 400 }));
    const root = document.createElement('div');
    render(<App />, root);
    (root.querySelector('.fab') as HTMLButtonElement).click();
    await tick();
    expect((root.querySelector('.panel') as HTMLElement).style.width).toBe('600px');
    (root.querySelector('.fs') as HTMLButtonElement).click();
    await tick();
    expect(localStorage.getItem('tl-support:size')).not.toBeNull();
    (root.querySelector('.fs') as HTMLButtonElement).click();
    await tick();
    expect((root.querySelector('.panel') as HTMLElement).style.width).toBe('600px');
    (root.querySelector('.reset-size') as HTMLButtonElement).click();
    await tick();
    expect(localStorage.getItem('tl-support:size')).toBeNull();
    expect(root.querySelector('.reset-size')).toBeNull();
  });
});
