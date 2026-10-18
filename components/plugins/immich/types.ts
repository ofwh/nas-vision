export type ImmichMode = 'folders' | 'albums';

export type ImmichDirectory = {
  type: 'directory';
  id: string;
  name: string;
  count: number | null;
};
type ImmichMediaInfo = {
  id: string;
  name: string;
  width: number | null;
  height: number | null;
  takenAt: string;
  duration: string | null;
};
export type ImmichImage = ImmichMediaInfo & { type: 'image' };
export type ImmichVideo = ImmichMediaInfo & { type: 'video' };
export type ImmichMedia = ImmichImage | ImmichVideo;

export type ImmichExif = {
  city?: string | null;
  state?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  make?: string | null;
  model?: string | null;
  lensModel?: string | null;
  exposureTime?: string | null;
  exposureCompensation?: number | null;
  fNumber?: number | null;
  focalLength?: number | null;
  iso?: number | null;
  fileSizeInByte?: number | null;
  exifImageWidth?: number | null;
  exifImageHeight?: number | null;
  orientation?: string | null;
  description?: string | null;
  dateTimeOriginal?: string | null;
  timeZone?: string | null;
};
export type ImmichDetailRes = ImmichMedia & {
  originalPath: string;
  mimeType: string | null;
  isFavorite: boolean;
  exif: ImmichExif;
};
export type ImmichListParams = { directory?: string; page?: number; pageSize?: number; mode?: ImmichMode };
export type ImmichDetailParams = { id: string };
export type ImmichVideoParams = { id: string };
export type ImmichVideoContext = { range: string | null; signal: AbortSignal };
export type ImmichPreviewParams = { directory: string; mode: ImmichMode };
export type ImmichThumbnailParams = { id: string; size?: 'thumbnail' | 'preview' };
export type ImmichListRes = {
  items: (ImmichDirectory | ImmichMedia)[];
  page: number;
  hasMore: boolean;
  directory: string;
  name: string;
  parent: string | null;
  mode: ImmichMode;
};
export type ImmichPreviewRes = { images: ImmichMedia[] };
export type ImmichThumbnailRes = { dataUrl: string };
export type ImmichAsset = {
  id: string;
  type: string;
  originalFileName: string;
  originalPath: string;
  originalMimeType?: string;
  fileCreatedAt: string;
  width?: number | null;
  height?: number | null;
  duration?: number | string | null;
  isFavorite: boolean;
  isTrashed?: boolean;
  exifInfo?: ImmichExif;
};
export type ImmichAlbum = { id: string; albumName: string; assetCount: number };
export type ImmichSearchRes = {
  assets: { items: ImmichAsset[]; nextPage?: string | null; nextCursor?: string | null };
};
