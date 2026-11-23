/** Błąd parsowania: nazwa strony + brakujący element, zamiast cichych pustych wyników. */
export class ParseError extends Error {
  constructor(
    public readonly page: string,
    public readonly missing: string,
  ) {
    super(`[${page}] not found: ${missing}`);
    this.name = 'ParseError';
  }
}
