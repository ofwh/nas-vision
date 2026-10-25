import { useContext } from 'react';
import { Loader, Play, RefreshCw, Trash2, X } from 'lucide-react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useWindow } from '@/hooks/useWindow';
import { WindowDragContext } from '@/hooks/useWindowDrag';
import { useNavidromeTranslations } from '../i18n/useTranslations';

type WindowHeaderProps = {
  canPlayAll: boolean;
  onPlayAll: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  onDeletePlaylist?: () => void;
  deleting: boolean;
};

export default function WindowHeader({
  canPlayAll,
  onPlayAll,
  isRefreshing,
  onRefresh,
  onDeletePlaylist,
  deleting,
}: WindowHeaderProps) {
  const t = useNavidromeTranslations();
  const { close, maximized } = useWindow();
  const onDragStart = useContext(WindowDragContext);
  const Surface = maximized ? 'div' : LiquidGlass;

  return (
    <header
      onPointerDown={onDragStart ?? undefined}
      className="pointer-events-auto absolute inset-x-5 top-3.5 z-40 flex min-h-12 touch-none items-center justify-between text-white select-none"
    >
      <Surface className="pointer-events-auto shrink-0 rounded-full">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-white"
          aria-label={t('common.close')}
          title={t('common.close')}
          onClick={close}
        >
          <X aria-hidden />
        </Button>
      </Surface>
      <div className="flex shrink-0 items-center gap-2">
        {onDeletePlaylist ? (
          <Surface className="pointer-events-auto shrink-0 rounded-full">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deleting}
                    aria-busy={deleting}
                    className="rounded-full text-white"
                  />
                }
                aria-label={t(deleting ? 'playlist.deleting' : 'playlist.delete')}
                onClick={onDeletePlaylist}
              >
                {deleting ? (
                  <Loader aria-hidden size={17} className="animate-spin" />
                ) : (
                  <Trash2 aria-hidden size={17} />
                )}
              </TooltipTrigger>
              <TooltipContent>{t('playlist.delete')}</TooltipContent>
            </Tooltip>
          </Surface>
        ) : null}
        {canPlayAll ? (
          <Surface className="pointer-events-auto shrink-0 rounded-full">
            <Button variant="ghost" className="rounded-full text-white" onClick={onPlayAll}>
              <Play aria-hidden size={14} fill="currentColor" />
              {t('player.playAll')}
            </Button>
          </Surface>
        ) : null}
        <Surface className="pointer-events-auto shrink-0 rounded-full">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-white"
            aria-label={t('library.refresh')}
            title={t('library.refresh')}
            disabled={isRefreshing}
            onClick={onRefresh}
          >
            <RefreshCw
              aria-hidden
              size={17}
              className={isRefreshing ? 'animate-spin motion-reduce:animate-none' : ''}
            />
          </Button>
        </Surface>
      </div>
    </header>
  );
}
