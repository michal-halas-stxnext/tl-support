import { useState } from 'preact/hooks';
import { SOURCE_LABEL } from './labels';
import { downloadCsv } from '../export/csv';
import { clearAll, getSnapshot, openDb } from '../storage/db';
import type { Snapshot } from '../domain/types';
import { useDialog } from './Dialog';
import { usePanel } from './PanelContext';
import type { useRefresh } from './useRefresh';

type Props = {
  month: string;
  fetched?: string;
  refresh: ReturnType<typeof useRefresh>;
  /** Demo: Refresh only, no Export/Clear. */
  demo?: boolean;
  onData?: (s: Snapshot | undefined) => void;
};

/** Time logged action row: Refresh/Cancel, Clear data, Export CSV, status, "Refreshed" label. */
export function DataActions({ month, fetched = '', refresh, demo = false, onData }: Props) {
  const { lineManagerId } = usePanel();
  const { confirm } = useDialog();
  const [status, setStatus] = useState('');
  const { busy, progress, errors } = refresh;

  async function exportCsv() {
    const db = await openDb();
    const s = await getSnapshot(db, month);
    db.close();
    if (!s) setStatus(`No data for ${month} — click “Refresh” first`);
    else downloadCsv(s);
  }

  async function clear() {
    const ok = await confirm({ title: 'Clear data', message: 'Delete all saved data (all months)? This cannot be undone.', confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    const db = await openDb();
    await clearAll(db);
    db.close();
    onData?.(undefined);
    setStatus('Data cleared');
  }

  const shown = refresh.status || status;
  return (
    <div class="refresh-bar">
      {busy ? (
        <button type="button" class="btn cancel" onClick={refresh.cancel}>
          Cancel
        </button>
      ) : (
        <button type="button" class="btn primary refresh" disabled={!lineManagerId} onClick={refresh.run}>
          Refresh
        </button>
      )}
      {!demo && (
        <>
          <button type="button" class="btn ghost danger clear" disabled={busy} onClick={clear}>
            Clear data
          </button>
          <button type="button" class="btn export" disabled={busy} onClick={exportCsv}>
            Export CSV
          </button>
        </>
      )}
      <span class="refresh-status">
        {progress && <span class="progress">{progress[0]} / {progress[1]} pages</span>}
        {shown && <span class="status" role="status">{shown}</span>}
      </span>
      <span class="fetched">{fetched}</span>
      {errors.length > 0 && (
        <ul class="errors">
          {errors.map((e) => (
            <li>{SOURCE_LABEL[e.source]}: {e.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
