'use client';

import { Menu, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EditApp } from '@/components/business/Apps/EditApp';
import { Loading } from '@/components/common/Loading';
import { Button } from '@/components/ui/button';
import type { AppItem } from '@/lib/services/apps';
import { useAppList } from '@/stores/app-list';

function AppRow({ app, onEdit }: { app: AppItem; onEdit: (app: AppItem) => void }) {
  return (
    <div className="flex items-center gap-3.5 px-4 py-2.5 transition-colors hover:bg-white/6">
      <button
        type="button"
        onClick={() => onEdit(app)}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3.5 text-left"
      >
        {app.image ? (
          <img src={app.image} alt="" className="size-10 shrink-0 rounded-md object-cover" />
        ) : (
          <span aria-hidden className="size-10 shrink-0 rounded-md bg-white/10" />
        )}

        <span className="min-w-0 flex-1 truncate text-sm">{app.name}</span>
      </button>

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`调整 ${app.name} 的排序`}
        className="text-white/55 hover:bg-white/12 hover:text-white"
      >
        <Menu aria-hidden />
      </Button>
    </div>
  );
}

/** 应用列表：行的展示 + 底部的添加入口，增改都走 EditApp 弹窗。 */
export function ManageApps() {
  const apps = useAppList((state) => state.apps);
  const status = useAppList((state) => state.status);
  const error = useAppList((state) => state.error);
  const load = useAppList((state) => state.load);
  const [editing, setEditing] = useState<{ id?: string } | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  // idle 是首帧（effect 还没跑），和 loading 一起当加载态，免得先闪一屏空列表
  const loading = status === 'idle' || status === 'loading';

  return (
    <div className="flex flex-col gap-3">
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loading />
        </div>
      ) : (
        <div className="divide-y divide-white/10 overflow-hidden rounded-3xl bg-white/8">
          {apps.map((app) => (
            <AppRow key={app.id} app={app} onEdit={(item) => setEditing({ id: item.id })} />
          ))}
        </div>
      )}

      {status === 'error' ? <p className="px-1 text-sm text-white/70">{error}</p> : null}

      <Button
        variant="ghost"
        onClick={() => setEditing({})}
        className="h-12 w-full justify-center gap-3 rounded-2xl bg-white/8 px-4 text-sm text-white/80 hover:bg-white/15 hover:text-white"
      >
        添加应用
      </Button>

      {editing ? <EditApp id={editing.id} onClose={() => setEditing(null)} /> : null}
    </div>
  );
}
