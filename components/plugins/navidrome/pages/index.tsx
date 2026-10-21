'use client';

import { useEffect, useState } from 'react';
import { useSWRConfig } from 'swr';
import { unstable_serialize as serializeInfinite } from 'swr/infinite';
import { useLocale } from 'next-intl';
import { useShallow } from 'zustand/react/shallow';
import { usePlugin } from '@/hooks/usePlugin';
import { pluginPath, pluginRequest } from '@/lib/plugins/client';
import type { PluginViewProps } from '@/types/plugins';
import type { MusicItem, NavidromeListParams, Section } from '../types';
import useMusicList from '../hooks/useMusicList';
import { NavidromeStoreProvider, usePlaybackStore, usePlaylistsStore } from '../stores/context';
import { parsePath } from '../utils/navigation';
import { getTranslator } from '../i18n';
import Sidebar from '../components/Sidebar';
import Content from '../components/Content';
import ContentHeader from '../components/Content/ContentHeader';
import Player from '../components/Player';
import WindowHeader from '../components/WindowHeader';

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
  const { cache, mutate } = useSWRConfig();
  const locale = useLocale();
  const t = getTranslator(locale);
  const selection = parsePath(path);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const playback = usePlaybackStore(
    useShallow((state) => ({
      queue: state.queue,
      source: state.source,
      play: state.play,
      updateSong: state.updateSong,
    })),
  );
  const playlists = usePlaylistsStore((state) => state);
  const [showQueue, setShowQueue] = useState(false);
  const [actionError, setActionError] = useState('');
  const [starring, setStarring] = useState<string | null>(null);
  const params: NavidromeListParams = query ? { section: 'search', query } : selection;
  const isPlaylistOverview = params.section === 'playlists' && !params.id;
  const listing = useMusicList(params, locale, !isPlaylistOverview);
  const loadPlaylists = playlists.list;

  useEffect(() => {
    void loadPlaylists(locale);
  }, [loadPlaylists, locale]);
  const source = JSON.stringify(
    query ? ['search', query] : selection.id ? [selection.kind, selection.id] : [selection.section],
  );
  const items = showQueue ? playback.queue : isPlaylistOverview ? playlists.items : listing.items;
  const songs = items.filter((item) => item.kind === 'song');
  const title = showQueue
    ? t('player.queue')
    : query
      ? t('search.title', { query })
      : listing.title || t(`sections.${selection.section}`);

  function navigate(section: Section, item?: MusicItem) {
    setSearch('');
    setQuery('');
    setShowQueue(false);
    setActionError('');
    page.navigate(`/${section}${item ? `/${item.kind}/${encodeURIComponent(item.id)}` : ''}`);
  }

  function play(songIndex?: number) {
    playback.play(songs, showQueue ? (playback.source ?? source) : source, songIndex);
    setActionError('');
  }

  async function star(song: MusicItem) {
    setStarring(song.id);
    setActionError('');
    try {
      await pluginRequest(pluginPath('navidrome', '/api/star'), { id: song.id, starred: !song.starred });
      playback.updateSong(song.id, song.starred ? undefined : new Date().toISOString());
      const aggregates = new Set<string>();

      await mutate(
        (key: unknown) => {
          if (!Array.isArray(key) || key[0] !== pluginPath('navidrome', '/api/list')) {
            return false;
          }

          const aggregate = serializeInfinite(() => key);

          if (cache.get(aggregate)) {
            aggregates.add(aggregate);
          }

          return true;
        },
        undefined,
        { revalidate: false },
      );
      await Promise.all([...aggregates].map((key) => mutate(key)));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('library.starFailed'));
    } finally {
      setStarring(null);
    }
  }

  return (
    <div className="@container/music-window relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden text-[#fff8f1] [&_button[aria-pressed=true]]:text-[#f0a17e]">
      <WindowHeader
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
      <Content
        key={`${locale}:${path}:${query}:${showQueue}`}
        header={
          <ContentHeader
            title={title}
            canGoBack={Boolean(selection.id && !query && !showQueue)}
            search={search}
            onBack={() => navigate(selection.section)}
            onSearchChange={setSearch}
            onSearch={() => {
              setQuery(search.trim());
              setShowQueue(false);
            }}
          />
        }
        items={items}
        isLoading={isPlaylistOverview ? playlists.isLoading : listing.isLoading}
        error={isPlaylistOverview ? playlists.error : listing.error}
        actionError={actionError}
        isQueue={showQueue}
        isSearch={Boolean(query)}
        source={showQueue ? (playback.source ?? source) : source}
        starringId={starring}
        isLoadingMore={listing.isLoadingMore}
        hasMore={listing.hasMore}
        onRetry={() =>
          isPlaylistOverview ? void playlists.list(locale) : void listing.mutate().catch(() => undefined)
        }
        onOpen={(item) => navigate(selection.section, item)}
        onPlay={play}
        onStar={(song) => void star(song)}
        onLoadMore={listing.loadMore}
      />
      <Player />
    </div>
  );
}
