# Eye Relief

A calm, lightweight mobile app that helps reduce eye strain, visual fatigue, and tension headaches caused by prolonged near-focus activities like coding, reading, gaming, and phone use.

**This is not a medical app.** It does not diagnose, treat, or make medical claims. It is a habit and recovery support tool.

## Tech Stack

- **Tauri 2** — mobile shell (Android)
- **Rust** — backend logic (insights computation, data processing)
- **React + TypeScript** — frontend UI
- **Vite** — build tooling
- **Zustand** — state management
- **Tauri Store Plugin** — local-first persistence (with localStorage fallback)

## Features

### Focus Session Timer
- Configurable focus sessions (default: 35 minutes)
- Automatic short breaks (60s) and long breaks (10 min every 4 sessions)
- Activity tagging: Coding, Reading, Gaming, Phone, Other
- Start, pause, resume, reset controls

### Break Intervention
- Full-screen break prompts with rotating wellness tips
- Visible countdown timer
- Skip tracking (skips are recorded for insights)

### Symptom Check-In
- Rate left/right eye fatigue, head pain, neck tension (0–10 scale)
- Optional tags (coding, reading, poor lighting, etc.)
- Up to 3 check-ins per day
- Designed for one-handed mobile use

### Daily Summary
- Total focus time, breaks completed/skipped, longest session
- Average symptom scores with visual bars
- Activity breakdown
- Rule-based insights

### History & Trends
- Day-by-day history with fatigue tracking
- Multi-day trend analysis
- Pattern detection across days

### Smart Rules
- Warning for sessions >45 minutes
- Nudge when 3+ breaks skipped in a day
- Fatigue trend detection
- Activity-symptom correlation surfacing

### Settings
- Configurable focus/break durations
- Dark/light mode
- Sessions before long break

## Prerequisites

1. **Node.js** >= 18
2. **Rust** (via rustup)
3. **Android Studio** with:
   - Android SDK (API level 24+)
   - Android NDK
   - Set `ANDROID_HOME` and `NDK_HOME` environment variables
4. **Tauri CLI**: installed via npm (`@tauri-apps/cli`)

### Android Setup

```bash
# Set environment variables (add to ~/.bashrc or ~/.zshrc)
export ANDROID_HOME="$HOME/Android/Sdk"
export NDK_HOME="$ANDROID_HOME/ndk/$(ls $ANDROID_HOME/ndk/)"
export PATH="$PATH:$ANDROID_HOME/platform-tools"

# Initialize Android target (if not already done)
npx tauri android init
```

## Getting Started

```bash
# Install dependencies
npm install

# Run in development (desktop preview)
npm run tauri dev

# Run on Android device/emulator
npm run tauri android dev

# Build Android APK
npm run tauri android build
```

## Project Structure

```
├── src/                      # React frontend
│   ├── components/           # Reusable UI components
│   │   ├── ActivitySelector.tsx
│   │   └── NavBar.tsx
│   ├── hooks/                # Custom React hooks
│   │   └── useDailyInsights.ts
│   ├── screens/              # App screens
│   │   ├── TimerScreen.tsx
│   │   ├── BreakScreen.tsx
│   │   ├── SymptomCheckinScreen.tsx
│   │   ├── DailySummaryScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── stores/               # Zustand state stores
│   │   ├── sessionStore.ts
│   │   ├── symptomStore.ts
│   │   └── settingsStore.ts
│   ├── types/                # TypeScript types
│   │   └── index.ts
│   ├── utils/                # Utilities
│   │   ├── helpers.ts
│   │   └── storage.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── src-tauri/                # Tauri / Rust backend
│   ├── src/
│   │   ├── lib.rs            # Tauri commands & insights engine
│   │   └── main.rs
│   ├── capabilities/
│   │   └── default.json
│   ├── Cargo.toml
│   └── tauri.conf.json
├── index.html
├── vite.config.ts
└── package.json
```

## Architecture Decisions

- **Local-first**: All data stored on-device via Tauri Store plugin with localStorage fallback
- **No backend/login**: Zero network dependencies for MVP
- **Dual insights engine**: TypeScript computes insights on the frontend for instant UI updates; Rust backend provides the same computations via Tauri commands for heavier workloads
- **Mobile-first CSS**: CSS custom properties for theming, max-width constraint for phone screens, safe-area handling
- **Zustand over Context**: Simpler API, no provider wrapping, built-in persistence patterns
