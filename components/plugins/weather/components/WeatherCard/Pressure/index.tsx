'use client';

import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Loading } from '@/components/common/Loading';
import type { WeatherCardProps } from '..';
import { useWeatherData } from '../../../hooks/useWeatherData';
import { getTranslator } from '../../../i18n';
import { PressureGauge } from './Gauge';

export default function PressureCard({ city, locale }: WeatherCardProps) {
  const t = getTranslator(locale);
  const enabled = city.cards.some((card) => card.type === 'pressure' && card.status);
  const { realtime, pressure } = useWeatherData(city, locale, enabled, 'pressure');
  const display =
    pressure.value === null ? '—' : new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(pressure.value);
  const unit = 'hPa';

  if (!enabled) {
    return null;
  }

  return (
    <LiquidGlass
      variant="glass"
      className="h-(--nv-plugin-weather-card-unit) w-full shrink-0 rounded-3xl"
      contentClassName="flex h-full flex-col p-4"
    >
      <section aria-label={t('pressure')} className="flex min-h-0 flex-1 flex-col">
        <h2 className="shrink-0 text-left text-base font-semibold text-white">{t('pressure')}</h2>
        {realtime.isLoading ? (
          <div role="status" aria-label={t('loading')} className="flex flex-1 items-center justify-center">
            <Loading />
          </div>
        ) : realtime.error ? (
          <p role="status" className="py-4 text-sm text-white/70">
            {realtime.error.message}
          </p>
        ) : (
          <PressureGauge
            progress={pressure.progress}
            display={display}
            unit={unit}
            label={`${t('pressure')} ${display}${pressure.value === null ? '' : ` ${unit}`}`}
          />
        )}
      </section>
    </LiquidGlass>
  );
}
