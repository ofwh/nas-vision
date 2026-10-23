'use client';

import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import type { HeaderContent } from '@/types/window';

export function FloatingHeader({
  title,
  header,
  transparent,
  showClose = true,
}: {
  title: string;
  header?: HeaderContent;
  transparent: boolean;
  showClose?: boolean;
}) {
  const t = useTranslations();
  const Surface = transparent ? 'div' : LiquidGlass;

  return (
    <header className="pointer-events-none relative z-40 col-start-1 row-start-1 mx-5 mt-3.5 grid min-h-12 min-w-0 grid-cols-[minmax(max-content,1fr)_minmax(0,auto)_minmax(max-content,1fr)] items-center gap-3 self-start text-white">
      <div className="pointer-events-auto flex min-w-max items-center justify-start gap-3">
        {showClose ? (
          <Surface className="shrink-0 rounded-full">
            <DialogClose
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label={t('common.close')}
                  title={t('common.close')}
                />
              }
            >
              <X aria-hidden />
            </DialogClose>
          </Surface>
        ) : null}
        <div className="flex min-w-0 items-center gap-2">{header?.left}</div>
      </div>
      <span className="min-w-0 truncate text-center text-base font-bold">{header?.center ?? title}</span>
      <div className="pointer-events-auto flex min-w-max items-center justify-end gap-3">{header?.right}</div>
    </header>
  );
}
