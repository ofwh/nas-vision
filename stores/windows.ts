import { create } from 'zustand';

type WindowEntry = {
  id: string;
  type: 'url' | 'plugin' | 'settings';
  close: () => void;
  minimize?: () => void;
};

type WindowsStore = {
  windows: WindowEntry[];
  register: (entry: WindowEntry) => void;
  unregister: (id: string) => void;
  close: (id: string) => void;
  minimize: (id: string) => void;
  closeAll: () => void;
};

export const useWindowsStore = create<WindowsStore>((set, get) => ({
  windows: [],
  register: (entry) =>
    set((state) => ({ windows: [...state.windows.filter((current) => current.id !== entry.id), entry] })),
  unregister: (id) => set((state) => ({ windows: state.windows.filter((entry) => entry.id !== id) })),
  close: (id) => {
    const entry = get().windows.find((current) => current.id === id);

    if (!entry) {
      return;
    }

    get().unregister(id);
    entry.close();
  },
  minimize: (id) =>
    get()
      .windows.find((entry) => entry.id === id)
      ?.minimize?.(),
  closeAll: () => {
    const windows = get().windows;

    set({ windows: [] });
    windows.forEach((entry) => entry.close());
  },
}));
