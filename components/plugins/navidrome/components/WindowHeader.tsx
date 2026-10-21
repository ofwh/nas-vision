import { useLocale } from 'next-intl';
import { Play, RefreshCw, X } from 'lucide-react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Button } from '@/components/ui/button';
import { useWindow } from '@/hooks/useWindow';
import { getTranslator } from '../i18n';

type WindowHeaderProps = {
  canPlayAll: boolean;
  onPlayAll: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
};

export default function WindowHeader({ canPlayAll, onPlayAll, isRefreshing, onRefresh }: WindowHeaderProps) {
  const t = getTranslator(useLocale());
  const { close, maximized } = useWindow();
  const Surface = maximized ? 'div' : LiquidGlass;

  return (
    <header className="pointer-events-none absolute inset-x-5 top-3.5 z-40 flex min-h-12 items-center justify-between text-white">
      <Surface className="pointer-events-auto shrink-0 rounded-full">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-white hover:bg-white/15 hover:text-white"
          aria-label={t('common.close')}
          title={t('common.close')}
          onClick={close}
        >
          <X aria-hidden />
        </Button>
      </Surface>
      <div className="flex shrink-0 items-center gap-2">
        {canPlayAll ? (
          <Surface className="pointer-events-auto shrink-0 rounded-full">
            <Button
              variant="ghost"
              className="rounded-full text-white hover:bg-white/15 hover:text-white"
              onClick={onPlayAll}
            >
              <Play aria-hidden size={14} fill="currentColor" />
              {t('player.playAll')}
            </Button>
          </Surface>
        ) : null}
        <Surface className="pointer-events-auto shrink-0 rounded-full">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-white hover:bg-white/15 hover:text-white"
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
