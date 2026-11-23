// Selektory/klucze strony: lista podopiecznych (`GET /api/intranet4/users/universal?active=true`).
import { INTRANET_ORIGIN } from '../config';

export const PAGE = 'teamList';
export const DEFAULT_TEAM_NAME = 'JS Team 04';
export const F = { id: 'id', name: 'name', teams: 'teams', teamName: 'name', isActive: 'isActive' } as const;
// Brak potwierdzonego URL profilu — używamy znanej strony absencji osoby (NOTES.md §2).
export const profileUrl = (id: string) => `${INTRANET_ORIGIN}/employees/list/absence?user_id=${encodeURIComponent(id)}`;
