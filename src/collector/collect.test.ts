import { describe, expect, it, vi } from 'vitest';
import { collectMonth, detectLineManagerId } from './collect';
import { intranetUrl, type FetchLike } from './http';
import { runPool } from './pool';

const files = import.meta.glob('../../fixtures/*.{html,json}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const fx = (n: string) => files[`../../fixtures/${n}`];

const res = (body: string, init: { status?: number; type?: string; url?: string; redirected?: boolean } = {}) => {
  const r = new Response(body, { status: init.status ?? 200, headers: { 'content-type': init.type ?? 'application/json' } });
  if (init.url) Object.defineProperty(r, 'url', { value: init.url });
  if (init.redirected) Object.defineProperty(r, 'redirected', { value: true });
  return r;
};

function router(over: Partial<Record<'people' | 'leaves' | 'ts', () => Response | Promise<Response>>> = {}) {
  const calls: string[] = [];
  const fn: FetchLike = async (url) => {
    calls.push(url);
    if (url.includes('/users/universal')) return over.people?.() ?? res(fx('users-universal.json'));
    if (url.includes('/employees/table/absences')) return over.leaves?.() ?? res(fx('absences-js-team-04.html'), { type: 'text/html' });
    if (url.includes('/api/times/approval')) return over.ts?.() ?? res(fx('timesheet-approval-billable.json'));
    throw new Error('nieoczekiwany URL ' + url);
  };
  return { fn, calls };
}
const base = { month: '2026-11', lineManagerId: 'user-900', delayMs: 0 };

describe('collectMonth', () => {
  it('pełny przebieg: snapshot z filtrem do podopiecznych, postęp, tylko origin intranetu', async () => {
    const { fn, calls } = router();
    const progress: string[] = [];
    const r = await collectMonth({ ...base, fetchFn: fn, onProgress: (d, t) => progress.push(`${d}/${t}`), now: () => new Date('2026-11-23T10:00:00Z') });
    expect(r.errors).toEqual([]);
    const s = r.snapshot!;
    expect(s.month).toBe('2026-11');
    expect(s.fetchedAt).toBe('2026-11-23T10:00:00.000Z');
    expect(s.people).toHaveLength(10);
    const ids = new Set(s.people.map((p) => p.id));
    expect(s.entries.length).toBeGreaterThan(0);
    expect(s.entries.every((e) => ids.has(e.personId) && e.date.startsWith('2026-11'))).toBe(true);
    expect(s.leaves.every((l) => ids.has(l.personId))).toBe(true);
    expect(s.leaves.find((l) => l.personId === 'user-006' && l.from === '2026-11-02')?.to).toBe('2026-11-06');
    expect(s.holidays).toContain('2026-11-11');
    expect(progress[0]).toBe('0/3');
    expect(progress.at(-1)).toBe('3/3');
    expect(calls.every((u) => u.startsWith('https://intranet.stxnext.pl/'))).toBe(true);
    expect(calls.find((u) => u.includes('approval'))).toContain('line_manager=user-900&month=2026-11-01');
  });

  it('błąd jednego źródła nie przerywa reszty', async () => {
    const { fn } = router({ ts: () => res('boom', { status: 500 }) });
    const r = await collectMonth({ ...base, fetchFn: fn });
    expect(r.errors).toEqual([{ source: 'timesheet', message: expect.stringContaining('500') }]);
    expect(r.snapshot!.leaves.length).toBeGreaterThan(0);
    expect(r.snapshot!.entries).toEqual([]);
  });

  it('błąd parsowania źródła trafia do raportu', async () => {
    const { fn } = router({ leaves: () => res('<html></html>', { type: 'text/html' }) });
    const r = await collectMonth({ ...base, fetchFn: fn });
    expect(r.errors[0]).toMatchObject({ source: 'leaves' });
    expect(r.errors[0].message).toContain('absences');
  });

  it('brak listy podopiecznych → brak snapshotu', async () => {
    const { fn, calls } = router({ people: () => res('x', { status: 500 }) });
    const r = await collectMonth({ ...base, fetchFn: fn });
    expect(r.snapshot).toBeNull();
    expect(r.errors[0].source).toBe('people');
    expect(calls).toHaveLength(1);
  });

  it.each([
    ['401', () => res('', { status: 401 })],
    ['przekierowanie na login', () => res('<html>login</html>', { type: 'text/html', redirected: true, url: 'https://intranet.stxnext.pl/login?next=/' })],
    ['HTML zamiast JSON', () => res('<html>login</html>', { type: 'text/html' })],
  ])('wylogowanie (%s) → loggedOut', async (_n, make) => {
    const { fn } = router({ ts: make });
    const r = await collectMonth({ ...base, fetchFn: fn });
    expect(r.loggedOut).toBe(true);
    expect(r.snapshot).toBeNull();
  });

  it('anulowanie', async () => {
    const ac = new AbortController();
    const { fn } = router({ people: () => (ac.abort(), res(fx('users-universal.json'))) });
    const r = await collectMonth({ ...base, fetchFn: fn, signal: ac.signal });
    expect(r.cancelled).toBe(true);
    expect(r.snapshot).toBeNull();
  });

  it('żąda credentials: include', async () => {
    const spy = vi.fn<FetchLike>(async () => res('[]'));
    await collectMonth({ ...base, fetchFn: spy });
    expect(spy.mock.calls[0][1]).toMatchObject({ credentials: 'include' });
  });
});

describe('intranetUrl', () => {
  it('blokuje inny origin', () => {
    expect(() => intranetUrl('https://evil.example/x')).toThrow(/outside the intranet/);
    expect(() => intranetUrl('//evil.example/x')).toThrow(/outside the intranet/);
    expect(intranetUrl('/a?b=1')).toBe('https://intranet.stxnext.pl/a?b=1');
  });
});

describe('runPool', () => {
  it('nie przekracza maxParallel i zbiera błędy per zadanie', async () => {
    let active = 0;
    let peak = 0;
    const mk = (i: number) => async () => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((r) => setTimeout(r, 5));
      active--;
      if (i === 3) throw new Error('x');
      return i;
    };
    const out = await runPool(Array.from({ length: 8 }, (_, i) => mk(i)), { maxParallel: 2, delayMs: 0 });
    expect(peak).toBe(2);
    expect(out.map((o) => o.status)).toEqual(['fulfilled', 'fulfilled', 'fulfilled', 'rejected', 'fulfilled', 'fulfilled', 'fulfilled', 'fulfilled']);
  });
});

describe('detectLineManagerId', () => {
  it('format z intranetu: var Globals = {"user": {"id": 1954, ...', () => {
    const doc = document.implementation.createHTMLDocument('');
    const s = doc.createElement('script');
    s.textContent = 'var Globals = {"user": {"id": 1954, "name": "Jan"}, "x": 1};\nGlobals.user.teams = [1, 2];';
    doc.body.append(s);
    expect(detectLineManagerId(doc)).toBe('1954');
  });
  it('brak → null', () => {
    expect(detectLineManagerId(document.implementation.createHTMLDocument(''))).toBeNull();
  });
});
