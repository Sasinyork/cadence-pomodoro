import type { SurfaceTokens } from '../../types';
import { Icons } from '../icons';

const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
const mod = isMac ? '⌘' : 'Ctrl';

interface ShortcutRowProps {
  keys: string[];
  label: string;
  theme: SurfaceTokens;
}

function ShortcutRow({ keys, label, theme: t }: ShortcutRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0' }}>
      <span style={{ fontSize: 13, color: t.textMuted }}>{label}</span>
      <div style={{ display: 'flex', gap: 4 }}>
        {keys.map((k) => (
          <kbd
            key={k}
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 11, fontWeight: 600,
              padding: '2px 7px', borderRadius: 5,
              background: t.surfaceAlt, color: t.text,
              border: `1px solid ${t.border}`,
              boxShadow: `0 1px 0 ${t.border}`,
            }}
          >{k}</kbd>
        ))}
      </div>
    </div>
  );
}

interface Section {
  title: string;
  shortcuts: { keys: string[]; label: string }[];
}

function getSections(): Section[] {
  return [
    {
      title: 'Timer',
      shortcuts: [
        { keys: ['Space'], label: 'Start / Pause' },
        { keys: ['R'],     label: 'Reset timer' },
        { keys: ['S'],     label: 'Skip session' },
      ],
    },
    {
      title: 'Navigation',
      shortcuts: [
        { keys: [mod, '⇧', '1'], label: 'Timer' },
        { keys: [mod, '⇧', '2'], label: 'Tasks' },
        { keys: [mod, '⇧', '3'], label: 'Analytics' },
        { keys: [mod, '⇧', '4'], label: 'Settings' },
      ],
    },
    {
      title: 'General',
      shortcuts: [
        { keys: [mod, 'K'], label: 'Open this panel' },
        { keys: ['Esc'],    label: 'Close panel' },
      ],
    },
  ];
}

interface KeyboardShortcutsModalProps {
  theme: SurfaceTokens;
  accent: string;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ theme: t, accent, onClose }: KeyboardShortcutsModalProps) {
  const sections = getSections();

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(10, 10, 10, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50,
        animation: 'fadeIn 0.2s ease both',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: t.surface, borderRadius: 16,
        border: `1px solid ${t.borderSoft}`,
        boxShadow: t.shadow,
        width: 400, maxWidth: 'calc(100vw - 48px)',
        padding: '24px 28px',
        animation: 'fadeIn 0.18s ease both',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: -0.3 }}>Keyboard shortcuts</div>
            <div style={{ fontSize: 12, color: t.textFaint, marginTop: 2 }}>
              {isMac ? 'macOS' : 'Windows / Linux'} · Quick actions from anywhere
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: t.textFaint, padding: 4, borderRadius: 6,
              display: 'flex',
            }}
          >
            <Icons.x size={16} />
          </button>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {sections.map((section) => (
            <div key={section.title}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                color: accent, marginBottom: 4,
              }}>{section.title}</div>
              <div style={{ borderTop: `1px solid ${t.borderSoft}`, paddingTop: 4 }}>
                {section.shortcuts.map((s) => (
                  <ShortcutRow key={s.label} keys={s.keys} label={s.label} theme={t} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div style={{
          marginTop: 20, paddingTop: 16, borderTop: `1px solid ${t.borderSoft}`,
          fontSize: 11, color: t.textFaint, textAlign: 'center',
        }}>
          Shortcuts are disabled when typing in an input
        </div>
      </div>
    </div>
  );
}
