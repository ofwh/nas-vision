import { array, object, optional, string, number, text, num } from '../../decode';

export const wind = optional(object({ speed: num, direction: num }));
export const air = optional(
  object({
    aqi: optional(object({ chn: num, usa: num })),
    pm25: num,
    pm10: num,
    o3: num,
    so2: num,
    no2: num,
    co: num,
    description: optional(object({ chn: text, usa: text })),
  }),
);
export const current = object({
  status: string,
  temperature: num,
  apparent_temperature: num,
  humidity: num,
  pressure: num,
  visibility: num,
  cloudrate: num,
  wind,
  skycon: text,
  precipitation: optional(object({ local: optional(object({ intensity: num })) })),
  air_quality: air,
  life_index: optional(object({ ultraviolet: optional(object({ index: num, desc: text })) })),
});
const series = optional(array(object({ datetime: string, value: num })));
export const hourly = object({
  status: string,
  description: text,
  temperature: array(object({ datetime: string, value: num })),
  apparent_temperature: series,
  humidity: series,
  pressure: series,
  visibility: series,
  cloudrate: series,
  skycon: optional(array(object({ datetime: string, value: text }))),
  wind: optional(array(object({ datetime: string, speed: num, direction: num }))),
  precipitation: optional(array(object({ datetime: string, value: num, probability: num }))),
});
export const daily = object({
  status: string,
  temperature: array(object({ date: string, min: num, max: num })),
  skycon: optional(array(object({ date: string, value: text }))),
  precipitation: optional(array(object({ date: string, probability: num }))),
  astro: optional(
    array(
      object({ date: string, sunrise: optional(object({ time: text })), sunset: optional(object({ time: text })) }),
    ),
  ),
});
export const minutes = object({ status: string, precipitation_2h: array(number), description: text });
export const alert = object({ alertId: text, title: string, description: text, source: text, pubtimestamp: num });
export const alerts = object({ status: string, content: array(alert) });
export type Current = ReturnType<typeof current>;
export type Hourly = ReturnType<typeof hourly>;
export type Daily = ReturnType<typeof daily>;
export type Minutes = ReturnType<typeof minutes>;
export type Alert = ReturnType<typeof alert>;
export type Air = NonNullable<ReturnType<typeof air>>;
