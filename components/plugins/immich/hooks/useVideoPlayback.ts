'use client';

import { useCallback, useEffect, useRef, useState, type ComponentProps } from 'react';
import { useContainerAttach } from '@videojs/react';
import type { Video } from '@videojs/react/video';
import { pluginPath } from '@/lib/plugins/client';
import type { ImmichVideo } from '../types';
import useFullscreenIdle from './useFullscreenIdle';

export default function useVideoPlayback(video: ImmichVideo) {
  useFullscreenIdle();
  const src = `${pluginPath('immich', '/api/video')}?${new URLSearchParams({ id: video.id })}`;
  const media = useRef<HTMLVideoElement>(null);
  const attachContainer = useContainerAttach();
  const [ratio, setRatio] = useState(video.width && video.height ? video.width / video.height : 16 / 9);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<
    'timeout' | 'autoplay' | 'unplayable' | 'decode' | 'source' | 'network' | null
  >(null);
  const [autoplayMuted, setAutoplayMuted] = useState(false);
  const [paused, setPaused] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoplayAttempted = useRef(false);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = null;
  };
  const wait = () => {
    clearTimer();
    setLoading(true);
    timer.current = setTimeout(() => {
      setLoading(false);
      setFailure('timeout');
    }, 30_000);
  };
  const ready = () => {
    clearTimer();
    setLoading(false);
  };
  const play = async (element: HTMLVideoElement, automatic = false) => {
    setFailure(null);
    try {
      await element.play();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      if (automatic && error instanceof DOMException && error.name === 'NotAllowedError') {
        element.muted = true;
        try {
          await element.play();
          setAutoplayMuted(true);

          return;
        } catch (retryError) {
          if (retryError instanceof DOMException && retryError.name === 'AbortError') {
            return;
          }
        }
      }

      ready();
      setFailure(error instanceof DOMException && error.name === 'NotAllowedError' ? 'autoplay' : 'unplayable');
    }
  };
  const toggle = () => {
    const element = media.current;

    if (!element) {
      return;
    }

    if (element.paused) {
      void play(element);
    } else {
      element.pause();
    }
  };
  const retry = () => {
    const element = media.current;

    if (!element) {
      return;
    }

    setFailure(null);
    element.load();
    void play(element);
  };

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );
  const bindMedia = useCallback(
    (node: HTMLVideoElement | null) => {
      if (!node && media.current) {
        media.current.pause();
        media.current.removeAttribute('src');
        media.current.load();
      }

      media.current = node;
      if (node && !node.hasAttribute('src')) {
        node.src = src;
      }

      const container = node?.closest('[role="dialog"]');

      attachContainer?.(container instanceof HTMLElement ? container : null);
    },
    [attachContainer, src],
  );

  const mediaProps: ComponentProps<typeof Video> = {
    ref: bindMedia,
    src,
    onLoadStart: () => {
      autoplayAttempted.current = false;
      setFailure(null);
      wait();
    },
    onLoadedMetadata: (event) => {
      const { videoWidth, videoHeight } = event.currentTarget;

      if (videoWidth > 0 && videoHeight > 0) {
        setRatio(videoWidth / videoHeight);
      }
    },
    onWaiting: wait,
    onSeeking: wait,
    onSeeked: ready,
    onCanPlay: (event) => {
      ready();
      if (!autoplayAttempted.current) {
        autoplayAttempted.current = true;
        void play(event.currentTarget, true);
      }
    },
    onPlay: () => setPaused(false),
    onPause: () => setPaused(true),
    onEnded: () => setPaused(true),
    onVolumeChange: (event) => {
      if (!event.currentTarget.muted) {
        setAutoplayMuted(false);
      }
    },
    onPlaying: () => {
      ready();
      setFailure(null);
    },
    onError: (event) => {
      ready();
      const code = event.currentTarget.error?.code;

      setFailure(code === 3 ? 'decode' : code === 4 ? 'source' : 'network');
    },
    onClick: toggle,
    onKeyDown: (event) => {
      if (event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    },
  };

  return { ratio, paused, loading, failure, autoplayMuted, toggle, retry, mediaProps };
}
