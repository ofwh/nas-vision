'use client';

import { useId, useState } from 'react';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { useLocale } from 'next-intl';
import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getTranslator } from '../i18n';
import useSliderPreview from '../hooks/useSliderPreview';

function sliderValue(value: number | readonly number[]): number {
  return typeof value === 'number' ? value : (value[0] ?? 0);
}

type VolumeControlProps = {
  volume: number;
  muted: boolean;
  onChange: (volume: number) => void;
  onToggleMute: () => void;
};

export default function VolumeControl({ volume, muted, onChange, onToggleMute }: VolumeControlProps) {
  const t = getTranslator(useLocale());
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const hintId = useId();
  const hover = useSliderPreview(100, 'vertical');
  const value = preview ?? (muted ? 0 : Math.round(volume * 100));
  const hintValue = preview ?? (hovering ? hover.value : value) ?? value;
  const level = value === 0 ? 'off' : value <= 50 ? 'low' : 'high';

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen, details) => {
        if (details.reason === 'trigger-press') {
          details.cancel();

          return;
        }

        setOpen(nextOpen);
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
            className="size-9 rounded-full bg-transparent text-[#fff8f1] hover:bg-transparent hover:text-[#fff8f1] aria-expanded:bg-transparent aria-expanded:text-[#fff8f1] max-[700px]:h-8 max-[700px]:w-7 dark:hover:bg-transparent"
            aria-label={t(muted || volume === 0 ? 'player.unmute' : 'player.mute')}
            aria-pressed={muted || volume === 0}
            onClick={onToggleMute}
            onFocus={(event) => {
              if (event.currentTarget.matches(':focus-visible')) {
                setOpen(true);
              }
            }}
          />
        }
      >
        <span
          aria-hidden
          className="group/volume-icon relative block size-4 [&>svg]:absolute [&>svg]:inset-0 [&>svg]:size-full"
          data-level={level}
        >
          <VolumeX className="opacity-0 group-data-[level=off]/volume-icon:opacity-100" />
          <Volume1 className="opacity-0 group-data-[level=low]/volume-icon:opacity-100" />
          <Volume2 className="opacity-0 group-data-[level=high]/volume-icon:opacity-100" />
        </span>
      </PopoverTrigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner side="top" sideOffset={12} className="pointer-events-auto z-[1200]">
          <PopoverPrimitive.Popup
            aria-label={t('player.volume')}
            className="rounded-full outline-none"
            initialFocus={false}
          >
            <LiquidGlass className="rounded-full" contentClassName="px-3 py-4">
              <TooltipProvider>
                <Tooltip
                  open={preview !== null || hintOpen || focused}
                  onOpenChange={setHintOpen}
                  triggerId={hintId}
                  trackCursorAxis="y"
                  disableHoverablePopup
                >
                  <TooltipTrigger
                    id={hintId}
                    delay={0}
                    closeOnClick={false}
                    onPointerMoveCapture={(event) => {
                      setHovering(true);
                      hover.move(event);
                    }}
                    onPointerDownCapture={(event) => {
                      setHovering(true);
                      hover.move(event);
                    }}
                    onPointerEnter={(event) => {
                      setHovering(true);
                      hover.move(event);
                    }}
                    onPointerLeave={() => setHovering(false)}
                    render={<div className="relative" />}
                  >
                    <span id={`${hintId}-label`} className="sr-only">
                      {t('player.volume')}
                    </span>
                    <Slider
                      orientation="vertical"
                      className="relative flex h-24 w-4 cursor-pointer touch-none items-center justify-center data-vertical:h-24 [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-thumb]]:size-2.5 [&_[data-slot=slider-thumb]]:border-0 [&_[data-slot=slider-track]]:w-1 [&_[data-slot=slider-track]]:bg-white/20 [&>div]:h-24 [&>div]:min-h-0"
                      aria-labelledby={`${hintId}-label`}
                      value={[value]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(next) => setPreview(sliderValue(next))}
                      onValueCommitted={(next) => {
                        onChange(sliderValue(next) / 100);
                        setPreview(null);
                      }}
                      onPointerCancel={() => setPreview(null)}
                      onLostPointerCapture={() => setPreview(null)}
                      onFocus={(event) =>
                        setFocused(event.target instanceof HTMLElement && event.target.matches(':focus-visible'))
                      }
                      onKeyDownCapture={() => {
                        setFocused(true);
                        setHovering(false);
                      }}
                      onBlur={() => setFocused(false)}
                    />
                  </TooltipTrigger>
                  <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Positioner side="right" sideOffset={12} className="pointer-events-none z-[1201]">
                      <TooltipPrimitive.Popup>
                        <LiquidGlass
                          className="rounded-full"
                          contentClassName="px-3 py-2 text-xs text-white tabular-nums"
                        >
                          <output aria-live="off">{Math.round(hintValue)}%</output>
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
