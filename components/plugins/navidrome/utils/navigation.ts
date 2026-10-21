import type { MusicItem } from '../types';

export const librarySections = ['starred', 'recent', 'songs', 'artists', 'albums', 'playlists'] as const;
export type LibrarySection = (typeof librarySections)[number];

export function parsePath(path: string): { section: LibrarySection; id?: string; kind?: MusicItem['kind'] } {
  const [, section, kind, id] = path.split('/');
  const selected = librarySections.find((item) => item === section) ?? 'recent';

  try {
    return {
      section: selected,
      ...(id && (kind === 'artist' || kind === 'album' || kind === 'playlist')
        ? { kind, id: decodeURIComponent(id) }
        : {}),
    };
  } catch {
    return { section: selected };
  }
}
