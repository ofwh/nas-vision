import { record, num, text, type Decoder } from '../../decode';
import { WeatherError } from '../../errors';
import type { HttpClient } from '../../http';
import { coalesce } from '../../http';
import type { Location } from '../../models';
import type { CaiyunConfig } from './config';

export function createClient(config: CaiyunConfig, http: HttpClient, language: string) {
  if (typeof config.token !== 'string' || !config.token.trim()) {
    throw new WeatherError('invalid_config');
  }

  const languageMap: Record<string, string> = {
    'zh-CN': 'zh_CN',
    'zh-TW': 'zh_TW',
    en: 'en_US',
    'en-US': 'en_US',
    'en-GB': 'en_GB',
  };
  const request = coalesce((url) =>
    http.get(url, (value) => {
      const root = record(value);

      if (root.status !== 'ok') {
        throw new WeatherError(root.error === 'token is invalid' ? 'unauthorized' : 'service_unavailable');
      }

      return {
        serverTime: num(root.server_time),
        tzshift: num(root.tzshift),
        summary: text(record(root.result).forecast_keypoint),
        result: record(root.result),
      };
    }),
  );

  return {
    async get<T>(
      path: 'realtime' | 'hourly' | 'daily' | 'minutely',
      block: string,
      location: Location,
      decode: Decoder<T>,
      params: Record<string, string | number | boolean> = {},
    ) {
      const point = config.transformLocation ? config.transformLocation({ ...location }) : location;

      if (
        !Number.isFinite(point.latitude) ||
        Math.abs(point.latitude) > 90 ||
        !Number.isFinite(point.longitude) ||
        Math.abs(point.longitude) > 180
      ) {
        throw new WeatherError('invalid_argument');
      }

      const url = new URL(
        `https://api.caiyunapp.com/v2.6/${encodeURIComponent(config.token)}/${point.longitude},${point.latitude}/${path}`,
      );

      for (const [key, value] of Object.entries({
        unit: 'metric:v2',
        lang: languageMap[language] ?? language,
        alert: false,
        ...params,
      })) {
        url.searchParams.set(key, String(value));
      }
      const root = await request(url.href);

      if (!root.result[block]) {
        throw new WeatherError('unsupported');
      }

      if (record(root.result[block]).status !== 'ok') {
        throw new WeatherError('service_unavailable');
      }

      return { ...root, data: decode(root.result[block]) };
    },
  };
}
