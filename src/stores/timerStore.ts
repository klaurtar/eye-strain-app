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
  // Absolute timestamp (ms) when the timer should reach zero
  endTime: number | null;
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
  // Tick every 250ms for smooth countdown (updates display ~4x/sec)
  tickInterval = window.setInterval(tick, 250);
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
  endTime: null,
  pendingBreak: null,

  start: (timeSeconds, activity, sessionId) => {
    set({
      timeRemaining: timeSeconds,
      totalDuration: timeSeconds,
      mode: 'focus',
      isRunning: true,
      activity,
      currentSessionId: sessionId,
      endTime: Date.now() + timeSeconds * 1000,
      pendingBreak: null,
    });
    startTicking(get().tick);
  },

  pause: () => {
    stopTicking();
    // Freeze timeRemaining at current value
    const state = get();
    const remaining = state.endTime
      ? Math.max(0, Math.ceil((state.endTime - Date.now()) / 1000))
      : state.timeRemaining;
    set({ isRunning: false, endTime: null, timeRemaining: remaining });
  },

  resume: () => {
    const state = get();
    set({
      isRunning: true,
      endTime: Date.now() + state.timeRemaining * 1000,
    });
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
      endTime: null,
      pendingBreak: null,
    });
  },

  tick: () => {
    const state = get();
    if (!state.isRunning || !state.endTime) return;

    const remaining = Math.max(0, Math.ceil((state.endTime - Date.now()) / 1000));

    // Only update state if the displayed second has changed
    if (remaining !== state.timeRemaining) {
      set({ timeRemaining: remaining });

      if (remaining <= 0) {
        stopTicking();
        set({ isRunning: false, endTime: null });
      }
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
      endTime: Date.now() + focusDurationSeconds * 1000,
      pendingBreak: null,
    });
    startTicking(get().tick);
  },

  clearPendingBreak: () => set({ pendingBreak: null }),

  setSessionId: (id) => set({ currentSessionId: id }),
}));
