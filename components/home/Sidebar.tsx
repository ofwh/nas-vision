'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { useSession } from '@/lib/auth-client';
import { selectSidebarItems, useSidebarStore, type SidebarItem } from '@/stores/sidebar';

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

export function Sidebar({ visible = true }: { visible?: boolean }) {
  const { data: session } = useSession();
  const signedIn = !!session;
  const setSignedIn = useSidebarStore((state) => state.setSignedIn);

  useEffect(() => {
    setSignedIn(signedIn);
  }, [setSignedIn, signedIn]);

  const hasItems = useSidebarStore((state) => selectSidebarItems(state).length > 0);

  return (
    <>
      {visible && hasItems ? (
        <div className="animate-in zoom-in-50 relative z-[1050] ml-[calc(100%_-_124px)] w-17 duration-500 ease-out">
          <SidebarContent />
        </div>
      ) : null}
      <SidebarOutlet />
    </>
  );
}

function SidebarOutlet() {
  const item = useSidebarStore((state) => state.items.find((item) => item.name === state.openedName));
  const close = useSidebarStore((state) => state.close);

  if (!item?.menu.render) {
    return null;
  }

  return <SidebarView key={item.name} item={item} onClose={() => close(item.name)} />;
}

function SidebarView({ item, onClose }: { item: SidebarItem; onClose: () => void }) {
  return item.menu.render?.({ onClose });
}

function SidebarContent() {
  const items = useSidebarStore(useShallow(selectSidebarItems));
  const activeId = useSidebarStore((state) => state.activeId);
  const setActive = useSidebarStore((state) => state.setActive);

  const listRef = useRef<HTMLDivElement>(null);
  const [expandedWidth, setExpandedWidth] = useState(LABEL_LEFT + LABEL_RIGHT);

  useEffect(() => {
    const labels = listRef.current?.querySelectorAll<HTMLElement>('[data-sidebar-label]');

    if (!labels?.length) {
      return;
    }

    const measure = () =>
      setExpandedWidth(
        Math.max(...Array.from(labels, (label) => label.offsetLeft + Math.max(label.offsetWidth, label.scrollWidth))) +
          LABEL_RIGHT,
      );

    measure();
    const observer = new ResizeObserver(measure);

    labels.forEach((label) => observer.observe(label));

    return () => observer.disconnect();
  }, [items]);

  const itemTop = (index: number) => CONTAINER_PADDING + index * (ITEM_SIZE + ITEM_GAP);

  const [hover, setHover] = useState({ index: 0, visible: false, sliding: false });
  const hoveredItem = items[hover.index];
  const showHover = hover.visible && !!hoveredItem && hoveredItem.name !== activeId;

  useEffect(() => {
    const list = listRef.current;

    if (!list) {
      return;
    }

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
      className="group w-17 shrink-0 rounded-[34px] transition-[width] duration-300 ease-out hover:w-[var(--sidebar-expand)] motion-reduce:transition-none"
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute top-0 right-3 left-3 rounded-full bg-black/25 duration-200 ease-out motion-reduce:transition-none ${
          hover.sliding ? 'transition-[transform,opacity]' : 'transition-opacity'
        } ${showHover ? 'opacity-100' : 'opacity-0'}`}
        style={{ transform: `translateY(${itemTop(hoveredItem ? hover.index : 0)}px)`, height: ITEM_SIZE }}
      />

      {items.map((item, index) => {
        const active = item.name === activeId;

        return (
          <div
            key={item.name}
            role="button"
            tabIndex={0}
            aria-label={item.menu.label}
            aria-pressed={active}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setActive(item.name);
              }
            }}
            onPointerEnter={() => setHover((prev) => ({ index, visible: true, sliding: prev.visible }))}
            onClick={() => setActive(item.name)}
            className="group/item absolute inset-x-0 cursor-pointer"
            style={{ top: itemTop(index), height: ITEM_SIZE }}
          >
            {active ? <div className="absolute inset-y-0 right-3 left-3 rounded-full bg-white/15" /> : null}

            <span
              className={`absolute top-1/2 left-5.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center transition-colors duration-200 group-hover/item:text-white ${
                active ? 'text-white' : 'text-white/85'
              }`}
            >
              <item.menu.icon size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden />
            </span>

            <span
              data-sidebar-label
              className={`absolute top-1/2 left-14.5 w-max -translate-y-1/2 text-sm whitespace-nowrap opacity-0 transition-[color,opacity] duration-200 group-hover:opacity-100 group-hover/item:text-white ${
                active ? 'text-white' : 'text-white/85'
              }`}
            >
              {item.menu.label}
            </span>
          </div>
        );
      })}
    </LiquidGlass>
  );
}
