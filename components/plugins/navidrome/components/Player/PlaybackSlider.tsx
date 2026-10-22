'use client';

import { useId, useState } from 'react';
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import useSliderPreview from '../../hooks/useSliderPreview';

type PlaybackSliderProps = {
  label: string;
  value: number;
  max: number;
  step: number;
  disabled?: boolean;
  formatValue: (value: number) => string;
  onCommit: (value: number) => void;
};

function sliderValue(value: number | readonly number[]): number {
  return typeof value === 'number' ? value : (value[0] ?? 0);
}

export default function PlaybackSlider({
  label,
  value,
  max,
  step,
  disabled = false,
  formatValue,
  onCommit,
}: PlaybackSliderProps) {
  const [preview, setPreview] = useState<number | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const hintId = useId();
  const hover = useSliderPreview(max);
  const current = preview ?? value;
  const hintValue = preview ?? (hovering ? hover.value : value) ?? value;
  const roundedHint = Math.max(0, Math.min(max, Math.round(hintValue / step) * step));

  return (
    <TooltipProvider>
      <Tooltip
        open={!disabled && (preview !== null || hintOpen || focused)}
        onOpenChange={setHintOpen}
        triggerId={hintId}
        trackCursorAxis="x"
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
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          render={<div data-playback-slider className="relative min-w-0 flex-1" />}
        >
          <span id={`${hintId}-label`} className="sr-only">
            {label}
          </span>
          <Slider
            className="relative flex h-8 cursor-pointer touch-none items-center focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white data-disabled:cursor-default [&_[data-slot=slider-range]]:relative [&_[data-slot=slider-thumb]]:size-2.5 [&_[data-slot=slider-thumb]]:border-0 [&_[data-slot=slider-track]]:h-1"
            aria-labelledby={`${hintId}-label`}
            aria-valuetext={formatValue(current)}
            value={[current]}
            min={0}
            max={max > 0 ? max : 1}
            step={step}
            disabled={disabled}
            onValueChange={(next) => setPreview(sliderValue(next))}
            onValueCommitted={(next) => {
              onCommit(sliderValue(next));
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
          <TooltipPrimitive.Positioner side="top" sideOffset={12} className="pointer-events-none z-[1200]">
            <TooltipPrimitive.Popup>
              <LiquidGlass
                className="rounded-full"
                contentClassName="px-3 py-2 text-xs whitespace-nowrap text-white tabular-nums"
              >
                <output aria-live="off">{formatValue(roundedHint)}</output>
              </LiquidGlass>
            </TooltipPrimitive.Popup>
          </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
      </Tooltip>
    </TooltipProvider>
  );
}
