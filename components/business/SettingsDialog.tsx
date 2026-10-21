'use client';

import { useTranslations } from 'next-intl';
import { LayoutGrid, Palette, UserRound } from 'lucide-react';
import { Account } from '@/components/business/Account/Account';
import { Appearance } from '@/components/business/Appearance/Appearance';
import { AppConfig } from '@/components/business/AppConfig/AppConfig';
import { SplitWindowModal } from '@/components/common/SplitWindowModal';
import type { SplitWindowMenuItem } from '@/types/window';
import { useSession } from '@/lib/auth-client';

export type SettingsPage = 'account' | 'apps' | 'appearance';

export function SettingsDialog({ initialPage, onClose }: { initialPage: SettingsPage; onClose: () => void }) {
  const t = useTranslations();
  const { data: session } = useSession();
  const items: SplitWindowMenuItem[] = [
    { type: 'item', id: 'account', label: t('account.title'), icon: <UserRound strokeWidth={1.7} />, content: Account },
    {
      type: 'item',
      id: 'appearance',
      label: t('appearance.title'),
      icon: <Palette strokeWidth={1.7} />,
      content: Appearance,
    },
  ];

  if (session) {
    items.push({
      type: 'item',
      id: 'apps',
      label: t('settings.apps'),
      icon: <LayoutGrid strokeWidth={1.7} />,
      content: AppConfig,
    });
  }

  return (
    <SplitWindowModal
      open
      title={t('settings.title')}
      size={{ width: 960, height: 640 }}
      style={{ maxWidth: 'calc(100vw - 48px)', maxHeight: 'calc(100dvh - 48px)' }}
      fit
      active={initialPage}
      sidebar={{ header: t('settings.title'), items }}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    />
  );
}
