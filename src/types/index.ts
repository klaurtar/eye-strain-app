export interface Session {
  id: string;
  startTime: number;
  endTime: number | null;
  activityType: ActivityType;
  breakCount: number;
  skippedBreakCount: number;
  sessionType: 'focus' | 'short_break' | 'long_break';
}

export type ActivityType = 'Coding' | 'Reading' | 'Gaming' | 'Phone' | 'Other';

export interface SymptomEntry {
  id: string;
  timestamp: number;
  leftEyeFatigue: number;
  rightEyeFatigue: number;
  leftHeadPain: number;
  rightHeadPain: number;
  neckShoulderTension: number;
  tags: string[];
}

export interface DailyStats {
  date: string;
  totalFocusMinutes: number;
  breaksCompleted: number;
  breaksSkipped: number;
  longestSessionMinutes: number;
  averageSymptoms: AverageSymptoms;
  generatedInsights: string[];
}

export interface AverageSymptoms {
  leftEyeFatigue: number;
  rightEyeFatigue: number;
  leftHeadPain: number;
  rightHeadPain: number;
  neckShoulderTension: number;
}

export interface AppSettings {
  focusDurationMinutes: number;
  shortBreakSeconds: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  darkMode: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  focusDurationMinutes: 35,
  shortBreakSeconds: 60,
  longBreakMinutes: 10,
  sessionsBeforeLongBreak: 4,
  darkMode: true,
};

export type TimerMode = 'idle' | 'focus' | 'short_break' | 'long_break';

export const ACTIVITY_TYPES: ActivityType[] = ['Coding', 'Reading', 'Gaming', 'Phone', 'Other'];

export const SYMPTOM_TAGS = [
  'coding', 'reading', 'gaming', 'phone',
  'outside', 'poor lighting', 'long session',
] as const;

export const BREAK_PROMPTS = [
  'Look at something 20+ feet away for 60 seconds',
  'Blink slowly 10 times, letting your eyes fully close each time',
  'Relax your jaw, brow, and the muscles around your eyes',
  'Drop your shoulders away from your ears and take 3 deep breaths',
  'Stand up and walk around for 1 minute',
  'Close your eyes and gently press your palms over them for 30 seconds',
  'Look up, down, left, right — slowly stretch your eye muscles',
  'Roll your neck gently in circles, 5 times each direction',
  'Focus on a distant object, then a near one — repeat 5 times',
  'Stretch your arms overhead and take 5 slow breaths',
];
