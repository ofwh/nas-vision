'use client';

import { Loading } from '@/components/common/Loading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WeatherCardLayout } from '../../WeatherCardLayout';
import type { WeatherCardProps } from '..';
import { useWeatherData } from '../../../hooks/useWeatherData';
import { getTranslator } from '../../../i18n';
import { SunnyArc } from './SunnyArc';

export default function DailySunnyCard({ city, locale }: WeatherCardProps) {
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
    <WeatherCardLayout col={2} row={1}>
      <section aria-label={t('sun')} className="relative flex min-h-0 flex-1 flex-col">
        <h2 className="relative z-10 shrink-0 text-left text-base font-semibold text-white">{t('sun')}</h2>
        {daily.isLoading ? (
          <div role="status" aria-label={t('loading')} className="flex min-h-0 flex-1 items-center justify-center">
            <Loading />
          </div>
        ) : daily.error ? (
          <ScrollArea className="min-h-0 flex-1 [&>[data-slot=scroll-area-scrollbar]]:hidden">
            <p role="status" className="py-2 text-sm text-white/70">
              {daily.error.message}
            </p>
          </ScrollArea>
        ) : (
          <div className="relative min-h-0 flex-1">
            <dl className="relative z-10 mt-2 flex justify-between gap-4 text-white">
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
            <SunnyArc progress={sun.progress} />
          </div>
        )}
      </section>
    </WeatherCardLayout>
  );
}
