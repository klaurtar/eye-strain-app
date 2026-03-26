import { create } from 'zustand';
import type { SymptomEntry } from '../types';
import { getSymptoms, saveSymptoms } from '../utils/storage';
import { generateId, getTimestamp, getTodayDateString } from '../utils/helpers';

interface SymptomStore {
  symptoms: SymptomEntry[];
  loaded: boolean;
  load: () => Promise<void>;
  addSymptom: (entry: Omit<SymptomEntry, 'id' | 'timestamp'>) => void;
  getTodaySymptoms: () => SymptomEntry[];
  getTodayCheckInCount: () => number;
}

export const useSymptomStore = create<SymptomStore>((set, get) => ({
  symptoms: [],
  loaded: false,

  load: async () => {
    const symptoms = await getSymptoms();
    set({ symptoms, loaded: true });
  },

  addSymptom: (entry) => {
    const symptom: SymptomEntry = {
      ...entry,
      id: generateId(),
      timestamp: getTimestamp(),
    };
    const symptoms = [...get().symptoms, symptom];
    set({ symptoms });
    saveSymptoms(symptoms);
  },

  getTodaySymptoms: () => {
    const today = getTodayDateString();
    const startOfDay = new Date(today).getTime() / 1000;
    const endOfDay = startOfDay + 86400;
    return get().symptoms.filter(
      (s) => s.timestamp >= startOfDay && s.timestamp < endOfDay
    );
  },

  getTodayCheckInCount: () => {
    return get().getTodaySymptoms().length;
  },
}));
