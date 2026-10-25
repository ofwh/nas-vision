'use client';

import { useId, useState, type ReactNode } from 'react';
import { CloudRain, Droplets, Umbrella } from 'lucide-react';
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { Bar, CartesianGrid, ComposedChart, Line, Rectangle, XAxis, YAxis, usePlotArea } from 'recharts';
import { Loading } from '@/components/common/Loading';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { WeatherCardLayout } from '../../WeatherCardLayout';
import type { WeatherCardProps } from '..';
import { useWeatherData } from '../../../hooks/useWeatherData';
import { getTranslator } from '../../../i18n';

type HourlyMetric = 'intensity' | 'probability' | 'humidity';
const metrics: HourlyMetric[] = ['intensity', 'probability', 'humidity'];
const metricIcons = { intensity: CloudRain, probability: Umbrella, humidity: Droplets };

type HourlyPoints = ReturnType<typeof useWeatherData>['hourlyMetrics'];
type MetricChartProps = { points: HourlyPoints; locale: WeatherCardProps['locale'] };
type ChartPoint = { time: number; value: number | null };

function HourlyChartFrame({
  points,
  locale,
  label,
  color,
  unit,
  maximum = 100,
  percentage = false,
  children,
}: {
  points: ChartPoint[];
  locale: WeatherCardProps['locale'];
  label: string;
  color: string;
  unit: string;
  maximum?: number;
  percentage?: boolean;
  children: ReactNode;
}) {
  const t = getTranslator(locale);
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: percentage ? 0 : 2 });
  const config = { value: { label, color } } satisfies ChartConfig;

  return (
    <ScrollArea
      data-weather-hourly-scroll
      className="[container-type:inline-size] h-0 min-h-0 w-full flex-1 [&>[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:hidden [&>[data-slot=scroll-area-viewport]]:overflow-y-hidden!"
    >
      <div className="h-full" style={{ width: `${Math.max(1, points.length / 15) * 100}cqw` }}>
        <ChartContainer config={config} className="aspect-auto h-full min-h-0 w-full">
          <ComposedChart
            accessibilityLayer
            data={points}
            margin={{ top: 12, right: 12, bottom: 4, left: percentage ? 0 : 12 }}
            barCategoryGap="35%"
          >
            {percentage && <CartesianGrid vertical={false} strokeDasharray="3 3" />}
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              ticks={points.filter((_point, index) => index % 3 === 0).map((point) => point.time)}
              tickMargin={12}
              minTickGap={12}
              tickFormatter={(value: number) => String(new Date(value).getHours())}
            />
            <YAxis
              hide={!percentage}
              domain={[0, maximum]}
              allowDataOverflow
              ticks={percentage ? [0, 50, 100] : undefined}
              tickLine={false}
              axisLine={false}
              width={42}
              tickCount={3}
              tickFormatter={(value: number) => `${number.format(value)}%`}
            />
            <ChartTooltip
              cursor={false}
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
                      {typeof value === 'number' ? `${number.format(value)}${percentage ? '' : ' '}${unit}` : '—'}
                    </span>
                  )}
                />
              }
            />
            {children}
          </ComposedChart>
        </ChartContainer>
      </div>
      <ScrollBar
        orientation="horizontal"
        className="pointer-events-none opacity-0 transition-opacity duration-150 data-hovering:pointer-events-auto data-hovering:opacity-100"
      />
    </ScrollArea>
  );
}

function RainIntensityChart({ points, locale }: MetricChartProps) {
  const gradientId = `hourly-intensity-${useId().replace(/:/g, '')}`;
  const t = getTranslator(locale);
  const values = points.map((point) => ({ ...point, value: point.intensity }));
  const inches = values.find((point) => point.value !== null)?.intensityUnit === 'inch_per_hour';
  const maximumMillimeters = Math.max(
    0,
    ...points.map((point) => (point.intensity ?? 0) * (point.intensityUnit === 'inch_per_hour' ? 25.4 : 1)),
  );
  const scale =
    [2.5, 8, 16, 50, 100].find((upperBound) => maximumMillimeters <= upperBound) ??
    Math.ceil(maximumMillimeters / 100) * 100;

  return (
    <HourlyChartFrame
      points={values}
      locale={locale}
      label={t('cards.rainIntensity')}
      color="#7dd3fc"
      unit={inches ? 'in' : 'mm'}
      maximum={inches ? scale / 25.4 : scale}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#638bff" />
          <stop offset="45%" stopColor="#c553ee" />
          <stop offset="100%" stopColor="#f45bc4" />
        </linearGradient>
      </defs>
      <Bar
        dataKey="value"
        fill={`url(#${gradientId})`}
        radius={999}
        shape={<Rectangle radius={999} />}
        barSize={7.5}
        background={{ fill: 'rgba(255,255,255,0.15)', radius: 999 }}
        isAnimationActive={false}
      />
    </HourlyChartFrame>
  );
}

