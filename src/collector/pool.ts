import { CancelledError } from './http';

/** Uruchamia zadania z limitem równoległości i opóźnieniem przed każdym; błędy zbiera per zadanie. */
export async function runPool<T>(
  tasks: (() => Promise<T>)[],
  opts: { maxParallel: number; delayMs: number; signal?: AbortSignal },
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = new Array(tasks.length);
  let next = 0;
  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  async function worker() {
    while (next < tasks.length) {
      const i = next++;
      if (opts.signal?.aborted) {
        results[i] = { status: 'rejected', reason: new CancelledError() };
        continue;
      }
      if (i >= opts.maxParallel && opts.delayMs > 0) await sleep(opts.delayMs);
      try {
        results[i] = { status: 'fulfilled', value: await tasks[i]() };
      } catch (reason) {
        results[i] = { status: 'rejected', reason };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, opts.maxParallel) }, worker));
  return results;
}
