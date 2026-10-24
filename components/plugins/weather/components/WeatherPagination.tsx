'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { useCarousel } from '@/components/ui/carousel';
import type { Locale } from '@/i18n/config';
import type { WeatherCityItem } from '../types';
import { getTranslator } from '../i18n';

export function WeatherPagination({ cities, locale }: { cities: WeatherCityItem[]; locale: Locale }) {
  const { api } = useCarousel();
  const t = getTranslator(locale);
  const subscribe = useCallback(
    (notify: () => void) => {
      api?.on('select', notify);
      api?.on('reInit', notify);

      return () => {
        api?.off('select', notify);
        api?.off('reInit', notify);
      };
    },
    [api],
  );
  const activeIndex = useSyncExternalStore(
    subscribe,
    () => api?.selectedScrollSnap() ?? 0,
    () => 0,
  );

  if (cities.length <= 1) {
    return null;
  }

  return (
    <div className="flex shrink-0 justify-center">
      <LiquidGlass className="h-6 rounded-full">
        <nav aria-label={t('carousel.pagination')} className="flex h-6 items-center">
          {cities.map((city, index) => (
            <button
              key={city.id}
              type="button"
              aria-label={t('carousel.city', { name: city.name })}
              aria-current={index === Math.min(activeIndex, cities.length - 1) ? 'page' : undefined}
              onClick={() => api?.scrollTo(index)}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full transition-[background-color,transform] duration-200 ${index === Math.min(activeIndex, cities.length - 1) ? 'scale-125 bg-white' : 'bg-white/40 hover:bg-white/70'}`}
              />
            </button>
          ))}
        </nav>
      </LiquidGlass>
    </div>
  );
}
