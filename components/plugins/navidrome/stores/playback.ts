import { createStore } from 'zustand';
import type { MusicItem, PlaybackMode } from '../types';
import { songKeys } from '../utils/playback';

type PlaybackState = {
  queue: MusicItem[];
  unavailable: ReadonlySet<string>;
  source: string | null;
  index: number;
  playback: number;
  mode: PlaybackMode;
  remaining: number[];
  history: number[];
  playing: boolean;
  time: number;
  duration: number;
  volume: number;
  muted: boolean;
  error: 'notStarted' | 'playFailed' | 'loadFailed' | 'allUnavailable' | null;
};

type PlaybackStore = PlaybackState & {
  play: (songs: MusicItem[], source: string, index?: number) => void;
  next: () => void;
  previous: () => void;
  changeMode: () => void;
  updateSong: (id: string, starred: string | undefined) => void;
  attachAudio: (element: HTMLAudioElement, src: string | undefined, playback: number) => () => void;
  toggle: () => void;
  seek: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
};

function selectSong(state: PlaybackState, index: number): PlaybackState {
  if (!state.queue[index] || state.unavailable.has(state.queue[index].id)) {
    return state;
  }

  return {
    ...state,
    index,
    playback: state.playback + 1,
    playing: false,
    time: 0,
    duration: state.queue[index].duration ?? 0,
    error: null,
    remaining: state.mode === 'shuffle' ? state.remaining.filter((position) => position !== index) : [],
    history:
      state.mode === 'shuffle' &&
      state.index >= 0 &&
      state.index !== index &&
      !state.unavailable.has(state.queue[state.index].id)
        ? [...state.history, state.index].slice(-Math.max(1, state.queue.length))
        : state.history,
  };
}

function playableIndices(state: PlaybackState): number[] {
  return state.queue.flatMap((song, index) => (state.unavailable.has(song.id) ? [] : [index]));
}

function stopPlayback(state: PlaybackState): PlaybackState {
  return {
    ...state,
    index: -1,
    playback: state.playback + (state.index === -1 ? 0 : 1),
    remaining: [],
    history: [],
    playing: false,
    time: 0,
    duration: 0,
    error: 'allUnavailable',
  };
}

function adjacentSong(state: PlaybackState, direction: 1 | -1): PlaybackState {
  for (let step = 1; step <= state.queue.length; step += 1) {
    const index = (((state.index + direction * step) % state.queue.length) + state.queue.length) % state.queue.length;

    if (!state.unavailable.has(state.queue[index].id)) {
      return selectSong(state, index);
    }
  }

  return stopPlayback(state);
}

function nextSong(state: PlaybackState): PlaybackState {
  if (!state.queue.length) {
    return state;
  }

  if (state.mode !== 'shuffle') {
    return adjacentSong(state, 1);
  }

  const available = playableIndices(state);

  if (!available.length) {
    return stopPlayback(state);
  }

  const availableSet = new Set(available);
  const remaining = state.remaining.filter((index) => availableSet.has(index));
  const candidates = remaining.length
    ? remaining
    : available.filter((index) => available.length === 1 || index !== state.index);

  return selectSong({ ...state, remaining: candidates }, candidates[Math.floor(Math.random() * candidates.length)]);
}

