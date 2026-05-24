import { useState } from 'react';
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
  onEdit?: (id: string) => void;
}

export function TaskCard({ task, theme: t, accent, dense = false, onToggleComplete, onSetActive, onDelete, onEdit }: TaskCardProps) {
  const [hovered, setHovered] = useState(false);
  const isActive = task.active;
  const pColor = PRIORITY_COLORS[task.priority];

  return (
    <div
      className="task-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !task.completed && onSetActive?.(task.id)}
      style={{
        background: isActive ? alpha(accent, 0.04) : t.surface,
        border: `1px solid ${isActive ? alpha(accent, 0.3) : hovered ? t.border : t.borderSoft}`,
        borderRadius: 12, padding: dense ? '14px 16px' : '16px 18px',
        position: 'relative', display: 'flex', flexDirection: 'column', gap: 10,
        boxShadow: isActive
          ? `0 1px 3px ${alpha(accent, 0.08)}`
          : hovered
          ? `0 8px 22px rgba(0,0,0,0.09)`
          : 'none',
        opacity: task.completed ? 0.6 : 1,
        transition: 'all .2s ease',
        cursor: task.completed ? 'default' : 'pointer',
      }}
    >
      {/* priority stripe */}
      <span className="sig-stripe" style={{ background: pColor }} />

      {/* top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <button
          className="check-btn"
          onClick={(e) => { e.stopPropagation(); onToggleComplete?.(task.id); }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div
              style={{
                fontSize: 14.5, fontWeight: 600, color: t.text,
                letterSpacing: -0.1, lineHeight: 1.35,
                textDecoration: task.completed ? 'line-through' : 'none',
                transition: 'color 0.15s ease',
              }}
            >
              {task.title}
            </div>
            {isActive && (
              <div className="sig-status-label" style={{ color: accent, flexShrink: 0 }}>
                <span className="sig-live-dot" style={{ background: accent }} />
                ACTIVE
              </div>
            )}
          </div>
          {task.desc && !dense && (
            <div style={{ fontSize: 12.5, color: t.textMuted, marginTop: 4, lineHeight: 1.5 }}>{task.desc}</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 2, marginTop: -2, marginRight: -6 }} onClick={(e) => e.stopPropagation()}>
          <IconBtn
            theme={t} icon={<Icons.edit size={14} />} accent={accent}
            label={`Edit "${task.title}"`}
            onClick={() => onEdit?.(task.id)}
            style={{ width: 26, height: 26, color: t.textFaint }}
          />
          <IconBtn
            theme={t} icon={<Icons.trash size={14} />} accent={accent}
            label={`Delete "${task.title}"`}
            onClick={() => onDelete?.(task.id)}
            style={{ width: 26, height: 26, color: t.textFaint }}
          />
        </div>
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

    </div>
  );
}
