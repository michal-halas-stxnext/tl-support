import { useRef, useState } from 'preact/hooks';
import { collectMonth, detectLineManagerId, type CollectError } from '../collector/collect';
import { downloadCsv } from '../export/csv';
import { clearAll, getSnapshot, openDb, saveSnapshot } from '../storage/db';
import type { Snapshot } from '../domain/types';

const SOURCE: Record<CollectError['source'], string> = { people: 'people list', leaves: 'leaves', timesheet: 'timesheet' };

type Props = { month: string; extraPeople?: { id: string; name: string }[]; onData?: (s: Snapshot | undefined) => void };

export function RefreshBar({ month, extraPeople, onData }: Props) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState<CollectError[]>([]);
  const abort = useRef<AbortController | null>(null);

  async function refresh() {
    const lineManagerId = detectLineManagerId();
    if (!lineManagerId) {
      setStatus('Could not detect the logged-in user — open a regular intranet page.');
      return;
    }
    const ac = (abort.current = new AbortController());
    setBusy(true);
    setErrors([]);
    setStatus('');
    try {
      const r = await collectMonth({ month, lineManagerId, extraPeople, signal: ac.signal, onProgress: (d, t) => setProgress([d, t]) });
      setErrors(r.errors);
      if (r.loggedOut) setStatus('Log in to the intranet');
      else if (r.cancelled) setStatus('Cancelled');
      else if (r.snapshot && r.errors.length === 0) {
        const db = await openDb();
        await saveSnapshot(db, r.snapshot);
        db.close();
        onData?.(r.snapshot);
        setStatus(`Saved ${month}`);
      } else setStatus('Not saved — fetch incomplete');
    } catch (e) {
      setStatus(`Error: ${e instanceof Error ? e.message : e}`);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  async function exportCsv() {
    const db = await openDb();
    const s = await getSnapshot(db, month);
    db.close();
    if (!s) setStatus(`No data for ${month} — click “Refresh” first`);
    else downloadCsv(s);
  }

  async function clear() {
    if (!confirm('Delete all saved data (all months)? This cannot be undone.')) return;
    const db = await openDb();
    await clearAll(db);
    db.close();
    onData?.(undefined);
    setStatus('Data cleared');
  }

  return (
    <div class="refresh-bar">
      {busy ? (
        <button type="button" class="btn cancel" onClick={() => abort.current?.abort()}>
          Cancel
        </button>
      ) : (
        <button type="button" class="btn primary refresh" onClick={refresh}>
          Refresh
        </button>
      )}
      <button type="button" class="btn export" disabled={busy} onClick={exportCsv}>
        Export CSV
      </button>
      <button type="button" class="btn ghost danger clear" disabled={busy} onClick={clear}>
        Clear data
      </button>
      <span class="refresh-status">
        {progress && <span class="progress">{progress[0]} / {progress[1]} pages</span>}
        {status && <span class="status" role="status">{status}</span>}
      </span>
      {errors.length > 0 && (
        <ul class="errors">
          {errors.map((e) => (
            <li>{SOURCE[e.source]}: {e.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
