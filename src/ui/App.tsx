import { useEffect, useState } from 'preact/hooks';
import { Panel } from './Panel';

const FS_KEY = 'tl-support:fullscreen';

function loadFullscreen(): boolean {
  try {
    return localStorage.getItem(FS_KEY) === '1';
  } catch {
    return false;
  }
}

function saveFullscreen(v: boolean) {
  try {
    localStorage.setItem(FS_KEY, v ? '1' : '0');
  } catch {
    /* brak dostępu do storage — pomijamy */
  }
}

export function App() {
  const [open, setOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(loadFullscreen);

  const setFs = (v: boolean) => {
    setFullscreen(v);
    saveFullscreen(v);
  };

  useEffect(() => {
    if (!(open && fullscreen)) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFs(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, fullscreen]);

  return (
    <>
      {open && (
        <Panel
          onClose={() => setOpen(false)}
          fullscreen={fullscreen}
          onToggleFullscreen={() => setFs(!fullscreen)}
        />
      )}
      {!(open && fullscreen) && (
        <button
          type="button"
          class="fab"
          aria-label="TL Support"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          TL
        </button>
      )}
    </>
  );
}
