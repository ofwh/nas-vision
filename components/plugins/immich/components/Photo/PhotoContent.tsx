'use client';

import { Map, RotateCwSquare, Star } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Button } from '@/components/ui/button';
import { MediaModalCloseButton } from '../MediaModal';
import { useImmichTranslations } from '../../i18n/useTranslations';
import type { ImmichDetailRes, ImmichImage } from '../../types';
import DetailThumbnail from '../Detail/DetailThumbnail';
import PhotoInfo, { type PhotoInfoItem } from './PhotoInfo';

type PhotoContentProps = {
  image: ImmichImage;
  rotation: number;
  displayRatio: number;
  onRotate: () => void;
  data?: ImmichDetailRes;
  error?: Error;
  isLoading: boolean;
  onDimensions: (width: number, height: number) => void;
};

function date(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

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

export default function PhotoContent({
  image,
  rotation,
  displayRatio,
  onRotate,
  data,
  error,
  isLoading,
  onDimensions,
}: PhotoContentProps) {
  const t = useImmichTranslations();
  const width = data?.width ?? image.width;
  const height = data?.height ?? image.height;
  const exif = data?.exif ?? {};
  const latitude = exif.latitude;
  const longitude = exif.longitude;
  const hasGeo = typeof latitude === 'number' && typeof longitude === 'number';
  const basicInfo: PhotoInfoItem[] = [
    [t('ui.camera'), [exif.make, exif.model].filter(Boolean).join(' ')],
    [t('ui.dimensions'), width && height ? `${width} × ${height}` : null],
    [t('ui.fileSize'), exif.fileSizeInByte == null ? null : bytes(exif.fileSizeInByte)],
    [t('ui.takenAt'), date(exif.dateTimeOriginal ?? image.takenAt)],
  ];
  const shootingInfo: PhotoInfoItem[] = [
    [t('ui.iso'), exif.iso == null ? null : `${exif.iso}`],
    [t('ui.focalLength'), exif.focalLength == null ? null : `${exif.focalLength} mm`],
    [
      t('ui.exposure'),
      exif.exposureCompensation == null
        ? null
        : `${exif.exposureCompensation > 0 ? '+' : ''}${exif.exposureCompensation} EV`,
    ],
    [t('ui.aperture'), exif.fNumber == null ? null : `ƒ/${exif.fNumber}`],
    [t('ui.shutter'), exif.exposureTime ? `${exif.exposureTime} s` : null],
  ];

  return (
    <div className="group/image relative min-h-0 w-full flex-1 text-sm text-white">
      <DetailThumbnail
        key={image.id}
        id={image.id}
        name={image.name}
        size="preview"
        className="h-full w-full [&_img]:object-contain"
        onDimensions={onDimensions}
        style={{
          position: 'absolute',
          width: `${rotation % 180 === 0 ? 100 : 100 / displayRatio}%`,
          height: `${rotation % 180 === 0 ? 100 : 100 * displayRatio}%`,
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center gap-2 bg-gradient-to-b from-black/70 to-transparent px-14 py-5 opacity-0 transition-opacity duration-300 ease-out group-hover/image:opacity-100 motion-reduce:transition-none">
        <p className="min-w-0 text-center text-sm font-medium break-all">{image.name}</p>
        {data?.isFavorite ? <Star className="size-4 shrink-0 fill-amber-300 text-amber-300" /> : null}
      </div>
      <MediaModalCloseButton />
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LiquidGlass className="size-10 rounded-full" contentClassName="h-full">
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={t('ui.rotateClockwise')}
            title={t('ui.rotateClockwise')}
            className="rounded-full text-white"
            onClick={onRotate}
          >
            <RotateCwSquare aria-hidden className="size-5" />
          </Button>
        </LiquidGlass>
        {hasGeo ? (
          <LiquidGlass className="size-10 rounded-full" contentClassName="h-full">
            <Button
              variant="ghost"
              size="icon-lg"
              nativeButton={false}
              aria-label={t('ui.map')}
              title={t('ui.map')}
              className="rounded-full text-white"
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
        ) : null}
      </div>
      <ScrollArea className="pointer-events-none absolute inset-x-0 bottom-0 flex max-h-full flex-col overflow-hidden bg-gradient-to-t from-black/85 to-black/50 opacity-0 transition-opacity duration-300 ease-out group-hover/image:pointer-events-auto group-hover/image:opacity-100 motion-reduce:transition-none [&>[data-slot=scroll-area-viewport]]:min-h-0">
        <div className="p-4">
          {isLoading ? (
            <p role="status" className="text-sm text-white/50">
              {t('ui.loadingInfo')}
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="text-sm text-red-300">
              {error.message}
            </p>
          ) : null}
          <PhotoInfo firstRow={basicInfo} secondRow={shootingInfo} />
        </div>
      </ScrollArea>
    </div>
  );
}
