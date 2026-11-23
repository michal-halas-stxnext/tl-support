// Klucze strony: timesheet approval (`GET /api/times/approval?...`), wiersze pozycyjne wg `columns`.
export const PAGE = 'timesheet';
export const COL = {
  userId: 'user_id',
  date: 'timeentry_date',
  time: 'timeentry_time',
  nonBillable: 'project_non_billable',
} as const;
