import { create } from 'zustand';
import { fetchApi } from '@/lib/api/client';
import type { AppItem, AppListRes } from '@/lib/services/apps';

type AppListStatus = 'idle' | 'loading' | 'success' | 'error';

type AppListStore = {
  apps: AppItem[];
  status: AppListStatus;
  error: string | null;
  /** 正在请求或已有数据时不重复发。 */
  load: () => Promise<void>;
  /** 强制重取：保存后列表要跟着变。 */
  reload: () => Promise<void>;
};

export const useAppList = create<AppListStore>((set, get) => {
  const fetchApps = async () => {
    set({ status: 'loading', error: null });

    const response = await fetchApi<AppListRes>('/api/apps/list', {});

    if (!response.success) {
      set({ status: 'error', error: response.message });
      return;
    }

    set({ apps: response.data?.apps ?? [], status: 'success' });
  };

  return {
    apps: [],
    status: 'idle',
    error: null,
    load: async () => {
      const { status } = get();
      if (status === 'loading' || status === 'success') return;

      await fetchApps();
    },
    reload: fetchApps,
  };
});
