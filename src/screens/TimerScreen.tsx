import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatTime } from '../utils/helpers';
import type { ActivityType, TimerMode } from '../types';
import { ActivitySelector } from '../components/ActivitySelector';
import { useSettingsStore } from '../stores/settingsStore';
import { useSessionStore } from '../stores/sessionStore';
import { notifyFocusEnd } from '../utils/notifications';

export function TimerScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettingsStore();
  const { startSession, endSession } = useSessionStore();

  const [timeRemaining, setTimeRemaining] = useState(settings.focusDurationMinutes * 60);
  const [mode, setMode] = useState<TimerMode>('idle');
  const [isRunning, setIsRunning] = useState(false);
  const [activity, setActivity] = useState<ActivityType | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Handle returning from break screen
  useEffect(() => {
    const state = location.state as { action?: string } | null;
    if (state?.action === 'breakComplete' || state?.action === 'breakSkipped') {
      setMode('focus');
      setTimeRemaining(settings.focusDurationMinutes * 60);
      setIsRunning(true);
      // Clear the location state
      window.history.replaceState({}, '');
    }
  }, [location.state, settings.focusDurationMinutes]);

  // Timer tick
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [isRunning]);

  // Handle timer completion
  useEffect(() => {
    if (timeRemaining === 0 && isRunning && mode === 'focus') {
      setIsRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      notifyFocusEnd();
      const newCount = sessionCount + 1;
      setSessionCount(newCount);

      const isLongBreak = newCount % settings.sessionsBeforeLongBreak === 0;
      const breakMode = isLongBreak ? 'long_break' : 'short_break';
      const breakDuration = isLongBreak
        ? settings.longBreakMinutes * 60
        : settings.shortBreakSeconds;

      navigate('/break', {
        state: {
          mode: breakMode,
          duration: breakDuration,
          sessionId: currentSessionId,
        },
      });
    }
  }, [timeRemaining, isRunning, mode, sessionCount, settings, navigate, currentSessionId]);

  const handleStart = (act: ActivityType) => {
    setActivity(act);
    setMode('focus');
    setTimeRemaining(settings.focusDurationMinutes * 60);
    setIsRunning(true);
    setShowActivityPicker(false);
    const session = startSession(act);
    setCurrentSessionId(session.id);
  };

  const handlePause = () => setIsRunning(false);

  const handleResume = () => {
    if (mode !== 'idle') setIsRunning(true);
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setMode('idle');
    setTimeRemaining(settings.focusDurationMinutes * 60);
    setActivity(null);
    setSessionCount(0);
    if (currentSessionId) {
      endSession(currentSessionId);
      setCurrentSessionId(null);
    }
  };

  const modeLabel = {
    idle: 'Ready',
    focus: 'Focus',
    short_break: 'Short Break',
    long_break: 'Long Break',
  }[mode];

  return (
    <div className="screen timer-screen">
      <div className={`timer-mode timer-mode--${mode}`}>
        <span className="mode-label">{modeLabel}</span>
      </div>

      {activity && (
        <div className="activity-badge">
          <span>{activity}</span>
        </div>
      )}

      <div className="timer-display">
        <span className="timer-time">{formatTime(timeRemaining)}</span>
      </div>

      {mode === 'focus' && (
        <div className="session-progress">
          <span>Session {sessionCount + 1}</span>
        </div>
      )}

      <div className="timer-controls">
        {mode === 'idle' && (
          <button
            className="btn btn-primary btn-large"
            onClick={() => setShowActivityPicker(true)}
          >
            Start Focus
          </button>
        )}

        {mode === 'focus' && isRunning && (
          <button className="btn btn-secondary" onClick={handlePause}>
            Pause
          </button>
        )}

        {mode === 'focus' && !isRunning && timeRemaining > 0 && (
          <div className="btn-row">
            <button className="btn btn-primary" onClick={handleResume}>
              Resume
            </button>
            <button className="btn btn-ghost" onClick={handleReset}>
              Reset
            </button>
          </div>
        )}
      </div>

      {showActivityPicker && (
        <ActivitySelector
          onSelect={handleStart}
          onClose={() => setShowActivityPicker(false)}
        />
      )}
    </div>
  );
}
