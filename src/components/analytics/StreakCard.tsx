import type { SurfaceTokens } from '../../types';
import { Icons } from '../icons';

interface StreakCardProps {
  theme: SurfaceTokens;
  days: number;
}

export function StreakCard({ theme: t, days }: StreakCardProps) {
  const flameColor = days >= 14 ? '#F59E0B' : days >= 7 ? '#F97316' : days >= 3 ? '#FB923C' : t.textFaint;
  const nextMilestone = days < 3 ? 3 : days < 7 ? 7 : days < 10 ? 10 : days < 14 ? 14 : days < 30 ? 30 : 60;
  const pct = Math.min((days / nextMilestone) * 100, 100);

  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.borderSoft}`,
      borderRadius: 12, padding: 18,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase' }}>Current streak</div>
        <Icons.fire size={16} color={flameColor} />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 38, fontWeight: 700, color: t.text, letterSpacing: -1.5, fontFamily: '"JetBrains Mono", monospace', lineHeight: 1 }}>{days}</span>
        <span style={{ fontSize: 14, color: t.textMuted, fontWeight: 500 }}>days</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: t.borderSoft, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: flameColor, borderRadius: 2, transition: 'width .3s' }} />
        </div>
        <span style={{ fontSize: 11, color: t.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>{nextMilestone - days}d to {nextMilestone}</span>
      </div>
    </div>
  );
}
