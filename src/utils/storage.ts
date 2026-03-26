import { load } from '@tauri-apps/plugin-store';
import type { Session, SymptomEntry, DailyStats, AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

let storeInstance: Awaited<ReturnType<typeof load>> | null = null;

async function getStore() {
  if (!storeInstance) {
    storeInstance = await load('eye-relief-data.json', {
      defaults: {},
      autoSave: true,
    });
  }
  return storeInstance;
}

// Sessions
export async function getSessions(): Promise<Session[]> {
  try {
    const store = await getStore();
    return (await store.get<Session[]>('sessions')) ?? [];
  } catch {
    return JSON.parse(localStorage.getItem('sessions') ?? '[]');
  }
}

export async function saveSessions(sessions: Session[]): Promise<void> {
  try {
    const store = await getStore();
    await store.set('sessions', sessions);
  } catch {
    localStorage.setItem('sessions', JSON.stringify(sessions));
  }
}

// Symptoms
export async function getSymptoms(): Promise<SymptomEntry[]> {
  try {
    const store = await getStore();
    return (await store.get<SymptomEntry[]>('symptoms')) ?? [];
  } catch {
    return JSON.parse(localStorage.getItem('symptoms') ?? '[]');
  }
}

export async function saveSymptoms(symptoms: SymptomEntry[]): Promise<void> {
  try {
    const store = await getStore();
    await store.set('symptoms', symptoms);
  } catch {
    localStorage.setItem('symptoms', JSON.stringify(symptoms));
  }
}

// Daily Stats
export async function getDailyStats(): Promise<DailyStats[]> {
  try {
    const store = await getStore();
    return (await store.get<DailyStats[]>('dailyStats')) ?? [];
  } catch {
    return JSON.parse(localStorage.getItem('dailyStats') ?? '[]');
  }
}

export async function saveDailyStats(stats: DailyStats[]): Promise<void> {
  try {
    const store = await getStore();
    await store.set('dailyStats', stats);
  } catch {
    localStorage.setItem('dailyStats', JSON.stringify(stats));
  }
}

// Settings
export async function getSettings(): Promise<AppSettings> {
  try {
    const store = await getStore();
    return (await store.get<AppSettings>('settings')) ?? DEFAULT_SETTINGS;
  } catch {
    const stored = localStorage.getItem('settings');
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    const store = await getStore();
    await store.set('settings', settings);
  } catch {
    localStorage.setItem('settings', JSON.stringify(settings));
  }
}
