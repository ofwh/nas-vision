import type {
  AirQualityWeather,
  Condition,
  DailyWeather,
  MinuteWeather,
  WeatherAlert,
  WeatherValues,
} from '../../models';
import { alertColor, emptyValues, metadata, precipitationType, severity } from '../../normalize';
import { iso, requiredTime } from '../../decode';
import { measurement as m } from '../../units';
import type { Values, Day, Alert, Air, Minutes, quantity } from './types';

function measure(value: ReturnType<typeof quantity>, unit: string): number | null {
  return value?.unit === unit ? value.value : null;
}

export function condition(code: string | null): Condition {
  if (!code) {
    return 'unknown';
  }

  if (['100', '150'].includes(code)) {
    return 'clear';
  }

  if (['101', '102', '103', '151', '152', '153'].includes(code)) {
    return 'partly_cloudy';
  }

  if (code === '104') {
    return 'cloudy';
  }

  if (['302', '303', '304'].includes(code)) {
    return 'thunderstorm';
  }

  if (['307', '308', '310', '311', '312', '314', '315', '316'].includes(code)) {
    return 'heavy_rain';
  }

  if (/^3\d\d$/.test(code)) {
    return 'rain';
  }

  if (['403', '410'].includes(code)) {
    return 'heavy_snow';
  }

  if (/^4\d\d$/.test(code)) {
    return 'snow';
  }

  if (['500', '501', '509', '510', '514', '515'].includes(code)) {
    return 'fog';
  }

  if (/^5\d\d$/.test(code)) {
    return 'haze';
  }

  return 'unknown';
}

export function values(v: Values): WeatherValues {
  const percent = (n: number | null | undefined) => m(n == null ? null : n * 100, 'percent');
  const code = v.condition?.code ?? null;

  return {
    ...emptyValues(iso(v.forecastTime)),
    condition: condition(code),
    conditionText: v.condition?.text ?? null,
    isDay: code && /^15[0-3]$/.test(code) ? false : null,
    temperature: m(measure(v.temperature, '°C'), 'celsius'),
    apparentTemperature: m(measure(v.feelsLike, '°C'), 'celsius'),
    humidity: percent(v.humidity),
    dewPoint: m(measure(v.dewPoint, '°C'), 'celsius'),
    pressure: m(measure(v.pressure, 'hPa'), 'hectopascal'),
    visibility: m(measure(v.visibility, 'm'), 'meter'),
    cloudCover: percent(v.cloudCover),
    windSpeed: m(measure(v.wind?.speed ?? null, 'm/s'), 'meter_per_second'),
    windDirection: m(v.wind?.direction?.degree, 'degree'),
    windGust: m(measure(v.windGust, 'm/s'), 'meter_per_second'),
    precipitationAmount: m(measure(v.precipitation?.amount ?? null, 'mm'), 'millimeter'),
    precipitationIntensity: m(measure(v.precipitation?.intensity ?? null, 'mm/h'), 'millimeter_per_hour'),
    precipitationProbability: percent(v.precipitation?.probability),
    precipitationType: precipitationType(v.precipitation?.type ?? null),
    uvIndex: v.uvIndex,
  };
}

export function daily(v: Day): DailyWeather {
  return {
    date: requiredTime(v.forecastStartTime),
    low: m(measure(v.temperatureMin, '°C'), 'celsius'),
    high: m(measure(v.temperatureMax, '°C'), 'celsius'),
    condition: condition(v.daytime?.condition?.code ?? null),
    conditionText: v.daytime?.condition?.text ?? null,
    probability: m(
      v.daytime?.precipitation?.probability == null ? null : v.daytime.precipitation.probability * 100,
      'percent',
    ),
    sunrise: iso(v.astro?.sunrise),
    sunset: iso(v.astro?.sunset),
    moonrise: iso(v.astro?.moonrise),
    moonset: iso(v.astro?.moonset),
    moonPhase: v.astro?.moonPhase ?? null,
    uvIndex: v.uvIndexMax,
  };
}

export function alert(v: Alert): WeatherAlert {
  return {
    id: v.id,
    title: v.headline,
    description: v.description,
    source: v.senderName,
    severity: severity(v.severity),
    color: alertColor(v.color?.code ?? null),
    urgency: v.urgency,
    certainty: v.certainty,
    issuedAt: iso(v.issuedTime),
    effectiveAt: iso(v.effectiveTime),
    onsetAt: iso(v.onsetTime),
    expiresAt: iso(v.expireTime),
    endsAt: null,
    instructions: v.instruction,
    areas: v.areaName ? [v.areaName] : [],
    responseTypes: v.responseTypes ?? [],
    url: null,
  };
}

export function air(v: Air): AirQualityWeather {
  return {
    ...metadata(v.metadata?.attributions ?? []),
    indexes: [...v.indexes]
      .sort((a, b) => Number(a.code === 'qaqi') - Number(b.code === 'qaqi'))
      .map((i) => ({
        value: i.aqi,
        scale: i.code === 'cn-mee' || i.code === 'cn-mee-1h' ? 'china' : i.code === 'us-epa' ? 'us' : 'other',
        standard: i.code,
        name: i.name,
        category: i.category,
        display: i.aqiDisplay,
      })),
    pollutants: v.pollutants.flatMap((p) => {
      const c = p.concentration;

      if (!c) {
        return [];
      }

      const unit =
        c.unit === 'μg/m3' || c.unit === 'μg/m³'
          ? 'microgram_per_cubic_meter'
          : c.unit === 'ppb'
            ? 'parts_per_billion'
            : c.unit === 'ppm'
              ? 'parts_per_million'
              : null;

      return unit ? [{ name: p.code === 'pm2p5' ? 'pm25' : p.code, concentration: { value: c.value, unit } }] : [];
    }),
  };
}

export function minutely(v: Minutes): MinuteWeather[] {
  return v.minutely.map((p) => ({
    time: requiredTime(p.fxTime),
    intervalMinutes: 5,
    precipitationAmount: m(p.precip, 'millimeter'),
    precipitationIntensity: null,
    precipitationProbability: null,
    precipitationType: precipitationType(p.type),
  }));
}
