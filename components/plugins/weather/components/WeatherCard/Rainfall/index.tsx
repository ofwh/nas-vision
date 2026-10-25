'use client';

import { Loading } from '@/components/common/Loading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WeatherCardLayout } from '../../WeatherCardLayout';
import type { WeatherCardProps } from '..';
import { useWeatherData } from '../../../hooks/useWeatherData';
import { getTranslator } from '../../../i18n';
import { RainfallGauge } from './Gauge';

export default function RainfallCard({ city, locale }: WeatherCardProps) {
  const t = getTranslator(locale);
  const enabled = city.cards.some((card) => card.type === 'rainfall' && card.status);
  const { realtime, rainfall } = useWeatherData(city, locale, enabled, 'rainfall');
  const display =
    rainfall.amount === null
      ? '—'
      : new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(rainfall.amount.value);
  const unit = rainfall.amount?.unit === 'inch' ? 'in' : 'mm';

  if (!enabled) {
    return null;
  }

  return (
    <WeatherCardLayout col={1} row={1}>
      <section aria-label={t('cards.rainfall')} className="flex min-h-0 flex-1 flex-col">
        <h2 className="shrink-0 text-left text-base font-semibold text-white">{t('cards.rainfall')}</h2>
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
            <RainfallGauge
              progress={rainfall.progress}
              display={display}
              unit={unit}
              label={`${t('amount')} ${display}${rainfall.amount === null ? '' : ` ${unit}`}`}
              scale={t('cards.rainfallScale')}
            />
            <p className="shrink-0 text-center text-xs text-white/60">
              {rainfall.amount === null ? t('unavailable') : t('amount')}
            </p>
          </>
        )}
      </section>
    </WeatherCardLayout>
  );
}
