export type MusicItem = {
  id: string;
  name: string;
  artist?: string;
  album?: string;
  coverArt?: string;
  duration?: number;
  songCount?: number;
  albumCount?: number;
  starred?: string;
  description?: string;
  public?: boolean;
  kind: 'album' | 'artist' | 'playlist' | 'song';
};
export type PlaybackMode = 'sequential' | 'shuffle' | 'repeatOne';
export type Section = 'recent' | 'albums' | 'artists' | 'songs' | 'starred' | 'playlists' | 'search';
export type NavidromeListParams = {
  section: Section;
  id?: string;
  kind?: MusicItem['kind'];
  query?: string;
  offset?: number;
};
export type NavidromeListRes = { items: MusicItem[]; hasMore: boolean; title?: string };
export type NavidromeMediaParams = { id: string };
export type NavidromeStarParams = { id: string; starred: boolean };
export type NavidromePlaylistSaveParams = { id?: string; name: string; description?: string; public?: boolean };
export type NavidromePlaylistRemoveParams = { id: string };
export type NavidromePlaylistSongParams = { id: string; songId: string };
export type SubsonicEntry = Omit<MusicItem, 'kind' | 'name' | 'description'> & {
  name?: string;
  title?: string;
  song?: SubsonicEntry[];
  entry?: SubsonicEntry[];
  album?: string;
  comment?: string;
};
export type SubsonicResponse = {
  status: 'ok' | 'failed';
  error?: { code: number; message: string };
  albumList2?: { album?: SubsonicEntry[] };
  artists?: { index?: { artist?: SubsonicEntry[] }[] };
  artist?: Omit<SubsonicEntry, 'album'> & { album?: SubsonicEntry[] };
  album?: SubsonicEntry;
  playlists?: { playlist?: SubsonicEntry[] };
  playlist?: SubsonicEntry;
  searchResult3?: { album?: SubsonicEntry[]; artist?: SubsonicEntry[]; song?: SubsonicEntry[] };
  starred2?: { song?: SubsonicEntry[] };
};
