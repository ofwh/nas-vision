import type { Condition } from '../../types';

const animations = {
  sunny: () => import('../../assets/lottie/Sunny.json'),
  night: () => import('../../assets/lottie/StarryNight.json'),
  partlyCloudy: () => import('../../assets/lottie/SunnyCloudy.json'),
  partlyCloudyNight: () => import('../../assets/lottie/CloudyNight.json'),
  cloudy: () => import('../../assets/lottie/Cloudy.json'),
  cloudyNight: () => import('../../assets/lottie/CloudyMidnight.json'),
  rain: () => import('../../assets/lottie/Rain.json'),
  rainNight: () => import('../../assets/lottie/RainyNight.json'),
  heavyRain: () => import('../../assets/lottie/RainCloudy.json'),
  snow: () => import('../../assets/lottie/Snowy.json'),
  storm: () => import('../../assets/lottie/CloudyStorm.json'),
  stormNight: () => import('../../assets/lottie/StormNight.json'),
  wind: () => import('../../assets/lottie/Windy.json'),
  unknown: () => import('../../assets/lottie/Temperature.json'),
};

type Animation = keyof typeof animations;

export function loadWeatherAnimation(condition: Condition, isDay: boolean | null) {
  const night = isDay === false;
  const mapping: Record<Condition, Animation> = {
    clear: night ? 'night' : 'sunny',
    partly_cloudy: night ? 'partlyCloudyNight' : 'partlyCloudy',
    cloudy: night ? 'cloudyNight' : 'cloudy',
    fog: night ? 'cloudyNight' : 'cloudy',
    haze: night ? 'cloudyNight' : 'cloudy',
    drizzle: night ? 'rainNight' : 'rain',
    rain: night ? 'rainNight' : 'rain',
    heavy_rain: night ? 'rainNight' : 'heavyRain',
    snow: 'snow',
    heavy_snow: 'snow',
    thunderstorm: night ? 'stormNight' : 'storm',
    wind: 'wind',
    unknown: 'unknown',
  };

  return animations[mapping[condition]]();
}
