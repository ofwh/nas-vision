'use client';

import { useTranslations } from 'next-intl';
import { Maximize2, Minus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { WindowControlsConfig } from '@/types/window';

type WindowControlsProps = {
  maximized: boolean;
  onMaximize: () => void;
  className?: string;
  controls?: WindowControlsConfig;
};

export function WindowControls({
  maximized,
  onMaximize,
  className,
  controls: { minimize = 'default', maximize = 'default' } = {},
}: WindowControlsProps) {
  const t = useTranslations();

  return (
    <div className={cn('group/controls flex items-center gap-2', className)}>
      <DialogClose
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('common.close')}
            className="size-4 rounded-full border border-white/15 bg-white/15 p-0 text-white/70 shadow-inner backdrop-blur-md hover:bg-white/25 hover:text-white"
          />
        }
      >
        <X className="size-2.5 opacity-0 group-hover/controls:opacity-100" aria-hidden />
      </DialogClose>
      {minimize !== 'hide' ? (
        <DialogClose
          disabled={minimize === 'disabled'}
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('common.minimize')}
              className="size-4 rounded-full border border-white/15 bg-white/15 p-0 text-white/70 shadow-inner backdrop-blur-md hover:bg-white/25 hover:text-white"
            />
          }
        >
          <Minus className="size-2.5 opacity-0 group-hover/controls:opacity-100" aria-hidden />
        </DialogClose>
      ) : null}
      {maximize !== 'hide' ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label={t(maximized ? 'common.restore' : 'common.maximize')}
          aria-pressed={maximized}
          disabled={maximize === 'disabled'}
          onClick={onMaximize}
          className="size-4 rounded-full border border-white/15 bg-white/15 p-0 text-white/70 shadow-inner backdrop-blur-md hover:bg-white/25 hover:text-white"
        >
          <Maximize2 className="size-2 opacity-0 group-hover/controls:opacity-100" aria-hidden />
        </Button>
      ) : null}
    </div>
  );
}
