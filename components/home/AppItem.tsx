'use client';

import { AppWindow } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { WindowModal } from '@/components/common/WindowModal';
import { PluginPageContext, usePlugin } from '@/hooks/usePlugin';
import { useSidebar } from '@/hooks/useSidebar';
import { Loading } from '@/components/common/Loading';
import { MarqueeText } from '@/components/common/MarqueeText';
import { useAppList } from '@/stores/app-list';
import { useWindowsStore } from '@/stores/windows';
import type { AppItem as AppRecord } from '@/lib/services/apps';

function useAppSidebar(name: string, image: string) {
  const { register, setType } = useSidebar();

  useEffect(() => {
    setType('apps');
    register([
      {
        name: 'current-app',
        label: name,
        type: 'apps',
        icon: image ? (
          <Image
            src={image}
            alt=""
            width={24}
            height={24}
            unoptimized
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          AppWindow
        ),
        disabled: true,
        defaultActive: true,
        order: Number.POSITIVE_INFINITY,
      },
    ]);
  }, [image, name, register, setType]);
}

function AppUrlDialog({
  name,
  image,
  url,
  config,
  onClose,
}: {
  name: string;
  image: string;
  url: string;
  config: AppRecord['config'];
  onClose: () => void;
}) {
  useAppSidebar(name, image);
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
  image,
  page,
  plugin,
  onClose,
}: {
  name: string;
  image: string;
  page: ReturnType<typeof usePlugin>['page'];
  plugin: ReturnType<typeof usePlugin>['app'];
  onClose: () => void;
}) {
  const t = useTranslations();
  const PluginView = plugin.component;
  const size = plugin.manifest?.size;

  useAppSidebar(name, image);

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
      closeOnOverlay={plugin.manifest?.closeOnOverlay ?? true}
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

export function AppItem({ id, name, image, type, url, external, config }: AppRecord) {
  const t = useTranslations();
  const { page, app: plugin } = usePlugin(
    type === 'plugin' && typeof config.pluginName === 'string' ? config.pluginName : '',
  );
  const activePluginId = useAppList((state) => state.activePluginId);
  const setActivePluginId = useAppList((state) => state.setActivePluginId);
  const launchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const closeApp = () => {
    if (launchTimer.current !== null) {
      clearTimeout(launchTimer.current);
      launchTimer.current = null;
    }

    page.close();
    setOpen(false);
    const state = useAppList.getState();

    if (state.activePluginId === id) {
      state.setActivePluginId(null);
    }

    useWindowsStore.getState().unregister(`app:${id}`);
  };

  useEffect(
    () => () => {
      if (launchTimer.current) {
        clearTimeout(launchTimer.current);
      }

      if (useAppList.getState().activePluginId === id) {
        useAppList.getState().setActivePluginId(null);
      }

      useWindowsStore.getState().unregister(`app:${id}`);
    },
    [id],
  );
  const address = url.trim();

  const openPage = () => {
    if (type === 'plugin') {
      if (typeof config.pluginName !== 'string' || activePluginId !== null) {
        return;
      }

      useWindowsStore.getState().register({ id: `app:${id}`, type: 'plugin', close: closeApp });
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
      useWindowsStore.getState().register({ id: `app:${id}`, type: 'url', close: closeApp });
      setOpen(true);
    }
  };

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
            className="group/app flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-default"
          >
            {/* 别在玻璃上写 opacity：会自建 backdrop 根，毛玻璃就看不到背景了 */}
            {/* 放大走 transform，不占布局；长出来的部分靠 z-10 的文案盖住 */}
            <div className="group/icon relative h-32 w-32 rounded-full transition-transform duration-500 ease-out hover:scale-110">
              <LiquidGlass className="h-full w-full rounded-full" contentClassName="h-full">
                {image ? (
                  <Image
                    src={image}
                    alt=""
                    width={128}
                    height={128}
                    unoptimized
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : null}
              </LiquidGlass>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full opacity-0 shadow-[0_0_0_1px_rgb(255_248_241/24%),0_0_12px_2px_rgb(255_234_215/18%),0_0_26px_5px_rgb(255_234_215/8%)] transition-opacity duration-650 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/icon:opacity-100 group-focus-visible/app:opacity-100 motion-reduce:transition-none"
              />
            </div>

            <MarqueeText
              text={name}
              className="relative z-10 flex h-5.5 max-w-50 items-center rounded-md text-sm text-white"
              animationClassName="group-hover/app:animate-marquee group-focus-visible/app:animate-marquee"
            />
          </button>
        </div>

        <div className="h-full w-5" />
      </div>
      {page.isOpen ? (
        <AppPluginDialog name={name} image={image} page={page} plugin={plugin} onClose={closeApp} />
      ) : null}
      {open ? <AppUrlDialog name={name} image={image} url={address} config={config} onClose={closeApp} /> : null}
    </>
  );
}
