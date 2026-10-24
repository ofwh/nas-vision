'use client';

import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Loading } from '@/components/common/Loading';
import type { WeatherCardProps } from '..';
import { useWeatherData } from '../../../hooks/useWeatherData';
import { getTranslator } from '../../../i18n';
import { Compass } from './Compass';

const speedUnits = { meter_per_second: 'm/s', kilometer_per_hour: 'km/h', mile_per_hour: 'mph' };

export default function WindCard({ city, locale }: WeatherCardProps) {
  const t = getTranslator(locale);
  const enabled = city.cards.some((card) => card.type === 'wind' && card.status);
  const { realtime, wind } = useWeatherData(city, locale, enabled, 'wind');
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });

  if (!enabled) {
    return null;
  }

  return (
    <LiquidGlass
      variant="glass"
      className="h-(--nv-plugin-weather-card-unit) w-full shrink-0 rounded-3xl"
      contentClassName="flex h-full flex-col gap-2 p-4"
    >
      <section aria-label={t('cards.windDirection')} className="flex min-h-0 flex-1 flex-col">
        <h2 className="shrink-0 text-left text-base font-semibold text-white">{t('cards.windDirection')}</h2>
        {realtime.isLoading ? (
          <div role="status" aria-label={t('loading')} className="flex flex-1 items-center justify-center">
            <Loading />
          </div>
        ) : realtime.error ? (
          <p role="status" className="py-4 text-sm text-white/70">
            {realtime.error.message}
          </p>
        ) : (
          <div className="relative flex min-h-0 flex-1">
            <Compass
              direction={wind.level === 0 ? null : wind.direction}
              label={
                wind.direction === null
                  ? t('unavailable')
                  : t('cards.windBearing', { degree: number.format(wind.direction) })
              }
              labels={{ north: t('north'), south: t('south'), east: t('east'), west: t('west') }}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 text-white">
              <p className="flex items-baseline gap-1 text-sm leading-none tabular-nums">
                <span>{wind.level === null ? '—' : number.format(wind.level)}</span>
                <span>{t('cards.windForceUnit')}</span>
              </p>
              <p className="flex flex-col items-end gap-0.5 text-right">
                {wind.speed && <span className="text-[10px] text-white/60">{speedUnits[wind.speed.unit]}</span>}
                <span className="text-sm leading-none tabular-nums">
                  {wind.speed ? number.format(wind.speed.value) : '—'}
                </span>
              </p>
            </div>
          </div>
        )}
      </section>
    </LiquidGlass>
  );
}
