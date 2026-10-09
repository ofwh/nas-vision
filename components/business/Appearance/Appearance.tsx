'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/stores/settings';
import type { ConfigTheme } from '@/lib/db/schema/appearance';

export function Appearance() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const LANGUAGES = [
    { value: 'zh-CN', label: t('language.chinese') },
    { value: 'en', label: t('language.english') },
  ];

  const THEMES: { value: ConfigTheme; label: string }[] = [
    { value: 'auto', label: t('appearance.auto') },
    { value: 'light', label: t('appearance.light') },
    { value: 'dark', label: t('appearance.dark') },
  ];

  const { theme, veil, saving, save } = useSettings((state) => state);
  return (
    <div className="h-full min-h-0 overflow-y-auto p-8 text-white">
      <div className="mx-auto max-w-140 space-y-7">
        <header>
          <h2 className="text-xl font-semibold">{t('appearance.title')}</h2>
          <p className="mt-2 text-sm text-white/55">{t('appearance.description')}</p>
        </header>
        <section className="rounded-xl border border-white/10 bg-white/5 p-5" aria-labelledby="theme-label">
          <h3 id="theme-label" className="text-sm font-medium">
            {t('appearance.theme')}
          </h3>
          <div className="mt-4 grid grid-cols-3 gap-4" role="group" aria-label={t('appearance.theme')}>
            {THEMES.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={theme === item.value}
                disabled={saving}
                onClick={() => void save({ theme: item.value })}
                className="group cursor-pointer rounded-lg text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-wait disabled:opacity-60"
              >
                <div
                  className={`overflow-hidden rounded-lg border-2 p-1 transition-colors ${theme === item.value ? 'border-blue-400' : 'border-transparent group-hover:border-white/25'}`}
                >
                  <div
                    className={`relative flex h-24 items-center justify-center overflow-hidden rounded-md ${item.value === 'dark' ? 'bg-slate-800' : item.value === 'light' ? 'bg-sky-200' : 'bg-linear-to-r from-sky-200 from-50% to-slate-800 to-50%'}`}
                  >
                    <div
                      className={`flex h-16 w-4/5 overflow-hidden rounded-md border shadow-lg ${item.value === 'dark' ? 'border-white/15 bg-zinc-800' : item.value === 'light' ? 'border-black/10 bg-white' : 'border-white/20 bg-linear-to-r from-white from-50% to-zinc-800 to-50%'}`}
                    >
                      <div className="w-1/4 bg-gray-500/20 p-1.5">
                        <div className="h-1 rounded bg-blue-400" />
                      </div>
                      <div className="flex-1 space-y-2 p-2">
                        <div className="h-1 w-2/3 rounded bg-gray-400/50" />
                        <div className="h-5 rounded bg-gray-400/20" />
                        <div className="h-1 w-1/2 rounded bg-gray-400/40" />
                      </div>
                    </div>
                  </div>
                </div>
                <span className="mt-2 flex items-center justify-center gap-1.5">
                  {theme === item.value ? (
                    <Badge variant="secondary" className="bg-[oklch(0.97_0_0)] text-[oklch(0.205_0_0)]">
                      {item.label}
                    </Badge>
                  ) : (
                    item.label
                  )}
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5 px-5">
          <div className="flex items-center justify-between gap-6 py-4">
            <div>
              <label htmlFor="appearance-language" className="text-sm">
                {t('appearance.language')}
              </label>
              <p className="mt-1 text-xs text-white/50">{t('appearance.languageHint')}</p>
            </div>
            <Combobox
              items={LANGUAGES}
              value={LANGUAGES.find((item) => item.value === locale) ?? null}
              disabled={saving}
              onValueChange={async (value) => {
                if (!value || (value.value !== 'zh-CN' && value.value !== 'en')) return;
                const saved = await save({ language: value.value });
                if (!saved) return;
                router.refresh();
              }}
            >
              <ComboboxInput className="combobox-input" id="appearance-language" disabled={saving} />
              <ComboboxContent>
                <ComboboxEmpty>{t('common.noOptions')}</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item.value} value={item}>
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
          <div className="flex items-center justify-between gap-6 py-4">
            <div>
              <label htmlFor="appearance-veil" className="text-sm">
                {t('appearance.veil')}
              </label>
              <p className="mt-1 text-xs text-white/50">{t('appearance.veilHint')}</p>
            </div>
            <Switch
              id="appearance-veil"
              checked={veil}
              disabled={saving}
              onCheckedChange={(checked) => void save({ veil: checked })}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
