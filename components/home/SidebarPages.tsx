'use client';

import type { ComponentType } from 'react';
import { AppsDialog } from '@/components/business/AppsDialog';
import { SettingsPage } from '@/components/business/SettingsPage';
import { useSidebarStore } from '@/stores/sidebar';

const PAGES: Record<string, ComponentType<{ onClose: () => void }>> = {
  apps: AppsDialog,
  settings: SettingsPage,
};

export function SidebarPages() {
  const activeId = useSidebarStore((state) => state.activeId);
  const setActive = useSidebarStore((state) => state.setActive);

  const Page = PAGES[activeId];
  if (!Page) return null;

  return <Page onClose={() => setActive('home')} />;
}
