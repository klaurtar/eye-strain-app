import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimerStore } from '../stores/timerStore';

/**
 * Always-mounted component that watches for pending breaks
 * and navigates to the break screen regardless of which tab
 * the user is currently on.
 */
export function TimerNavigator() {
  const navigate = useNavigate();
  const pendingBreak = useTimerStore((s) => s.pendingBreak);
  const consumePendingBreak = useTimerStore((s) => s.consumePendingBreak);

  useEffect(() => {
    if (pendingBreak) {
      const breakInfo = consumePendingBreak();
      if (breakInfo) {
        navigate('/break', { state: breakInfo });
      }
    }
  }, [pendingBreak, consumePendingBreak, navigate]);

  return null;
}
