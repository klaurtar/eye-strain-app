import { create } from 'zustand';
import type { ActivityType, TimerMode } from '../types';
import { notifyFocusEnd } from '../utils/notifications';

interface TimerStore {
  timeRemaining: number;
  totalDuration: number;
  mode: TimerMode;
  isRunning: boolean;
  activity: ActivityType | null;
  sessionCount: number;
  currentSessionId: string | null;
  // Track when the timer was last ticked so we can recover elapsed time
  lastTickAt: number | null;
  // Pending break info (set when focus ends, consumed by TimerScreen to navigate)
  pendingBreak: {
    mode: 'short_break' | 'long_break';
    duration: number;
    sessionId: string | null;
  } | null;

  start: (timeSeconds: number, activity: ActivityType, sessionId: string) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  tick: () => void;
  onFocusEnd: (settings: { sessionsBeforeLongBreak: number; longBreakMinutes: number; shortBreakSeconds: number; focusDurationMinutes: number }) => void;
  onBreakReturn: (focusDurationSeconds: number) => void;
  clearPendingBreak: () => void;
  setSessionId: (id: string) => void;
}

let tickInterval: number | null = null;

function startTicking(tick: () => void) {
  stopTicking();
  tickInterval = window.setInterval(tick, 1000);
}

function stopTicking() {
  if (tickInterval !== null) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  timeRemaining: 0,
  totalDuration: 0,
  mode: 'idle',
  isRunning: false,
  activity: null,
  sessionCount: 0,
  currentSessionId: null,
  lastTickAt: null,
  pendingBreak: null,

  start: (timeSeconds, activity, sessionId) => {
    set({
      timeRemaining: timeSeconds,
      totalDuration: timeSeconds,
      mode: 'focus',
      isRunning: true,
      activity,
      currentSessionId: sessionId,
      lastTickAt: Date.now(),
      pendingBreak: null,
    });
    startTicking(get().tick);
  },

  pause: () => {
    stopTicking();
    set({ isRunning: false, lastTickAt: null });
  },

  resume: () => {
    set({ isRunning: true, lastTickAt: Date.now() });
    startTicking(get().tick);
  },

  reset: () => {
    stopTicking();
    set({
      timeRemaining: 0,
      totalDuration: 0,
      mode: 'idle',
      isRunning: false,
      activity: null,
      sessionCount: 0,
      currentSessionId: null,
      lastTickAt: null,
      pendingBreak: null,
    });
  },

  tick: () => {
    const state = get();
    if (!state.isRunning || state.timeRemaining <= 0) return;

    // Calculate actual elapsed time to handle background/tab switches
    const now = Date.now();
    const elapsed = state.lastTickAt ? Math.floor((now - state.lastTickAt) / 1000) : 1;
    const newTime = Math.max(0, state.timeRemaining - elapsed);

    set({ timeRemaining: newTime, lastTickAt: now });

    if (newTime <= 0) {
      stopTicking();
      set({ isRunning: false, lastTickAt: null });
    }
  },

  onFocusEnd: (settings) => {
    const newCount = get().sessionCount + 1;
    const isLongBreak = newCount % settings.sessionsBeforeLongBreak === 0;

    notifyFocusEnd();

    set({
      sessionCount: newCount,
      pendingBreak: {
        mode: isLongBreak ? 'long_break' : 'short_break',
        duration: isLongBreak ? settings.longBreakMinutes * 60 : settings.shortBreakSeconds,
        sessionId: get().currentSessionId,
      },
    });
  },

  onBreakReturn: (focusDurationSeconds) => {
    set({
      timeRemaining: focusDurationSeconds,
      totalDuration: focusDurationSeconds,
      mode: 'focus',
      isRunning: true,
      lastTickAt: Date.now(),
      pendingBreak: null,
    });
    startTicking(get().tick);
  },

  clearPendingBreak: () => set({ pendingBreak: null }),

  setSessionId: (id) => set({ currentSessionId: id }),
}));
