import { useState } from 'preact/hooks';
import type { Person } from '../domain/types';
import type { Settings } from '../settings/settings';

type Props = { settings: Settings; people: Person[]; onChange: (s: Settings) => void };

export function SettingsPanel({ settings, people, onChange }: Props) {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [day, setDay] = useState('');
  const excluded = new Set(settings.excluded);
  const toggle = (pid: string) =>
    onChange({ ...settings, excluded: excluded.has(pid) ? settings.excluded.filter((x) => x !== pid) : [...settings.excluded, pid] });

  return (
    <div class="settings">
      <h4>Osoby</h4>
      <ul>
        {[...people, ...settings.extraPeople.filter((e) => !people.some((p) => p.id === e.id))].map((p) => (
          <li>
            <label>
              <input type="checkbox" checked={!excluded.has(p.id)} onChange={() => toggle(p.id)} /> {p.name}
            </label>
            {settings.extraPeople.some((e) => e.id === p.id) && (
              <button type="button" class="btn ghost danger sm rm-person" onClick={() => onChange({ ...settings, extraPeople: settings.extraPeople.filter((e) => e.id !== p.id) })}>
                usuń
              </button>
            )}
          </li>
        ))}
      </ul>
      <div class="row">
        <input placeholder="id z intranetu" value={id} onInput={(e) => setId((e.target as HTMLInputElement).value)} />
        <input placeholder="imię i nazwisko" value={name} onInput={(e) => setName((e.target as HTMLInputElement).value)} />
        <button
          type="button"
          class="btn add-person"
          disabled={!id.trim() || !name.trim()}
          onClick={() => {
            onChange({ ...settings, extraPeople: [...settings.extraPeople.filter((p) => p.id !== id.trim()), { id: id.trim(), name: name.trim() }] });
            setId('');
            setName('');
          }}
        >
          Dodaj osobę
        </button>
      </div>
      <h4>Własne dni wolne</h4>
      <ul>
        {settings.customDaysOff.map((d) => (
          <li>
            {d} <button type="button" class="btn ghost danger sm rm-day" onClick={() => onChange({ ...settings, customDaysOff: settings.customDaysOff.filter((x) => x !== d) })}>usuń</button>
          </li>
        ))}
      </ul>
      <div class="row">
        <input type="date" value={day} onInput={(e) => setDay((e.target as HTMLInputElement).value)} />
        <button
          type="button"
          class="btn add-day"
          disabled={!day || settings.customDaysOff.includes(day)}
          onClick={() => {
            onChange({ ...settings, customDaysOff: [...settings.customDaysOff, day].sort() });
            setDay('');
          }}
        >
          Dodaj dzień
        </button>
      </div>
      <h4>Norma dzienna (h)</h4>
      <input
        type="number"
        min="1"
        max="24"
        step="0.25"
        value={settings.dailyNorm}
        onInput={(e) => {
          const v = Number((e.target as HTMLInputElement).value);
          if (v > 0 && v <= 24) onChange({ ...settings, dailyNorm: v });
        }}
      />
    </div>
  );
}
