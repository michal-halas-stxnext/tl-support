import { useEffect, useMemo, useState } from 'preact/hooks';
import { acceptEntries, fetchApproval, rejectEntries, type ApprovalResult } from '../approval/api';
import { groupByPerson, type BillabilityFilter } from '../approval/model';
import { detectLineManagerId } from '../collector/collect';
import { LoggedOutError, type FetchLike } from '../collector/http';
import type { ApprovalEntry } from '../domain/types';
import { shiftMonth } from './MonthView';

const thisMonth = () => new Date().toISOString().slice(0, 7);
const hm = (min: number) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`;
const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));
const STATE_LABEL: Record<string, string> = { OPEN: 'Do akceptacji', ACCEPTED: 'Zaakceptowane', REJECTED: 'Odrzucone' };

export type ApprovalDeps = {
  fetchEntries: (month: string, lineManagerId: string) => Promise<ApprovalEntry[]>;
  accept: (ids: string[]) => Promise<ApprovalResult>;
  reject: (ids: string[]) => Promise<ApprovalResult>;
};

const realFetch: FetchLike = (u, i) => fetch(u, i);
const realDeps: ApprovalDeps = {
  fetchEntries: (month, lineManagerId) => fetchApproval(realFetch, { month, lineManagerId }),
  accept: (ids) => acceptEntries(realFetch, ids),
  reject: (ids) => rejectEntries(realFetch, ids),
};

type Props = {
  /** Wstrzykiwane w demo/testach; domyślnie prawdziwe API intranetu. */
  deps?: ApprovalDeps;
  initialMonth?: string;
  lineManagerId?: string;
  confirmFn?: (text: string) => boolean;
};

export function ApprovalView({ deps = realDeps, initialMonth, lineManagerId, confirmFn = (t) => confirm(t) }: Props) {
  const [month, setMonth] = useState(initialMonth ?? thisMonth());
  const [entries, setEntries] = useState<ApprovalEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [billability, setBillability] = useState<BillabilityFilter>('all');
  const [state, setState] = useState('OPEN');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<{ text: string; error?: boolean }>({ text: '' });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    const lm = lineManagerId ?? detectLineManagerId();
    if (!lm) {
      setLoaded(true);
      setStatus({ text: 'Nie rozpoznano zalogowanego użytkownika — otwórz zwykłą stronę intranetu.', error: true });
      return;
    }
    setLoaded(false);
    deps
      .fetchEntries(month, lm)
      .then((e) => {
        if (!alive) return;
        setEntries(e);
        setSelected(new Set());
      })
      .catch((e) => {
        if (!alive) return;
        setEntries([]);
        setStatus({ text: e instanceof LoggedOutError ? 'Zaloguj się do intranetu' : `Błąd: ${msg(e)}`, error: true });
      })
      .finally(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, [month, reload]);

  const states = useMemo(() => [...new Set(['OPEN', 'ACCEPTED', 'REJECTED', ...entries.map((e) => e.state)])], [entries]);
  const groups = useMemo(() => groupByPerson(entries, { billability, state }), [entries, billability, state]);
  const byId = useMemo(() => new Map(entries.map((e) => [e.id, e])), [entries]);

  async function run(kind: 'accept' | 'reject', ids: string[]) {
    if (ids.length === 0 || busy) return;
    const verb = kind === 'accept' ? 'Zaakceptować' : 'Odrzucić';
    if (ids.length > 1 && !confirmFn(`${verb} ${ids.length} wpisów? Nie można wrócić do stanu „do akceptacji”.`)) return;
    setBusy(true);
    setStatus({ text: '' });
    try {
      const r = await (kind === 'accept' ? deps.accept : deps.reject)(ids);
      const done = kind === 'accept' ? 'Zaakceptowano' : 'Odrzucono';
      if (r.failed.length === 0) setStatus({ text: `${done}: ${r.ok.length}` });
      else setStatus({ text: `${done}: ${r.ok.length}, błąd: ${r.failed.length} (${r.failed[0]!.error})`, error: true });
      setReload((n) => n + 1);
    } catch (e) {
      setStatus({ text: e instanceof LoggedOutError ? 'Zaloguj się do intranetu' : `Błąd: ${msg(e)}`, error: true });
    } finally {
      setBusy(false);
    }
  }

  const idsOf = (list: ApprovalEntry[], kind: 'accept' | 'reject') =>
    list.filter((e) => (kind === 'accept' ? e.canAccept : e.canReject)).map((e) => e.id);
  const selectedEntries = [...selected].map((id) => byId.get(id)).filter((e): e is ApprovalEntry => !!e);
  const toggle = (set: Set<string>, id: string) => {
    const n = new Set(set);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  };

  return (
    <div class="approval-view">
      <div class="month-nav">
        <button type="button" class="btn ghost prev" aria-label="Poprzedni miesiąc" onClick={() => setMonth(shiftMonth(month, -1))}>←</button>
        <strong class="month-label">{month}</strong>
        <button type="button" class="btn ghost next" aria-label="Następny miesiąc" onClick={() => setMonth(shiftMonth(month, 1))}>→</button>
        <select class="sel billability" aria-label="Rodzaj godzin" value={billability} onChange={(e) => setBillability((e.target as HTMLSelectElement).value as BillabilityFilter)}>
          <option value="all">Wszystkie</option>
          <option value="billable">Billable</option>
          <option value="non">Non-billable</option>
        </select>
        <select class="sel state" aria-label="Stan" value={state} onChange={(e) => setState((e.target as HTMLSelectElement).value)}>
          <option value="all">Każdy stan</option>
          {states.map((s) => (
            <option value={s}>{STATE_LABEL[s] ?? s}</option>
          ))}
        </select>
      </div>
      <div class="approval-bar">
        <span class="sel-actions">
          <button type="button" class="btn sm primary acc-sel" disabled={busy || idsOf(selectedEntries, 'accept').length === 0} onClick={() => run('accept', idsOf(selectedEntries, 'accept'))}>
            Akceptuj zaznaczone ({selected.size})
          </button>
          <button type="button" class="btn sm danger rej-sel" disabled={busy || idsOf(selectedEntries, 'reject').length === 0} onClick={() => run('reject', idsOf(selectedEntries, 'reject'))}>
            Odrzuć zaznaczone
          </button>
        </span>
        <span class={status.error ? 'approval-status err' : 'approval-status'} role="status" title={status.text}>{status.text}</span>
      </div>
      <div class="content approval-list">
        {!loaded && <div class="loading" role="status" aria-label="Ładowanie" />}
        {loaded && groups.length === 0 && <p class="empty">Brak wpisów dla wybranych filtrów.</p>}
        {loaded &&
          groups.map((g) => {
            const open = expanded.has(g.personId);
            return (
              <section class="person" data-person={g.personId}>
                <div class="person-row">
                  <button type="button" class="btn ghost sm toggle" aria-expanded={open} aria-label={`${open ? 'Zwiń' : 'Rozwiń'} ${g.personName}`} onClick={() => setExpanded(toggle(expanded, g.personId))}>
                    {open ? '▾' : '▸'}
                  </button>
                  <strong class="pname">{g.personName}</strong>
                  <span class="sums">
                    <span class="bill">{hm(g.billableMinutes)}</span>
                    {g.nonBillableMinutes > 0 && <span class="nb" title="Non-billable">+{hm(g.nonBillableMinutes)}</span>}
                    <span class="cnt">{g.entries.length} wpis.</span>
                  </span>
                  <button type="button" class="btn sm primary acc-all" disabled={busy || idsOf(g.entries, 'accept').length === 0} onClick={() => run('accept', idsOf(g.entries, 'accept'))}>Akceptuj wszystko</button>
                  <button type="button" class="btn sm danger rej-all" disabled={busy || idsOf(g.entries, 'reject').length === 0} onClick={() => run('reject', idsOf(g.entries, 'reject'))}>Odrzuć wszystko</button>
                </div>
                {open && (
                  <ul class="entries">
                    {g.entries.map((e) => (
                      <li class="entry" data-entry={e.id}>
                        <input type="checkbox" aria-label={`Zaznacz wpis ${e.date}`} checked={selected.has(e.id)} disabled={!e.canAccept && !e.canReject} onChange={() => setSelected(toggle(selected, e.id))} />
                        <span class="d">{e.date.slice(5)}</span>
                        <span class="t">{hm(e.minutes)}</span>
                        {e.nonBillable && <span class="badge nb-badge">non-billable</span>}
                        <span class="p" title={e.project}>{e.project}</span>
                        <span class="desc" title={e.description}>{e.description.replace(/\s+/g, ' ')}</span>
                        <span class={`st st-${e.state}`}>{STATE_LABEL[e.state] ?? e.state}</span>
                        <button type="button" class="btn sm ghost acc-one" aria-label="Akceptuj wpis" disabled={busy || !e.canAccept} onClick={() => run('accept', [e.id])}>✓</button>
                        <button type="button" class="btn sm ghost danger rej-one" aria-label="Odrzuć wpis" disabled={busy || !e.canReject} onClick={() => run('reject', [e.id])}>✗</button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
      </div>
    </div>
  );
}
