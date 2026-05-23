import type { SurfaceTokens, ThemeSource } from '../../types';
import { alpha } from '../../lib/tokens';
import { Icons } from '../icons';

type Screen = 'timer' | 'tasks' | 'analytics' | 'settings';

interface SidebarProps {
  theme: SurfaceTokens;
  accent: string;
  active: Screen;
  isDark: boolean;
  themeSource: ThemeSource;
  userEmail: string;
  isGuest: boolean;
  onNavigate: (screen: Screen) => void;
  onSetThemeSource: (source: ThemeSource) => void;
  onSignOut: () => void;
}

export function Sidebar({ theme: t, accent, active, isDark, themeSource, userEmail, isGuest, onNavigate, onSetThemeSource, onSignOut }: SidebarProps) {
  const items: { id: Screen; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'timer',     label: 'Timer',     icon: <Icons.timer size={18} /> },
    { id: 'tasks',     label: 'Tasks',     icon: <Icons.check size={18} />, badge: undefined },
    { id: 'analytics', label: 'Analytics', icon: <Icons.chart size={18} /> },
    { id: 'settings',  label: 'Settings',  icon: <Icons.gear size={18} /> },
  ];

  return (
    <aside style={{
      width: 240, flexShrink: 0, height: '100%',
      background: t.surface, borderRight: `1px solid ${t.borderSoft}`,
      padding: '24px 16px', display: 'flex', flexDirection: 'column',
    }}>
      {/* logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 24px', borderBottom: `1px solid ${t.borderSoft}`, marginBottom: 16 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', boxShadow: `0 4px 12px ${alpha(accent, 0.35)}`,
        }}>
          <Icons.timer size={18} color="#fff" strokeWidth={2.2} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.text, letterSpacing: -0.2 }}>Cadence</div>
          <div style={{ fontSize: 11, color: t.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>v1.0 · synced</div>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((it) => {
          const isActive = it.id === active;
          return (
            <button
              key={it.id}
              onClick={() => onNavigate(it.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '9px 12px', borderRadius: 8, position: 'relative',
                background: isActive ? alpha(accent, 0.1) : 'transparent',
                color: isActive ? accent : t.textMuted,
                fontWeight: isActive ? 600 : 500, fontSize: 13.5,
                cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              {isActive && (
                <span style={{
                  position: 'absolute', left: -16, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: 18, borderRadius: 2, background: accent,
                }} />
              )}
              {it.icon}
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.badge && (
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  padding: '1px 6px', borderRadius: 4,
                  background: isActive ? alpha(accent, 0.18) : t.surfaceAlt,
                  color: isActive ? accent : t.textMuted,
                  fontFamily: '"JetBrains Mono", monospace',
                }}>{it.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* secondary tray */}
      <div style={{ borderTop: `1px solid ${t.borderSoft}`, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Theme source selector */}
        <div style={{ padding: '6px 12px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            {themeSource === 'system'
              ? (isDark ? <Icons.moon size={14} color={t.textMuted} /> : <Icons.sun size={14} color={t.textMuted} />)
              : themeSource === 'dark'
              ? <Icons.moon size={14} color={t.textMuted} />
              : <Icons.sun size={14} color={t.textMuted} />}
            <span style={{ fontSize: 12, fontWeight: 500, color: t.textMuted }}>Theme</span>
          </div>
          <div style={{
            display: 'flex', background: t.surfaceAlt,
            border: `1px solid ${t.border}`, borderRadius: 8, padding: 2, gap: 2,
          }}>
            {([
              { value: 'system', label: 'System' },
              { value: 'light',  label: 'Light' },
              { value: 'dark',   label: 'Dark' },
            ] as { value: ThemeSource; label: string }[]).map((opt) => {
              const active = themeSource === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onSetThemeSource(opt.value)}
                  style={{
                    flex: 1, padding: '5px 4px', borderRadius: 6, fontSize: 11.5, fontWeight: active ? 600 : 500,
                    background: active ? t.surface : 'transparent',
                    color: active ? t.text : t.textFaint,
                    border: active ? `1px solid ${t.border}` : '1px solid transparent',
                    cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: active ? t.shadow : 'none',
                    transition: 'all .15s',
                  }}
                >{opt.label}</button>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: t.textFaint, fontSize: 12, marginTop: 4 }}>
          <Icons.help size={14} />
          <span>Keyboard shortcuts</span>
          <span style={{ marginLeft: 'auto', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, padding: '2px 5px', background: t.surfaceAlt, borderRadius: 4 }}>⌘K</span>
        </div>

        {/* User row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 12px', borderTop: `1px solid ${t.borderSoft}`, marginTop: 4,
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: 13, flexShrink: 0,
            background: isGuest ? t.surfaceAlt : alpha(accent, 0.15),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: isGuest ? t.textFaint : accent,
          }}>
            {isGuest ? '?' : userEmail.charAt(0).toUpperCase()}
          </div>
          <span style={{ flex: 1, fontSize: 11.5, color: t.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isGuest ? 'Guest — data not saved' : userEmail}
          </span>
          <button
            onClick={onSignOut}
            title={isGuest ? 'Sign in' : 'Sign out'}
            style={{
              flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, borderRadius: 5, color: t.textFaint, display: 'flex',
            }}
          >
            <Icons.logout size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
