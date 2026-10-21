import { useNavidromeTranslations } from '../../i18n/useTranslations';
import duration from '../../utils/duration';
import PlaybackSlider from './PlaybackSlider';

type ProgressControlProps = {
  time: number;
  length: number;
  disabled: boolean;
  onSeek: (time: number) => void;
};

export default function ProgressControl({ time, length, disabled, onSeek }: ProgressControlProps) {
  const t = useNavidromeTranslations();
  const total = Number.isFinite(length) ? Math.max(0, length) : 0;

  return (
    <div className="flex w-[min(160px,100%)] items-center gap-2 justify-self-end text-[9px] text-[#fff8f1]/50 tabular-nums [&>span]:transition-colors [&>span]:duration-200 has-[[data-playback-slider]:focus-within]:[&>span]:text-white has-[[data-playback-slider]:hover]:[&>span]:text-white motion-reduce:[&>span]:transition-none">
      <span>{duration(time)}</span>
      <PlaybackSlider
        label={t('player.progress')}
        value={Math.min(time, total)}
        max={total}
        step={0.01}
        disabled={disabled || !total}
        formatValue={(value) => `${duration(value)} / ${duration(total)}`}
        onCommit={onSeek}
      />
      <span>{duration(total)}</span>
    </div>
  );
}
