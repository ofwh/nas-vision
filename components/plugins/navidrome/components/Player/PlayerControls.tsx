import { Pause, Play, Repeat1, ListOrdered, Shuffle, SkipBack, SkipForward } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePlaybackStore } from '../../stores/context';
import { useNavidromeTranslations } from '../../i18n/useTranslations';
import VolumeControl from './VolumeControl';

export default function PlayerControls() {
  const t = useNavidromeTranslations();
  const { song, mode, playing, volume, muted, toggle, setVolume, toggleMute, onModeChange, onNext, onPrevious } =
    usePlaybackStore(
      useShallow((state) => ({
        song: state.queue[state.index],
        mode: state.mode,
        playing: state.playing,
        volume: state.volume,
        muted: state.muted,
        toggle: state.toggle,
        setVolume: state.setVolume,
        toggleMute: state.toggleMute,
        onModeChange: state.changeMode,
        onNext: state.next,
        onPrevious: state.previous,
      })),
    );
  const ModeIcon = mode === 'shuffle' ? Shuffle : mode === 'repeatOne' ? Repeat1 : ListOrdered;

  return (
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
        className="rounded-full bg-transparent hover:text-inherit max-[700px]:h-8 max-[700px]:w-7"
        aria-label={t('player.previous')}
        disabled={!song}
        onClick={onPrevious}
      >
        <SkipBack className="size-4" fill="currentColor" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-11 rounded-full bg-white/8 shadow-[0_4px_10px_rgb(0_0_0/35%),0_8px_20px_rgb(0_0_0/25%),inset_0_1px_0_rgb(255_255_255/15%)] hover:text-inherit"
        aria-label={t(playing ? 'player.pause' : 'player.play')}
        disabled={!song}
        onClick={toggle}
      >
        {playing ? <Pause className="size-6" fill="currentColor" /> : <Play className="size-6" fill="currentColor" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full bg-transparent hover:text-inherit max-[700px]:h-8 max-[700px]:w-7"
        aria-label={t('player.next')}
        disabled={!song}
        onClick={onNext}
      >
        <SkipForward className="size-4" fill="currentColor" />
      </Button>
      <VolumeControl volume={volume} muted={muted} onToggleMute={toggleMute} onChange={setVolume} />
    </div>
  );
}
