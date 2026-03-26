import { ACTIVITY_TYPES } from '../types';
import type { ActivityType } from '../types';

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  Coding: '</>',
  Reading: 'Aa',
  Gaming: '▶',
  Phone: '☎',
  Other: '•••',
};

interface ActivitySelectorProps {
  onSelect: (activity: ActivityType) => void;
  onClose: () => void;
}

export function ActivitySelector({ onSelect, onClose }: ActivitySelectorProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal activity-modal" onClick={(e) => e.stopPropagation()}>
        <h2>What are you doing?</h2>
        <div className="activity-grid">
          {ACTIVITY_TYPES.map((activity) => (
            <button
              key={activity}
              className="activity-btn"
              onClick={() => onSelect(activity)}
            >
              <span className="activity-icon">{ACTIVITY_ICONS[activity]}</span>
              <span className="activity-label">{activity}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
