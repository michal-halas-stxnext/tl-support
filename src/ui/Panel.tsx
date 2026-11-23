import { useRef } from 'preact/hooks';
import { Tabs, type TabDef } from './Tabs';
import { clampSize, type Size, type Viewport } from './useResize';

type Props = {
  onClose: () => void;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
  /** Ręcznie ustawiony rozmiar (już zaklamrowany); brak = domyślny. */
  size?: Size;
  viewport?: Viewport;
  onResize?: (s: Size) => void;
  onReset?: () => void;
  /** Domyślnie rejestr TABS. */
  tabs?: TabDef[];
};

type Edge = 'l' | 't' | 'tl';

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);
const ICONS = {
  expand: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7',
  shrink: 'M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7',
  close: 'M18 6 6 18M6 6l12 12',
  reset: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
};

export function Panel({ onClose, fullscreen = false, onToggleFullscreen, size, viewport, onResize, onReset, tabs }: Props) {
  const ref = useRef<HTMLElement>(null);
  const drag = useRef<{ x: number; y: number; w: number; h: number; edge: Edge } | null>(null);
  const vp = () => viewport ?? { w: window.innerWidth, h: window.innerHeight };

  const down = (edge: Edge) => (e: PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    drag.current = { x: e.clientX, y: e.clientY, w: r.width, h: r.height, edge };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    e.preventDefault();
  };
  const move = (e: PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    // panel kotwiczony prawy-dół: ruch w lewo/górę powiększa
    const w = d.edge === 't' ? d.w : d.w + (d.x - e.clientX);
    const h = d.edge === 'l' ? d.h : d.h + (d.y - e.clientY);
    onResize?.(clampSize({ w, h }, vp()));
  };
  const up = () => {
    drag.current = null;
  };
  const grip = (edge: Edge) => ({ onPointerDown: down(edge), onPointerMove: move, onPointerUp: up, onPointerCancel: up });
  const manual = !!size && !fullscreen;

  return (
    <section
      ref={ref}
      class={fullscreen ? 'panel fullscreen' : 'panel'}
      style={manual ? { width: `${size!.w}px`, height: `${size!.h}px` } : undefined}
      role="dialog"
      aria-label="TL Support"
    >
      {!fullscreen && (
        <>
          <div class="rz rz-l" {...grip('l')} />
          <div class="rz rz-t" {...grip('t')} />
          <div class="rz rz-tl" {...grip('tl')} />
        </>
      )}
      <header>
        <strong>TL Support</strong>
        <span class="actions">
          {manual && (
            <button type="button" class="icon-btn reset-size" aria-label="Przywróć domyślny rozmiar" title="Przywróć domyślny rozmiar" onClick={onReset}>
              <Icon d={ICONS.reset} />
            </button>
          )}
          <button
            type="button"
            class="icon-btn fs"
            aria-label={fullscreen ? 'Zamknij pełny ekran' : 'Pełny ekran'}
            title={fullscreen ? 'Zamknij pełny ekran' : 'Pełny ekran'}
            onClick={onToggleFullscreen}
          >
            <Icon d={fullscreen ? ICONS.shrink : ICONS.expand} />
          </button>
          <button type="button" class="icon-btn close" aria-label="Zamknij" onClick={onClose}>
            <Icon d={ICONS.close} />
          </button>
        </span>
      </header>
      <div class="body">
        <Tabs tabs={tabs} />
      </div>
    </section>
  );
}
