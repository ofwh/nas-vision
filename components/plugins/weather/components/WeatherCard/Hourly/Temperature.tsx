'use client';

import { useId } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { Loading } from '@/components/common/Loading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { WeatherCardLayout } from '../../WeatherCardLayout';
import type { WeatherCardProps } from '..';
import { useWeatherData } from '../../../hooks/useWeatherData';
import { getTranslator } from '../../../i18n';

export default function HourlyTemperatureCard({ city, locale }: WeatherCardProps) {
  const gradientId = `temperature-gradient-${useId().replace(/:/g, '')}`;
  const t = getTranslator(locale);
  const enabled = city.cards.some((card) => card.type === 'hourly_temperature' && card.status);
  const { hourly, temperaturePoints, temperatureAxis, temperatureTimeTicks } = useWeatherData(
    city,
    locale,
    enabled,
    'temperature',
  );
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const config = { temperature: { label: t('cards.temperature'), color: '#fbbf24' } } satisfies ChartConfig;
  const validPoints = temperaturePoints.filter((point) => point.temperature !== null);
  const varyingTemperature = validPoints.some((point) => point.temperature !== validPoints[0]?.temperature);
  const unit = validPoints[0]?.unit === 'fahrenheit' ? '°F' : '°C';

  if (!enabled) {
    return null;
  }

  return (
    <WeatherCardLayout col={2} row={1} contentClassName="gap-2">
      <h2 className="shrink-0 text-left text-base font-semibold text-white">{t('cards.hourlyTemperature')}</h2>
      <section aria-label={t('cards.hourlyTemperature')} className="flex min-h-0 flex-1 flex-col">
        {hourly.isLoading ? (
          <div role="status" aria-label={t('loading')} className="flex min-h-0 flex-1 items-center justify-center">
            <Loading />
          </div>
        ) : hourly.error || validPoints.length === 0 ? (
          <ScrollArea className="min-h-0 flex-1 [&>[data-slot=scroll-area-scrollbar]]:hidden">
            <p role="status" className="py-2 text-sm text-white/70">
              {hourly.error?.message ?? t('empty')}
            </p>
          </ScrollArea>
        ) : (
          <ChartContainer config={config} className="aspect-auto h-0 min-h-0 w-full flex-1">
            <LineChart accessibilityLayer data={temperaturePoints} margin={{ top: 16, right: 12, bottom: 4, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-orange-400)" />
                  <stop offset="50%" stopColor="var(--color-amber-200)" />
                  <stop offset="100%" stopColor="var(--color-sky-300)" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickLine={false}
                axisLine={false}
                ticks={temperatureTimeTicks}
                interval={0}
                tickMargin={12}
                tickFormatter={(value: number) => String(new Date(value).getHours())}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={36}
                ticks={temperatureAxis.ticks}
                interval={0}
                allowDecimals={false}
                domain={temperatureAxis.domain}
                tickFormatter={(value: number) => `${number.format(value)}°`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_label, payload) => {
                      const timestamp: unknown = payload[0]?.payload?.time;

                      return typeof timestamp === 'number'
                        ? t('cards.tooltipHour', { hour: new Date(timestamp).getHours() })
                        : '';
                    }}
                    formatter={(value) => (
                      <span className="font-medium tabular-nums">
                        {typeof value === 'number' ? `${number.format(value)}${unit}` : '—'}
                      </span>
                    )}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke={varyingTemperature ? `url(#${gradientId})` : 'var(--color-amber-200)'}
                strokeWidth={3}
                dot={validPoints.length === 1}
                activeDot={{ r: 4 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </section>
    </WeatherCardLayout>
  );
}
