'use client';

import { useTranslations } from 'next-intl';
import { LayoutGrid, Palette, UserRound, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { ManageApps } from '@/components/business/Apps/ManageApps';
import { Appearance } from '@/components/business/Appearance/Appearance';
import { Account } from '@/components/business/Account/Account';
import { LiquidGlassDialog } from '@/components/common/LiquidGlassDialog';
import { WindowControls } from '@/components/common/WindowControls';
import { useSession } from '@/lib/auth-client';

const ICON_SIZE = 20;
const ICON_STROKE = 1.7;

/** 设计尺寸 960×640。 */
const DIALOG_SIZE = { width: 960, height: 640 };

type MenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

function SettingsMenu({
  activeId,
  onActiveChange,
  signedIn,
  maximized,
  onMaximize,
}: {
  activeId: string;
  onActiveChange: (id: string) => void;
  signedIn: boolean;
  maximized: boolean;
  onMaximize: () => void;
}) {
  const t = useTranslations();
  const MENU_ITEMS: MenuItem[] = [
    { id: 'account', label: t('account.title'), icon: UserRound },
    { id: 'appearance', label: t('appearance.title'), icon: Palette },
    { id: 'apps', label: t('settings.apps'), icon: LayoutGrid },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-l-xl bg-[#545458]/50">
      <div className="shrink-0 px-6 pt-5 pb-4">
        <WindowControls maximized={maximized} onMaximize={onMaximize} className="mb-5" />
        <span className="text-xl font-bold">{t('settings.title')}</span>
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-2.5">
        {MENU_ITEMS.filter((item) => signedIn || item.id !== 'apps').map((item) => {
          const active = item.id === activeId;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onActiveChange(item.id)}
              aria-current={active ? 'true' : undefined}
              className={`flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left transition-colors duration-200 ${
                active ? 'bg-white/15 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="flex size-5 shrink-0 items-center justify-center">
                <item.icon size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden />
              </span>

              <span className="flex-1 text-sm font-normal">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SettingsDialog({
  onClose,
  initialPage = 'account',
}: {
  onClose?: () => void;
  initialPage?: 'account' | 'apps' | 'appearance';
}) {
  const t = useTranslations();
  const [activeId, setActiveId] = useState<string>(initialPage);
  const [maximized, setMaximized] = useState(false);
  const { data: session } = useSession();
  const signedIn = !!session;
  const visibleActiveId = !signedIn && activeId === 'apps' ? 'account' : activeId;

  return (
    <LiquidGlassDialog
      open
      size={DIALOG_SIZE}
      title={t('settings.title')}
      header={false}
      style={maximized ? { width: 'calc(100vw - 48px)', height: 'calc(100dvh - 48px)' } : undefined}
      fit
      onOpenChange={() => {}}
      onClose={onClose}
    >
      <div className="flex h-full min-h-0 bg-[#545458]/25">
        <div className="w-50 shrink-0">
          <SettingsMenu
            activeId={visibleActiveId}
            onActiveChange={setActiveId}
            signedIn={signedIn}
            maximized={maximized}
            onMaximize={() => setMaximized((value) => !value)}
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {visibleActiveId === 'account' ? (
            <Account />
          ) : visibleActiveId === 'apps' ? (
            <ManageApps />
          ) : visibleActiveId === 'appearance' ? (
            <Appearance />
          ) : null}
        </div>
      </div>
    </LiquidGlassDialog>
  );
}
