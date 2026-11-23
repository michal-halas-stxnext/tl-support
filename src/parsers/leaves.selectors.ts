// Selektory strony: absences (`/employees/table/absences`). Dane w inline <script>: `var data = {...};`.
export const PAGE = 'absences';
export const SCRIPT_SELECTOR = 'script';
export const DATA_MARKER = /var\s+data\s*=\s*/;
export const F = { year: 'year', holidays: 'holidays', absences: 'absences' } as const;
// absences[userId][YYYY-MM-DD] = [liczba_dni, typ, notatka]
export const ENTRY = { days: 0, type: 1 } as const;
