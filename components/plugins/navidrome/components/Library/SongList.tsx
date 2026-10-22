import { useState } from 'react';
import { Heart, Pause, Play } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '@/components/ui/button';
import type { MusicItem } from '../../types';
import { useNavidromeTranslations } from '../../i18n/useTranslations';
import { usePlaybackStore } from '../../stores/context';
import { songKeys } from '../../utils/playback';
import duration from '../../utils/duration';
import Cover from '../Cover';
import SongActions from './SongActions';

type SongListProps = {
  songs: MusicItem[];
  isQueue: boolean;
  source: string;
  starringId: string | null;
  onPlay: (index: number) => void;
  onStar: (song: MusicItem) => void;
};

export default function SongList({ songs, isQueue, source, starringId, onPlay, onStar }: SongListProps) {
  const t = useNavidromeTranslations();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const playback = usePlaybackStore(
    useShallow((state) => ({
      queue: state.queue,
      index: state.index,
      source: state.source,
      playing: state.playing,
      toggle: state.toggle,
    })),
  );
  const currentKey = isQueue || playback.source === source ? songKeys(playback.queue)[playback.index] : undefined;
  const keys = songKeys(songs);
  const songRows = songs.map((song, index) => ({ song, name: song.name || t('common.unnamed'), key: keys[index] }));

  return (
    <div className="mt-[5px] peer-data-[navidrome-grid]/grid:mt-[30px]">
      <div className="mb-3 flex items-center justify-between text-xs text-[#fff8f1]/60">
        <span>
          {t(isQueue ? 'player.upNext' : 'sections.songs')} · {songs.length}
        </span>
      </div>
      <div>
        {songRows.map(({ song, name, key }, songIndex) => (
          <div
            key={key}
            className="group/song flex min-h-16 min-w-0 items-center gap-3 rounded-lg border-b border-white/5 px-2.5 py-2 transition-colors duration-200 select-none focus-within:bg-white/10 focus-within:text-white hover:bg-white/10 hover:text-white data-[active=true]:bg-white/15 data-[active=true]:text-white data-[selected=true]:bg-white/15 data-[selected=true]:text-white motion-reduce:transition-none @max-[560px]/music-window:gap-[5px] @max-[560px]/music-window:px-0"
            data-active={currentKey === key}
            data-selected={selectedKey === key}
            aria-current={currentKey === key ? 'true' : undefined}
            onClick={() => setSelectedKey(key)}
            onDoubleClick={() => onPlay(songIndex)}
          >
            <button
              className="grid w-6 shrink-0 cursor-pointer place-items-center text-[11px] text-[#fff8f1]/38 group-data-[active=true]/song:text-white/85 [&>*]:col-start-1 [&>*]:row-start-1 group-focus-within/song:[&>span]:opacity-0 group-hover/song:[&>span]:opacity-0 group-data-[active=true]/song:[&>span]:opacity-0 [&>svg]:opacity-0 group-focus-within/song:[&>svg]:opacity-100 group-hover/song:[&>svg]:opacity-100 group-data-[active=true]/song:[&>svg]:opacity-100"
              aria-label={t(currentKey === key && playback.playing ? 'player.pauseSong' : 'player.playSong', { name })}
              onClick={(event) => {
                event.stopPropagation();
                setSelectedKey(key);
                if (currentKey === key) {
                  playback.toggle();
                } else {
                  onPlay(songIndex);
                }
              }}
              onDoubleClick={(event) => event.stopPropagation()}
            >
              <span>{String(songIndex + 1).padStart(2, '0')}</span>
              {currentKey === key && playback.playing ? (
                <Pause aria-hidden size={14} fill="currentColor" />
              ) : (
                <Play aria-hidden size={14} fill="currentColor" />
              )}
            </button>
            <button
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left [&_span_span]:mt-[3px] [&_span_span]:block [&_span_span]:truncate [&_span_span]:text-[11px] [&_span_span]:text-[#fff8f1]/45 group-data-[active=true]/song:[&_span_span]:text-white/65 [&_strong]:block [&_strong]:truncate [&_strong]:text-[13px] [&_strong]:font-medium [&>span:last-child]:min-w-0"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  setSelectedKey(key);
                  onPlay(songIndex);
                }
              }}
            >
              <Cover key={song.coverArt ?? song.id} item={song} className="size-[42px] shrink-0 rounded-md" />
              <span>
                <strong>{name}</strong>
                <span>{song.artist ?? t('common.unknownArtist')}</span>
              </span>
            </button>
            <span className="w-[23%] truncate text-[11px] text-[#fff8f1]/40 group-data-[active=true]/song:text-white/65 @max-[560px]/music-window:hidden">
              {song.album}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="bg-transparent!"
              aria-label={t(song.starred ? 'library.unstar' : 'library.star', { name })}
              aria-pressed={Boolean(song.starred)}
              disabled={starringId !== null}
              onClick={(event) => {
                event.stopPropagation();
                onStar(song);
              }}
              onDoubleClick={(event) => event.stopPropagation()}
            >
              <Heart size={16} fill={song.starred ? 'currentColor' : 'none'} />
            </Button>
            <span className="w-9 text-right text-[11px] tabular-nums">{duration(song.duration)}</span>
            <SongActions song={song} starring={starringId !== null} onStar={() => onStar(song)} />
          </div>
        ))}
      </div>
    </div>
  );
}
