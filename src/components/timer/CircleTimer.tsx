import type { SurfaceTokens } from '../../types';

interface CircleTimerProps {
  theme: SurfaceTokens;
  accent: string;
  totalSecs?: number;
  elapsedSecs?: number;
  size?: number;
  strokeWidth?: number;
}

export function CircleTimer({ theme: t, accent, totalSecs = 1500, elapsedSecs = 0, size = 240, strokeWidth = 8 }: CircleTimerProps) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const progress = Math.min(elapsedSecs / totalSecs, 1);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.borderSoft} strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={accent}
        strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - progress)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
    </svg>
  );
}
