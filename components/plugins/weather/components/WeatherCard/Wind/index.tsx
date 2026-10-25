'use client';

import { Loading } from '@/components/common/Loading';
import { MarqueeText } from '@/components/common/MarqueeText';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WeatherCardLayout } from '../../WeatherCardLayout';
import type { WeatherCardProps } from '..';
import { useWeatherData } from '../../../hooks/useWeatherData';
import { getTranslator } from '../../../i18n';
import { Compass } from './Compass';

const speedUnits = { meter_per_second: 'm/s', kilometer_per_hour: 'km/h', mile_per_hour: 'mph' };
const directions = [
  'n',
  'nne',
  'ne',
  'ene',
  'e',
  'ese',
  'se',
  'sse',
  's',
  'ssw',
  'sw',
  'wsw',
  'w',
  'wnw',
  'nw',
  'nnw',
] as const;

export default function WindCard({ city, locale }: WeatherCardProps) {
  const t = getTranslator(locale);
  const enabled = city.cards.some((card) => card.type === 'wind' && card.status);
  const { realtime, wind } = useWeatherData(city, locale, enabled, 'wind');
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const directionLabel =
    wind.level === 0
      ? t('windDirections.calm')
      : wind.direction === null
        ? t('unavailable')
        : t(`windDirections.${directions[Math.round(wind.direction / 22.5) % directions.length]}`);

  if (!enabled) {
    return null;
  }

  return (
    <WeatherCardLayout col={1} row={1} contentClassName="gap-2">
      <section aria-label={t('cards.windDirection')} className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-w-0 shrink-0 items-baseline justify-between gap-2">
          <h2 className="shrink-0 text-left text-base font-semibold text-white">{t('cards.windDirection')}</h2>
          {!realtime.isLoading && !realtime.error && (
            <MarqueeText
              text={directionLabel}
              className="max-w-[55%] text-right text-sm leading-none text-white tabular-nums"
            />
          )}
        </div>
        {realtime.isLoading ? (
          <div role="status" aria-label={t('loading')} className="flex min-h-0 flex-1 items-center justify-center">
            <Loading />
          </div>
        ) : realtime.error ? (
          <ScrollArea className="min-h-0 flex-1 [&>[data-slot=scroll-area-scrollbar]]:hidden">
            <p role="status" className="py-2 text-sm text-white/70">
              {realtime.error.message}
            </p>
          </ScrollArea>
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
    </WeatherCardLayout>
  );
}
