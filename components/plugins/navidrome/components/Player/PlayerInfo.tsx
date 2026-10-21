import { ListMusic } from 'lucide-react';
import { usePlaybackStore } from '../../stores/context';
import { useNavidromeTranslations } from '../../i18n/useTranslations';
import Cover from '../Cover';

export default function PlayerInfo() {
  const t = useNavidromeTranslations();
  const song = usePlaybackStore((state) => state.queue[state.index]);
  const error = usePlaybackStore((state) => state.error);

  return (
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
          <span className="mt-[3px] block truncate text-[10px] text-[#fff8f1]/55" role={error ? 'alert' : undefined}>
            {error ? t(`player.${error}`) : song?.artist || t('player.idle')}
          </span>
        </div>
      </div>
    </div>
  );
}
