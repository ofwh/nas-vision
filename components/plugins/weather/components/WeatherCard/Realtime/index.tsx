'use client';

import type { ReactNode } from 'react';
import { Loading } from '@/components/common/Loading';
import { MarqueeText } from '@/components/common/MarqueeText';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { WeatherCardProps } from '..';
import { WeatherCardLayout } from '../../WeatherCardLayout';
import { getTranslator } from '../../../i18n';
import { useWeatherData } from '../../../hooks/useWeatherData';
import { WeatherAnimation } from '../WeatherAnimation';
import { WeatherAlerts } from './Alerts';

function temperature(value: number | null | undefined, locale: string) {
  return value == null ? '—' : new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

function CityHeader({ name, children }: { name: string; children?: ReactNode }) {
  if (!name && !children) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center gap-4 text-base font-semibold text-white">
      <h2 className="max-w-[180px] min-w-0 shrink-0">
        <MarqueeText text={name} />
      </h2>
      <div className="flex min-w-0 flex-1 justify-end">{children}</div>
    </div>
  );
}

export default function RealtimeCard({ city, locale }: WeatherCardProps) {
  const t = getTranslator(locale);
  const enabled = city.cards.some((card) => card.type === 'realtime' && card.status);
  const { realtime, daily, alerts } = useWeatherData(city, locale, enabled);

  if (!enabled) {
    return null;
  }

  if (realtime.isLoading) {
    return (
      <WeatherCardLayout col={4} row={1} transparent>
        <div className="flex min-h-0 w-full flex-1 items-center justify-center" role="status" aria-label={t('loading')}>
          <Loading />
        </div>
      </WeatherCardLayout>
    );
  }

  const current = realtime.data;

  if (!current || realtime.error) {
    return (
      <WeatherCardLayout col={4} row={1} transparent>
        <CityHeader name={city.name} />
        <ScrollArea className="min-h-0 flex-1 [&>[data-slot=scroll-area-scrollbar]]:hidden">
          <p role="status" className="py-2 text-sm text-white/70">
            {realtime.error?.message ?? t('empty')}
          </p>
        </ScrollArea>
      </WeatherCardLayout>
    );
  }

  const today = daily.data?.items[0];
  const description = current.conditionText || t(`condition.${current.condition}`);
  const unit = current.temperature?.unit === 'fahrenheit' ? '°F' : '°C';
  const warnings = alerts.data?.items ?? [];

  return (
    <WeatherCardLayout col={4} row={1} transparent contentClassName="px-8">
      <section aria-label={t('cards.realtime')} className="@container flex min-h-0 flex-1 flex-col gap-2 text-white">
        <CityHeader name={city.name}>
          <WeatherAlerts alerts={warnings} locale={locale} />
        </CityHeader>
        <ScrollArea className="min-h-0 flex-1 [&>[data-slot=scroll-area-scrollbar]]:hidden">
          <div className="flex min-h-full flex-col gap-3">
            <div className="flex min-h-32 flex-1 items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
                <p className="inline-flex items-start text-[clamp(2.5rem,9cqw,4.5rem)] leading-none font-bold tabular-nums">
                  {temperature(current.temperature?.value, locale)}
                  <sup className="pt-1 text-xl leading-none">{unit}</sup>
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80">
                  <span>{description}</span>
                  <span>
                    {temperature(today?.low?.value, locale)}°/{temperature(today?.high?.value, locale)}°
                  </span>
                </div>
              </div>
              <div className="size-[clamp(6rem,20cqw,9rem)] shrink-0">
                <WeatherAnimation condition={current.condition} isDay={current.isDay} label={description} />
              </div>
            </div>
          </div>
        </ScrollArea>
      </section>
    </WeatherCardLayout>
  );
}
