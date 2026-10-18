'use client';

import { Suspense, isValidElement, useState } from 'react';
import { Loading } from '@/components/common/Loading';
import { WindowModal } from '@/components/common/WindowModal';
import type {
  SplitWindowMenuItem,
  SplitWindowModalProps,
  WindowContentElement,
  WindowContentProps,
} from '@/types/window';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function WindowContent({ title, left, right, children, className }: WindowContentProps) {
  return (
    <section className={cn('flex h-full min-h-0 min-w-0 flex-col text-white', className)}>
      <header className="grid h-18 shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] items-center gap-3 px-6 py-4">
        <div className="flex min-w-0 items-center justify-start gap-3">{left}</div>
        <h2 className="truncate text-center text-sm font-semibold">{title}</h2>
        <div className="flex min-w-0 items-center justify-end gap-3">{right}</div>
      </header>
      <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain">
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </div>
    </section>
  );
}

function isWindowContentElement(content: SplitWindowMenuItem['content']): content is WindowContentElement {
  return isValidElement(content);
}

export function SplitWindowModal({
  sidebar,
  active,
  onChange,
  size = { width: 960, height: 640 },
  ...props
}: SplitWindowModalProps) {
  const [activeId, setActiveId] = useState(active);
  const items = sidebar.items.flatMap((item) => (item.type === 'group' ? item.items : [item]));
  const current = items.find((item) => item.id === activeId && !item.disabled) ?? items.find((item) => !item.disabled);
  const content = current?.content;
  const Content = content && !isWindowContentElement(content) ? content : null;

  const renderMenu = (menuItems: SplitWindowMenuItem[]) => (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.id}>
          <SidebarMenuButton
            type="button"
            isActive={item.id === current?.id}
            aria-current={item.id === current?.id ? 'page' : undefined}
            disabled={item.disabled}
            onClick={() => {
              if (item.id === current?.id) return;
              setActiveId(item.id);
              onChange?.(item.id);
            }}
            className="h-10 cursor-pointer gap-2.5 rounded-lg px-2.5 font-normal text-white/85 transition-colors duration-200 hover:bg-white/10 hover:text-white active:bg-white/15 active:text-white data-active:bg-white/15 data-active:font-normal data-active:text-white"
          >
            {item.icon != null ? (
              <span className="flex size-5 shrink-0 items-center justify-center [&_svg]:size-5">{item.icon}</span>
            ) : null}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <WindowModal {...props} size={size}>
      {(controls) => (
        <SidebarProvider className="min-h-0 flex-1 overflow-hidden bg-[#545458]/25">
          <div className="flex w-50 shrink-0 flex-col overflow-hidden bg-[#545458]/50 text-white">
            <div className="flex shrink-0 items-center px-6 pt-5 pb-5">{controls}</div>
            <Sidebar collapsible="none" className="min-h-0 w-full flex-1 bg-transparent text-white">
              {sidebar.header != null ? (
                <SidebarHeader className="shrink-0 px-6 pt-0 pb-4 text-xl font-bold">{sidebar.header}</SidebarHeader>
              ) : null}
              <SidebarContent className="gap-1 overflow-x-hidden px-2.5">
                {sidebar.items.map((item) =>
                  item.type === 'group' ? (
                    <SidebarGroup key={item.id} className="p-0">
                      {item.label != null ? (
                        <SidebarGroupLabel className="px-2.5 text-white/55">{item.label}</SidebarGroupLabel>
                      ) : null}
                      <SidebarGroupContent>{renderMenu(item.items)}</SidebarGroupContent>
                    </SidebarGroup>
                  ) : (
                    <SidebarGroup key={item.id} className="p-0">
                      <SidebarGroupContent>{renderMenu([item])}</SidebarGroupContent>
                    </SidebarGroup>
                  ),
                )}
              </SidebarContent>
              {sidebar.footer != null ? (
                <SidebarFooter className="shrink-0 px-5 py-4">{sidebar.footer}</SidebarFooter>
              ) : null}
            </Sidebar>
          </div>
          <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
            <Suspense key={current?.id} fallback={<Loading />}>
              {Content ? <Content /> : isValidElement(content) ? content : null}
            </Suspense>
          </div>
        </SidebarProvider>
      )}
    </WindowModal>
  );
}
