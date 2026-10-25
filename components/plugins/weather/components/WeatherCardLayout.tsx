'use client';

import type { ReactNode } from 'react';
import { cn } from 'cn';
import { LiquidGlass } from '@/components/common/LiquidGlass';

type WeatherCardSpan = 1 | 2 | 3 | 4;

type WeatherCardLayoutProps = {
  col: WeatherCardSpan;
  row: WeatherCardSpan;
  children: ReactNode;
  transparent?: boolean;
  contentClassName?: string;
};

export function WeatherCardLayout({
  col,
  row,
  children,
  transparent = false,
  contentClassName,
}: WeatherCardLayoutProps) {
  return (
    <div className="min-h-0 min-w-0 p-2" style={{ gridColumn: `span ${col}`, gridRow: `span ${row}` }}>
      <LiquidGlass
        variant="glass"
        transparent={transparent}
        className="size-full rounded-3xl"
        contentClassName={cn('flex size-full min-h-0 min-w-0 flex-col p-4', contentClassName)}
      >
        {children}
      </LiquidGlass>
    </div>
  );
}
