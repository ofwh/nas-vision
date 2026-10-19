import type { PluginConfig } from '@/types/plugins';
import type {
  ImmichAsset,
  ImmichAlbum,
  ImmichMedia,
  ImmichDirectory,
  ImmichMode,
  ImmichListParams,
  ImmichListRes,
  ImmichDetailParams,
  ImmichVideoParams,
  ImmichVideoContext,
  ImmichDetailRes,
  ImmichPreviewParams,
  ImmichPreviewRes,
  ImmichThumbnailParams,
  ImmichThumbnailRes,
  ImmichSearchRes,
} from '../types';
import { formatDuration } from '../utils/duration';
import { connection, json, request } from './client';
import { ImmichError } from './errors';

function media(asset: ImmichAsset): ImmichMedia {
  return {
    type: asset.type === 'VIDEO' ? 'video' : 'image',
    id: asset.id,
    name: asset.originalFileName,
    width: asset.width ?? asset.exifInfo?.exifImageWidth ?? null,
    height: asset.height ?? asset.exifInfo?.exifImageHeight ?? null,
    takenAt: asset.fileCreatedAt,
    duration: formatDuration(asset.duration),
  };
}

function isMedia(asset: ImmichAsset): boolean {
  return (asset.type === 'IMAGE' || asset.type === 'VIDEO') && !asset.isTrashed;
}

function assetId(id: string): string {
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new ImmichError('INVALID_ID');
  }

  return encodeURIComponent(id);
}

function normalize(path: string): string {
  return path.replace(/\/+$/, '');
}

function root(config: PluginConfig): string {
  return normalize(typeof config.rootPath === 'string' ? config.rootPath.trim() : '');
}

function directoryMode(config: PluginConfig): ImmichMode {
  const mode = config.directoryMode ?? 'folders';

  if (mode !== 'folders' && mode !== 'albums') {
    throw new ImmichError('DIRECTORY_MODE_INVALID');
  }

  return mode;
}

function folderPath(directory: string, config: PluginConfig): string {
  const path = normalize(directory);
  const base = root(config);

  if (
    path.includes('\0') ||
    path.split('/').some((part) => part === '.' || part === '..') ||
    (base && path !== base && !path.startsWith(`${base}/`))
  ) {
    throw new ImmichError('DIRECTORY_FORBIDDEN');
  }

  return path;
}

async function folderAssets(config: PluginConfig, path: string): Promise<ImmichAsset[]> {
  if (!path) {
    return [];
  }

  return (await json<ImmichAsset[]>(config, `/view/folder?${new URLSearchParams({ path })}`))
    .filter(isMedia)
    .sort((a, b) => b.fileCreatedAt.localeCompare(a.fileCreatedAt) || a.id.localeCompare(b.id));
}

async function folders(config: PluginConfig, path: string): Promise<ImmichDirectory[]> {
  const paths = await json<string[]>(config, '/view/folder/unique-paths');
  const children = new Map<string, ImmichDirectory>();
  const prefix = path ? `${path}/` : '';

  for (const original of paths) {
    const candidate = normalize(original);

    if (candidate === path || (path && !candidate.startsWith(prefix))) {
      continue;
    }

    const relative = path ? candidate.slice(prefix.length) : candidate.replace(/^\//, '');
    const name = relative.split('/')[0];

    if (!name) {
      continue;
    }

    const id = path ? `${path}/${name}` : `${candidate.startsWith('/') ? '/' : ''}${name}`;

    children.set(id, { type: 'directory', id, name, count: null });
  }

  return [...children.values()].sort((a, b) => a.name.localeCompare(b.name));
}

async function search(config: PluginConfig, page: number, size: number, album?: string): Promise<ImmichSearchRes> {
  return json<ImmichSearchRes>(config, '/search/metadata', {
    page,
    size,
    withExif: true,
    withDeleted: false,
    order: 'desc',
    ...(album ? { albumIds: [album] } : {}),
  });
}

async function searchSlice(
  config: PluginConfig,
  offset: number,
  count: number,
  album?: string,
): Promise<{ images: ImmichMedia[]; hasMore: boolean }> {
  const size = 100;
  let page = Math.floor(offset / size) + 1;
  let skip = offset % size;
  const assets: ImmichAsset[] = [];
  let more = false;

  do {
    const result = await search(config, page, size, album);

    assets.push(...result.assets.items.slice(skip).filter(isMedia));
    more = Boolean(result.assets.nextPage ?? result.assets.nextCursor);
    skip = 0;
    page++;
  } while (assets.length <= count && more);

  return { images: assets.slice(0, count).map(media), hasMore: assets.length > count || more };
}

export async function list(params: ImmichListParams, config: PluginConfig): Promise<ImmichListRes> {
  params = params ?? {};
  connection(config);
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 48;

  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100 ||
    !Number.isSafeInteger(page * pageSize) ||
    (params.directory !== undefined && typeof params?.directory !== 'string') ||
    (params.mode !== undefined && params.mode !== 'folders' && params.mode !== 'albums')
  ) {
    throw new ImmichError('INVALID_LIST');
  }

  const sourceMode = directoryMode(config);
  const mode = params.mode ?? sourceMode;
  const directory = params.directory ?? (mode === 'folders' ? root(config) : '');
  const offset = (page - 1) * pageSize;

  if (mode === 'albums') {
    if (directory) {
      assetId(directory);
      const [album, result] = await Promise.all([
        json<ImmichAlbum>(config, `/albums/${assetId(directory)}`),
        searchSlice(config, offset, pageSize, directory),
      ]);

      return {
        items: result.images,
        hasMore: result.hasMore,
        page,
        directory,
        name: album.albumName,
        parent: '',
        mode,
      };
    }

    const albums = (await json<ImmichAlbum[]>(config, '/albums')).sort(
      (a, b) => a.albumName.localeCompare(b.albumName) || a.id.localeCompare(b.id),
    );
    const directories: ImmichDirectory[] = albums
      .slice(offset, offset + pageSize)
      .map((album) => ({ type: 'directory', id: album.id, name: album.albumName, count: album.assetCount }));
    const count = pageSize - directories.length;
    const result = count
      ? await searchSlice(config, Math.max(0, offset - albums.length), count)
      : { images: [], hasMore: true };

    return {
      items: [...directories, ...result.images],
      hasMore: offset + pageSize < albums.length || result.hasMore,
      page,
      directory: '',
      name: '相册',
      parent: null,
      mode,
    };
  }

  const path = folderPath(directory, config);
  const [directories, assets] = await Promise.all([folders(config, path), folderAssets(config, path)]);
  const items = [...directories, ...assets.map(media)];
  const separator = path.lastIndexOf('/');
  const parentPath = separator < 0 ? '' : path.slice(0, separator);

  return {
    items: items.slice(offset, offset + pageSize),
    hasMore: offset + pageSize < items.length,
    page,
    directory: path,
    name: path.split('/').pop() || '目录',
    parent: path === root(config) ? null : parentPath,
    mode,
  };
}

