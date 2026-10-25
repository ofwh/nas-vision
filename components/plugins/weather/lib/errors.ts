export type WeatherErrorCode =
  | 'invalid_config'
  | 'invalid_argument'
  | 'unauthorized'
  | 'rate_limited'
  | 'unsupported'
  | 'timeout'
  | 'network_error'
  | 'invalid_response'
  | 'service_unavailable';

export class WeatherError extends Error {
  constructor(public readonly code: WeatherErrorCode) {
    super(code);
    this.name = 'WeatherError';
  }
}
