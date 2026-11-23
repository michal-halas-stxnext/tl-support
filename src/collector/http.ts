import { INTRANET_ORIGIN } from '../config';

export class LoggedOutError extends Error {
  constructor() {
    super('Zaloguj się do intranetu');
    this.name = 'LoggedOutError';
  }
}

export class CancelledError extends Error {
  constructor() {
    super('Anulowano');
    this.name = 'CancelledError';
  }
}

/** Buduje URL i gwarantuje origin intranetu — jedyna droga do `fetch` w kolektorze. */
export function intranetUrl(pathAndQuery: string): string {
  const u = new URL(pathAndQuery, INTRANET_ORIGIN);
  if (u.origin !== INTRANET_ORIGIN) throw new Error(`Zablokowano żądanie poza intranet: ${u.origin}`);
  return u.toString();
}

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

const LOGIN_PATH = /\/(login|logowanie|signin|sign-in|auth)(\/|\?|$)/i;

/** Pobiera tekst; wykrywa wylogowanie (401/403, przekierowanie na login, HTML zamiast JSON). */
export async function fetchText(
  fetchFn: FetchLike,
  pathAndQuery: string,
  opts: { signal?: AbortSignal; expect: 'json' | 'html' },
): Promise<string> {
  const url = intranetUrl(pathAndQuery);
  if (opts.signal?.aborted) throw new CancelledError();
  let res: Response;
  try {
    res = await fetchFn(url, { credentials: 'include', signal: opts.signal, redirect: 'follow' });
  } catch (e) {
    if (opts.signal?.aborted) throw new CancelledError();
    throw e;
  }
  if (res.status === 401 || res.status === 403) throw new LoggedOutError();
  if (res.redirected) {
    const to = new URL(res.url, INTRANET_ORIGIN);
    if (to.origin !== INTRANET_ORIGIN || LOGIN_PATH.test(to.pathname)) throw new LoggedOutError();
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} dla ${new URL(url).pathname}`);
  if (opts.expect === 'json' && /text\/html/i.test(res.headers.get('content-type') ?? '')) {
    throw new LoggedOutError();
  }
  return res.text();
}

/** POST JSON do intranetu (tylko przez `intranetUrl`); 401/403 i przekierowanie na login → `LoggedOutError`. */
export async function postJson(fetchFn: FetchLike, pathAndQuery: string, body: unknown, signal?: AbortSignal): Promise<unknown> {
  const url = intranetUrl(pathAndQuery);
  if (signal?.aborted) throw new CancelledError();
  let res: Response;
  try {
    res = await fetchFn(url, {
      method: 'POST',
      credentials: 'include',
      signal,
      redirect: 'follow',
      headers: { 'content-type': 'application/json; charset=UTF-8', 'x-requested-with': 'XMLHttpRequest' },
      body: JSON.stringify(body),
    });
  } catch (e) {
    if (signal?.aborted) throw new CancelledError();
    throw e;
  }
  if (res.status === 401 || res.status === 403) throw new LoggedOutError();
  if (res.redirected) {
    const to = new URL(res.url, INTRANET_ORIGIN);
    if (to.origin !== INTRANET_ORIGIN || LOGIN_PATH.test(to.pathname)) throw new LoggedOutError();
  }
  if (res.status !== 200) throw new Error(`HTTP ${res.status} dla ${new URL(url).pathname}`);
  if (/text\/html/i.test(res.headers.get('content-type') ?? '')) throw new LoggedOutError();
  return res.json();
}
