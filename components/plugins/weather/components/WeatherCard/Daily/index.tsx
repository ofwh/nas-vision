'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Cloud, Wind } from 'lucide-react';
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Loading } from '@/components/common/Loading';
import type { WeatherCardProps } from '..';
import { getWeatherIcon } from '../../../assets/icons';
import { useWeatherData } from '../../../hooks/useWeatherData';
import { getTranslator } from '../../../i18n';

export default function DailyCard({ city, locale, days: initialDays = 7 }: WeatherCardProps & { days?: number }) {
  const [selectedDays, setSelectedDays] = useState(initialDays);
  const t = getTranslator(locale);
  const enabled = city.cards.some((card) => card.type === 'daily' && card.status);
  const {
    daily,
    days,
    dayOptions,
    requestedDays: count,
  } = useWeatherData(city, locale, enabled, 'daily', selectedDays);
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const weekday = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale, {
    weekday: locale === 'en' ? 'short' : 'long',
  });
  const dateFormat = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const temperature = (value: number | null | undefined) => (value == null ? '—' : `${number.format(value)}°`);

  if (!enabled) {
    return null;
  }

  return (
    <LiquidGlass
      variant="glass"
      className="w-full shrink-0 rounded-3xl"
      style={{
        height: `calc(var(--nv-plugin-weather-card-unit) * ${count > 7 ? 3 : 2} + var(--nv-plugin-weather-card-gap) * ${count > 7 ? 2 : 1})`,
      }}
      contentClassName="flex h-full flex-col p-4"
    >
      <section aria-label={t('cards.daily')} className="flex flex-1 flex-col gap-2">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-left text-base font-semibold text-white">{t('cards.dailyTitle', { count })}</h2>
          <Tabs
            value={count}
            onValueChange={(value) => {
              if (typeof value === 'number' && dayOptions.includes(value)) {
                setSelectedDays(value);
              }
            }}
            className="shrink-0"
          >
            <TabsList
              className="relative isolate rounded-full p-0.5 group-data-horizontal/tabs:h-7"
              aria-label={t('cards.forecastDays')}
            >
              {dayOptions.map((days) => (
                <TabsTrigger key={days} value={days} className="z-10 rounded-full px-2 py-0.5 text-[10px]">
                  {t('cards.dayCount', { count: days })}
                </TabsTrigger>
              ))}
              <TabsPrimitive.Indicator
                data-slot="tabs-indicator"
                className="pointer-events-none absolute top-0 left-0 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) translate-y-(--active-tab-top) rounded-full transition-[translate,width,height] duration-200 ease-out motion-reduce:transition-none"
              />
            </TabsList>
          </Tabs>
        </header>
        {daily.isLoading ? (
          <div role="status" aria-label={t('loading')} className="flex flex-1 items-center justify-center">
            <Loading />
          </div>
        ) : daily.error || days.length === 0 ? (
          <p role="status" className="py-4 text-sm text-white/70">
            {daily.error?.message ?? t('empty')}
          </p>
        ) : (
          <ul className="flex min-h-0 flex-1 flex-col">
            {days.map((day, index) => {
              const date = new Date(day.date);
              const label =
                dateFormat.format(date) === dateFormat.format(new Date()) ? t('today') : weekday.format(date);
              const description = day.conditionText || t(`condition.${day.condition}`);
              const icon = getWeatherIcon(day.condition, false);
              const FallbackIcon = day.condition === 'wind' ? Wind : Cloud;

              return (
                <li key={day.date} className="flex min-h-0 flex-1 flex-col">
                  <div className="flex min-h-11 flex-1 items-center gap-5 py-1 text-sm text-white">
                    <span className="w-14 shrink-0">{label}</span>
                    <div className="size-8 shrink-0">
                      {icon ? (
                        <Image
                          src={icon}
                          alt={description}
                          width={32}
                          height={32}
                          className="size-full object-contain"
                          unoptimized
                        />
                      ) : (
                        <FallbackIcon
                          role="img"
                          aria-label={description}
                          className="size-full text-white/70"
                          strokeWidth={1.25}
                        />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 items-center gap-4 tabular-nums">
                      <span className="w-10 shrink-0 text-right text-white/60">{temperature(day.low?.value)}</span>
                      <div
                        aria-hidden
                        className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/15"
                      >
                        {day.range && (
                          <span
                            className="absolute top-0 h-full min-w-0.5 rounded-full bg-linear-to-r from-sky-300 via-amber-200 to-orange-400"
                            style={{
                              left: day.range.left === 100 ? 'calc(100% - 2px)' : `${day.range.left}%`,
                              width: `${day.range.width}%`,
                            }}
                          />
                        )}
                      </div>
                      <span className="w-10 shrink-0">{temperature(day.high?.value)}</span>
                    </div>
                  </div>
                  {index < days.length - 1 && <div aria-hidden className="mx-auto h-px w-full shrink-0 bg-white/10" />}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </LiquidGlass>
  );
}
