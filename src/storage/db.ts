import type { Snapshot } from '../domain/types';

const STORE = 'snapshots';
export const DEFAULT_DB = 'tl-support';

function req<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((res, rej) => {
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
    tx.onabort = () => rej(tx.error);
  });
}

export function openDb(name = DEFAULT_DB): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(name, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'month' });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

/** Saves a snapshot; the same month is overwritten, others stay (history). */
export async function saveSnapshot(db: IDBDatabase, s: Snapshot): Promise<void> {
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).put(s);
  await done(tx);
}

export async function getSnapshot(db: IDBDatabase, month: string): Promise<Snapshot | undefined> {
  return req(db.transaction(STORE).objectStore(STORE).get(month));
}

/** Saved months (`YYYY-MM`), ascending. */
export async function listMonths(db: IDBDatabase): Promise<string[]> {
  const keys = await req(db.transaction(STORE).objectStore(STORE).getAllKeys());
  return (keys as string[]).sort();
}

export async function clearAll(db: IDBDatabase): Promise<void> {
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).clear();
  await done(tx);
}
