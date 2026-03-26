import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSymptomStore } from '../stores/symptomStore';
import { SYMPTOM_TAGS } from '../types';

interface SymptomValues {
  leftEyeFatigue: number;
  rightEyeFatigue: number;
  leftHeadPain: number;
  rightHeadPain: number;
  neckShoulderTension: number;
}

function SliderInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="slider-input">
      <div className="slider-header">
        <span className="slider-label">{label}</span>
        <span className="slider-value">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider"
      />
      <div className="slider-range">
        <span>None</span>
        <span>Severe</span>
      </div>
    </div>
  );
}

export function SymptomCheckinScreen() {
  const navigate = useNavigate();
  const { addSymptom, getTodayCheckInCount } = useSymptomStore();
  const todayCount = getTodayCheckInCount();

  const [values, setValues] = useState<SymptomValues>({
    leftEyeFatigue: 0,
    rightEyeFatigue: 0,
    leftHeadPain: 0,
    rightHeadPain: 0,
    neckShoulderTension: 0,
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    addSymptom({ ...values, tags: selectedTags });
    navigate('/');
  };

  const updateValue = (key: keyof SymptomValues) => (v: number) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  };

  if (todayCount >= 3) {
    return (
      <div className="screen checkin-screen">
        <div className="checkin-limit">
          <h2>Check-ins Complete</h2>
          <p>You've already logged {todayCount} check-ins today. Come back tomorrow!</p>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen checkin-screen">
      <div className="screen-header">
        <h1>Symptom Check-In</h1>
        <p className="checkin-count">{todayCount}/3 today</p>
      </div>

      <div className="checkin-sliders">
        <SliderInput
          label="Left Eye Fatigue"
          value={values.leftEyeFatigue}
          onChange={updateValue('leftEyeFatigue')}
        />
        <SliderInput
          label="Right Eye Fatigue"
          value={values.rightEyeFatigue}
          onChange={updateValue('rightEyeFatigue')}
        />
        <SliderInput
          label="Left Head Pain"
          value={values.leftHeadPain}
          onChange={updateValue('leftHeadPain')}
        />
        <SliderInput
          label="Right Head Pain"
          value={values.rightHeadPain}
          onChange={updateValue('rightHeadPain')}
        />
        <SliderInput
          label="Neck & Shoulder Tension"
          value={values.neckShoulderTension}
          onChange={updateValue('neckShoulderTension')}
        />
      </div>

      <div className="checkin-tags">
        <h3>Tags (optional)</h3>
        <div className="tag-grid">
          {SYMPTOM_TAGS.map((tag) => (
            <button
              key={tag}
              className={`tag-btn ${selectedTags.includes(tag) ? 'tag-btn--active' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="checkin-actions">
        <button className="btn btn-primary btn-large" onClick={handleSubmit}>
          Save Check-In
        </button>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>
          Skip
        </button>
      </div>
    </div>
  );
}
