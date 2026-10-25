'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { WindowCache } from '../utils/cache';

export function NavidromeCacheProvider({ children }: { children: ReactNode }) {
  const [{ cache, config }] = useState(() => {
    const cache = new WindowCache();

    return { cache, config: { provider: () => cache } };
  });

  useEffect(() => {
    cache.activate();

    return () => cache.dispose();
  }, [cache]);

  return <SWRConfig value={config}>{children}</SWRConfig>;
}
