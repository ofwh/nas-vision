'use client';

import { useTranslations } from 'next-intl';
import { Check, CircleChevronDown, X } from 'lucide-react';
import { Children, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { LiquidGlassDialog } from '@/components/common/LiquidGlassDialog';
import { LogoPicker } from '@/components/business/Apps/LogoPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { useSettings } from '@/stores/settings';
import { useAppList } from '@/stores/app-list';

/** 设计尺寸 480×760。 */
const DIALOG_SIZE = { width: 480, height: 760 };

/** 高度上限跟视口走，矮屏上不至于顶到上下边。 */
const DIALOG_MAX_HEIGHT = '75vh';

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

/** 预览的图标 + 名字：展示效果与 AppItem 保持一致。图标即换图入口。 */
function AppPreview({
  name,
  image,
  onImageChange,
}: {
  name: string;
  image: string;
  onImageChange: (url: string) => void;
}) {
  const t = useTranslations();
  const veil = useSettings((state) => state.veil);
  const barRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    const bar = barRef.current;
    const text = textRef.current;
    if (!bar || !text) return;

    const measure = () => setOverflow(Math.max(0, text.scrollWidth - bar.clientWidth));
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(bar);
    observer.observe(text);
    return () => observer.disconnect();
  }, [name]);

  return (
    <div className="group flex h-52 w-60">
      <div className="h-full w-5" />

      <div className="h-full w-full pt-6.5">
        <div className="flex h-40 w-full flex-col items-center justify-center gap-2.5">
          <Popover open={picking} onOpenChange={setPicking}>
            <PopoverTrigger aria-label={t('apps.changeIcon')} className="relative rounded-full outline-none">
              {/* 别在玻璃上写 opacity：会自建 backdrop 根，毛玻璃就看不到背景了 */}
              <LiquidGlass
                className="h-32 w-32 cursor-pointer rounded-full"
                contentClassName="h-full"
                variant={veil ? 'veil' : 'glass'}
              >
                {image ? <img src={image} alt="" className="h-full w-full rounded-full object-cover" /> : null}
              </LiquidGlass>

              {/* 压住圆形边缘的指示箭头：深色投影保证浅色图标上也看得见 */}
              <CircleChevronDown
                aria-hidden
                strokeWidth={1.8}
                className="absolute right-1 bottom-0 size-7 text-white drop-shadow-[0_1px_3px_rgb(0_0_0/0.6)]"
              />
            </PopoverTrigger>

            {/* 底子交给 LiquidGlass，弹层自带的浅色底与描边全部让掉 */}
            <PopoverContent
              side="bottom"
              align="center"
              sideOffset={10}
              className="w-auto gap-0 rounded-3xl border-0 bg-transparent p-0 text-white shadow-none ring-0"
            >
              <LiquidGlass className="rounded-3xl" contentClassName="h-full" variant={veil ? 'veil' : 'glass'}>
                <LogoPicker
                  value={image}
                  onConfirm={(url) => {
                    onImageChange(url);
                    setPicking(false);
                  }}
                />
              </LiquidGlass>
            </PopoverContent>
          </Popover>

          <div
            ref={barRef}
            className="relative z-10 flex h-5.5 max-w-50 items-center overflow-hidden rounded-md text-sm text-white"
          >
            <span
              ref={textRef}
              className={overflow > 0 ? 'group-hover:animate-marquee whitespace-nowrap' : 'whitespace-nowrap'}
              style={{ '--marquee-shift': `-${overflow}px` } as CSSProperties}
            >
              {name}
            </span>
          </div>
        </div>
      </div>

      <div className="h-full w-5" />
    </div>
  );
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
  onClose?: () => void;
};

export function EditApp({ id, onClose }: EditAppProps) {
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

  const veil = useSettings((state) => state.veil);
  const app = useAppList((state) => state.apps.find((item) => item.id === id));
  const [form, setForm] = useState<AppForm>(() => toForm(app));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof AppForm>(key: K, value: AppForm[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const submit = async () => {
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
    const response = await fetchApi<AppSaveRes>('/api/apps/update', params);
    setSaving(false);

    if (!response.success) {
      setError(response.message);
      return;
    }

    await useAppList.getState().list();
    onClose?.();
  };

  return (
    <LiquidGlassDialog
      open
      size={DIALOG_SIZE}
      style={{ maxHeight: DIALOG_MAX_HEIGHT }}
      title={id ? t('apps.editTitle') : t('apps.createTitle')}
      fit
      header={false}
      onOpenChange={() => {}}
      onClose={onClose}
    >
      <div className="flex h-full min-h-0 flex-col gap-3 bg-[#545458]/25 p-4">
        <div className="flex shrink-0 items-center justify-between">
          <LiquidGlass className="size-10 rounded-full" contentClassName="h-full" variant={veil ? 'veil' : 'glass'}>
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label={t('common.close')}
              title={t('common.close')}
              className="rounded-full text-white hover:bg-white/15 hover:text-white"
              onClick={onClose}
            >
              <X aria-hidden className="size-5" />
            </Button>
          </LiquidGlass>

          <LiquidGlass className="size-10 rounded-full" contentClassName="h-full" variant={veil ? 'veil' : 'glass'}>
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
    </LiquidGlassDialog>
  );
}
