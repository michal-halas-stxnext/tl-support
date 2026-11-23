// Tryb demo (`npm run dev` → http://localhost:5173/demo.html): widok na danych z fixtures/, bez intranetu.
import { render } from 'preact';
import type { Snapshot } from '../domain/types';
import { parseLeaves } from '../parsers/leaves';
import { parseTeamList } from '../parsers/teamList';
import { parseTimesheet } from '../parsers/timesheet';
import { parseApprovalEntries } from '../parsers/approval';
import { ApprovalView, type ApprovalDeps } from '../ui/ApprovalView';
import { MonthView } from '../ui/MonthView';
import { Tabs } from '../ui/Tabs';
import { styles } from '../ui/styles';

const f = import.meta.glob('../../fixtures/*.{html,json}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const fx = (n: string) => f[`../../fixtures/${n}`];

const people = parseTeamList(fx('users-universal.json'));
const page = parseLeaves(fx('absences-js-team-04.html'));
const ids = new Set(people.map((p) => p.id));
const snap: Snapshot = {
  month: '2026-11',
  fetchedAt: new Date().toISOString(),
  people,
  leaves: page.leaves.filter((l) => ids.has(l.personId)),
  entries: [...parseTimesheet(fx('timesheet-approval-billable.json'), 2026, 11), ...parseTimesheet(fx('timesheet-approval-nonbillable.json'), 2026, 11)].filter((e) => ids.has(e.personId)),
  holidays: page.holidays,
};

// Write mock: in-memory state, no intranet.
let approvalEntries = [...parseApprovalEntries(fx('timesheet-approval-billable.json')), ...parseApprovalEntries(fx('timesheet-approval-nonbillable.json'))];
const setState = (ids: string[], state: 'ACCEPTED' | 'REJECTED') => {
  approvalEntries = approvalEntries.map((e) => (ids.includes(e.id) ? { ...e, state, canAccept: state === 'REJECTED', canReject: state === 'ACCEPTED' } : e));
  return { ok: ids, failed: [] };
};
const approvalDeps: ApprovalDeps = {
  fetchEntries: async (m) => (m === '2026-11' ? approvalEntries : []),
  accept: async (ids) => setState(ids, 'ACCEPTED'),
  reject: async (ids) => setState(ids, 'REJECTED'),
};

document.head.append(Object.assign(document.createElement('style'), { textContent: styles + '.demo-wrap{font:14px system-ui;padding:16px}' }));
const tabs = [
  { id: 'time-logged', label: 'Time logged', component: () => <MonthView demo loadSnapshot={async (m) => (m === '2026-11' ? snap : undefined)} /> },
  { id: 'approval', label: 'Approval', component: () => <ApprovalView deps={approvalDeps} /> },
];
render(
  <div class="demo-wrap">
    <Tabs tabs={tabs} shell={{ initialMonth: '2026-11', lineManagerId: '1954' }} />
  </div>,
  document.getElementById('app')!,
);
