'use client';

import { useEffect, useRef } from 'react';
import type { Swiper as SwiperInstance } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Loading } from '@/components/common/Loading';
import { useSession } from '@/lib/auth-client';
import { useAppList } from '@/stores/app-list';
import { AppItem } from './AppItem';
import { AppPage, APP_PAGE_CAPACITY } from './AppPage';

export function AppList() {
  const allApps = useAppList((state) => state.apps);
  const { data: session, isPending } = useSession();
  const signedIn = !!session;
  const apps = allApps.filter((app) => signedIn || app.permission !== 'signed-in');
  const status = useAppList((state) => state.status);
  const list = useAppList((state) => state.list);
  const swiperRef = useRef<SwiperInstance | null>(null);
  const setSwiper = useAppList((state) => state.setSwiper);
  const setActiveIndex = useAppList((state) => state.setActiveIndex);
  const pageCount = Math.max(1, Math.ceil(apps.length / APP_PAGE_CAPACITY));
  const loading = status === 'idle' || status === 'loading';

  useEffect(() => {
    if (!isPending) void list();
  }, [isPending, signedIn, list]);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper || swiper.destroyed) return;
    swiper.update();
    swiper.slideTo(Math.min(swiper.activeIndex, pageCount - 1));
  }, [pageCount]);

  const pages = Array.from({ length: pageCount }, (_, index) => ({
    id: `page-${index}`,
    items: apps.slice(index * APP_PAGE_CAPACITY, (index + 1) * APP_PAGE_CAPACITY),
  }));

  return loading ? (
    <div className="h-156 w-300">
      <Loading />
    </div>
  ) : (
    // 动画挂在外层，不碰 Swiper 自己的根节点
    <div className="animate-in zoom-in-50 h-156 w-300 duration-500 ease-out">
      {/* observer：数据回来后页数会变，靠它重新量一遍 slides。 */}
      <Swiper
        id="app-list"
        className="h-156 w-300"
        slidesPerView={1}
        threshold={3}
        longSwipesRatio={0.1}
        loop={false}
        observer
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          setSwiper(swiper);
          setActiveIndex(swiper.activeIndex);
        }}
        onBeforeDestroy={() => {
          swiperRef.current = null;
          setSwiper(null);
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
      >
        {pages.map((page) => (
          <SwiperSlide key={page.id}>
            <AppPage
              items={page.items.map((app) => (
                <AppItem key={app.id} {...app} />
              ))}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
