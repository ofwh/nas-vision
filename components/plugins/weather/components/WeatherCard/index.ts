import type { ComponentType } from 'react';
import type { Locale } from '@/i18n/config';
import type { PluginWeatherCard, WeatherCityItem } from '../../types';
import RealtimeCard from './Realtime';
import HourlyCard from './Hourly';
import DailyCard from './Daily';
import HourlyTemperatureCard from './HourlyTemperature';
import UVCard from './UV';
import WindCard from './Wind';
import HumidityCard from './Humidity';
import FeelsLikeCard from './FeelsLike';
import SunCard from './Sun';
import AQICard from './AQI';
import PressureCard from './Pressure';

export type WeatherCardProps = { city: WeatherCityItem; locale: Locale };

export type WeatherCardDefinition = PluginWeatherCard & {
  name: { 'zh-CN': string; en: string };
  component: ComponentType<WeatherCardProps>;
  columns?: 1 | 2 | 4;
  rows?: 1 | 2 | 3;
};

export const weatherCards: WeatherCardDefinition[] = [
  { type: 'realtime', status: true, name: { 'zh-CN': '实时天气', en: 'Current weather' }, component: RealtimeCard },
  { type: 'hourly', status: true, name: { 'zh-CN': '分时预报', en: 'Hourly forecast' }, component: HourlyCard },
  {
    type: 'daily',
    status: true,
    name: { 'zh-CN': '分天预报', en: 'Daily forecast' },
    component: DailyCard,
    columns: 2,
    rows: 2,
  },
  {
    type: 'hourly_temperature',
    status: true,
    name: { 'zh-CN': '分时温度', en: 'Hourly temperature' },
    component: HourlyTemperatureCard,
    columns: 2,
  },
  { type: 'uv', status: true, name: { 'zh-CN': '紫外线指数', en: 'UV Index' }, component: UVCard, columns: 1 },
  { type: 'wind', status: true, name: { 'zh-CN': '风向', en: 'Wind' }, component: WindCard, columns: 1 },
  { type: 'humidity', status: true, name: { 'zh-CN': '湿度', en: 'Humidity' }, component: HumidityCard, columns: 1 },
  {
    type: 'feels_like',
    status: true,
    name: { 'zh-CN': '体感温度', en: 'Feels like' },
    component: FeelsLikeCard,
    columns: 1,
  },
  { type: 'sun', status: true, name: { 'zh-CN': '日出日落', en: 'Sunrise & sunset' }, component: SunCard, columns: 2 },
  { type: 'aqi', status: true, name: { 'zh-CN': '空气质量', en: 'Air quality' }, component: AQICard, columns: 1 },
  { type: 'pressure', status: true, name: { 'zh-CN': '气压', en: 'Pressure' }, component: PressureCard, columns: 1 },
];
