import { useMemo } from 'react';
import type { Session, SymptomEntry, DailyStats, AverageSymptoms } from '../types';

export function computeDailyStats(
  sessions: Session[],
  symptoms: SymptomEntry[],
  date: string
): DailyStats {
  const totalFocusMinutes = sessions
    .filter((s) => s.endTime !== null)
    .reduce((sum, s) => sum + (s.endTime! - s.startTime) / 60, 0);

  const breaksCompleted = sessions.reduce((sum, s) => sum + s.breakCount, 0);
  const breaksSkipped = sessions.reduce((sum, s) => sum + s.skippedBreakCount, 0);

  const longestSessionMinutes = sessions
    .filter((s) => s.endTime !== null)
    .reduce((max, s) => Math.max(max, (s.endTime! - s.startTime) / 60), 0);

  const averageSymptoms: AverageSymptoms =
    symptoms.length === 0
      ? { leftEyeFatigue: 0, rightEyeFatigue: 0, leftHeadPain: 0, rightHeadPain: 0, neckShoulderTension: 0 }
      : {
          leftEyeFatigue: symptoms.reduce((s, e) => s + e.leftEyeFatigue, 0) / symptoms.length,
          rightEyeFatigue: symptoms.reduce((s, e) => s + e.rightEyeFatigue, 0) / symptoms.length,
          leftHeadPain: symptoms.reduce((s, e) => s + e.leftHeadPain, 0) / symptoms.length,
          rightHeadPain: symptoms.reduce((s, e) => s + e.rightHeadPain, 0) / symptoms.length,
          neckShoulderTension: symptoms.reduce((s, e) => s + e.neckShoulderTension, 0) / symptoms.length,
        };

  const generatedInsights = generateInsights(sessions, symptoms, averageSymptoms, breaksCompleted, breaksSkipped);

  return {
    date,
    totalFocusMinutes,
    breaksCompleted,
    breaksSkipped,
    longestSessionMinutes,
    averageSymptoms,
    generatedInsights,
  };
}

function generateInsights(
  sessions: Session[],
  symptoms: SymptomEntry[],
  avg: AverageSymptoms,
  breaksCompleted: number,
  breaksSkipped: number
): string[] {
  const insights: string[] = [];

  if (sessions.some((s) => s.endTime && (s.endTime - s.startTime) > 45 * 60)) {
    insights.push('You had sessions longer than 45 minutes. Try shorter focus periods to reduce strain.');
  }

  if (breaksSkipped >= 3) {
    insights.push('You skipped 3 or more breaks today. Completing breaks helps reduce fatigue.');
  }

  if (breaksCompleted > 0 && breaksSkipped === 0) {
    insights.push('Great job completing all your breaks today!');
  }

  const overallFatigue = (avg.leftEyeFatigue + avg.rightEyeFatigue) / 2;
  if (overallFatigue > 6) {
    insights.push('Your eye fatigue was high today. Consider more frequent breaks.');
  }

  // Activity counts
  const activityCounts: Record<string, number> = {};
  for (const session of sessions) {
    activityCounts[session.activityType] = (activityCounts[session.activityType] || 0) + 1;
  }
  const topActivity = Object.entries(activityCounts).sort((a, b) => b[1] - a[1])[0];
  if (topActivity && topActivity[1] >= 2) {
    insights.push(`${topActivity[0]} was your most common activity today with ${topActivity[1]} sessions.`);
  }

  // Tag correlations
  if (symptoms.length > 0) {
    const tagFatigue: Record<string, { total: number; count: number }> = {};
    for (const symptom of symptoms) {
      const fatigue = (symptom.leftEyeFatigue + symptom.rightEyeFatigue) / 2;
      for (const tag of symptom.tags) {
        if (!tagFatigue[tag]) tagFatigue[tag] = { total: 0, count: 0 };
        tagFatigue[tag].total += fatigue;
        tagFatigue[tag].count += 1;
      }
    }
    for (const [tag, { total, count }] of Object.entries(tagFatigue)) {
      if (total / count > 5) {
        insights.push(`Your fatigue tends to be higher when tagged with '${tag}'.`);
      }
    }
  }

  if (insights.length === 0) {
    insights.push('Keep tracking to discover patterns in your eye strain.');
  }

  return insights;
}

export function generateMultiDayInsights(dailyStats: DailyStats[]): string[] {
  if (dailyStats.length < 2) {
    return ['Track for more days to see trends.'];
  }

  const insights: string[] = [];
  const recent = dailyStats.slice(-3);

  if (recent.length >= 2) {
    const fatigueTrend = recent.map(
      (d) => (d.averageSymptoms.leftEyeFatigue + d.averageSymptoms.rightEyeFatigue) / 2
    );
    const isIncreasing = fatigueTrend.every((v, i) => i === 0 || v > fatigueTrend[i - 1]);
    if (isIncreasing && fatigueTrend[fatigueTrend.length - 1] > 3) {
      insights.push('Your fatigue has been trending upward. Consider shorter sessions.');
    }
  }

  const skipDays = dailyStats.filter((d) => d.breaksSkipped > 0);
  const noSkipDays = dailyStats.filter((d) => d.breaksSkipped === 0 && d.breaksCompleted > 0);

  if (skipDays.length > 0 && noSkipDays.length > 0) {
    const avgSkip = skipDays.reduce((s, d) => s + (d.averageSymptoms.leftEyeFatigue + d.averageSymptoms.rightEyeFatigue) / 2, 0) / skipDays.length;
    const avgNoSkip = noSkipDays.reduce((s, d) => s + (d.averageSymptoms.leftEyeFatigue + d.averageSymptoms.rightEyeFatigue) / 2, 0) / noSkipDays.length;

    if (avgSkip > avgNoSkip + 1) {
      insights.push('Your symptoms were lower on days with more completed breaks.');
    }
  }

  if (insights.length === 0) {
    insights.push('Keep tracking to discover more patterns.');
  }

  return insights;
}

export function useDailyInsights(sessions: Session[], symptoms: SymptomEntry[], date: string) {
  return useMemo(() => computeDailyStats(sessions, symptoms, date), [sessions, symptoms, date]);
}
