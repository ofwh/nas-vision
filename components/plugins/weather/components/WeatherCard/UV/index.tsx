'use client';

import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Loading } from '@/components/common/Loading';
import type { WeatherCardProps } from '..';
import { useWeatherData } from '../../../hooks/useWeatherData';
import { getTranslator } from '../../../i18n';
import { UVGauge } from './Gauge';

const previewUVIndex: number | null = 12;

export default function UVCard({ city, locale }: WeatherCardProps) {
  const t = getTranslator(locale);
  const enabled = city.cards.some((card) => card.type === 'uv' && card.status);
  const { realtime, uvIndex: actualUVIndex } = useWeatherData(city, locale, enabled && previewUVIndex === null, 'uv');
  const uvIndex = previewUVIndex ?? actualUVIndex;
  const value = uvIndex === null ? '—' : new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(uvIndex);

  if (!enabled) {
    return null;
  }

  return (
    <LiquidGlass
      variant="glass"
      className="h-(--nv-plugin-weather-card-unit) w-full shrink-0 rounded-3xl"
      contentClassName="flex h-full flex-col gap-2 p-4"
    >
      <section aria-label={t('uv')} className="flex min-h-0 flex-1 flex-col gap-2">
        <h2 className="shrink-0 text-left text-base font-semibold text-white">{t('uv')}</h2>
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
            <UVGauge value={uvIndex} />
            <p
              className="flex shrink-0 items-baseline justify-center gap-2 text-white"
              aria-label={`${t('uv')} ${value}`}
            >
              <span className="text-4xl leading-none tabular-nums">{value}</span>
              <span className="text-sm text-white/60">UV</span>
            </p>
          </>
        )}
      </section>
    </LiquidGlass>
  );
}
