import { create } from 'zustand';
import type { Swiper } from 'swiper';
import { moveBefore } from '@/lib/app-order';
import { fetchApi } from '@/lib/api/client';
import type { AppItem, AppListRes, AppMoveRes } from '@/lib/services/apps';

type AppListStatus = 'idle' | 'loading' | 'success' | 'error';

type AppListStore = {
  apps: AppItem[];
  swiper: Swiper | null;
  activeIndex: number;
  setSwiper: (swiper: Swiper | null) => void;
  setActiveIndex: (activeIndex: number) => void;
  status: AppListStatus;
  error: string | null;
  sorting: boolean;
  sortError: string | null;
  move: (id: string, beforeId: string | null) => Promise<void>;
  list: () => Promise<void>;
};

export const useAppList = create<AppListStore>((set, get) => {
  const fetchApps = async () => {
    set({ status: get().apps.length ? get().status : 'loading', error: null });

    const response = await fetchApi<AppListRes>('/api/public/apps/list', {});

    if (!response.success) {
      set({ status: 'error', error: response.message });
      return;
    }

    set({ apps: response.data?.apps ?? [], status: 'success' });
  };

  return {
    apps: [],
    swiper: null,
    activeIndex: 0,
    status: 'idle',
    error: null,
    sorting: false,
    sortError: null,
    setSwiper: (swiper) => set({ swiper, activeIndex: swiper?.activeIndex ?? 0 }),
    setActiveIndex: (activeIndex) => set({ activeIndex }),
    move: async (id, beforeId) => {
      if (get().sorting) return;
      const previous = get().apps;
      const ordered = moveBefore(previous, id, beforeId);
      if (ordered.every((app, index) => app.id === previous[index]?.id)) return;
      set({ apps: ordered, sorting: true, sortError: null });
      const response = await fetchApi<AppMoveRes>('/api/apps/sort', { id, beforeId });
      if (response.success && response.data) {
        await get().list();
        set({ sorting: false });
      } else {
        set({ apps: previous, sortError: response.message });
        // 网络失败时请求可能已提交；重新读取服务端的实际顺序。
        await get().list();
        set({ sorting: false });
      }
    },
    list: fetchApps,
  };
});
