'use client';

import { useTranslations } from 'next-intl';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { WindowModal } from '@/components/common/WindowModal';
import { PluginPageContext, usePlugin } from '@/hooks/usePlugin';
import { Loading } from '@/components/common/Loading';
import { useAppList } from '@/stores/app-list';
import type { AppItem as AppRecord } from '@/lib/services/apps';

function AppUrlDialog({
  name,
  url,
  config,
  onClose,
}: {
  name: string;
  url: string;
  config: AppRecord['config'];
  onClose: () => void;
}) {
  const width = typeof config.width === 'number' && config.width > 0 ? config.width : 1280;
  const height = typeof config.height === 'number' && config.height > 0 ? config.height : 800;

  return (
    <WindowModal
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      title={name}
      src={url}
      mode={config.mode === 'floating' ? 'floating' : 'controls'}
      top={config.top === true}
      resizable={config.resize === true}
      size={{ width, height }}
      style={{ width: `min(${width}px, 90vw)`, height: `min(${height}px, 85vh)` }}
    />
  );
}

function AppPluginDialog({
  name,
  page,
  plugin,
  onClose,
}: {
  name: string;
  page: ReturnType<typeof usePlugin>['page'];
  plugin: ReturnType<typeof usePlugin>['app'];
  onClose: () => void;
}) {
  const t = useTranslations();
  const PluginView = plugin.component;
  const size = plugin.manifest?.size;

  return (
    <WindowModal
      open
      title={name}
      mode={plugin.manifest?.mode}
      header={plugin.manifest?.header}
      onOpenChange={(value) => {
        if (!value) {
          onClose();
        }
      }}
      size={size}
      transparent={plugin.manifest?.transparent}
      fit={plugin.manifest?.fit}
      resizable={plugin.manifest?.resizable}
      top={plugin.manifest?.top}
      style={size ? { width: `min(${size.width}px, 90vw)`, height: `min(${size.height}px, 85vh)` } : undefined}
    >
      <PluginPageContext.Provider value={{ ...page, close: onClose }}>
        {plugin.isLoading ? (
          <Loading />
        ) : PluginView && !plugin.error ? (
          <PluginView path={page.path} />
        ) : (
          <p role="alert" className="p-6 text-white/70">
            {t('apps.pluginUnavailable')}
          </p>
        )}
      </PluginPageContext.Provider>
    </WindowModal>
  );
}

export function AppItem({ id, name, image, type, url, innerUrl, external, config }: AppRecord) {
  const t = useTranslations();
  const { page, app: plugin } = usePlugin(
    type === 'plugin' && typeof config.pluginName === 'string' ? config.pluginName : '',
  );
  const activePluginId = useAppList((state) => state.activePluginId);
  const setActivePluginId = useAppList((state) => state.setActivePluginId);
  const launchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closePlugin = () => {
    page.close();
    setActivePluginId(null);
  };

  useEffect(
    () => () => {
      if (launchTimer.current) {
        clearTimeout(launchTimer.current);
      }

      if (useAppList.getState().activePluginId === id) {
        useAppList.getState().setActivePluginId(null);
      }
    },
    [id],
  );
  const barRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);
  const [open, setOpen] = useState(false);
  const address = url.trim() || innerUrl.trim();

  const openPage = () => {
    if (type === 'plugin') {
      if (typeof config.pluginName !== 'string' || activePluginId !== null) {
        return;
      }

      setActivePluginId(id);
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      launchTimer.current = setTimeout(
        () => {
          launchTimer.current = null;
          page.open();
        },
        reducedMotion ? 0 : 350,
      );

      return;
    }

    if (!address) {
      return;
    }

    let target: URL;

    try {
      target = new URL(address, window.location.href);
    } catch {
      return;
    }
    if (target.protocol !== 'http:' && target.protocol !== 'https:') {
      return;
    }

    if (external === 'newtab') {
      window.open(target.href, '_blank', 'noopener,noreferrer');
    } else if (external === 'replace') {
      window.location.assign(target.href);
    } else if (external === 'iframe') {
      setOpen(true);
    }
  };

  useEffect(() => {
    const bar = barRef.current;
    const text = textRef.current;

    if (!bar || !text) {
      return;
    }

    const measure = () => setOverflow(Math.max(0, text.scrollWidth - bar.clientWidth));

    measure();

    const observer = new ResizeObserver(measure);

    observer.observe(bar);
    observer.observe(text);

    return () => observer.disconnect();
  }, [name]);

  return (
    <>
      <div className="group flex h-52 w-60">
        <div className="h-full w-5" />

        <div className="h-full w-full pt-6.5">
          <button
            type="button"
            onClick={openPage}
            disabled={type === 'plugin' ? !config.pluginName : !address}
            aria-label={t('home.openNamed', { name })}
            className="flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-default"
          >
            {/* 别在玻璃上写 opacity：会自建 backdrop 根，毛玻璃就看不到背景了 */}
            {/* 放大走 transform，不占布局；长出来的部分靠 z-10 的文案盖住 */}
            <LiquidGlass
              className="h-32 w-32 rounded-full transition-transform duration-500 ease-out hover:scale-110"
              contentClassName="h-full"
            >
              {image ? <img src={image} alt="" className="h-full w-full rounded-full object-cover" /> : null}
            </LiquidGlass>

            <div
              ref={barRef}
              className="relative z-10 flex h-5.5 max-w-50 items-center overflow-hidden rounded-md text-sm text-white"
            >
              <span
                ref={textRef}
                className={overflow > 0 ? 'group-hover:animate-marquee whitespace-nowrap' : 'whitespace-nowrap'}
                style={{ '--marquee-shift': `-${overflow}px` } as CSSProperties}
              >
                {name}
              </span>
            </div>
          </button>
        </div>

        <div className="h-full w-5" />
      </div>
      {page.isOpen ? <AppPluginDialog name={name} page={page} plugin={plugin} onClose={closePlugin} /> : null}
      {open ? <AppUrlDialog name={name} url={address} config={config} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
