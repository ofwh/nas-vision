'use client';

import { useLocale } from 'next-intl';
import { useState } from 'react';
import { usePluginFetch } from '@/hooks/usePlugin';
import MediaModal from '../MediaModal';
import type { ImmichDetailRes, ImmichImage } from '../../types';
import PhotoContent from './PhotoContent';
import PhotoFooter from './PhotoFooter';

export default function PhotoModal({
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
  const locale = useLocale();
  const { data, error, isLoading } = usePluginFetch<ImmichDetailRes>('immich', '/api/detail', { id: image.id, locale });
  const [dimensions, setDimensions] = useState<{ id: string; ratio: number } | null>(null);
  const [rotation, setRotation] = useState(0);
  const naturalRatio = dimensions?.id === image.id ? dimensions.ratio : null;
  const width = data?.width ?? image.width;
  const height = data?.height ?? image.height;
  const ratio = naturalRatio ?? (width && height && width > 0 && height > 0 ? width / height : 1);

  const displayRatio = rotation % 180 === 0 ? ratio : 1 / ratio;

  return (
    <MediaModal
      fit
      title={image.name}
      ratio={displayRatio}
      onClose={onClose}
      footer={<PhotoFooter onPrevious={onPrevious} onNext={onNext} />}
    >
      <PhotoContent
        image={image}
        rotation={rotation}
        displayRatio={displayRatio}
        onRotate={() => setRotation((value) => (value + 90) % 360)}
        data={data}
        error={error}
        isLoading={isLoading}
        onDimensions={(width, height) => {
          if (width > 0 && height > 0) {
            setDimensions({ id: image.id, ratio: width / height });
          }
        }}
      />
    </MediaModal>
  );
}
