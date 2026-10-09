'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Settings, type SettingsPage } from '@/components/business/Settings';
import { LiquidGlassDialog } from '@/components/common/LiquidGlassDialog';
import { WindowControls } from '@/components/common/WindowControls';
import { useSidebarStore } from '@/stores/sidebar';
import { useSession } from '@/lib/auth-client';

function SettingsDialog({ initialPage, onClose }: { initialPage: SettingsPage; onClose: () => void }) {
  const t = useTranslations();
  const [maximized, setMaximized] = useState(false);

  return (
    <LiquidGlassDialog
      open
      size={{ width: 960, height: 640 }}
      title={t('settings.title')}
      header={false}
      style={maximized ? { width: 'calc(100vw - 48px)', height: 'calc(100dvh - 48px)' } : undefined}
      fit
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Settings
        initialPage={initialPage}
        windowControls={
          <WindowControls maximized={maximized} onMaximize={() => setMaximized((value) => !value)} className="mb-5" />
        }
      />
    </LiquidGlassDialog>
  );
}

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
