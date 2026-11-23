export const styles = `
:host {
  all: initial;
  --tl-font: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --tl-fs-xs: 11px; --tl-fs-sm: 12px; --tl-fs-md: 13px; --tl-fs-lg: 15px;
  --tl-bg: #fff; --tl-surface: #f8fafc; --tl-surface-2: #f1f5f9; --tl-zebra: #fafbfd; --tl-hover: #eef4ff;
  --tl-text: #1f2937; --tl-muted: #4b5563; --tl-subtle: #6b7280; --tl-on-accent: #fff;
  --tl-border: #e2e8f0; --tl-border-strong: #cbd5e1;
  --tl-accent: #1a56db; --tl-accent-hover: #1647b8; --tl-accent-soft: #e0eaff;
  --tl-danger: #b91c1c; --tl-danger-soft: #fef2f2; --tl-danger-border: #fca5a5;
  --tl-success: #166534; --tl-nb: #6d28d9;
  --tl-leave: #d1fae5; --tl-weekend: #d8dee8; --tl-weekend-line: #c3ccd9; --tl-holiday: #f8c4c4; --tl-holiday-line: #e99a9a;
  --tl-hatch: repeating-linear-gradient(135deg, transparent 0 4px, rgba(100,116,139,.18) 4px 5px); --tl-offwork: #f59e0b;
  --tl-sp-1: 4px; --tl-sp-2: 8px; --tl-sp-3: 12px; --tl-sp-4: 16px;
  --tl-r-sm: 4px; --tl-r-md: 6px; --tl-r-lg: 12px;
  --tl-shadow-sm: 0 1px 3px rgba(15,23,42,.2); --tl-shadow-md: 0 4px 16px rgba(15,23,42,.18); --tl-shadow-lg: 0 12px 32px rgba(15,23,42,.28);
  --tl-focus: 0 0 0 2px var(--tl-bg), 0 0 0 4px var(--tl-accent);
  --tl-ease: 120ms ease;
}
*, *::before, *::after { box-sizing: border-box; }
button, input { font: inherit; color: inherit; }
button:focus-visible, input:focus-visible, .rz:focus-visible { outline: none; box-shadow: var(--tl-focus); }

.fab { position: fixed; right: var(--tl-sp-4); bottom: var(--tl-sp-4); z-index: 2147483647; width: 48px; height: 48px;
  border-radius: 50%; border: 0; background: var(--tl-accent); color: var(--tl-on-accent); font: 600 14px var(--tl-font);
  cursor: pointer; box-shadow: var(--tl-shadow-md); transition: background var(--tl-ease), transform var(--tl-ease); }
.fab:hover { background: var(--tl-accent-hover); transform: translateY(-1px); }

.panel { position: fixed; right: var(--tl-sp-4); bottom: 76px; z-index: 2147483647; width: 420px; height: 60vh;
  background: var(--tl-bg); color: var(--tl-text); border: 1px solid var(--tl-border); border-radius: var(--tl-r-lg);
  font: var(--tl-fs-md)/1.4 var(--tl-font); box-shadow: var(--tl-shadow-lg); display: flex; flex-direction: column; }
.panel:not(.fullscreen) { width: min(720px, calc(100vw - 32px)); max-height: calc(100vh - 92px); }
.panel.fullscreen { inset: var(--tl-sp-4); width: auto; height: auto; }
.panel header { display: flex; justify-content: space-between; align-items: center; padding: var(--tl-sp-2) var(--tl-sp-3) var(--tl-sp-2) var(--tl-sp-4);
  border-bottom: 1px solid var(--tl-border); font-size: var(--tl-fs-lg); }
.panel .actions { display: flex; gap: var(--tl-sp-1); }
.icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; padding: 0; border: 0; border-radius: var(--tl-r-md);
  background: none; color: var(--tl-muted); cursor: pointer; transition: background var(--tl-ease), color var(--tl-ease); }
.icon-btn:hover { background: var(--tl-surface-2); color: var(--tl-text); }
.icon-btn svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.panel .body { padding: var(--tl-sp-3) var(--tl-sp-4) var(--tl-sp-4); flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }

.rz { position: absolute; z-index: 20; touch-action: none; }
.rz-l { left: -4px; top: 8px; bottom: 8px; width: 8px; cursor: ew-resize; }
.rz-t { top: -4px; left: 8px; right: 8px; height: 8px; cursor: ns-resize; }
.rz-tl { top: -6px; left: -6px; width: 14px; height: 14px; cursor: nwse-resize; }

.btn { display: inline-flex; align-items: center; gap: var(--tl-sp-1); height: 28px; padding: 0 var(--tl-sp-3); border: 1px solid var(--tl-border-strong);
  border-radius: var(--tl-r-md); background: var(--tl-bg); color: var(--tl-text); font-size: var(--tl-fs-sm); font-weight: 500; cursor: pointer;
  white-space: nowrap; transition: background var(--tl-ease), border-color var(--tl-ease), color var(--tl-ease); }
.btn:hover:not(:disabled) { background: var(--tl-surface-2); }
.btn.primary { background: var(--tl-accent); border-color: var(--tl-accent); color: var(--tl-on-accent); }
.btn.primary:hover:not(:disabled) { background: var(--tl-accent-hover); border-color: var(--tl-accent-hover); }
.btn.ghost { border-color: transparent; background: none; color: var(--tl-muted); }
.btn.ghost:hover:not(:disabled) { background: var(--tl-surface-2); color: var(--tl-text); }
.btn.danger { color: var(--tl-danger); }
.btn.danger:hover:not(:disabled) { background: var(--tl-danger-soft); }
.btn.sm { height: 24px; padding: 0 var(--tl-sp-2); }
.btn[aria-pressed='true'] { background: var(--tl-accent-soft); border-color: var(--tl-accent); color: var(--tl-accent); }
.btn:disabled { opacity: .5; cursor: not-allowed; }

.tabs { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.tablist { display: flex; gap: var(--tl-sp-1); flex: none; border-bottom: 1px solid var(--tl-border); margin-bottom: var(--tl-sp-3); }
.tab { border: 0; border-bottom: 2px solid transparent; margin-bottom: -1px; background: none; padding: 6px var(--tl-sp-3); cursor: pointer;
  color: var(--tl-muted); border-radius: var(--tl-r-sm) var(--tl-r-sm) 0 0; transition: color var(--tl-ease), background var(--tl-ease); }
.tab:hover { color: var(--tl-text); background: var(--tl-surface); }
.tab.active { border-bottom-color: var(--tl-accent); color: var(--tl-text); font-weight: 600; }
.tabpanel { flex: 1; min-height: 0; display: flex; flex-direction: column; }

.month-view { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.month-nav, .refresh-bar { position: relative; display: flex; flex-wrap: nowrap; gap: 6px; align-items: center; margin-bottom: var(--tl-sp-2); min-height: 28px; flex: none; }
.month-nav .btn { padding: 0 var(--tl-sp-2); }
.month-label { min-width: 72px; text-align: center; font-size: var(--tl-fs-lg); font-variant-numeric: tabular-nums; }
.settings-anchor { position: relative; margin-left: var(--tl-sp-2); }
.fetched { margin-left: auto; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-height: 16px; }
.refresh-status { flex: 1; min-width: 0; height: 18px; line-height: 18px; display: flex; gap: var(--tl-sp-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fetched, .progress, .status { color: var(--tl-muted); font-size: var(--tl-fs-sm); }
.errors { position: absolute; top: 100%; right: 0; z-index: 5; max-width: 100%; max-height: 120px; overflow: auto; list-style: none;
  background: var(--tl-danger-soft); border: 1px solid var(--tl-danger-border); border-radius: var(--tl-r-md); box-shadow: var(--tl-shadow-md);
  color: var(--tl-danger); font-size: var(--tl-fs-sm); margin: 2px 0 0; padding: var(--tl-sp-1) var(--tl-sp-2); }

.content { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.no-data, .empty { margin: auto; color: var(--tl-muted); text-align: center; }
.loading { width: 24px; height: 24px; margin: auto; border: 3px solid var(--tl-border); border-top-color: var(--tl-accent); border-radius: 50%; animation: tl-spin .8s linear infinite; }
@keyframes tl-spin { to { transform: rotate(360deg); } }

.grid-wrap { flex: 1; min-height: 0; overflow: auto; border: 1px solid var(--tl-border); border-radius: var(--tl-r-md); }
.grid { border-collapse: separate; border-spacing: 0; font-size: var(--tl-fs-sm); font-variant-numeric: tabular-nums; }
.grid th, .grid td { border-right: 1px solid var(--tl-border); border-bottom: 1px solid var(--tl-border); padding: 3px 5px; text-align: center; min-width: 24px; white-space: nowrap; background: var(--tl-bg); }
.grid tbody tr:nth-child(even) td, .grid tbody tr:nth-child(even) th { background-color: var(--tl-zebra); }
.grid tbody tr:hover td, .grid tbody tr:hover th { background-color: var(--tl-hover); }
.grid thead th { position: sticky; top: 0; background: var(--tl-surface-2); color: var(--tl-muted); font-weight: 600; z-index: 2; }
.grid .name { position: sticky; left: 0; text-align: left; min-width: 140px; z-index: 1; font-weight: 500; }
.grid thead .name { z-index: 3; }
.grid .sum { background: var(--tl-surface); font-weight: 600; min-width: 44px; border-left: 1px solid var(--tl-border-strong); }
.grid .sum + .sum { border-left: 1px solid var(--tl-border); }
.grid tbody td.weekend, .grid tbody tr:nth-child(even) td.weekend, .grid tbody tr:hover td.weekend, .grid thead th.weekend { background-color: var(--tl-weekend); }
.grid tbody td.holiday, .grid tbody tr:nth-child(even) td.holiday, .grid tbody tr:hover td.holiday, .grid thead th.holiday { background-color: var(--tl-holiday); }
.grid .weekend { background-image: var(--tl-hatch); border-right-color: var(--tl-weekend-line); border-bottom-color: var(--tl-weekend-line); }
.grid .holiday { border-right-color: var(--tl-holiday-line); border-bottom-color: var(--tl-holiday-line); }
.grid tbody td.leave, .grid tbody tr:nth-child(even) td.leave, .grid tbody tr:hover td.leave { background: var(--tl-leave); }
.grid .off-work { box-shadow: inset 0 0 0 2px var(--tl-offwork); font-weight: 700; }
.grid .diff.neg { color: var(--tl-danger); }
.grid .diff.pos { color: var(--tl-success); }
.nb { color: var(--tl-nb); font-size: inherit; vertical-align: baseline; font-weight: 600; margin-left: 3px; cursor: help; }
.grid .nb::before { content: '+'; }

.legend { display: flex; flex-wrap: wrap; align-items: center; gap: var(--tl-sp-1) var(--tl-sp-3); margin-top: var(--tl-sp-2); font-size: var(--tl-fs-sm); color: var(--tl-muted); flex: none; }
.legend .sw { display: inline-block; width: 12px; height: 12px; border: 1px solid var(--tl-border-strong); border-radius: 2px; vertical-align: middle; margin: 0 var(--tl-sp-1) 0 0; }
.legend .sw.leave { background: var(--tl-leave); } .legend .sw.weekend { background-color: var(--tl-weekend); background-image: var(--tl-hatch); }
.legend .sw.holiday { background: var(--tl-holiday); } .legend .sw.off-work { border-color: var(--tl-offwork); box-shadow: inset 0 0 0 1px var(--tl-offwork); }

.settings { position: absolute; top: 100%; left: 0; z-index: 10; width: 360px; max-height: 50vh; overflow: auto; background: var(--tl-bg);
  border: 1px solid var(--tl-border); border-radius: var(--tl-r-lg); box-shadow: var(--tl-shadow-md); padding: var(--tl-sp-3) var(--tl-sp-4); margin-top: var(--tl-sp-1); font-size: var(--tl-fs-md); }
.settings h4 { margin: var(--tl-sp-3) 0 var(--tl-sp-1); font-size: var(--tl-fs-sm); text-transform: uppercase; letter-spacing: .04em; color: var(--tl-muted); }
.settings h4:first-child { margin-top: 0; }
.settings ul { margin: 0; padding: 0; list-style: none; }
.settings li { display: flex; align-items: center; justify-content: space-between; gap: var(--tl-sp-2); padding: 2px 0; }
.settings .row { display: flex; gap: 6px; margin-top: var(--tl-sp-1); }
.settings input[type='text'], .settings input:not([type]), .settings input[type='date'], .settings input[type='number'] {
  height: 28px; min-width: 0; padding: 0 var(--tl-sp-2); border: 1px solid var(--tl-border-strong); border-radius: var(--tl-r-md); background: var(--tl-bg); }
.settings .row input { flex: 1; }
.settings input:focus-visible { border-color: var(--tl-accent); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
}
`;
