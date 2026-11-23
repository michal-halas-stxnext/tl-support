import type { ComponentType } from 'preact';
import { useState } from 'preact/hooks';
import { ApprovalView } from './ApprovalView';
import { MonthView } from './MonthView';

export type TabDef = { id: string; label: string; component: ComponentType };

/** Tab registry — a new tab = one entry. */
export const TABS: TabDef[] = [
  { id: 'time-logged', label: 'Time logged', component: () => <MonthView /> },
  { id: 'approval', label: 'Approval', component: () => <ApprovalView /> },
];

export const TAB_KEY = 'tl-support:tab';

function loadTab(): string | null {
  try {
    return localStorage.getItem(TAB_KEY);
  } catch {
    return null;
  }
}
function saveTab(id: string) {
  try {
    localStorage.setItem(TAB_KEY, id);
  } catch {
    /* no storage access — ignore */
  }
}

export function Tabs({ tabs = TABS }: { tabs?: TabDef[] }) {
  const [saved, setSaved] = useState(loadTab);
  const active = tabs.find((t) => t.id === saved) ?? tabs[0];
  if (!active) return null;

  const select = (id: string, focus = false) => {
    setSaved(id);
    saveTab(id);
    if (focus) setTimeout(() => (document.getElementById(`tab-${id}`) ?? undefined)?.focus());
  };
  const onKey = (e: KeyboardEvent) => {
    const i = tabs.indexOf(active);
    const to =
      e.key === 'ArrowRight' ? (i + 1) % tabs.length
      : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length
      : e.key === 'Home' ? 0
      : e.key === 'End' ? tabs.length - 1
      : -1;
    if (to < 0) return;
    e.preventDefault();
    select(tabs[to].id, true);
  };
  const Active = active.component;

  return (
    <div class="tabs">
      <div class="tablist" role="tablist" aria-label="Widoki" onKeyDown={onKey}>
        {tabs.map((t) => (
          <button
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            class={t === active ? 'tab active' : 'tab'}
            aria-selected={t === active}
            aria-controls={`tabpanel-${t.id}`}
            tabIndex={t === active ? 0 : -1}
            onClick={() => select(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div class="tabpanel" role="tabpanel" id={`tabpanel-${active.id}`} aria-labelledby={`tab-${active.id}`}>
        <Active />
      </div>
    </div>
  );
}
