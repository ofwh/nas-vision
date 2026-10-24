export type Provider = 'caiyun' | 'qweather';

export type { Condition, WeatherAlert } from './lib';
import type {
  AirQualityWeather,
  Collection,
  Condition,
  DailyWeather as NormalizedDailyWeather,
  MinuteWeather,
  RealtimeWeather,
  UnitConfig,
  WeatherAlert,
  WeatherValues as NormalizedWeatherValues,
} from './lib';

export type WeatherValues = {
  time: string | null;
  condition: Condition;
  isDay: boolean | null;
  conditionText: string | null;
  temperature: number | null;
  apparentTemperature: number | null;
  humidity: number | null;
  dewPoint: number | null;
  pressure: number | null;
  pressureType: 'surface' | 'seaLevel';
  visibility: number | null;
  cloudCover: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  windGust: number | null;
  precipitationAmount: number | null;
  precipitationIntensity: number | null;
  precipitationProbability: number | null;
  precipitationType: string | null;
  uvIndex: number | null;
  uvDescription: string | null;
  aqi: number | null;
  pm25: number | null;
  aqiName: string | null;
  aqiScale: 'china' | 'us' | 'other' | null;
  aqiCategory: string | null;
  aqiDisplay: string | null;
};
export type DailyWeather = {
  date: string;
  low: number | null;
  high: number | null;
  condition: Condition;
  conditionText: string | null;
  probability: number | null;
  sunrise: string | null;
  sunset: string | null;
  moonrise: string | null;
  moonset: string | null;
  moonPhase: string | null;
  uvIndex: number | null;
};
export type Forecast = {
  current: WeatherValues;
  hourly: WeatherValues[];
  daily: DailyWeather[];
  alerts: WeatherAlert[];
  alertsStatus: 'available' | 'unavailable';
  summary: string | null;
  attributions: string[];
  airQuality: AirQualityWeather | null;
  airQualityStatus: 'available' | 'unavailable' | 'unsupported';
};
export type WeatherQueryParams = {
  locale: string;
  minutes?: number;
  hours?: number;
  days?: number;
  latitude: number;
  longitude: number;
  locationName?: string;
  timeZone?: string;
};
export type WeatherQueryRes = Forecast & {
  provider: Provider;
  locationName: string;
  timeZone: string;
  fetchedAt: string;
  requestedHours: number;
  requestedDays: number;
  units: UnitConfig;
};
export type WeatherSettings = {
  provider: Provider;
  token: string;
  host: string;
  latitude: number;
  longitude: number;
  locationName: string;
  timeZone: string;
  units: UnitConfig;
  locale: string;
};

export type WeatherDebugMethod = 'realtime' | 'hourly' | 'daily' | 'minutely' | 'alerts' | 'airQuality';
export type WeatherDebugRes =
  | RealtimeWeather
  | Collection<NormalizedWeatherValues>
  | Collection<NormalizedDailyWeather>
  | Collection<MinuteWeather>
  | Collection<WeatherAlert>
  | AirQualityWeather;

export type PluginWeatherCard = {
  type: string;
  status: boolean;
};

export type WeatherCity = {
  latitude: number;
  name: string;
  longitude: number;
  index: number;
  cards: PluginWeatherCard[];
};

export type WeatherStorageCard = PluginWeatherCard & { name: string };

export type WeatherCityItem = Omit<WeatherCity, 'cards'> & {
  id: string;
  key: string | null;
  cards: WeatherStorageCard[];
};

export type WeatherCityInput = {
  name: string;
  longitude: string | number;
  latitude: string | number;
  cards?: PluginWeatherCard[];
};
