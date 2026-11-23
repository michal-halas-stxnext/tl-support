// Single place for the intranet origin (source: fixtures/NOTES.md).
export const INTRANET_ORIGIN = 'https://intranet.stxnext.pl';

export const COLLECTOR = {
  /** Max parallel requests to the intranet. */
  maxParallel: 2,
  /** Delay (ms) before each subsequent request in the pool. */
  delayMs: 300,
  /** Nazwa teamu podopiecznych (filtr po stronie klienta, NOTES §1). */
  teamName: 'JS Team 04',
  /** Id teamu w absences (filtr po stronie serwera, NOTES §2). */
  absencesTeamId: 1180,
} as const;
