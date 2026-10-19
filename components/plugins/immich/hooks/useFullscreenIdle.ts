'use client';

import { useEffect } from 'react';
import { useContainer } from '@videojs/react';
import { usePlayer } from '@videojs/react/video';

const IDLE_MS = 3_000;
const MOVE_THROTTLE_MS = 100;

export default function useFullscreenIdle() {
  const container = useContainer();
  const fullscreen = usePlayer((state) => state.isFullscreen);

  useEffect(() => {
    if (!container || !fullscreen) {
      return;
    }

    let lastActivity = performance.now();
    let lastMove = 0;
    let timer: ReturnType<typeof setTimeout>;

    const hide = () => {
      const remaining = IDLE_MS - (performance.now() - lastActivity);

      if (remaining > 0) {
        timer = setTimeout(hide, remaining);

        return;
      }

      container.setAttribute('data-controls-hidden', 'true');
    };
    const show = () => {
      lastActivity = performance.now();
      if (container.getAttribute('data-controls-hidden') === 'true') {
        container.setAttribute('data-controls-hidden', 'false');
        clearTimeout(timer);
        timer = setTimeout(hide, IDLE_MS);
      }
    };
    const move = () => {
      const now = performance.now();

      lastActivity = now;
      if (now - lastMove < MOVE_THROTTLE_MS) {
        return;
      }

      lastMove = now;
      show();
    };

    container.setAttribute('data-controls-hidden', 'false');
    timer = setTimeout(hide, IDLE_MS);
    container.addEventListener('pointermove', move, { passive: true });
    container.addEventListener('pointerdown', show, { passive: true });
    window.addEventListener('keydown', show);

    return () => {
      clearTimeout(timer);
      container.removeEventListener('pointermove', move);
      container.removeEventListener('pointerdown', show);
      window.removeEventListener('keydown', show);
      container.removeAttribute('data-controls-hidden');
    };
  }, [container, fullscreen]);
}
