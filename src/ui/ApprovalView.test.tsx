import { render } from 'preact';
import { describe, expect, it, vi } from 'vitest';
import { groupByPerson } from '../approval/model';
import { LoggedOutError } from '../collector/http';
import { parseApprovalEntries } from '../parsers/approval';
import { ApprovalView, type ApprovalDeps } from './ApprovalView';

const files = import.meta.glob('../../fixtures/timesheet-approval-{billable,nonbillable}.json', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const all = Object.values(files).flatMap((c) => parseApprovalEntries(c));
const tick = () => new Promise((r) => setTimeout(r, 30));

function setup(over: Partial<ApprovalDeps> = {}, confirmFn = () => true) {
  const deps: ApprovalDeps = {
    fetchEntries: vi.fn(async () => all),
    accept: vi.fn(async (ids: string[]) => ({ ok: ids, failed: [] })),
    reject: vi.fn(async (ids: string[]) => ({ ok: ids, failed: [] })),
    ...over,
  };
  const root = document.createElement('div');
  document.body.append(root);
  render(<ApprovalView deps={deps} initialMonth="2026-11" lineManagerId="1" confirmFn={confirmFn} initialBillability="all" />, root);
  return { root, deps };
}
const q = <T extends Element>(r: Element, s: string) => r.querySelector(s) as T;
const change = (el: HTMLSelectElement, v: string) => {
  el.value = v;
  el.dispatchEvent(new Event('change', { bubbles: true }));
};

describe('ApprovalView', () => {
  it('lista osób z sumami billable/non-billable zgodnymi z modelem', async () => {
    const { root } = setup();
    await tick();
    const groups = groupByPerson(all);
    expect(root.querySelectorAll('.person')).toHaveLength(groups.length);
    const g = groups.find((x) => x.nonBillableMinutes > 0)!;
    const row = q(root, `.person[data-person="${g.personId}"]`);
    const h = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
    expect(q(row, '.bill').textContent).toBe(h(g.billableMinutes));
    expect(q(row, '.nb').textContent).toBe(`+${h(g.nonBillableMinutes)}`);
  });

  it('domyślny filtr: non-billable; „Today” wraca do bieżącego miesiąca', async () => {
    const root = document.createElement('div');
    render(<ApprovalView deps={{ fetchEntries: async () => all, accept: async () => ({ ok: [], failed: [] }), reject: async () => ({ ok: [], failed: [] }) }} initialMonth="2000-01" lineManagerId="1" />, root);
    await tick();
    expect(q<HTMLSelectElement>(root, '.billability').value).toBe('non');
    expect(root.querySelectorAll('.entry, .person')).toHaveLength(groupByPerson(all, { billability: 'non', state: 'OPEN' }).length);
    (q(root, '.today') as HTMLButtonElement).click();
    await tick();
    expect(q(root, '.month-label').textContent).toBe(new Date().toISOString().slice(0, 7));
    expect((q(root, '.today') as HTMLButtonElement).disabled).toBe(true);
  });

  it('filtry billability i stanu zmieniają listę', async () => {
    const { root } = setup();
    await tick();
    change(q(root, '.billability'), 'non');
    await tick();
    expect(root.querySelectorAll('.person')).toHaveLength(groupByPerson(all, { billability: 'non', state: 'OPEN' }).length);
    change(q(root, '.state'), 'ACCEPTED');
    await tick();
    expect(root.querySelector('.empty')).not.toBeNull();
  });

  it('„Akceptuj wszystko” → potwierdzenie → accept z id osoby → odświeżenie', async () => {
    const confirmFn = vi.fn(() => true);
    const { root, deps } = setup({}, confirmFn);
    await tick();
    const g = groupByPerson(all)[0]!;
    (q(root, `.person[data-person="${g.personId}"] .acc-all`) as HTMLButtonElement).click();
    await tick();
    expect(confirmFn).toHaveBeenCalled();
    expect(deps.accept).toHaveBeenCalledWith(g.entries.map((e) => e.id));
    expect(deps.fetchEntries).toHaveBeenCalledTimes(2);
    expect(q(root, '.approval-status').textContent).toContain(`Accepted: ${g.entries.length}`);
  });

  it('odmowa w potwierdzeniu → brak wywołania', async () => {
    const { root, deps } = setup({}, () => false);
    await tick();
    (q(root, '.acc-all') as HTMLButtonElement).click();
    await tick();
    expect(deps.accept).not.toHaveBeenCalled();
  });

  it('zaznaczone wpisy + akcja; pojedynczy wpis bez potwierdzenia', async () => {
    const confirmFn = vi.fn(() => true);
    const { root, deps } = setup({}, confirmFn);
    await tick();
    const g = groupByPerson(all)[0]!;
    (q(root, '.toggle') as HTMLButtonElement).click();
    await tick();
    const boxes = root.querySelectorAll<HTMLInputElement>('.entry input[type=checkbox]');
    boxes[0]!.click();
    await tick();
    boxes[1]!.click();
    await tick();
    (q(root, '.rej-sel') as HTMLButtonElement).click();
    await tick();
    expect(deps.reject).toHaveBeenCalledWith([g.entries[0]!.id, g.entries[1]!.id]);
    expect(confirmFn).toHaveBeenCalledTimes(1);
    (q(root, '.acc-one') as HTMLButtonElement).click();
    await tick();
    expect(deps.accept).toHaveBeenCalledWith([g.entries[0]!.id]);
    expect(confirmFn).toHaveBeenCalledTimes(1);
  });

  it('przyciski nieaktywne bez can_accept/can_reject', async () => {
    const e = { ...all[0]!, canAccept: false, canReject: false };
    const { root } = setup({ fetchEntries: async () => [e] });
    await tick();
    expect((q(root, '.acc-all') as HTMLButtonElement).disabled).toBe(true);
    expect((q(root, '.rej-all') as HTMLButtonElement).disabled).toBe(true);
    (q(root, '.toggle') as HTMLButtonElement).click();
    await tick();
    expect((q(root, '.entry input') as HTMLInputElement).disabled).toBe(true);
    expect((q(root, '.acc-one') as HTMLButtonElement).disabled).toBe(true);
  });

  it('częściowa porażka, wylogowanie — komunikat w stałej linii statusu', async () => {
    const { root } = setup({ accept: async (ids) => ({ ok: ids.slice(1), failed: [{ id: ids[0]!, error: 'HTTP 500' }] }) });
    await tick();
    const bar = q(root, '.approval-bar');
    const before = bar.children.length;
    (q(root, '.acc-one') as HTMLButtonElement | null)?.click();
    (q(root, '.acc-all') as HTMLButtonElement).click();
    await tick();
    expect(q(root, '.approval-status').textContent).toMatch(/failed: 1 \(HTTP 500\)/);
    expect(bar.children.length).toBe(before);

    const out = setup({ fetchEntries: async () => { throw new LoggedOutError(); } });
    await tick();
    expect(q(out.root, '.approval-status').textContent).toBe('Log in to the intranet');
  });

  it('zmiana miesiąca pobiera dane', async () => {
    const { root, deps } = setup();
    await tick();
    (q(root, '.prev') as HTMLButtonElement).click();
    await tick();
    expect(q(root, '.month-label').textContent).toBe('2026-10');
    expect(deps.fetchEntries).toHaveBeenLastCalledWith('2026-10', '1');
  });
});
