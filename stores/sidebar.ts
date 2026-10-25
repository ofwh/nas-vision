import type { LucideIcon } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
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
  icon: LucideIcon | ReactElement;
  disabled?: boolean;
  defaultActive?: boolean;
  auth?: boolean;
  onClick?: (context: SidebarClickContext) => void;
  render?: (props: SidebarContentProps) => ReactNode;
  onDeactivate?: () => void;
  order?: number;
};

export type SidebarItem = {
  name: string;
  menu: SidebarMenu;
  only: boolean;
  owner?: string;
};

type SidebarStore = {
  items: SidebarItem[];
  signedIn: boolean;
  setSignedIn: (signedIn: boolean) => void;
  type: SidebarMenuType | null;
  baseType: SidebarMenuType | null;
  typeScopes: { owner: string; type: SidebarMenuType | null }[];
  setType: (type: SidebarMenuType | null, owner?: string) => void;
  activeId: string | null;
  openedName: string | null;
  close: (name: string) => void;
  register: (menus: SidebarMenu[], only?: boolean, owner?: string) => void;
  unmount: (name: string) => void;
  release: (owner: string) => void;
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
      : (visibleItems.find((item) => item.menu.defaultActive)?.name ?? visibleItems[0]?.name ?? null),
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
  baseType: null,
  typeScopes: [],
  setType: (requestedType, owner) => {
    const state = get();
    const baseType = owner === undefined ? requestedType : state.baseType;
    const typeScopes =
      owner === undefined
        ? state.typeScopes
        : state.typeScopes.some((scope) => scope.owner === owner)
          ? state.typeScopes.map((scope) => (scope.owner === owner ? { owner, type: requestedType } : scope))
          : [...state.typeScopes, { owner, type: requestedType }];

    const type = typeScopes.length ? typeScopes[typeScopes.length - 1].type : baseType;
    const selection = reconcileSelection({ ...state, type });

    if (selection.activeId !== state.activeId) {
      state.items.find((item) => item.name === state.activeId)?.menu.onDeactivate?.();
    }

    set({ type, baseType, typeScopes, ...selection });
  },
  activeId: null,
  openedName: null,
  close: (name) =>
    set((state) =>
      reconcileSelection({
        ...state,
        activeId: state.activeId === name ? null : state.activeId,
        openedName: state.openedName === name ? null : state.openedName,
      }),
    ),
  register: (menus, only = false, owner) =>
    set((state) => {
      const entries = new Map(state.items.map((item) => [item.name, item]));

      for (const menu of menus) {
        entries.set(menu.name, { name: menu.name, menu: { auth: false, ...menu }, only, owner });
      }
      const items = [...entries.values()].sort((a, b) => (a.menu.order ?? 0) - (b.menu.order ?? 0));

      const defaultItem = selectSidebarItems({ ...state, items }).find(
        (item) => item.menu.defaultActive && !state.items.some((previous) => previous.name === item.name),
      );

      return { items, ...reconcileSelection({ ...state, items, activeId: defaultItem?.name ?? state.activeId }) };
    }),
  unmount: (name) =>
    set((state) => {
      const items = state.items.filter((item) => item.name !== name);

      return {
        items,
        ...reconcileSelection({ ...state, items }),
      };
    }),
  release: (owner) =>
    set((state) => {
      const items = state.items.filter((item) => item.owner !== owner);
      const typeScopes = state.typeScopes.filter((scope) => scope.owner !== owner);
      const type = typeScopes.length ? typeScopes[typeScopes.length - 1].type : state.baseType;

      return { items, typeScopes, type, ...reconcileSelection({ ...state, items, type }) };
    }),
  setActive: (name) => {
    const state = get();
    const { items, activeId } = state;
    const item = selectSidebarItems(state).find((item) => item.name === name);

    if (!item || item.menu.disabled) {
      return;
    }

    if (activeId !== name) {
      items.find((item) => item.name === activeId)?.menu.onDeactivate?.();
    }

    set((state) => ({ activeId: name, openedName: activeId === name ? state.openedName : null }));
    item.menu.onClick?.({
      open: () => {
        const state = get();

        if (
          state.activeId === name &&
          selectSidebarItems(state).some((current) => current === item && current.menu.render)
        ) {
          set({ openedName: name });
        }
      },
      close: () => {
        if (get().items.includes(item)) {
          get().close(name);
        }
      },
    });
  },
}));
