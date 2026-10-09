'use client';

import { createContext, useContext } from 'react';
import { createStore, useStore } from 'zustand';
import { fetchApi } from '@/lib/api/client';
import type { AppearanceConfig } from '@/lib/db/schema/appearance';
import type { ConfigRes } from '@/lib/services/config';

type SettingsStore = AppearanceConfig & {
  signedIn: boolean;
  saving: boolean;
  error: string | null;
  save: (values: Partial<AppearanceConfig>) => Promise<boolean>;
  list: () => Promise<boolean>;
  sync: (config: AppearanceConfig, signedIn: boolean) => void;
};

function saveCookies(config: AppearanceConfig) {
  for (const [key, value] of Object.entries(config)) {
    document.cookie = `${key}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }
}

export function createSettingsStore(initial: AppearanceConfig, signedIn: boolean) {
  return createStore<SettingsStore>((set, get) => ({
    ...initial,
    signedIn,
    saving: false,
    error: null,
    sync: (config, signedIn) => set({ ...config, signedIn }),
    list: async () => {
      const signedIn = get().signedIn;
      const response = await fetchApi<ConfigRes>('/api/public/config', {});
      if (get().signedIn !== signedIn) return false;
      if (!response.success || !response.data) {
        set({ error: response.message });
        return false;
      }
      set({ ...response.data.config, error: null });
      return true;
    },
    save: async (values) => {
      if (get().saving) return false;
      const { language, theme, veil } = get();
      const config: AppearanceConfig = { language, theme, veil, ...values };
      if (!get().signedIn) {
        saveCookies(config);
        set({ ...config, error: null });
        return true;
      }
      set({ saving: true, error: null });
      const response = await fetchApi<ConfigRes>('/api/config/update', config);
      if (response.success && response.data) {
        saveCookies(response.data.config);
        set({ ...response.data.config, saving: false });
        return true;
      } else {
        set({ saving: false, error: response.message });
        return false;
      }
    },
  }));
}

export const SettingsContext = createContext<ReturnType<typeof createSettingsStore> | null>(null);

export function useSettings<T>(selector: (state: SettingsStore) => T): T {
  const store = useContext(SettingsContext);
  if (!store) throw new Error('SettingsProvider is required.');
  return useStore(store, selector);
}
