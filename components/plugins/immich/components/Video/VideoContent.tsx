'use client';

import { Video } from '@videojs/react/video';
import { LoaderCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaModalCloseButton } from '../MediaModal';
import { useImmichTranslations } from '../../i18n/useTranslations';
import type useVideoPlayback from '../../hooks/useVideoPlayback';
import styles from '../../styles/VideoModal.module.css';

type VideoContentProps = {
  name: string;
  playback: ReturnType<typeof useVideoPlayback>;
};

export default function VideoContent({ name, playback }: VideoContentProps) {
  const t = useImmichTranslations();
  const { paused, loading, failure, autoplayMuted, toggle, retry, mediaProps } = playback;
  const failed = failure !== null;

  return (
    <div className={`${styles.frame} group/video relative min-h-0 w-full flex-1 overflow-hidden bg-black text-white`}>
      <Video
        {...mediaProps}
        autoPlay
        playsInline
        preload="auto"
        className="h-full w-full object-contain"
        tabIndex={0}
        aria-label={name}
      />
      {paused && !loading && !failed ? (
        <div className={`${styles.overlay} pointer-events-none absolute inset-0 flex items-center justify-center`}>
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={t('ui.playVideo')}
            className="pointer-events-auto size-16 rounded-full bg-black/40 text-white hover:bg-black/60"
            onClick={toggle}
          >
            <Play aria-hidden className="size-7 fill-current" />
          </Button>
        </div>
      ) : null}
      {autoplayMuted && !failed ? (
        <p
          role="status"
          className={`${styles.overlay} pointer-events-none absolute inset-x-4 bottom-8 text-center text-xs text-white/80`}
        >
          {t('ui.muted')}
        </p>
      ) : null}
      {loading && !failed ? (
        <div
          role="status"
          aria-label={t('ui.loadingVideo')}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <LoaderCircle className="size-8 animate-spin motion-reduce:animate-none" />
        </div>
      ) : null}
      {failed ? (
        <div
          role="alert"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-sm"
        >
          <p>{failure ? t(`ui.${failure}`) : null}</p>
          <Button variant="ghost" onClick={retry}>
            {t('ui.retry')}
          </Button>
        </div>
      ) : null}
      <div
        className={`${styles.overlay} pointer-events-none absolute inset-x-0 top-0 flex justify-center bg-gradient-to-b from-black/70 to-transparent px-14 py-5 opacity-0 transition-opacity group-focus-within/video:opacity-100 group-hover/video:opacity-100 motion-reduce:transition-none`}
      >
        <p className="text-center text-sm font-medium break-all">{name}</p>
      </div>
      <MediaModalCloseButton className={styles.overlay} />
    </div>
  );
}
