'use client';

import { useId, useState, type CSSProperties } from 'react';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { useContainer } from '@videojs/react';
import { usePlayer } from '@videojs/react/video';
import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import useSliderPreview from '../hooks/useSliderPreview';
import styles from '../styles/VideoView.module.css';
import { formatDuration } from '../utils/duration';

function sliderValue(value: number | readonly number[]): number {
  return typeof value === 'number' ? value : (value[0] ?? 0);
}

export function VolumeControl() {
  const [preview, setPreview] = useState<number | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const hintId = useId();
  const container = useContainer();
  const player = usePlayer();
  const volume = usePlayer((state) => (state.muted ? 0 : Math.round(state.volume * 100)));
  const available = usePlayer((state) => state.volumeAvailability === 'available');
  const value = preview ?? volume;
  const level = value === 0 ? 'off' : value <= 50 ? 'low' : 'high';

  return (
    <Popover
      onOpenChange={(_, details) => {
        if (details.reason === 'trigger-press') {
          details.cancel();
        }
      }}
    >
      <PopoverTrigger
        openOnHover
        delay={0}
        closeDelay={150}
        render={
          <Button
            variant="ghost"
            size="icon"
            className={`${styles.button} ${styles.volumeButton}`}
            aria-label="音量控制"
          />
        }
      >
        <span aria-hidden className={styles.volumeIcon} data-level={level}>
          <VolumeX className={styles.volumeOff} />
          <Volume1 className={styles.volumeLow} />
          <Volume2 className={styles.volumeHigh} />
        </span>
      </PopoverTrigger>
      <PopoverPrimitive.Portal container={container} className={styles.portal}>
        <PopoverPrimitive.Positioner data-video-overlay side="top" sideOffset={12} className="pointer-events-auto z-50">
          <PopoverPrimitive.Popup aria-label="音量" className="rounded-full outline-none" initialFocus={false}>
            <LiquidGlass className="rounded-full" contentClassName="px-3 py-4">
              <TooltipProvider>
                <Tooltip
                  open={preview !== null || hintOpen}
                  onOpenChange={setHintOpen}
                  triggerId={hintId}
                  trackCursorAxis="y"
                  disableHoverablePopup
                >
                  <TooltipTrigger id={hintId} delay={0} closeOnClick={false} render={<div className="relative" />}>
                    <span id={`${hintId}-label`} className="sr-only">
                      音量
                    </span>
                    <Slider
                      orientation="vertical"
                      className={styles.volume}
                      aria-labelledby={`${hintId}-label`}
                      value={[value]}
                      min={0}
                      max={100}
                      step={1}
                      disabled={!available}
                      onValueChange={(next) => setPreview(sliderValue(next))}
                      onValueCommitted={(next) => {
                        player.setVolume(sliderValue(next) / 100);
                        setPreview(null);
                      }}
                      onPointerCancel={() => setPreview(null)}
                      onLostPointerCapture={() => setPreview(null)}
                      onFocus={() => setHintOpen(true)}
                      onBlur={() => setHintOpen(false)}
                    />
                  </TooltipTrigger>
                  <TooltipPrimitive.Portal container={container} className={styles.portal}>
                    <TooltipPrimitive.Positioner
                      data-video-overlay
                      side="right"
                      sideOffset={12}
                      className="pointer-events-none z-50"
                    >
                      <TooltipPrimitive.Popup>
                        <LiquidGlass
                          className="rounded-full"
                          contentClassName="px-3 py-2 text-xs text-white tabular-nums"
                        >
                          <output aria-live="off">{Math.round(value)}%</output>
                        </LiquidGlass>
                      </TooltipPrimitive.Popup>
                    </TooltipPrimitive.Positioner>
                  </TooltipPrimitive.Portal>
                </Tooltip>
              </TooltipProvider>
            </LiquidGlass>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </Popover>
  );
}

export function ProgressControl() {
  const [preview, setPreview] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const previewId = useId();
  const container = useContainer();
  const player = usePlayer();
  const currentTime = usePlayer((state) => state.currentTime);
  const duration = usePlayer((state) => state.duration);
  const buffered = usePlayer((state) => state.buffered);
  const hover = useSliderPreview(Number.isFinite(duration) ? duration : 0);
  const value = preview ?? currentTime;
  const buffer = duration > 0 ? Math.min(100, ((buffered.at(-1)?.[1] ?? 0) / duration) * 100) : 0;

  return (
    <TooltipProvider>
      <Tooltip
        open={preview !== null || previewOpen}
        onOpenChange={setPreviewOpen}
        triggerId={previewId}
        trackCursorAxis="x"
        disableHoverablePopup
      >
        <TooltipTrigger
          id={previewId}
          delay={0}
          closeOnClick={false}
          onPointerMoveCapture={hover.move}
          render={<div className="relative w-40 shrink-0" />}
        >
          <span id={`${previewId}-label`} className="sr-only">
            播放进度
          </span>
          <Slider
            className={styles.seek}
            style={{ '--video-buffer': `${buffer}%` } as CSSProperties}
            aria-labelledby={`${previewId}-label`}
            value={[value]}
            min={0}
            max={duration > 0 ? duration : 1}
            step={0.01}
            disabled={!Number.isFinite(duration) || duration <= 0}
            onPointerCancel={() => setPreview(null)}
            onLostPointerCapture={() => setPreview(null)}
            onValueChange={(next) => setPreview(sliderValue(next))}
            onValueCommitted={(next) => {
              void player.seek(sliderValue(next));
              setPreview(null);
            }}
          />
        </TooltipTrigger>
        <TooltipPrimitive.Portal container={container} className={styles.portal}>
          <TooltipPrimitive.Positioner
            data-video-overlay
            side="top"
            sideOffset={12}
            className="pointer-events-none z-50"
          >
            <TooltipPrimitive.Popup>
              <LiquidGlass
                className="rounded-full"
                contentClassName="flex items-center gap-1 px-3 py-2 text-xs text-white tabular-nums"
              >
                <output aria-live="off">{formatDuration((preview ?? hover.value ?? currentTime) * 1000)}</output>
                <span aria-hidden>/</span>
                <span>{formatDuration(duration * 1000)}</span>
              </LiquidGlass>
            </TooltipPrimitive.Popup>
          </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
      </Tooltip>
    </TooltipProvider>
  );
}
