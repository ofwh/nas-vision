'use client';

import { useTranslations } from 'next-intl';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { move as moveItems } from '@dnd-kit/helpers';
import { Menu, Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EditApp } from '@/components/business/Apps/EditApp';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Loading } from '@/components/common/Loading';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/lib/api/client';
import type { AppDeleteRes, AppItem } from '@/lib/services/apps';
import { useSettings } from '@/stores/settings';
import { useAppList } from '@/stores/app-list';

function AppRow({
  app,
  index,
  disabled,
  onEdit,
  removing,
  pending,
  deleting,
  onRemove,
  onDelete,
}: {
  app: AppItem;
  index: number;
  disabled: boolean;
  onEdit: (app: AppItem) => void;
  removing: boolean;
  pending: boolean;
  deleting: boolean;
  onRemove: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations();
  const { ref, handleRef, isDragging } = useSortable({ id: app.id, index, disabled });

  return (
    <div
      ref={ref}
      className={`flex items-center gap-3.5 px-4 py-2.5 transition-colors hover:bg-white/6 ${isDragging ? 'relative z-10 rounded-xl bg-white/15 shadow-xl' : ''}`}
    >
      <div
        className={`shrink-0 overflow-hidden transition-[width,margin,opacity] duration-200 motion-reduce:transition-none ${removing ? 'w-6 opacity-100' : '-mr-3.5 w-0 opacity-0'}`}
      >
        {removing ? (
          <button
            type="button"
            aria-label={t('apps.deleteNamed', { name: app.name })}
            aria-expanded={pending}
            disabled={deleting}
            onClick={onRemove}
            className="flex size-6 cursor-pointer items-center justify-center rounded-full bg-[#ff3b30] text-white outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-50"
          >
            <Minus aria-hidden className="size-4" strokeWidth={3} />
          </button>
        ) : null}
      </div>
      <button
        type="button"
        disabled={removing || disabled}
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

      {pending && removing ? (
        <Button
          variant="ghost"
          disabled={deleting}
          onClick={onDelete}
          aria-label={t('apps.confirmDeleteNamed', { name: app.name })}
          className="self-stretch rounded-lg bg-[#ff3b30] px-4 text-white hover:bg-[#ff3b30]/85 hover:text-white"
        >
          {deleting ? t('common.deleting') : t('common.delete')}
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon-sm"
          ref={handleRef}
          disabled={disabled}
          title={t('apps.dragHint')}
          aria-label={t('apps.reorderNamed', { name: app.name })}
          className="cursor-grab touch-none text-white/55 hover:bg-white/12 hover:text-white active:cursor-grabbing"
        >
          <Menu aria-hidden />
        </Button>
      )}
    </div>
  );
}

/** 应用管理：顶部操作、列表编辑及删除，增改走 EditApp 弹窗。 */
export function ManageApps() {
  const t = useTranslations();
  const veil = useSettings((state) => state.veil);
  const [dragging, setDragging] = useState(false);
  const sorting = useAppList((state) => state.sorting);
  const sortError = useAppList((state) => state.sortError);
  const move = useAppList((state) => state.move);
  const [removing, setRemoving] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const apps = useAppList((state) => state.apps);
  const status = useAppList((state) => state.status);
  const error = useAppList((state) => state.error);
  const list = useAppList((state) => state.list);
  const [editing, setEditing] = useState<{ id?: string } | null>(null);

  useEffect(() => {
    void list();
  }, [list]);

  const busy = dragging || sorting || deletingId !== null;

  const remove = async (id: string) => {
    if (busy) return;
    setDeletingId(id);
    setDeleteError(null);
    try {
      const response = await fetchApi<AppDeleteRes>('/api/apps/delete', { id });
      if (!response.success) {
        setDeleteError(response.message);
        return;
      }
      setPendingId(null);
      await useAppList.getState().list();
    } catch {
      setDeleteError(t('apps.deleteFailed'));
    } finally {
      setDeletingId(null);
    }
  };

  // idle 是首帧（effect 还没跑），和 loading 一起当加载态，免得先闪一屏空列表
  const loading = status === 'idle' || status === 'loading';

  return (
    <div className="relative h-full min-h-0 overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-0 z-10 flex h-18 w-full items-center justify-end gap-3 bg-linear-to-b from-[#545458]/65 via-[#545458]/30 to-transparent px-6">
        <LiquidGlass
          className="pointer-events-auto rounded-full"
          contentClassName="h-full"
          variant={veil ? 'veil' : 'glass'}
        >
          <Button
            variant="ghost"
            aria-pressed={removing}
            disabled={busy}
            onClick={() => {
              setRemoving((value) => !value);
              setPendingId(null);
              setDeleteError(null);
            }}
            className="h-10 rounded-full px-5 text-white hover:bg-white/15 hover:text-white"
          >
            {removing ? t('common.done') : t('common.edit')}
          </Button>
        </LiquidGlass>
        <LiquidGlass
          className="pointer-events-auto size-10 rounded-full"
          contentClassName="h-full"
          variant={veil ? 'veil' : 'glass'}
        >
          <Button
            variant="ghost"
            size="icon-lg"
            disabled={busy}
            aria-label={t('apps.add')}
            title={t('apps.add')}
            onClick={() => setEditing({})}
            className="rounded-full text-white hover:bg-white/15 hover:text-white"
          >
            <Plus aria-hidden className="size-5" />
          </Button>
        </LiquidGlass>
      </div>
      <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain p-5 pt-18">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loading />
          </div>
        ) : (
          <DragDropProvider
            onDragStart={() => {
              setDragging(true);
              setPendingId(null);
            }}
            onDragEnd={(event) => {
              setDragging(false);
              if (event.canceled) return;
              const ordered = moveItems(apps, event);
              const id = String(event.operation.source?.id ?? '');
              const index = ordered.findIndex((app) => app.id === id);
              if (index >= 0) void move(id, ordered[index + 1]?.id ?? null);
            }}
          >
            <div
              className="shrink-0 divide-y divide-white/10 overflow-hidden rounded-3xl bg-white/8"
              aria-busy={sorting}
            >
              {apps.map((app, index) => (
                <AppRow
                  key={app.id}
                  app={app}
                  index={index}
                  disabled={sorting || deletingId !== null || editing !== null}
                  onEdit={(item) => setEditing({ id: item.id })}
                  removing={removing}
                  pending={pendingId === app.id}
                  deleting={busy}
                  onRemove={() => setPendingId((value) => (value === app.id ? null : app.id))}
                  onDelete={() => void remove(app.id)}
                />
              ))}
            </div>
          </DragDropProvider>
        )}

        <p role="status" aria-live="polite" className="sr-only">
          {sorting ? t('apps.savingOrder') : dragging ? t('apps.reordering') : ''}
        </p>
        {sortError ? (
          <p role="alert" className="px-1 text-sm text-red-300">
            {t('apps.sortFailed', { error: sortError })}
          </p>
        ) : null}
        {status === 'error' ? <p className="px-1 text-sm text-white/70">{error}</p> : null}

        {deleteError ? (
          <p role="alert" className="px-1 text-sm text-red-300">
            {deleteError}
          </p>
        ) : null}
      </div>

      {editing ? <EditApp id={editing.id} onClose={() => setEditing(null)} /> : null}
    </div>
  );
}
