'use client';

import { useTranslations } from 'next-intl';
import { Check, X } from 'lucide-react';
import { Children, useState, type ReactNode } from 'react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { AppPreview } from '@/components/business/Apps/AppPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Switch } from '@/components/ui/switch';
import type { JsonObject } from '@/lib/api';
import { fetchApi } from '@/lib/api/client';
import type { AppOpenMode, AppPermission, AppType } from '@/lib/db/schema';
import type { AppItem as AppRecord, AppSaveRes } from '@/lib/services/apps';
import { useAppList } from '@/stores/app-list';

/** 表单只放用户能改的字段，scale / config 由库里原样带过。 */
type AppForm = {
  name: string;
  image: string;
  type: AppType;
  url: string;
  innerUrl: string;
  external: AppOpenMode;
  permission: AppPermission;
  status: boolean;
};

function toForm(app?: AppRecord): AppForm {
  return {
    name: app?.name ?? '',
    image: app?.image ?? '',
    type: app?.type ?? 'url',
    url: app?.url ?? '',
    innerUrl: app?.innerUrl ?? '',
    external: app?.external ?? 'newtab',
    permission: app?.permission ?? 'public',
    status: app ? app.status === 1 : true,
  };
}

const FIELD_CONTROL_CLASS =
  'h-12 w-full rounded-none border-0 bg-transparent px-4 text-white shadow-none placeholder:text-white/50 focus-visible:border-transparent focus-visible:ring-0 focus-visible:bg-white/5 dark:bg-transparent';

function FormGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="shrink-0 overflow-hidden rounded-2xl bg-white/8 px-4">
      <div className="divide-y divide-white/15">
        {Children.map(children, (child) => (
          <div className="-mx-4">{child}</div>
        ))}
      </div>
    </div>
  );
}

function SwitchField({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex h-12 cursor-pointer items-center justify-between gap-3 px-4">
      <span className="text-sm text-white/70">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

export type EditAppProps = {
  /** 有值是编辑，没有是新增。 */
  id?: string;
  onSuccess: () => void;
  onCancel: () => void;
  onPendingChange?: (pending: boolean) => void;
};

export function EditApp({ id, onSuccess, onCancel, onPendingChange }: EditAppProps) {
  const t = useTranslations();
  const TYPE_ITEMS: { value: AppType; label: string }[] = [{ value: 'url', label: t('apps.pageType') }];

  const OPEN_MODE_ITEMS: { value: AppOpenMode; label: string }[] = [
    { value: 'newtab', label: t('apps.newTab') },
    { value: 'iframe', label: t('apps.iframe') },
    { value: 'replace', label: t('apps.replace') },
  ];

  const PERMISSION_ITEMS: { value: AppPermission; label: string }[] = [
    { value: 'public', label: t('apps.public') },
    { value: 'signed-in', label: t('apps.signedInOnly') },
  ];

  const app = useAppList((state) => state.apps.find((item) => item.id === id));
  const [form, setForm] = useState<AppForm>(() => toForm(app));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof AppForm>(key: K, value: AppForm[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const submit = async () => {
    if (saving) return;
    setError(null);
    if (!form.name.trim()) {
      setError(t('apps.nameRequired'));
      return;
    }

    const params: JsonObject = {
      name: form.name,
      type: form.type,
      image: form.image,
      scale: app?.scale ?? 100,
      external: form.external,
      permission: form.permission,
      url: form.url,
      innerUrl: form.innerUrl,
      config: app?.config ?? {},
    };
    if (id) params.id = id;

    setSaving(true);
    onPendingChange?.(true);
    try {
      const response = await fetchApi<AppSaveRes>('/api/apps/update', params);
      if (!response.success) {
        setError(response.message);
        return;
      }
      await useAppList.getState().list();
      onSuccess();
    } catch {
      setError(t('common.connectionFailed'));
    } finally {
      setSaving(false);
      onPendingChange?.(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 bg-[#545458]/25 p-4">
      <div className="flex shrink-0 items-center justify-between">
        <LiquidGlass className="size-10 rounded-full" contentClassName="h-full">
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={t('common.close')}
            title={t('common.close')}
            className="rounded-full text-white hover:bg-white/15 hover:text-white"
            disabled={saving}
            onClick={onCancel}
          >
            <X aria-hidden className="size-5" />
          </Button>
        </LiquidGlass>

        <LiquidGlass className="size-10 rounded-full" contentClassName="h-full">
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={saving ? t('common.saving') : t('common.save')}
            title={t('common.save')}
            disabled={saving}
            onClick={submit}
            className="rounded-full text-white hover:bg-white/15 hover:text-white"
          >
            <Check aria-hidden className="size-5" />
          </Button>
        </LiquidGlass>
      </div>

      <div className="flex h-52 shrink-0 items-center justify-center">
        <AppPreview name={form.name} image={form.image} onImageChange={(url) => update('image', url)} />
      </div>

      {/* overflow-x-hidden 挡掉"overflow-y 非 visible"连带出来的横向滚动条 */}
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-x-hidden overflow-y-auto">
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
              <ComboboxInput className="combobox-input" aria-label={t('apps.type')} />

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

          <Input
            aria-label={t('apps.url')}
            placeholder={t('apps.url')}
            className={FIELD_CONTROL_CLASS}
            value={form.url}
            onChange={(event) => update('url', event.target.value)}
          />

          <Input
            aria-label={t('apps.innerUrl')}
            placeholder={t('apps.innerUrl')}
            className={FIELD_CONTROL_CLASS}
            value={form.innerUrl}
            onChange={(event) => update('innerUrl', event.target.value)}
          />
        </FormGroup>

        <FormGroup label={t('apps.options')}>
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
                    <ComboboxItem key={item.value} value={item}>
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

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
                    <ComboboxItem key={item.value} value={item}>
                      {item.label}
                    </ComboboxItem>
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

        {error ? (
          <p role="alert" className="shrink-0 px-4 text-sm text-white/70">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
