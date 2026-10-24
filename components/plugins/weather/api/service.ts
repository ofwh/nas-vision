import type { PluginConfig, PluginFieldType } from '@/types/plugins';
import {
  createWeatherService,
  WeatherError as ServiceError,
  type ProviderConfig,
  type WeatherService,
  type Location,
} from '../lib';
import { defaultUnits } from '../lib/units';
import type { WeatherQueryParams, WeatherQueryRes, WeatherSettings } from '../types';
import { values, daily as dailyView } from './presentation';
import { WeatherError } from './errors';

function str(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function numeric(value: unknown, fallback?: number): number {
  if (value === undefined && fallback !== undefined) {
    return fallback;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    return Number(value);
  }

  return NaN;
}

function unit<T extends string>(value: PluginFieldType | undefined, choices: readonly T[], fallback: T): T {
  if (value === undefined) {
    return fallback;
  }

  const selected = choices.find((choice) => choice === value);

  if (!selected) {
    throw new WeatherError('CONFIG_INVALID');
  }

  return selected;
}

function settings(config: PluginConfig, params: WeatherQueryParams): WeatherSettings {
  const provider = config.provider ?? 'qweather';

  if (provider !== 'qweather' && provider !== 'caiyun') {
    throw new WeatherError('CONFIG_INVALID');
  }

  const latitude = numeric(params?.latitude),
    longitude = numeric(params?.longitude);
  const token = str(config[provider === 'qweather' ? 'qweatherApiKey' : 'caiyunToken']),
    locationName = str(params?.locationName) ?? `${latitude}, ${longitude}`,
    timeZone = str(params?.timeZone) ?? 'UTC';
  const host = (str(config.qweatherHost) ?? '').replace(/^https:\/\//, '').replace(/\/$/, '');

  if (!token || (provider === 'qweather' && !/^[a-z0-9-]+\.qweatherapi\.com$/i.test(host))) {
    throw new WeatherError('CONFIG_INVALID');
  }

  if (
    !Number.isFinite(latitude) ||
    Math.abs(latitude) > 90 ||
    !Number.isFinite(longitude) ||
    Math.abs(longitude) > 180
  ) {
    throw new WeatherError('LOCATION_INVALID');
  }

  try {
    new Intl.DateTimeFormat('en', { timeZone }).format();
  } catch {
    throw new WeatherError('LOCATION_INVALID');
  }

  return {
    provider,
    token,
    host,
    latitude,
    longitude,
    locationName,
    timeZone,
    units: {
      temperature: unit(config.temperatureUnit, ['celsius', 'fahrenheit'], defaultUnits.temperature),
      pressure: unit(config.pressureUnit, ['pascal', 'hectopascal'], defaultUnits.pressure),
      windSpeed: unit(
        config.windSpeedUnit,
        ['meter_per_second', 'kilometer_per_hour', 'mile_per_hour'],
        defaultUnits.windSpeed,
      ),
      visibility: unit(config.visibilityUnit, ['meter', 'kilometer'], defaultUnits.visibility),
      precipitation: unit(config.precipitationUnit, ['millimeter', 'inch'], defaultUnits.precipitation),
    },
    locale: params?.locale === 'en' ? 'en' : 'zh-CN',
  };
}

function context(params: WeatherQueryParams, config: PluginConfig) {
  const s = settings(config, params);
  const configs: Record<WeatherSettings['provider'], ProviderConfig> = {
    caiyun: { type: 'caiyun', token: s.token },
    qweather: { type: 'qweather', apiKey: s.token, host: s.host },
  };

  const weather = createWeatherService({
    provider: configs[s.provider],
    language: s.locale,
    units: s.units,
  });
  const location = { latitude: s.latitude, longitude: s.longitude };

  return { settings: s, weather, location };
}

function rethrow(error: unknown): never {
  if (!(error instanceof ServiceError)) {
    throw error;
  }

  const codes = {
    invalid_config: 'CONFIG_INVALID',
    invalid_argument: 'FORECAST_INVALID',
    unauthorized: 'AUTH_FAILED',
    rate_limited: 'RATE_LIMITED',
    invalid_response: 'INVALID_RESPONSE',
    unsupported: 'UNSUPPORTED',
    timeout: 'TIMEOUT',
    network_error: 'REQUEST_FAILED',
    service_unavailable: 'REQUEST_FAILED',
  } as const;

  throw new WeatherError(codes[error.code]);
}

async function run<T>(
  params: WeatherQueryParams,
  config: PluginConfig,
  action: (weather: WeatherService, location: Location) => Promise<T>,
): Promise<T> {
  try {
    const { weather, location } = context(params, config);

    return await action(weather, location);
  } catch (error) {
    rethrow(error);
  }
}

export async function realtime(params: WeatherQueryParams, config: PluginConfig) {
  return run(params, config, (weather, location) => weather.realtime(location));
}

export async function hourly(params: WeatherQueryParams, config: PluginConfig) {
  return run(params, config, (weather, location) => weather.hourly(location, { hours: params?.hours }));
}

export async function daily(params: WeatherQueryParams, config: PluginConfig) {
  return run(params, config, (weather, location) => weather.daily(location, { days: params?.days }));
}

export async function minutely(params: WeatherQueryParams, config: PluginConfig) {
  return run(params, config, (weather, location) => weather.minutely(location, { minutes: params?.minutes }));
}

export async function alerts(params: WeatherQueryParams, config: PluginConfig) {
  return run(params, config, (weather, location) => weather.alerts(location));
}

export async function airQuality(params: WeatherQueryParams, config: PluginConfig) {
  return run(params, config, (weather, location) => weather.airQuality(location));
}

export async function query(params: WeatherQueryParams, config: PluginConfig): Promise<WeatherQueryRes> {
  const hours = numeric(params?.hours, 24),
    days = numeric(params?.days, 7);

  if (!Number.isInteger(hours) || hours < 12 || hours > 72 || !Number.isInteger(days) || days < 3 || days > 7) {
    throw new WeatherError('FORECAST_INVALID');
  }

  try {
    const { settings: s, weather, location } = context(params, config);
    const [current, hourly, dailyForecast, alerts, air] = await Promise.allSettled([
      weather.realtime(location),
      weather.hourly(location, { hours }),
      weather.daily(location, { days }),
      weather.alerts(location),
      weather.airQuality(location),
    ]);

    if (current.status === 'rejected') {
      throw current.reason;
    }

    if (hourly.status === 'rejected') {
      throw hourly.reason;
    }

    if (dailyForecast.status === 'rejected') {
      throw dailyForecast.reason;
    }

    const alertData = alerts.status === 'fulfilled' ? alerts.value : null;
    const airData = air.status === 'fulfilled' ? air.value : null;

    return {
      current: values(current.value, airData),
      hourly: hourly.value.items.map((v) => values(v)),
      daily: dailyForecast.value.items.map(dailyView),
      alerts: alertData?.items ?? [],
      alertsStatus: alertData ? 'available' : 'unavailable',
      summary: hourly.value.summary,
      attributions: [
        ...new Set(
          [current.value, hourly.value, dailyForecast.value, alertData, airData].flatMap((v) => v?.attributions ?? []),
        ),
      ],
      airQuality: airData,
      airQualityStatus: airData
        ? 'available'
        : air.status === 'rejected' && air.reason instanceof ServiceError && air.reason.code === 'unsupported'
          ? 'unsupported'
          : 'unavailable',
      provider: s.provider,
      locationName: s.locationName,
      timeZone: s.timeZone,
      fetchedAt: new Date().toISOString(),
      requestedHours: hours,
      requestedDays: days,
      units: s.units,
    };
  } catch (error) {
    rethrow(error);
  }
}

const service = { query, realtime, hourly, daily, minutely, alerts, airQuality };

export default service;
