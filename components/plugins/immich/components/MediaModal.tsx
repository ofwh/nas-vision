'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { WindowModal } from '@/components/common/WindowModal';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Button } from '@/components/ui/button';
import { useWindow } from '@/hooks/useWindow';
import { cn } from '@/lib/utils';
import { useImmichTranslations } from '../i18n/useTranslations';

type MediaModalProps = {
  title: string;
  ratio: number;
  fit?: boolean;
  onClose: () => void;
  footer: ReactNode;
  children: ReactNode;
};

export default function MediaModal({ title, ratio, fit, onClose, footer, children }: MediaModalProps) {
  return (
    <WindowModal
      mode="floating"
      open
      top
      title={title}
      fit={fit}
      modal
      closeOnOverlay
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      style={{ width: `min(90vw, ${90 * ratio}vh)`, height: `min(90vh, ${90 / ratio}vw)` }}
      footer={footer}
    >
      {() => children}
    </WindowModal>
  );
}

export function MediaModalCloseButton({ className }: { className?: string }) {
  const t = useImmichTranslations();
  const { close } = useWindow();

  return (
    <div className={cn('absolute top-4 left-4', className)}>
      <LiquidGlass className="size-10 rounded-full" contentClassName="h-full">
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label={t('ui.close')}
          title={t('ui.close')}
          className="rounded-full text-white"
          onClick={close}
        >
          <X aria-hidden className="size-5" />
        </Button>
      </LiquidGlass>
    </div>
  );
}
