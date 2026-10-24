import type { HttpClient } from '../../http';
import type { WeatherProvider } from '../../provider';
import { WeatherError } from '../../errors';
import { metadata } from '../../normalize';
import type { QWeatherConfig } from './config';
import { createClient } from './client';
import * as dto from './types';
import * as normalize from './normalizer';

export function createQWeatherProvider(config: QWeatherConfig, http: HttpClient, language: string): WeatherProvider {
  const client = createClient(config, http, language);

  return {
    id: 'qweather',
    async getRealtime(location) {
      const v = await client.get('weather/v1/current', location, dto.values);

      return { ...normalize.values(v), ...metadata(v.metadata?.attributions ?? []) };
    },
    async getHourly(location, { hours = 24 }) {
      if (hours > 240) {
        throw new WeatherError('unsupported');
      }

      const v = await client.get('weather/v1/hourly', location, dto.hours, { hours });

      return { ...metadata(v.metadata?.attributions ?? []), items: v.hours.slice(0, hours).map(normalize.values) };
    },
    async getDaily(location, { days = 7 }) {
      if (days > 10) {
        throw new WeatherError('unsupported');
      }

      const v = await client.get('weather/v1/daily', location, dto.days, { days });

      return { ...metadata(v.metadata?.attributions ?? []), items: v.days.slice(0, days).map(normalize.daily) };
    },
    async getMinutely(location, { minutes = 60 }) {
      if (minutes > 120) {
        throw new WeatherError('unsupported');
      }

      const v = await client.get('v7/minutely/5m', location, dto.minutes);

      return {
        ...metadata(v.refer?.sources ?? [], v.summary),
        items: normalize.minutely(v).slice(0, Math.ceil(minutes / 5)),
      };
    },
    async getAlerts(location) {
      const v = await client.get('weatheralert/v1/current', location, dto.alerts);

      return {
        ...metadata(v.metadata?.attributions ?? []),
        items: v.alerts.filter((a) => a.messageType?.code !== 'cancel').map(normalize.alert),
      };
    },
    async getAirQuality(location) {
      return normalize.air(await client.get('airquality/v1/current', location, dto.air));
    },
  };
}
