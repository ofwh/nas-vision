'use client';

import { useTranslations } from 'next-intl';
import { Maximize2, Minus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type WindowControlsProps = {
  maximized: boolean;
  onMaximize: () => void;
  className?: string;
};

export function WindowControls({ maximized, onMaximize, className }: WindowControlsProps) {
  const t = useTranslations();
  return (
    <div className={cn('group/controls flex items-center gap-2', className)}>
      <DialogClose
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('common.close')}
            className="size-3.5 rounded-full border border-white/15 bg-white/15 p-0 text-white/70 shadow-inner backdrop-blur-md hover:bg-white/25 hover:text-white"
          />
        }
      >
        <X className="size-2.5 opacity-0 group-hover/controls:opacity-100" aria-hidden />
      </DialogClose>
      <DialogClose
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('common.minimize')}
            className="size-3.5 rounded-full border border-white/15 bg-white/15 p-0 text-white/70 shadow-inner backdrop-blur-md hover:bg-white/25 hover:text-white"
          />
        }
      >
        <Minus className="size-2.5 opacity-0 group-hover/controls:opacity-100" aria-hidden />
      </DialogClose>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t(maximized ? 'common.restore' : 'common.maximize')}
        aria-pressed={maximized}
        onClick={onMaximize}
        className="size-3.5 rounded-full border border-white/15 bg-white/15 p-0 text-white/70 shadow-inner backdrop-blur-md hover:bg-white/25 hover:text-white"
      >
        <Maximize2 className="size-2 opacity-0 group-hover/controls:opacity-100" aria-hidden />
      </Button>
    </div>
  );
}
