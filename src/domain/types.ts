/** ISO data kalendarzowa `YYYY-MM-DD`. */
export type IsoDate = string;

export interface Person {
  id: string;
  name: string;
  profileUrl: string;
}

export interface Leave {
  personId: string;
  /** Pierwszy dzień roboczy urlopu. */
  from: IsoDate;
  /** Ostatni dzień roboczy urlopu (włącznie). */
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
  /** Święta z intranetu (`YYYY-MM-DD`) — pomocne dla kalendarza. */
  holidays: IsoDate[];
  leaves: Leave[];
}

export interface Snapshot {
  /** `YYYY-MM`. */
  month: string;
  /** ISO timestamp pobrania. */
  fetchedAt: string;
  people: Person[];
  /** Urlopy zachodzące na miesiąc (niepoprzycinane). */
  leaves: Leave[];
  entries: TimeEntry[];
  /** Święta z intranetu (pomocne dla widoku/eksportu). */
  holidays: IsoDate[];
}
