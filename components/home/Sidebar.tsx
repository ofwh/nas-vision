'use client';

import { useTranslations } from 'next-intl';
import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { useSession } from '@/lib/auth-client';
import { useSettings } from '@/stores/settings';
import { useSidebarStore, visibleItems } from '@/stores/sidebar';

const LABEL_KEYS: Record<string, 'home' | 'apps' | 'settings' | 'account' | 'appearance' | undefined> = {
  home: 'home',
  apps: 'apps',
  settings: 'settings',
  account: 'account',
  appearance: 'appearance',
};

const ICON_SIZE = 24;
const ICON_STROKE = 1.7;

const ITEM_SIZE = 44;
const ICON_PADDING = (ITEM_SIZE - ICON_SIZE) / 2;
const CONTAINER_PADDING = 12;
const ITEM_GAP = 12;
const ICON_LABEL_GAP = 12;

const LABEL_LEFT = CONTAINER_PADDING + ICON_PADDING + ICON_SIZE + ICON_LABEL_GAP;

const LABEL_RIGHT = ICON_PADDING + CONTAINER_PADDING;

const containerHeight = (itemCount: number) =>
  2 * CONTAINER_PADDING + itemCount * ITEM_SIZE + Math.max(0, itemCount - 1) * ITEM_GAP;

export function Sidebar() {
  const t = useTranslations('sidebar');
  const { data: session } = useSession();
  const veil = useSettings((state) => state.veil);
  const allItems = useSidebarStore((state) => state.items);
  const activeId = useSidebarStore((state) => state.activeId);
  const setActive = useSidebarStore((state) => state.setActive);

  const signedIn = !!session;
  const items = useMemo(() => visibleItems(allItems, signedIn), [allItems, signedIn]);

  useEffect(() => {
    if (!items.some((item) => item.id === activeId)) setActive('home');
  }, [items, activeId, setActive]);

  const listRef = useRef<HTMLDivElement>(null);
  const [expandedWidth, setExpandedWidth] = useState(LABEL_LEFT + LABEL_RIGHT);

  useEffect(() => {
    const labels = listRef.current?.querySelectorAll<HTMLElement>('[data-sidebar-label]');
    if (!labels?.length) return;

    const measure = () =>
      setExpandedWidth(
        LABEL_LEFT + Math.max(...Array.from(labels, (label) => label.getBoundingClientRect().width)) + LABEL_RIGHT,
      );

    measure();
    const observer = new ResizeObserver(measure);
    labels.forEach((label) => observer.observe(label));
    return () => observer.disconnect();
  }, [items]);

  const itemTop = (index: number) => CONTAINER_PADDING + index * (ITEM_SIZE + ITEM_GAP);

  const [hover, setHover] = useState({ index: 0, visible: false, sliding: false });
  const hoveredItem = items[hover.index];
  const showHover = hover.visible && !!hoveredItem && hoveredItem.id !== activeId;

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const onLeave = () => setHover((prev) => ({ ...prev, visible: false, sliding: false }));
    list.addEventListener('pointerleave', onLeave);
    return () => list.removeEventListener('pointerleave', onLeave);
  }, []);

  return (
    <LiquidGlass
      ref={listRef}
      style={
        {
          '--sidebar-expand': `${expandedWidth}px`,
          height: containerHeight(items.length),
        } as CSSProperties
      }
      className="group z-[1050] ml-[calc(100%_-_124px)] w-17 shrink-0 rounded-[34px] transition-all duration-300 ease-out hover:w-[var(--sidebar-expand)]"
      variant={veil ? 'veil' : 'glass'}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute right-3 left-3 rounded-full bg-black/25 duration-200 ease-out ${
          hover.sliding ? 'transition-[top,opacity]' : 'transition-opacity'
        } ${showHover ? 'opacity-100' : 'opacity-0'}`}
        style={{ top: itemTop(hoveredItem ? hover.index : 0), height: ITEM_SIZE }}
      />

      {items.map((item, index) => {
        const active = item.id === activeId;
        const labelKey = LABEL_KEYS[item.id];

        return (
          <div
            key={item.id}
            onPointerEnter={() => setHover((prev) => ({ index, visible: true, sliding: prev.visible }))}
            onClick={() => setActive(item.id)}
            className="group/item absolute inset-x-0 cursor-pointer"
            style={{ top: itemTop(index), height: ITEM_SIZE }}
          >
            {active ? <div className="absolute inset-y-0 right-3 left-3 rounded-full bg-white/15" /> : null}

            <span
              className={`absolute top-1/2 left-5.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center transition-colors duration-200 group-hover/item:text-white ${
                active ? 'text-white' : 'text-white/85'
              }`}
            >
              <item.icon size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden />
            </span>

            <span
              data-sidebar-label
              className={`absolute top-1/2 left-14.5 -translate-y-1/2 text-sm whitespace-nowrap opacity-0 transition-[color,opacity] duration-200 group-hover:opacity-100 group-hover/item:text-white ${
                active ? 'text-white' : 'text-white/85'
              }`}
            >
              {labelKey ? t(labelKey) : item.label}
            </span>
          </div>
        );
      })}
    </LiquidGlass>
  );
}
