'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FullscreenButton, useContainerAttach } from '@videojs/react';
import { Video, VideoPlayer } from '@videojs/react/video';
import { LoaderCircle, Maximize, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react';
import { WindowModal } from '@/components/common/WindowModal';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Button } from '@/components/ui/button';
import { pluginPath } from '@/lib/plugins/client';
import type { ImmichVideo } from '../types';
import useFullscreenIdle from '../hooks/useFullscreenIdle';
import styles from '../styles/VideoView.module.css';
import { ProgressControl, VolumeControl } from './VideoControls';

type VideoViewProps = {
  video: ImmichVideo;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
};

function Playback({ video, onClose, onPrevious, onNext }: VideoViewProps) {
  useFullscreenIdle();
  const src = `${pluginPath('immich', '/api/video')}?${new URLSearchParams({ id: video.id })}`;
  const media = useRef<HTMLVideoElement>(null);
  const attachContainer = useContainerAttach();
  const [ratio, setRatio] = useState(video.width && video.height ? video.width / video.height : 16 / 9);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<string | null>(null);
  const [autoplayMuted, setAutoplayMuted] = useState(false);
  const [paused, setPaused] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoplayAttempted = useRef(false);
  const failed = failure !== null;

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const wait = () => {
    clearTimer();
    setLoading(true);
    timer.current = setTimeout(() => {
      setLoading(false);
      setFailure('视频加载超时，请检查 Immich 服务后重试。');
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
      if (error instanceof DOMException && error.name === 'AbortError') return;
      if (automatic && error instanceof DOMException && error.name === 'NotAllowedError') {
        element.muted = true;
        try {
          await element.play();
          setAutoplayMuted(true);
          return;
        } catch (retryError) {
          if (retryError instanceof DOMException && retryError.name === 'AbortError') return;
        }
      }
      ready();
      setFailure(
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? '浏览器阻止了自动播放，请点击重试播放。'
          : '视频无法播放，请检查视频格式或 Immich 转码状态后重试。',
      );
    }
  };
  const toggle = () => {
    const element = media.current;
    if (!element) return;
    if (element.paused) void play(element);
    else element.pause();
  };
  const retry = () => {
    const element = media.current;
    if (!element) return;
    setFailure(null);
    element.load();
    void play(element);
  };
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
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
      if (node && !node.hasAttribute('src')) node.src = src;
      const container = node?.closest('[role="dialog"]');
      attachContainer?.(container instanceof HTMLElement ? container : null);
    },
    [attachContainer, src],
  );

  return (
    <WindowModal
      mode="floating"
      open
      top
      title={video.name}
      modal
      closeOnOverlay
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      style={{ width: `min(90vw, ${90 * ratio}vh)`, height: `min(90vh, ${90 / ratio}vw)` }}
      footer={
        <nav aria-label="视频控制" className={`${styles.controls} flex min-w-0 items-center gap-1 text-white sm:gap-2`}>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-full"
            aria-label="上一项"
            title="上一项"
            disabled={!onPrevious}
            onClick={onPrevious}
          >
            <SkipBack aria-hidden className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={styles.button}
            onClick={toggle}
            aria-label={paused ? '播放' : '暂停'}
            title={paused ? '播放' : '暂停'}
          >
            {paused ? <Play aria-hidden className="size-5" /> : <Pause aria-hidden className="size-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-full"
            aria-label="下一项"
            title="下一项"
            disabled={!onNext}
            onClick={onNext}
          >
            <SkipForward aria-hidden className="size-4" />
          </Button>
          <ProgressControl />
          <VolumeControl />
          <FullscreenButton className={styles.button} label="切换全屏">
            <Maximize aria-hidden className="size-4" />
          </FullscreenButton>
        </nav>
      }
    >
      {() => (
        <div
          className={`${styles.frame} group/video relative min-h-0 w-full flex-1 overflow-hidden bg-black text-white`}
        >
          <Video
            ref={bindMedia}
            src={src}
            autoPlay
            playsInline
            preload="auto"
            className="h-full w-full object-contain"
            onLoadStart={() => {
              autoplayAttempted.current = false;
              setFailure(null);
              wait();
            }}
            onLoadedMetadata={(event) => {
              const { videoWidth, videoHeight } = event.currentTarget;
              if (videoWidth > 0 && videoHeight > 0) setRatio(videoWidth / videoHeight);
            }}
            onWaiting={wait}
            onSeeking={wait}
            onSeeked={ready}
            onCanPlay={(event) => {
              ready();
              if (!autoplayAttempted.current) {
                autoplayAttempted.current = true;
                void play(event.currentTarget, true);
              }
            }}
            onPlay={() => setPaused(false)}
            onPause={() => setPaused(true)}
            onEnded={() => setPaused(true)}
            onVolumeChange={(event) => {
              if (!event.currentTarget.muted) setAutoplayMuted(false);
            }}
            onPlaying={() => {
              ready();
              setFailure(null);
            }}
            onError={(event) => {
              ready();
              const code = event.currentTarget.error?.code;
              setFailure(
                code === 3
                  ? '视频解码失败，请检查浏览器格式支持与 Immich 转码状态。'
                  : code === 4
                    ? '无法加载视频，请检查登录状态、Immich 权限及视频转码状态。'
                    : '视频加载失败，请检查网络或 Immich 服务后重试。',
              );
            }}
            onClick={toggle}
            onKeyDown={(event) => {
              if (event.key === ' ') {
                event.preventDefault();
                toggle();
              }
            }}
            tabIndex={0}
            aria-label={video.name}
          />
          {paused && !loading && !failed ? (
            <div className={`${styles.overlay} pointer-events-none absolute inset-0 flex items-center justify-center`}>
              <Button
                variant="ghost"
                size="icon-lg"
                aria-label="播放视频"
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
              已静音自动播放，可通过音量按钮开启声音
            </p>
          ) : null}
          {loading && !failed ? (
            <div
              role="status"
              aria-label="正在加载视频"
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
              <p>{failure}</p>
              <Button variant="ghost" onClick={retry}>
                重试
              </Button>
            </div>
          ) : null}
          <div
            className={`${styles.overlay} pointer-events-none absolute inset-x-0 top-0 flex justify-center bg-gradient-to-b from-black/70 to-transparent px-14 py-5 opacity-0 transition-opacity group-focus-within/video:opacity-100 group-hover/video:opacity-100 motion-reduce:transition-none`}
          >
            <p className="text-center text-sm font-medium break-all">{video.name}</p>
          </div>
          <div className={`${styles.overlay} absolute top-4 left-4`}>
            <LiquidGlass className="size-10 rounded-full" contentClassName="h-full">
              <Button
                variant="ghost"
                size="icon-lg"
                aria-label="关闭"
                title="关闭"
                className="rounded-full text-white hover:bg-white/15 hover:text-white"
                onClick={onClose}
              >
                <X aria-hidden className="size-5" />
              </Button>
            </LiquidGlass>
          </div>
        </div>
      )}
    </WindowModal>
  );
}

export default function VideoView(props: VideoViewProps) {
  return (
    <VideoPlayer>
      <Playback {...props} />
    </VideoPlayer>
  );
}
