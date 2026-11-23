import { MonthView } from './MonthView';

type Props = { onClose: () => void; fullscreen?: boolean; onToggleFullscreen?: () => void };

export function Panel({ onClose, fullscreen = false, onToggleFullscreen }: Props) {
  return (
    <section class={fullscreen ? 'panel fullscreen' : 'panel'} role="dialog" aria-label="TL Support">
      <header>
        <strong>TL Support</strong>
        <span class="actions">
          <button
            type="button"
            class="fs"
            aria-label={fullscreen ? 'Zamknij pełny ekran' : 'Pełny ekran'}
            title={fullscreen ? 'Zamknij pełny ekran' : 'Pełny ekran'}
            onClick={onToggleFullscreen}
          >
            {fullscreen ? '⤡' : '⤢'}
          </button>
          <button type="button" class="close" aria-label="Zamknij" onClick={onClose}>
            ×
          </button>
        </span>
      </header>
      <div class="body">
        <MonthView />
      </div>
    </section>
  );
}
