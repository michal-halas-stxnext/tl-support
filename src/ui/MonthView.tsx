import { useEffect, useRef, useState } from 'preact/hooks';
import type { Snapshot } from '../domain/types';
import { getSnapshot, openDb } from '../storage/db';
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from '../settings/settings';
import { Legend, MonthGrid } from './MonthGrid';
import { RefreshBar } from './RefreshBar';
import { SettingsPanel } from './Settings';

export const shiftMonth = (m: string, d: number) => {
  const [y, mo] = m.split('-').map(Number);
  const t = new Date(Date.UTC(y, mo - 1 + d, 1));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}`;
};
const thisMonth = () => new Date().toISOString().slice(0, 7);

type Props = {
  /** Wstrzykiwane w trybie demo / testach; domyślnie IndexedDB. */
  loadSnapshot?: (month: string) => Promise<Snapshot | undefined>;
  initialMonth?: string;
  /** Tryb demo: bez przycisków pobierania z intranetu. */
  demo?: boolean;
};

async function fromDb(month: string) {
  const db = await openDb();
  try {
    return await getSnapshot(db, month);
  } finally {
    db.close();
  }
}

export function MonthView({ loadSnapshot = fromDb, initialMonth, demo = false }: Props) {
  const [month, setMonth] = useState(initialMonth ?? thisMonth());
  const [snapshot, setSnapshot] = useState<Snapshot | undefined>();
  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [reload, setReload] = useState(0);
  const anchor = useRef<HTMLSpanElement>(null);

  // Ustawienia: zamknięcie klikiem poza nimi lub Escape (Escape nie dociera do reszty panelu).
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

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);
  useEffect(() => {
    let alive = true;
    setLoaded(false);
    loadSnapshot(month)
      .catch(() => undefined)
      .then((s) => {
        if (alive) {
          setSnapshot(s);
          setLoaded(true);
        }
      });
    return () => {
      alive = false;
    };
  }, [month, reload]);

  const change = (s: Settings) => {
    setSettings(s);
    void saveSettings(s);
  };

  return (
    <div class="month-view">
      <div class="month-nav">
        <button type="button" class="btn ghost prev" aria-label="Poprzedni miesiąc" onClick={() => setMonth(shiftMonth(month, -1))}>←</button>
        <strong class="month-label">{month}</strong>
        <button type="button" class="btn ghost next" aria-label="Następny miesiąc" onClick={() => setMonth(shiftMonth(month, 1))}>→</button>
        <span class="settings-anchor" ref={anchor}>
          <button type="button" class="btn settings-toggle" aria-pressed={showSettings} onClick={() => setShowSettings(!showSettings)}>Ustawienia</button>
          {showSettings && <SettingsPanel settings={settings} people={snapshot?.people ?? []} onChange={change} />}
        </span>
        <span class="fetched">{snapshot ? `Odświeżono: ${new Date(snapshot.fetchedAt).toLocaleString('pl-PL')}` : ''}</span>
      </div>
      {!demo && <RefreshBar month={month} extraPeople={settings.extraPeople} onData={() => setReload((n) => n + 1)} />}
      <div class="content">
        {!loaded && <div class="loading" role="status" aria-label="Ładowanie" />}
        {loaded && !snapshot && <p class="no-data">Brak danych dla {month} — kliknij „Odśwież”.</p>}
        {snapshot && <MonthGrid snapshot={snapshot} settings={settings} />}
      </div>
      <Legend />
    </div>
  );
}
