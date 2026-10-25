import type { ComponentType } from 'react';
import type { Locale } from '@/i18n/config';
import type { PluginWeatherCard, WeatherCityItem } from '../../types';
import type { messages } from '../../i18n';
import RealtimeCard from './Realtime';
import { HourlyForecastCard, HourlyTemperatureCard, HourlyRainyCard } from './Hourly';
import { DailyForecastCard, DailySunnyCard } from './Daily';
import UVCard from './UV';
import WindCard from './Wind';
import HumidityCard from './Humidity';
import FeelsLikeCard from './FeelsLike';
import AQICard from './AQI';
import PressureCard from './Pressure';
import VisibilityCard from './Visibility';
import PollutantsCard from './Pollutants';

export type WeatherCardProps = { city: WeatherCityItem; locale: Locale };

export type WeatherCardDefinition = PluginWeatherCard & {
  name: `card.${keyof (typeof messages)['zh-CN']['card']}`;
  component: ComponentType<WeatherCardProps>;
};

export const weatherCards: WeatherCardDefinition[] = [
  { type: 'realtime', name: 'card.realtime', status: true, component: RealtimeCard },
  { type: 'hourly', name: 'card.hourly', status: true, component: HourlyForecastCard },
  {
    type: 'daily',
    name: 'card.daily',
    status: true,
    component: DailyForecastCard,
  },
  {
    type: 'hourly_temperature',
    name: 'card.hourly_temperature',
    status: true,
    component: HourlyTemperatureCard,
  },
  { type: 'rain', name: 'card.hourly_details', status: true, component: HourlyRainyCard },
  { type: 'uv', name: 'card.uv', status: true, component: UVCard },
  { type: 'wind', name: 'card.wind', status: true, component: WindCard },
  { type: 'humidity', name: 'card.humidity', status: true, component: HumidityCard },
  {
    type: 'feels_like',
    name: 'card.feels_like',
    status: true,
    component: FeelsLikeCard,
  },
  { type: 'sun', name: 'card.sun', status: true, component: DailySunnyCard },
  { type: 'aqi', name: 'card.aqi', status: true, component: AQICard },
  { type: 'pollutants', name: 'card.pollutants', status: true, component: PollutantsCard },
  { type: 'pressure', name: 'card.pressure', status: true, component: PressureCard },
  { type: 'visibility', name: 'card.visibility', status: true, component: VisibilityCard },
];
