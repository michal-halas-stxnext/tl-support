import { createContext, type ComponentChildren } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import { detectLineManagerId } from '../collector/collect';
import type { Person } from '../domain/types';
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from '../settings/settings';
import { DialogProvider } from './Dialog';
import { thisMonth } from './MonthNav';

type PanelState = {
  month: string;
  setMonth: (m: string) => void;
  settings: Settings;
  changeSettings: (s: Settings) => void;
  /** Detected once in the shell; `null` = not detected. */
  lineManagerId: string | null;
  loggedOut: boolean;
  setLoggedOut: (v: boolean) => void;
  /** People shown in Settings (published by the Time logged tab). */
  people: Person[];
  setPeople: (p: Person[]) => void;
};

const Ctx = createContext<PanelState | null>(null);

export type ShellProps = {
  initialMonth?: string;
  /** Injected in demo/tests; `undefined` = detect from the intranet page. */
  lineManagerId?: string | null;
};

export function PanelProvider({ initialMonth, lineManagerId, children }: ShellProps & { children?: ComponentChildren }) {
  const [month, setMonth] = useState(initialMonth ?? thisMonth());
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [lm] = useState(() => (lineManagerId !== undefined ? lineManagerId : detectLineManagerId()));
  const [loggedOut, setLoggedOut] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const value = useMemo<PanelState>(
    () => ({
      month,
      setMonth,
      settings,
      changeSettings: (s) => {
        setSettings(s);
        void saveSettings(s);
      },
      lineManagerId: lm,
      loggedOut,
      setLoggedOut,
      people,
      setPeople,
    }),
    [month, settings, lm, loggedOut, people],
  );
  return (
    <Ctx.Provider value={value}>
      <DialogProvider>{children}</DialogProvider>
    </Ctx.Provider>
  );
}

export function usePanel(): PanelState {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePanel must be used inside <PanelProvider>');
  return v;
}
