'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { MapPinHouse } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loading } from '@/components/common/Loading';
import { useSidebar } from '@/hooks/useSidebar';
import { useAppList } from '@/stores/app-list';
import { defaultLocale, isLocale } from '@/i18n/config';
import { useWeatherStorage } from '../hooks/useWeatherStorage';
import { WeatherLayout } from '../components/WeatherLayout';
import { WeatherCityModal, WeatherSettingsModal } from '../components/Setting';
import { Empty } from '../components/Empty';
import { getTranslator } from '../i18n';
import { WeatherPagination } from '../components/WeatherPagination';

export default function WeatherPage() {
  const appId = useAppList((state) => state.activePluginId);
  const { register, unmount } = useSidebar();
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getTranslator(locale);
  const cityManagementLabel = t('settings.open');
  const { cities, cards, create, isLoading, error } = useWeatherStorage(appId ?? '', locale);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!appId) {
      unmount('cities');

      return;
    }

    register([
      {
        name: 'cities',
        label: cityManagementLabel,
        type: 'apps',
        icon: MapPinHouse,
        order: 3,
        onClick: ({ open }) => open(),
        render: ({ onClose }) => (
          <WeatherSettingsModal
            appId={appId}
            locale={locale}
            onOpenChange={(open) => {
              if (!open) {
                onClose();
              }
            }}
          />
        ),
      },
    ]);
  }, [appId, cityManagementLabel, locale, register, unmount]);

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 p-5">
      {isLoading ? (
        <Loading />
      ) : error ? (
        <p role="alert" className="text-sm text-white/70">
          {t('settings.loadFailed')}
        </p>
      ) : cities.length === 0 ? (
        <Empty locale={locale} onAdd={() => setIsAdding(true)} />
      ) : (
        <Carousel
          className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 [&>[data-slot=carousel-content]]:flex [&>[data-slot=carousel-content]]:min-h-0 [&>[data-slot=carousel-content]]:flex-1 [&>[data-slot=carousel-content]]:flex-col"
          opts={{
            align: 'start',
            watchDrag: (_api, event) =>
              !(event.target instanceof Element && event.target.closest('[data-weather-hourly-scroll]')),
          }}
          aria-label={t('title')}
        >
          <CarouselContent className="ml-0 min-h-0 flex-1">
            {cities.map((city) => (
              <CarouselItem key={city.id} aria-label={city.name} className="flex min-h-0 flex-col pl-0">
                <ScrollArea className="min-h-0 flex-1 mask-[linear-gradient(to_bottom,transparent,black_48px,black_calc(100%_-_48px),transparent)] [&>[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:hidden">
                  <div className="py-12">
                    <WeatherLayout city={city} locale={locale} />
                  </div>
                </ScrollArea>
              </CarouselItem>
            ))}
          </CarouselContent>
          <WeatherPagination cities={cities} locale={locale} />
        </Carousel>
      )}
      {isAdding && appId && (
        <WeatherCityModal locale={locale} defaultCards={cards} onSave={create} onClose={() => setIsAdding(false)} />
      )}
    </div>
  );
}
