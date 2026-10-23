import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { unstable_serialize as serializeInfinite } from 'swr/infinite';
import { useToast } from '@/hooks/useToast';
import { pluginPath, pluginRequest } from '@/lib/plugins/client';
import type { MusicItem } from '../types';
import { usePlaybackStore } from '../stores/context';
import { useNavidromeTranslations } from '../i18n/useTranslations';

export default function useSongStar() {
  const { cache, mutate } = useSWRConfig();
  const t = useNavidromeTranslations();
  const updateSong = usePlaybackStore((state) => state.updateSong);
  const toast = useToast();
  const [starring, setStarring] = useState<string | null>(null);

  async function star(song: MusicItem) {
    setStarring(song.id);
    try {
      try {
        await pluginRequest(pluginPath('navidrome', '/api/star'), { id: song.id, starred: !song.starred });
      } catch (error) {
        toast.add({ type: 'error', title: error instanceof Error ? error.message : t('library.starFailed') });

        return;
      }
      updateSong(song.id, song.starred ? undefined : new Date().toISOString());
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
    } catch {
      toast.add({ type: 'warning', title: t('library.refreshFailed') });
    } finally {
      setStarring(null);
    }
  }

  return { star, starring };
}
