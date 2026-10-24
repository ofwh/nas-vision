import type { CaiyunConfig } from './providers/caiyun/config';
import type { QWeatherConfig } from './providers/qweather/config';
import type { UnitConfig } from './units';

export type ProviderConfig = CaiyunConfig | QWeatherConfig;
export type WeatherServiceConfig = {
  provider: ProviderConfig;
  units?: Partial<UnitConfig>;
  language?: string;
  timeoutMs?: number;
};
