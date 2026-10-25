'use client';

import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/i18n/config';
import { getTranslator } from '../i18n';

export function Empty({ locale, onAdd }: { locale: Locale; onAdd: () => void }) {
  const t = getTranslator(locale);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-5 px-6 py-8 text-center text-sm text-white/60">
      <MapPin aria-hidden className="size-12 shrink-0" strokeWidth={1.25} />
      <p>
        {t.rich('settings.emptyPrompt', {
          add: (label) => (
            <Button
              type="button"
              variant="link"
              onClick={onAdd}
              className="h-auto cursor-pointer p-0 align-baseline font-normal text-inherit no-underline hover:no-underline"
            >
              {label}
            </Button>
          ),
        })}
      </p>
    </div>
  );
}
