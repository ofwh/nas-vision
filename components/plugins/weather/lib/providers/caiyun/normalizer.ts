import type { AirQualityWeather, DailyWeather, MinuteWeather, WeatherAlert, WeatherValues } from '../../models';
import { emptyValues, metadata, namedCondition } from '../../normalize';
import { measurement as m } from '../../units';
import { iso, requiredTime } from '../../decode';
import { WeatherError } from '../../errors';
import type { Current, Hourly, Daily, Minutes, Alert, Air } from './types';

const percent = (n: number | null | undefined) => m(n == null ? null : n * 100, 'percent');
const isDay = (code: string | null) => (code?.endsWith('_DAY') ? true : code?.endsWith('_NIGHT') ? false : null);

export function current(v: Current, serverTime: number | null): WeatherValues {
  return {
    ...emptyValues(requiredTime(serverTime)),
    condition: namedCondition(v.skycon),
    isDay: isDay(v.skycon),
    temperature: m(v.temperature, 'celsius'),
    apparentTemperature: m(v.apparent_temperature, 'celsius'),
    humidity: percent(v.humidity),
    pressure: m(v.pressure == null ? null : v.pressure / 100, 'hectopascal'),
    pressureType: 'surface',
    visibility: m(v.visibility == null ? null : v.visibility * 1000, 'meter'),
    cloudCover: percent(v.cloudrate),
    windSpeed: m(v.wind?.speed == null ? null : v.wind.speed / 3.6, 'meter_per_second'),
    windDirection: m(v.wind?.direction, 'degree'),
    precipitationIntensity: m(v.precipitation?.local?.intensity, 'millimeter_per_hour'),
    uvIndex: v.life_index?.ultraviolet?.index ?? null,
    uvDescription: v.life_index?.ultraviolet?.desc ?? null,
  };
}

function entry<T extends { datetime: string }>(series: T[] | null, time: string): T | undefined {
  return series?.find((v) => v.datetime === time);
}

export function hourly(v: Hourly): WeatherValues[] {
  return v.temperature.map((temp) => {
    const time = temp.datetime,
      wind = entry(v.wind, time),
      rain = entry(v.precipitation, time),
      code = entry(v.skycon, time)?.value ?? null;
    const n = (key: 'apparent_temperature' | 'humidity' | 'pressure' | 'visibility' | 'cloudrate') =>
      entry(v[key], time)?.value ?? null;
    const pressure = n('pressure'),
      visibility = n('visibility');

    return {
      ...emptyValues(requiredTime(time)),
      condition: namedCondition(code),
      isDay: isDay(code),
      temperature: m(temp.value, 'celsius'),
      apparentTemperature: m(n('apparent_temperature'), 'celsius'),
      humidity: percent(n('humidity')),
      pressure: m(pressure === null ? null : pressure / 100, 'hectopascal'),
      pressureType: 'surface',
      visibility: m(visibility === null ? null : visibility * 1000, 'meter'),
      cloudCover: percent(n('cloudrate')),
      windSpeed: m(wind?.speed == null ? null : wind.speed / 3.6, 'meter_per_second'),
      windDirection: m(wind?.direction, 'degree'),
      precipitationIntensity: m(rain?.value, 'millimeter_per_hour'),
      precipitationProbability: m(rain?.probability, 'percent'),
    };
  });
}

function astronomy(date: string, time: string | null | undefined, offset: number | null): string | null {
  if (!time || offset === null) {
    return null;
  }

  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw new WeatherError('invalid_response');
  }

  return iso((Date.parse(`${date.slice(0, 10)}T${time}:00Z`) - offset * 1000) / 1000);
}

export function daily(v: Daily, offset: number | null): DailyWeather[] {
  return v.temperature.map((temp) => {
    const date = temp.date,
      astro = v.astro?.find((a) => a.date === date);

    return {
      date: requiredTime(date),
      low: m(temp.min, 'celsius'),
      high: m(temp.max, 'celsius'),
      condition: namedCondition(v.skycon?.find((a) => a.date === date)?.value ?? null),
      conditionText: null,
      probability: m(v.precipitation?.find((a) => a.date === date)?.probability, 'percent'),
      sunrise: astronomy(date, astro?.sunrise?.time, offset),
      sunset: astronomy(date, astro?.sunset?.time, offset),
      moonrise: null,
      moonset: null,
      moonPhase: null,
      uvIndex: null,
    };
  });
}

export function minutely(v: Minutes, serverTime: number | null): MinuteWeather[] {
  const start = Math.floor(Date.parse(requiredTime(serverTime)) / 60000) * 60000;

  return v.precipitation_2h.map((rate, index) => ({
    time: new Date(start + index * 60000).toISOString(),
    intervalMinutes: 1,
    precipitationIntensity: m(rate, 'millimeter_per_hour'),
    precipitationAmount: null,
    precipitationProbability: null,
    precipitationType: 'unknown',
  }));
}

export function alert(v: Alert): WeatherAlert {
  const levels: Record<string, Pick<WeatherAlert, 'severity' | 'color'>> = {
    '00': { severity: 'unknown', color: 'white' },
    '01': { severity: 'minor', color: 'blue' },
    '02': { severity: 'moderate', color: 'yellow' },
    '03': { severity: 'severe', color: 'orange' },
    '04': { severity: 'extreme', color: 'red' },
  };
  const level = v.code && /^\d{4}$/.test(v.code) ? levels[v.code.slice(-2)] : undefined;

  return {
    id: v.alertId ?? `${v.pubtimestamp}:${v.title}`,
    title: v.title,
    description: v.description,
    source: v.source,
    severity: level?.severity ?? 'unknown',
    color: level?.color ?? 'unknown',
    urgency: null,
    certainty: null,
    issuedAt: iso(v.pubtimestamp),
    effectiveAt: null,
    onsetAt: null,
    expiresAt: null,
    endsAt: null,
    instructions: null,
    areas: [],
    responseTypes: [],
    url: null,
  };
}

export function air(v: Air): AirQualityWeather {
  return {
    ...metadata(['https://www.caiyunapp.com/']),
    indexes: [
      ...(v.aqi?.chn == null
        ? []
        : [
            {
              value: v.aqi.chn,
              scale: 'china' as const,
              standard: 'china-aqi',
              name: 'China AQI',
              category: v.description?.chn ?? null,
              display: null,
            },
          ]),
      ...(v.aqi?.usa == null
        ? []
        : [
            {
              value: v.aqi.usa,
              scale: 'us' as const,
              standard: 'us-aqi',
              name: 'US AQI',
              category: v.description?.usa ?? null,
              display: null,
            },
          ]),
    ],
    pollutants: (['pm25', 'pm10', 'o3', 'so2', 'no2'] as const).flatMap((name) =>
      v[name] === null ? [] : [{ name, concentration: { value: v[name], unit: 'microgram_per_cubic_meter' as const } }],
    ),
  };
}
