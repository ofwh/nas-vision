import type { WeatherServiceConfig } from './config';
import type {
  AirQualityWeather,
  Collection,
  DailyOptions,
  DailyWeather,
  HourlyOptions,
  Location,
  MinuteWeather,
  MinutelyOptions,
  RealtimeWeather,
  WeatherAlert,
  WeatherValues,
} from './models';
import { createUnitConverter } from './converter';
import { WeatherError } from './errors';
import { createProvider } from './factory';
import { createHttpClient, type HttpClient } from './http';
import { resolveUnits } from './units';

export interface WeatherService {
  realtime(location: Location): Promise<RealtimeWeather>;
  hourly(location: Location, options?: HourlyOptions): Promise<Collection<WeatherValues>>;
  daily(location: Location, options?: DailyOptions): Promise<Collection<DailyWeather>>;
  minutely(location: Location, options?: MinutelyOptions): Promise<Collection<MinuteWeather>>;
  alerts(location: Location): Promise<Collection<WeatherAlert>>;
  airQuality(location: Location): Promise<AirQualityWeather>;
}

function location(value: Location): Location {
  if (
    !value ||
    !Number.isFinite(value.latitude) ||
    Math.abs(value.latitude) > 90 ||
    !Number.isFinite(value.longitude) ||
    Math.abs(value.longitude) > 180
  ) {
    throw new WeatherError('invalid_argument');
  }

  return { latitude: value.latitude, longitude: value.longitude };
}

function count(value: number | undefined, fallback: number): number {
  const count = value ?? fallback;

  if (!Number.isInteger(count) || count < 1) {
    throw new WeatherError('invalid_argument');
  }

  return count;
}

function validValues<T extends WeatherValues>(value: T): T {
  if (value.temperature === null) {
    throw new WeatherError('invalid_response');
  }

  return value;
}

function nonempty<T>(value: Collection<T>): Collection<T> {
  if (!value.items.length) {
    throw new WeatherError('invalid_response');
  }

  return value;
}

export function createWeatherService(
  config: WeatherServiceConfig,
  dependencies: { http?: HttpClient } = {},
): WeatherService {
  const language = config.language ?? 'zh-CN';

  if (!/^[a-zA-Z]{2,3}(?:[-_][a-zA-Z0-9]{2,8})*$/.test(language)) {
    throw new WeatherError('invalid_config');
  }

  const http = dependencies.http ?? createHttpClient(config.timeoutMs);
  const provider = createProvider({ ...config.provider }, http, language);
  const converter = createUnitConverter(resolveUnits(config.units));

  return {
    async realtime(point) {
      return converter.values(validValues(await provider.getRealtime(location(point))));
    },
    async hourly(point, options = {}) {
      const result = nonempty(await provider.getHourly(location(point), { hours: count(options.hours, 24) }));

      return {
        ...result,
        items: result.items.map((value) => {
          if (!value.time) {
            throw new WeatherError('invalid_response');
          }

          return converter.values(validValues(value));
        }),
      };
    },
    async daily(point, options = {}) {
      const result = nonempty(await provider.getDaily(location(point), { days: count(options.days, 7) }));

      return {
        ...result,
        items: result.items.map((value) => {
          if (!value.low || !value.high) {
            throw new WeatherError('invalid_response');
          }

          return converter.daily(value);
        }),
      };
    },
    async minutely(point, options = {}) {
      const result = await provider.getMinutely(location(point), { minutes: count(options.minutes, 60) });

      return { ...result, items: result.items.map(converter.minutely) };
    },
    async alerts(point) {
      const result = await provider.getAlerts(location(point));

      return {
        ...result,
        items: [...result.items].sort((a, b) => {
          if (!a.issuedAt) {
            return b.issuedAt ? 1 : 0;
          }

          if (!b.issuedAt) {
            return -1;
          }

          return Date.parse(b.issuedAt) - Date.parse(a.issuedAt);
        }),
      };
    },
    async airQuality(point) {
      return provider.getAirQuality(location(point));
    },
  };
}
