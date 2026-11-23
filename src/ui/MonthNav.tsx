export const shiftMonth = (m: string, d: number) => {
  const [y, mo] = m.split('-').map(Number);
  const t = new Date(Date.UTC(y, mo - 1 + d, 1));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}`;
};
export const thisMonth = () => new Date().toISOString().slice(0, 7);

/**
 * Wspólna nawigacja miesiąca (←, etykieta, →, „Today”) dla wszystkich zakładek z wyborem miesiąca.
 * Fragment — rodzic dokłada własne elementy do swojego `.month-nav`. „Today” jest wyłączony (nie ukryty),
 * gdy wybrany jest bieżący miesiąc, żeby pasek się nie przesuwał.
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
