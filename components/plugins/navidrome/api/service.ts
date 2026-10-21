import type { PluginConfig } from '@/types/plugins';
import type {
  MusicItem,
  NavidromeListParams,
  NavidromeListRes,
  NavidromeMediaParams,
  NavidromeStarParams,
  NavidromePlaylistSaveParams,
  NavidromePlaylistRemoveParams,
  SubsonicEntry,
} from '../types';
import { json, request } from './client';
import { NavidromeError } from './errors';

const limit = 48;

function validId(id: string): void {
  if (typeof id !== 'string' || !id.trim() || id.length > 512) {
    throw new NavidromeError('PARAMS_INVALID');
  }
}

function items(entries: SubsonicEntry[] | undefined, kind: MusicItem['kind']): MusicItem[] {
  if (entries !== undefined && !Array.isArray(entries)) {
    throw new NavidromeError('INVALID_RESPONSE');
  }

  return (entries ?? []).map((item) => ({
    id: item.id,
    name: item.title ?? item.name ?? '',
    artist: item.artist,
    album: item.album,
    coverArt: item.coverArt,
    duration: item.duration,
    songCount: item.songCount,
    albumCount: item.albumCount,
    starred: item.starred,
    description: item.comment,
    public: item.public,
    kind,
  }));
}

export async function list(params: NavidromeListParams, config: PluginConfig): Promise<NavidromeListRes> {
  if (!params || !['recent', 'albums', 'artists', 'songs', 'starred', 'playlists', 'search'].includes(params.section)) {
    throw new NavidromeError('PARAMS_INVALID');
  }

  const offset = params.offset ?? 0;

  if (
    !Number.isInteger(offset) ||
    offset < 0 ||
    offset > 100000 ||
    (params.query !== undefined && (typeof params.query !== 'string' || params.query.length > 256))
  ) {
    throw new NavidromeError('PARAMS_INVALID');
  }

  if (params.id !== undefined) {
    validId(params.id);
    if (!['album', 'artist', 'playlist'].includes(params.kind ?? '')) {
      throw new NavidromeError('PARAMS_INVALID');
    }

    const method = params.kind === 'album' ? 'getAlbum' : params.kind === 'artist' ? 'getArtist' : 'getPlaylist';
    const data = await json(config, method, { id: params.id });
    const detail = params.kind === 'album' ? data.album : params.kind === 'artist' ? data.artist : data.playlist;

    if (!detail) {
      throw new NavidromeError('INVALID_RESPONSE');
    }

    return {
      items: params.kind === 'artist' ? items(data.artist?.album, 'album') : items(detail.song ?? detail.entry, 'song'),
      hasMore: false,
      title: detail.name,
    };
  }

  if (params.section === 'playlists') {
    const data = await json(config, 'getPlaylists');

    return { items: items(data.playlists?.playlist, 'playlist'), hasMore: false };
  }

  if (params.section === 'artists') {
    const data = await json(config, 'getArtists');

    return {
      items: items(
        data.artists?.index?.flatMap((index) => index.artist ?? []),
        'artist',
      ),
      hasMore: false,
    };
  }

  if (params.section === 'starred') {
    const data = await json(config, 'getStarred2');

    return { items: items(data.starred2?.song, 'song'), hasMore: false };
  }

  if (params.section === 'search' || params.section === 'songs') {
    const query = params.section === 'songs' ? '' : params.query?.trim();

    if (params.section === 'search' && !query) {
      return { items: [], hasMore: false };
    }

    const data = await json(config, 'search3', {
      query: query ?? '',
      songCount: String(limit),
      songOffset: String(offset),
      albumCount: params.section === 'songs' ? '0' : String(limit),
      albumOffset: String(offset),
      artistCount: params.section === 'songs' ? '0' : String(limit),
      artistOffset: String(offset),
    });
    const result = data.searchResult3;
    const found = [
      ...items(result?.artist, 'artist'),
      ...items(result?.album, 'album'),
      ...items(result?.song, 'song'),
    ];

    return {
      items: found,
      hasMore: [result?.artist, result?.album, result?.song].some((group) => group?.length === limit),
    };
  }

  const data = await json(config, 'getAlbumList2', {
    type: params.section === 'recent' ? 'newest' : 'alphabeticalByName',
    size: String(limit),
    offset: String(offset),
  });
  const found = items(data.albumList2?.album, 'album');

  return { items: found, hasMore: found.length === limit };
}

