'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { WindowContent } from '@/components/common/SplitWindowModal';
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

function ThemeOption({
  theme,
  label,
  selected,
  saving,
  onSelect,
}: {
  theme: ConfigTheme;
  label: string;
  selected: boolean;
  saving: boolean;
  onSelect: (theme: ConfigTheme) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={saving}
      onClick={() => onSelect(theme)}
      className="group cursor-pointer rounded-lg text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-wait disabled:opacity-60"
    >
      <div
        className={`overflow-hidden rounded-lg border-2 p-1 transition-colors ${selected ? 'border-blue-400' : 'border-transparent group-hover:border-white/25'}`}
      >
        <div
          className={`relative flex h-24 items-center justify-center overflow-hidden rounded-md ${theme === 'dark' ? 'bg-slate-800' : theme === 'light' ? 'bg-sky-200' : 'bg-linear-to-r from-sky-200 from-50% to-slate-800 to-50%'}`}
        >
          <div
            className={`flex h-16 w-4/5 overflow-hidden rounded-md border shadow-lg ${theme === 'dark' ? 'border-white/15 bg-zinc-800' : theme === 'light' ? 'border-black/10 bg-white' : 'border-white/20 bg-linear-to-r from-white from-50% to-zinc-800 to-50%'}`}
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
        {selected ? (
          <Badge variant="secondary" className="bg-[oklch(0.97_0_0)] text-[oklch(0.205_0_0)]">
            {label}
          </Badge>
        ) : (
          label
        )}
      </span>
    </button>
  );
}

function ThemeSettings({
  theme,
  saving,
  onChange,
}: {
  theme: ConfigTheme;
  saving: boolean;
  onChange: (theme: ConfigTheme) => void;
}) {
  const t = useTranslations();
  const THEMES: { value: ConfigTheme; label: string }[] = [
    { value: 'auto', label: t('appearance.auto') },
    { value: 'light', label: t('appearance.light') },
    { value: 'dark', label: t('appearance.dark') },
  ];

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-5" aria-labelledby="theme-label">
      <h3 id="theme-label" className="text-sm font-medium">
        {t('appearance.theme')}
      </h3>
      <div className="mt-4 grid grid-cols-3 gap-4" role="group" aria-label={t('appearance.theme')}>
        {THEMES.map((item) => (
          <ThemeOption
            key={item.value}
            theme={item.value}
            label={item.label}
            selected={theme === item.value}
            saving={saving}
            onSelect={onChange}
          />
        ))}
      </div>
    </section>
  );
}

function LanguageSettings({ saving }: { saving: boolean }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const save = useSettings((state) => state.save);
  const LANGUAGES = [
    { value: 'zh-CN', label: t('language.chinese') },
    { value: 'en', label: t('language.english') },
  ];

  return (
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
          if (!value || (value.value !== 'zh-CN' && value.value !== 'en')) {
            return;
          }

          const saved = await save({ language: value.value });

          if (!saved) {
            return;
          }

          router.refresh();
        }}
      >
        <ComboboxInput
          className="h-8 w-auto border-0 px-0 focus-visible:ring-0 [&_input]:text-right"
          id="appearance-language"
          disabled={saving}
        />
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
  );
}

function VeilSettings({
  veil,
  saving,
  onChange,
}: {
  veil: boolean;
  saving: boolean;
  onChange: (veil: boolean) => void;
}) {
  const t = useTranslations();

  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div>
        <label htmlFor="appearance-veil" className="text-sm">
          {t('appearance.veil')}
        </label>
        <p className="mt-1 text-xs text-white/50">{t('appearance.veilHint')}</p>
      </div>
      <Switch id="appearance-veil" checked={veil} disabled={saving} onCheckedChange={(checked) => onChange(checked)} />
    </div>
  );
}

export function Appearance() {
  const t = useTranslations();
  const toast = useToast();
  const { theme, veil, saving, save, error } = useSettings((state) => state);

  useEffect(() => {
    if (error) {
      toast.add({ type: 'error', title: error });
    }
  }, [error, toast]);

  return (
    <WindowContent title={t('appearance.title')}>
      <div className="mx-auto max-w-140 space-y-7 p-8">
        <p className="text-sm text-white/55">{t('appearance.description')}</p>
        <ThemeSettings theme={theme} saving={saving} onChange={(value) => void save({ theme: value })} />
        <section className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5 px-5">
          <LanguageSettings saving={saving} />
          <VeilSettings veil={veil} saving={saving} onChange={(value) => void save({ veil: value })} />
        </section>
      </div>
    </WindowContent>
  );
}
