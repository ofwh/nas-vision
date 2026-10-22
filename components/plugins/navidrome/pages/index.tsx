'use client';

import { useDeferredValue, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useShallow } from 'zustand/react/shallow';
import { usePlugin } from '@/hooks/usePlugin';
import type { PluginViewProps } from '@/types/plugins';
import type { MusicItem, NavidromeListParams, Section } from '../types';
import useMusicList from '../hooks/useMusicList';
import useSongStar from '../hooks/useSongStar';
import { NavidromeStoreProvider, usePlaybackStore, usePlaylistsStore } from '../stores/context';
import { parsePath } from '../utils/navigation';
import { useNavidromeTranslations } from '../i18n/useTranslations';
import Sidebar from '../components/Sidebar/Sidebar';
import LibraryContent from '../components/Library/LibraryContent';
import LibraryHeader from '../components/Library/LibraryHeader';
import PlayerFooter from '../components/Player/PlayerFooter';
import WindowHeader from '../components/WindowHeader';
import useDeletePlaylist from '../hooks/useDeletePlaylist';

export default function Navidrome(props: PluginViewProps) {
  const { config } = usePlugin('navidrome');
  const { data: settings } = config.query();

  return (
    <NavidromeStoreProvider key={JSON.stringify(settings?.config ?? null)}>
      <MusicLibrary {...props} />
    </NavidromeStoreProvider>
  );
}

function MusicLibrary({ path }: PluginViewProps) {
  const { page } = usePlugin('navidrome');
  const locale = useLocale();
  const t = useNavidromeTranslations();
  const selection = parsePath(path);
  const deferredPath = useDeferredValue(path);
  const isNavigating = path !== deferredPath;
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const playback = usePlaybackStore(
    useShallow((state) => ({
      queue: state.queue,
      source: state.source,
      play: state.play,
    })),
  );
  const playlists = usePlaylistsStore((state) => state);
  const [showQueue, setShowQueue] = useState(false);
  const deletePlaylist = useDeletePlaylist();
  const { star, starring } = useSongStar();
  const params: NavidromeListParams = query ? { section: 'search', query } : selection;
  const deferredParams: NavidromeListParams = query ? { section: 'search', query } : parsePath(deferredPath);
  const isPlaylistOverview = params.section === 'playlists' && !params.id;
  const listing = useMusicList(deferredParams, locale, !(deferredParams.section === 'playlists' && !deferredParams.id));
  const loadPlaylists = playlists.list;

  useEffect(() => {
    void loadPlaylists(locale);
  }, [loadPlaylists, locale]);
  const source = JSON.stringify(
    query ? ['search', query] : selection.id ? [selection.kind, selection.id] : [selection.section],
  );
  const items = showQueue ? playback.queue : isNavigating ? [] : isPlaylistOverview ? playlists.items : listing.items;
  const songs = items.filter((item) => item.kind === 'song');
  const title = showQueue
    ? t('player.queue')
    : query
      ? t('search.title', { query })
      : (!isNavigating && listing.title) || t(`sections.${selection.section}`);

  function navigate(section: Section, item?: MusicItem) {
    setSearch('');
    setQuery('');
    setShowQueue(false);
    page.navigate(`/${section}${item ? `/${item.kind}/${encodeURIComponent(item.id)}` : ''}`);
  }

  function play(songIndex?: number) {
    playback.play(songs, showQueue ? (playback.source ?? source) : source, songIndex);
  }

  const playlistId = !query && !showQueue && !isNavigating && selection.kind === 'playlist' ? selection.id : undefined;

  return (
    <div className="nv-plugin-navidrome @container/music-window relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden text-[#fff8f1] [&_button[aria-pressed=true]]:text-[#f0a17e]">
      <WindowHeader
        onDeletePlaylist={
          playlistId ? () => void deletePlaylist(playlistId, title, () => navigate('playlists')) : undefined
        }
        canPlayAll={songs.length > 0}
        onPlayAll={() => play()}
        isRefreshing={listing.isValidating || playlists.isRefreshing}
        onRefresh={() => {
          if (!isPlaylistOverview) {
            void listing.mutate().catch(() => undefined);
          }

          void playlists.list(locale);
        }}
      />
      <Sidebar
        activeSection={!query && !showQueue ? selection.section : undefined}
        activePlaylistId={!query && !showQueue && selection.kind === 'playlist' ? selection.id : undefined}
        onNavigate={navigate}
      />
      <LibraryContent
        key={`${locale}:${path}:${query}:${showQueue}`}
        header={
          <LibraryHeader
            title={title}
            canGoBack={Boolean(selection.id && !query && !showQueue)}
            search={search}
            isSearching={Boolean(query)}
            onBack={() => navigate(selection.section)}
            onSearchChange={setSearch}
            onClearSearch={() => {
              setSearch('');
              setQuery('');
            }}
            onSearch={() => {
              setQuery(search.trim());
              setShowQueue(false);
            }}
          />
        }
        items={items}
        isLoading={isNavigating || (isPlaylistOverview ? playlists.isLoading : listing.isLoading)}
        error={isNavigating ? undefined : isPlaylistOverview ? playlists.error : listing.error}
        isQueue={showQueue}
        isSearch={Boolean(query)}
        source={showQueue ? (playback.source ?? source) : source}
        starringId={starring}
        isLoadingMore={listing.isLoadingMore}
        hasMore={!isNavigating && listing.hasMore}
        onRetry={() =>
          isPlaylistOverview ? void playlists.list(locale) : void listing.mutate().catch(() => undefined)
        }
        onOpen={(item) => navigate(selection.section, item)}
        onPlay={play}
        onStar={(song) => void star(song)}
        onLoadMore={listing.loadMore}
      />
      <PlayerFooter />
    </div>
  );
}
