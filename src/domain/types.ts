/** ISO data kalendarzowa `YYYY-MM-DD`. */
export type IsoDate = string;

export interface Person {
  id: string;
  name: string;
  profileUrl: string;
}

export interface Leave {
  personId: string;
  /** First working day of the leave. */
  from: IsoDate;
  /** Last working day of the leave (inclusive). */
  to: IsoDate;
  /** Surowy typ z intranetu (obecnie zawsze `bezplatny`, nieistotny). */
  type: string;
}

export interface TimeEntry {
  personId: string;
  date: IsoDate;
  /** Suma godzin billable z dnia. */
  hours: number;
  /** Suma godzin non-billable z dnia (pokazywana osobno). */
  nonBillableHours: number;
}

export interface LeavesPage {
  year: number;
  /** Intranet holidays (`YYYY-MM-DD`) — useful for the calendar. */
  holidays: IsoDate[];
  leaves: Leave[];
}

export interface Snapshot {
  /** `YYYY-MM`. */
  month: string;
  /** ISO timestamp pobrania. */
  fetchedAt: string;
  people: Person[];
  /** Leaves overlapping the month (not trimmed). */
  leaves: Leave[];
  entries: TimeEntry[];
  /** Intranet holidays (useful for the view/export). */
  holidays: IsoDate[];
}

/** Stan akceptacji wpisu godzin (`OPEN` → po pierwszej akcji tylko ACCEPTED↔REJECTED). */
export type ApprovalState = 'OPEN' | 'ACCEPTED' | 'REJECTED' | (string & {});

export interface ApprovalEntry {
  /** `timeentry_id` (string; sent to the API as a number when numeric). */
  id: string;
  personId: string;
  personName: string;
  date: IsoDate;
  minutes: number;
  nonBillable: boolean;
  state: ApprovalState;
  project: string;
  description: string;
  canAccept: boolean;
  canReject: boolean;
}
