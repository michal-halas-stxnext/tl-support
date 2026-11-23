import { useEffect, useState } from 'preact/hooks';
import { collectMonth } from '../collector/collect';
import type { Snapshot } from '../domain/types';
import { getSnapshot, openDb, saveSnapshot } from '../storage/db';
import { DataActions } from './DataActions';
import { Legend, MonthGrid } from './MonthGrid';
import { usePanel } from './PanelContext';
import { useRefresh } from './useRefresh';

export { shiftMonth } from './MonthNav';

type Props = {
  /** Injected in demo mode / tests; defaults to IndexedDB. */
  loadSnapshot?: (month: string) => Promise<Snapshot | undefined>;
  /** Injected in tests; defaults to the intranet collector. */
  collect?: typeof collectMonth;
  /** Injected in tests; defaults to IndexedDB. */
  save?: (s: Snapshot) => Promise<void>;
  /** Demo mode: Refresh only reloads, no intranet fetch; no Export/Clear. */
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
async function toDb(s: Snapshot) {
  const db = await openDb();
  try {
    await saveSnapshot(db, s);
  } finally {
    db.close();
  }
}

export function MonthView({ loadSnapshot = fromDb, collect = collectMonth, save = toDb, demo = false }: Props) {
  const { month, settings, lineManagerId, setLoggedOut, setPeople } = usePanel();
  const [snapshot, setSnapshot] = useState<Snapshot | undefined>();
  const [loaded, setLoaded] = useState(false);
  const [reload, setReload] = useState(0);

  const refresh = useRefresh(async ({ signal, onProgress }) => {
    if (demo) {
      setReload((n) => n + 1);
      return { status: `Reloaded ${month}` };
    }
    const r = await collect({ month, lineManagerId: lineManagerId!, extraPeople: settings.extraPeople, signal, onProgress });
    if (r.loggedOut) {
      setLoggedOut(true);
      return { errors: r.errors };
    }
    setLoggedOut(false);
    if (r.cancelled) return { status: 'Cancelled', errors: r.errors };
    if (r.snapshot && r.errors.length === 0) {
      await save(r.snapshot);
      setReload((n) => n + 1);
      return { status: `Saved ${month}` };
    }
    return { status: 'Not saved — fetch incomplete', errors: r.errors };
  });

  useEffect(() => {
    let alive = true;
    setLoaded(false);
    loadSnapshot(month)
      .catch(() => undefined)
      .then((s) => {
        if (alive) {
          setSnapshot(s);
          setLoaded(true);
          if (s) setPeople(s.people);
        }
      });
    return () => {
      alive = false;
    };
  }, [month, reload]);

  const fetched = snapshot ? `Refreshed: ${new Date(snapshot.fetchedAt).toLocaleString('en-GB')}` : '';

  return (
    <div class="month-view">
      <DataActions month={month} fetched={fetched} refresh={refresh} demo={demo} onData={() => setReload((n) => n + 1)} />
      <div class="content">
        {!loaded && <div class="loading" role="status" aria-label="Loading" />}
        {loaded && !snapshot && <p class="no-data">No data for {month} — click “Refresh”.</p>}
        {snapshot && <MonthGrid snapshot={snapshot} settings={settings} />}
      </div>
      <Legend />
    </div>
  );
}
