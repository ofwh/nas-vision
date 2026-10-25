'use client';

import { Loading } from '@/components/common/Loading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WeatherCardLayout } from '../../WeatherCardLayout';
import type { WeatherCardProps } from '..';
import { useWeatherData } from '../../../hooks/useWeatherData';
import { getTranslator } from '../../../i18n';
import { FeelsLikeGauge } from './Gauge';

export default function FeelsLikeCard({ city, locale }: WeatherCardProps) {
  const t = getTranslator(locale);
  const enabled = city.cards.some((card) => card.type === 'feels_like' && card.status);
  const { realtime, feelsLike } = useWeatherData(city, locale, enabled, 'feels_like');
  const display = feelsLike.temperature
    ? `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(feelsLike.temperature.value)}°`
    : '—';
  const unit = feelsLike.temperature?.unit === 'fahrenheit' ? 'F' : 'C';

  if (!enabled) {
    return null;
  }

  return (
    <WeatherCardLayout col={1} row={1}>
      <section aria-label={t('feelsLike')} className="flex min-h-0 flex-1 flex-col">
        <h2 className="shrink-0 text-left text-base font-semibold text-white">{t('feelsLike')}</h2>
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
          <FeelsLikeGauge
            progress={feelsLike.progress}
            display={display}
            label={`${t('feelsLike')} ${display}${feelsLike.temperature ? unit : ''}`}
          />
        )}
      </section>
    </WeatherCardLayout>
  );
}
