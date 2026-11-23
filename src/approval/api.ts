import { fetchText, postJson, type FetchLike } from '../collector/http';
import type { ApprovalEntry } from '../domain/types';
import { parseApprovalEntries } from '../parsers/approval';

/** Max ids in one write request (server limit unknown — 100 assumed). */
export const MAX_IDS_PER_REQUEST = 100;

export type ApprovalAction = 'ACCEPTED' | 'REJECTED';

export interface ApprovalResult {
  /** Ids for which the server confirmed the target state. */
  ok: string[];
  failed: { id: string; error: string }[];
}

/** `month` = `YYYY-MM`. Zawsze `billability=ALL&state=ALL` — filtry po stronie klienta. */
export async function fetchApproval(
  fetchFn: FetchLike,
  o: { lineManagerId: string; month: string; signal?: AbortSignal },
): Promise<ApprovalEntry[]> {
  const path =
    `/api/times/approval?line_manager=${encodeURIComponent(o.lineManagerId)}` +
    `&month=${o.month}-01&billability=ALL&state=ALL`;
  return parseApprovalEntries(await fetchText(fetchFn, path, { signal: o.signal, expect: 'json' }));
}

const toApiId = (id: string): number | string => (/^\d+$/.test(id) ? Number(id) : id);

/** Sends the action in batches of `MAX_IDS_PER_REQUEST`, sequentially. `LoggedOutError` aborts everything. */
async function send(fetchFn: FetchLike, action: ApprovalAction, ids: string[], signal?: AbortSignal): Promise<ApprovalResult> {
  const res: ApprovalResult = { ok: [], failed: [] };
  for (let i = 0; i < ids.length; i += MAX_IDS_PER_REQUEST) {
    const chunk = ids.slice(i, i + MAX_IDS_PER_REQUEST);
    try {
      const body = await postJson(fetchFn, '/api/times/approval', { action, ids: chunk.map(toApiId) }, signal);
      const done = new Set(
        (Array.isArray(body) ? body : [])
          .filter((r: any) => r && r.approvalState === action)
          .map((r: any) => String(r.timeEntryId)),
      );
      for (const id of chunk) {
        if (done.has(id)) res.ok.push(id);
        else res.failed.push({ id, error: 'Not confirmed in the response' });
      }
    } catch (e) {
      if (e instanceof Error && (e.name === 'LoggedOutError' || e.name === 'CancelledError')) throw e;
      const error = e instanceof Error ? e.message : String(e);
      for (const id of chunk) res.failed.push({ id, error });
    }
  }
  return res;
}

export const acceptEntries = (fetchFn: FetchLike, ids: string[], signal?: AbortSignal) =>
  send(fetchFn, 'ACCEPTED', ids, signal);
export const rejectEntries = (fetchFn: FetchLike, ids: string[], signal?: AbortSignal) =>
  send(fetchFn, 'REJECTED', ids, signal);
