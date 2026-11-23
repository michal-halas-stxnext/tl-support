import { useRef, useState } from 'preact/hooks';
import type { CollectError } from '../collector/collect';
import { LoggedOutError } from '../collector/http';
import { usePanel } from './PanelContext';

export type RefreshOutcome = { status?: string; errors?: CollectError[] } | void;
export type RefreshHandler = (o: { signal: AbortSignal; onProgress: (done: number, total: number) => void }) => Promise<RefreshOutcome>;

/** Busy/progress/status/errors state around a refresh handler (Cancel via `cancel`). */
export function useRefresh(handler: RefreshHandler) {
  const { setLoggedOut } = usePanel();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState<CollectError[]>([]);
  const abort = useRef<AbortController | null>(null);

  async function run() {
    if (busy) return;
    const ac = (abort.current = new AbortController());
    setBusy(true);
    setErrors([]);
    setStatus('');
    try {
      const r = await handler({ signal: ac.signal, onProgress: (d, t) => setProgress([d, t]) });
      if (r) {
        setErrors(r.errors ?? []);
        setStatus(r.status ?? '');
      }
    } catch (e) {
      if (e instanceof LoggedOutError) setLoggedOut(true);
      else setStatus(`Error: ${e instanceof Error ? e.message : e}`);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }
  return { busy, progress, status, errors, run, cancel: () => abort.current?.abort() };
}
