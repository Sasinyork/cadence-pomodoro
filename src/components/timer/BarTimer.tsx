import type { SurfaceTokens } from '../../types';
import { alpha } from '../../lib/tokens';

interface BarTimerProps {
  theme: SurfaceTokens;
  accent: string;
  totalMins?: number;
  elapsedSecs?: number;
  size?: 'lg' | 'md' | 'sm';
  running?: boolean;
}

export function BarTimer({ theme: t, accent, totalMins = 25, elapsedSecs = 0, size = 'lg', running = false }: BarTimerProps) {
  const elapsedMins = Math.floor(elapsedSecs / 60);
  const subSec = elapsedSecs % 60;
  const heights: Record<string, number> = { lg: 80, md: 64, sm: 56 };
  const barWidths: Record<string, number> = { lg: 6, md: 5, sm: 4 };
  const gaps: Record<string, number> = { lg: 4, md: 3, sm: 3 };
  const H = heights[size], W = barWidths[size], G = gaps[size];

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0, height: H }}>
      {Array.from({ length: totalMins }).map((_, i) => {
        const filled = i < elapsedMins;
        const current = i === elapsedMins && running;
        const isGroupEnd = (i + 1) % 5 === 0 && i !== totalMins - 1;
        const partial = current ? subSec / 60 : 0;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-end', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: W, height: H }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: filled ? accent : t.borderSoft,
                borderRadius: W / 2,
                opacity: filled ? 1 : 0.7,
                transition: 'background .3s',
              }} />
              {current && (
                <div style={{
                  position: 'absolute', left: 0, right: 0, bottom: 0,
                  height: `${Math.max(partial * 100, 10)}%`,
                  background: accent, borderRadius: W / 2,
                  boxShadow: `0 0 12px ${alpha(accent, 0.5)}`,
                }} />
              )}
            </div>
            <div style={{ width: isGroupEnd ? G * 2.5 : G, flexShrink: 0 }} />
          </div>
        );
      })}
    </div>
  );
}
