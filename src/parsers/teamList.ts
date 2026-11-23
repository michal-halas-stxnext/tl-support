import type { Person } from '../domain/types';
import { ParseError } from './errors';
import { DEFAULT_TEAM_NAME, F, PAGE, profileUrl } from './teamList.selectors';

/**
 * Odpowiedź API (JSON, nie HTML — patrz NOTES.md §1) → podopieczni wskazanego teamu.
 * Wejście: tekst JSON lub już sparsowana wartość.
 */
export function parseTeamList(input: string | unknown, teamName: string = DEFAULT_TEAM_NAME): Person[] {
  let data: unknown = input;
  if (typeof input === 'string') {
    try {
      data = JSON.parse(input);
    } catch {
      throw new ParseError(PAGE, 'poprawny JSON');
    }
  }
  if (!Array.isArray(data)) throw new ParseError(PAGE, 'tablica użytkowników');

  const people: Person[] = [];
  for (let u of data as Record<string, any>[]) {
    if (u && typeof u[F.id] === 'number') u = { ...u, [F.id]: String(u[F.id]) };
    if (!u || typeof u[F.id] !== 'string' || typeof u[F.name] !== 'string') {
      throw new ParseError(PAGE, `pola ${F.id}/${F.name} użytkownika`);
    }
    if (u[F.isActive] === false) continue;
    const teams: unknown = u[F.teams];
    if (!Array.isArray(teams)) throw new ParseError(PAGE, `pole ${F.teams} (użytkownik ${u[F.id]})`);
    if (teams.some((t) => t?.[F.teamName] === teamName)) {
      people.push({ id: u[F.id], name: u[F.name], profileUrl: profileUrl(u[F.id]) });
    }
  }
  return people;
}
