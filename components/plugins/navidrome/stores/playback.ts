import { createStore } from 'zustand';
import type { MusicItem, PlaybackMode } from '../types';
import { songKeys } from '../utils/playback';

type PlaybackState = {
  queue: MusicItem[];
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
  error: 'notStarted' | 'playFailed' | 'loadFailed' | null;
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
  if (!state.queue[index]) {
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
    remaining: state.remaining.filter((position) => position !== index),
    history:
      state.mode === 'shuffle' && state.index >= 0 && state.index !== index
        ? [...state.history, state.index].slice(-Math.max(1, state.queue.length))
        : state.history,
  };
}

function nextSong(state: PlaybackState): PlaybackState {
  if (!state.queue.length) {
    return state;
  }

  if (state.mode !== 'shuffle' || state.queue.length === 1) {
    return selectSong(state, (state.index + 1) % state.queue.length);
  }

  const candidates = state.remaining.length
    ? state.remaining
    : state.queue.map((_, index) => index).filter((index) => index !== state.index);

  return selectSong({ ...state, remaining: candidates }, candidates[Math.floor(Math.random() * candidates.length)]);
}

export function createPlaybackStore() {
  return createStore<PlaybackStore>((set, get) => {
    let audio: HTMLAudioElement | null = null;
    let command = 0;
    let releaseAudio: (() => void) | undefined;

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
        .catch(() => {
          if (audio === element && command === request && get().playback === playback) {
            set({ playing: false, error: restart ? 'notStarted' : 'playFailed' });
          }
        });
    }

    return {
      queue: [],
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

          const index = selectedIndex ?? (current.mode === 'shuffle' ? Math.floor(Math.random() * songs.length) : 0);

          if (!songs[index]) {
            return current;
          }

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

          if (current.mode === 'shuffle') {
            const index = current.history.at(-1);

            if (index === undefined) {
              return nextSong(current);
            }

            return {
              ...selectSong(current, index),
              history: current.history.slice(0, -1),
              remaining: [current.index, ...current.remaining].filter(
                (position, i, positions) => position !== index && positions.indexOf(position) === i,
              ),
            };
          }

          return selectSong(current, (current.index - 1 + current.queue.length) % current.queue.length);
        });
      },
      changeMode: () => {
        set((current) => ({
          ...current,
          mode: current.mode === 'sequential' ? 'shuffle' : current.mode === 'shuffle' ? 'repeatOne' : 'sequential',
          remaining: current.queue.map((_, index) => index).filter((index) => index !== current.index),
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
        listen('error', () => set({ playing: false, error: 'loadFailed' }));
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
