'use client';

import { Loading } from '@/components/common/Loading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WeatherCardLayout } from '../../WeatherCardLayout';
import type { WeatherCardProps } from '..';
import { useWeatherData } from '../../../hooks/useWeatherData';
import { getTranslator } from '../../../i18n';
import { UVGauge } from './Gauge';

export default function UVCard({ city, locale }: WeatherCardProps) {
  const t = getTranslator(locale);
  const enabled = city.cards.some((card) => card.type === 'uv' && card.status);
  const { realtime, uvIndex } = useWeatherData(city, locale, enabled, 'uv');
  const value = uvIndex === null ? '—' : new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(uvIndex);

  if (!enabled) {
    return null;
  }

  return (
    <WeatherCardLayout col={1} row={1} contentClassName="gap-2">
      <section aria-label={t('uv')} className="flex min-h-0 flex-1 flex-col gap-2">
        <h2 className="shrink-0 text-left text-base font-semibold text-white">{t('uv')}</h2>
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
          <>
            <UVGauge value={uvIndex} />
            <p
              className="flex shrink-0 items-baseline justify-center gap-2 text-white"
              aria-label={`${t('uv')} ${value}`}
            >
              <span className="text-4xl leading-none tabular-nums">{value}</span>
              <span className="text-sm text-white/60">UV</span>
            </p>
          </>
        )}
      </section>
    </WeatherCardLayout>
  );
}
