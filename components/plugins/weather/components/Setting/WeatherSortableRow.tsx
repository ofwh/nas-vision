'use client';

import type { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/react/sortable';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WeatherSortableRow({
  id,
  index,
  disabled,
  label,
  children,
  action,
}: {
  id: string;
  index: number;
  disabled: boolean;
  label: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const { ref, handleRef, isDragging } = useSortable({ id, index, disabled });

  return (
    <div
      ref={ref}
      className={`flex items-center gap-3.5 px-4 py-2.5 transition-colors hover:bg-white/6 ${isDragging ? 'relative z-10 rounded-xl bg-white/15 shadow-xl' : ''}`}
    >
      {children}
      {action ?? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          ref={handleRef}
          disabled={disabled}
          aria-label={label}
          className="cursor-grab touch-none text-white/55 hover:bg-white/12 hover:text-white active:cursor-grabbing"
        >
          <Menu aria-hidden />
        </Button>
      )}
    </div>
  );
}
