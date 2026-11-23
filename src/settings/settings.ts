import type { IsoDate, Person } from '../domain/types';

export interface Settings {
  /** Ids of people excluded from the view. */
  excluded: string[];
  /** Manually added people (intranet id + name). */
  extraPeople: Pick<Person, 'id' | 'name'>[];
  /** Custom days off `YYYY-MM-DD`. */
  customDaysOff: IsoDate[];
  dailyNorm: number;
}

export const DEFAULT_SETTINGS: Settings = { excluded: [], extraPeople: [], customDaysOff: [], dailyNorm: 8 };
const KEY = 'tl-support:settings';

/** List to display: snapshot + manually added − excluded. */
export function effectivePeople(people: Person[], s: Settings): Person[] {
  const seen = new Set(people.map((p) => p.id));
  const extra = s.extraPeople
    .filter((p) => !seen.has(p.id))
    .map((p) => ({ ...p, profileUrl: '' }));
  const ex = new Set(s.excluded);
  return [...people, ...extra].filter((p) => !ex.has(p.id));
}

function normalize(raw: any): Settings {
  return {
    excluded: Array.isArray(raw?.excluded) ? raw.excluded.map(String) : [],
    extraPeople: Array.isArray(raw?.extraPeople)
      ? raw.extraPeople.filter((p: any) => p && typeof p.id === 'string' && typeof p.name === 'string').map((p: any) => ({ id: p.id, name: p.name }))
      : [],
    customDaysOff: Array.isArray(raw?.customDaysOff) ? raw.customDaysOff.filter((d: unknown) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) : [],
    dailyNorm: typeof raw?.dailyNorm === 'number' && raw.dailyNorm > 0 && raw.dailyNorm <= 24 ? raw.dailyNorm : 8,
  };
}

/** `chrome.storage.local` w rozszerzeniu; poza nim (demo/testy) — localStorage. */
export async function loadSettings(): Promise<Settings> {
  const area = (globalThis as any).chrome?.storage?.local;
  if (area) return normalize((await area.get(KEY))[KEY]);
  try {
    return normalize(JSON.parse(localStorage.getItem(KEY) ?? 'null'));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  const area = (globalThis as any).chrome?.storage?.local;
  if (area) await area.set({ [KEY]: s });
  else localStorage.setItem(KEY, JSON.stringify(s));
}
