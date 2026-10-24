'use client';

import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Loading } from '@/components/common/Loading';
import type { WeatherCardProps } from '..';
import { useWeatherData } from '../../../hooks/useWeatherData';
import { getTranslator } from '../../../i18n';
import { SunArc } from './Arc';

export default function SunCard({ city, locale }: WeatherCardProps) {
  const t = getTranslator(locale);
  const enabled = city.cards.some((card) => card.type === 'sun' && card.status);
  const { daily, sun } = useWeatherData(city, locale, enabled, 'sun');
  const time = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', hour12: true });
  const formatTime = (timestamp: number | null) => {
    if (timestamp === null) {
      return { value: '—', period: '' };
    }

    const parts = time.formatToParts(timestamp);

    return {
      value: `${parts.find((part) => part.type === 'hour')?.value}:${parts.find((part) => part.type === 'minute')?.value}`,
      period: parts.find((part) => part.type === 'dayPeriod')?.value ?? '',
    };
  };
  const sunrise = formatTime(sun.sunrise);
  const sunset = formatTime(sun.sunset);

  if (!enabled) {
    return null;
  }

  return (
    <LiquidGlass
      variant="glass"
      className="h-(--nv-plugin-weather-card-unit) w-full shrink-0 rounded-3xl"
      contentClassName="flex h-full flex-col p-4"
    >
      <section aria-label={t('sun')} className="relative flex min-h-0 flex-1 flex-col">
        <h2 className="relative z-10 shrink-0 text-left text-base font-semibold text-white">{t('sun')}</h2>
        {daily.isLoading ? (
          <div role="status" aria-label={t('loading')} className="flex flex-1 items-center justify-center">
            <Loading />
          </div>
        ) : daily.error ? (
          <p role="status" className="py-4 text-sm text-white/70">
            {daily.error.message}
          </p>
        ) : (
          <>
            <dl className="relative z-10 mt-4 flex shrink-0 justify-between gap-4 text-white">
              <div className="flex flex-col gap-2">
                <dt className="text-sm text-white/50">{t('sunrise')}</dt>
                <dd className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-2xl leading-none font-medium">{sunrise.value}</span>
                  <span className="text-xs text-white/50">{sunrise.period}</span>
                </dd>
              </div>
              <div className="flex flex-col items-end gap-2 text-right">
                <dt className="text-sm text-white/50">{t('sunset')}</dt>
                <dd className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-2xl leading-none font-medium">{sunset.value}</span>
                  <span className="text-xs text-white/50">{sunset.period}</span>
                </dd>
              </div>
            </dl>
            <SunArc progress={sun.progress} />
          </>
        )}
      </section>
    </LiquidGlass>
  );
}
