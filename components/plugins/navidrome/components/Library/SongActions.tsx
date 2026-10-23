import { useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { useSWRConfig } from 'swr';
import { unstable_serialize as serializeInfinite } from 'swr/infinite';
import { Ellipsis, Heart, ListPlus, Loader } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { pluginPath, pluginRequest } from '@/lib/plugins/client';
import type { MusicItem } from '../../types';
import { useNavidromeTranslations } from '../../i18n/useTranslations';
import { usePlaylistsStore } from '../../stores/context';
import useMusicList from '../../hooks/useMusicList';

type SongActionsProps = {
  song: MusicItem;
  starring: boolean;
  onStar: () => void;
};

function PlaylistSongMenuItem({
  playlist,
  songId,
  open,
  added,
  adding,
  pending,
  onChange,
}: {
  playlist: MusicItem;
  songId: string;
  open: boolean;
  added: boolean | undefined;
  adding: boolean;
  pending: boolean;
  onChange: (added: boolean) => void;
}) {
  const locale = useLocale();
  const t = useNavidromeTranslations();
  const listing = useMusicList({ section: 'playlists', kind: 'playlist', id: playlist.id }, locale, open);
  const checked = added ?? listing.items.some((item) => item.id === songId);

  return (
    <DropdownMenuCheckboxItem
      checked={checked}
      aria-busy={pending}
      disabled={adding || listing.isLoading || Boolean(listing.error)}
      closeOnClick={false}
      onCheckedChange={(value) => {
        if (value !== checked) {
          onChange(value);
        }
      }}
    >
      <span className="max-w-56 truncate">{playlist.name || t('common.unnamed')}</span>
      {pending ? <Loader aria-hidden className="size-4 animate-spin" /> : null}
    </DropdownMenuCheckboxItem>
  );
}

export default function SongActions({ song, starring, onStar }: SongActionsProps) {
  const locale = useLocale();
  const t = useNavidromeTranslations();
  const playlists = usePlaylistsStore((state) => state);
  const { cache, mutate } = useSWRConfig();
  const [pendingPlaylistId, setPendingPlaylistId] = useState<string | null>(null);
  const submitting = useRef(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [membership, setMembership] = useState<Partial<Record<string, boolean>>>({});
  const toast = useToast();

  async function updatePlaylist(id: string, added: boolean) {
    if (submitting.current) {
      return;
    }

    submitting.current = true;
    setPendingPlaylistId(id);

    try {
      try {
        await pluginRequest(pluginPath('navidrome', added ? '/api/playlist/add-song' : '/api/playlist/remove-song'), {
          id,
          songId: song.id,
        });
      } catch (error) {
        if (added) {
          toast.add({
            type: 'error',
            title: error instanceof Error ? error.message : t('songActions.addFailed'),
          });
        }

        return;
      }
      setMembership((current) => ({ ...current, [id]: added }));
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
      await playlists.list(locale);
    } catch {
      if (added) {
        toast.add({ type: 'warning', title: t('library.refreshFailed') });
      }
    } finally {
      submitting.current = false;
      setPendingPlaylistId(null);
    }
  }

  return (
    <div onClick={(event) => event.stopPropagation()} onDoubleClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-white/60 hover:bg-white/10 hover:text-white aria-expanded:bg-white/15 aria-expanded:text-white dark:hover:bg-white/10"
              aria-label={t('songActions.more', { name: song.name || t('common.unnamed') })}
            />
          }
        >
          <Ellipsis aria-hidden className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem disabled={starring} onClick={onStar}>
            <Heart aria-hidden fill={song.starred ? 'currentColor' : 'none'} />
            {t(song.starred ? 'songActions.unstar' : 'songActions.star')}
          </DropdownMenuItem>
          <DropdownMenuSub onOpenChange={setSubmenuOpen}>
            <DropdownMenuSubTrigger>
              <ListPlus aria-hidden />
              {t('songActions.addToPlaylist')}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="min-w-44">
              {playlists.items.map((playlist) => (
                <PlaylistSongMenuItem
                  key={playlist.id}
                  playlist={playlist}
                  songId={song.id}
                  open={submenuOpen}
                  added={membership[playlist.id]}
                  adding={pendingPlaylistId !== null}
                  pending={pendingPlaylistId === playlist.id}
                  onChange={(added) => void updatePlaylist(playlist.id, added)}
                />
              ))}
              {!playlists.items.length ? (
                <DropdownMenuItem disabled>{t('songActions.noPlaylists')}</DropdownMenuItem>
              ) : null}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
