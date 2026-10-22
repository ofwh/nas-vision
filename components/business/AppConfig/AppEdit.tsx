'use client';

import { useTranslations } from 'next-intl';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { AppPreview } from '@/components/business/AppConfig/AppPreview';
import { Button } from '@/components/ui/button';
import plugins from '@/components/plugins';
import { useToast } from '@/hooks/useToast';
import type { JsonObject } from '@/lib/api';
import { fetchApi } from '@/lib/api/client';
import { isPluginFieldEmpty, matchesPluginCondition } from '@/lib/plugins/config';
import type { AppSaveRes } from '@/lib/services/apps';
import type { PluginConfig } from '@/types/plugins';
import { usePlugin } from '@/hooks/usePlugin';
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

function AppEditActions({
  saving,
  onCancel,
  onSubmit,
}: {
  saving: boolean;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
}) {
  const t = useTranslations();

  return (
    <div className="flex shrink-0 items-center justify-between">
      <LiquidGlass className="size-10 rounded-full" contentClassName="h-full">
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label={t('common.close')}
          title={t('common.close')}
          className="rounded-full text-white"
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
          onClick={onSubmit}
          className="rounded-full text-white"
        >
          <Check aria-hidden className="size-5" />
        </Button>
      </LiquidGlass>
    </div>
  );
}

export function AppEdit({ id, onSuccess, onCancel, onPendingChange }: AppEditProps) {
  const t = useTranslations();
  const toast = useToast();
  const app = useAppList((state) => state.apps.find((item) => item.id === id));
  const [form, setForm] = useState<AppForm>(() => toForm(app));
  const [pluginName, setPluginName] = useState(typeof app?.config.pluginName === 'string' ? app.config.pluginName : '');
  const plugin = usePlugin(pluginName);
  const [pluginConfig, setPluginConfig] = useState<PluginConfig | null>(null);

  const [saving, setSaving] = useState(false);

  const update = <K extends keyof AppForm>(key: K, value: AppForm[K]) => {
    if (key === 'type') {
      setPluginConfig(null);
    }

    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const submit = async () => {
    if (saving) {
      return;
    }

    if (!form.image.trim()) {
      toast.add({ type: 'error', title: t('apps.imageRequired') });

      return;
    }

    if (!form.name.trim()) {
      toast.add({ type: 'error', title: t('apps.nameRequired') });

      return;
    }

    if (form.type === 'url' && !form.url.trim()) {
      toast.add({ type: 'error', title: t('apps.urlRequired') });

      return;
    }

    if (form.type === 'plugin' && (!pluginName || pluginConfig === null || !plugin.app.manifest)) {
      toast.add({ type: 'error', title: t('apps.pluginRequired') });

      return;
    }

    if (form.type === 'plugin' && pluginConfig) {
      const missingField = plugin.app.manifest?.configs?.find(
        (field) =>
          field.required &&
          matchesPluginCondition(field.conditions, pluginConfig) &&
          isPluginFieldEmpty(pluginConfig[field.key]),
      );

      if (missingField) {
        toast.add({ type: 'error', title: t('apps.pluginFieldRequired', { label: missingField.label }) });

        return;
      }
    }

    if (
      form.type === 'url' &&
      form.external === 'iframe' &&
      ![form.width, form.height].every((value) => Number.isSafeInteger(Number(value)) && Number(value) > 0)
    ) {
      toast.add({ type: 'error', title: t('apps.windowSizeInvalid') });

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
      config:
        form.type === 'plugin'
          ? { pluginName }
          : {
              ...(app?.type === 'url' ? app.config : {}),
              mode: form.mode,
              top: form.top,
              resize: form.resize,
              width: Number(form.width) || 1280,
              height: Number(form.height) || 800,
            },
    };

    if (id) {
      params.id = id;
    }

    setSaving(true);
    onPendingChange?.(true);
    try {
      if (form.type === 'plugin' && pluginConfig) {
        await plugin.config.update(pluginConfig);
      }

      const response = await fetchApi<AppSaveRes>('/api/apps/update', params);

      if (!response.success) {
        toast.add({ type: 'error', title: response.message });

        return;
      }

      await useAppList.getState().list();
      onSuccess();
    } catch (cause) {
      toast.add({ type: 'error', title: cause instanceof Error ? cause.message : t('common.connectionFailed') });
    } finally {
      setSaving(false);
      onPendingChange?.(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 bg-[#545458]/25 p-4">
      <AppEditActions saving={saving} onCancel={onCancel} onSubmit={submit} />

      <div className="flex h-52 shrink-0 items-center justify-center">
        <AppPreview
          name={form.name}
          image={form.image}
          suggestedImage={form.type === 'plugin' ? plugin.app.manifest?.icon || undefined : undefined}
          onImageChange={(url) => update('image', url)}
        />
      </div>

      <ScrollArea className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <fieldset disabled={saving} className="flex min-w-0 flex-col gap-2.5">
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
                const icon = plugins[name]?.manifest.icon;

                if (icon) {
                  update('image', icon);
                }
              }}
              onConfigChange={setPluginConfig}
            />
          )}
          <AppConfigForm form={form} update={update} />
        </fieldset>
      </ScrollArea>
    </div>
  );
}
