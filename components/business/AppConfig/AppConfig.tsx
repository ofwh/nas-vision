'use client';

import { useTranslations } from 'next-intl';
import { DragDropProvider } from '@dnd-kit/react';
import { move as moveItems } from '@dnd-kit/helpers';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppEdit } from '@/components/business/AppConfig/AppEdit';
import { AppRow } from '@/components/business/AppConfig/AppRow';
import { WindowContent } from '@/components/common/SplitWindowModal';
import { LiquidGlassModal } from '@/components/common/LiquidGlassModal';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Loading } from '@/components/common/Loading';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/lib/api/client';
import type { AppItem, AppDeleteRes } from '@/lib/services/apps';
import { useAppList } from '@/stores/app-list';
import { useToast } from '@/hooks/useToast';

function AppConfigActions({
  removing,
  busy,
  onToggleRemoving,
  onAdd,
}: {
  removing: boolean;
  busy: boolean;
  onToggleRemoving: () => void;
  onAdd: () => void;
}) {
  const t = useTranslations();

  return (
    <>
      <LiquidGlass className="pointer-events-auto rounded-full" contentClassName="h-full">
        <Button
          variant="ghost"
          aria-pressed={removing}
          disabled={busy}
          onClick={onToggleRemoving}
          className="h-10 rounded-full px-5 text-white"
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
          onClick={onAdd}
          className="rounded-full text-white"
        >
          <Plus aria-hidden className="size-5" />
        </Button>
      </LiquidGlass>
    </>
  );
}

function SortableAppList({
  apps,
  sorting,
  disabled,
  removing,
  pendingId,
  busy,
  onDraggingChange,
  onPendingChange,
  onTogglePending,
  onMove,
  onEdit,
  onDelete,
}: {
  apps: AppItem[];
  sorting: boolean;
  disabled: boolean;
  removing: boolean;
  pendingId: string | null;
  busy: boolean;
  onDraggingChange: (dragging: boolean) => void;
  onPendingChange: (id: string | null) => void;
  onTogglePending: (id: string) => void;
  onMove: (id: string, beforeId: string | null) => Promise<void>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <DragDropProvider
      onDragStart={() => {
        onDraggingChange(true);
        onPendingChange(null);
      }}
      onDragEnd={(event) => {
        onDraggingChange(false);
        if (event.canceled) {
          return;
        }

        const ordered = moveItems(apps, event);
        const id = String(event.operation.source?.id ?? '');
        const index = ordered.findIndex((app) => app.id === id);

        if (index >= 0) {
          void onMove(id, ordered[index + 1]?.id ?? null);
        }
      }}
    >
      <div className="shrink-0 divide-y divide-white/10 overflow-hidden rounded-3xl bg-white/8" aria-busy={sorting}>
        {apps.map((app, index) => (
          <AppRow
            key={app.id}
            app={app}
            index={index}
            disabled={disabled}
            onEdit={(item) => onEdit(item.id)}
            removing={removing}
            pending={pendingId === app.id}
            deleting={busy}
            onRemove={() => onTogglePending(app.id)}
            onDelete={() => void onDelete(app.id)}
          />
        ))}
      </div>
    </DragDropProvider>
  );
}

function AppEditDialog({ id, onClose }: { id?: string; onClose: () => void }) {
  const t = useTranslations();
  const [pending, setPending] = useState(false);

  return (
    <LiquidGlassModal
      open
      size={{ width: 480, height: 760 }}
      style={{ maxHeight: '75vh' }}
      title={id ? t('apps.editTitle') : t('apps.createTitle')}
      fit
      onOpenChange={(open) => {
        if (!open && !pending) {
          onClose();
        }
      }}
    >
      <AppEdit id={id} onSuccess={onClose} onCancel={onClose} onPendingChange={setPending} />
    </LiquidGlassModal>
  );
}

export function AppConfig() {
  const t = useTranslations();
  const toast = useToast();
  const [dragging, setDragging] = useState(false);
  const sorting = useAppList((state) => state.sorting);
  const sortError = useAppList((state) => state.sortError);
  const move = useAppList((state) => state.move);
  const [removing, setRemoving] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const apps = useAppList((state) => state.apps);
  const status = useAppList((state) => state.status);
  const error = useAppList((state) => state.error);
  const list = useAppList((state) => state.list);
  const [editing, setEditing] = useState<{ id?: string } | null>(null);

  useEffect(() => {
    void list();
  }, [list]);

  useEffect(() => {
    if (sortError) {
      toast.add({ type: 'error', title: t('apps.sortFailed', { error: sortError }) });
    }
  }, [sortError, t, toast]);

  const busy = dragging || sorting || deletingId !== null;

  const remove = async (id: string) => {
    if (busy) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetchApi<AppDeleteRes>('/api/apps/delete', { id });

      if (!response.success) {
        toast.add({ type: 'error', title: response.message });

        return;
      }

      setPendingId(null);
      await useAppList.getState().list();
    } catch {
      toast.add({ type: 'error', title: t('apps.deleteFailed') });
    } finally {
      setDeletingId(null);
    }
  };

  // idle 是首帧（effect 还没跑），和 loading 一起当加载态，免得先闪一屏空列表
  const loading = status === 'idle' || status === 'loading';

  return (
    <WindowContent
      title={t('settings.apps')}
      right={
        <AppConfigActions
          removing={removing}
          busy={busy}
          onToggleRemoving={() => {
            setRemoving((value) => !value);
            setPendingId(null);
          }}
          onAdd={() => setEditing({})}
        />
      }
    >
      <div className="flex min-h-0 flex-col gap-3 p-5">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loading />
          </div>
        ) : (
          <SortableAppList
            apps={apps}
            sorting={sorting}
            disabled={sorting || deletingId !== null || editing !== null}
            removing={removing}
            pendingId={pendingId}
            busy={busy}
            onDraggingChange={setDragging}
            onPendingChange={setPendingId}
            onTogglePending={(id) => setPendingId((value) => (value === id ? null : id))}
            onMove={move}
            onEdit={(id) => setEditing({ id })}
            onDelete={remove}
          />
        )}

        <p role="status" aria-live="polite" className="sr-only">
          {sorting ? t('apps.savingOrder') : dragging ? t('apps.reordering') : ''}
        </p>
        {status === 'error' ? <p className="px-1 text-sm text-white/70">{error}</p> : null}
      </div>

      {editing ? <AppEditDialog id={editing.id} onClose={() => setEditing(null)} /> : null}
    </WindowContent>
  );
}
