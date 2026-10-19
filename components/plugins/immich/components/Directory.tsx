'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { Folder, LoaderCircle } from 'lucide-react';
import { usePluginFetch } from '@/hooks/usePlugin';
import type { ImmichDirectory, ImmichMode, ImmichPreviewRes } from '../types';
import styles from '../styles/Directory.module.css';
import Photo from './Photo';

export default function Directory({
  directory,
  mode,
  onOpen,
}: {
  directory: ImmichDirectory;
  mode: ImmichMode;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '160px' },
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);
  const { data, isLoading } = usePluginFetch<ImmichPreviewRes>('immich', visible ? '/api/preview' : null, {
    directory: directory.id,
    mode,
  });
  const images = data?.images.slice(0, 3) ?? [];
  const label = (
    <div className="absolute inset-x-3 bottom-3 z-10 flex min-w-0 items-center gap-2 text-white drop-shadow-sm">
      <Folder className="size-4 shrink-0" fill="currentColor" />
      <span className="truncate text-sm font-medium" title={directory.name}>
        {directory.name}
      </span>
    </div>
  );

  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      className={`${styles.directory} group h-full w-full cursor-pointer rounded-xl bg-transparent text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
    >
      <div className="relative h-full overflow-hidden rounded-xl" aria-busy={isLoading}>
        {images.length ? (
          images.map((photo, index) => {
            const position = images.length === 1 ? 0 : (index / (images.length - 1)) * 2 - 1;
            const tilt = index === images.length - 1 ? 0 : index === 0 ? 2 : 1;
            const angle = -3 * tilt;
            const hoverAngle = -5 * tilt;

            return (
              <div
                key={photo.id}
                className={`${styles.preview} absolute right-3 bottom-3 aspect-[3/4] h-[84%] origin-bottom-left overflow-hidden rounded-xl shadow-lg ring-1 ring-white/15`}
                style={
                  {
                    '--preview-offset': `${images.length === 1 ? 0 : (position - 1) * 8}%`,
                    '--preview-angle': `${angle}deg`,
                    '--preview-hover-angle': `${hoverAngle}deg`,
                    zIndex: index + 1,
                  } as CSSProperties
                }
              >
                <Photo id={photo.id} name={photo.name} className="h-full w-full bg-transparent!" />
                {index === images.length - 1 ? (
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                ) : null}
                {index === images.length - 1 ? label : null}
              </div>
            );
          })
        ) : (
          <div className="flex h-full items-center justify-center">
            {isLoading ? (
              <LoaderCircle className="size-6 animate-spin text-zinc-500 motion-reduce:animate-none" />
            ) : (
              <Folder className="size-14 text-zinc-600" strokeWidth={1} />
            )}
          </div>
        )}
        {!images.length ? label : null}
      </div>
    </button>
  );
}
