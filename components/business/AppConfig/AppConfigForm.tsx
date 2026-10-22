'use client';

import { useTranslations } from 'next-intl';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxList } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import type { AppOpenMode, AppPermission } from '@/lib/db/schema';
import { FormGroup, SwitchField, FIELD_CONTROL_CLASS, type AppFormProps } from './form';
import { AppSelectItem } from './AppSelectItem';

function AppPermissionField({ form, update }: AppFormProps) {
  const t = useTranslations();
  const PERMISSION_ITEMS: { value: AppPermission; label: string; description?: string }[] = [
    { value: 'public', label: t('apps.public') },
    { value: 'signed-in', label: t('apps.signedInOnly') },
  ];

  return (
    <div className="flex h-12 items-center justify-between gap-3 px-4">
      <span className="text-sm text-white/70">{t('apps.permission')}</span>
      <Combobox
        items={PERMISSION_ITEMS}
        value={PERMISSION_ITEMS.find((item) => item.value === form.permission) ?? null}
        onValueChange={(value) => {
          if (value) {
            update('permission', value.value);
          }
        }}
      >
        <ComboboxInput
          className="ml-auto h-8 w-auto border-0 px-0 focus-visible:ring-0 [&_input]:text-right"
          aria-label={t('apps.permission')}
        />
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
  );
}

function AppOpenModeField({ form, update }: AppFormProps) {
  const t = useTranslations();
  const OPEN_MODE_ITEMS: { value: AppOpenMode; label: string; description?: string }[] = [
    { value: 'newtab', label: t('apps.newTab') },
    { value: 'iframe', label: t('apps.iframe') },
    { value: 'replace', label: t('apps.replace') },
  ];

  return (
    <div className="flex h-12 items-center justify-between gap-3 px-4">
      <span className="text-sm text-white/70">{t('apps.openMode')}</span>
      <Combobox
        items={OPEN_MODE_ITEMS}
        value={OPEN_MODE_ITEMS.find((item) => item.value === form.external) ?? null}
        onValueChange={(value) => {
          if (value) {
            update('external', value.value);
          }
        }}
      >
        <ComboboxInput
          className="ml-auto h-8 w-auto border-0 px-0 focus-visible:ring-0 [&_input]:text-right"
          aria-label={t('apps.openMode')}
        />
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
  );
}

function AppWindowConfigFields({ form, update }: AppFormProps) {
  const t = useTranslations();
  const WINDOW_MODE_ITEMS: { value: AppFormProps['form']['mode']; label: string }[] = [
    { value: 'controls', label: t('apps.controlsMode') },
    { value: 'floating', label: t('apps.floatingMode') },
  ];

  return (
    <div className="divide-y divide-white/15">
      <div className="flex h-12 items-center justify-between gap-3 px-4">
        <span className="text-sm text-white/70">{t('apps.windowMode')}</span>
        <Combobox
          items={WINDOW_MODE_ITEMS}
          value={WINDOW_MODE_ITEMS.find((item) => item.value === form.mode) ?? null}
          onValueChange={(value) => {
            if (value) {
              update('mode', value.value);
            }
          }}
        >
          <ComboboxInput
            className="ml-auto h-8 w-auto border-0 px-0 focus-visible:ring-0 [&_input]:text-right"
            aria-label={t('apps.windowMode')}
          />
          <ComboboxContent>
            <ComboboxEmpty>{t('common.noOptions')}</ComboboxEmpty>
            <ComboboxList>{(item) => <AppSelectItem key={item.value} value={item} label={item.label} />}</ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
      <SwitchField
        label={t('apps.alwaysOnTop')}
        checked={form.top}
        onCheckedChange={(checked) => update('top', checked)}
      />
      <SwitchField
        label={t('apps.windowResize')}
        checked={form.resize}
        onCheckedChange={(checked) => update('resize', checked)}
      />
      {(['width', 'height'] as const).map((dimension) => (
        <label key={dimension} className="flex h-12 items-center justify-between gap-3 px-4">
          <span className="shrink-0 text-sm text-white/70">
            {t(dimension === 'width' ? 'apps.defaultWidth' : 'apps.defaultHeight')}
          </span>
          <Input
            type="number"
            min={1}
            step={1}
            className={`${FIELD_CONTROL_CLASS} ml-auto w-32 pr-0 text-right`}
            value={form[dimension]}
            onChange={(event) => update(dimension, event.target.value)}
          />
        </label>
      ))}
    </div>
  );
}

export function AppConfigForm({ form, update }: AppFormProps) {
  const t = useTranslations();

  return (
    <FormGroup label={t('apps.options')}>
      <SwitchField
        label={t('apps.status')}
        checked={form.status}
        onCheckedChange={(checked) => update('status', checked)}
      />
      <AppPermissionField form={form} update={update} />
      {form.type === 'url' ? <AppOpenModeField form={form} update={update} /> : null}
      {form.type === 'url' && form.external === 'iframe' ? <AppWindowConfigFields form={form} update={update} /> : null}
    </FormGroup>
  );
}
