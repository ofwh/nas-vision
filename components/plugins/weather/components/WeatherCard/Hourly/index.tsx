'use client';

import Image from 'next/image';
import { Cloud, Haze, Wind } from 'lucide-react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Loading } from '@/components/common/Loading';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { WeatherCardProps } from '..';
import { useWeatherData } from '../../../hooks/useWeatherData';
import { getTranslator } from '../../../i18n';
import { getWeatherIcon } from '../../../assets/icons';

export default function HourlyCard({ city, locale }: WeatherCardProps) {
  const t = getTranslator(locale);
  const enabled = city.cards.some((card) => card.type === 'hourly' && card.status);
  const { hourly, hours } = useWeatherData(city, locale, enabled, 'hourly');

  if (!enabled) {
    return null;
  }

  if (hourly.isLoading) {
    return (
      <div
        role="status"
        aria-label={t('loading')}
        className="flex h-(--nv-plugin-weather-card-unit) w-full items-center justify-center"
      >
        <Loading />
      </div>
    );
  }

  if (hourly.error || !hourly.data?.items.length) {
    return (
      <p
        role="status"
        className="flex h-(--nv-plugin-weather-card-unit) w-full items-center py-4 text-sm text-white/70"
      >
        {hourly.error?.message ?? t('empty')}
      </p>
    );
  }

  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });

  return (
    <section
      aria-label={t('cards.hourly')}
      className="flex h-(--nv-plugin-weather-card-unit) w-full min-w-0 items-center text-white"
    >
      <ScrollArea
        data-weather-hourly-scroll
        className="w-full min-w-0 mask-[linear-gradient(to_right,transparent,black_24px,black_calc(100%_-_24px),transparent)]"
        aria-label={t('cards.hourly')}
      >
        <div className="flex w-max min-w-full gap-2 px-6 pt-2 pb-5">
          {hours.map((hour, index) => {
            const label = hour.isCurrent
              ? t('cards.now')
              : hour.hour !== null
                ? t('cards.hour', { hour: hour.hour })
                : '—';
            const dark = hour.hour !== null ? hour.hour >= 18 || hour.hour < 6 : hour.isDay === false;
            const icon = getWeatherIcon(hour.condition, dark);
            const FallbackIcon = hour.condition === 'wind' ? Wind : hour.condition === 'haze' ? Haze : Cloud;
            const description = hour.conditionText || t(`condition.${hour.condition}`);

            return (
              <LiquidGlass
                key={hour.isCurrent ? 'current' : `${hour.time}-${index}`}
                variant="glass"
                className="w-20 shrink-0 rounded-full"
                contentClassName="flex flex-col items-center gap-4 px-2 py-5"
              >
                <span className="text-sm whitespace-nowrap">{label}</span>
                <div className="size-14 shrink-0">
                  {icon ? (
                    <Image
                      src={icon}
                      alt={description}
                      width={56}
                      height={56}
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
                <span className="text-lg font-semibold tabular-nums">
                  {hour.temperature ? `${number.format(hour.temperature.value)}°` : '—'}
                </span>
              </LiquidGlass>
            );
          })}
        </div>
        <ScrollBar
          orientation="horizontal"
          className="pointer-events-none opacity-0 transition-opacity duration-150 data-hovering:pointer-events-auto data-hovering:opacity-100"
        />
      </ScrollArea>
    </section>
  );
}