export async function star(params: NavidromeStarParams, config: PluginConfig): Promise<{ starred: boolean }> {
  if (!params || typeof params.starred !== 'boolean') {
    throw new NavidromeError('PARAMS_INVALID');
  }

  validId(params.id);
  await json(config, params.starred ? 'star' : 'unstar', { id: params.id });

  return { starred: params.starred };
}

export async function save(params: NavidromePlaylistSaveParams, config: PluginConfig): Promise<MusicItem> {
  if (!params || typeof params.name !== 'string' || !params.name.trim() || params.name.trim().length > 200) {
    throw new NavidromeError('PLAYLIST_NAME_INVALID');
  }

  const name = params.name.trim();

  if (
    params.description !== undefined &&
    (typeof params.description !== 'string' || params.description.length > 2000)
  ) {
    throw new NavidromeError('PLAYLIST_DESCRIPTION_INVALID');
  }

  if (params.public !== undefined && typeof params.public !== 'boolean') {
    throw new NavidromeError('PLAYLIST_VISIBILITY_INVALID');
  }

  const details = {
    ...(params.description !== undefined ? { comment: params.description.trim() } : {}),
    ...(params.public !== undefined ? { public: String(params.public) } : {}),
  };

  if (params.id !== undefined) {
    validId(params.id);
    await json(config, 'updatePlaylist', { playlistId: params.id, name, ...details });

    return { id: params.id, name, description: params.description?.trim(), public: params.public, kind: 'playlist' };
  }

  const data = await json(config, 'createPlaylist', { name });
  const playlist = data.playlist;

  if (!playlist || typeof playlist.id !== 'string' || !playlist.id) {
    throw new NavidromeError('INVALID_RESPONSE');
  }

  if (Object.keys(details).length) {
    await json(config, 'updatePlaylist', { playlistId: playlist.id, ...details });
  }

  return {
    ...items([playlist], 'playlist')[0],
    ...(params.description !== undefined ? { description: params.description.trim() } : {}),
    ...(params.public !== undefined ? { public: params.public } : {}),
  };
}

export async function remove(params: NavidromePlaylistRemoveParams, config: PluginConfig): Promise<{ id: string }> {
  if (!params) {
    throw new NavidromeError('PARAMS_INVALID');
  }

  validId(params.id);
  await json(config, 'deletePlaylist', { id: params.id });

  return { id: params.id };
}

export async function media(
  params: NavidromeMediaParams,
  config: PluginConfig,
  kind: 'cover' | 'stream',
  options: { range: string | null; signal: AbortSignal },
): Promise<Response> {
  validId(params.id);
  if (options.range && !/^bytes=(?:\d+-\d*|-\d+)$/.test(options.range)) {
    throw new NavidromeError('PARAMS_INVALID');
  }

  const response = await request(
    config,
    kind === 'cover' ? 'getCoverArt' : 'stream',
    { id: params.id, ...(kind === 'cover' ? { size: '480' } : { format: 'raw' }) },
    { ...options, media: true },
  );
  const type = response.headers.get('content-type')?.split(';')[0] ?? '';

  if (
    response.status !== 416 &&
    !(kind === 'cover'
      ? ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(type)
      : type.startsWith('audio/') || type === 'application/octet-stream')
  ) {
    await response.body?.cancel();

    throw new NavidromeError('INVALID_RESPONSE');
  }

  return response;
}

const service = { list, star, save, remove, media };

export default service;
