import { Children, type ReactNode } from 'react';
import { Switch } from '@/components/ui/switch';
import type { AppOpenMode, AppPermission, AppType } from '@/lib/db/schema';
import type { AppItem as AppRecord } from '@/lib/services/apps';

export type AppForm = {
  name: string;
  image: string;
  type: AppType;
  url: string;
  innerUrl: string;
  external: AppOpenMode;
  permission: AppPermission;
  status: boolean;
  mode: 'controls' | 'floating';
  top: boolean;
  resize: boolean;
  width: string;
  height: string;
};

export function toForm(app?: AppRecord): AppForm {
  return {
    name: app?.name ?? '',
    image: app?.image ?? '',
    type: app?.type ?? 'url',
    url: app?.url ?? '',
    innerUrl: app?.innerUrl ?? '',
    external: app?.external ?? 'newtab',
    permission: app?.permission ?? 'public',
    status: app ? app.status === 1 : true,
    mode: app?.config.mode === 'floating' ? 'floating' : 'controls',
    top: app?.config.top === true,
    resize: app?.config.resize === true,
    width: String(typeof app?.config.width === 'number' && app.config.width > 0 ? app.config.width : 1280),
    height: String(typeof app?.config.height === 'number' && app.config.height > 0 ? app.config.height : 800),
  };
}

export const FIELD_CONTROL_CLASS =
  'h-12 w-full rounded-none border-0 bg-transparent px-4 text-white shadow-none placeholder:text-white/50 focus-visible:border-transparent focus-visible:ring-0 focus-visible:bg-white/5 dark:bg-transparent';

export function FormGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="shrink-0 overflow-hidden rounded-2xl bg-white/8 px-4">
      <div className="divide-y divide-white/15">
        {Children.map(
          Children.toArray(children).filter((child) => child !== ''),
          (child) => (
            <div className="-mx-4">{child}</div>
          ),
        )}
      </div>
    </div>
  );
}

export function SwitchField({
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
      <Switch className="ml-auto shrink-0" checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

export type AppFormProps = { form: AppForm; update: <K extends keyof AppForm>(key: K, value: AppForm[K]) => void };
