import { useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { useSWRConfig } from 'swr';
import { unstable_serialize as serializeInfinite } from 'swr/infinite';
import { Loader } from 'lucide-react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { WindowModal } from '@/components/common/WindowModal';
import { Button } from '@/components/ui/button';
import { pluginPath, pluginRequest } from '@/lib/plugins/client';
import { useNavidromeTranslations } from '../../i18n/useTranslations';
import { usePlaylistsStore } from '../../stores/context';
import type { NavidromePlaylistRemoveParams } from '../../types';

type DeletePlaylistModalProps = {
  id: string;
  name: string;
  onClose: () => void;
  onDeleted: () => void;
};

export default function DeletePlaylistModal({ id, name, onClose, onDeleted }: DeletePlaylistModalProps) {
  const t = useNavidromeTranslations();
  const locale = useLocale();
  const { cache, mutate } = useSWRConfig();
  const remove = usePlaylistsStore((state) => state.remove);
  const list = usePlaylistsStore((state) => state.list);
  const submitting = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function confirm() {
    if (submitting.current) {
      return;
    }

    submitting.current = true;
    setPending(true);
    setError(null);
    try {
      const params: NavidromePlaylistRemoveParams = { id };

      await pluginRequest(pluginPath('navidrome', '/api/playlist/remove'), params);
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error());
      submitting.current = false;
      setPending(false);

      return;
    }

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
  }

  return (
    <WindowModal
      open
      title={t('playlist.delete')}
      mode="floating"
      fit
      size={{ width: 360 }}
      style={{ maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100dvh - 32px)' }}
      onOpenChange={(open) => {
        if (!open && !submitting.current) {
          onClose();
        }
      }}
    >
      <div className="flex shrink-0 flex-col bg-[#545458]/25 px-4 pt-20 pb-4">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void confirm();
          }}
          aria-busy={pending}
          className="flex flex-col gap-4 text-white"
        >
          <fieldset disabled={pending} aria-label={t('playlist.delete')} className="min-w-0 shrink-0">
            <p className="px-4 py-3 text-center text-sm leading-6 wrap-break-word">
              {t('playlist.deleteConfirm', { name })}
            </p>
          </fieldset>
          {error ? (
            <p role="alert" className="px-4 text-center text-sm leading-5 text-red-200">
              {error.message || t('playlist.deleteFailed')}
            </p>
          ) : null}
          <div className="flex flex-col gap-2">
            <LiquidGlass className="w-full rounded-full" contentClassName="h-full">
              <Button
                type="submit"
                variant="ghost"
                disabled={pending}
                className="h-10 w-full justify-center rounded-full text-white hover:bg-white/15 hover:text-white"
              >
                {pending ? <Loader aria-hidden className="size-5 animate-spin" /> : null}
                {t('playlist.confirm')}
              </Button>
            </LiquidGlass>
            <LiquidGlass className="w-full rounded-full" contentClassName="h-full">
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={onClose}
                className="h-10 w-full justify-center rounded-full text-white hover:bg-white/15 hover:text-white"
              >
                {t('playlist.cancel')}
              </Button>
            </LiquidGlass>
          </div>
        </form>
      </div>
    </WindowModal>
  );
}
