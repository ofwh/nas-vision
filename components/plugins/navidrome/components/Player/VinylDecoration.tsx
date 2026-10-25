'use client';

import { useState } from 'react';
import Image from 'next/image';
import { pluginPath } from '@/lib/plugins/client';
import vinyl from '../../assets/vinyl.svg';
import { usePlaybackStore } from '../../stores/context';

export default function VinylDecoration() {
  const hasSong = usePlaybackStore((state) => Boolean(state.queue[state.index]));
  const playing = usePlaybackStore((state) => state.playing);
  const coverArt = usePlaybackStore((state) => state.queue[state.index]?.coverArt);
  const [failedCover, setFailedCover] = useState<string | null>(null);

  if (!hasSong) {
    return null;
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-0 bottom-0 -z-10 aspect-square h-[100%] translate-x-2/7 translate-y-2/7 opacity-25 select-none"
    >
      <div
        data-playing={playing}
        className="relative size-full animate-spin overflow-hidden rounded-full [animation-duration:20s] [animation-play-state:paused] data-[playing=true]:[animation-play-state:running] motion-reduce:animate-none"
      >
        <Image src={vinyl} alt="" fill unoptimized sizes="175vh" draggable={false} className="object-contain" />
        {coverArt && coverArt !== failedCover ? (
          <div className="absolute top-1/2 left-1/2 size-[34.43%] -translate-1/2 overflow-hidden rounded-full [mask-image:radial-gradient(circle_closest-side,transparent_6.25%,black_6.25%)]">
            <Image
              key={coverArt}
              src={`${pluginPath('navidrome', '/api/cover')}?id=${encodeURIComponent(coverArt)}`}
              alt=""
              fill
              unoptimized
              sizes="44vh"
              draggable={false}
              className="object-cover"
              onError={() => setFailedCover(coverArt)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
