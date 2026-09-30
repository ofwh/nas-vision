'use client';

import { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Loading } from '@/components/common/Loading';
import { useAppList } from '@/stores/app-list';
import { AppItem } from './AppItem';
import { AppPage, APP_PAGE_CAPACITY } from './AppPage';

export function AppList() {
  const apps = useAppList((state) => state.apps);
  const status = useAppList((state) => state.status);
  const load = useAppList((state) => state.load);

  useEffect(() => {
    void load();
  }, [load]);

  // idle 是首帧（effect 还没跑），和 loading 一起当加载态，免得先闪一屏空列表
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="h-156 w-300">
        <Loading />
      </div>
    );
  }

  const pageCount = Math.max(1, Math.ceil(apps.length / APP_PAGE_CAPACITY));
  const pages = Array.from({ length: pageCount }, (_, index) => ({
    id: `page-${index}`,
    items: apps.slice(index * APP_PAGE_CAPACITY, (index + 1) * APP_PAGE_CAPACITY),
  }));

  return (
    // 动画挂在外层，不碰 Swiper 自己的根节点
    <div className="animate-in zoom-in-50 h-156 w-300 duration-500 ease-out">
      {/* observer：数据回来后页数会变，靠它重新量一遍 slides。 */}
      <Swiper id="app-list" className="h-156 w-300" slidesPerView={1} loop={false} observer>
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
