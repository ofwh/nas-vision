'use client';

import { useId, useMemo, useState } from 'react';
import { LiquidGlassModal } from '@/components/common/LiquidGlassModal';
import { WindowControls } from '@/components/common/WindowControls';
import { WindowContext } from '@/hooks/useWindow';
import { cn } from '@/lib/utils';
import type { WindowContextValue, WindowModalProps } from '@/types/window';
import { ControlsHeader } from './ControlsHeader';
import { FloatingHeader } from './FloatingHeader';
import { NativeHeader } from './NativeHeader';
import { IframeContent } from './IframeContent';
import { WindowFooterContext } from './WindowFooter';

export function WindowModal({
  id,
  open,
  onOpenChange,
  onClose,
  src,
  title,
  children,
  footer,
  mode,
  header,
  controls: controlsConfig,
  style,
  fit = true,
  transparent = false,
  resizable = false,
  className,
  ...props
}: WindowModalProps) {
  const generatedId = useId();
  const [maximized, setMaximized] = useState(false);
  const windowContext = useMemo<WindowContextValue>(() => {
    const close = () => {
      onOpenChange(false);
      onClose?.();
    };

    return {
      id: id ?? generatedId,
      state: !open ? 'closed' : maximized ? 'maximized' : 'normal',
      open,
      maximized,
      close,
      minimize: close,
      maximize: () => setMaximized(true),
      restore: () => setMaximized(false),
      toggleMaximize: () => setMaximized((value) => !value),
    };
  }, [id, generatedId, open, maximized, onOpenChange, onClose]);
  const resolvedTransparent = transparent || windowContext.state === 'maximized';
  const showHeader = header !== false;
  const controls = showHeader ? (
    <WindowControls maximized={maximized} onMaximize={windowContext.toggleMaximize} controls={controlsConfig} />
  ) : null;
  const resolvedHeaderMode = mode ?? 'controls';
  const hasContentRenderer = typeof children === 'function';
  const [footerTarget, setFooterTarget] = useState<HTMLDivElement | null>(null);
  const [hasFooterContent, setHasFooterContent] = useState(false);
  const footerContext = useMemo(() => ({ target: footerTarget, setHasContent: setHasFooterContent }), [footerTarget]);

  return (
    <WindowContext.Provider value={windowContext}>
      <WindowFooterContext.Provider value={footerContext}>
        <LiquidGlassModal
          {...props}
          open={open}
          onOpenChange={onOpenChange}
          onClose={onClose}
          className={maximized ? '[--window-radius:0px]' : undefined}
          resizable={resizable && !maximized}
          transparent={resolvedTransparent}
          title={title}
          header={
            showHeader && mode === 'native' ? (
              <NativeHeader header={typeof header === 'object' ? header : undefined} />
            ) : undefined
          }
          style={{
            ...style,
            ...(maximized ? { width: '100vw', height: '100dvh', maxWidth: 'none', maxHeight: 'none' } : {}),
          }}
          footer={
            hasFooterContent ? (
              <div className="flex min-w-0 items-center gap-2">
                {footer}
                <div ref={setFooterTarget} className="min-w-0 flex-1" />
              </div>
            ) : (
              footer
            )
          }
        >
          <div className="relative flex min-h-0 flex-1 flex-col">
            {showHeader && !hasContentRenderer && resolvedHeaderMode === 'controls' ? (
              <ControlsHeader
                title={title}
                controls={controls}
                header={typeof header === 'object' ? header : undefined}
              />
            ) : null}
            <div
              className={cn(
                'flex min-h-0 flex-1 flex-col',
                maximized
                  ? undefined
                  : hasContentRenderer
                    ? fit
                      ? undefined
                      : 'p-5'
                    : resolvedHeaderMode === 'floating'
                      ? 'p-2.5'
                      : showHeader && resolvedHeaderMode === 'controls'
                        ? 'px-5 pb-5'
                        : 'p-5',
              )}
            >
              <div
                className={cn(
                  'flex min-h-0 flex-1 flex-col overflow-auto overscroll-contain',
                  maximized
                    ? 'rounded-none'
                    : hasContentRenderer
                      ? fit
                        ? 'rounded-(--window-radius)'
                        : 'rounded-none'
                      : resolvedHeaderMode === 'floating' || resolvedHeaderMode === 'controls'
                        ? 'rounded-[calc(var(--window-radius)-var(--spacing)*2.5)]'
                        : undefined,
                  className,
                )}
              >
                {typeof children === 'function' ? (
                  children(controls)
                ) : children !== undefined ? (
                  children
                ) : src ? (
                  <IframeContent key={src} src={src} title={title} />
                ) : null}
              </div>
            </div>
            {showHeader && !hasContentRenderer && mode === 'floating' ? (
              <FloatingHeader
                title={title}
                header={typeof header === 'object' ? header : undefined}
                transparent={resolvedTransparent}
              />
            ) : null}
          </div>
        </LiquidGlassModal>
      </WindowFooterContext.Provider>
    </WindowContext.Provider>
  );
}
