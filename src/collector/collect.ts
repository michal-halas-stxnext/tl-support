import { COLLECTOR } from '../config';
import type { Leave, LeavesPage, Person, Snapshot, TimeEntry } from '../domain/types';
import { parseLeaves } from '../parsers/leaves';
import { parseTeamList } from '../parsers/teamList';
import { parseTimesheet } from '../parsers/timesheet';
import { CancelledError, fetchText, LoggedOutError, type FetchLike } from './http';
import { runPool } from './pool';

export interface CollectError {
  /** Źródło danych, które zawiodło. */
  source: 'people' | 'leaves' | 'timesheet';
  message: string;
}

export interface CollectResult {
  snapshot: Snapshot | null;
  errors: CollectError[];
  loggedOut: boolean;
  cancelled: boolean;
}

export interface CollectOptions {
  /** `YYYY-MM`. */
  month: string;
  /** Id koordynatora (`line_manager` w API approval). */
  lineManagerId: string;
  /** Osoby dodane ręcznie w ustawieniach — ich dane też zbieramy. */
  extraPeople?: Pick<Person, 'id' | 'name'>[];
  fetchFn?: FetchLike;
  signal?: AbortSignal;
  onProgress?: (done: number, total: number) => void;
  maxParallel?: number;
  delayMs?: number;
  now?: () => Date;
}

/** Wykrywa id zalogowanego z inline script (`Globals.user.id`, NOTES §2). Null gdy brak. */
export function detectLineManagerId(doc: Document = document): string | null {
  for (const s of Array.from(doc.querySelectorAll('script'))) {
    const m = /["']?\buser["']?\s*[:=]\s*\{[^}]*?["']?\bid["']?\s*:\s*["']?([\w-]+)["']?/.exec(s.textContent ?? '');
    if (m) return m[1];
  }
  return null;
}

const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

function overlapsMonth(l: Leave, month: string) {
  return l.from.slice(0, 7) <= month && l.to.slice(0, 7) >= month;
}

/**
 * Kolejność: lista podopiecznych → (urlopy roku + timesheet miesiąca) z limitem tempa.
 * Błąd jednego źródła nie przerywa pozostałych; wylogowanie i anulowanie przerywają.
 * Brak listy podopiecznych = brak snapshotu (nie wiadomo kogo filtrować).
 */
export async function collectMonth(o: CollectOptions): Promise<CollectResult> {
  const fetchFn: FetchLike = o.fetchFn ?? ((u, i) => fetch(u, i));
  const [yearStr, monthStr] = o.month.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const errors: CollectError[] = [];
  const total = 3;
  let done = 0;
  const tick = () => o.onProgress?.(++done, total);
  const pool = { maxParallel: o.maxParallel ?? COLLECTOR.maxParallel, delayMs: o.delayMs ?? COLLECTOR.delayMs, signal: o.signal };
  const result = (snapshot: Snapshot | null, extra: Partial<CollectResult> = {}): CollectResult => ({
    snapshot,
    errors,
    loggedOut: false,
    cancelled: false,
    ...extra,
  });
  const fatal = (e: unknown): CollectResult | null => {
    if (e instanceof LoggedOutError) return result(null, { loggedOut: true });
    if (e instanceof CancelledError) return result(null, { cancelled: true });
    return null;
  };

  o.onProgress?.(0, total);

  let people: Person[];
  try {
    const text = await fetchText(fetchFn, '/api/intranet4/users/universal?active=true', { signal: o.signal, expect: 'json' });
    people = parseTeamList(text, COLLECTOR.teamName);
  } catch (e) {
    const f = fatal(e);
    if (f) return f;
    errors.push({ source: 'people', message: msg(e) });
    return result(null);
  }
  tick();

  const absencesPath = `/employees/table/absences?year=${year}&team=${COLLECTOR.absencesTeamId}&location=0&department=0`;
  const tsPath =
    `/api/times/approval?line_manager=${encodeURIComponent(o.lineManagerId)}` +
    `&month=${o.month}-01&billability=ALL&state=ALL`;

  const [leavesRes, tsRes] = await runPool<LeavesPage | TimeEntry[]>(
    [
      async () => {
        const r = parseLeaves(await fetchText(fetchFn, absencesPath, { signal: o.signal, expect: 'html' }));
        tick();
        return r;
      },
      async () => {
        const r = parseTimesheet(await fetchText(fetchFn, tsPath, { signal: o.signal, expect: 'json' }), year, month);
        tick();
        return r;
      },
    ],
    pool,
  );

  for (const [r, source] of [[leavesRes, 'leaves'], [tsRes, 'timesheet']] as const) {
    if (r.status === 'rejected') {
      const f = fatal(r.reason);
      if (f) return f;
      errors.push({ source, message: msg(r.reason) });
    }
  }

  const ids = new Set([...people.map((p) => p.id), ...(o.extraPeople ?? []).map((p) => p.id)]);
  const page = leavesRes.status === 'fulfilled' ? (leavesRes.value as LeavesPage) : null;
  const entries = tsRes.status === 'fulfilled' ? (tsRes.value as TimeEntry[]) : [];
  const snapshot: Snapshot = {
    month: o.month,
    fetchedAt: (o.now?.() ?? new Date()).toISOString(),
    people,
    leaves: (page?.leaves ?? []).filter((l) => ids.has(l.personId) && overlapsMonth(l, o.month)),
    entries: entries.filter((e) => ids.has(e.personId)),
    holidays: page?.holidays ?? [],
  };
  // Częściowy snapshot (jedno źródło padło) zwracamy, ale wywołujący decyduje o zapisie po `errors`.
  return result(snapshot);
}
