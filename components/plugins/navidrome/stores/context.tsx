'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { createPlaybackStore } from './playback';
import { createPlaylistsStore } from './playlists';

type Stores = {
  playback: ReturnType<typeof createPlaybackStore>;
  playlists: ReturnType<typeof createPlaylistsStore>;
};

const StoresContext = createContext<Stores | null>(null);

export function NavidromeStoreProvider({ children }: { children: ReactNode }) {
  const [stores] = useState<Stores>(() => ({ playback: createPlaybackStore(), playlists: createPlaylistsStore() }));

  return <StoresContext.Provider value={stores}>{children}</StoresContext.Provider>;
}

function useStores() {
  const stores = useContext(StoresContext);

  if (!stores) {
    throw new Error('NavidromeStoreProvider is required.');
  }

  return stores;
}

export function usePlaybackStore<T>(selector: (state: ReturnType<Stores['playback']['getState']>) => T): T {
  return useStore(useStores().playback, selector);
}

export function usePlaylistsStore<T>(selector: (state: ReturnType<Stores['playlists']['getState']>) => T): T {
  return useStore(useStores().playlists, selector);
}
