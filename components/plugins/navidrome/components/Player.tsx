'use client';

import { useCallback } from 'react';
import { useLocale } from 'next-intl';
import { ListMusic, Pause, Play, Repeat1, ListOrdered, Shuffle, SkipBack, SkipForward } from 'lucide-react';
import { WindowFooter } from '@/components/common/WindowModal';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { pluginPath } from '@/lib/plugins/client';
import { usePlaybackStore } from '../stores/context';
import { getTranslator } from '../i18n';
import Cover from './Cover';
import ProgressControl from './ProgressControl';
import VolumeControl from './VolumeControl';

export default function Player() {
  const locale = useLocale();
  const t = getTranslator(locale);
  const {
    queue,
    index,
    playback,
    mode,
    playing,
    time,
    duration: length,
    volume,
    muted,
    error,
    attachAudio,
    toggle,
    seek,
    setVolume,
    toggleMute,
    changeMode: onModeChange,
    next: onNext,
    previous: onPrevious,
  } = usePlaybackStore((state) => state);
  const ModeIcon = mode === 'shuffle' ? Shuffle : mode === 'repeatOne' ? Repeat1 : ListOrdered;
  const song = queue[index];
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
        <div className="flex min-w-0 items-center gap-3 max-[700px]:flex-col max-[700px]:items-stretch max-[700px]:gap-0.5">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 text-left max-[700px]:gap-1.5">
            <span className="flex size-[38px] shrink-0 scale-120 items-center justify-center rounded-full bg-white/8 p-1">
              {song ? (
                <Cover key={song.coverArt ?? song.id} item={song} className="rounded-full" />
              ) : (
                <ListMusic className="size-full opacity-40" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-xs font-medium">
                {song ? song.name || t('common.unnamed') : t('player.chooseSong')}
              </strong>
              <span
                className="mt-[3px] block truncate text-[10px] text-[#fff8f1]/55"
                role={error ? 'alert' : undefined}
              >
                {error ? t(`player.${error}`) : song?.artist || t('player.idle')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 max-[700px]:gap-0">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-full bg-transparent hover:bg-transparent hover:text-inherit max-[700px]:h-8 max-[700px]:w-7 dark:hover:bg-transparent"
                />
              }
              aria-label={t(`player.${mode}`)}
              onClick={onModeChange}
            >
              <ModeIcon className="size-4" />
            </TooltipTrigger>
            <TooltipContent>{t(`player.${mode}`)}</TooltipContent>
          </Tooltip>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-transparent hover:bg-white/15 hover:text-inherit max-[700px]:h-8 max-[700px]:w-7 dark:hover:bg-white/15"
            aria-label={t('player.previous')}
            disabled={!song}
            onClick={onPrevious}
          >
            <SkipBack className="size-4" fill="currentColor" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-11 rounded-full bg-white/8 shadow-[0_4px_10px_rgb(0_0_0/35%),0_8px_20px_rgb(0_0_0/25%),inset_0_1px_0_rgb(255_255_255/15%)] hover:bg-white/15 hover:text-inherit dark:hover:bg-white/15"
            aria-label={t(playing ? 'player.pause' : 'player.play')}
            disabled={!song}
            onClick={toggle}
          >
            {playing ? (
              <Pause className="size-6" fill="currentColor" />
            ) : (
              <Play className="size-6" fill="currentColor" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-transparent hover:bg-white/15 hover:text-inherit max-[700px]:h-8 max-[700px]:w-7 dark:hover:bg-white/15"
            aria-label={t('player.next')}
            disabled={!song}
            onClick={onNext}
          >
            <SkipForward className="size-4" fill="currentColor" />
          </Button>
          <VolumeControl volume={volume} muted={muted} onToggleMute={toggleMute} onChange={setVolume} />
        </div>
        <ProgressControl key={`${src}-${playback}`} time={time} length={length} disabled={!song} onSeek={seek} />
      </div>
    </WindowFooter>
  );
}
