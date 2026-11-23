/** Parse error: page name + missing element, instead of silent empty results. */
export class ParseError extends Error {
  constructor(
    public readonly page: string,
    public readonly missing: string,
  ) {
    super(`[${page}] not found: ${missing}`);
    this.name = 'ParseError';
  }
}
