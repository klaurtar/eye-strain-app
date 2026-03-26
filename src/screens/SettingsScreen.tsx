import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../stores/settingsStore';

export function SettingsScreen() {
  const navigate = useNavigate();
  const { settings, update } = useSettingsStore();

  return (
    <div className="screen settings-screen">
      <div className="screen-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-list">
        <div className="setting-item">
          <label>Focus Duration (minutes)</label>
          <div className="setting-control">
            <button
              className="btn btn-small"
              onClick={() => update({ focusDurationMinutes: Math.max(5, settings.focusDurationMinutes - 5) })}
            >
              −
            </button>
            <span className="setting-value">{settings.focusDurationMinutes}</span>
            <button
              className="btn btn-small"
              onClick={() => update({ focusDurationMinutes: Math.min(90, settings.focusDurationMinutes + 5) })}
            >
              +
            </button>
          </div>
        </div>

        <div className="setting-item">
          <label>Short Break (seconds)</label>
          <div className="setting-control">
            <button
              className="btn btn-small"
              onClick={() => update({ shortBreakSeconds: Math.max(15, settings.shortBreakSeconds - 15) })}
            >
              −
            </button>
            <span className="setting-value">{settings.shortBreakSeconds}</span>
            <button
              className="btn btn-small"
              onClick={() => update({ shortBreakSeconds: Math.min(300, settings.shortBreakSeconds + 15) })}
            >
              +
            </button>
          </div>
        </div>

        <div className="setting-item">
          <label>Long Break (minutes)</label>
          <div className="setting-control">
            <button
              className="btn btn-small"
              onClick={() => update({ longBreakMinutes: Math.max(5, settings.longBreakMinutes - 1) })}
            >
              −
            </button>
            <span className="setting-value">{settings.longBreakMinutes}</span>
            <button
              className="btn btn-small"
              onClick={() => update({ longBreakMinutes: Math.min(30, settings.longBreakMinutes + 1) })}
            >
              +
            </button>
          </div>
        </div>

        <div className="setting-item">
          <label>Sessions Before Long Break</label>
          <div className="setting-control">
            <button
              className="btn btn-small"
              onClick={() => update({ sessionsBeforeLongBreak: Math.max(1, settings.sessionsBeforeLongBreak - 1) })}
            >
              −
            </button>
            <span className="setting-value">{settings.sessionsBeforeLongBreak}</span>
            <button
              className="btn btn-small"
              onClick={() => update({ sessionsBeforeLongBreak: Math.min(10, settings.sessionsBeforeLongBreak + 1) })}
            >
              +
            </button>
          </div>
        </div>

        <div className="setting-item">
          <label>Dark Mode</label>
          <div className="setting-control">
            <button
              className={`toggle-btn ${settings.darkMode ? 'toggle-btn--active' : ''}`}
              onClick={() => update({ darkMode: !settings.darkMode })}
            >
              {settings.darkMode ? 'On' : 'Off'}
            </button>
          </div>
        </div>
      </div>

      <div className="settings-info">
        <p className="disclaimer">
          Eye Relief is a habit support app. It does not diagnose or treat any medical condition.
          If you have persistent symptoms, please consult a healthcare professional.
        </p>
      </div>

      <div className="summary-actions">
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          Back
        </button>
      </div>
    </div>
  );
}
