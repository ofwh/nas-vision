'use client';

import { useTranslations } from 'next-intl';
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_SIZE = 24;
const ICON_STROKE = 1.7;

export type LoadingProps = {
  className?: string;
};

export function Loading({ className }: LoadingProps) {
  const t = useTranslations();
  return (
    <div
      role="status"
      aria-label={t('common.loading')}
      className={cn('flex h-full w-full items-center justify-center', className)}
    >
      <Loader size={ICON_SIZE} strokeWidth={ICON_STROKE} className="animate-spin text-white" aria-hidden />
    </div>
  );
}
