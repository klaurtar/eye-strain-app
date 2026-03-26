import { create } from 'zustand';
import type { Session, ActivityType } from '../types';
import { getSessions, saveSessions } from '../utils/storage';
import { generateId, getTimestamp, getTodayDateString } from '../utils/helpers';

interface SessionStore {
  sessions: Session[];
  loaded: boolean;
  load: () => Promise<void>;
  startSession: (activityType: ActivityType) => Session;
  endSession: (sessionId: string) => void;
  incrementBreaks: (sessionId: string) => void;
  incrementSkippedBreaks: (sessionId: string) => void;
  getTodaySessions: () => Session[];
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],
  loaded: false,

  load: async () => {
    const sessions = await getSessions();
    set({ sessions, loaded: true });
  },

  startSession: (activityType: ActivityType) => {
    const session: Session = {
      id: generateId(),
      startTime: getTimestamp(),
      endTime: null,
      activityType,
      breakCount: 0,
      skippedBreakCount: 0,
      sessionType: 'focus',
    };
    const sessions = [...get().sessions, session];
    set({ sessions });
    saveSessions(sessions);
    return session;
  },

  endSession: (sessionId: string) => {
    const sessions = get().sessions.map((s) =>
      s.id === sessionId ? { ...s, endTime: getTimestamp() } : s
    );
    set({ sessions });
    saveSessions(sessions);
  },

  incrementBreaks: (sessionId: string) => {
    const sessions = get().sessions.map((s) =>
      s.id === sessionId ? { ...s, breakCount: s.breakCount + 1 } : s
    );
    set({ sessions });
    saveSessions(sessions);
  },

  incrementSkippedBreaks: (sessionId: string) => {
    const sessions = get().sessions.map((s) =>
      s.id === sessionId ? { ...s, skippedBreakCount: s.skippedBreakCount + 1 } : s
    );
    set({ sessions });
    saveSessions(sessions);
  },

  getTodaySessions: () => {
    const today = getTodayDateString();
    const startOfDay = new Date(today).getTime() / 1000;
    const endOfDay = startOfDay + 86400;
    return get().sessions.filter(
      (s) => s.startTime >= startOfDay && s.startTime < endOfDay
    );
  },
}));
