'use client';

import { Scatter, ScatterChart, XAxis, YAxis } from 'recharts';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Loading } from '@/components/common/Loading';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { WeatherCardProps } from '..';
import { useWeatherData } from '../../../hooks/useWeatherData';
import { getTranslator } from '../../../i18n';
import { RainDrop } from './Drop';

export default function RainCard({ city, locale }: WeatherCardProps) {
  const t = getTranslator(locale);
  const enabled = city.cards.some((card) => card.type === 'rain' && card.status);
  const { hourly, rainPoints } = useWeatherData(city, locale, enabled, 'rain');
  const points = rainPoints.filter((point) => point.probability !== null);
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const config = { probability: { label: t('cards.rainProbability'), color: '#06b6d4' } } satisfies ChartConfig;

  if (!enabled) {
    return null;
  }

  return (
    <LiquidGlass
      variant="glass"
      className="h-(--nv-plugin-weather-card-unit) w-full shrink-0 rounded-3xl"
      contentClassName="flex h-full flex-col gap-2 p-4"
    >
      <h2 className="text-left text-base font-semibold text-white">{t('cards.rainChance')}</h2>
      <section aria-label={t('cards.rainProbability')} className="flex min-h-0 flex-1 flex-col">
        {hourly.isLoading ? (
          <div role="status" aria-label={t('loading')} className="flex min-h-0 flex-1 items-center justify-center">
            <Loading />
          </div>
        ) : hourly.error || points.length === 0 ? (
          <p role="status" className="py-4 text-sm text-white/70">
            {hourly.error?.message ?? t('empty')}
          </p>
        ) : (
          <ChartContainer config={config} className="aspect-auto min-h-0 w-full flex-1">
            <ScatterChart accessibilityLayer margin={{ top: 28, right: 16, bottom: 8, left: 16 }}>
              <XAxis
                dataKey="time"
                type="number"
                scale="time"
                domain={[rainPoints[0].time, rainPoints[rainPoints.length - 1].time]}
                ticks={rainPoints.map((point) => point.time)}
                interval={0}
                tickLine={false}
                axisLine={false}
                tickMargin={14}
                tickFormatter={(value: number) => String(new Date(value).getHours())}
              />
              <YAxis dataKey="probability" type="number" domain={[0, 100]} hide />
              <ChartTooltip
                cursor={false}
                content={({ active, payload }) => (
                  <ChartTooltipContent
                    active={active}
                    payload={payload.filter((item) => item.dataKey === 'probability')}
                    labelFormatter={(_label, payload) => {
                      const timestamp: unknown = payload[0]?.payload?.time;

                      return typeof timestamp === 'number'
                        ? t('cards.tooltipHour', { hour: new Date(timestamp).getHours() })
                        : '';
                    }}
                    formatter={(value) => (
                      <span className="font-medium tabular-nums">
                        {typeof value === 'number' ? `${number.format(value)}%` : '—'}
                      </span>
                    )}
                  />
                )}
              />
              <Scatter
                data={points}
                shape={(point: unknown) => <RainDrop point={point} locale={locale} />}
                isAnimationActive={false}
              />
            </ScatterChart>
          </ChartContainer>
        )}
      </section>
    </LiquidGlass>
  );
}
