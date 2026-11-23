// Jedyne miejsce z originem intranetu (źródło: fixtures/NOTES.md).
export const INTRANET_ORIGIN = 'https://intranet.stxnext.pl';

export const COLLECTOR = {
  /** Maks. równoległych zapytań do intranetu. */
  maxParallel: 2,
  /** Opóźnienie (ms) przed każdym kolejnym zapytaniem w puli. */
  delayMs: 300,
  /** Nazwa teamu podopiecznych (filtr po stronie klienta, NOTES §1). */
  teamName: 'JS Team 04',
  /** Id teamu w absences (filtr po stronie serwera, NOTES §2). */
  absencesTeamId: 1180,
} as const;
