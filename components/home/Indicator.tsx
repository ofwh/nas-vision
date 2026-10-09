'use client';

import { useTranslations } from 'next-intl';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { useAppList } from '@/stores/app-list';
import { APP_PAGE_CAPACITY } from './AppPage';

export function Indicator() {
  const t = useTranslations();
  const apps = useAppList((state) => state.apps);
  const status = useAppList((state) => state.status);
  const swiper = useAppList((state) => state.swiper);
  const activeIndex = useAppList((state) => state.activeIndex);
  const count = Math.max(1, Math.ceil(apps.length / APP_PAGE_CAPACITY));
  if (status === 'idle' || status === 'loading' || count <= 1) return null;

  return (
    <LiquidGlass className="h-6 rounded-full">
      <nav aria-label={t('home.pagination')} className="flex h-6 items-center">
        {Array.from({ length: count }, (_, index) => (
          <button
            key={index}
            type="button"
            aria-label={t('home.page', { page: index + 1 })}
            aria-current={index === Math.min(activeIndex, count - 1) ? 'page' : undefined}
            onClick={() => {
              if (swiper && !swiper.destroyed) swiper.slideTo(index);
            }}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full transition-[background-color,transform] duration-200 ${
                index === Math.min(activeIndex, count - 1) ? 'scale-125 bg-white' : 'bg-white/40 hover:bg-white/70'
              }`}
            />
          </button>
        ))}
      </nav>
    </LiquidGlass>
  );
}
