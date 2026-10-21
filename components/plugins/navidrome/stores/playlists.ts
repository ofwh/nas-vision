import { createStore } from 'zustand';
import type { MusicItem } from '../types';
import { fetchList } from '../utils/list';

type PlaylistsStore = {
  items: MusicItem[];
  loaded: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  error?: Error;
  list: (locale: string) => Promise<void>;
  upsert: (playlist: MusicItem) => void;
  remove: (id: string) => void;
};

export function createPlaylistsStore() {
  return createStore<PlaylistsStore>((set, get) => {
    let pending: Promise<void> | null = null;
    let language: string | null = null;
    let revision = 0;
    let changes = new Map<string, MusicItem>();
    let removed = new Set<string>();

    return {
      items: [],
      loaded: false,
      isLoading: true,
      isRefreshing: false,
      list: (locale) => {
        if (pending && language === locale) {
          return pending;
        }

        language = locale;
        const request = ++revision;

        changes = new Map();
        removed = new Set();

        set({ isLoading: !get().loaded, isRefreshing: true, error: undefined });
        pending = fetchList({ section: 'playlists' })
          .then((data) => {
            if (request === revision) {
              const ids = new Set(data.items.map((item) => item.id));
              const items = data.items
                .filter((item) => !removed.has(item.id))
                .map((item) => changes.get(item.id) ?? item);

              for (const item of changes.values()) {
                if (!ids.has(item.id)) {
                  items.push(item);
                }
              }

              set({ items, loaded: true });
            }
          })
          .catch((error: unknown) => {
            if (request === revision) {
              set({ error: error instanceof Error ? error : new Error(String(error)) });
            }
          })
          .finally(() => {
            if (request === revision) {
              pending = null;
              set({ isLoading: false, isRefreshing: false });
            }
          });

        return pending;
      },
      upsert: (playlist) => {
        changes.set(playlist.id, playlist);
        set((current) => ({
          items: current.items.some((item) => item.id === playlist.id)
            ? current.items.map((item) => (item.id === playlist.id ? playlist : item))
            : [...current.items, playlist],
          loaded: true,
          isLoading: false,
          error: undefined,
        }));
      },
      remove: (id) => {
        removed.add(id);
        changes.delete(id);
        set((current) => ({ items: current.items.filter((item) => item.id !== id) }));
      },
    };
  });
}
