import { House, LayoutGrid, Cog, type LucideIcon } from 'lucide-react';
import { create } from 'zustand';

export type SidebarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

const ITEMS: SidebarItem[] = [
  { id: 'home', label: 'home', icon: House },
  { id: 'apps', label: 'apps', icon: LayoutGrid },
  { id: 'settings', label: 'settings', icon: Cog },
];

export function visibleItems(items: SidebarItem[], signedIn: boolean): SidebarItem[] {
  if (signedIn) return items;
  return items.filter((item) => item.id !== 'apps');
}

type SidebarStore = {
  items: SidebarItem[];
  activeId: string;
  setActive: (id: string) => void;
};

export const useSidebarStore = create<SidebarStore>((set) => ({
  items: ITEMS,
  activeId: ITEMS[0].id,
  setActive: (id) => set({ activeId: id }),
}));
