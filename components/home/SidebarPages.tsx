'use client';

import { SettingsDialog } from '@/components/business/SettingsDialog';
import { useSidebarStore } from '@/stores/sidebar';
import { useSession } from '@/lib/auth-client';

export function SidebarPages() {
  const activeId = useSidebarStore((state) => state.activeId);
  const setActive = useSidebarStore((state) => state.setActive);
  const { data: session } = useSession();

  if (activeId !== 'apps' && activeId !== 'settings') return null;
  if (activeId === 'apps' && !session) return null;

  return (
    <SettingsDialog
      key={activeId}
      initialPage={activeId === 'apps' ? 'apps' : 'account'}
      onClose={() => setActive('home')}
    />
  );
}
