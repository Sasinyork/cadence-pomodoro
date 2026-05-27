import type { SurfaceTokens } from '../../types';
import { alpha } from '../../lib/tokens';

interface HeatmapCardProps {
  theme: SurfaceTokens;
  accent: string;
  data: number[];
  totalSessions: number;
  totalFocusSecs: number;
}

function fmtDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function HeatmapCard({ theme: t, accent, data, totalSessions, totalFocusSecs }: HeatmapCardProps) {
  const max = Math.max(...data, 1);
  const grid = [...data, ...Array(35 - data.length).fill(0)];

  const colorFor = (v: number) => {
    if (v === 0) return t.borderSoft;
    if (v <= max * 0.25) return alpha(accent, 0.25);
    if (v <= max * 0.6)  return alpha(accent, 0.55);
    return accent;
  };

  return (
    <div className="flex flex-col" style={{
      background: t.surface, border: `1px solid ${t.borderSoft}`,
      borderRadius: 12, padding: 18, gap: 14,
    }}>
      <div className="flex items-center justify-between">
        <div>
          <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase' }}>Last 35 days</div>
          <div style={{ fontSize: 12, color: t.textFaint, marginTop: 3 }}>
            {totalSessions > 0
              ? `${totalSessions} sessions · ${fmtDuration(totalFocusSecs)} focused`
              : 'No sessions yet'}
          </div>
        </div>
        <span style={{ fontSize: 11, color: t.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>
          {new Date().toLocaleDateString('en-US', { month: 'short' })}
        </span>
      </div>
      <div className="flex gap-1.5">
        <div className="flex flex-col justify-between pt-[1px]">
          {['M', '', 'W', '', 'F', '', ''].map((d, i) => (
            <div key={i} style={{ fontSize: 9, color: t.textFaint, height: 14, fontFamily: '"JetBrains Mono", monospace' }}>{d}</div>
          ))}
        </div>
        <div className="flex gap-1 flex-1">
          {Array.from({ length: 5 }).map((_, w) => (
            <div key={w} className="flex flex-col gap-1 flex-1">
              {Array.from({ length: 7 }).map((_, d) => {
                const v = grid[w * 7 + d];
                return (
                  <div key={d} style={{
                    height: 14, borderRadius: 3,
                    background: colorFor(v as number),
                    border: v === 0 ? `1px solid ${t.borderSoft}` : 'none',
                  }} />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0" style={{ fontSize: 10, color: t.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>
        <span>less</span>
        {[t.borderSoft, alpha(accent, 0.25), alpha(accent, 0.55), accent].map((c, i) => (
          <span key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c, flexShrink: 0 }} />
        ))}
        <span>more</span>
      </div>
    </div>
  );
}
