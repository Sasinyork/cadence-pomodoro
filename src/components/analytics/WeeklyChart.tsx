import type { SurfaceTokens } from "../../types";
import { alpha } from "../../lib/tokens";
import type { WeekDay } from "../../hooks/useAnalytics";

interface WeeklyChartProps {
  theme: SurfaceTokens;
  accent: string;
  data: WeekDay[];
  totalSecs: number;
}

function fmtDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function WeeklyChart({ theme: t, accent, data, totalSecs }: WeeklyChartProps) {
  const max = Math.max(...data.map((d) => d.mins), 1);
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.borderSoft}`,
      borderRadius: 12,
      padding: "20px 22px",
    }}>
      <div className="flex items-center justify-between mb-[18px]">
        <div>
          <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase" }}>
            This week
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: t.text, marginTop: 4, fontFamily: '"JetBrains Mono", monospace', letterSpacing: -0.5 }}>
            {totalSecs > 0 ? fmtDuration(totalSecs) : "—"}
          </div>
          <div style={{ fontSize: 12, color: t.textFaint, marginTop: 2 }}>
            {data.reduce((s, d) => s + d.sessions, 0)} sessions
          </div>
        </div>
      </div>
      <div className="flex items-end gap-3" style={{ height: 140 }}>
        {data.map((d, i) => {
          const h = Math.max(4, (d.mins / max) * 130);
          const isToday = i === todayIdx;
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="flex-1 w-full flex items-end">
                <div
                  className="w-full relative"
                  style={{
                    height: h,
                    borderRadius: "6px 6px 0 0",
                    background: isToday ? accent : alpha(accent, 0.25),
                  }}
                >
                  {isToday && d.mins > 0 && (
                    <div
                      className="absolute whitespace-nowrap"
                      style={{
                        top: -22,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: 10,
                        fontFamily: '"JetBrains Mono", monospace',
                        fontWeight: 600,
                        color: accent,
                      }}
                    >
                      {fmtDuration(d.mins * 60)}
                    </div>
                  )}
                </div>
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: isToday ? t.text : t.textFaint,
                  fontWeight: isToday ? 600 : 500,
                  letterSpacing: 0.4,
                }}
              >
                {d.day.toUpperCase()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
