'use client';

import { FullscreenButton } from '@videojs/react';
import { Maximize, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImmichTranslations } from '../../i18n/useTranslations';
import styles from '../../styles/VideoModal.module.css';
import { VideoProgressControl, VideoVolumeControl } from './VideoControls';

type VideoFooterProps = {
  paused: boolean;
  onToggle: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
};

export default function VideoFooter({ paused, onToggle, onPrevious, onNext }: VideoFooterProps) {
  const t = useImmichTranslations();

  return (
    <nav
      aria-label={t('ui.videoControls')}
      className={`${styles.controls} flex min-w-0 items-center gap-1 text-white sm:gap-2`}
    >
      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 rounded-full"
        aria-label={t('ui.previous')}
        title={t('ui.previous')}
        disabled={!onPrevious}
        onClick={onPrevious}
      >
        <SkipBack aria-hidden className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={styles.button}
        onClick={onToggle}
        aria-label={paused ? t('ui.play') : t('ui.pause')}
        title={paused ? t('ui.play') : t('ui.pause')}
      >
        {paused ? <Play aria-hidden className="size-5" /> : <Pause aria-hidden className="size-5" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 rounded-full"
        aria-label={t('ui.next')}
        title={t('ui.next')}
        disabled={!onNext}
        onClick={onNext}
      >
        <SkipForward aria-hidden className="size-4" />
      </Button>
      <VideoProgressControl />
      <VideoVolumeControl />
      <FullscreenButton className={styles.button} label={t('ui.fullscreen')}>
        <Maximize aria-hidden className="size-4" />
      </FullscreenButton>
    </nav>
  );
}
