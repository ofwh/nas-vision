'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { Locale } from '@/i18n/config';
import type { WeatherCityItem } from '../types';
import { weatherCards } from './WeatherCard';

export function WeatherCardLayout({ city, locale }: { city: WeatherCityItem; locale: Locale }) {
  const grid = useRef<HTMLDivElement>(null);
  const elements = useRef(new Map<string, HTMLDivElement>());
  const [rows, setRows] = useState<Record<string, number>>({});
  const cards = city.cards
    .filter((card) => card.status)
    .flatMap((card) => {
      const definition = weatherCards.find((item) => item.type === card.type);

      return definition ? [definition] : [];
    });
  const types = cards.map((card) => card.type).join(',');

  useLayoutEffect(() => {
    const observer = new ResizeObserver((entries) => {
      setRows((previous) => {
        const next = { ...previous };
        let changed = false;

        for (const entry of entries) {
          const type = entry.target.getAttribute('data-card-type');
          const height = entry.target.getBoundingClientRect().height;
          const gridStyle = grid.current ? getComputedStyle(grid.current) : null;
          const unit = gridStyle ? Number.parseFloat(gridStyle.gridAutoRows) : NaN;
          const gap = gridStyle ? Number.parseFloat(gridStyle.rowGap) : NaN;

          if (!Number.isFinite(unit) || !Number.isFinite(gap) || unit <= 0) {
            continue;
          }

          const span = Math.max(1, Math.ceil((height + gap - 0.5) / (unit + gap)));

          if (type && next[type] !== span) {
            next[type] = span;
            changed = true;
          }
        }

        return changed ? next : previous;
      });
    });

    for (const element of elements.current.values()) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [types]);

  const style: CSSProperties & Record<'--nv-plugin-weather-card-unit' | '--nv-plugin-weather-card-gap', string> = {
    '--nv-plugin-weather-card-gap': '16px',
    '--nv-plugin-weather-card-unit': 'calc((100cqw - 3 * var(--nv-plugin-weather-card-gap)) / 4)',
    gridAutoRows: 'var(--nv-plugin-weather-card-unit)',
    gap: 'var(--nv-plugin-weather-card-gap)',
  };

  return (
    <div className="@container w-full min-w-0 p-1">
      <div ref={grid} style={style} className="grid w-full min-w-0 grid-flow-row-dense grid-cols-4 items-start">
        {cards.map((definition) => {
          const Card = definition.component;

          return (
            <div
              key={definition.type}
              className={`min-w-0 self-start ${definition.columns === 1 ? 'col-span-1' : definition.columns === 2 ? 'col-span-2' : 'col-span-4'}`}
              style={{ gridRowEnd: `span ${rows[definition.type] ?? definition.rows ?? 1}` }}
            >
              <div
                data-card-type={definition.type}
                className="flex min-w-0 flex-col"
                ref={(element) => {
                  if (element) {
                    elements.current.set(definition.type, element);
                  } else {
                    elements.current.delete(definition.type);
                  }
                }}
              >
                <Card city={city} locale={locale} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
