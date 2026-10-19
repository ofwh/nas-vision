import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { create } from 'zustand';

export type SidebarContentProps = {
  onClose: () => void;
};

export type SidebarClickContext = {
  open: () => void;
  close: () => void;
};

export type SidebarMenuType = 'common' | 'home' | 'apps' | 'settings';

export type SidebarMenu = {
  name: string;
  label: string;
  type: SidebarMenuType;
  icon: LucideIcon;
  auth?: boolean;
  onClick: (context: SidebarClickContext) => void;
  render?: (props: SidebarContentProps) => ReactNode;
  onDeactivate?: () => void;
  order?: number;
};

export type SidebarItem = {
  name: string;
  menu: SidebarMenu;
  only: boolean;
};

type SidebarStore = {
  items: SidebarItem[];
  signedIn: boolean;
  setSignedIn: (signedIn: boolean) => void;
  type: SidebarMenuType | null;
  setType: (type: SidebarMenuType | null) => void;
  activeId: string | null;
  openedName: string | null;
  close: (name: string) => void;
  register: (menus: SidebarMenu[], only?: boolean) => void;
  unmount: (name: string) => void;
  setActive: (name: string) => void;
};

export function selectSidebarItems({
  items,
  type,
  signedIn,
}: Pick<SidebarStore, 'items' | 'type' | 'signedIn'>): SidebarItem[] {
  const only = type !== null && items.some((item) => item.menu.type === type && item.only);

  return items.filter(
    (item) =>
      (!item.menu.auth || signedIn) &&
      (type === null || item.menu.type === type || (!only && item.menu.type === 'common')),
  );
}

function reconcileSelection(state: Pick<SidebarStore, 'items' | 'type' | 'signedIn' | 'activeId' | 'openedName'>) {
  const visibleItems = selectSidebarItems(state);

  return {
    activeId: visibleItems.some((item) => item.name === state.activeId)
      ? state.activeId
      : (visibleItems[0]?.name ?? null),
    openedName: visibleItems.some((item) => item.name === state.openedName) ? state.openedName : null,
  };
}

export const useSidebarStore = create<SidebarStore>((set, get) => ({
  items: [],
  signedIn: false,
  setSignedIn: (signedIn) => {
    const state = get();

    if (state.signedIn === signedIn) {
      return;
    }

    const selection = reconcileSelection({ ...state, signedIn });

    if (selection.activeId !== state.activeId) {
      state.items.find((item) => item.name === state.activeId)?.menu.onDeactivate?.();
    }

    set({ signedIn, ...selection });
  },
  type: null,
  setType: (type) => {
    const state = get();
    const selection = reconcileSelection({ ...state, type });

    if (selection.activeId !== state.activeId) {
      state.items.find((item) => item.name === state.activeId)?.menu.onDeactivate?.();
    }

    set({ type, ...selection });
  },
  activeId: null,
  openedName: null,
  close: (name) =>
    set((state) => ({
      openedName: state.openedName === name ? null : state.openedName,
      activeId: state.activeId === name ? (selectSidebarItems(state)[0]?.name ?? null) : state.activeId,
    })),
  register: (menus, only = false) =>
    set((state) => {
      const entries = new Map(state.items.map((item) => [item.name, item]));

      for (const menu of menus) {
        entries.set(menu.name, { name: menu.name, menu: { auth: false, ...menu }, only });
      }
      const items = [...entries.values()].sort((a, b) => (a.menu.order ?? 0) - (b.menu.order ?? 0));

      return { items, ...reconcileSelection({ ...state, items }) };
    }),
  unmount: (name) =>
    set((state) => {
      const items = state.items.filter((item) => item.name !== name);

      return {
        items,
        ...reconcileSelection({ ...state, items }),
      };
    }),
  setActive: (name) => {
    const state = get();
    const { items, activeId } = state;
    const item = selectSidebarItems(state).find((item) => item.name === name);

    if (!item) {
      return;
    }

    if (activeId !== name) {
      items.find((item) => item.name === activeId)?.menu.onDeactivate?.();
    }

    set((state) => ({ activeId: name, openedName: activeId === name ? state.openedName : null }));
    item.menu.onClick({
      open: () => {
        const state = get();

        if (
          state.activeId === name &&
          selectSidebarItems(state).some((item) => item.name === name && item.menu.render)
        ) {
          set({ openedName: name });
        }
      },
      close: () => get().close(name),
    });
  },
}));
