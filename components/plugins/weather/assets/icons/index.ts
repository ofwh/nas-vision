import type { StaticImageData } from 'next/image';
import type { Condition } from '../../types';
import lightClear from './light/clear.svg';
import lightPartlyCloudy from './light/partly_cloudy.svg';
import lightCloudy from './light/cloudy.svg';
import lightFog from './light/fog.svg';
import lightDrizzle from './light/drizzle.svg';
import lightRain from './light/rain.svg';
import lightHeavyRain from './light/heavy_rain.svg';
import lightSnow from './light/snow.svg';
import lightHeavySnow from './light/heavy_snow.svg';
import lightThunderstorm from './light/thunderstorm.svg';
import lightHaze from './light/haze.svg';
import lightUnknown from './light/unknown.svg';
import darkCloudy from './dark/cloudy.svg';
import darkFog from './dark/fog.svg';
import darkDrizzle from './dark/drizzle.svg';
import darkHeavyRain from './dark/heavy_rain.svg';
import darkHeavySnow from './dark/heavy_snow.svg';
import darkThunderstorm from './dark/thunderstorm.svg';
import darkHaze from './dark/haze.svg';
import darkUnknown from './dark/unknown.svg';
import darkClearNight from './dark/clear-night.svg';
import darkPartlyCloudyNight from './dark/partly_cloudy-night.svg';
import darkRainNight from './dark/rain-night.svg';
import darkSnowNight from './dark/snow-night.svg';

type WeatherIcons = Partial<Record<Condition, StaticImageData>>;

const light: WeatherIcons = {
  clear: lightClear,
  partly_cloudy: lightPartlyCloudy,
  cloudy: lightCloudy,
  fog: lightFog,
  drizzle: lightDrizzle,
  rain: lightRain,
  heavy_rain: lightHeavyRain,
  snow: lightSnow,
  heavy_snow: lightHeavySnow,
  thunderstorm: lightThunderstorm,
  haze: lightHaze,
  unknown: lightUnknown,
};
const dark: WeatherIcons = {
  clear: darkClearNight,
  partly_cloudy: darkPartlyCloudyNight,
  cloudy: darkCloudy,
  fog: darkFog,
  drizzle: darkDrizzle,
  rain: darkRainNight,
  heavy_rain: darkHeavyRain,
  snow: darkSnowNight,
  heavy_snow: darkHeavySnow,
  thunderstorm: darkThunderstorm,
  haze: darkHaze,
  unknown: darkUnknown,
};

export function getWeatherIcon(condition: Condition, darkMode: boolean): StaticImageData | undefined {
  return (darkMode ? dark : light)[condition];
}
