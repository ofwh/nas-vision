import { useCallback, useMemo, useRef } from 'react';
import useSWRInfinite from 'swr/infinite';
import { useSWRConfig } from 'swr';
import { usePlugin } from '@/hooks/usePlugin';
import { pluginPath } from '@/lib/plugins/client';
import type { PluginConfig } from '@/types/plugins';
import type { NavidromeListParams, NavidromeListRes } from '../types';
import { fetchList } from '../utils/list';

type ListKey = readonly [string, string, NavidromeListParams, PluginConfig];

export default function useMusicList(params: NavidromeListParams, locale: string, enabled = true) {
  const { mutate: mutateCache } = useSWRConfig();
  const { config } = usePlugin('navidrome');
  const { data: settings, error: configError } = config.query();
  const loadingMore = useRef(new Set<string>());
  const scope = JSON.stringify([locale, params, settings?.config]);
  const listing = useSWRInfinite<NavidromeListRes, Error>(
    (index: number, previous: NavidromeListRes | null): ListKey | null => {
      if (!enabled || !settings || (previous && !previous.hasMore)) {
        return null;
      }

      return [pluginPath('navidrome', '/api/list'), locale, { ...params, offset: index * 48 }, settings.config];
    },
    ([, , pageParams]: ListKey) => fetchList(pageParams),
    { revalidateFirstPage: false, persistSize: false, shouldRetryOnError: false },
  );
  const { data, error, isValidating, size, setSize } = listing;
  const items = useMemo(() => data?.flatMap((page) => page.items) ?? [], [data]);
  const hasMore = data?.at(-1)?.hasMore ?? false;
  const isLoadingMore = !error && Boolean(data && data.length < size);
  const loadMore = useCallback(() => {
    if (!hasMore || error || isValidating || !data || data.length < size || loadingMore.current.has(scope)) {
      return;
    }

    loadingMore.current.add(scope);
    void setSize((current) => current + 1)
      .catch(() => undefined)
      .finally(() => {
        loadingMore.current.delete(scope);
      });
  }, [hasMore, error, isValidating, data, size, setSize, scope]);

  return {
    ...listing,
    mutate: () => (configError ? mutateCache(['/api/plugin/query', { id: 'navidrome' }]) : listing.mutate()),
    error: listing.error ?? configError,
    isLoading: enabled && (!settings && !configError ? true : listing.isLoading),
    items,
    title: data?.[0]?.title,
    hasMore,
    isLoadingMore,
    loadMore,
  };
}
