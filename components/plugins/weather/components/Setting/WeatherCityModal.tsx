'use client';

import { useId, useRef, useState } from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import { AutoScroller } from '@dnd-kit/dom';
import { move } from '@dnd-kit/helpers';
import { Check, MapPinned } from 'lucide-react';
import { WindowModal } from '@/components/common/WindowModal';
import { FormGroup, FIELD_CONTROL_CLASS } from '@/components/business/AppConfig/form';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/useToast';
import type { Locale } from '@/i18n/config';
import { getTranslator } from '../../i18n';
import type { WeatherCityInput, WeatherCityItem, WeatherStorageCard } from '../../types';
import { WeatherSortableRow } from './WeatherSortableRow';

export function WeatherCityModal({
  locale,
  city,
  defaultCards,
  onSave,
  onClose,
}: {
  locale: Locale;
  city?: WeatherCityItem;
  defaultCards: WeatherStorageCard[];
  onSave: (data: WeatherCityInput, id?: string) => Promise<boolean>;
  onClose: () => void;
}) {
  const t = getTranslator(locale);
  const toast = useToast();
  const id = useId();
  const [name, setName] = useState(city?.name ?? '');
  const [longitude, setLongitude] = useState(city ? String(city.longitude) : '');
  const [latitude, setLatitude] = useState(city ? String(city.latitude) : '');
  const [cards, setCards] = useState(() => city?.cards ?? defaultCards);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const locked = useRef(false);

  async function submit() {
    if (locked.current || dragging) {
      return;
    }

    locked.current = true;
    setSaving(true);
    try {
      const saved = await onSave(
        {
          name,
          longitude,
          latitude,
          cards,
        },
        city?.id,
      );

      if (saved) {
        onClose();
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : '';

      toast.add({
        type: 'error',
        title: t(
          reason === 'nameRequired'
            ? 'settings.nameRequired'
            : reason === 'coordinatesRequired'
              ? 'settings.coordinatesRequired'
              : reason === 'locationInvalid'
                ? 'errors.LOCATION_INVALID'
                : reason === 'duplicate'
                  ? 'settings.duplicate'
                  : 'settings.saveFailed',
        ),
      });
    } finally {
      locked.current = false;
      setSaving(false);
    }
  }

  return (
    <WindowModal
      open
      title={t(city ? 'settings.editCity' : 'settings.addCity')}
      mode="floating"
      fit
      size={{ width: 480 }}
      style={{ maxWidth: '90vw', maxHeight: '85vh' }}
      onOpenChange={(open) => {
        if (!open && !locked.current) {
          onClose();
        }
      }}
      header={{
        right: (
          <LiquidGlass className="size-10 rounded-full" contentClassName="h-full">
            <Button
              variant="ghost"
              size="icon-lg"
              className="rounded-full text-white"
              disabled={saving || dragging}
              aria-label={t('settings.save')}
              onClick={() => void submit()}
            >
              <Check aria-hidden className="size-5" />
            </Button>
          </LiquidGlass>
        ),
      }}
    >
      <div className="flex min-w-0 shrink-0 flex-col gap-5 bg-[#545458]/25 p-4 pt-20 text-white">
        <div className="flex flex-col items-center gap-3 py-5 text-center">
          <MapPinned aria-hidden className="size-16 text-white/80" strokeWidth={1.25} />
          <h2 className="text-xl font-semibold">{t(city ? 'settings.editCity' : 'settings.addCity')}</h2>
          <p className="text-sm text-white/60">{t('settings.description')}</p>
        </div>
        <fieldset disabled={saving} className="min-w-0">
          <legend className="sr-only">{t('settings.cityInfo')}</legend>
          <FormGroup label={t('settings.cityInfo')}>
            {(
              [
                { key: 'name', value: name, set: setName, type: 'text', min: undefined, max: undefined },
                { key: 'longitude', value: longitude, set: setLongitude, type: 'number', min: -180, max: 180 },
                { key: 'latitude', value: latitude, set: setLatitude, type: 'number', min: -90, max: 90 },
              ] as const
            ).map((field) => (
              <Input
                key={field.key}
                id={`${id}-${field.key}`}
                aria-label={t(`settings.${field.key}`)}
                placeholder={t(`settings.${field.key}`)}
                required
                type={field.type}
                step={field.type === 'number' ? 'any' : undefined}
                min={field.min}
                max={field.max}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
                className={FIELD_CONTROL_CLASS}
              />
            ))}
          </FormGroup>
        </fieldset>
        <section aria-label={t('settings.cards')} className="flex flex-col gap-2">
          <h3 className="px-1 text-sm text-white/60">{t('settings.cards')}</h3>
          <DragDropProvider
            plugins={(plugins) => plugins.filter((plugin) => plugin !== AutoScroller)}
            onDragStart={() => setDragging(true)}
            onDragEnd={(event) => {
              setDragging(false);
              if (!event.canceled) {
                setCards(
                  move(
                    cards.map((card) => ({ ...card, id: card.type })),
                    event,
                  ).map(({ type, status, name }) => ({ type, status, name })),
                );
              }
            }}
          >
            <div className="divide-y divide-white/10 overflow-hidden rounded-2xl bg-white/8">
              {cards.length === 0 && (
                <p className="flex min-h-12 items-center justify-center px-4 py-3 text-center text-sm text-white/60">
                  {t('settings.noCards')}
                </p>
              )}
              {cards.map((card, index) => {
                const label = card.name;

                return (
                  <WeatherSortableRow
                    key={card.type}
                    id={card.type}
                    index={index}
                    disabled={saving}
                    label={t('settings.reorder', { name: label })}
                  >
                    <span className="min-w-0 flex-1 truncate text-sm">{label}</span>
                    <Switch
                      aria-label={label}
                      checked={card.status}
                      disabled={saving}
                      onCheckedChange={(status) =>
                        setCards((items) => items.map((item) => (item.type === card.type ? { ...item, status } : item)))
                      }
                    />
                  </WeatherSortableRow>
                );
              })}
            </div>
          </DragDropProvider>
        </section>
      </div>
    </WindowModal>
  );
}
