'use client';

import { useState, type ReactNode } from 'react';
import { ManageApps } from '@/components/business/Apps/ManageApps';
import { Appearance } from '@/components/business/Appearance/Appearance';
import { Account } from '@/components/business/Account/Account';
import { SettingsMenu } from '@/components/business/SettingsMenu';
import { useSession } from '@/lib/auth-client';

export type SettingsPage = 'account' | 'apps' | 'appearance';

export function Settings({
  windowControls,
  initialPage = 'account',
}: {
  windowControls?: ReactNode;
  initialPage?: SettingsPage;
}) {
  const [activeId, setActiveId] = useState<SettingsPage>(initialPage);
  const { data: session } = useSession();
  const signedIn = !!session;
  const visibleActiveId = !signedIn && activeId === 'apps' ? 'account' : activeId;

  return (
    <div className="flex h-full min-h-0 bg-[#545458]/25">
      <div className="w-50 shrink-0">
        <SettingsMenu
          activeId={visibleActiveId}
          onActiveChange={setActiveId}
          signedIn={signedIn}
          windowControls={windowControls}
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
  );
}
