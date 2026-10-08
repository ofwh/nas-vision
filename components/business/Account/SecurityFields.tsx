'use client';

import type { ComponentProps } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/stores/settings';

export function SecurityDialogClose({ onClose, disabled }: { onClose: () => void; disabled: boolean }) {
  const t = useTranslations();
  const veil = useSettings((state) => state.veil);

  return (
    <LiquidGlass className="size-10 shrink-0 rounded-full" contentClassName="h-full" variant={veil ? 'veil' : 'glass'}>
      <Button
        variant="ghost"
        size="icon-lg"
        aria-label={t('common.close')}
        title={t('common.close')}
        disabled={disabled}
        onClick={onClose}
        className="rounded-full text-white hover:bg-white/15 hover:text-white"
      >
        <X aria-hidden className="size-5" />
      </Button>
    </LiquidGlass>
  );
}

export function SecurityField({
  label,
  hideLabel = false,
  ...props
}: ComponentProps<'input'> & { label: string; hideLabel?: boolean }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-white/75">
      <span className={hideLabel ? 'sr-only' : undefined}>{label}</span>
      <input
        {...props}
        className="h-11 w-full rounded-lg border border-white/20 bg-black/10 px-3 text-sm text-white transition-colors outline-none placeholder:text-white/40 focus:border-sky-300/70 focus:ring-3 focus:ring-sky-300/15 disabled:opacity-50"
      />
    </label>
  );
}

export const securityButtonClass = 'h-10 rounded-full bg-white/10 px-6 text-white hover:bg-white/15 hover:text-white';

export const securityOTPSlotClass =
  'h-12 w-full min-w-0 rounded-lg border border-white/20 bg-white/8 text-xl text-white shadow-none first:rounded-l-lg last:rounded-r-lg dark:bg-white/8 data-[active=true]:border-sky-300/70 data-[active=true]:ring-sky-300/15 [&_.animate-caret-blink]:bg-white';
