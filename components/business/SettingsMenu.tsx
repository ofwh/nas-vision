'use client';

import { useTranslations } from 'next-intl';
import { LayoutGrid, Palette, UserRound, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { SettingsPage } from '@/components/business/Settings';

const ICON_SIZE = 20;
const ICON_STROKE = 1.7;

type MenuItem = {
  id: SettingsPage;
  label: string;
  icon: LucideIcon;
};

export function SettingsMenu({
  activeId,
  onActiveChange,
  signedIn,
  windowControls,
}: {
  activeId: SettingsPage;
  onActiveChange: (id: SettingsPage) => void;
  signedIn: boolean;
  windowControls?: ReactNode;
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
        {windowControls}
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
