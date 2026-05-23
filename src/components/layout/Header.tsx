import type { ReactNode } from 'react';
import type { SurfaceTokens, Mode } from '../../types';
import { alpha, MODES } from '../../lib/tokens';

interface HeaderProps {
  theme: SurfaceTokens;
  accent: string;
  mode: Mode;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export function Header({ theme: t, accent, mode, title, subtitle, right }: HeaderProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 28px', borderBottom: `1px solid ${t.borderSoft}`, flexShrink: 0,
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 9px', borderRadius: 999,
            background: alpha(accent, 0.12), color: accent,
            fontSize: 10, fontWeight: 600, letterSpacing: 1, fontFamily: '"JetBrains Mono", monospace',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: accent }} />
            {MODES[mode]?.short ?? 'POMODORO'}
          </span>
          <span style={{ fontSize: 12, color: t.textFaint }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <h1 style={{ margin: 0, marginTop: 6, fontSize: 22, fontWeight: 600, color: t.text, letterSpacing: -0.4 }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}
