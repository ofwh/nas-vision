import type { HttpClient } from '../../http';
import type { WeatherProvider } from '../../provider';
import { metadata } from '../../normalize';
import { WeatherError } from '../../errors';
import type { CaiyunConfig } from './config';
import { createClient } from './client';
import * as dto from './types';
import * as normalize from './normalizer';

export function createCaiyunProvider(config: CaiyunConfig, http: HttpClient, language: string): WeatherProvider {
  const client = createClient(config, http, language),
    meta = () => metadata(['https://www.caiyunapp.com/']);

  return {
    id: 'caiyun',
    async getRealtime(location) {
      const v = await client.get('realtime', 'realtime', location, dto.current);

      return { ...normalize.current(v.data, v.serverTime), ...meta() };
    },
    async getHourly(location, { hours = 24 }) {
      if (hours > 360) {
        throw new WeatherError('unsupported');
      }

      const v = await client.get('hourly', 'hourly', location, dto.hourly, { hourlysteps: hours });

      return { ...meta(), summary: v.data.description ?? v.summary, items: normalize.hourly(v.data).slice(0, hours) };
    },
    async getDaily(location, { days = 7 }) {
      if (days > 15) {
        throw new WeatherError('unsupported');
      }

      const v = await client.get('daily', 'daily', location, dto.daily, { dailysteps: days });

      return { ...meta(), items: normalize.daily(v.data, v.tzshift).slice(0, days) };
    },
    async getMinutely(location, { minutes = 60 }) {
      if (minutes > 120) {
        throw new WeatherError('unsupported');
      }

      const v = await client.get('minutely', 'minutely', location, dto.minutes);

      return {
        ...meta(),
        summary: v.data.description ?? v.summary,
        items: normalize.minutely(v.data, v.serverTime).slice(0, minutes),
      };
    },
    async getAlerts(location) {
      const v = await client.get('realtime', 'alert', location, dto.alerts, { alert: true });

      return { ...meta(), items: v.data.content.map(normalize.alert) };
    },
    async getAirQuality(location) {
      const v = await client.get('realtime', 'realtime', location, dto.current);

      if (!v.data.air_quality) {
        throw new WeatherError('unsupported');
      }

      return normalize.air(v.data.air_quality);
    },
  };
}
