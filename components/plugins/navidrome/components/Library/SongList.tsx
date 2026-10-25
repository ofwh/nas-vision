import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { MusicItem } from '../../types';
import { useNavidromeTranslations } from '../../i18n/useTranslations';
import { usePlaybackStore } from '../../stores/context';
import { songKeys } from '../../utils/playback';
import useVirtualRows from '../../hooks/useVirtualRows';
import SongRow from './SongRow';

type SongListProps = {
  songs: MusicItem[];
  isQueue: boolean;
  source: string;
  starringId: string | null;
  onPlay: (index: number) => void;
  onStar: (song: MusicItem) => void;
};

type SongSelection = { key: string; playback: number };

const songLayout = () => ({ columns: 1, rowHeight: 64 });

export default function SongList({ songs, isQueue, source, starringId, onPlay, onStar }: SongListProps) {
  const t = useNavidromeTranslations();
  const [selection, setSelection] = useState<SongSelection | null>(null);
  const skippedScroll = useRef<{ selection: SongSelection | null; playback: number | null }>({
    selection: null,
    playback: null,
  });
  const { setContainer, rows, height, scrollToIndex } = useVirtualRows(songs.length, songLayout);
  const playback = usePlaybackStore(
    useShallow((state) => ({
      queue: state.queue,
      unavailable: state.unavailable,
      playback: state.playback,
      index: state.index,
      source: state.source,
      playing: state.playing,
      toggle: state.toggle,
    })),
  );
  const queueKeys = useMemo(() => songKeys(playback.queue), [playback.queue]);
  const currentKey = isQueue || playback.source === source ? queueKeys[playback.index] : undefined;
  const keys = useMemo(() => songKeys(songs), [songs]);
  const currentIndex = useMemo(() => (currentKey === undefined ? -1 : keys.indexOf(currentKey)), [currentKey, keys]);

  const select = useCallback(
    (key: string) => {
      setSelection({ key, playback: playback.playback });
    },
    [playback.playback],
  );

  useEffect(() => {
    if (selection?.playback === playback.playback) {
      return;
    }

    if (selection && skippedScroll.current.selection !== selection) {
      skippedScroll.current = { selection, playback: playback.playback };
    }

    if (skippedScroll.current.playback !== playback.playback) {
      scrollToIndex(currentIndex);
    }
  }, [currentIndex, playback.playback, scrollToIndex, selection]);

  return (
    <div className="mt-[5px] peer-data-[navidrome-grid]/grid:mt-[30px]">
      <div className="mb-3 flex items-center justify-between text-xs text-[#fff8f1]/60">
        <span>
          {t(isQueue ? 'player.upNext' : 'sections.songs')} · {songs.length}
        </span>
      </div>
      <div ref={setContainer} className="relative" style={{ height }}>
        {rows.map((songIndex) => {
          const song = songs[songIndex];
          const key = keys[songIndex];

          return (
            <SongRow
              key={key}
              song={song}
              songKey={key}
              index={songIndex}
              active={currentKey === key}
              selected={selection?.playback === playback.playback && selection.key === key}
              playing={currentKey === key && playback.playing}
              unavailable={playback.unavailable.has(song.id)}
              starring={starringId !== null}
              onSelect={select}
              onPlay={onPlay}
              onToggle={playback.toggle}
              onStar={onStar}
            />
          );
        })}
      </div>
    </div>
  );
}
