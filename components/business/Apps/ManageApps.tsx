'use client';

import { useTranslations } from 'next-intl';
import { DragDropProvider } from '@dnd-kit/react';
import { move as moveItems } from '@dnd-kit/helpers';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EditApp } from '@/components/business/Apps/EditApp';
import { ManageAppRow } from '@/components/business/Apps/ManageAppRow';
import { LiquidGlassDialog } from '@/components/common/LiquidGlassDialog';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Loading } from '@/components/common/Loading';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/lib/api/client';
import type { AppDeleteRes } from '@/lib/services/apps';
import { useAppList } from '@/stores/app-list';

function EditAppDialog({ id, onClose }: { id?: string; onClose: () => void }) {
  const t = useTranslations();
  const [pending, setPending] = useState(false);

  return (
    <LiquidGlassDialog
      open
      size={{ width: 480, height: 760 }}
      style={{ maxHeight: '75vh' }}
      title={id ? t('apps.editTitle') : t('apps.createTitle')}
      fit
      header={false}
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <EditApp id={id} onSuccess={onClose} onCancel={onClose} onPendingChange={setPending} />
    </LiquidGlassDialog>
  );
}

export function ManageApps() {
  const t = useTranslations();
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
        <LiquidGlass className="pointer-events-auto rounded-full" contentClassName="h-full">
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
        <LiquidGlass className="pointer-events-auto size-10 rounded-full" contentClassName="h-full">
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
                <ManageAppRow
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

      {editing ? <EditAppDialog id={editing.id} onClose={() => setEditing(null)} /> : null}
    </div>
  );
}
