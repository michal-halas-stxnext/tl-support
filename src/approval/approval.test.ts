import { describe, expect, it, vi } from 'vitest';
import { LoggedOutError, postJson } from '../collector/http';
import { ParseError } from '../parsers/errors';
import { parseApprovalEntries } from '../parsers/approval';
import { acceptEntries, fetchApproval, MAX_IDS_PER_REQUEST, rejectEntries } from './api';
import { filterEntries, groupByPerson } from './model';

const files = import.meta.glob('../../fixtures/*.json', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const fx = (n: string) => files[`../../fixtures/${n}`]!;
const bill = parseApprovalEntries(fx('timesheet-approval-billable.json'));
const non = parseApprovalEntries(fx('timesheet-approval-nonbillable.json'));

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const okBody = (action: string, ids: (number | string)[]) =>
  ids.map((id) => ({ approvalState: action, approvalAuthor: 'X', approvalTimestamp: 't', timeEntryId: id, canAccept: false, canReject: true }));

describe('parseApprovalEntries', () => {
  it('138 billable + 26 non-billable', () => {
    expect(bill).toHaveLength(138);
    expect(non).toHaveLength(26);
    expect(bill.every((e) => !e.nonBillable)).toBe(true);
    expect(non.every((e) => e.nonBillable)).toBe(true);
  });
  it('daty ISO, minuty, pola', () => {
    const e = bill[0]!;
    expect(e).toMatchObject({ id: 'te-0', personId: 'user-021', date: '2026-11-02', minutes: 480, state: 'OPEN', canAccept: true, canReject: true });
  });
  it('brakująca kolumna → ParseError', () => {
    const d = JSON.parse(fx('timesheet-approval-billable.json'));
    d.columns[d.columns.indexOf('can_accept')] = 'x';
    expect(() => parseApprovalEntries(d)).toThrow(ParseError);
  });
});

describe('groupByPerson', () => {
  const all = [...bill, ...non];
  it('sumy per osoba zgodne z danymi', () => {
    const g = groupByPerson(all);
    const sum = (f: (e: (typeof all)[number]) => boolean) => all.filter(f).reduce((a, e) => a + e.minutes, 0);
    expect(g.reduce((a, x) => a + x.billableMinutes, 0)).toBe(sum((e) => !e.nonBillable));
    expect(g.reduce((a, x) => a + x.nonBillableMinutes, 0)).toBe(sum((e) => e.nonBillable));
    expect(g.reduce((a, x) => a + x.entries.length, 0)).toBe(164);
  });
  it('filtry', () => {
    expect(filterEntries(all, { billability: 'non', state: 'all' })).toHaveLength(26);
    expect(filterEntries(all, { billability: 'billable', state: 'all' })).toHaveLength(138);
    expect(filterEntries(all, { billability: 'all', state: 'OPEN' })).toHaveLength(164);
    expect(filterEntries(all, { billability: 'all', state: 'ACCEPTED' })).toHaveLength(0);
  });
});

describe('api', () => {
  it('fetchApproval: URL z billability=ALL', async () => {
    const f = vi.fn(async (_u: string) => new Response(fx('timesheet-approval-nonbillable.json'), { headers: { 'content-type': 'application/json' } }));
    expect(await fetchApproval(f, { lineManagerId: '1954', month: '2026-11' })).toHaveLength(26);
    expect(f.mock.calls[0]![0]).toBe('https://intranet.stxnext.pl/api/times/approval?line_manager=1954&month=2026-11-01&billability=ALL&state=ALL');
  });
  it('accept: POST zgodny z fixture, numeryczne id', async () => {
    const f = vi.fn(async (_u: string, init?: RequestInit) => json(okBody('ACCEPTED', JSON.parse(init!.body as string).ids)));
    const r = await acceptEntries(f, ['3896833', '3897366']);
    const [url, init] = f.mock.calls[0]!;
    expect(url).toBe('https://intranet.stxnext.pl/api/times/approval');
    expect(init!.method).toBe('POST');
    expect((init!.headers as Record<string, string>)['content-type']).toBe('application/json; charset=UTF-8');
    expect(JSON.parse(init!.body as string)).toEqual({ action: 'ACCEPTED', ids: [3896833, 3897366] });
    expect(r).toEqual({ ok: ['3896833', '3897366'], failed: [] });
  });
  it('reject: action REJECTED', async () => {
    const f = vi.fn(async (_u: string, init?: RequestInit) => json(okBody('REJECTED', JSON.parse(init!.body as string).ids)));
    await rejectEntries(f, ['1']);
    expect(JSON.parse(f.mock.calls[0]![1]!.body as string).action).toBe('REJECTED');
  });
  it('paczki po 100; częściowa porażka', async () => {
    const ids = Array.from({ length: 150 }, (_, i) => String(i + 1));
    let n = 0;
    const f = vi.fn(async (_u: string, init?: RequestInit) =>
      ++n === 2 ? json({}, 500) : json(okBody('ACCEPTED', JSON.parse(init!.body as string).ids)),
    );
    const r = await acceptEntries(f, ids);
    expect(f).toHaveBeenCalledTimes(2);
    expect(JSON.parse(f.mock.calls[0]![1]!.body as string).ids).toHaveLength(MAX_IDS_PER_REQUEST);
    expect(r.ok).toHaveLength(100);
    expect(r.failed).toHaveLength(50);
    expect(r.failed[0]!.error).toMatch(/HTTP 500/);
  });
  it('id bez potwierdzenia w odpowiedzi → failed', async () => {
    const f = vi.fn(async () => json(okBody('ACCEPTED', [1])));
    const r = await acceptEntries(f, ['1', '2']);
    expect(r.ok).toEqual(['1']);
    expect(r.failed.map((x) => x.id)).toEqual(['2']);
  });
  it('żądanie poza origin zablokowane', async () => {
    const f = vi.fn(async (_u: string) => json([]));
    await expect(postJson(f, 'https://evil.example/api/times/approval', {})).rejects.toThrow(/Blocked request/);
    expect(f).not.toHaveBeenCalled();
  });
  it('401/403 → LoggedOutError', async () => {
    await expect(acceptEntries(async () => json({}, 401), ['1'])).rejects.toBeInstanceOf(LoggedOutError);
    await expect(rejectEntries(async () => json({}, 403), ['1'])).rejects.toBeInstanceOf(LoggedOutError);
  });
});
