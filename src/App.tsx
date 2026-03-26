import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { TimerScreen } from './screens/TimerScreen';
import { BreakScreen } from './screens/BreakScreen';
import { SymptomCheckinScreen } from './screens/SymptomCheckinScreen';
import { DailySummaryScreen } from './screens/DailySummaryScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { useSessionStore } from './stores/sessionStore';
import { useSymptomStore } from './stores/symptomStore';
import { useSettingsStore } from './stores/settingsStore';

function App() {
  const loadSessions = useSessionStore((s) => s.load);
  const loadSymptoms = useSymptomStore((s) => s.load);
  const loadSettings = useSettingsStore((s) => s.load);
  const darkMode = useSettingsStore((s) => s.settings.darkMode);

  useEffect(() => {
    loadSessions();
    loadSymptoms();
    loadSettings();
  }, [loadSessions, loadSymptoms, loadSettings]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <BrowserRouter>
      <div className="app">
        <main className="app-main">
          <Routes>
            <Route path="/" element={<TimerScreen />} />
            <Route path="/break" element={<BreakScreen />} />
            <Route path="/checkin" element={<SymptomCheckinScreen />} />
            <Route path="/summary" element={<DailySummaryScreen />} />
            <Route path="/history" element={<HistoryScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
          </Routes>
        </main>
        <NavBar />
      </div>
    </BrowserRouter>
  );
}

export default App;
