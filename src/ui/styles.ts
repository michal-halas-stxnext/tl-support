export const styles = `
:host { all: initial; }
.fab { position: fixed; right: 16px; bottom: 16px; z-index: 2147483647; width: 48px; height: 48px;
  border-radius: 50%; border: 0; background: #1a56db; color: #fff; font: 600 14px system-ui, sans-serif;
  cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.3); }
.panel { position: fixed; right: 16px; bottom: 76px; z-index: 2147483647; width: 420px; height: 60vh;
  background: #fff; color: #111; border: 1px solid #ccc; border-radius: 8px; font: 14px system-ui, sans-serif;
  box-shadow: 0 4px 16px rgba(0,0,0,.25); display: flex; flex-direction: column; }
.panel.fullscreen { inset: 16px; width: auto; height: auto; }
.panel .actions { display: flex; gap: 4px; }
.panel .fs { border: 0; background: none; font-size: 18px; cursor: pointer; }
.panel header { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid #eee; }
.panel .close { border: 0; background: none; font-size: 20px; cursor: pointer; }
.panel .body { padding: 12px; overflow: auto; }

.panel:not(.fullscreen) { width: 720px; }
.month-nav, .refresh-bar { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 8px; }
.fetched, .progress, .status { color: #555; font-size: 12px; }
.errors { color: #b91c1c; font-size: 12px; margin: 0; padding-left: 16px; }
.grid-wrap { overflow: auto; max-height: 100%; border: 1px solid #ddd; }
.grid { border-collapse: separate; border-spacing: 0; font-size: 12px; }
.grid th, .grid td { border-right: 1px solid #eee; border-bottom: 1px solid #eee; padding: 2px 4px; text-align: center; min-width: 22px; white-space: nowrap; }
.grid thead th { position: sticky; top: 0; background: #f5f5f5; z-index: 2; }
.grid .name { position: sticky; left: 0; background: #fff; text-align: left; min-width: 130px; z-index: 1; }
.grid thead .name { z-index: 3; background: #f5f5f5; }
.grid .sum { background: #fafafa; font-weight: 600; min-width: 44px; }
.grid .weekend { background: #ececec; }
.grid .holiday { background: #fde8e8; }
.grid .leave { background: #d1fae5; }
.grid .off-work { outline: 2px solid #f59e0b; outline-offset: -2px; font-weight: 700; }
.grid .diff.neg { color: #b91c1c; }
.grid .diff.pos { color: #166534; }
.nb { color: #6b7280; font-size: 9px; margin-left: 1px; }
.legend { margin-top: 8px; font-size: 12px; color: #444; }
.legend .sw { display: inline-block; width: 12px; height: 12px; border: 1px solid #ccc; vertical-align: middle; margin: 0 2px 0 8px; }
.legend .sw.leave { background: #d1fae5; } .legend .sw.weekend { background: #ececec; }
.legend .sw.holiday { background: #fde8e8; } .legend .sw.off-work { outline: 2px solid #f59e0b; outline-offset: -2px; }
.settings { border: 1px solid #ddd; padding: 8px; margin-bottom: 8px; font-size: 13px; }
.settings h4 { margin: 8px 0 4px; } .settings ul { margin: 0; padding-left: 16px; } .settings .row { display: flex; gap: 6px; margin-top: 4px; }
`;
