import { useEffect, useRef, useState } from 'preact/hooks';
import { MonthNav } from './MonthNav';
import { usePanel } from './PanelContext';
import { SettingsPanel } from './Settings';

/** Panel-wide toolbar: month, Settings, session message. */
export function Toolbar() {
  const { month, setMonth, settings, changeSettings, people, lineManagerId, loggedOut } = usePanel();
  const [showSettings, setShowSettings] = useState(false);
  const anchor = useRef<HTMLSpanElement>(null);

  // Settings: close on click outside or Escape (Escape does not reach the rest of the panel).
  useEffect(() => {
    if (!showSettings) return;
    const onDown = (e: Event) => {
      const el = anchor.current;
      if (el && !e.composedPath().includes(el)) setShowSettings(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      setShowSettings(false);
    };
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [showSettings]);

  const session = !lineManagerId
    ? 'Could not detect the logged-in user — open a regular intranet page.'
    : loggedOut
      ? 'Log in to the intranet'
      : '';

  return (
    <div class="toolbar">
      <MonthNav month={month} onChange={setMonth} />
      <span class="refresh-status">
        {session && <span class="status session" role="status">{session}</span>}
      </span>
      <span class="settings-anchor" ref={anchor}>
        <button type="button" class="icon-btn settings-toggle" aria-label="Settings" title="Settings" aria-pressed={showSettings} onClick={() => setShowSettings(!showSettings)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
        {showSettings && <SettingsPanel settings={settings} people={people} onChange={changeSettings} />}
      </span>
    </div>
  );
}
