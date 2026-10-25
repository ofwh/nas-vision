'use client';

import { useCallback, useSyncExternalStore } from 'react';

function currentMinute() {
  return Math.floor(Date.now() / 60000) * 60000;
}

function serverTime() {
  return null;
}

export function useWeatherTime(enabled: boolean) {
  const subscribe = useCallback(
    (notify: () => void) => {
      if (!enabled) {
        return () => {};
      }

      const timer = setInterval(notify, 60000);

      return () => clearInterval(timer);
    },
    [enabled],
  );

  return useSyncExternalStore(subscribe, currentMinute, serverTime);
}
