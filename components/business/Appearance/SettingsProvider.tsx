'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from 'zustand';
import { useSession } from '@/lib/auth-client';
import type { AppearanceConfig } from '@/lib/db/schema/config';
import { createSettingsStore, SettingsContext } from '@/stores/settings';

export function SettingsProvider({
  config,
  signedIn,
  children,
}: {
  config: AppearanceConfig;
  signedIn: boolean;
  children: ReactNode;
}) {
  const [store] = useState(() => createSettingsStore(config, signedIn));
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const previousSignedIn = useRef(signedIn);
  useEffect(() => {
    store.getState().sync(config, signedIn);
  }, [config, signedIn, store]);
  useEffect(() => {
    if (isPending || previousSignedIn.current === !!session) return;
    previousSignedIn.current = !!session;
    const { language, theme, veil } = store.getState();
    store.getState().sync({ language, theme, veil }, !!session);
    let cancelled = false;
    void store
      .getState()
      .list()
      .then((success) => {
        if (success && !cancelled) router.refresh();
      });
    return () => {
      cancelled = true;
    };
  }, [isPending, session, router, store]);
  const theme = useStore(store, (state) => state.theme);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    function apply() {
      const dark = theme === 'dark' || (theme === 'auto' && media.matches);
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    }
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
  return <SettingsContext.Provider value={store}>{children}</SettingsContext.Provider>;
}
