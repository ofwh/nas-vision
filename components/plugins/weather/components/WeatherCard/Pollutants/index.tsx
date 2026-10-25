'use client';

import { Loading } from '@/components/common/Loading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WeatherCardLayout } from '../../WeatherCardLayout';
import type { WeatherCardProps } from '..';
import { useWeatherData } from '../../../hooks/useWeatherData';
import { getTranslator } from '../../../i18n';
import { resolvePm25 } from '../../../utils/airQuality';
import { PM25Gauge } from './Gauge';

export default function PollutantsCard({ city, locale }: WeatherCardProps) {
  const t = getTranslator(locale);
  const enabled = city.cards.some((card) => card.type === 'pollutants' && card.status);
  const { airQuality } = useWeatherData(city, locale, enabled, 'pollutants');
  const pm25 = resolvePm25(airQuality.data?.pollutants ?? []);
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const display = pm25.value === null ? '—' : formatter.format(pm25.value);

  if (!enabled) {
    return null;
  }

  return (
    <WeatherCardLayout col={1} row={1}>
      <section aria-label={t('card.pollutants')} className="flex min-h-0 flex-1 flex-col gap-2">
        <h2 className="shrink-0 text-left text-base font-semibold text-white">{t('card.pollutants')}</h2>
        {airQuality.isLoading ? (
          <div role="status" aria-label={t('loading')} className="flex min-h-0 flex-1 items-center justify-center">
            <Loading />
          </div>
        ) : airQuality.error ? (
          <ScrollArea className="min-h-0 flex-1 [&>[data-slot=scroll-area-scrollbar]]:hidden">
            <p role="status" className="py-2 text-sm text-white/70">
              {airQuality.error.message}
            </p>
          </ScrollArea>
        ) : (
          <PM25Gauge level={pm25.level} progress={pm25.progress} display={display} locale={locale} />
        )}
      </section>
    </WeatherCardLayout>
  );
}
