import type { HttpClient } from '../../http';
import type { Location } from '../../models';
import type { Decoder } from '../../decode';
import { record } from '../../decode';
import { WeatherError } from '../../errors';
import type { QWeatherConfig } from './config';

export function createClient(config: QWeatherConfig, http: HttpClient, language: string) {
  if (typeof config.host !== 'string' || typeof config.apiKey !== 'string') {
    throw new WeatherError('invalid_config');
  }

  const host = config.host.replace(/^https:\/\//, '').replace(/\/$/, '');

  if (!/^[a-z0-9-]+\.qweatherapi\.com$/i.test(host) || !config.apiKey.trim()) {
    throw new WeatherError('invalid_config');
  }

  return {
    get<T>(
      path: string,
      location: Location,
      decode: Decoder<T>,
      query: Record<string, string | number> = {},
    ): Promise<T> {
      const legacy = path.startsWith('v7/');
      const endpoint = `https://${host}/${path}${legacy ? '' : `/${location.latitude}/${location.longitude}`}`;

      return http.get(
        endpoint,
        (value) => {
          const code = record(value).code;

          if (code && code !== '200') {
            throw new WeatherError(
              code === '401' || code === '403'
                ? 'unauthorized'
                : code === '429'
                  ? 'rate_limited'
                  : code === '204'
                    ? 'unsupported'
                    : 'service_unavailable',
            );
          }

          return decode(value);
        },
        {
          headers: { 'X-QW-Api-Key': config.apiKey },
          query: {
            lang: language === 'zh-CN' ? 'zh' : language === 'zh-TW' ? 'zh-hant' : language,
            ...(legacy ? { location: `${location.longitude.toFixed(2)},${location.latitude.toFixed(2)}` } : {}),
            ...query,
          },
        },
      );
    },
  };
}
