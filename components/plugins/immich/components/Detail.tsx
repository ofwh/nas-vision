'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Map, Star, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { WindowModal } from '@/components/common/WindowModal';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Button } from '@/components/ui/button';
import { usePluginFetch } from '@/hooks/usePlugin';
import type { ImmichDetailRes, ImmichImage } from '../types';
import Photo from './Photo';
import MediaInfo, { type MediaInfoItem } from './MediaInfo';

function date(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const year = String(parsed.getFullYear()).padStart(4, '0');
  const [month, day, hours, minutes, seconds] = [
    parsed.getMonth() + 1,
    parsed.getDate(),
    parsed.getHours(),
    parsed.getMinutes(),
    parsed.getSeconds(),
  ].map((part) => String(part).padStart(2, '0'));
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}
function bytes(value: number): string {
  return value >= 1024 * 1024 ? `${(value / 1024 / 1024).toFixed(1)} MB` : `${(value / 1024).toFixed(1)} KB`;
}

export default function Detail({
  image,
  onClose,
  onPrevious,
  onNext,
}: {
  image: ImmichImage;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}) {
  const t = useTranslations();
  const { data, error, isLoading } = usePluginFetch<ImmichDetailRes>('immich', '/api/detail', { id: image.id });
  const [dimensions, setDimensions] = useState<{ id: string; ratio: number } | null>(null);
  const naturalRatio = dimensions?.id === image.id ? dimensions.ratio : null;
  const width = data?.width ?? image.width;
  const height = data?.height ?? image.height;
  const ratio = naturalRatio ?? (width && height && width > 0 && height > 0 ? width / height : 1);
  const exif = data?.exif ?? {};
  const latitude = exif.latitude;
  const longitude = exif.longitude;
  const hasGeo = typeof latitude === 'number' && typeof longitude === 'number';
  const basicInfo: MediaInfoItem[] = [
    ['相机设备', [exif.make, exif.model].filter(Boolean).join(' ')],
    ['尺寸', width && height ? `${width} × ${height}` : null],
    ['文件大小', exif.fileSizeInByte == null ? null : bytes(exif.fileSizeInByte)],
    ['拍摄时间', date(exif.dateTimeOriginal ?? image.takenAt)],
  ];
  const shootingInfo: MediaInfoItem[] = [
    ['ISO', exif.iso == null ? null : `${exif.iso}`],
    ['焦距', exif.focalLength == null ? null : `${exif.focalLength} mm`],
    [
      '曝光补偿',
      exif.exposureCompensation == null
        ? null
        : `${exif.exposureCompensation > 0 ? '+' : ''}${exif.exposureCompensation} EV`,
    ],
    ['光圈', exif.fNumber == null ? null : `ƒ/${exif.fNumber}`],
    ['快门', exif.exposureTime ? `${exif.exposureTime} s` : null],
  ];
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key === 'ArrowLeft' && onPrevious) {
        event.preventDefault();
        onPrevious();
      } else if (event.key === 'ArrowRight' && onNext) {
        event.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onPrevious, onNext]);

  return (
    <WindowModal
      mode="floating"
      open
      top
      title={image.name}
      modal
      closeOnOverlay
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      style={{ width: `min(90vw, ${90 * ratio}vh)`, height: `min(90vh, ${90 / ratio}vw)` }}
      footer={
        <nav aria-label="图片切换" className="flex items-center gap-2 text-white">
          <Button
            variant="ghost"
            size="icon"
            aria-label="上一张"
            title="上一张"
            className="size-8 rounded-full"
            disabled={!onPrevious}
            onClick={onPrevious}
          >
            <ChevronLeft aria-hidden className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="下一张"
            title="下一张"
            className="size-8 rounded-full"
            disabled={!onNext}
            onClick={onNext}
          >
            <ChevronRight aria-hidden className="size-4" />
          </Button>
        </nav>
      }
    >
      {() => (
        <div className="group/image relative min-h-0 w-full flex-1 text-sm text-white">
          <Photo
            key={image.id}
            id={image.id}
            name={image.name}
            size="preview"
            className="h-full w-full rounded-xl [&_img]:object-contain"
            onDimensions={(width, height) => {
              if (width > 0 && height > 0) setDimensions({ id: image.id, ratio: width / height });
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center gap-2 rounded-t-xl bg-gradient-to-b from-black/70 to-transparent px-14 py-5 opacity-0 transition-opacity duration-300 ease-out group-hover/image:opacity-100 motion-reduce:transition-none">
            <p className="min-w-0 text-center text-sm font-medium break-all">{image.name}</p>
            {data?.isFavorite ? <Star className="size-4 shrink-0 fill-amber-300 text-amber-300" /> : null}
          </div>
          <div className="absolute top-4 left-4">
            <LiquidGlass className="size-10 rounded-full" contentClassName="h-full">
              <Button
                variant="ghost"
                size="icon-lg"
                aria-label={t('common.close')}
                title={t('common.close')}
                className="rounded-full text-white hover:bg-white/15 hover:text-white"
                onClick={onClose}
              >
                <X aria-hidden className="size-5" />
              </Button>
            </LiquidGlass>
          </div>
          {hasGeo ? (
            <div className="absolute top-4 right-4">
              <LiquidGlass className="size-10 rounded-full" contentClassName="h-full">
                <Button
                  variant="ghost"
                  size="icon-lg"
                  nativeButton={false}
                  aria-label="在地图中查看"
                  title="在地图中查看"
                  className="rounded-full text-white hover:bg-white/15 hover:text-white"
                  render={
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <Map aria-hidden className="size-5" />
                </Button>
              </LiquidGlass>
            </div>
          ) : null}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 max-h-full overflow-y-auto rounded-b-xl bg-gradient-to-t from-black/85 to-black/50 p-4 opacity-0 transition-opacity duration-300 ease-out group-hover/image:pointer-events-auto group-hover/image:opacity-100 motion-reduce:transition-none">
            {isLoading ? (
              <p role="status" className="text-sm text-white/50">
                正在读取拍摄信息…
              </p>
            ) : null}
            {error ? (
              <p role="alert" className="text-sm text-red-300">
                {error.message}
              </p>
            ) : null}
            <MediaInfo firstRow={basicInfo} secondRow={shootingInfo} />
          </div>
        </div>
      )}
    </WindowModal>
  );
}
