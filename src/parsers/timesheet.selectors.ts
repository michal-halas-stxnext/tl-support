// Klucze strony: timesheet approval (`GET /api/times/approval?...`), wiersze pozycyjne wg `columns`.
export const PAGE = 'timesheet';
export const COL = {
  userId: 'user_id',
  date: 'timeentry_date',
  time: 'timeentry_time',
  nonBillable: 'project_non_billable',
} as const;

// Columns required by the approval tab (same endpoint as above).
export const APPROVAL_COL = {
  id: 'timeentry_id',
  userId: 'user_id',
  userName: 'user_name',
  date: 'timeentry_date',
  time: 'timeentry_time',
  nonBillable: 'project_non_billable',
  state: 'timeentry_approval_state',
  project: 'project_name',
  description: 'timeentry_description',
  canAccept: 'can_accept',
  canReject: 'can_reject',
} as const;
