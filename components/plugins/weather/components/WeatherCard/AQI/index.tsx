'use client';

import { Frown, Meh, Smile } from 'lucide-react';
import { Loading } from '@/components/common/Loading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WeatherCardLayout } from '../../WeatherCardLayout';
import type { WeatherCardProps } from '..';
import { useWeatherData } from '../../../hooks/useWeatherData';
import { getTranslator } from '../../../i18n';
import { AQIGauge } from './Gauge';

const chinaLevels = [
  'cards.cnAqiGood',
  'cards.cnAqiModerate',
  'cards.cnAqiLight',
  'cards.cnAqiMedium',
  'cards.cnAqiHeavy',
  'cards.cnAqiSevere',
] as const;
const usLevels = [
  'aqiGood',
  'aqiModerate',
  'aqiSensitive',
  'aqiUnhealthy',
  'aqiVeryUnhealthy',
  'aqiHazardous',
] as const;

export default function AQICard({ city, locale }: WeatherCardProps) {
  const t = getTranslator(locale);
  const enabled = city.cards.some((card) => card.type === 'aqi' && card.status);
  const { airQuality, aqi } = useWeatherData(city, locale, enabled, 'aqi');
  const display = aqi.index ? new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(aqi.index.value) : '—';
  const scale = t('cards.aqiAbbreviation');
  const categoryKey =
    aqi.level === null ? undefined : (aqi.index?.scale === 'china' ? chinaLevels : usLevels)[aqi.level];
  const category = aqi.index?.category || (categoryKey ? t(categoryKey) : t('unavailable'));
  const StatusIcon = aqi.level === 0 ? Smile : aqi.level === 1 ? Meh : Frown;

  if (!enabled) {
    return null;
  }

  return (
    <WeatherCardLayout col={1} row={1}>
      <section aria-label={t('aqi')} className="relative flex min-h-0 flex-1 flex-col gap-2">
        <h2 className="shrink-0 text-left text-base font-semibold text-white">{t('aqi')}</h2>
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
          <>
            <AQIGauge progress={aqi.progress} display={display} scale={scale} label={`${scale} ${display} ${category}`}>
              <span
                className="inline-flex max-w-full items-center gap-1 rounded-full px-2 py-1 text-xs"
                title={category}
                style={{ color: aqi.color, backgroundColor: `color-mix(in srgb, ${aqi.color} 15%, transparent)` }}
              >
                {aqi.level !== null && <StatusIcon aria-hidden className="size-3.5 shrink-0" />}
                <span className="truncate">{category}</span>
              </span>
            </AQIGauge>
          </>
        )}
      </section>
    </WeatherCardLayout>
  );
}
