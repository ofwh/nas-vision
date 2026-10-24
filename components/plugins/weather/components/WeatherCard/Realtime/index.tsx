'use client';

import { TriangleAlert } from 'lucide-react';
import { Loading } from '@/components/common/Loading';
import type { WeatherCardProps } from '..';
import { getTranslator } from '../../../i18n';
import { useWeatherData } from '../../../hooks/useWeatherData';
import { WeatherAnimation } from '../WeatherAnimation';

function temperature(value: number | null | undefined, locale: string) {
  return value == null ? '—' : new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

export default function RealtimeCard({ city, locale }: WeatherCardProps) {
  const t = getTranslator(locale);
  const enabled = city.cards.some((card) => card.type === 'realtime' && card.status);
  const { realtime, daily, alerts } = useWeatherData(city, locale, enabled);

  if (!enabled) {
    return null;
  }

  if (realtime.isLoading) {
    return (
      <div
        className="flex h-(--nv-plugin-weather-card-unit) w-full items-center justify-center"
        role="status"
        aria-label={t('loading')}
      >
        <Loading />
      </div>
    );
  }

  const current = realtime.data;

  if (!current || realtime.error) {
    return (
      <p
        role="status"
        className="flex h-(--nv-plugin-weather-card-unit) w-full items-center py-4 text-sm text-white/70"
      >
        {city.name && `${city.name} · `}
        {realtime.error?.message ?? t('empty')}
      </p>
    );
  }

  const today = daily.data?.items[0];
  const description = current.conditionText || t(`condition.${current.condition}`);
  const unit = current.temperature?.unit === 'fahrenheit' ? '°F' : '°C';
  const warnings = alerts.data?.items ?? [];

  return (
    <section
      aria-label={t('cards.realtime')}
      className="@container flex w-full min-w-0 flex-col gap-2 bg-transparent px-8 text-white"
      style={{
        height:
          warnings.length > 0
            ? 'calc(var(--nv-plugin-weather-card-unit) * 2 + var(--nv-plugin-weather-card-gap))'
            : 'var(--nv-plugin-weather-card-unit)',
      }}
    >
      <div className="flex min-h-0 w-full flex-1 items-stretch justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2 self-stretch">
          {city.name && (
            <div className="flex w-full min-w-0 flex-1 items-end">
              <h2 className="w-full truncate text-left text-base">{city.name}</h2>
            </div>
          )}
          <div className="flex min-h-[72px] items-end text-[72px] leading-none font-bold tabular-nums">
            <span className="inline-flex items-start">
              {temperature(current.temperature?.value, locale)}
              <sup className="relative top-0 pt-1 text-2xl leading-none">{unit}</sup>
            </span>
          </div>
          <div className="mb-10 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80">
            <span>{description}</span>
            <span>
              {temperature(today?.low?.value, locale)}°/{temperature(today?.high?.value, locale)}°
            </span>
          </div>
        </div>
        <div className="size-56 shrink-0 self-center @max-sm:size-40">
          <WeatherAnimation condition={current.condition} isDay={current.isDay} label={description} />
        </div>
      </div>
      {warnings.length > 0 && (
        <ul aria-label={t('alerts')} className="flex w-full flex-col gap-2">
          {warnings.map((alert) => (
            <li key={alert.id} className="flex items-start gap-2 text-sm text-amber-200">
              <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>{alert.title}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
