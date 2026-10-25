'use client';

import Image from 'next/image';
import { Cloud, Haze, Wind } from 'lucide-react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Loading } from '@/components/common/Loading';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { WeatherCardProps } from '..';
import { WeatherCardLayout } from '../../WeatherCardLayout';
import { useWeatherData } from '../../../hooks/useWeatherData';
import { getTranslator } from '../../../i18n';
import { getWeatherIcon } from '../../../assets/icons';

export default function HourlyForecastCard({ city, locale }: WeatherCardProps) {
  const t = getTranslator(locale);
  const enabled = city.cards.some((card) => card.type === 'hourly' && card.status);
  const { hourly, hours } = useWeatherData(city, locale, enabled, 'hourly');

  if (!enabled) {
    return null;
  }

  if (hourly.isLoading) {
    return (
      <WeatherCardLayout col={4} row={1} transparent>
        <div role="status" aria-label={t('loading')} className="flex min-h-0 w-full flex-1 items-center justify-center">
          <Loading />
        </div>
      </WeatherCardLayout>
    );
  }

  if (hourly.error || !hourly.data?.items.length) {
    return (
      <WeatherCardLayout col={4} row={1} transparent>
        <p role="status" className="flex min-h-0 w-full flex-1 items-center py-4 text-sm text-white/70">
          {hourly.error?.message ?? t('empty')}
        </p>
      </WeatherCardLayout>
    );
  }

  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });

  return (
    <WeatherCardLayout col={4} row={1} transparent contentClassName="p-0">
      <section aria-label={t('cards.hourly')} className="flex min-h-0 w-full min-w-0 flex-1 text-white">
        <ScrollArea
          data-weather-hourly-scroll
          className="h-full w-full min-w-0 mask-[linear-gradient(to_right,transparent,black_24px,black_calc(100%_-_24px),transparent)] [&>[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:hidden [&>[data-slot=scroll-area-viewport]]:overflow-y-hidden!"
          aria-label={t('cards.hourly')}
        >
          <div className="flex h-full w-max min-w-full gap-2 px-6 py-2">
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
                  className="h-full w-20 shrink-0 rounded-full"
                  contentClassName="flex h-full min-h-0 flex-col items-center justify-between gap-1 px-2 py-3"
                >
                  <span className="shrink-0 text-sm whitespace-nowrap">{label}</span>
                  <div className="max-h-14 min-h-0 w-14 flex-1">
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
                  <span className="shrink-0 text-lg font-semibold tabular-nums">
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
    </WeatherCardLayout>
  );
}
