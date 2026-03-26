import { create } from 'zustand';
import type { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { getSettings, saveSettings } from '../utils/storage';

interface SettingsStore {
  settings: AppSettings;
  loaded: boolean;
  load: () => Promise<void>;
  update: (partial: Partial<AppSettings>) => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,

  load: async () => {
    const settings = await getSettings();
    set({ settings, loaded: true });
  },

  update: (partial) => {
    const settings = { ...get().settings, ...partial };
    set({ settings });
    saveSettings(settings);
  },
}));
