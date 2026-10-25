import { getLocale } from 'next-intl/server';
import { okResponse, readParams } from '@/lib/api';
import type { PluginApi, PluginApiHandler, PluginConfig } from '@/types/plugins';
import type { WeatherQueryParams } from '../types';
import { getMessages } from '../i18n';
import { codes, WeatherError } from './errors';
import service from './service';

function handler<T>(action: (params: WeatherQueryParams, config: PluginConfig) => Promise<T>): PluginApiHandler {
  return async (request, config) => {
    const params = await readParams<WeatherQueryParams>(request);

    if (!params.ok) {
      return params;
    }

    try {
      return { ok: true, value: okResponse(await action(params.value, config)) };
    } catch (error) {
      const code = error instanceof WeatherError ? error.code : 'REQUEST_FAILED';
      const message = getMessages(await getLocale()).errors[code];

      return {
        ok: true,
        value: Response.json({ code: codes[code], data: null, message, error: { code: `weather.${code}`, message } }),
      };
    }
  };
}

const api = {
  'api/query': { POST: handler(service.query) },
  'api/realtime': { POST: handler(service.realtime) },
  'api/hourly': { POST: handler(service.hourly) },
  'api/daily': { POST: handler(service.daily) },
  'api/minutely': { POST: handler(service.minutely) },
  'api/alerts': { POST: handler(service.alerts) },
  'api/airQuality': { POST: handler(service.airQuality) },
} satisfies PluginApi;

export default api;