export async function detail(params: ImmichDetailParams, config: PluginConfig): Promise<ImmichDetailRes> {
  const asset = await json<ImmichAsset>(config, `/assets/${assetId(params?.id)}`);

  if (asset.type !== 'IMAGE' || asset.isTrashed) {
    throw new ImmichError('IMAGE_UNAVAILABLE');
  }

  return {
    ...media(asset),
    originalPath: asset.originalPath,
    mimeType: asset.originalMimeType ?? null,
    isFavorite: asset.isFavorite,
    exif: asset.exifInfo ?? {},
  };
}

export async function preview(params: ImmichPreviewParams, config: PluginConfig): Promise<ImmichPreviewRes> {
  if (
    typeof params?.directory !== 'string' ||
    !params.directory ||
    (params.mode !== 'folders' && params.mode !== 'albums')
  ) {
    throw new ImmichError('INVALID_PREVIEW');
  }

  if (params.mode === 'albums') {
    assetId(params.directory);

    return { images: (await searchSlice(config, 0, 3, params.directory)).images };
  }

  const path = folderPath(params.directory, config);
  const direct = await folderAssets(config, path);

  if (direct.length >= 3) {
    return { images: direct.slice(0, 3).map(media) };
  }

  // 父目录自身没有照片时，使用子目录中的照片作为预览。
  const paths = await json<string[]>(config, '/view/folder/unique-paths');

  for (const child of paths.filter((entry) => entry.startsWith(`${path}/`)).sort()) {
    direct.push(...(await folderAssets(config, child)));
    if (direct.length >= 3) {
      break;
    }
  }

  return { images: direct.slice(0, 3).map(media) };
}

export async function thumbnail(params: ImmichThumbnailParams, config: PluginConfig): Promise<ImmichThumbnailRes> {
  const size = params?.size ?? 'thumbnail';

  if (!['thumbnail', 'preview'].includes(size)) {
    throw new ImmichError('INVALID_SIZE');
  }

  const response = await request(config, `/assets/${assetId(params?.id)}/thumbnail?size=${size}`);
  const mime = response.headers.get('Content-Type')?.split(';')[0];

  if (!mime || !['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'].includes(mime)) {
    throw new ImmichError('INVALID_IMAGE_RESPONSE');
  }

  return { dataUrl: `data:${mime};base64,${Buffer.from(await response.arrayBuffer()).toString('base64')}` };
}

export async function video(
  params: ImmichVideoParams,
  config: PluginConfig,
  context: ImmichVideoContext,
): Promise<Response> {
  const id = assetId(params?.id);

  if (context.range && !/^bytes=(?:\d+-\d*|-\d+)$/.test(context.range)) {
    throw new ImmichError('INVALID_RANGE');
  }

  const response = await request(config, `/assets/${id}/video/playback`, undefined, { ...context, stream: true });

  if (response.status === 416) {
    return response;
  }

  const mime = response.headers.get('Content-Type')?.split(';')[0];

  if (
    (response.status !== 200 && response.status !== 206) ||
    !mime ||
    (!mime.startsWith('video/') && mime !== 'application/octet-stream')
  ) {
    await response.body?.cancel();

    throw new ImmichError('INVALID_VIDEO_RESPONSE');
  }

  return response;
}

const service = { list, detail, preview, thumbnail, video };

export default service;
