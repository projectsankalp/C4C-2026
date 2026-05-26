/**
 * Lightweight retry helper for backend calls.
 * We use this for the draft endpoint so a transient backend hiccup does not
 * break the live demo. Exponential backoff capped at 1s between tries.
 */

export interface RetryOptions {
  attempts?: number;
  baseDelayMs?: number;
  onAttempt?: (attempt: number, error: unknown) => void;
}

export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const attempts = options.attempts ?? 3;
  const baseDelay = options.baseDelayMs ?? 250;

  let lastError: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (options.onAttempt) options.onAttempt(i, error);
      if (i === attempts) break;
      const wait = Math.min(1000, baseDelay * 2 ** (i - 1));
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }
  throw lastError;
}
