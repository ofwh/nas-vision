import { useRef } from 'react';
import { useLocale } from 'next-intl';
import { useSWRConfig } from 'swr';
import { unstable_serialize as serializeInfinite } from 'swr/infinite';
import { pluginPath, pluginRequest } from '@/lib/plugins/client';
import { useMessageBox } from '@/hooks/useMessageBox';
import { useToast } from '@/hooks/useToast';
import { useNavidromeTranslations } from '../i18n/useTranslations';
import { usePlaylistsStore } from '../stores/context';
import type { NavidromePlaylistRemoveParams } from '../types';

export default function useDeletePlaylist() {
  const t = useNavidromeTranslations();
  const locale = useLocale();
  const { cache, mutate } = useSWRConfig();
  const remove = usePlaylistsStore((state) => state.remove);
  const list = usePlaylistsStore((state) => state.list);
  const submitting = useRef(false);
  const messageBox = useMessageBox();
  const toast = useToast();

  async function deletePlaylist(id: string, name: string, onDeleted: () => void) {
    if (submitting.current) {
      return;
    }

    submitting.current = true;
    let toastId: string | undefined;

    try {
      const confirmed = await messageBox.confirm({
        title: t('playlist.delete'),
        description: t('playlist.deleteConfirm', { name }),
        confirmText: t('playlist.confirm'),
        cancelText: t('playlist.cancel'),
      });

      if (!confirmed) {
        return;
      }

      toastId = toast.add({ type: 'loading', title: t('playlist.deleting'), timeout: 0 });
      const params: NavidromePlaylistRemoveParams = { id };

      await pluginRequest(pluginPath('navidrome', '/api/playlist/remove'), params);

      remove(id);
      onDeleted();
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
      toast.update(toastId, { type: 'success', title: t('playlist.deleted'), timeout: 5000 });
    } catch (cause) {
      const options = {
        type: 'error',
        title: cause instanceof Error && cause.message ? cause.message : t('playlist.deleteFailed'),
        timeout: 5000,
      };

      if (toastId) {
        toast.update(toastId, options);
      } else {
        toast.add(options);
      }
    } finally {
      submitting.current = false;
    }
  }

  return deletePlaylist;
}
