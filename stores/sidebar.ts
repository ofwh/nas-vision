import { Folder, House, LayoutGrid, Cog, type LucideIcon } from 'lucide-react';
import { create } from 'zustand';

export type SidebarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

const ITEMS: SidebarItem[] = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'files', label: '文件', icon: Folder },
  { id: 'apps', label: '应用', icon: LayoutGrid },
  { id: 'settings', label: '设置', icon: Cog },
];

/** 未登录时只展示首尾两项（home / settings）。 */
export function visibleItems(items: SidebarItem[], signedIn: boolean): SidebarItem[] {
  if (signedIn || items.length <= 2) return items;
  return [items[0], items[items.length - 1]];
}

type SidebarStore = {
  items: SidebarItem[];
  activeId: string;
  /** 整份换列表，换完保证 activeId 仍在列表里，不在就落到第一项。 */
  setItems: (items: SidebarItem[]) => void;
  setActive: (id: string) => void;
};

export const useSidebarStore = create<SidebarStore>((set) => ({
  items: ITEMS,
  activeId: ITEMS[0].id,
  setItems: (items) =>
    set((state) => ({
      items,
      activeId: items.some((item) => item.id === state.activeId) ? state.activeId : (items[0]?.id ?? ''),
    })),
  setActive: (id) => set({ activeId: id }),
}));
