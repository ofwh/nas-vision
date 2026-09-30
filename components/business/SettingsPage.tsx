'use client';

import { Bell, ChevronRight, HardDrive, Info, Languages, Palette, Wifi, type LucideIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { LiquidGlassDialog } from '@/components/common/LiquidGlassDialog';
import { Button } from '@/components/ui/button';

const ICON_SIZE = 24;
const ICON_STROKE = 1.7;

type MenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  right?: ReactNode;
};

type MenuGroup = {
  id: string;
  label?: string;
  items: MenuItem[];
};

const MENU_GROUPS: MenuGroup[] = [
  {
    id: 'general',
    label: '通用',
    items: [
      { id: 'appearance', label: '外观', icon: Palette, right: '浅色' },
      { id: 'language', label: '语言与地区', icon: Languages, right: '简体中文' },
      { id: 'notifications', label: '通知', icon: Bell, right: <ChevronRight size={18} aria-hidden /> },
    ],
  },
  {
    id: 'system',
    items: [
      { id: 'storage', label: '存储空间', icon: HardDrive, right: '1.2 TB / 4 TB' },
      { id: 'network', label: '网络', icon: Wifi },
      { id: 'about', label: '关于本机', icon: Info },
    ],
  },
];

const FLAT_ITEMS = MENU_GROUPS.flatMap((group) => group.items);

type SettingRow = { label: string; description: string; control: string };

const ROWS: Record<string, SettingRow[]> = {
  appearance: [
    { label: '主题', description: '跟随系统或手动指定浅色 / 深色', control: '浅色' },
    { label: '强调色', description: '用于按钮、选中态和进度条', control: '淡蓝' },
    { label: '减少动效', description: '关闭视差与过渡动画', control: '关闭' },
  ],
  language: [
    { label: '显示语言', description: '界面文案使用的语言', control: '简体中文' },
    { label: '时区', description: '影响日志与文件时间戳', control: 'UTC+08:00' },
    { label: '日期格式', description: '年 / 月 / 日的排列方式', control: '2026-09-27' },
  ],
  notifications: [
    { label: '允许通知', description: '关闭后所有应用通知都会静默', control: '开启' },
    { label: '任务完成提醒', description: '备份、同步等长任务结束后提醒我', control: '开启' },
    { label: '免打扰时段', description: '该时段内不弹出任何提示', control: '22:00 - 08:00' },
  ],
  storage: [
    { label: '已用空间', description: '2.8 TB 可用，其中快照占用 240 GB', control: '查看详情' },
    { label: '自动清理', description: '回收站超过 30 天的内容会被删除', control: '开启' },
  ],
  network: [
    { label: '连接方式', description: '当前走有线网络，速率 2.5 Gbps', control: '有线' },
    { label: '远程访问', description: '允许在局域网外访问本机服务', control: '开启' },
  ],
  about: [
    { label: '设备名称', description: 'nas-vision', control: '重命名' },
    { label: '系统版本', description: '2026.09 稳定版', control: '检查更新' },
  ],
};

/** 撑高内容，用来验证内容区的垂直滚动。 */
const PLACEHOLDER_BARS = 24;

/** 设计尺寸 1280×720。 */
const DIALOG_SIZE = { width: 1280, height: 720 };

type SettingsMenuProps = {
  groups: MenuGroup[];
  activeId: string;
  onActiveChange: (id: string) => void;
};

function SettingsMenu({ groups, activeId, onActiveChange }: SettingsMenuProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-l-xl bg-[#545458]/50">
      <div className="flex h-12 items-center space-y-4 px-5 py-6">
        <span className="text-bold text-2xl">设置</span>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto p-3">
        {groups.map((group) => (
          <div key={group.id}>
            {group.label ? (
              <div className="px-2.5 pb-1.5 text-xs font-medium tracking-wide text-white/55">{group.label}</div>
            ) : null}

            <div className="space-y-1">
              {group.items.map((item) => {
                const active = item.id === activeId;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onActiveChange(item.id)}
                    aria-current={active ? 'true' : undefined}
                    className={`flex h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 text-left transition-colors duration-200 ${
                      active ? 'bg-white/15 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center">
                      <item.icon size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden />
                    </span>

                    <span className="flex-1 text-[17px] font-normal">{item.label}</span>

                    {item.right ? <span className="shrink-0 text-sm text-white/75">{item.right}</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsPage({ onClose }: { onClose?: () => void }) {
  const [activeId, setActiveId] = useState('appearance');

  const active = FLAT_ITEMS.find((item) => item.id === activeId);

  return (
    <LiquidGlassDialog open size={DIALOG_SIZE} title="设置" fit onOpenChange={() => {}} onClose={onClose}>
      <div className="flex h-full min-h-0 gap-2 bg-[#545458]/25">
        <div className="w-75 shrink-0">
          <SettingsMenu groups={MENU_GROUPS} activeId={activeId} onActiveChange={setActiveId} />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center gap-4 overflow-auto">
          <div className="w-200 space-y-4">
            <div className="divide-y divide-white/10 overflow-hidden rounded-3xl bg-white/8">
              {(ROWS[activeId] ?? []).map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-6 px-6 py-4">
                  <div className="min-w-0">
                    <div className="text-[17px]">{row.label}</div>
                    <div className="mt-1 text-sm text-white/60">{row.description}</div>
                  </div>
                  <div className="shrink-0">
                    <Button variant="outline" className="text-foreground">
                      {row.control}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl bg-white/8 px-6 py-4 text-sm text-white/60">
              {`当前分区：${active?.label ?? '-'}。下面是占位内容，用来验证内容区的垂直滚动与水平居中。`}
              <div className="mt-3 space-y-2">
                {Array.from({ length: PLACEHOLDER_BARS }, (_, index) => (
                  <div key={index} className="h-4 w-full rounded-full bg-white/10" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LiquidGlassDialog>
  );
}
