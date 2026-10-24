'use client';

import useSWR from 'swr';
import type { BaseResponse } from '@/lib/api';
import { pluginRequest } from '@/lib/plugins/client';
import type { PluginQueryRes } from '@/types/plugins';
import { usePluginFetch } from '@/hooks/usePlugin';
import type { Locale } from '@/i18n/config';
import type {
  AirQualityWeather,
  Collection,
  DailyWeather,
  MinuteWeather,
  RealtimeWeather,
  WeatherAlert,
  WeatherValues,
} from '../lib';
import { convert } from '../lib/units';
import type { WeatherCityItem } from '../types';
import { resolveAqi } from '../utils/airQuality';
import { resolveMinuteRain } from '../utils/minuteRain';
import { useWeatherTime } from './useWeatherTime';

export function useWeatherData(
  city: WeatherCityItem,
  locale: Locale,
  enabled: boolean,
  mode:
    | 'realtime'
    | 'hourly'
    | 'daily'
    | 'temperature'
    | 'uv'
    | 'wind'
    | 'humidity'
    | 'pressure'
    | 'rainfall'
    | 'feels_like'
    | 'sun'
    | 'aqi'
    | 'rain'
    | 'minutely' = 'realtime',
  forecastDays = 7,
) {
  const config = useSWR<BaseResponse<PluginQueryRes>, Error>(
    enabled && mode === 'daily' ? ['/api/plugin/query', { id: 'weather' }] : null,
    ([url, params]: readonly [string, { id: string }]) => pluginRequest<PluginQueryRes>(url, params),
  );
  const now = useWeatherTime(enabled && mode === 'sun');
  const provider = config.data?.data.config.provider ?? 'qweather';
  const dayOptions = provider === 'caiyun' ? [7, 14] : [7, 10];
  const requestedDays = mode === 'daily' ? Math.min(forecastDays, dayOptions[1]) : 3;
  const params = { latitude: city.latitude, longitude: city.longitude, locationName: city.name, locale };
  const realtime = usePluginFetch<RealtimeWeather>(
    'weather',
    enabled && mode !== 'daily' && mode !== 'sun' && mode !== 'aqi' && mode !== 'rain' && mode !== 'minutely'
      ? '/api/realtime'
      : null,
    params,
  );
  const daily = usePluginFetch<Collection<DailyWeather>>(
    'weather',
    enabled && (mode === 'realtime' || mode === 'daily' || mode === 'sun') && (mode !== 'daily' || !!config.data)
      ? '/api/daily'
      : null,
    {
      ...params,
      days: requestedDays,
    },
  );
  const alerts = usePluginFetch<Collection<WeatherAlert>>(
    'weather',
    enabled && mode === 'realtime' ? '/api/alerts' : null,
    params,
  );

  const hourly = usePluginFetch<Collection<WeatherValues>>(
    'weather',
    enabled && (mode === 'hourly' || mode === 'temperature' || mode === 'rain') ? '/api/hourly' : null,
    {
      ...params,
      hours: 24,
    },
  );
  const airQuality = usePluginFetch<AirQualityWeather>(
    'weather',
    enabled && mode === 'aqi' ? '/api/airQuality' : null,
    params,
  );
  const aqi = resolveAqi(airQuality.data?.indexes ?? []);
  const minutely = usePluginFetch<Collection<MinuteWeather>>(
    'weather',
    enabled && mode === 'minutely' ? '/api/minutely' : null,
    { ...params, minutes: 120 },
  );
  const minuteRain = resolveMinuteRain(minutely.data?.items ?? []);
  const rainHours = [...(hourly.data?.items ?? [])]
    .filter((hour) => hour.time && Number.isFinite(Date.parse(hour.time)))
    .sort((a, b) => Date.parse(a.time ?? '') - Date.parse(b.time ?? ''))
    .slice(0, 24)
    .filter((_hour, index) => index % 2 === 0);
  const rainSeries = rainHours.map((hour) => {
    const value = hour.precipitationProbability?.value;

    return {
      time: Date.parse(hour.time ?? ''),
      probability: typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100 ? value : null,
    };
  });
  const rainValues = rainSeries.flatMap((hour) => (hour.probability === null ? [] : [hour.probability]));
  const rainMaximum = Math.max(...rainValues);
  const rainMinimum = Math.min(...rainValues);
  const rainPoints = rainSeries.map((hour, index) => ({
    ...hour,
    showLabel:
      index === 0 ||
      index === rainSeries.length - 1 ||
      index % 3 === 0 ||
      (rainMaximum > rainMinimum && (hour.probability === rainMaximum || hour.probability === rainMinimum)),
  }));

  const current = realtime.data;
  const currentTime = current?.time ? Date.parse(current.time) : NaN;
  const forecast = (hourly.data?.items ?? [])
    .filter((hour) => hour.time && Number.isFinite(Date.parse(hour.time)))
    .sort((a, b) => Date.parse(a.time ?? '') - Date.parse(b.time ?? ''))
    .filter((hour) => !Number.isFinite(currentTime) || Date.parse(hour.time ?? '') > currentTime);
  const hours = [
    ...(current ? [{ ...current, isCurrent: true }] : []),
    ...forecast.map((hour) => ({ ...hour, isCurrent: false })),
  ];

  const hourlyItems = hours.map((hour) => ({
    ...hour,
    hour: hour.time ? new Date(hour.time).getHours() : null,
  }));

  const temperaturePoints = hourlyItems.flatMap((hour) => {
    const time = hour.time ? Date.parse(hour.time) : NaN;

    return Number.isFinite(time)
      ? [
          {
            time,
            hour: hour.hour,
            isCurrent: hour.isCurrent,
            temperature: hour.temperature && Number.isFinite(hour.temperature.value) ? hour.temperature.value : null,
            unit: hour.temperature?.unit ?? null,
          },
        ]
      : [];
  });

  const hourlyTemperatures = temperaturePoints.flatMap((point) =>
    point.temperature === null ? [] : [point.temperature],
  );
  const temperatureStep = 2;
  const temperatureMinimum = hourlyTemperatures.length
    ? Math.floor(Math.min(...hourlyTemperatures) / temperatureStep) * temperatureStep
    : 0;
  const temperatureMaximum = hourlyTemperatures.length
    ? Math.ceil(Math.max(...hourlyTemperatures) / temperatureStep) * temperatureStep
    : temperatureStep;
  const temperatureUpperBound = Math.max(temperatureMinimum + temperatureStep, temperatureMaximum);
  const temperatureAxis = {
    domain: [temperatureMinimum, temperatureUpperBound] as [number, number],
    ticks: Array.from(
      { length: (temperatureUpperBound - temperatureMinimum) / temperatureStep + 1 },
      (_, index) => temperatureMinimum + index * temperatureStep,
    ),
  };
  const temperatureTimeTicks: number[] = [];
  const firstPoint = temperaturePoints[0];
  const lastPoint = temperaturePoints[temperaturePoints.length - 1];

  if (firstPoint && lastPoint) {
    const firstTick = new Date(firstPoint.time);

    firstTick.setMinutes(0, 0, 0);
    if (firstTick.getTime() < firstPoint.time) {
      firstTick.setHours(firstTick.getHours() + 1);
    }

    const hour = 60 * 60 * 1000;
    const step = 2;

    for (let tick = firstTick.getTime(); tick <= lastPoint.time; tick += step * hour) {
      temperatureTimeTicks.push(tick);
    }

    if (temperatureTimeTicks.length === 0) {
      temperatureTimeTicks.push(firstPoint.time);
    }
  }

  const days = [...(daily.data?.items ?? [])]
    .filter((day) => Number.isFinite(Date.parse(day.date)))
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
    .slice(0, requestedDays);
  const temperatures = days
    .flatMap((day) => [day.low?.value, day.high?.value])
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  const minimum = Math.min(...temperatures);
  const maximum = Math.max(...temperatures);
  const span = maximum - minimum;
  const dailyItems = days.map((day) => {
    const low = day.low?.value;
    const high = day.high?.value;
    const valid = low != null && high != null && Number.isFinite(low) && Number.isFinite(high) && high >= low;

    return {
      ...day,
      range: valid
        ? { left: span > 0 ? ((low - minimum) / span) * 100 : 0, width: span > 0 ? ((high - low) / span) * 100 : 100 }
        : null,
    };
  });

  const rawSpeed = realtime.data?.windSpeed;
  const windSpeed = rawSpeed && Number.isFinite(rawSpeed.value) && rawSpeed.value >= 0 ? rawSpeed : null;
  const metersPerSecond = convert(windSpeed, 'meter_per_second')?.value;
  const windThresholds = [0.3, 1.6, 3.4, 5.5, 8, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7];
  const windLevel =
    metersPerSecond === undefined ? null : windThresholds.findIndex((threshold) => metersPerSecond < threshold);
  const rawDirection = realtime.data?.windDirection?.value;
  const windDirection =
    typeof rawDirection === 'number' && Number.isFinite(rawDirection) ? ((rawDirection % 360) + 360) % 360 : null;

  const rawHumidity = realtime.data?.humidity?.value;
  const rawPressure = realtime.data?.pressure;
  const pressure = rawPressure && Number.isFinite(rawPressure.value) && rawPressure.value > 0 ? rawPressure : null;
  const hectopascals = convert(pressure, 'hectopascal')?.value;
  const pressureProgress = hectopascals === undefined ? null : Math.min(1, Math.max(0, (hectopascals - 950) / 100));
  const rawRainfall = realtime.data?.precipitationAmount;
  const rainfallAmount =
    rawRainfall && Number.isFinite(rawRainfall.value) && rawRainfall.value >= 0 ? rawRainfall : null;
  const rainfallMillimeters = convert(rainfallAmount, 'millimeter')?.value;
  const humidity =
    typeof rawHumidity === 'number' && Number.isFinite(rawHumidity) && rawHumidity >= 0 && rawHumidity <= 100
      ? rawHumidity
      : null;

  const rawApparentTemperature = realtime.data?.apparentTemperature;
  const apparentTemperature =
    rawApparentTemperature && Number.isFinite(rawApparentTemperature.value) ? rawApparentTemperature : null;
  const apparentCelsius = convert(apparentTemperature, 'celsius')?.value;
  const apparentProgress = apparentCelsius === undefined ? null : Math.min(1, Math.max(0, (apparentCelsius + 20) / 60));

  const solarDay =
    days.find((day) => {
      const sunrise = day.sunrise ? Date.parse(day.sunrise) : NaN;
      const sunset = day.sunset ? Date.parse(day.sunset) : NaN;

      return now !== null && sunrise <= now && sunset >= now;
    }) ?? days[0];
  const sunriseTime = solarDay?.sunrise ? Date.parse(solarDay.sunrise) : NaN;
  const sunsetTime = solarDay?.sunset ? Date.parse(solarDay.sunset) : NaN;
  const solarProgress =
    now !== null && Number.isFinite(sunriseTime) && Number.isFinite(sunsetTime) && sunsetTime > sunriseTime
      ? Math.min(1, Math.max(0, (now - sunriseTime) / (sunsetTime - sunriseTime)))
      : null;

  return {
    realtime,
    airQuality,
    rainPoints,
    minutely,
    minuteRain,
    aqi,
    sun: {
      sunrise: Number.isFinite(sunriseTime) ? sunriseTime : null,
      sunset: Number.isFinite(sunsetTime) ? sunsetTime : null,
      progress: solarProgress,
    },
    feelsLike: { temperature: apparentTemperature, progress: apparentProgress },
    humidity,
    pressure: { value: hectopascals ?? null, progress: pressureProgress },
    rainfall: {
      amount: rainfallAmount,
      progress: rainfallMillimeters === undefined ? null : Math.min(1, rainfallMillimeters / 50),
    },
    wind: { direction: windDirection, speed: windSpeed, level: windLevel === -1 ? 12 : windLevel },
    daily: {
      ...daily,
      isLoading: daily.isLoading || config.isLoading,
      error: config.error ?? daily.error,
    },
    alerts,
    hourly,
    hours: hourlyItems,
    uvIndex:
      typeof realtime.data?.uvIndex === 'number' && Number.isFinite(realtime.data.uvIndex) && realtime.data.uvIndex >= 0
        ? realtime.data.uvIndex
        : null,
    temperaturePoints,
    temperatureAxis,
    temperatureTimeTicks,
    days: dailyItems,
    dayOptions,
    requestedDays,
  };
}
