import type { SurfaceTokens } from '../types';
import { alpha } from '../lib/tokens';
import { useApp } from '../context/AppContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { WeeklyChart } from '../components/analytics/WeeklyChart';
import { HeatmapCard } from '../components/analytics/HeatmapCard';

interface AnalyticsScreenProps {
  theme: SurfaceTokens;
  accent: string;
}

function fmtDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function AnalyticsScreen({ theme: t, accent }: AnalyticsScreenProps) {
  const { state } = useApp();
  const a = useAnalytics(state.tasks, state.todaySessions);

  const hourMax = Math.max(...a.hourDistribution, 1);

  const peakHour = a.hourDistribution.indexOf(Math.max(...a.hourDistribution));
  const peakLabel = peakHour === 0 ? '12 AM'
    : peakHour < 12 ? `${peakHour} AM`
    : peakHour === 12 ? '12 PM'
    : `${peakHour - 12} PM`;

  const kpis = [
    { label: 'Total focus time', value: a.totalFocusSecs > 0 ? fmtDuration(a.totalFocusSecs) : '—' },
    { label: 'Sessions today',   value: String(a.todaySessions) },
    { label: 'Current streak',   value: a.streak > 0 ? `${a.streak}d` : '—' },
    { label: 'Avg session',      value: a.avgSessionSecs > 0 ? fmtDuration(a.avgSessionSecs) : '—' },
  ];

  return (
    <main className="screen-enter" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: `1px solid ${t.borderSoft}`, flexShrink: 0 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: t.text, letterSpacing: -0.4 }}>Analytics</h1>
          <div style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>Patterns in how you focus, day to day</div>
        </div>
        {a.loading && (
          <div style={{ fontSize: 12, color: t.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>Loading…</div>
        )}
      </div>

      <div style={{ flex: 1, padding: 28, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {kpis.map((k, i) => (
            <div
              key={k.label}
              className="kpi-card card-enter"
              style={{
                background: t.surface, border: `1px solid ${t.borderSoft}`,
                borderRadius: 12, padding: 18,
                animationDelay: `${i * 0.06}s`, animationFillMode: 'both',
              }}
            >
              <div style={{ fontSize: 10.5, color: t.textMuted, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>{k.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: t.text, fontFamily: '"JetBrains Mono", monospace', letterSpacing: -1, lineHeight: 1 }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
          <div className="card-enter" style={{ animationDelay: '0.12s', animationFillMode: 'both' }}>
            <WeeklyChart theme={t} accent={accent} data={a.weekFocus} totalSecs={a.weekTotalSecs} />
          </div>
          <div className="card-enter" style={{ animationDelay: '0.16s', animationFillMode: 'both' }}>
            <HeatmapCard theme={t} accent={accent} data={a.heatmap} totalSessions={a.heatmapTotal} totalFocusSecs={a.totalFocusSecs} />
          </div>
        </div>

        {/* Hour distribution + tag breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
          <div
            className="card-enter"
            style={{
              background: t.surface, border: `1px solid ${t.borderSoft}`,
              borderRadius: 12, padding: '20px 22px',
              animationDelay: '0.2s', animationFillMode: 'both',
            }}
          >
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase' }}>Best hours</div>
              <div style={{ fontSize: 13, color: t.textFaint, marginTop: 3 }}>
                {a.hourDistribution.some((v) => v > 0)
                  ? `You focus most around ${peakLabel}`
                  : 'Complete sessions to see your peak hours'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 100 }}>
              {a.hourDistribution.map((v, i) => (
                <div
                  key={i}
                  className="bar-grow"
                  style={{
                    flex: 1,
                    height: Math.max(2, (v / hourMax) * 90),
                    background: v >= hourMax * 0.75 ? accent : alpha(accent, 0.3 + (v / hourMax) * 0.4),
                    borderRadius: '2px 2px 0 0',
                    animationDelay: `${0.2 + i * 0.012}s`,
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', marginTop: 8, fontSize: 10, color: t.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>
              {['12a', '6a', '12p', '6p'].map((l, i) => (
                <div key={l} style={{ flex: 1, textAlign: i === 0 ? 'left' : 'center' }}>{l}</div>
              ))}
            </div>
          </div>

          <div
            className="card-enter"
            style={{
              background: t.surface, border: `1px solid ${t.borderSoft}`,
              borderRadius: 12, padding: '20px 22px',
              animationDelay: '0.24s', animationFillMode: 'both',
            }}
          >
            <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 16 }}>Time by tag</div>
            {a.timeByTag.length > 0 ? a.timeByTag.map((row, i) => (
              <div key={row.tag} style={{ marginBottom: i === a.timeByTag.length - 1 ? 0 : 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12.5, color: t.text, fontWeight: 500, fontFamily: '"JetBrains Mono", monospace' }}>#{row.tag}</span>
                  <span style={{ fontSize: 11.5, color: t.textMuted, fontFamily: '"JetBrains Mono", monospace' }}>
                    {row.mins >= 60 ? `${Math.floor(row.mins / 60)}h ${row.mins % 60}m` : `${row.mins}m`} · {row.pct}%
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: t.borderSoft, overflow: 'hidden' }}>
                  <div style={{
                    width: `${row.pct}%`, height: '100%',
                    background: alpha(accent, 0.3 + (row.pct / 100) * 0.7),
                    borderRadius: 3,
                    transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
                  }} />
                </div>
              </div>
            )) : (
              <div style={{ fontSize: 13, color: t.textFaint, marginTop: 8 }}>
                Tag your tasks and complete sessions to see time by tag.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
