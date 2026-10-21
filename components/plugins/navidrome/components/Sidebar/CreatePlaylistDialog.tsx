'use client';

import { useId, useRef, useState, type SubmitEvent } from 'react';
import { useLocale } from 'next-intl';
import { Loader } from 'lucide-react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { WindowModal } from '@/components/common/WindowModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { pluginPath, pluginRequest } from '@/lib/plugins/client';
import type { MusicItem, NavidromePlaylistSaveParams } from '../../types';
import { getTranslator } from '../../i18n';

type CreatePlaylistDialogProps = {
  onClose: () => void;
  onCreated: (playlist: MusicItem) => void;
};

export default function CreatePlaylistDialog({ onClose, onCreated }: CreatePlaylistDialogProps) {
  const t = getTranslator(useLocale());
  const formId = useId();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const created = useRef<MusicItem | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }

    setError(null);
    if (!name.trim() || name.trim().length > 200) {
      setError(t('errors.PLAYLIST_NAME_INVALID'));

      return;
    }

    setPending(true);
    try {
      const endpoint = pluginPath('navidrome', '/api/playlist/save');

      if (!created.current) {
        const result = await pluginRequest<MusicItem>(endpoint, { name: name.trim() });

        created.current = result.data;
      }

      const params: NavidromePlaylistSaveParams = {
        id: created.current.id,
        name: name.trim(),
        description: description.trim(),
        public: isPublic,
      };
      const result = await pluginRequest<MusicItem>(endpoint, params);

      onCreated({ ...created.current, ...result.data });
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : t('playlist.createFailed'));
    } finally {
      setPending(false);
    }
  }

  return (
    <WindowModal
      open
      title={t('playlist.create')}
      mode="floating"
      fit
      size={{ width: 440 }}
      style={{ maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100dvh - 32px)' }}
      onOpenChange={(open) => {
        if (!open && !pending) {
          onClose();
        }
      }}
    >
      <div className="flex shrink-0 flex-col bg-[#545458]/25 px-4 pt-20 pb-4">
        <form id={formId} noValidate onSubmit={submit} aria-busy={pending} className="flex flex-col gap-4 text-white">
          <fieldset
            disabled={pending}
            aria-label={t('playlist.create')}
            className="min-w-0 shrink-0 divide-y divide-white/15 overflow-hidden rounded-2xl bg-white/8"
          >
            <Input
              aria-label={t('playlist.name')}
              placeholder={t('playlist.name')}
              className="h-12 w-full rounded-none border-0 bg-transparent px-4 text-white shadow-none placeholder:text-white/50 focus-visible:border-transparent focus-visible:bg-white/5 focus-visible:ring-0 dark:bg-transparent"
              value={name}
              maxLength={200}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${formId}-error` : undefined}
              onChange={(event) => setName(event.target.value)}
            />
            <Textarea
              aria-label={t('playlist.description')}
              placeholder={t('playlist.description')}
              className="min-h-24 resize-none rounded-none border-0 bg-transparent px-4 py-3 text-white shadow-none placeholder:text-white/50 focus-visible:border-transparent focus-visible:bg-white/5 focus-visible:ring-0 dark:bg-transparent"
              value={description}
              maxLength={2000}
              onChange={(event) => setDescription(event.target.value)}
            />
            <div className="flex h-12 items-center justify-between gap-4 px-4">
              <label htmlFor={`${formId}-public`} className="cursor-pointer text-sm">
                {t('playlist.public')}
              </label>
              <Switch
                id={`${formId}-public`}
                checked={isPublic}
                onCheckedChange={setIsPublic}
                disabled={pending}
                className="data-unchecked:bg-white/20 dark:data-unchecked:bg-white/20"
              />
            </div>
          </fieldset>
          {error ? (
            <p id={`${formId}-error`} role="alert" className="px-4 text-center text-sm leading-5 text-red-200">
              {error}
            </p>
          ) : null}
          <LiquidGlass className="w-full rounded-full" contentClassName="h-full">
            <Button
              type="submit"
              variant="ghost"
              disabled={pending}
              className="h-10 w-full justify-center rounded-full text-white hover:bg-white/15 hover:text-white"
            >
              {pending ? <Loader aria-hidden className="size-5 animate-spin" /> : null}
              {t(pending ? 'playlist.creating' : 'playlist.create')}
            </Button>
          </LiquidGlass>
        </form>
      </div>
    </WindowModal>
  );
}
