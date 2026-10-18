'use client';

import { useTranslations } from 'next-intl';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { AppPreview } from '@/components/business/AppConfig/AppPreview';
import { Button } from '@/components/ui/button';
import type { JsonObject } from '@/lib/api';
import { fetchApi } from '@/lib/api/client';
import type { AppSaveRes } from '@/lib/services/apps';
import type { PluginConfig } from '@/lib/plugins/types';
import { pluginRequest } from '@/lib/plugins/client';
import { useAppList } from '@/stores/app-list';
import { AppInfoForm } from './AppInfoForm';
import { AppUrlConfigForm } from './AppUrlConfigForm';
import { AppPluginConfigForm } from './AppPluginConfigForm';
import { AppConfigForm } from './AppConfigForm';
import { toForm, type AppForm } from './form';

export type AppEditProps = {
  /** 有值是编辑，没有是新增。 */
  id?: string;
  onSuccess: () => void;
  onCancel: () => void;
  onPendingChange?: (pending: boolean) => void;
};

export function AppEdit({ id, onSuccess, onCancel, onPendingChange }: AppEditProps) {
  const t = useTranslations();
  const app = useAppList((state) => state.apps.find((item) => item.id === id));
  const [form, setForm] = useState<AppForm>(() => toForm(app));
  const [pluginName, setPluginName] = useState(typeof app?.config.pluginName === 'string' ? app.config.pluginName : '');
  const [pluginConfig, setPluginConfig] = useState<PluginConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof AppForm>(key: K, value: AppForm[K]) => {
    if (key === 'type') setPluginConfig(null);
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const submit = async () => {
    if (saving) return;
    setError(null);
    if (!form.name.trim()) {
      setError(t('apps.nameRequired'));
      return;
    }

    if (form.type === 'plugin' && (!pluginName || pluginConfig === null)) {
      setError(t('apps.pluginRequired'));
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
      config: form.type === 'plugin' ? { pluginName } : app?.type === 'url' ? app.config : {},
    };
    if (id) params.id = id;

    setSaving(true);
    onPendingChange?.(true);
    try {
      if (form.type === 'plugin' && pluginConfig)
        await pluginRequest('/api/plugin/update', { id: pluginName, config: pluginConfig });
      const response = await fetchApi<AppSaveRes>('/api/apps/update', params);
      if (!response.success) {
        setError(response.message);
        return;
      }
      await useAppList.getState().list();
      onSuccess();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('common.connectionFailed'));
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
      <fieldset disabled={saving} className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-x-hidden overflow-y-auto">
        <AppInfoForm form={form} update={update} />
        {form.type === 'url' ? (
          <AppUrlConfigForm form={form} update={update} />
        ) : (
          <AppPluginConfigForm
            key={pluginName}
            name={pluginName}
            onNameChange={(name) => {
              setPluginName(name);
              setPluginConfig(null);
            }}
            onConfigChange={setPluginConfig}
          />
        )}
        <AppConfigForm form={form} update={update} />

        {error ? (
          <p role="alert" className="shrink-0 px-4 text-sm text-white/70">
            {error}
          </p>
        ) : null}
      </fieldset>
    </div>
  );
}
