import { memo } from 'react';
import { Heart, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MusicItem } from '../../types';
import { useNavidromeTranslations } from '../../i18n/useTranslations';
import duration from '../../utils/duration';
import Cover from '../Cover';
import SongActions from './SongActions';

type SongRowProps = {
  song: MusicItem;
  songKey: string;
  index: number;
  active: boolean;
  selected: boolean;
  playing: boolean;
  unavailable: boolean;
  starring: boolean;
  onSelect: (key: string) => void;
  onPlay: (index: number) => void;
  onToggle: () => void;
  onStar: (song: MusicItem) => void;
};

function SongRow({
  song,
  songKey,
  index,
  active,
  selected,
  playing,
  unavailable,
  starring,
  onSelect,
  onPlay,
  onToggle,
  onStar,
}: SongRowProps) {
  const t = useNavidromeTranslations();
  const name = song.name || t('common.unnamed');

  return (
    <div
      style={{ top: index * 64 }}
      className="group/song absolute inset-x-0 flex h-16 min-w-0 items-center gap-3 rounded-lg border-b border-white/5 px-2.5 py-2 transition-colors duration-200 select-none focus-within:bg-white/10 focus-within:text-white hover:bg-white/10 hover:text-white data-[active=true]:bg-white/15 data-[active=true]:text-white data-[selected=true]:bg-white/15 data-[selected=true]:text-white data-[unavailable=true]:opacity-45 motion-reduce:transition-none @max-[560px]/music-window:gap-[5px] @max-[560px]/music-window:px-0"
      data-active={active}
      data-selected={selected}
      data-unavailable={unavailable}
      title={unavailable ? t('player.unavailable') : undefined}
      aria-current={active ? 'true' : undefined}
      onClick={() => onSelect(songKey)}
      onDoubleClick={() => {
        if (!unavailable) {
          onPlay(index);
        }
      }}
    >
      <button
        className="grid w-6 shrink-0 cursor-pointer place-items-center text-[11px] text-[#fff8f1]/38 group-data-[active=true]/song:text-white/85 [&>*]:col-start-1 [&>*]:row-start-1 group-focus-within/song:[&>span]:opacity-0 group-hover/song:[&>span]:opacity-0 group-data-[active=true]/song:[&>span]:opacity-0 [&>svg]:opacity-0 group-focus-within/song:[&>svg]:opacity-100 group-hover/song:[&>svg]:opacity-100 group-data-[active=true]/song:[&>svg]:opacity-100"
        disabled={unavailable}
        aria-label={t(active && playing ? 'player.pauseSong' : 'player.playSong', {
          name,
        })}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(songKey);
          if (active) {
            onToggle();
          } else {
            onPlay(index);
          }
        }}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <span>{String(index + 1).padStart(2, '0')}</span>
        {active && playing ? (
          <Pause aria-hidden size={14} fill="currentColor" />
        ) : (
          <Play aria-hidden size={14} fill="currentColor" />
        )}
      </button>
      <button
        disabled={unavailable}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left [&_span_span]:mt-[3px] [&_span_span]:block [&_span_span]:truncate [&_span_span]:text-[11px] [&_span_span]:text-[#fff8f1]/45 group-data-[active=true]/song:[&_span_span]:text-white/65 [&_strong]:block [&_strong]:truncate [&_strong]:text-[13px] [&_strong]:font-medium [&>span:last-child]:min-w-0"
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onSelect(songKey);
            onPlay(index);
          }
        }}
      >
        <Cover key={song.coverArt ?? song.id} item={song} className="size-[42px] shrink-0 rounded-md" />
        <span>
          <strong>{name}</strong>
          <span>{song.artist ?? t('common.unknownArtist')}</span>
        </span>
      </button>
      {unavailable ? <span className="shrink-0 text-[10px] text-rose-200">{t('player.unavailable')}</span> : null}
      <span className="w-[23%] truncate text-[11px] text-[#fff8f1]/40 group-data-[active=true]/song:text-white/65 @max-[560px]/music-window:hidden">
        {song.album}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="bg-transparent!"
        aria-label={t(song.starred ? 'library.unstar' : 'library.star', { name })}
        aria-pressed={Boolean(song.starred)}
        disabled={starring}
        onClick={(event) => {
          event.stopPropagation();
          onStar(song);
        }}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <Heart size={16} fill={song.starred ? 'currentColor' : 'none'} />
      </Button>
      <span className="w-9 text-right text-[11px] tabular-nums">{duration(song.duration)}</span>
      <SongActions song={song} starring={starring} onStar={() => onStar(song)} />
    </div>
  );
}

export default memo(SongRow);
