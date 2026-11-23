import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Snapshot } from '../domain/types';
import { clearAll, getSnapshot, listMonths, openDb, saveSnapshot } from './db';

const snap = (month: string, n = 1): Snapshot => ({
  month,
  fetchedAt: '2026-11-23T10:00:00Z',
  people: Array.from({ length: n }, (_, i) => ({ id: `u${i}`, name: `Osoba ${i}`, profileUrl: 'x' })),
  leaves: [],
  entries: [],
  holidays: [],
});

let db: IDBDatabase;
let n = 0;
beforeEach(async () => {
  db = await openDb(`test-${n++}`);
});

describe('storage', () => {
  it('zapis i odczyt', async () => {
    await saveSnapshot(db, snap('2026-11', 2));
    expect(await getSnapshot(db, '2026-11')).toEqual(snap('2026-11', 2));
    expect(await getSnapshot(db, '2026-10')).toBeUndefined();
  });
  it('nadpisuje ten sam miesiąc, zachowuje inne', async () => {
    await saveSnapshot(db, snap('2026-10', 1));
    await saveSnapshot(db, snap('2026-11', 1));
    await saveSnapshot(db, snap('2026-11', 3));
    expect((await getSnapshot(db, '2026-11'))!.people).toHaveLength(3);
    expect((await getSnapshot(db, '2026-10'))!.people).toHaveLength(1);
    expect(await listMonths(db)).toEqual(['2026-10', '2026-11']);
  });
  it('czyszczenie', async () => {
    await saveSnapshot(db, snap('2026-10'));
    await clearAll(db);
    expect(await listMonths(db)).toEqual([]);
  });
});
