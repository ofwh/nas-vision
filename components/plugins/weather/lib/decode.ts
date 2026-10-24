import { WeatherError } from './errors';

export type Decoder<T> = (value: unknown) => T;
export const string: Decoder<string> = (value) => {
  if (typeof value !== 'string') {
    throw new WeatherError('invalid_response');
  }

  return value;
};
export const number: Decoder<number> = (value) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new WeatherError('invalid_response');
  }

  return value;
};
export const boolean: Decoder<boolean> = (value) => {
  if (typeof value !== 'boolean') {
    throw new WeatherError('invalid_response');
  }

  return value;
};
export const numericString: Decoder<number> = (value) => {
  if (typeof value !== 'string' || !value.trim() || !Number.isFinite(Number(value))) {
    throw new WeatherError('invalid_response');
  }

  return Number(value);
};

export function optional<T>(decode: Decoder<T>): Decoder<T | null> {
  return (value) => (value === undefined || value === null ? null : decode(value));
}

export function array<T>(decode: Decoder<T>): Decoder<T[]> {
  return (value) => {
    if (!Array.isArray(value)) {
      throw new WeatherError('invalid_response');
    }

    return value.map(decode);
  };
}

export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new WeatherError('invalid_response');
  }

  return value as Record<string, unknown>;
}

export function object<S extends Record<string, Decoder<unknown>>>(
  shape: S,
): Decoder<{ [K in keyof S]: ReturnType<S[K]> }> {
  return (value) => {
    const input = record(value);

    return Object.fromEntries(Object.entries(shape).map(([key, decode]) => [key, decode(input[key])])) as {
      [K in keyof S]: ReturnType<S[K]>;
    };
  };
}

export const text = optional(string);
export const num = optional(number);
export const texts = optional(array(string));

export function iso(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const date = new Date(typeof value === 'number' ? value * 1000 : value);

  if (!Number.isFinite(date.getTime())) {
    throw new WeatherError('invalid_response');
  }

  return date.toISOString();
}

export function requiredTime(value: string | number | null | undefined): string {
  const time = iso(value);

  if (!time) {
    throw new WeatherError('invalid_response');
  }

  return time;
}

export function safeUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}
