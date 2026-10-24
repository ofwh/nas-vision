import type { Decoder } from './decode';
import { WeatherError } from './errors';

export type HttpOptions = { headers?: Record<string, string>; query?: Record<string, string | number | boolean> };
export interface HttpClient {
  get<T>(url: string, decode: Decoder<T>, options?: HttpOptions): Promise<T>;
  post<T>(url: string, body: unknown, decode: Decoder<T>, options?: HttpOptions): Promise<T>;
}

export function createHttpClient(timeoutMs = 15000): HttpClient {
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0 || timeoutMs > 2147483647) {
    throw new WeatherError('invalid_config');
  }

  async function request<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    decode: Decoder<T>,
    options: HttpOptions = {},
    body?: unknown,
  ): Promise<T> {
    const url = new URL(endpoint);

    for (const [key, value] of Object.entries(options.query ?? {})) {
      url.searchParams.set(key, String(value));
    }
    const signal = AbortSignal.timeout(timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers: { ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
        body: method === 'POST' ? JSON.stringify(body) : undefined,
        signal,
        redirect: 'error',
        cache: 'no-store',
      });

      if (response.status === 401 || response.status === 403) {
        throw new WeatherError('unauthorized');
      }

      if (response.status === 429) {
        throw new WeatherError('rate_limited');
      }

      if (!response.ok) {
        throw new WeatherError('service_unavailable');
      }

      let data: unknown;

      try {
        data = await response.json();
      } catch {
        throw new WeatherError(signal.aborted ? 'timeout' : 'invalid_response');
      }

      return decode(data);
    } catch (error) {
      if (error instanceof WeatherError) {
        throw error;
      }

      throw new WeatherError(signal.aborted ? 'timeout' : 'network_error');
    }
  }

  return {
    get: (url, decode, options) => request('GET', url, decode, options),
    post: (url, body, decode, options) => request('POST', url, decode, options, body),
  };
}

// Coalesce only concurrent identical reads; never retain completed weather data.
export function coalesce<T>(request: (key: string) => Promise<T>): (key: string) => Promise<T> {
  const pending = new Map<string, Promise<T>>();

  return (key) => {
    const existing = pending.get(key);

    if (existing) {
      return existing;
    }

    const promise = request(key).finally(() => pending.delete(key));

    pending.set(key, promise);

    return promise;
  };
}
