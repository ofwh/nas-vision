'use client';

import { useState } from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import { AutoScroller } from '@dnd-kit/dom';
import { move } from '@dnd-kit/helpers';
import { MapPinned, Minus, Plus } from 'lucide-react';
import { WindowModal } from '@/components/common/WindowModal';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Loading } from '@/components/common/Loading';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import type { Locale } from '@/i18n/config';
import { getTranslator } from '../../i18n';
import { useWeatherStorage } from '../../hooks/useWeatherStorage';
import type { WeatherCityItem } from '../../types';
import { WeatherCityModal } from './WeatherCityModal';
import { WeatherSortableRow } from './WeatherSortableRow';

export function WeatherSettingsModal({
  appId,
  locale,
  onOpenChange,
}: {
  appId: string;
  locale: Locale;
  onOpenChange: (open: boolean) => void;
}) {
  const t = getTranslator(locale);
  const toast = useToast();
  const { cities, cards, busy, isLoading, error, create, updateCity, reorder, remove } = useWeatherStorage(
    appId,
    locale,
  );
  const [removing, setRemoving] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ city?: WeatherCityItem } | null>(null);
  const [dragging, setDragging] = useState(false);
  const disabled = busy || isLoading || !!error || editing !== null;

  async function perform(action: () => Promise<boolean>) {
    try {
      if (await action()) {
        setPendingId(null);
      }
    } catch {
      toast.add({ type: 'error', title: t('settings.saveFailed') });
    }
  }

  return (
    <WindowModal
      open
      title={t('settings.title')}
      mode="floating"
      fit
      size={{ width: 420 }}
      style={{ maxWidth: '90vw', maxHeight: '85vh' }}
      onOpenChange={(open) => {
        if (!busy && !dragging) {
          onOpenChange(open);
        }
      }}
      header={{
        right: (
          <>
            <LiquidGlass className="rounded-full" contentClassName="h-full">
              <Button
                variant="ghost"
                className="h-10 rounded-full px-5 text-white"
                disabled={disabled || dragging}
                aria-pressed={removing}
                onClick={() => {
                  setRemoving((value) => !value);
                  setPendingId(null);
                }}
              >
                {t(removing ? 'settings.done' : 'settings.edit')}
              </Button>
            </LiquidGlass>
            <LiquidGlass className="size-10 rounded-full" contentClassName="h-full">
              <Button
                variant="ghost"
                size="icon-lg"
                className="rounded-full text-white"
                aria-label={t('settings.addCity')}
                disabled={disabled || dragging}
                onClick={() => {
                  setPendingId(null);
                  setEditing({});
                }}
              >
                <Plus aria-hidden className="size-5" />
              </Button>
            </LiquidGlass>
          </>
        ),
      }}
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-5 pt-20 text-white" aria-busy={busy || isLoading}>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loading />
          </div>
        ) : error ? (
          <p role="alert" className="py-8 text-center text-sm text-white/60">
            {t('settings.loadFailed')}
          </p>
        ) : (
          <DragDropProvider
            plugins={(plugins) => plugins.filter((plugin) => plugin !== AutoScroller)}
            onDragStart={() => {
              setDragging(true);
              setPendingId(null);
            }}
            onDragEnd={(event) => {
              setDragging(false);
              if (event.canceled) {
                return;
              }

              const ordered = move(cities, event);

              if (ordered.some((item, index) => item.id !== cities[index]?.id)) {
                void perform(() => reorder(ordered.map((city) => city.id)));
              }
            }}
          >
            <div className="shrink-0 divide-y divide-white/10 overflow-hidden rounded-3xl bg-white/8">
              {cities.map((city, index) => (
                <WeatherSortableRow
                  key={city.id}
                  id={city.id}
                  index={index}
                  disabled={disabled}
                  label={t('settings.reorder', { name: city.name })}
                  action={
                    removing && pendingId === city.id ? (
                      <Button
                        variant="ghost"
                        disabled={busy}
                        onClick={() => void perform(() => remove(city.id))}
                        aria-label={t('settings.deleteNamed', { name: city.name })}
                        className="self-stretch rounded-lg bg-[#ff3b30] px-4 text-white hover:bg-[#ff3b30]/85 hover:text-white"
                      >
                        {t('settings.delete')}
                      </Button>
                    ) : undefined
                  }
                >
                  <div
                    className={`shrink-0 overflow-hidden transition-[width,margin,opacity] duration-200 motion-reduce:transition-none ${removing ? 'w-6 opacity-100' : '-mr-3.5 w-0 opacity-0'}`}
                  >
                    {removing && (
                      <button
                        type="button"
                        disabled={busy}
                        aria-expanded={pendingId === city.id}
                        aria-label={t('settings.deleteNamed', { name: city.name })}
                        onClick={() => setPendingId((value) => (value === city.id ? null : city.id))}
                        className="flex size-6 cursor-pointer items-center justify-center rounded-full bg-[#ff3b30] text-white focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-50"
                      >
                        <Minus aria-hidden className="size-4" strokeWidth={3} />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={removing || disabled}
                    onClick={() => setEditing({ city })}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-3.5 text-left"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white/10">
                      <MapPinned aria-hidden className="size-6" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">{city.name}</span>
                  </button>
                </WeatherSortableRow>
              ))}
            </div>
          </DragDropProvider>
        )}
        {!isLoading && !error && cities.length === 0 && (
          <div className="flex h-80 shrink-0 items-center justify-center text-center text-sm text-white/60">
            {t('settings.empty')}
          </div>
        )}
      </div>
      {editing && (
        <WeatherCityModal
          locale={locale}
          city={editing.city}
          defaultCards={cards}
          onSave={(input, id) => (id ? updateCity(id, input) : create(input))}
          onClose={() => setEditing(null)}
        />
      )}
    </WindowModal>
  );
}
