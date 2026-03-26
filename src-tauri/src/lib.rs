use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Session {
    pub id: String,
    pub start_time: u64,
    pub end_time: Option<u64>,
    pub activity_type: String,
    pub break_count: u32,
    pub skipped_break_count: u32,
    pub session_type: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SymptomEntry {
    pub id: String,
    pub timestamp: u64,
    pub left_eye_fatigue: u8,
    pub right_eye_fatigue: u8,
    pub left_head_pain: u8,
    pub right_head_pain: u8,
    pub neck_shoulder_tension: u8,
    pub tags: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DailyStats {
    pub date: String,
    pub total_focus_minutes: f64,
    pub breaks_completed: u32,
    pub breaks_skipped: u32,
    pub longest_session_minutes: f64,
    pub average_symptoms: AverageSymptoms,
    pub generated_insights: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AverageSymptoms {
    pub left_eye_fatigue: f64,
    pub right_eye_fatigue: f64,
    pub left_head_pain: f64,
    pub right_head_pain: f64,
    pub neck_shoulder_tension: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub focus_duration_minutes: u32,
    pub short_break_seconds: u32,
    pub long_break_minutes: u32,
    pub sessions_before_long_break: u32,
    pub dark_mode: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            focus_duration_minutes: 35,
            short_break_seconds: 60,
            long_break_minutes: 10,
            sessions_before_long_break: 4,
            dark_mode: true,
        }
    }
}

#[tauri::command]
fn get_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

#[tauri::command]
fn generate_id() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();
    let random: u32 = (now as u32).wrapping_mul(2654435761);
    format!("{:x}-{:08x}", now, random)
}

#[tauri::command]
fn compute_daily_stats(
    sessions: Vec<Session>,
    symptoms: Vec<SymptomEntry>,
    date: String,
) -> DailyStats {
    let total_focus_minutes: f64 = sessions
        .iter()
        .filter_map(|s| {
            s.end_time.map(|end| (end - s.start_time) as f64 / 60.0)
        })
        .sum();

    let breaks_completed: u32 = sessions.iter().map(|s| s.break_count).sum();
    let breaks_skipped: u32 = sessions.iter().map(|s| s.skipped_break_count).sum();

    let longest_session_minutes: f64 = sessions
        .iter()
        .filter_map(|s| {
            s.end_time.map(|end| (end - s.start_time) as f64 / 60.0)
        })
        .fold(0.0_f64, f64::max);

    let average_symptoms = if symptoms.is_empty() {
        AverageSymptoms {
            left_eye_fatigue: 0.0,
            right_eye_fatigue: 0.0,
            left_head_pain: 0.0,
            right_head_pain: 0.0,
            neck_shoulder_tension: 0.0,
        }
    } else {
        let count = symptoms.len() as f64;
        AverageSymptoms {
            left_eye_fatigue: symptoms.iter().map(|s| s.left_eye_fatigue as f64).sum::<f64>() / count,
            right_eye_fatigue: symptoms.iter().map(|s| s.right_eye_fatigue as f64).sum::<f64>() / count,
            left_head_pain: symptoms.iter().map(|s| s.left_head_pain as f64).sum::<f64>() / count,
            right_head_pain: symptoms.iter().map(|s| s.right_head_pain as f64).sum::<f64>() / count,
            neck_shoulder_tension: symptoms.iter().map(|s| s.neck_shoulder_tension as f64).sum::<f64>() / count,
        }
    };

    let generated_insights = generate_insights(&sessions, &symptoms, &average_symptoms, breaks_completed, breaks_skipped);

    DailyStats {
        date,
        total_focus_minutes,
        breaks_completed,
        breaks_skipped,
        longest_session_minutes,
        average_symptoms,
        generated_insights,
    }
}

