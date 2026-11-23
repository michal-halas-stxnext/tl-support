import { daysOfMonth, leaveDaysInMonth, summarize } from '../calendar/norm';
import type { Snapshot } from '../domain/types';
import { effectivePeople, type Settings } from '../settings/settings';

export const fmt = (h: number) => (h === 0 ? '' : String(Math.round(h * 100) / 100).replace('.', ','));
const fmtSigned = (h: number) => (h > 0 ? '+' : '') + (String(Math.round(h * 100) / 100).replace('.', ','));

type Props = { snapshot: Snapshot; settings: Settings };

export function MonthGrid({ snapshot, settings }: Props) {
  const days = daysOfMonth(snapshot.month, settings.customDaysOff);
  const people = effectivePeople(snapshot.people, settings);
  if (people.length === 0) return <p class="empty">No people to display.</p>;

  return (
    <div class="grid-wrap">
      <table class="grid">
        <thead>
          <tr>
            <th class="name">Person</th>
            {days.map((d) => (
              <th class={`day${d.weekend ? ' weekend' : ''}${d.holiday ? ' holiday' : ''}`}>{d.day}</th>
            ))}
            <th class="sum">Total</th>
            <th class="sum">Norm</th>
            <th class="sum">Diff</th>
            <th class="sum">Leave</th>
          </tr>
        </thead>
        <tbody>
          {people.map((p) => {
            const leave = leaveDaysInMonth(snapshot.leaves, p.id, days);
            const byDate = new Map(snapshot.entries.filter((e) => e.personId === p.id).map((e) => [e.date, e]));
            const sum = summarize(snapshot, p.id, days, settings.dailyNorm);
            return (
              <tr data-person={p.id}>
                <th class="name">{p.name}</th>
                {days.map((d) => {
                  const e = byDate.get(d.date);
                  const worked = !!e && (e.hours > 0 || e.nonBillableHours > 0);
                  const cls = ['cell'];
                  if (d.weekend) cls.push('weekend');
                  if (d.holiday) cls.push('holiday');
                  if (leave.has(d.date)) cls.push('leave');
                  if (d.off && worked) cls.push('off-work');
                  return (
                    <td class={cls.join(' ')} title={e && e.nonBillableHours ? `non-billable: ${fmt(e.nonBillableHours)} h` : undefined}>
                      {e ? fmt(e.hours) : ''}
                      {e && e.nonBillableHours > 0 && (
                        <sup class="nb" title={`non-billable: ${fmt(e.nonBillableHours)} h`}>
                          {fmt(e.nonBillableHours)}
                        </sup>
                      )}
                    </td>
                  );
                })}
                <td class="sum total">{fmt(sum.hours) || '0'}</td>
                <td class="sum norm">{sum.norm}</td>
                <td class={`sum diff ${sum.diff < 0 ? 'neg' : 'pos'}`}>{fmtSigned(sum.diff)}</td>
                <td class="sum leave-days">{sum.leaveDays}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Legend() {
  return (
    <div class="legend">
      <span class="sw leave" /> leave <span class="sw weekend" /> weekend <span class="sw holiday" /> holiday{' '}
      <span class="sw off-work" /> work on a day off <span class="nb">+n</span> non-billable (hours next to billable)
    </div>
  );
}
