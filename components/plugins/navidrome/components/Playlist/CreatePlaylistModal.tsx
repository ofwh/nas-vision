'use client';

import { useId, useRef, useState, type SubmitEvent } from 'react';
import { Loader } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { WindowModal } from '@/components/common/WindowModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { pluginPath, pluginRequest } from '@/lib/plugins/client';
import type { MusicItem, NavidromePlaylistSaveParams } from '../../types';
import { useNavidromeTranslations } from '../../i18n/useTranslations';

type CreatePlaylistModalProps = {
  onClose: () => void;
  onCreated: (playlist: MusicItem) => void;
};

export default function CreatePlaylistModal({ onClose, onCreated }: CreatePlaylistModalProps) {
  const t = useNavidromeTranslations();
  const formId = useId();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const created = useRef<MusicItem | null>(null);
  const [pending, setPending] = useState(false);
  const toast = useToast();

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }

    if (!name.trim() || name.trim().length > 200) {
      toast.add({ type: 'error', title: t('errors.PLAYLIST_NAME_INVALID') });

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
      toast.add({ type: 'error', title: error instanceof Error ? error.message : t('playlist.createFailed') });
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
              className="h-12 w-full rounded-none border-0 px-4 shadow-none focus-visible:border-transparent focus-visible:bg-white/5! focus-visible:ring-0"
              value={name}
              maxLength={200}
              onChange={(event) => setName(event.target.value)}
            />
            <Textarea
              aria-label={t('playlist.description')}
              placeholder={t('playlist.description')}
              className="min-h-24 resize-none rounded-none border-0 px-4 py-3 shadow-none focus-visible:border-transparent focus-visible:bg-white/5! focus-visible:ring-0"
              value={description}
              maxLength={2000}
              onChange={(event) => setDescription(event.target.value)}
            />
            <div className="flex h-12 items-center justify-between gap-4 px-4">
              <label htmlFor={`${formId}-public`} className="cursor-pointer text-sm">
                {t('playlist.public')}
              </label>
              <Switch id={`${formId}-public`} checked={isPublic} onCheckedChange={setIsPublic} disabled={pending} />
            </div>
          </fieldset>
          <LiquidGlass className="w-full rounded-full" contentClassName="h-full">
            <Button
              type="submit"
              variant="ghost"
              disabled={pending}
              className="h-10 w-full justify-center rounded-full text-white"
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
