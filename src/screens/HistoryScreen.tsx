import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { useSymptomStore } from '../stores/symptomStore';
import { computeDailyStats, generateMultiDayInsights } from '../hooks/useDailyInsights';
import { formatMinutes } from '../utils/helpers';

export function HistoryScreen() {
  const navigate = useNavigate();
  const { sessions } = useSessionStore();
  const { symptoms } = useSymptomStore();

  const dailyStats = useMemo(() => {
    const dateMap = new Map<string, { sessions: typeof sessions; symptoms: typeof symptoms }>();

    for (const s of sessions) {
      const date = new Date(s.startTime * 1000).toISOString().split('T')[0];
      if (!dateMap.has(date)) dateMap.set(date, { sessions: [], symptoms: [] });
      dateMap.get(date)!.sessions.push(s);
    }

    for (const s of symptoms) {
      const date = new Date(s.timestamp * 1000).toISOString().split('T')[0];
      if (!dateMap.has(date)) dateMap.set(date, { sessions: [], symptoms: [] });
      dateMap.get(date)!.symptoms.push(s);
    }

    const stats = Array.from(dateMap.entries())
      .map(([date, data]) => computeDailyStats(data.sessions, data.symptoms, date))
      .sort((a, b) => b.date.localeCompare(a.date));

    return stats;
  }, [sessions, symptoms]);

  const trendInsights = useMemo(
    () => generateMultiDayInsights([...dailyStats].reverse()),
    [dailyStats]
  );

  return (
    <div className="screen history-screen">
      <div className="screen-header">
        <h1>History</h1>
      </div>

      {trendInsights.length > 0 && (
        <div className="summary-section">
          <h2>Trends</h2>
          <div className="insights-list">
            {trendInsights.map((insight, i) => (
              <div key={i} className="insight-card">
                <p>{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="history-list">
        {dailyStats.length === 0 ? (
          <div className="empty-state">
            <p>No history yet. Start a focus session to begin tracking.</p>
          </div>
        ) : (
          dailyStats.map((day) => (
            <div key={day.date} className="history-card">
              <div className="history-date">
                {new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              <div className="history-stats">
                <span>{formatMinutes(day.totalFocusMinutes)} focus</span>
                <span>{day.breaksCompleted} breaks</span>
                {day.breaksSkipped > 0 && (
                  <span className="history-skipped">{day.breaksSkipped} skipped</span>
                )}
              </div>
              {day.averageSymptoms.leftEyeFatigue + day.averageSymptoms.rightEyeFatigue > 0 && (
                <div className="history-fatigue">
                  Avg fatigue:{' '}
                  {(
                    (day.averageSymptoms.leftEyeFatigue + day.averageSymptoms.rightEyeFatigue) /
                    2
                  ).toFixed(1)}
                  /10
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="summary-actions">
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          Back
        </button>
      </div>
    </div>
  );
}
