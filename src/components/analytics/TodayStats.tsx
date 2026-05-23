import type { SurfaceTokens } from '../../types';

interface TodayStatsProps {
  theme: SurfaceTokens;
  accent: string;
  sessions: number;
}

export function TodayStats({ theme: t, sessions }: TodayStatsProps) {
  const focusedMins = sessions * 25;
  const h = Math.floor(focusedMins / 60);
  const m = focusedMins % 60;
  const stats = [
    { label: 'Pomodoros', value: String(sessions), sub: '+1 vs avg', up: true },
    { label: 'Focused', value: h > 0 ? `${h}h ${m}m` : `${m}m`, sub: 'goal 2h', up: false },
  ];
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.borderSoft}`,
      borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase' }}>Today</div>
        <span style={{ fontSize: 11, color: t.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>
          {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {stats.map((s) => (
          <div key={s.label}>
            <div style={{ fontSize: 10, color: t.textFaint, fontWeight: 500, letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: t.text, letterSpacing: -0.5, fontFamily: '"JetBrains Mono", monospace', lineHeight: 1.1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: s.up ? '#10B981' : t.textMuted, marginTop: 3, fontWeight: 500 }}>
              {s.up ? '↑ ' : '· '}{s.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
