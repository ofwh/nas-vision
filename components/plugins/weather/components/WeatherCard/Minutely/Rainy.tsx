'use client';

import { useId } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Loading } from '@/components/common/Loading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { WeatherCardLayout } from '../../WeatherCardLayout';
import type { WeatherCardProps } from '..';
import { useWeatherData } from '../../../hooks/useWeatherData';
import { getTranslator } from '../../../i18n';

export default function MinutelyRainyCard({ city, locale }: WeatherCardProps) {
  const gradientId = `minute-rain-${useId().replace(/:/g, '')}`;
  const t = getTranslator(locale);
  const enabled = city.cards.some((card) => card.type === 'minute_rain' && card.status);
  const { minutely, minuteRain } = useWeatherData(city, locale, enabled, 'minutely');
  const { points, unit } = minuteRain;
  const hasData = points.some((point) => point.intensity !== null);
  const maximum = Math.max(0, ...points.map((point) => point.intensity ?? 0));
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const config = { intensity: { label: t('precipitation'), color: '#38bdf8' } } satisfies ChartConfig;

  if (!enabled) {
    return null;
  }

  return (
    <WeatherCardLayout col={2} row={1} contentClassName="gap-2">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <h2 className="shrink-0 text-left text-base font-semibold text-white">{t('cards.minuteRain')}</h2>
        <span className="text-xs text-white/60">{unit}</span>
      </div>
      <section aria-label={t('cards.minuteRain')} className="flex min-h-0 flex-1 flex-col gap-2">
        {minutely.isLoading ? (
          <div role="status" aria-label={t('loading')} className="flex min-h-0 flex-1 items-center justify-center">
            <Loading />
          </div>
        ) : minutely.error || !hasData ? (
          <ScrollArea className="min-h-0 flex-1 [&>[data-slot=scroll-area-scrollbar]]:hidden">
            <p role="status" className="py-2 text-sm text-white/70">
              {minutely.error?.message ?? t('empty')}
            </p>
          </ScrollArea>
        ) : (
          <>
            {minutely.data?.summary && (
              <ScrollArea className="h-8 min-h-0 shrink-0 [&>[data-slot=scroll-area-scrollbar]]:hidden">
                <p className="text-xs text-white/70">{minutely.data.summary}</p>
              </ScrollArea>
            )}
            <ChartContainer config={config} className="aspect-auto h-0 min-h-0 w-full flex-1">
              <BarChart accessibilityLayer data={points} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#0891b2" stopOpacity={0.35} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="minute"
                  type="number"
                  domain={[0, 120]}
                  ticks={[0, 30, 60, 90, 120]}
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tickFormatter={(value: number) =>
                    value === 0 ? t('cards.now') : t('cards.minuteOffset', { minutes: value })
                  }
                />
                <YAxis
                  width={32}
                  domain={[0, maximum > 0 ? 'auto' : unit === 'in/h' ? 0.04 : 1]}
                  tickCount={3}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => number.format(value)}
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_label, payload) => {
                        const timestamp: unknown = payload[0]?.payload?.time;

                        return typeof timestamp === 'number' ? time.format(timestamp) : '';
                      }}
                      formatter={(value) => (
                        <span className="font-medium tabular-nums">
                          {typeof value === 'number' ? `${number.format(value)} ${unit}` : '—'}
                        </span>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="intensity"
                  fill={`url(#${gradientId})`}
                  barSize={`${70 / points.length}%`}
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ChartContainer>
          </>
        )}
      </section>
    </WeatherCardLayout>
  );
}
