import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'Timer', icon: '⏱' },
  { path: '/checkin', label: 'Check-In', icon: '♡' },
  { path: '/summary', label: 'Summary', icon: '☰' },
  { path: '/history', label: 'History', icon: '◷' },
  { path: '/settings', label: 'Settings', icon: '⚙' },
];

export function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide nav on break screen
  if (location.pathname === '/break') return null;

  return (
    <nav className="nav-bar">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.path}
          className={`nav-item ${location.pathname === item.path ? 'nav-item--active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
