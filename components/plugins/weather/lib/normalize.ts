import type { Condition, Metadata, WeatherAlert, WeatherValues } from './models';

export function emptyValues(time: string | null): WeatherValues {
  return {
    time,
    condition: 'unknown',
    conditionText: null,
    isDay: null,
    temperature: null,
    apparentTemperature: null,
    humidity: null,
    dewPoint: null,
    pressure: null,
    pressureType: 'sea_level',
    visibility: null,
    cloudCover: null,
    windSpeed: null,
    windDirection: null,
    windGust: null,
    precipitationAmount: null,
    precipitationIntensity: null,
    precipitationProbability: null,
    precipitationType: 'unknown',
    uvIndex: null,
    uvDescription: null,
  };
}

export function metadata(attributions: string[] = [], summary: string | null = null): Metadata {
  return { attributions, summary };
}

export function severity(value: string | null): WeatherAlert['severity'] {
  switch (value?.toLowerCase()) {
    case 'minor':
      return 'minor';
    case 'moderate':
      return 'moderate';
    case 'severe':
      return 'severe';
    case 'extreme':
      return 'extreme';
    default:
      return 'unknown';
  }
}

export function precipitationType(value: string | null): WeatherValues['precipitationType'] {
  switch (value?.toLowerCase()) {
    case 'rain':
      return 'rain';
    case 'snow':
      return 'snow';
    case 'sleet':
      return 'sleet';
    case 'mixed':
      return 'mixed';
    case 'clear':
    case 'none':
      return 'none';
    default:
      return 'unknown';
  }
}

export function namedCondition(value: string | null): Condition {
  const code = value ?? '';

  if (/thunder/i.test(code)) {
    return 'thunderstorm';
  }

  if (/hurricane|tornado|wind/i.test(code)) {
    return 'wind';
  }

  if (/heavyrain|heavy_rain|storm_rain/i.test(code)) {
    return 'heavy_rain';
  }

  if (/drizzle/i.test(code)) {
    return 'drizzle';
  }

  if (/rain|shower/i.test(code)) {
    return 'rain';
  }

  if (/heavysnow|heavy_snow|blizzard/i.test(code)) {
    return 'heavy_snow';
  }

  if (/snow|sleet|flurr/i.test(code)) {
    return 'snow';
  }

  if (/fog/i.test(code)) {
    return 'fog';
  }

  if (/haze|dust|smoke/i.test(code)) {
    return 'haze';
  }

  if (/partly|mostlyclear|mostlysunny/i.test(code)) {
    return 'partly_cloudy';
  }

  if (/cloud|overcast/i.test(code)) {
    return 'cloudy';
  }

  if (/clear|sunny|hot/i.test(code)) {
    return 'clear';
  }

  return 'unknown';
}
