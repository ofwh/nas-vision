import type {
  Measurement,
  TemperatureUnit,
  PressureUnit,
  WindSpeedUnit,
  VisibilityUnit,
  PrecipitationUnit,
  PrecipitationRateUnit,
} from './units';

export type Location = { latitude: number; longitude: number };
export type Condition =
  | 'clear'
  | 'partly_cloudy'
  | 'cloudy'
  | 'fog'
  | 'haze'
  | 'drizzle'
  | 'rain'
  | 'heavy_rain'
  | 'snow'
  | 'heavy_snow'
  | 'thunderstorm'
  | 'wind'
  | 'unknown';
export type WeatherValues = {
  time: string | null;
  condition: Condition;
  conditionText: string | null;
  isDay: boolean | null;
  temperature: Measurement<TemperatureUnit> | null;
  apparentTemperature: Measurement<TemperatureUnit> | null;
  humidity: Measurement<'percent'> | null;
  dewPoint: Measurement<TemperatureUnit> | null;
  pressure: Measurement<PressureUnit> | null;
  pressureType: 'surface' | 'sea_level';
  visibility: Measurement<VisibilityUnit> | null;
  cloudCover: Measurement<'percent'> | null;
  windSpeed: Measurement<WindSpeedUnit> | null;
  windDirection: Measurement<'degree'> | null;
  windGust: Measurement<WindSpeedUnit> | null;
  precipitationAmount: Measurement<PrecipitationUnit> | null;
  precipitationIntensity: Measurement<PrecipitationRateUnit> | null;
  precipitationProbability: Measurement<'percent'> | null;
  precipitationType: 'rain' | 'snow' | 'sleet' | 'mixed' | 'none' | 'unknown';
  uvIndex: number | null;
  uvDescription: string | null;
};
export type DailyWeather = {
  date: string;
  low: Measurement<TemperatureUnit> | null;
  high: Measurement<TemperatureUnit> | null;
  condition: Condition;
  conditionText: string | null;
  probability: Measurement<'percent'> | null;
  sunrise: string | null;
  sunset: string | null;
  moonrise: string | null;
  moonset: string | null;
  moonPhase: string | null;
  uvIndex: number | null;
};
export type MinuteWeather = {
  time: string;
  intervalMinutes: number;
  precipitationAmount: Measurement<PrecipitationUnit> | null;
  precipitationIntensity: Measurement<PrecipitationRateUnit> | null;
  precipitationProbability: Measurement<'percent'> | null;
  precipitationType: WeatherValues['precipitationType'];
};
export type WeatherAlert = {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme' | 'unknown';
  color: 'white' | 'gray' | 'green' | 'blue' | 'yellow' | 'amber' | 'orange' | 'red' | 'purple' | 'black' | 'unknown';
  urgency: string | null;
  certainty: string | null;
  issuedAt: string | null;
  effectiveAt: string | null;
  onsetAt: string | null;
  expiresAt: string | null;
  endsAt: string | null;
  instructions: string | null;
  areas: string[];
  responseTypes: string[];
  url: string | null;
};
export type AirQualityIndex = {
  value: number;
  scale: 'china' | 'us' | 'other';
  standard: string;
  name: string;
  category: string | null;
  display: string | null;
};
export type AirQuality = {
  indexes: AirQualityIndex[];
  pollutants: {
    name: string;
    concentration: Measurement<'microgram_per_cubic_meter' | 'parts_per_billion' | 'parts_per_million'>;
  }[];
};
export type Metadata = { attributions: string[]; summary: string | null };
export type RealtimeWeather = WeatherValues & Metadata;
export type Collection<T> = Metadata & { items: T[] };
export type AirQualityWeather = AirQuality & Metadata;
export type HourlyOptions = { hours?: number };
export type DailyOptions = { days?: number };
export type MinutelyOptions = { minutes?: number };
