'use client';

import type { ReactNode } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { AppPage, APP_PAGE_CAPACITY } from './AppPage';

/**
 * The app list: one honeycomb page per slide.
 *
 * Swiper owns the sliding — its container is `overflow: hidden`, so no scrollbar
 * is rendered, and it answers touch and pointer drag alike (`simulateTouch`
 * defaults to true). `loop` stays false, so the list stops at either end.
 */
export function AppList({ apps }: { apps: ReactNode[] }) {
  const pages = Array.from({ length: Math.ceil(apps.length / APP_PAGE_CAPACITY) }, (_, index) => ({
    id: `page-${index}`,
    items: apps.slice(index * APP_PAGE_CAPACITY, (index + 1) * APP_PAGE_CAPACITY),
  }));

  return (
    <Swiper id="app-list" className="h-156 w-300" slidesPerView={1} loop={false}>
      {pages.map((page) => (
        <SwiperSlide key={page.id}>
          <AppPage items={page.items} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
