'use client';

import { useEffect, useId, useMemo, useRef } from 'react';
import { useSidebarStore, type SidebarMenu, type SidebarMenuType } from '@/stores/sidebar';

export type { SidebarMenu, SidebarMenuType, SidebarContentProps, SidebarClickContext } from '@/stores/sidebar';

export function useSidebar() {
  const owner = useId();
  const mounted = useRef(false);
  const register = useSidebarStore((state) => state.register);
  const unmount = useSidebarStore((state) => state.unmount);
  const release = useSidebarStore((state) => state.release);
  const setType = useSidebarStore((state) => state.setType);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
      release(owner);
    };
  }, [owner, release]);

  return useMemo(
    () => ({
      register: (menus: SidebarMenu[], only = false) => {
        if (!mounted.current) {
          return;
        }

        register(
          menus.map((menu) => ({ ...menu, name: `${owner}:${menu.name}` })),
          only,
          owner,
        );
      },
      unmount: (name: string) => unmount(`${owner}:${name}`),
      setType: (type: SidebarMenuType | null) => {
        if (mounted.current) {
          setType(type, owner);
        }
      },
    }),
    [owner, register, unmount, setType],
  );
}
