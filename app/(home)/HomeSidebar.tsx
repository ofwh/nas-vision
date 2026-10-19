'use client';

import { useEffect } from 'react';
import { Cog, House, LayoutGrid } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SettingsDialog } from '@/components/business/SettingsDialog';
import { Sidebar } from '@/components/home/Sidebar';
import { useAppList } from '@/stores/app-list';
import { useSidebarStore, type SidebarMenu } from '@/stores/sidebar';

export function HomeSidebar() {
  const t = useTranslations('sidebar');
  const ready = useAppList((state) => state.status !== 'idle' && state.status !== 'loading');

  useEffect(() => {
    const { register } = useSidebarStore.getState();
    const menus: SidebarMenu[] = [
      { name: 'home', label: t('home'), type: 'home', icon: House, order: 0, onClick: () => {} },
      {
        name: 'settings',
        label: t('settings'),
        type: 'common',
        icon: Cog,
        order: 2,
        onClick: ({ open }) => open(),
        render: ({ onClose }) => <SettingsDialog initialPage="account" onClose={onClose} />,
      },
      {
        name: 'apps',
        auth: true,
        label: t('apps'),
        type: 'common',
        icon: LayoutGrid,
        order: 1,
        onClick: ({ open }) => open(),
        render: ({ onClose }) => <SettingsDialog initialPage="apps" onClose={onClose} />,
      },
    ];

    register(menus);
  }, [t]);

  useEffect(() => {
    const { setType, unmount } = useSidebarStore.getState();

    setType('home');

    return () => {
      unmount('home');
      unmount('settings');
      unmount('apps');
      setType(null);
    };
  }, []);

  return <Sidebar visible={ready} />;
}
