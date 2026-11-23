import { useRef, useState } from 'preact/hooks';
import { collectMonth, detectLineManagerId, type CollectError } from '../collector/collect';
import { downloadCsv } from '../export/csv';
import { clearAll, getSnapshot, openDb, saveSnapshot } from '../storage/db';
import type { Snapshot } from '../domain/types';

const SOURCE: Record<CollectError['source'], string> = { people: 'lista osób', leaves: 'urlopy', timesheet: 'czas pracy' };

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
      setStatus('Nie rozpoznano zalogowanego użytkownika — otwórz zwykłą stronę intranetu.');
      return;
    }
    const ac = (abort.current = new AbortController());
    setBusy(true);
    setErrors([]);
    setStatus('');
    try {
      const r = await collectMonth({ month, lineManagerId, extraPeople, signal: ac.signal, onProgress: (d, t) => setProgress([d, t]) });
      setErrors(r.errors);
      if (r.loggedOut) setStatus('Zaloguj się do intranetu');
      else if (r.cancelled) setStatus('Anulowano');
      else if (r.snapshot && r.errors.length === 0) {
        const db = await openDb();
        await saveSnapshot(db, r.snapshot);
        db.close();
        onData?.(r.snapshot);
        setStatus(`Zapisano ${month}`);
      } else setStatus('Nie zapisano — pobranie niekompletne');
    } catch (e) {
      setStatus(`Błąd: ${e instanceof Error ? e.message : e}`);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  async function exportCsv() {
    const db = await openDb();
    const s = await getSnapshot(db, month);
    db.close();
    if (!s) setStatus(`Brak danych dla ${month} — najpierw „Odśwież”`);
    else downloadCsv(s);
  }

  async function clear() {
    if (!confirm('Usunąć wszystkie zapisane dane (wszystkie miesiące)? Tej operacji nie można cofnąć.')) return;
    const db = await openDb();
    await clearAll(db);
    db.close();
    onData?.(undefined);
    setStatus('Dane wyczyszczone');
  }

  return (
    <div class="refresh-bar">
      {busy ? (
        <button type="button" class="btn cancel" onClick={() => abort.current?.abort()}>
          Anuluj
        </button>
      ) : (
        <button type="button" class="btn primary refresh" onClick={refresh}>
          Odśwież
        </button>
      )}
      <button type="button" class="btn export" disabled={busy} onClick={exportCsv}>
        Eksport CSV
      </button>
      <button type="button" class="btn ghost danger clear" disabled={busy} onClick={clear}>
        Wyczyść dane
      </button>
      <span class="refresh-status">
        {progress && <span class="progress">{progress[0]} / {progress[1]} stron</span>}
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
