'use client';

import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Loading } from '@/components/common/Loading';
import type { WeatherCardProps } from '..';
import { useWeatherData } from '../../../hooks/useWeatherData';
import { getTranslator } from '../../../i18n';
import { HumidityGauge } from './Gauge';

export default function HumidityCard({ city, locale }: WeatherCardProps) {
  const t = getTranslator(locale);
  const enabled = city.cards.some((card) => card.type === 'humidity' && card.status);
  const { realtime, humidity } = useWeatherData(city, locale, enabled, 'humidity');
  const display =
    humidity === null ? '—' : new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(humidity);

  if (!enabled) {
    return null;
  }

  return (
    <LiquidGlass
      variant="glass"
      className="h-(--nv-plugin-weather-card-unit) w-full shrink-0 rounded-3xl"
      contentClassName="flex h-full flex-col p-4"
    >
      <section aria-label={t('humidity')} className="flex min-h-0 flex-1 flex-col">
        <h2 className="shrink-0 text-left text-base font-semibold text-white">{t('humidity')}</h2>
        {realtime.isLoading ? (
          <div role="status" aria-label={t('loading')} className="flex flex-1 items-center justify-center">
            <Loading />
          </div>
        ) : realtime.error ? (
          <p role="status" className="py-4 text-sm text-white/70">
            {realtime.error.message}
          </p>
        ) : (
          <HumidityGauge
            value={humidity}
            display={display}
            label={`${t('humidity')} ${display}${humidity === null ? '' : '%'}`}
          />
        )}
      </section>
    </LiquidGlass>
  );
}
