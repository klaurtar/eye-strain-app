// Notification sounds and vibration using Web APIs (no plugins needed)

type ToneType = 'focus_end' | 'break_end';

// Generate a gentle notification tone using Web Audio API
function playTone(type: ToneType): void {
  try {
    const ctx = new AudioContext();
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);

    if (type === 'focus_end') {
      // Two-tone ascending chime: "time for a break"
      playNote(ctx, gainNode, 523.25, 0, 0.2, 0.3);   // C5
      playNote(ctx, gainNode, 659.25, 0.25, 0.2, 0.3); // E5
      playNote(ctx, gainNode, 783.99, 0.5, 0.3, 0.4);  // G5
    } else {
      // Single gentle tone: "break's over"
      playNote(ctx, gainNode, 440, 0, 0.15, 0.5);      // A4
      playNote(ctx, gainNode, 523.25, 0.3, 0.2, 0.4);  // C5
    }

    // Close audio context after sounds finish
    setTimeout(() => ctx.close(), 2000);
  } catch {
    // Audio not available — silent fallback
  }
}

function playNote(
  ctx: AudioContext,
  gainNode: GainNode,
  frequency: number,
  startTime: number,
  attack: number,
  duration: number
): void {
  const osc = ctx.createOscillator();
  const noteGain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = frequency;

  noteGain.gain.setValueAtTime(0, ctx.currentTime + startTime);
  noteGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + startTime + attack);
  noteGain.gain.linearRampToValueAtTime(0, ctx.currentTime + startTime + duration);

  osc.connect(noteGain);
  noteGain.connect(gainNode);

  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration + 0.1);
}

// Vibrate the device
function vibrate(pattern: number | number[]): void {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Vibration not available
  }
}

// Public API
export function notifyFocusEnd(): void {
  playTone('focus_end');
  vibrate([200, 100, 200]); // short-pause-short
}

export function notifyBreakEnd(): void {
  playTone('break_end');
  vibrate(200); // single short
}
