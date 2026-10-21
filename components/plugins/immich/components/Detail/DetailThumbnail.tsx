'use client';

import type { CSSProperties } from 'react';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { ImageOff, LoaderCircle } from 'lucide-react';
import { usePluginFetch } from '@/hooks/usePlugin';
import { useImmichTranslations } from '../../i18n/useTranslations';
import type { ImmichThumbnailRes } from '../../types';

export default function DetailThumbnail({
  id,
  name,
  size = 'thumbnail',
  className = '',
  onDimensions,
  style,
}: {
  id: string;
  name: string;
  size?: 'thumbnail' | 'preview';
  className?: string;
  style?: CSSProperties;
  onDimensions?: (width: number, height: number) => void;
}) {
  const t = useImmichTranslations();
  const locale = useLocale();
  const { data, error, isLoading } = usePluginFetch<ImmichThumbnailRes>('immich', '/api/thumbnail', {
    id,
    size,
    locale,
  });

  return (
    <div className={`relative overflow-hidden bg-white/5 ${className}`} style={style}>
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
          aria-label={error ? t('ui.previewUnavailable', { name }) : t('ui.loadingImage')}
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
