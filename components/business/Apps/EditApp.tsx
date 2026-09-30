'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { LiquidGlassDialog } from '@/components/common/LiquidGlassDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { JsonObject } from '@/lib/api';
import { fetchApi } from '@/lib/api/client';
import type { AppType, Flag } from '@/lib/db/schema';
import type { AppItem as AppRecord, AppSaveRes } from '@/lib/services/apps';
import { useApp } from '@/stores/app';
import { useAppList } from '@/stores/app-list';

/** 设计尺寸 640×800，矮屏靠 style 的 maxHeight 收口。 */
const DIALOG_SIZE = { width: 640, height: 800 };

const TYPE_ITEMS: { value: AppType; label: string }[] = [{ value: 'url', label: '页面' }];

/** 库里用 0 / 1 存开关。 */
const toFlag = (on: boolean): Flag => (on ? 1 : 0);

/** 表单只放用户能改的字段，scale / config 由库里原样带过。 */
type AppForm = {
  name: string;
  image: string;
  type: AppType;
  url: string;
  innerUrl: string;
  external: boolean;
  status: boolean;
};

function toForm(app?: AppRecord): AppForm {
  return {
    name: app?.name ?? '',
    image: app?.image ?? '',
    type: app?.type ?? 'url',
    url: app?.url ?? '',
    innerUrl: app?.innerUrl ?? '',
    // 新增时跟库里的默认值走：external / status 都默认 1
    external: app ? app.external === 1 : true,
    status: app ? app.status === 1 : true,
  };
}

/** 预览的图标 + 名字：展示效果与 AppItem 保持一致。 */
function AppPreview({ name, image }: { name: string; image: string }) {
  const veil = useApp((state) => state.veil);
  const barRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);

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
        <div className="flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2.5">
          {/* 别在玻璃上写 opacity：会自建 backdrop 根，毛玻璃就看不到背景了 */}
          <LiquidGlass
            className="h-32 w-32 rounded-full transition-transform duration-500 ease-out hover:scale-110"
            contentClassName="h-full"
            variant={veil ? 'veil' : 'glass'}
          >
            {image ? <img src={image} alt="" className="h-full w-full rounded-full object-cover" /> : null}
          </LiquidGlass>

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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-sm text-white/70">{label}</span>
      {children}
    </label>
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
    <label className="flex h-9 cursor-pointer items-center justify-between gap-3">
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
  const app = useAppList((state) => state.apps.find((item) => item.id === id));
  const [form, setForm] = useState<AppForm>(() => toForm(app));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof AppForm>(key: K, value: AppForm[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const submit = async () => {
    if (!form.name.trim()) {
      setError('请先填写名称');
      return;
    }

    const params: JsonObject = {
      name: form.name,
      type: form.type,
      image: form.image,
      scale: app?.scale ?? 100,
      external: toFlag(form.external),
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

    await useAppList.getState().reload();
    onClose?.();
  };

  return (
    <LiquidGlassDialog
      open
      size={{ width: 640, height: 760 }}
      style={{ maxHeight: '760px' }}
      title={id ? '编辑应用' : '新增应用'}
      fit
      header={false}
      onOpenChange={() => {}}
      onClose={onClose}
    >
      <div className="flex h-full min-h-0 flex-col gap-3 bg-[#545458]/25 p-4">
        <div className="flex h-52 shrink-0 items-center justify-center">
          <AppPreview name={form.name} image={form.image} />
        </div>

        {/* overflow-x-hidden 挡掉"overflow-y 非 visible"连带出来的横向滚动条 */}
        <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-x-hidden overflow-y-auto">
          <Field label="图片">
            <div className="flex gap-2">
              <Input
                value={form.image}
                onChange={(event) => update('image', event.target.value)}
                placeholder="/images/icons/app.png"
              />
              {/* TODO: 上传接口定下来再接 */}
              <Button
                variant="outline"
                type="button"
                className="border-white/25 bg-white/10 text-white opacity-50 hover:bg-white/20 hover:text-white"
              >
                上传
              </Button>
            </div>
          </Field>

          <Field label="名称">
            <Input value={form.name} onChange={(event) => update('name', event.target.value)} />
          </Field>

          <Field label="类型">
            <Select
              items={TYPE_ITEMS}
              value={form.type}
              onValueChange={(value) => {
                if (value) update('type', value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {TYPE_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="页面地址">
            <Input value={form.url} onChange={(event) => update('url', event.target.value)} />
          </Field>

          <Field label="内网地址（可选）">
            <Input value={form.innerUrl} onChange={(event) => update('innerUrl', event.target.value)} />
          </Field>

          <SwitchField
            label="新页面打开"
            checked={form.external}
            onCheckedChange={(checked) => update('external', checked)}
          />

          <SwitchField label="状态" checked={form.status} onCheckedChange={(checked) => update('status', checked)} />
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          {error ? <span className="mr-auto text-sm text-white/70">{error}</span> : null}

          <Button variant="ghost" className="text-white/85 hover:bg-white/12 hover:text-white" onClick={onClose}>
            取消
          </Button>

          <Button
            variant="outline"
            disabled={saving}
            onClick={submit}
            className="border-white/25 bg-white/15 text-white hover:bg-white/25 hover:text-white"
          >
            保存
          </Button>
        </div>
      </div>
    </LiquidGlassDialog>
  );
}
