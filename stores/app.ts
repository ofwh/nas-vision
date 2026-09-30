import { create } from 'zustand';

type AppStore = {
  /** 玻璃观感的统一开关：true 走压暗的 veil，false 走默认玻璃。 */
  veil: boolean;
  setVeil: (veil: boolean) => void;
};

export const useApp = create<AppStore>((set) => ({
  veil: false,
  setVeil: (veil) => set({ veil }),
}));
