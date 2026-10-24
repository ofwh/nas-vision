'use client';

import { useEffect, useRef } from 'react';
import type { AnimationItem } from 'lottie-web';
import type { Condition } from '../../types';
import { loadWeatherAnimation } from './animation';

export function WeatherAnimation({
  condition,
  isDay,
  label,
}: {
  condition: Condition;
  isDay: boolean | null;
  label: string;
}) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let animation: AnimationItem | undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => {
      if (reducedMotion.matches) {
        animation?.goToAndStop(0, true);
      } else {
        animation?.play();
      }
    };

    void Promise.all([import('lottie-web'), loadWeatherAnimation(condition, isDay)])
      .then(([lottie, data]) => {
        if (!active || !container.current) {
          return;
        }

        animation = lottie.default.loadAnimation({
          container: container.current,
          renderer: 'svg',
          loop: true,
          autoplay: !reducedMotion.matches,
          animationData: structuredClone(data.default),
          rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
        });
        updateMotion();
      })
      .catch(() => {
        animation?.destroy();
        if (active && container.current) {
          container.current.replaceChildren();
        }
      });
    reducedMotion.addEventListener('change', updateMotion);

    return () => {
      active = false;
      reducedMotion.removeEventListener('change', updateMotion);
      animation?.destroy();
    };
  }, [condition, isDay]);

  return (
    <div role="img" aria-label={label} className="relative size-full">
      <div ref={container} aria-hidden className="h-full w-auto [&>svg]:h-full! [&>svg]:w-auto!" />
    </div>
  );
}
