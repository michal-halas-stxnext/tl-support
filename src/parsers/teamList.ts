import type { Person } from '../domain/types';
import { ParseError } from './errors';
import { DEFAULT_TEAM_NAME, F, PAGE, profileUrl } from './teamList.selectors';

/**
 * API response (JSON, not HTML — see NOTES.md §1) → team members of the given team.
 * Input: JSON text or an already parsed value.
 */
export function parseTeamList(input: string | unknown, teamName: string = DEFAULT_TEAM_NAME): Person[] {
  let data: unknown = input;
  if (typeof input === 'string') {
    try {
      data = JSON.parse(input);
    } catch {
      throw new ParseError(PAGE, 'valid JSON');
    }
  }
  if (!Array.isArray(data)) throw new ParseError(PAGE, 'users array');

  const people: Person[] = [];
  for (let u of data as Record<string, any>[]) {
    if (u && typeof u[F.id] === 'number') u = { ...u, [F.id]: String(u[F.id]) };
    if (!u || typeof u[F.id] !== 'string' || typeof u[F.name] !== 'string') {
      throw new ParseError(PAGE, `user fields ${F.id}/${F.name}`);
    }
    if (u[F.isActive] === false) continue;
    const teams: unknown = u[F.teams];
    if (!Array.isArray(teams)) throw new ParseError(PAGE, `field ${F.teams} (user ${u[F.id]})`);
    if (teams.some((t) => t?.[F.teamName] === teamName)) {
      people.push({ id: u[F.id], name: u[F.name], profileUrl: profileUrl(u[F.id]) });
    }
  }
  return people;
}
