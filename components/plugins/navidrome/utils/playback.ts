import type { MusicItem } from '../types';

export function songKeys(songs: MusicItem[]): string[] {
  const occurrences = new Map<string, number>();

  return songs.map((song) => {
    const occurrence = occurrences.get(song.id) ?? 0;

    occurrences.set(song.id, occurrence + 1);

    return JSON.stringify([song.id, occurrence]);
  });
}
