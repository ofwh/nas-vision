import type { ProviderConfig } from './config';
import type { HttpClient } from './http';
import type { WeatherProvider } from './provider';
import { WeatherError } from './errors';
import { createCaiyunProvider } from './providers/caiyun';
import { createQWeatherProvider } from './providers/qweather';

export function createProvider(config: ProviderConfig, http: HttpClient, language: string): WeatherProvider {
  switch (config.type) {
    case 'caiyun':
      return createCaiyunProvider(config, http, language);
    case 'qweather':
      return createQWeatherProvider(config, http, language);
    default:
      throw new WeatherError('invalid_config');
  }
}