function PercentageGradient({ id, colors }: { id: string; colors: readonly [string, string, string] }) {
  const plot = usePlotArea();

  if (!plot) {
    return null;
  }

  return (
    <defs>
      <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={plot.y + plot.height} x2="0" y2={plot.y}>
        <stop offset="0%" stopColor={colors[0]} />
        <stop offset="50%" stopColor={colors[1]} />
        <stop offset="100%" stopColor={colors[2]} />
      </linearGradient>
    </defs>
  );
}

function PercentageChart({
  points,
  locale,
  label,
  color,
  colors,
}: {
  points: ChartPoint[];
  locale: WeatherCardProps['locale'];
  label: string;
  color: string;
  colors: readonly [string, string, string];
}) {
  const gradientId = `hourly-percentage-${useId().replace(/:/g, '')}`;

  return (
    <HourlyChartFrame points={points} locale={locale} label={label} color={color} unit="%" percentage>
      <PercentageGradient id={gradientId} colors={colors} />
      <Line
        type="monotone"
        dataKey="value"
        stroke={`url(#${gradientId})`}
        strokeWidth={3}
        dot={points.filter((point) => point.value !== null).length === 1}
        activeDot={{ r: 4 }}
        connectNulls={false}
        isAnimationActive={false}
      />
    </HourlyChartFrame>
  );
}

function RainProbabilityChart({ points, locale }: MetricChartProps) {
  const t = getTranslator(locale);

  return (
    <PercentageChart
      points={points.map((point) => ({ time: point.time, value: point.probability }))}
      locale={locale}
      label={t('cards.rainChance')}
      color="#38bdf8"
      colors={['var(--color-gray-300)', 'var(--color-sky-300)', 'var(--color-sky-500)']}
    />
  );
}

function HumidityChart({ points, locale }: MetricChartProps) {
  const t = getTranslator(locale);

  return (
    <PercentageChart
      points={points.map((point) => ({ time: point.time, value: point.humidity }))}
      locale={locale}
      label={t('humidity')}
      color="#67e8f9"
      colors={['var(--color-sky-300)', 'var(--color-amber-200)', 'var(--color-orange-400)']}
    />
  );
}

const metricCharts = { intensity: RainIntensityChart, probability: RainProbabilityChart, humidity: HumidityChart };

export default function HourlyRainyCard({ city, locale }: WeatherCardProps) {
  const [metric, setMetric] = useState<HourlyMetric>('intensity');
  const t = getTranslator(locale);
  const enabled = city.cards.some((card) => card.type === 'rain' && card.status);
  const { hourly, hourlyMetrics } = useWeatherData(city, locale, enabled, 'rain');
  const labels = {
    intensity: t('cards.rainIntensity'),
    probability: t('cards.rainChance'),
    humidity: t('humidity'),
  };
  const hasData = hourlyMetrics.some((point) => point[metric] !== null);
  const MetricChart = metricCharts[metric];

  if (!enabled) {
    return null;
  }

  return (
    <WeatherCardLayout col={2} row={1}>
      <Tabs
        value={metric}
        onValueChange={(value) => {
          if (value === 'intensity' || value === 'probability' || value === 'humidity') {
            setMetric(value);
          }
        }}
        className="min-h-0 flex-1 gap-2"
      >
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-2">
          <h2 className="shrink-0 text-base font-semibold text-white">{t('cards.hourlyDetails')}</h2>
          <TabsList
            className="relative isolate ml-auto rounded-full p-0.5 group-data-horizontal/tabs:h-7"
            aria-label={t('cards.hourlyMetric')}
          >
            {metrics.map((value) => {
              const Icon = metricIcons[value];

              return (
                <TabsTrigger
                  key={value}
                  value={value}
                  aria-label={labels[value]}
                  title={labels[value]}
                  className="z-10 w-8 rounded-full px-2 py-0.5"
                >
                  <Icon aria-hidden className="size-3.5" strokeWidth={1.75} />
                </TabsTrigger>
              );
            })}
            <TabsPrimitive.Indicator
              data-slot="tabs-indicator"
              className="pointer-events-none absolute top-0 left-0 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) translate-y-(--active-tab-top) rounded-full transition-[translate,width,height] duration-200 ease-out motion-reduce:transition-none"
            />
          </TabsList>
        </header>
        <TabsContent value={metric} className="flex min-h-0 flex-1 flex-col">
          {hourly.isLoading ? (
            <div role="status" aria-label={t('loading')} className="flex min-h-0 flex-1 items-center justify-center">
              <Loading />
            </div>
          ) : hourly.error || !hasData ? (
            <ScrollArea className="min-h-0 flex-1 [&>[data-slot=scroll-area-scrollbar]]:hidden">
              <p role="status" className="py-2 text-sm text-white/70">
                {hourly.error?.message ?? t('empty')}
              </p>
            </ScrollArea>
          ) : (
            <MetricChart points={hourlyMetrics} locale={locale} />
          )}
        </TabsContent>
      </Tabs>
    </WeatherCardLayout>
  );
}
