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
}: {
  title: string;
  header?: HeaderContent;
  transparent: boolean;
}) {
  const t = useTranslations();
  const Surface = transparent ? 'div' : LiquidGlass;

  return (
    <header className="pointer-events-none absolute inset-x-5 top-3.5 z-40 grid min-h-12 shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] items-center gap-3 text-white">
      <div className="pointer-events-auto flex min-w-0 items-center gap-3">
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
        <div className="flex min-w-0 items-center gap-2">{header?.left}</div>
      </div>
      <span className="max-w-full truncate text-center text-sm font-semibold">{header?.center ?? title}</span>
      <div className="pointer-events-auto flex min-w-0 items-center justify-end gap-2">{header?.right}</div>
    </header>
  );
}
