import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { useSymptomStore } from '../stores/symptomStore';
import { useDailyInsights } from '../hooks/useDailyInsights';
import { getTodayDateString, formatMinutes } from '../utils/helpers';

export function DailySummaryScreen() {
  const navigate = useNavigate();
  const { getTodaySessions } = useSessionStore();
  const { getTodaySymptoms } = useSymptomStore();

  const sessions = useMemo(() => getTodaySessions(), [getTodaySessions]);
  const symptoms = useMemo(() => getTodaySymptoms(), [getTodaySymptoms]);
  const stats = useDailyInsights(sessions, symptoms, getTodayDateString());

  const activityBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of sessions) {
      counts[s.activityType] = (counts[s.activityType] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [sessions]);

  return (
    <div className="screen summary-screen">
      <div className="screen-header">
        <h1>Today's Summary</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{formatMinutes(stats.totalFocusMinutes)}</span>
          <span className="stat-label">Focus Time</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.breaksCompleted}</span>
          <span className="stat-label">Breaks Done</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.breaksSkipped}</span>
          <span className="stat-label">Breaks Skipped</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatMinutes(stats.longestSessionMinutes)}</span>
          <span className="stat-label">Longest Session</span>
        </div>
      </div>

      {symptoms.length > 0 && (
        <div className="summary-section">
          <h2>Average Symptoms</h2>
          <div className="symptom-bars">
            <SymptomBar label="L Eye" value={stats.averageSymptoms.leftEyeFatigue} />
            <SymptomBar label="R Eye" value={stats.averageSymptoms.rightEyeFatigue} />
            <SymptomBar label="L Head" value={stats.averageSymptoms.leftHeadPain} />
            <SymptomBar label="R Head" value={stats.averageSymptoms.rightHeadPain} />
            <SymptomBar label="Neck" value={stats.averageSymptoms.neckShoulderTension} />
          </div>
        </div>
      )}

      {activityBreakdown.length > 0 && (
        <div className="summary-section">
          <h2>Activities</h2>
          <div className="activity-breakdown">
            {activityBreakdown.map(([activity, count]) => (
              <div key={activity} className="activity-row">
                <span className="activity-name">{activity}</span>
                <span className="activity-count">{count} session{count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="summary-section">
        <h2>Insights</h2>
        <div className="insights-list">
          {stats.generatedInsights.map((insight, i) => (
            <div key={i} className="insight-card">
              <p>{insight}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="summary-actions">
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          Back
        </button>
      </div>
    </div>
  );
}

function SymptomBar({ label, value }: { label: string; value: number }) {
  const percentage = (value / 10) * 100;
  const color = value <= 3 ? 'var(--color-success)' : value <= 6 ? 'var(--color-warning)' : 'var(--color-danger)';

  return (
    <div className="symptom-bar">
      <span className="symptom-bar-label">{label}</span>
      <div className="symptom-bar-track">
        <div
          className="symptom-bar-fill"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <span className="symptom-bar-value">{value.toFixed(1)}</span>
    </div>
  );
}
