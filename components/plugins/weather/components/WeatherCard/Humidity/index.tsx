'use client';

import { Loading } from '@/components/common/Loading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WeatherCardLayout } from '../../WeatherCardLayout';
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
    <WeatherCardLayout col={1} row={1}>
      <section aria-label={t('humidity')} className="flex min-h-0 flex-1 flex-col">
        <h2 className="shrink-0 text-left text-base font-semibold text-white">{t('humidity')}</h2>
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
          <HumidityGauge
            value={humidity}
            display={display}
            label={`${t('humidity')} ${display}${humidity === null ? '' : '%'}`}
          />
        )}
      </section>
    </WeatherCardLayout>
  );
}
