'use client';

import { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImmichTranslations } from '../../i18n/useTranslations';

type PhotoFooterProps = {
  onPrevious?: () => void;
  onNext?: () => void;
};

export default function PhotoFooter({ onPrevious, onNext }: PhotoFooterProps) {
  const t = useImmichTranslations();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      if (event.key === 'ArrowLeft' && onPrevious) {
        event.preventDefault();
        onPrevious();
      } else if (event.key === 'ArrowRight' && onNext) {
        event.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onPrevious, onNext]);

  return (
    <nav aria-label={t('ui.photoNavigation')} className="flex items-center gap-2 text-white">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('ui.previousPhoto')}
        title={t('ui.previousPhoto')}
        className="size-8 rounded-full"
        disabled={!onPrevious}
        onClick={onPrevious}
      >
        <ChevronLeft aria-hidden className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('ui.nextPhoto')}
        title={t('ui.nextPhoto')}
        className="size-8 rounded-full"
        disabled={!onNext}
        onClick={onNext}
      >
        <ChevronRight aria-hidden className="size-4" />
      </Button>
    </nav>
  );
}
