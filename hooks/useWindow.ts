'use client';

import { createContext, useContext } from 'react';
import type { WindowContextValue } from '@/types/window';

export const WindowContext = createContext<WindowContextValue | null>(null);

export function useWindow(): WindowContextValue {
  const context = useContext(WindowContext);

  if (!context) {
    throw new Error('useWindow 必须在 WindowModal 内使用');
  }

  return context;
}
