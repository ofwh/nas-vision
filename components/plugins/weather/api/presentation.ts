import type { AirQualityWeather, DailyWeather as Daily, WeatherValues as Values } from '../lib';
import type { DailyWeather, WeatherValues } from '../types';

export function values(v: Values, air?: AirQualityWeather | null): WeatherValues {
  const index = air?.indexes[0];
  const pm25 = air?.pollutants.find((p) => p.name === 'pm25')?.concentration;

  return {
    time: v.time,
    condition: v.condition,
    conditionText: v.conditionText,
    isDay: v.isDay,
    temperature: v.temperature?.value ?? null,
    apparentTemperature: v.apparentTemperature?.value ?? null,
    humidity: v.humidity?.value ?? null,
    dewPoint: v.dewPoint?.value ?? null,
    pressure: v.pressure?.value ?? null,
    pressureType: v.pressureType === 'surface' ? 'surface' : 'seaLevel',
    visibility: v.visibility?.value ?? null,
    cloudCover: v.cloudCover?.value ?? null,
    windSpeed: v.windSpeed?.value ?? null,
    windDirection: v.windDirection?.value ?? null,
    windGust: v.windGust?.value ?? null,
    precipitationAmount: v.precipitationAmount?.value ?? null,
    precipitationIntensity: v.precipitationIntensity?.value ?? null,
    precipitationProbability: v.precipitationProbability?.value ?? null,
    precipitationType: v.precipitationType,
    uvIndex: v.uvIndex,
    uvDescription: v.uvDescription,
    aqi: index?.value ?? null,
    aqiName: index?.name ?? null,
    aqiScale: index?.scale ?? null,
    aqiCategory: index?.category ?? null,
    aqiDisplay: index?.display ?? null,
    pm25: pm25?.unit === 'microgram_per_cubic_meter' ? pm25.value : null,
  };
}

export function daily(v: Daily): DailyWeather {
  return { ...v, low: v.low?.value ?? null, high: v.high?.value ?? null, probability: v.probability?.value ?? null };
}
