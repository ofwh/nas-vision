'use client';

import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { WindowFooter } from '@/components/common/WindowModal';
import { pluginPath } from '@/lib/plugins/client';
import { usePlaybackStore } from '../../stores/context';
import ProgressControl from './ProgressControl';
import PlayerInfo from './PlayerInfo';
import PlayerControls from './PlayerControls';

export default function PlayerFooter() {
  const {
    song,
    playback,
    mode,
    time,
    duration: length,
    attachAudio,
    seek,
  } = usePlaybackStore(
    useShallow((state) => ({
      song: state.queue[state.index],
      playback: state.playback,
      mode: state.mode,
      time: state.time,
      duration: state.duration,
      attachAudio: state.attachAudio,
      seek: state.seek,
    })),
  );
  const src = song ? `${pluginPath('navidrome', '/api/stream')}?id=${encodeURIComponent(song.id)}` : undefined;

  const audioRef = useCallback(
    (element: HTMLAudioElement | null) => {
      if (element) {
        return attachAudio(element, src, playback);
      }
    },
    [attachAudio, src, playback],
  );

  return (
    <WindowFooter>
      <div className="grid w-[min(640px,calc(92vw-40px))] min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 py-1 pr-3 pl-2 text-[#fff8f1] max-[700px]:gap-[5px]">
        <audio key={playback} ref={audioRef} preload="metadata" loop={mode === 'repeatOne'} />
        <PlayerInfo />
        <PlayerControls />
        <ProgressControl key={`${src}-${playback}`} time={time} length={length} disabled={!song} onSeek={seek} />
      </div>
    </WindowFooter>
  );
}
