'use client';

import { createContext, type ReactNode, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';

export const WindowFooterContext = createContext<{
  target: HTMLDivElement | null;
  setHasContent: (hasContent: boolean) => void;
} | null>(null);

export function WindowFooter({ children }: { children: ReactNode }) {
  const context = useContext(WindowFooterContext);
  const setHasContent = context?.setHasContent;

  useEffect(() => {
    setHasContent?.(true);

    return () => setHasContent?.(false);
  }, [setHasContent]);

  return context?.target ? createPortal(children, context.target) : null;
}
