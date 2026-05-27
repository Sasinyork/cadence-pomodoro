import type { SurfaceTokens } from '../../types';

interface TodayStatsProps {
  theme: SurfaceTokens;
  accent: string;
  sessions: number;
  focusedMins: number;
  avgDailySessions: number;
  dailyGoalMins: number;
}

function formatMins(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function TodayStats({ theme: t, accent, sessions, focusedMins, avgDailySessions, dailyGoalMins }: TodayStatsProps) {
  const h = Math.floor(focusedMins / 60);
  const m = focusedMins % 60;
  const focusedLabel = h > 0 ? `${h}h ${m}m` : `${m}m`;

  const diff = sessions - avgDailySessions;
  const vsAvg = avgDailySessions === 0
    ? { text: 'no history yet', up: null }
    : diff > 0
    ? { text: `↑ +${diff} vs avg`, up: true }
    : diff < 0
    ? { text: `↓ ${Math.abs(diff)} vs avg`, up: false }
    : { text: '= on avg', up: null };

  const goalReached = focusedMins >= dailyGoalMins;
  const goalSub = goalReached
    ? { text: '✓ goal reached', color: accent }
    : { text: `goal ${formatMins(dailyGoalMins)}`, color: t.textMuted };

  return (
    <div className="flex flex-col" style={{
      background: t.surface, border: `1px solid ${t.borderSoft}`,
      borderRadius: 12, padding: 18, gap: 14,
    }}>
      <div className="flex items-center justify-between">
        <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase' }}>Today</div>
        <span style={{ fontSize: 11, color: t.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>
          {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div style={{ fontSize: 10, color: t.textFaint, fontWeight: 500, letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 3 }}>Pomodoros</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: t.text, letterSpacing: -0.5, fontFamily: '"JetBrains Mono", monospace', lineHeight: 1.1 }}>{sessions}</div>
          <div style={{ fontSize: 11, color: vsAvg.up === true ? '#10B981' : vsAvg.up === false ? '#EF4444' : t.textMuted, marginTop: 3, fontWeight: 500 }}>
            {vsAvg.text}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: t.textFaint, fontWeight: 500, letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 3 }}>Focused</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: t.text, letterSpacing: -0.5, fontFamily: '"JetBrains Mono", monospace', lineHeight: 1.1 }}>{focusedLabel}</div>
          <div style={{ fontSize: 11, color: goalSub.color, marginTop: 3, fontWeight: 500 }}>
            {goalSub.text}
          </div>
        </div>
      </div>
    </div>
  );
}