export function createPlaybackStore() {
  return createStore<PlaybackStore>((set, get) => {
    let audio: HTMLAudioElement | null = null;
    let command = 0;
    let releaseAudio: (() => void) | undefined;

    function failCurrentSong() {
      command += 1;
      set((current) => {
        const song = current.queue[current.index];

        if (!song || current.unavailable.has(song.id)) {
          return current;
        }

        return nextSong({ ...current, unavailable: new Set([...current.unavailable, song.id]) });
      });
    }

    function playAudio(restart: boolean) {
      const element = audio;
      const playback = get().playback;
      const request = ++command;

      if (!element || !get().queue[get().index]) {
        return;
      }

      if (element.error) {
        element.load();
      }

      if (restart) {
        element.currentTime = 0;
        set({ time: 0 });
      }

      set({ error: null });
      void element
        .play()
        .then(() => {
          if (audio === element && command === request && get().playback === playback) {
            set({ playing: !element.paused, error: null });
            get().setDuration(element.duration);
          }
        })
        .catch((cause: unknown) => {
          if (audio !== element || command !== request || get().playback !== playback) {
            return;
          }

          if (cause instanceof DOMException && cause.name === 'AbortError') {
            return;
          }

          if (cause instanceof DOMException && cause.name === 'NotAllowedError') {
            set({ playing: false, error: 'notStarted' });

            return;
          }

          failCurrentSong();
        });
    }

    return {
      queue: [],
      unavailable: new Set<string>(),
      source: null,
      index: 0,
      playback: 0,
      mode: 'sequential',
      remaining: [],
      history: [],
      playing: false,
      time: 0,
      duration: 0,
      volume: 0.8,
      muted: false,
      error: null,
      play: (songs, source, selectedIndex) => {
        set((current) => {
          if (!songs.length) {
            return current;
          }

          if (selectedIndex !== undefined && !songs[selectedIndex]) {
            return current;
          }

          const available = songs.flatMap((song, index) => (current.unavailable.has(song.id) ? [] : [index]));

          if (!available.length) {
            return stopPlayback({ ...current, queue: songs, source });
          }

          const index =
            selectedIndex === undefined
              ? available[current.mode === 'shuffle' ? Math.floor(Math.random() * available.length) : 0]
              : (available.find((index) => index >= selectedIndex) ?? available[0]);

          const keys = songKeys(songs);
          const previousKeys = songKeys(current.queue);
          const positions = new Map(keys.map((key, position) => [key, position]));
          const sameSource = current.source === source;

          if (sameSource && keys.length === previousKeys.length && keys.every((key, i) => key === previousKeys[i])) {
            return selectSong(current, index);
          }

          const previousSet = new Set(previousKeys);
          const remap = (indices: number[]) =>
            indices.flatMap((position) => {
              const mapped = positions.get(previousKeys[position]);

              return mapped === undefined ? [] : [mapped];
            });

          return selectSong(
            {
              ...current,
              queue: songs,
              source,
              index: sameSource ? (positions.get(previousKeys[current.index]) ?? -1) : -1,
              remaining: sameSource
                ? [
                    ...remap(current.remaining),
                    ...keys.flatMap((key, position) => (previousSet.has(key) ? [] : [position])),
                  ]
                : songs.map((_, position) => position),
              history: sameSource ? remap(current.history) : [],
            },
            index,
          );
        });
      },
      next: () => set(nextSong),
      previous: () => {
        set((current) => {
          if (!current.queue.length) {
            return current;
          }

          if (current.mode !== 'shuffle') {
            return adjacentSong(current, -1);
          }

          const available = playableIndices(current);

          if (!available.length) {
            return stopPlayback(current);
          }

          const availableSet = new Set(available);
          const history = current.history.filter((index) => availableSet.has(index));
          const index = history.at(-1);

          if (index === undefined) {
            return nextSong(current);
          }

          return {
            ...selectSong(current, index),
            history: history.slice(0, -1),
            remaining: [...new Set([current.index, ...current.remaining])].filter(
              (position) => position !== index && availableSet.has(position),
            ),
          };
        });
      },
      changeMode: () => {
        set((current) => ({
          ...current,
          mode: current.mode === 'sequential' ? 'shuffle' : current.mode === 'shuffle' ? 'repeatOne' : 'sequential',
          remaining: playableIndices(current).filter((index) => index !== current.index),
          history: [],
        }));
      },
      updateSong: (id, starred) => {
        set((current) => ({
          ...current,
          queue: current.queue.map((song) => (song.id === id ? { ...song, starred } : song)),
        }));
      },
      attachAudio: (element, src, playback) => {
        releaseAudio?.();
        audio = element;
        element.volume = get().volume;
        element.muted = get().muted;
        const events = new AbortController();
        const listen = (name: keyof HTMLMediaElementEventMap, handler: () => void) => {
          element.addEventListener(
            name,
            () => {
              if (audio === element && get().playback === playback) {
                handler();
              }
            },
            { signal: events.signal },
          );
        };

        listen('playing', () => set({ playing: true, error: null }));
        listen('pause', () => set({ playing: false }));
        listen('timeupdate', () => set({ time: element.currentTime }));
        listen('loadedmetadata', () => get().setDuration(element.duration));
        listen('durationchange', () => get().setDuration(element.duration));
        listen('error', () => {
          if (element.error?.code !== MediaError.MEDIA_ERR_ABORTED) {
            failCurrentSong();
          }
        });
        listen('ended', () => {
          if (get().mode === 'repeatOne') {
            playAudio(true);
          } else {
            get().next();
          }
        });

        const release = () => {
          events.abort();
          if (audio !== element) {
            return;
          }

          command += 1;
          audio = null;
          releaseAudio = undefined;
          element.pause();
          element.removeAttribute('src');
          element.load();
          set({ playing: false });
        };

        releaseAudio = release;
        if (src) {
          element.src = src;
          playAudio(true);
        }

        return release;
      },
      toggle: () => {
        if (!audio || !get().queue[get().index]) {
          return;
        }

        if (get().unavailable.has(get().queue[get().index].id)) {
          get().next();

          return;
        }

        if (audio.paused) {
          playAudio(false);
        } else {
          command += 1;
          audio.pause();
        }
      },
      seek: (time) => {
        if (audio) {
          // 避免 FLAC 在文件结束位置触发解码失败。
          const target = Math.max(0, Math.min(time, get().duration - 0.01));

          audio.currentTime = target;
          set({ time: target });
        }
      },
      setDuration: (duration) => set({ duration: Number.isFinite(duration) ? Math.max(0, duration) : 0 }),
      setVolume: (value) => {
        const volume = Math.max(0, Math.min(1, value));

        set({ volume, muted: false });
        if (audio) {
          audio.volume = volume;
          audio.muted = false;
        }
      },
      toggleMute: () => {
        const current = get();
        const muted = !(current.muted || current.volume === 0);
        const volume = !muted && current.volume === 0 ? 0.8 : current.volume;

        set({ muted, volume });
        if (audio) {
          audio.muted = muted;
          audio.volume = volume;
        }
      },
    };
  });
}
