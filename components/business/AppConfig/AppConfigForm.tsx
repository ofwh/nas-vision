'use client';

import { useTranslations } from 'next-intl';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxList } from '@/components/ui/combobox';
import type { AppOpenMode, AppPermission } from '@/lib/db/schema';
import { FormGroup, SwitchField, type AppFormProps } from './form';
import { AppSelectItem } from './AppSelectItem';
export function AppConfigForm({ form, update }: AppFormProps) {
  const t = useTranslations();
  const OPEN_MODE_ITEMS: { value: AppOpenMode; label: string; description?: string }[] = [
    { value: 'newtab', label: t('apps.newTab') },
    { value: 'iframe', label: t('apps.iframe') },
    { value: 'replace', label: t('apps.replace') },
  ];

  const PERMISSION_ITEMS: { value: AppPermission; label: string; description?: string }[] = [
    { value: 'public', label: t('apps.public') },
    { value: 'signed-in', label: t('apps.signedInOnly') },
  ];

  return (
    <FormGroup label={t('apps.options')}>
      {form.type === 'url' ? (
        <div className="flex h-12 items-center justify-between gap-3 px-4">
          <span className="text-sm text-white/70">{t('apps.openMode')}</span>
          <Combobox
            items={OPEN_MODE_ITEMS}
            value={OPEN_MODE_ITEMS.find((item) => item.value === form.external) ?? null}
            onValueChange={(value) => {
              if (value) update('external', value.value);
            }}
          >
            <ComboboxInput className="combobox-input" aria-label={t('apps.openMode')} />
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
      ) : null}
      <div className="flex h-12 items-center justify-between gap-3 px-4">
        <span className="text-sm text-white/70">{t('apps.permission')}</span>
        <Combobox
          items={PERMISSION_ITEMS}
          value={PERMISSION_ITEMS.find((item) => item.value === form.permission) ?? null}
          onValueChange={(value) => {
            if (value) update('permission', value.value);
          }}
        >
          <ComboboxInput className="combobox-input" aria-label={t('apps.permission')} />
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

      <SwitchField
        label={t('apps.status')}
        checked={form.status}
        onCheckedChange={(checked) => update('status', checked)}
      />
    </FormGroup>
  );
}
