export const shiftMonth = (m: string, d: number) => {
  const [y, mo] = m.split('-').map(Number);
  const t = new Date(Date.UTC(y, mo - 1 + d, 1));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}`;
};
export const thisMonth = () => new Date().toISOString().slice(0, 7);

/**
 * Shared month navigation (←, label, →, "Today") for all tabs with a month picker.
 * A fragment — the parent adds its own elements to its `.month-nav`. "Today" is disabled (not hidden)
 * when the current month is selected, so the bar does not shift.
 */
export function MonthNav({ month, onChange }: { month: string; onChange: (m: string) => void }) {
  const current = thisMonth();
  return (
    <>
      <button type="button" class="btn ghost prev" aria-label="Previous month" onClick={() => onChange(shiftMonth(month, -1))}>←</button>
      <strong class="month-label">{month}</strong>
      <button type="button" class="btn ghost next" aria-label="Next month" onClick={() => onChange(shiftMonth(month, 1))}>→</button>
      <button type="button" class="btn ghost sm today" title="Back to the current month" disabled={month === current} onClick={() => onChange(current)}>
        Today
      </button>
    </>
  );
}
