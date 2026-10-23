import { useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { useSWRConfig } from 'swr';
import { unstable_serialize as serializeInfinite } from 'swr/infinite';
import { pluginPath, pluginRequest } from '@/lib/plugins/client';
import { useMessageBox } from '@/hooks/useMessageBox';
import { useToast } from '@/hooks/useToast';
import { useNavidromeTranslations } from '../i18n/useTranslations';
import { usePlaylistsStore } from '../stores/context';
import type { NavidromePlaylistRemoveParams } from '../types';

export default function usePlaylist() {
  const t = useNavidromeTranslations();
  const locale = useLocale();
  const { cache, mutate } = useSWRConfig();
  const remove = usePlaylistsStore((state) => state.remove);
  const list = usePlaylistsStore((state) => state.list);
  const submitting = useRef(false);
  const [deleting, setDeleting] = useState(false);
  const messageBox = useMessageBox();
  const toast = useToast();

  async function deletePlaylist(id: string, name: string, onDeleted: () => void) {
    if (submitting.current) {
      return;
    }

    submitting.current = true;

    try {
      const confirmed = await messageBox.confirm({
        title: t('playlist.delete'),
        content: t('playlist.deleteConfirm', { name }),
        confirm: t('playlist.confirm'),
        cancel: null,
      });

      if (!confirmed) {
        return;
      }

      setDeleting(true);
      const params: NavidromePlaylistRemoveParams = { id };

      await pluginRequest(pluginPath('navidrome', '/api/playlist/remove'), params);

      remove(id);
      onDeleted();
      toast.add({ type: 'success', title: t('playlist.deleted') });
      try {
        const aggregates = new Set<string>();

        await mutate(
          (key: unknown) => {
            if (!Array.isArray(key) || key[0] !== pluginPath('navidrome', '/api/list')) {
              return false;
            }

            const params: unknown = key[2];

            if (
              !params ||
              typeof params !== 'object' ||
              !(
                ('id' in params && params.id === id && 'kind' in params && params.kind === 'playlist') ||
                (!('id' in params) && 'section' in params && params.section === 'playlists')
              )
            ) {
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
        await Promise.all([...aggregates].map((key) => mutate(key, undefined, { revalidate: false })));
        await list(locale);
      } catch {
        toast.add({ type: 'warning', title: t('library.refreshFailed') });
      }
    } catch (cause) {
      toast.add({
        type: 'error',
        title: cause instanceof Error && cause.message ? cause.message : t('playlist.deleteFailed'),
      });
    } finally {
      submitting.current = false;
      setDeleting(false);
    }
  }

  return { deletePlaylist, deleting };
}
