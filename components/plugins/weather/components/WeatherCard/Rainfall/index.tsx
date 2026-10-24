'use client';

import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Loading } from '@/components/common/Loading';
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
    <LiquidGlass
      variant="glass"
      className="h-(--nv-plugin-weather-card-unit) w-full shrink-0 rounded-3xl"
      contentClassName="flex h-full flex-col p-4"
    >
      <section aria-label={t('cards.rainfall')} className="flex min-h-0 flex-1 flex-col">
        <h2 className="shrink-0 text-left text-base font-semibold text-white">{t('cards.rainfall')}</h2>
        {realtime.isLoading ? (
          <div role="status" aria-label={t('loading')} className="flex flex-1 items-center justify-center">
            <Loading />
          </div>
        ) : realtime.error ? (
          <p role="status" className="py-4 text-sm text-white/70">
            {realtime.error.message}
          </p>
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
    </LiquidGlass>
  );
}
