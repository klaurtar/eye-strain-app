import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatTime } from '../utils/helpers';
import type { ActivityType } from '../types';
import { ActivitySelector } from '../components/ActivitySelector';
import { ProgressRing } from '../components/ProgressRing';
import { useSettingsStore } from '../stores/settingsStore';
import { useSessionStore } from '../stores/sessionStore';
import { useTimerStore } from '../stores/timerStore';

export function TimerScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettingsStore();
  const { startSession, endSession } = useSessionStore();
  const timer = useTimerStore();
  const [showActivityPicker, setShowActivityPicker] = useState(false);

  // Handle returning from break screen
  useEffect(() => {
    const state = location.state as { action?: string } | null;
    if (state?.action === 'breakComplete' || state?.action === 'breakSkipped') {
      timer.onBreakReturn(settings.focusDurationMinutes * 60);
      window.history.replaceState({}, '');
    }
  }, [location.state, settings.focusDurationMinutes, timer]);

  // Handle focus timer completion — navigate to break
  useEffect(() => {
    if (timer.timeRemaining === 0 && !timer.isRunning && timer.mode === 'focus') {
      timer.onFocusEnd(settings);
    }
  }, [timer.timeRemaining, timer.isRunning, timer.mode, settings, timer]);

  // Handle pending break — navigate
  useEffect(() => {
    if (timer.pendingBreak) {
      const breakInfo = timer.pendingBreak;
      timer.clearPendingBreak();
      navigate('/break', { state: breakInfo });
    }
  }, [timer.pendingBreak, timer, navigate]);

  const handleStart = (act: ActivityType) => {
    setShowActivityPicker(false);
    const session = startSession(act);
    timer.start(settings.focusDurationMinutes * 60, act, session.id);
  };

  const handlePause = () => timer.pause();

  const handleResume = () => timer.resume();

  const handleReset = () => {
    if (timer.currentSessionId) {
      endSession(timer.currentSessionId);
    }
    timer.reset();
  };

  const modeLabel = {
    idle: 'Ready',
    focus: 'Focus',
    short_break: 'Short Break',
    long_break: 'Long Break',
  }[timer.mode];

  const progress =
    timer.totalDuration > 0 ? timer.timeRemaining / timer.totalDuration : 1;

  const displayTime = timer.mode === 'idle'
    ? settings.focusDurationMinutes * 60
    : timer.timeRemaining;

  return (
    <div className="screen timer-screen">
      <div className={`timer-mode timer-mode--${timer.mode}`}>
        <span className="mode-label">{modeLabel}</span>
      </div>

      {timer.activity && (
        <div className="activity-badge">
          <span>{timer.activity}</span>
        </div>
      )}

      <ProgressRing progress={timer.mode === 'idle' ? 1 : progress}>
        <span className="timer-time">{formatTime(displayTime)}</span>
      </ProgressRing>

      {timer.mode === 'focus' && (
        <div className="session-progress">
          <span>Session {timer.sessionCount + 1}</span>
        </div>
      )}

      <div className="timer-controls">
        {timer.mode === 'idle' && (
          <button
            className="btn btn-primary btn-large"
            onClick={() => setShowActivityPicker(true)}
          >
            Start Focus
          </button>
        )}

        {timer.mode === 'focus' && timer.isRunning && (
          <button className="btn btn-secondary" onClick={handlePause}>
            Pause
          </button>
        )}

        {timer.mode === 'focus' && !timer.isRunning && timer.timeRemaining > 0 && (
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
