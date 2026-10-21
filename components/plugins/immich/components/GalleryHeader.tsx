'use client';

import type { ReactElement } from 'react';
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { ArrowDownAZ, ArrowDownZA, ChevronLeft, Folder, House, Images, RefreshCw, X } from 'lucide-react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useWindow } from '@/hooks/useWindow';
import { useImmichTranslations } from '../i18n/useTranslations';
import type { ImmichMode, ImmichOrder } from '../types';
import styles from '../styles/GalleryHeader.module.css';

type GalleryHeaderProps = {
  mode?: ImmichMode;
  order: ImmichOrder;
  onOrderChange: (order: ImmichOrder) => void;
  loading: boolean;
  canGoBack: boolean;
  onBack: () => void;
  onRoot: () => void;
  onModeChange: (mode: ImmichMode) => void;
  onRefresh: () => void;
};

function HeaderTooltip({ label, children }: { label: string; children: ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner side="top" sideOffset={8} className="pointer-events-none z-[1200]">
          <TooltipPrimitive.Popup>
            <LiquidGlass className="rounded-full" contentClassName="px-3 py-2 text-xs text-white">
              {label}
            </LiquidGlass>
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </Tooltip>
  );
}

export default function GalleryHeader({
  mode,
  order,
  onOrderChange,
  loading,
  canGoBack,
  onBack,
  onRoot,
  onModeChange,
  onRefresh,
}: GalleryHeaderProps) {
  const t = useImmichTranslations();
  const { close, maximized } = useWindow();
  const Surface = maximized ? 'div' : LiquidGlass;

  return (
    <TooltipProvider delay={300}>
      <header className="pointer-events-none absolute inset-x-2.5 top-1 z-40 flex min-h-12 items-center justify-between gap-3 text-white">
        <div className="pointer-events-auto flex min-w-0 items-center gap-2">
          <Surface className="shrink-0 rounded-full">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label={t('ui.close')}
              title={t('ui.close')}
              onClick={close}
            >
              <X aria-hidden />
            </Button>
          </Surface>
          {canGoBack ? (
            <>
              <Surface className="shrink-0 rounded-full">
                <HeaderTooltip label={t('ui.back')}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    aria-label={t('ui.back')}
                    onClick={onBack}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                </HeaderTooltip>
              </Surface>
              <Surface className="shrink-0 rounded-full">
                <HeaderTooltip label={t('ui.root')}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    aria-label={t('ui.root')}
                    onClick={onRoot}
                  >
                    <House className="size-4" />
                  </Button>
                </HeaderTooltip>
              </Surface>
            </>
          ) : null}
        </div>
        <div className="pointer-events-auto flex shrink-0 items-center gap-2">
          {mode === 'albums' ? (
            <Surface className="shrink-0 rounded-full">
              <HeaderTooltip label={t(order === 'asc' ? 'ui.sortAscending' : 'ui.sortDescending')}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label={t(order === 'asc' ? 'ui.sortAscending' : 'ui.sortDescending')}
                  disabled={loading}
                  onClick={() => onOrderChange(order === 'asc' ? 'desc' : 'asc')}
                >
                  {order === 'asc' ? (
                    <ArrowDownAZ aria-hidden className="size-4" />
                  ) : (
                    <ArrowDownZA aria-hidden className="size-4" />
                  )}
                </Button>
              </HeaderTooltip>
            </Surface>
          ) : null}
          <Surface className="shrink-0 rounded-full">
            <Tabs
              value={mode ?? 'folders'}
              onValueChange={(value) => {
                if (value === 'folders' || value === 'albums') {
                  onModeChange(value);
                }
              }}
            >
              <TabsList
                aria-label={t('ui.browseMode')}
                className="relative gap-2 rounded-full bg-transparent p-1 group-data-horizontal/tabs:h-9"
              >
                <span
                  aria-hidden
                  className={`pointer-events-none absolute top-1 left-1 size-7 rounded-full bg-white/20 shadow-sm ${mode === 'albums' ? styles.albums : styles.folders}`}
                />
                <HeaderTooltip label={t('ui.folderMode')}>
                  <TabsTrigger
                    value="folders"
                    disabled={!mode}
                    aria-label={t('ui.folderMode')}
                    className="z-10 size-7 flex-none rounded-full p-0 text-white/55 hover:text-white data-active:bg-transparent data-active:text-white group-data-[variant=default]/tabs-list:data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-transparent dark:data-active:text-white"
                  >
                    <Folder className="size-4" />
                  </TabsTrigger>
                </HeaderTooltip>
                <HeaderTooltip label={t('ui.albumMode')}>
                  <TabsTrigger
                    value="albums"
                    disabled={!mode}
                    aria-label={t('ui.albumMode')}
                    className="z-10 size-7 flex-none rounded-full p-0 text-white/55 hover:text-white data-active:bg-transparent data-active:text-white group-data-[variant=default]/tabs-list:data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-transparent dark:data-active:text-white"
                  >
                    <Images className="size-4" />
                  </TabsTrigger>
                </HeaderTooltip>
              </TabsList>
            </Tabs>
          </Surface>
          <Surface className="shrink-0 rounded-full">
            <HeaderTooltip label={t('ui.refresh')}>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label={t('ui.refresh')}
                disabled={loading}
                onClick={onRefresh}
              >
                <RefreshCw className={`size-4 ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`} />
              </Button>
            </HeaderTooltip>
          </Surface>
        </div>
      </header>
    </TooltipProvider>
  );
}
