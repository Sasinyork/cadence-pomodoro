import type { SurfaceTokens } from '../../types';
import { alpha } from '../../lib/tokens';
import { Icons } from '../icons';

type Screen = 'timer' | 'tasks' | 'analytics' | 'settings';

interface MobileTabBarProps {
  theme: SurfaceTokens;
  accent: string;
  active: Screen;
  onNavigate: (s: Screen) => void;
}

export function MobileTabBar({ theme: t, accent, active, onNavigate }: MobileTabBarProps) {
  const tabs: { id: Screen; label: string; icon: React.ReactNode }[] = [
    { id: 'timer',     label: 'Timer',    icon: <Icons.timer size={20} /> },
    { id: 'tasks',     label: 'Tasks',    icon: <Icons.check size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <Icons.chart size={20} /> },
    { id: 'settings',  label: 'Settings', icon: <Icons.gear size={20} /> },
  ];

  return (
    <nav className="shrink-0 flex items-center justify-around" style={{
      height: 78, padding: '8px 16px 24px',
      borderTop: `1px solid ${t.borderSoft}`,
      background: t.surface,
    }}>
      {tabs.map((it) => {
        const isActive = it.id === active;
        return (
          <button
            key={it.id}
            onClick={() => onNavigate(it.id)}
            className="relative flex flex-col items-center gap-[3px] cursor-pointer"
            style={{
              color: isActive ? accent : t.textFaint,
              padding: '4px 16px',
              border: 'none', background: 'transparent', fontFamily: 'inherit',
            }}
          >
            {isActive && (
              <span className="absolute" style={{
                top: -8, left: '50%', transform: 'translateX(-50%)',
                width: 24, height: 3, borderRadius: 2, background: accent,
              }} />
            )}
            {it.icon}
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500, letterSpacing: 0.2 }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function MobileStatusBar({ theme: t }: { theme: SurfaceTokens }) {
  return (
    <div className="flex items-start justify-between shrink-0" style={{
      height: 47, padding: '14px 24px 0',
      fontSize: 14, fontWeight: 600, color: t.text,
    }}>
      <span style={{ fontFamily: '-apple-system, sans-serif' }}>
        {new Date().getHours()}:{String(new Date().getMinutes()).padStart(2,'0')}
      </span>
      <div className="flex items-center gap-[5px]">
        <svg width="17" height="11" viewBox="0 0 17 11" fill={t.text}>
          <rect x="0" y="6" width="3" height="5" rx="0.5"/><rect x="4.5" y="4" width="3" height="7" rx="0.5"/>
          <rect x="9" y="2" width="3" height="9" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/>
        </svg>
        <div style={{ width: 22, height: 11, border: `1px solid ${alpha(t.text, 0.5)}`, borderRadius: 2.5, padding: 1, boxSizing: 'border-box' }}>
          <div style={{ width: '85%', height: '100%', background: t.text, borderRadius: 1, opacity: 0.5 }} />
        </div>
      </div>
    </div>
  );
}