fn generate_insights(
    sessions: &[Session],
    symptoms: &[SymptomEntry],
    avg: &AverageSymptoms,
    breaks_completed: u32,
    breaks_skipped: u32,
) -> Vec<String> {
    let mut insights = Vec::new();

    // Long session warning
    if sessions.iter().any(|s| {
        s.end_time
            .map(|end| (end - s.start_time) > 45 * 60)
            .unwrap_or(false)
    }) {
        insights.push("You had sessions longer than 45 minutes. Try shorter focus periods to reduce strain.".to_string());
    }

    // Skip warning
    if breaks_skipped >= 3 {
        insights.push("You skipped 3 or more breaks today. Completing breaks helps reduce fatigue.".to_string());
    }

    // Break benefit
    if breaks_completed > 0 && breaks_skipped == 0 {
        insights.push("Great job completing all your breaks today!".to_string());
    }

    // High fatigue
    let overall_fatigue = (avg.left_eye_fatigue + avg.right_eye_fatigue) / 2.0;
    if overall_fatigue > 6.0 {
        insights.push("Your eye fatigue was high today. Consider more frequent breaks.".to_string());
    }

    // Activity correlations
    let mut activity_counts: std::collections::HashMap<String, u32> = std::collections::HashMap::new();
    for session in sessions {
        *activity_counts.entry(session.activity_type.clone()).or_insert(0) += 1;
    }
    if let Some((top_activity, count)) = activity_counts.iter().max_by_key(|(_, c)| *c) {
        if *count >= 2 {
            insights.push(format!("{} was your most common activity today with {} sessions.", top_activity, count));
        }
    }

    // Tag correlations from symptoms
    if !symptoms.is_empty() {
        let mut tag_fatigue: std::collections::HashMap<String, (f64, u32)> = std::collections::HashMap::new();
        for symptom in symptoms {
            let fatigue = (symptom.left_eye_fatigue as f64 + symptom.right_eye_fatigue as f64) / 2.0;
            for tag in &symptom.tags {
                let entry = tag_fatigue.entry(tag.clone()).or_insert((0.0, 0));
                entry.0 += fatigue;
                entry.1 += 1;
            }
        }
        for (tag, (total, count)) in &tag_fatigue {
            let avg_fatigue = total / *count as f64;
            if avg_fatigue > 5.0 {
                insights.push(format!("Your fatigue tends to be higher when tagged with '{}'.", tag));
            }
        }
    }

    if insights.is_empty() {
        insights.push("Keep tracking to discover patterns in your eye strain.".to_string());
    }

    insights
}

#[tauri::command]
fn generate_multi_day_insights(
    daily_stats: Vec<DailyStats>,
) -> Vec<String> {
    let mut insights = Vec::new();

    if daily_stats.len() < 2 {
        return vec!["Track for more days to see trends.".to_string()];
    }

    // Check if symptoms are trending up
    let recent = &daily_stats[daily_stats.len().saturating_sub(3)..];
    if recent.len() >= 2 {
        let fatigue_trend: Vec<f64> = recent
            .iter()
            .map(|d| (d.average_symptoms.left_eye_fatigue + d.average_symptoms.right_eye_fatigue) / 2.0)
            .collect();

        let is_increasing = fatigue_trend.windows(2).all(|w| w[1] > w[0]);
        if is_increasing && fatigue_trend.last().unwrap_or(&0.0) > &3.0 {
            insights.push("Your fatigue has been trending upward. Consider shorter sessions.".to_string());
        }
    }

    // Compare days with/without skipped breaks
    let skip_days: Vec<&DailyStats> = daily_stats.iter().filter(|d| d.breaks_skipped > 0).collect();
    let no_skip_days: Vec<&DailyStats> = daily_stats.iter().filter(|d| d.breaks_skipped == 0 && d.breaks_completed > 0).collect();

    if !skip_days.is_empty() && !no_skip_days.is_empty() {
        let avg_skip_fatigue: f64 = skip_days.iter()
            .map(|d| (d.average_symptoms.left_eye_fatigue + d.average_symptoms.right_eye_fatigue) / 2.0)
            .sum::<f64>() / skip_days.len() as f64;
        let avg_no_skip_fatigue: f64 = no_skip_days.iter()
            .map(|d| (d.average_symptoms.left_eye_fatigue + d.average_symptoms.right_eye_fatigue) / 2.0)
            .sum::<f64>() / no_skip_days.len() as f64;

        if avg_skip_fatigue > avg_no_skip_fatigue + 1.0 {
            insights.push("Your symptoms were lower on days with more completed breaks.".to_string());
        }
    }

    if insights.is_empty() {
        insights.push("Keep tracking to discover more patterns.".to_string());
    }

    insights
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        );

    builder = builder.invoke_handler(tauri::generate_handler![
        get_timestamp,
        generate_id,
        compute_daily_stats,
        generate_multi_day_insights,
    ]);

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
