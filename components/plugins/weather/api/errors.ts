export const codes = {
  CONFIG_INVALID: 5201000,
  AUTH_FAILED: 5201001,
  LOCATION_INVALID: 5201002,
  FORECAST_INVALID: 5201003,
  REQUEST_FAILED: 5202000,
  INVALID_RESPONSE: 5202001,
  RATE_LIMITED: 5202002,
  UNSUPPORTED: 5202003,
  TIMEOUT: 5202004,
} as const;

export class WeatherError extends Error {
  constructor(public readonly code: keyof typeof codes) {
    super(code);
  }
}
