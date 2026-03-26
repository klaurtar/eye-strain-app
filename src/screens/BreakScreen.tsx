import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatTime } from '../utils/helpers';
import { BREAK_PROMPTS } from '../types';
import { useSessionStore } from '../stores/sessionStore';
import { notifyBreakEnd } from '../utils/notifications';

export function BreakScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    mode: 'short_break' | 'long_break';
    duration: number;
    sessionId: string | null;
  } | null;

  const { incrementBreaks, incrementSkippedBreaks } = useSessionStore();

  const mode = state?.mode ?? 'short_break';
  const duration = state?.duration ?? 60;
  const sessionId = state?.sessionId ?? null;

  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [prompt] = useState(
    () => BREAK_PROMPTS[Math.floor(Math.random() * BREAK_PROMPTS.length)]
  );

  useEffect(() => {
    if (timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeRemaining]);

  const handleComplete = useCallback(() => {
    if (sessionId) incrementBreaks(sessionId);
    navigate('/', { state: { action: 'breakComplete' } });
  }, [sessionId, incrementBreaks, navigate]);

  const handleSkip = useCallback(() => {
    if (sessionId) incrementSkippedBreaks(sessionId);
    navigate('/', { state: { action: 'breakSkipped' } });
  }, [sessionId, incrementSkippedBreaks, navigate]);

  useEffect(() => {
    if (timeRemaining === 0) {
      notifyBreakEnd();
      // Auto-complete after countdown finishes
      const timeout = setTimeout(handleComplete, 2000);
      return () => clearTimeout(timeout);
    }
  }, [timeRemaining, handleComplete]);

  const isLongBreak = mode === 'long_break';

  return (
    <div className={`screen break-screen ${isLongBreak ? 'break-screen--long' : ''}`}>
      <div className="break-header">
        <h1>{isLongBreak ? 'Long Break' : 'Short Break'}</h1>
        <p className="break-subtitle">
          {isLongBreak ? 'Time to step away' : 'Rest your eyes'}
        </p>
      </div>

      <div className="break-prompt">
        <p>{prompt}</p>
      </div>

      <div className="timer-display">
        <span className="timer-time timer-time--break">
          {formatTime(timeRemaining)}
        </span>
      </div>

      {timeRemaining === 0 ? (
        <div className="break-complete-msg">
          <p>Break complete!</p>
          <button className="btn btn-primary btn-large" onClick={handleComplete}>
            Continue
          </button>
        </div>
      ) : (
        <div className="break-actions">
          <button className="btn btn-ghost" onClick={handleSkip}>
            Skip Break
          </button>
        </div>
      )}
    </div>
  );
}
