'use client';

import { LayoutGrid, Palette, Settings, User, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { ManageApps } from '@/components/business/Apps/ManageApps';
import { LiquidGlassDialog } from '@/components/common/LiquidGlassDialog';

const ICON_SIZE = 20;
const ICON_STROKE = 1.7;

/** 设计尺寸 960×640。 */
const DIALOG_SIZE = { width: 960, height: 640 };

type MenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

const MENU_ITEMS: MenuItem[] = [
  { id: 'account', label: '账户', icon: User },
  { id: 'appearance', label: '外观', icon: Palette },
  { id: 'apps', label: '应用列表', icon: LayoutGrid },
  { id: 'system', label: '系统设置', icon: Settings },
];

function AppsMenu({ activeId, onActiveChange }: { activeId: string; onActiveChange: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-l-xl bg-[#545458]/50">
      {/* 高度由 p-5 撑开：写死 h-12 会把上下 padding 压成 10px，标题贴着菜单 */}
      <div className="flex shrink-0 items-center px-5 pt-5">
        <span className="text-xl font-bold">设置</span>
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-x-hidden overflow-y-auto p-2.5">
        {MENU_ITEMS.map((item) => {
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

export function AppsDialog({ onClose }: { onClose?: () => void }) {
  const [activeId, setActiveId] = useState('apps');

  return (
    <LiquidGlassDialog open size={DIALOG_SIZE} title="设置" fit onOpenChange={() => {}} onClose={onClose}>
      <div className="flex h-full min-h-0 bg-[#545458]/25">
        <div className="w-50 shrink-0">
          <AppsMenu activeId={activeId} onActiveChange={setActiveId} />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto p-5">
          {activeId === 'apps' ? <ManageApps /> : null}
        </div>
      </div>
    </LiquidGlassDialog>
  );
}
