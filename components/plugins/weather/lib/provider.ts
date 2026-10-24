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

export interface WeatherProvider {
  readonly id: 'caiyun' | 'qweather';
  getRealtime(location: Location): Promise<RealtimeWeather>;
  getHourly(location: Location, options: HourlyOptions): Promise<Collection<WeatherValues>>;
  getDaily(location: Location, options: DailyOptions): Promise<Collection<DailyWeather>>;
  getMinutely(location: Location, options: MinutelyOptions): Promise<Collection<MinuteWeather>>;
  getAlerts(location: Location): Promise<Collection<WeatherAlert>>;
  getAirQuality(location: Location): Promise<AirQualityWeather>;
}
