import { array, object, optional, string, number, text, num, texts, numericString } from '../../decode';

export const quantity = optional(object({ value: number, unit: string }));
const condition = optional(object({ code: text, text }));
const wind = optional(object({ speed: quantity, direction: optional(object({ degree: num, compass: text })) }));
const precipitation = optional(object({ amount: quantity, intensity: quantity, probability: num, type: text }));
export const meta = optional(object({ attributions: texts }));
export const values = object({
  forecastTime: text,
  condition,
  temperature: quantity,
  feelsLike: quantity,
  humidity: num,
  dewPoint: quantity,
  pressure: quantity,
  visibility: quantity,
  cloudCover: num,
  wind,
  windGust: quantity,
  precipitation,
  uvIndex: num,
  metadata: meta,
});
export const hours = object({ hours: array(values), metadata: meta });
export const day = object({
  forecastStartTime: string,
  temperatureMin: quantity,
  temperatureMax: quantity,
  uvIndexMax: num,
  astro: optional(object({ sunrise: text, sunset: text, moonrise: text, moonset: text, moonPhase: text })),
  daytime: optional(object({ condition, precipitation })),
});
export const days = object({ days: array(day), metadata: meta });
export const alert = object({
  id: string,
  headline: string,
  description: text,
  senderName: text,
  severity: text,
  color: optional(object({ code: text })),
  urgency: text,
  certainty: text,
  issuedTime: text,
  effectiveTime: text,
  onsetTime: text,
  expireTime: text,
  instruction: text,
  areaName: text,
  responseTypes: texts,
  messageType: optional(object({ code: text })),
});
export const alerts = object({ alerts: array(alert), metadata: meta });
export const air = object({
  indexes: array(object({ code: string, name: string, aqi: number, category: text, aqiDisplay: text })),
  pollutants: array(object({ code: string, concentration: quantity })),
  metadata: meta,
});
export const minutes = object({
  code: string,
  summary: text,
  minutely: array(object({ fxTime: string, precip: numericString, type: text })),
  refer: optional(object({ sources: texts })),
});
export type Values = ReturnType<typeof values>;
export type Day = ReturnType<typeof day>;
export type Alert = ReturnType<typeof alert>;
export type Air = ReturnType<typeof air>;
export type Minutes = ReturnType<typeof minutes>;
