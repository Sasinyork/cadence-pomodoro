import type { SurfaceTokens, Task } from '../../types';
import { alpha, PRIORITY_COLORS } from '../../lib/tokens';
import { TagPill, PomodoroDots, IconBtn } from '../ui';
import { Icons } from '../icons';

interface TaskCardProps {
  task: Task;
  theme: SurfaceTokens;
  accent: string;
  dense?: boolean;
  onToggleComplete?: (id: string) => void;
  onSetActive?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TaskCard({ task, theme: t, accent, dense = false, onToggleComplete, onSetActive, onDelete }: TaskCardProps) {
  const isActive = task.active;
  const pColor = PRIORITY_COLORS[task.priority];
  return (
    <div
      style={{
        background: isActive ? alpha(accent, 0.04) : t.surface,
        border: `1px solid ${isActive ? alpha(accent, 0.3) : t.borderSoft}`,
        borderRadius: 12, padding: dense ? '14px 16px' : '16px 18px',
        position: 'relative', display: 'flex', flexDirection: 'column', gap: 10,
        boxShadow: isActive ? `0 1px 3px ${alpha(accent, 0.08)}` : 'none',
        opacity: task.completed ? 0.6 : 1,
        transition: 'all .2s ease',
      }}
    >
      {/* priority stripe */}
      <span style={{
        position: 'absolute', left: 0, top: 12, bottom: 12,
        width: 3, borderRadius: '0 2px 2px 0', background: pColor,
      }} />

      {/* top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <button
          onClick={() => onToggleComplete?.(task.id)}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
          style={{
            width: 18, height: 18, borderRadius: 9, flexShrink: 0, marginTop: 1,
            border: `1.5px solid ${task.completed ? accent : t.border}`,
            background: task.completed ? accent : 'transparent',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: 0,
          }}
        >
          {task.completed && (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M2 5L4 7L8 3" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14.5, fontWeight: 600, color: t.text,
              letterSpacing: -0.1, lineHeight: 1.35,
              textDecoration: task.completed ? 'line-through' : 'none',
            }}
            onClick={() => !task.completed && onSetActive?.(task.id)}
          >
            {task.title}
          </div>
          {task.desc && !dense && (
            <div style={{ fontSize: 12.5, color: t.textMuted, marginTop: 4, lineHeight: 1.5 }}>{task.desc}</div>
          )}
        </div>
        <IconBtn
          theme={t} icon={<Icons.trash size={14} />} accent={accent}
          label={`Delete "${task.title}"`}
          onClick={() => onDelete?.(task.id)}
          style={{ width: 26, height: 26, marginTop: -2, marginRight: -6, color: t.textFaint }}
        />
      </div>

      {/* meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 30 }}>
        <PomodoroDots done={task.done} total={task.total} accent={accent} theme={t} size={9} />
        <span style={{ fontSize: 11.5, color: t.textMuted, fontFamily: '"JetBrains Mono", monospace', fontWeight: 500 }}>
          {task.done}/{task.total}
        </span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 4 }}>
          {task.tags.slice(0, 3).map((tag) => <TagPill key={tag} theme={t} label={tag} />)}
        </div>
      </div>

      {isActive && (
        <div style={{
          position: 'absolute', top: 12, right: 38,
          fontSize: 9.5, fontFamily: '"JetBrains Mono", monospace', fontWeight: 600,
          letterSpacing: 1, color: accent,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: 2.5, background: accent,
            animation: 'pulse 1.6s ease-in-out infinite',
          }} />
          ACTIVE
        </div>
      )}
    </div>
  );
}
