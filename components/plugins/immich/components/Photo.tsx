'use client';

import Image from 'next/image';
import { ImageOff, LoaderCircle } from 'lucide-react';
import { usePluginFetch } from '@/hooks/usePlugin';
import type { ImmichThumbnailRes } from '../types';

export default function Photo({
  id,
  name,
  size = 'thumbnail',
  className = '',
  onDimensions,
}: {
  id: string;
  name: string;
  size?: 'thumbnail' | 'preview';
  className?: string;
  onDimensions?: (width: number, height: number) => void;
}) {
  const { data, error, isLoading } = usePluginFetch<ImmichThumbnailRes>('immich', '/api/thumbnail', { id, size });
  return (
    <div className={`relative overflow-hidden bg-white/5 ${className}`}>
      {data ? (
        <Image
          src={data.dataUrl}
          alt={name}
          fill
          unoptimized
          sizes={size === 'preview' ? '100vw' : '300px'}
          className="object-cover"
          onLoad={
            onDimensions
              ? (event) => onDimensions(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)
              : undefined
          }
        />
      ) : (
        <div
          className="flex h-full min-h-12 items-center justify-center text-white/35"
          role={error ? 'img' : 'status'}
          aria-label={error ? `${name}：预览不可用` : '加载图片'}
        >
          {isLoading ? (
            <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" />
          ) : (
            <ImageOff className="size-5" />
          )}
        </div>
      )}
    </div>
  );
}
