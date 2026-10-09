'use client';

import { useTranslations } from 'next-intl';
import { useSortable } from '@dnd-kit/react/sortable';
import { Menu, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AppItem } from '@/lib/services/apps';

export function ManageAppRow({
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
