'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Disc3, ListMusic, UserRound } from 'lucide-react';
import { pluginPath } from '@/lib/plugins/client';
import { cn } from '@/lib/utils';
import type { MusicItem } from '../types';

export default function Cover({ item, className = 'rounded-[9px]' }: { item: MusicItem; className?: string }) {
  const [failed, setFailed] = useState(false);
  const Icon = item.kind === 'artist' ? UserRound : item.kind === 'playlist' ? ListMusic : Disc3;

  return (
    <span
      className={cn(
        'relative flex size-full items-center justify-center overflow-hidden bg-[#ffead7]/8 text-[#ffe9d6]/24 data-[kind=artist]:rounded-full',
        className,
      )}
      data-kind={item.kind}
    >
      <Icon aria-hidden className="size-[32%]" strokeWidth={1} />
      {item.coverArt && !failed ? (
        <Image
          unoptimized
          className="object-cover"
          fill
          sizes="240px"
          src={`${pluginPath('navidrome', '/api/cover')}?id=${encodeURIComponent(item.coverArt)}`}
          alt=""
          onError={() => setFailed(true)}
        />
      ) : null}
    </span>
  );
}
