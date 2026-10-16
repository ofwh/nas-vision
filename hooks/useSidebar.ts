'use client';

import { useSidebarStore } from '@/stores/sidebar';

export type { SidebarMenu, SidebarMenuType, SidebarContentProps, SidebarClickContext } from '@/stores/sidebar';

export function useSidebar() {
  const register = useSidebarStore((state) => state.register);
  const unmount = useSidebarStore((state) => state.unmount);

  const setType = useSidebarStore((state) => state.setType);

  return { register, unmount, setType };
}
