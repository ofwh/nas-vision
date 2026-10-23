'use client';

import { type CSSProperties, useId, useMemo, useState } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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

export function WindowModal(props: WindowModalProps) {
  return props.open ? <WindowModalContent {...props} /> : null;
}

function WindowModalContent({
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
  showClose = true,
  controls: controlsConfig,
  style,
  fit,
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
  const isTransparent = transparent || windowContext.state === 'maximized';
  const showHeader = header !== false;
  const controls = showHeader ? (
    <WindowControls maximized={maximized} onMaximize={windowContext.toggleMaximize} controls={controlsConfig} />
  ) : null;
  const headerMode = mode ?? 'controls';
  const hasContentRenderer = typeof children === 'function';
  const hasFloatingHeader = showHeader && !hasContentRenderer && headerMode === 'floating';
  const spacingType = fit === true ? 'none' : headerMode === 'floating' ? 'small' : 'default';
  const spacingStyles = {
    none: {
      spacing: undefined,
      radius: 'rounded-(--window-radius)',
    },
    small: {
      spacing: 'p-2.5',
      radius: 'rounded-[calc(var(--window-radius)-var(--spacing)*2.5)]',
    },
    default: {
      spacing: showHeader && headerMode === 'controls' ? 'px-5 pb-5' : 'p-5',
      radius: headerMode === 'controls' ? 'rounded-[calc(var(--window-radius)-var(--spacing)*2.5)]' : undefined,
    },
  }[spacingType];
  const maximizedStyles = maximized
    ? {
        className: 'max-h-none! max-w-none! [--window-radius:0px]',
        style: { width: '100vw', height: '100dvh' } satisfies CSSProperties,
        spacing: undefined,
        radius: 'rounded-none',
      }
    : undefined;
  const contentStyles = maximizedStyles ?? spacingStyles;
  const resolvedStyle = { ...style, ...maximizedStyles?.style };
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
          className={maximizedStyles?.className}
          resizable={resizable && !maximized}
          transparent={isTransparent}
          title={title}
          header={
            showHeader && mode === 'native' ? (
              <NativeHeader header={typeof header === 'object' ? header : undefined} />
            ) : undefined
          }
          style={resolvedStyle}
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
          <div
            className={cn(
              'relative min-h-0 flex-1',
              hasFloatingHeader ? 'grid grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)]' : 'flex flex-col',
            )}
          >
            {showHeader && !hasContentRenderer && headerMode === 'controls' ? (
              <ControlsHeader
                title={title}
                controls={controls}
                header={typeof header === 'object' ? header : undefined}
              />
            ) : null}
            <div
              className={cn(
                'flex min-h-0 min-w-0 flex-1 flex-col',
                hasFloatingHeader && 'col-start-1 row-start-1',
                contentStyles.spacing,
              )}
            >
              <ScrollArea
                className={cn(
                  'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden [&>[data-slot=scroll-area-viewport]]:flex [&>[data-slot=scroll-area-viewport]]:h-auto [&>[data-slot=scroll-area-viewport]]:min-h-0 [&>[data-slot=scroll-area-viewport]]:flex-1 [&>[data-slot=scroll-area-viewport]]:flex-col [&>[data-slot=scroll-area-viewport]]:overscroll-contain',
                  contentStyles.radius,
                )}
              >
                <div className={cn('flex min-h-0 flex-1 flex-col', contentStyles.radius, className)}>
                  {typeof children === 'function' ? (
                    children(controls)
                  ) : children !== undefined ? (
                    children
                  ) : src ? (
                    <IframeContent key={src} src={src} title={title} />
                  ) : null}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
            {hasFloatingHeader ? (
              <FloatingHeader
                showClose={showClose}
                title={title}
                header={typeof header === 'object' ? header : undefined}
                transparent={isTransparent}
              />
            ) : null}
          </div>
        </LiquidGlassModal>
      </WindowFooterContext.Provider>
    </WindowContext.Provider>
  );
}
