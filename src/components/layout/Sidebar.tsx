import { useState } from 'react';
import type { SurfaceTokens, ThemeSource } from '../../types';
import { alpha } from '../../lib/tokens';
import { Icons } from '../icons';

const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
const shortcutBadge = isMac ? '⌘K' : 'Ctrl+K';

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
  onOpenShortcuts: () => void;
}

export function Sidebar({ theme: t, accent, active, isDark, themeSource, userEmail, isGuest, onNavigate, onSetThemeSource, onSignOut, onOpenShortcuts }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<Screen | null>(null);
  const [logoHovered, setLogoHovered] = useState(false);
  const [signOutHovered, setSignOutHovered] = useState(false);

  const items: { id: Screen; label: string; icon: React.ReactNode }[] = [
    { id: 'timer',     label: 'Timer',     icon: <Icons.timer size={18} /> },
    { id: 'tasks',     label: 'Tasks',     icon: <Icons.check size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <Icons.chart size={18} /> },
    { id: 'settings',  label: 'Settings',  icon: <Icons.gear size={18} /> },
  ];

  return (
    <aside
      className="sidebar-enter flex flex-col shrink-0 h-full"
      style={{
        width: 240,
        background: t.surface,
        borderRight: `1px solid ${t.borderSoft}`,
        padding: '24px 16px',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-[10px] cursor-default"
        style={{
          padding: '0 8px 24px',
          borderBottom: `1px solid ${t.borderSoft}`,
          marginBottom: 16,
        }}
        onMouseEnter={() => setLogoHovered(true)}
        onMouseLeave={() => setLogoHovered(false)}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff',
          boxShadow: logoHovered
            ? `0 6px 20px ${alpha(accent, 0.55)}, 0 2px 8px ${alpha(accent, 0.3)}`
            : `0 4px 12px ${alpha(accent, 0.35)}`,
          transform: logoHovered ? 'scale(1.08) rotate(-4deg)' : 'scale(1) rotate(0deg)',
          transition: 'box-shadow 0.2s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <Icons.logo size={18} color="#fff" strokeWidth={2.2} />
        </div>
        <div>
          <div style={{
            fontSize: 14, fontWeight: 700, letterSpacing: -0.2,
            color: t.text,
            transition: 'color 0.15s ease',
          }}>Cadence</div>
          <div style={{ fontSize: 11, color: t.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>v1.0 · synced</div>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {items.map((it, index) => {
          const isActive = it.id === active;
          const isHovered = hoveredItem === it.id;
          return (
            <button
              key={it.id}
              className="nav-item flex items-center gap-3 relative w-full text-left cursor-pointer"
              onClick={() => onNavigate(it.id)}
              onMouseEnter={() => setHoveredItem(it.id)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                padding: '9px 12px', borderRadius: 8,
                background: isActive
                  ? alpha(accent, 0.1)
                  : isHovered
                  ? alpha(accent, 0.05)
                  : 'transparent',
                color: isActive ? accent : isHovered ? t.text : t.textMuted,
                fontWeight: isActive ? 600 : 500, fontSize: 13.5,
                border: 'none', fontFamily: 'inherit',
                boxShadow: isActive ? `inset 0 0 0 1px ${alpha(accent, 0.15)}` : 'none',
                animationDelay: `${index * 0.04}s`,
                animationFillMode: 'both',
              }}
            >
              {isActive && (
                <span
                  className="nav-indicator absolute"
                  style={{
                    left: -16, top: '50%',
                    width: 3, height: 18, borderRadius: 2, background: accent,
                  }}
                />
              )}
              <span className="nav-icon flex shrink-0">
                {it.icon}
              </span>
              <span className="flex-1">{it.label}</span>
              {isActive && (
                <span className="sig-live-dot" style={{ background: accent, opacity: 0.6, boxShadow: `0 0 6px ${accent}` }} />
              )}
            </button>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* Secondary tray */}
      <div style={{ borderTop: `1px solid ${t.borderSoft}` }} className="pt-3 flex flex-col gap-1">
        {/* Theme source selector */}
        <div style={{ padding: '6px 12px 10px' }}>
          <div className="flex items-center gap-2 mb-2">
            {themeSource === 'system'
              ? (isDark ? <Icons.moon size={14} color={t.textMuted} /> : <Icons.sun size={14} color={t.textMuted} />)
              : themeSource === 'dark'
              ? <Icons.moon size={14} color={t.textMuted} />
              : <Icons.sun size={14} color={t.textMuted} />}
            <span style={{ fontSize: 12, fontWeight: 500, color: t.textMuted }}>Theme</span>
          </div>
          <div className="flex gap-0.5 p-0.5 rounded-lg" style={{
            background: t.surfaceAlt,
            border: `1px solid ${t.border}`,
          }}>
            {([
              { value: 'system', label: 'System' },
              { value: 'light',  label: 'Light' },
              { value: 'dark',   label: 'Dark' },
            ] as { value: ThemeSource; label: string }[]).map((opt) => {
              const isActiveTheme = themeSource === opt.value;
              return (
                <button
                  key={opt.value}
                  className="theme-btn flex-1 rounded-md cursor-pointer"
                  onClick={() => onSetThemeSource(opt.value)}
                  style={{
                    padding: '5px 4px', fontSize: 11.5, fontWeight: isActiveTheme ? 600 : 500,
                    background: isActiveTheme ? t.surface : 'transparent',
                    color: isActiveTheme ? t.text : t.textFaint,
                    border: isActiveTheme ? `1px solid ${t.border}` : '1px solid transparent',
                    fontFamily: 'inherit',
                    boxShadow: isActiveTheme ? t.shadow : 'none',
                  }}
                >{opt.label}</button>
              );
            })}
          </div>
        </div>

        <button
          onClick={onOpenShortcuts}
          className="theme-btn flex items-center gap-[10px] w-full text-left rounded-lg mt-1 cursor-pointer"
          style={{
            padding: '10px 12px', color: t.textFaint, fontSize: 12,
            background: 'none', border: 'none', fontFamily: 'inherit',
          }}
        >
          <Icons.help size={14} />
          <span>Keyboard shortcuts</span>
          <span style={{
            marginLeft: 'auto', fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
            padding: '2px 5px', background: t.surfaceAlt, borderRadius: 4,
          }}>{shortcutBadge}</span>
        </button>

        {/* User row */}
        <div
          className="flex items-center gap-2 mt-1"
          style={{
            padding: '10px 12px',
            borderTop: `1px solid ${t.borderSoft}`,
          }}
        >
          <div style={{
            width: 26, height: 26, borderRadius: 13, flexShrink: 0,
            background: isGuest ? t.surfaceAlt : alpha(accent, 0.15),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: isGuest ? t.textFaint : accent,
            transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease',
            transform: signOutHovered ? 'scale(1.08)' : 'scale(1)',
            boxShadow: signOutHovered ? `0 2px 8px ${alpha(accent, 0.3)}` : 'none',
          }}>
            {isGuest ? '?' : userEmail.charAt(0).toUpperCase()}
          </div>
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontSize: 11.5, color: t.textMuted }}>
            {isGuest ? 'Guest — data not saved' : userEmail}
          </span>
          <button
            className="signout-btn shrink-0 flex cursor-pointer"
            onClick={onSignOut}
            onMouseEnter={() => setSignOutHovered(true)}
            onMouseLeave={() => setSignOutHovered(false)}
            title={isGuest ? 'Sign in' : 'Sign out'}
            style={{
              background: signOutHovered ? alpha(accent, 0.08) : 'none',
              border: 'none',
              padding: 4, borderRadius: 5,
              color: signOutHovered ? accent : t.textFaint,
            }}
          >
            <Icons.logout size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
