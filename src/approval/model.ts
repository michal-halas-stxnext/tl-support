import type { ApprovalEntry } from '../domain/types';

export type BillabilityFilter = 'all' | 'billable' | 'non';
/** `'all'` = no filter; otherwise the exact state value (e.g. `OPEN`). */
export type StateFilter = 'all' | (string & {});

export interface ApprovalFilters {
  billability: BillabilityFilter;
  state: StateFilter;
}

export interface PersonGroup {
  personId: string;
  personName: string;
  entries: ApprovalEntry[];
  billableMinutes: number;
  nonBillableMinutes: number;
}

export function filterEntries(entries: ApprovalEntry[], f: ApprovalFilters): ApprovalEntry[] {
  return entries.filter(
    (e) =>
      (f.billability === 'all' || (f.billability === 'non') === e.nonBillable) &&
      (f.state === 'all' || e.state === f.state),
  );
}

/** Groups entries per person (sorted by name); entries within a group by date. Sums computed from the passed entries. */
export function groupByPerson(entries: ApprovalEntry[], filters?: ApprovalFilters): PersonGroup[] {
  const src = filters ? filterEntries(entries, filters) : entries;
  const map = new Map<string, PersonGroup>();
  for (const e of src) {
    const g = map.get(e.personId) ?? {
      personId: e.personId,
      personName: e.personName,
      entries: [],
      billableMinutes: 0,
      nonBillableMinutes: 0,
    };
    g.entries.push(e);
    if (e.nonBillable) g.nonBillableMinutes += e.minutes;
    else g.billableMinutes += e.minutes;
    map.set(e.personId, g);
  }
  const groups = [...map.values()];
  for (const g of groups) g.entries.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  return groups.sort((a, b) => a.personName.localeCompare(b.personName, 'pl'));
}
