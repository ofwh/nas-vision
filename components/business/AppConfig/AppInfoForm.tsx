'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxList } from '@/components/ui/combobox';
import type { AppType } from '@/lib/db/schema';
import { FormGroup, FIELD_CONTROL_CLASS, type AppFormProps } from './form';
import { AppSelectItem } from './AppSelectItem';
export function AppInfoForm({ form, update }: AppFormProps) {
  const t = useTranslations();
  const TYPE_ITEMS: { value: AppType; label: string; description?: string }[] = [
    { value: 'url', label: t('apps.pageType') },
    { value: 'plugin', label: t('apps.pluginType') },
  ];

  return (
    <FormGroup label={t('apps.info')}>
      <Input
        aria-label={t('apps.name')}
        placeholder={t('apps.name')}
        className={FIELD_CONTROL_CLASS}
        value={form.name}
        onChange={(event) => update('name', event.target.value)}
      />

      <div className="flex h-12 items-center justify-between gap-3 px-4">
        <span className="text-sm text-white/70">{t('apps.type')}</span>
        <Combobox
          items={TYPE_ITEMS}
          value={TYPE_ITEMS.find((item) => item.value === form.type) ?? null}
          onValueChange={(value) => {
            if (value) update('type', value.value);
          }}
        >
          <ComboboxInput className="combobox-input ml-auto" aria-label={t('apps.type')} />

          <ComboboxContent>
            <ComboboxEmpty>{t('common.noOptions')}</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <AppSelectItem key={item.value} value={item} label={item.label} description={item.description} />
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </FormGroup>
  );
}
