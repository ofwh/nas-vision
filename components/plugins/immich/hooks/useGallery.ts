'use client';

import { useLocale } from 'next-intl';
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import useSWRInfinite from 'swr/infinite';
import { useSWRConfig } from 'swr';
import { usePlugin } from '@/hooks/usePlugin';
import { pluginPath, pluginRequest } from '@/lib/plugins/client';
import type { JsonObject } from '@/lib/api';
import type { PluginConfig } from '@/types/plugins';
import { useImmichTranslations } from '../i18n/useTranslations';
import type { ImmichListRes, ImmichMode, ImmichOrder } from '../types';

type ListKey = readonly [string, JsonObject, PluginConfig];

export default function useGallery(
  directory: string | undefined,
  mode: ImmichMode | undefined,
  order: ImmichOrder,
  scrollRef: RefObject<HTMLDivElement | null>,
) {
  const t = useImmichTranslations();
  const locale = useLocale();
  const { mutate: mutateCache } = useSWRConfig();
  const { config } = usePlugin('immich');
  const { data: settings, error: configError } = config.query();
  const [revision, setRevision] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const loadingMore = useRef(false);
  const {
    data: pages,
    error,
    isLoading,
    isValidating,
    size,
    setSize,
    mutate,
  } = useSWRInfinite<ImmichListRes, Error>(
    (index: number, previous: ImmichListRes | null): ListKey | null => {
      if (!settings || (previous && !previous.hasMore)) {
        return null;
      }

      return [
        pluginPath('immich', '/api/list'),
        {
          ...(directory === undefined ? {} : { directory }),
          ...(mode === undefined ? {} : { mode }),
          order,
          page: index + 1,
          pageSize: 48,
          revision,
          locale,
        },
        settings.config,
      ];
    },
    async ([url, params]: ListKey) => {
      const response = await pluginRequest<ImmichListRes>(url, params);

      if (!response.data) {
        throw new Error(t('ui.emptyResponse'));
      }

      return response.data;
    },
    {
      revalidateFirstPage: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      persistSize: false,
    },
  );
  const data = pages?.[0];
  const items = useMemo(() => {
    const unique = new Map<string, ImmichListRes['items'][number]>();

    for (const page of pages ?? []) {
      for (const item of page.items) {
        unique.set(`${item.type}-${item.id}`, item);
      }
    }

    return [...unique.values()];
  }, [pages]);
  const hasMore = pages?.at(-1)?.hasMore ?? false;

  useEffect(() => {
    const root = scrollRef.current;
    const target = sentinel.current;

    if (!root || !target || !hasMore || error || isValidating || !pages || pages.length < size) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || loadingMore.current) {
          return;
        }

        loadingMore.current = true;
        void setSize((current) => current + 1)
          .catch(() => undefined)
          .finally(() => {
            loadingMore.current = false;
          });
      },
      { root, rootMargin: '600px 0px' },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [scrollRef, hasMore, error, isValidating, pages, size, setSize]);
  const refresh = () => {
    scrollRef.current?.scrollTo({ top: 0 });
    setRevision((value) => value + 1);
  };

  return {
    data,
    items,
    error: isRetrying ? undefined : (error ?? configError),
    isLoading: isRetrying || (!settings && !configError) || isLoading,
    isValidating,
    hasMore,
    sentinel,
    refresh,
    retry: () => {
      setIsRetrying(true);
      void (configError ? mutateCache(['/api/plugin/query', { id: 'immich' }]) : mutate())
        .catch(() => undefined)
        .finally(() => setIsRetrying(false));
    },
  };
}
