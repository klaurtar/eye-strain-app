import { create } from 'zustand';
import type { ActivityType, TimerMode } from '../types';
import { notifyFocusEnd } from '../utils/notifications';

interface TimerSettings {
  sessionsBeforeLongBreak: number;
  longBreakMinutes: number;
  shortBreakSeconds: number;
  focusDurationMinutes: number;
}

interface TimerStore {
  timeRemaining: number;
  totalDuration: number;
  mode: TimerMode;
  isRunning: boolean;
  activity: ActivityType | null;
  sessionCount: number;
  currentSessionId: string | null;
  endTime: number | null;
  pendingBreak: {
    mode: 'short_break' | 'long_break';
    duration: number;
    sessionId: string | null;
  } | null;
  // Store settings so tick() can handle completion autonomously
  _settings: TimerSettings | null;

  start: (timeSeconds: number, activity: ActivityType, sessionId: string, settings: TimerSettings) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  tick: () => void;
  consumePendingBreak: () => TimerStore['pendingBreak'];
  onBreakReturn: (focusDurationSeconds: number) => void;
}

let tickInterval: number | null = null;

function startTicking(tick: () => void) {
  stopTicking();
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
  _settings: null,

  start: (timeSeconds, activity, sessionId, settings) => {
    set({
      timeRemaining: timeSeconds,
      totalDuration: timeSeconds,
      mode: 'focus',
      isRunning: true,
      activity,
      currentSessionId: sessionId,
      endTime: Date.now() + timeSeconds * 1000,
      pendingBreak: null,
      _settings: settings,
    });
    startTicking(get().tick);
  },

  pause: () => {
    stopTicking();
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
      _settings: null,
    });
  },

  tick: () => {
    const state = get();
    if (!state.isRunning || !state.endTime) return;

    const remaining = Math.max(0, Math.ceil((state.endTime - Date.now()) / 1000));

    if (remaining !== state.timeRemaining) {
      set({ timeRemaining: remaining });
    }

    // Handle focus completion inside tick — works even if TimerScreen is unmounted
    if (remaining <= 0) {
      stopTicking();

      const settings = state._settings;
      if (state.mode === 'focus' && settings) {
        const newCount = state.sessionCount + 1;
        const isLongBreak = newCount % settings.sessionsBeforeLongBreak === 0;

        notifyFocusEnd();

        set({
          isRunning: false,
          endTime: null,
          mode: 'idle',
          sessionCount: newCount,
          pendingBreak: {
            mode: isLongBreak ? 'long_break' : 'short_break',
            duration: isLongBreak ? settings.longBreakMinutes * 60 : settings.shortBreakSeconds,
            sessionId: state.currentSessionId,
          },
        });
      } else {
        set({ isRunning: false, endTime: null });
      }
    }
  },

  consumePendingBreak: () => {
    const breakInfo = get().pendingBreak;
    if (breakInfo) {
      set({ pendingBreak: null });
    }
    return breakInfo;
  },

  onBreakReturn: (focusDurationSeconds) => {
    const state = get();
    set({
      timeRemaining: focusDurationSeconds,
      totalDuration: focusDurationSeconds,
      mode: 'focus',
      isRunning: true,
      endTime: Date.now() + focusDurationSeconds * 1000,
      pendingBreak: null,
    });
    startTicking(state.tick);
  },
}));
