import { useState } from 'react';
import type { SurfaceTokens, Priority, Task } from '../../types';
import { alpha, PRIORITY_COLORS } from '../../lib/tokens';
import { Btn, IconBtn, Input, Textarea, NumberStepper, PriorityDot, Toggle, PomodoroDots } from '../ui';
import { Icons } from '../icons';

interface TaskFormModalProps {
  theme: SurfaceTokens;
  accent: string;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'active' | 'done' | 'completed'>, startNow: boolean) => void;
  initialTask?: Task;
  startNow?: boolean;
}

export function TaskFormModal({ theme: t, accent, onClose, onSubmit, initialTask, startNow = false }: TaskFormModalProps) {
  const isEdit = Boolean(initialTask);
  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [desc, setDesc] = useState(initialTask?.desc ?? '');
  const [priority, setPriority] = useState<Priority>(initialTask?.priority ?? 'medium');
  const [total, setTotal] = useState(initialTask?.total ?? 4);
  const [tags, setTags] = useState(initialTask?.tags.join(', ') ?? '');
  const [doStart, setDoStart] = useState(startNow);
  const [titleError, setTitleError] = useState('');

  function handleSubmit() {
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }
    onSubmit({
      title: title.trim(),
      desc: desc.trim(),
      priority,
      total,
      tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
    }, doStart);
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      className="modal-enter"
      style={{
        width: '100%', maxWidth: 520, background: t.surface, border: `1px solid ${t.borderSoft}`,
        borderRadius: 16, boxShadow: t.shadowLift, overflow: 'hidden',
      }}
    >
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${t.borderSoft}` }}>
        <div>
          <div style={{ fontSize: 11, color: accent, fontWeight: 600, letterSpacing: 1, fontFamily: '"JetBrains Mono", monospace' }}>{isEdit ? 'EDIT TASK' : 'NEW TASK'}</div>
          <div id="task-modal-title" style={{ fontSize: 18, fontWeight: 600, color: t.text, letterSpacing: -0.3, marginTop: 2 }}>{isEdit ? 'Update your task' : 'Plan something worth focusing on'}</div>
        </div>
        <IconBtn theme={t} icon={<Icons.x size={16} />} accent={accent} onClick={onClose} label="Close modal" />
      </div>

      {/* body */}
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          theme={t} accent={accent} label="TITLE" placeholder="What needs doing?"
          value={title} onChange={(e) => { setTitle(e.target.value); setTitleError(''); }}
          error={titleError} autoFocus
        />
        <Textarea
          theme={t} label="DESCRIPTION (OPTIONAL)"
          placeholder="Any notes, links, or context..."
          value={desc} onChange={setDesc}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* priority */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: t.textMuted, letterSpacing: 0.2 }}>PRIORITY</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['high', 'medium', 'low'] as Priority[]).map((p) => {
                const c = PRIORITY_COLORS[p];
                const active = p === priority;
                return (
                  <button
                    key={p} type="button"
                    className="priority-btn"
                    onClick={() => setPriority(p)}
                    style={{
                      flex: 1, padding: '8px 10px', borderRadius: 8,
                      border: `1px solid ${active ? c : t.border}`,
                      background: active ? alpha(c, 0.08) : 'transparent',
                      display: 'flex', alignItems: 'center', gap: 6,
                      cursor: 'pointer',
                    }}
                  >
                    <PriorityDot priority={p} size={7} />
                    <span style={{ fontSize: 12, fontWeight: active ? 600 : 500, color: active ? c : t.text, textTransform: 'capitalize' }}>{p}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* pomodoros */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: t.textMuted, letterSpacing: 0.2 }}>EST. POMODOROS</span>
            <NumberStepper theme={t} accent={accent} value={total} unit="× 25m" width={140} min={1} max={20} onChange={setTotal} />
          </div>
        </div>

        <Input
          theme={t} accent={accent} label="TAGS"
          placeholder="design, urgent, client"
          value={tags} onChange={(e) => setTags(e.target.value)}
        />

        {/* start now toggle — only for new tasks */}
        {!isEdit && (
          <div style={{
            padding: '12px 14px', borderRadius: 8,
            background: alpha(accent, 0.06), border: `1px solid ${alpha(accent, 0.18)}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Icons.zap size={14} color={accent} style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ fontSize: 12.5, color: t.text, lineHeight: 1.5, flex: 1 }}>
              <span style={{ fontWeight: 600 }}>Start now after creating?</span>{' '}
              <span style={{ color: t.textMuted }}>The timer will begin counting toward this task immediately.</span>
            </div>
            <Toggle theme={t} on={doStart} accent={accent} label="" onChange={setDoStart} />
          </div>
        )}

        {/* pomodoro preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PomodoroDots done={0} total={total} accent={accent} theme={t} size={9} />
          <span style={{ fontSize: 12, color: t.textMuted }}>{total} pomodoros · est. {Math.ceil((total * 25) / 60) <= 1 ? `${total * 25}m` : `${Math.floor(total * 25 / 60)}h ${total * 25 % 60 > 0 ? `${total * 25 % 60}m` : ''}`}</span>
        </div>
      </div>

      {/* footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '14px 24px', borderTop: `1px solid ${t.borderSoft}`, background: t.surfaceAlt }}>
        <Btn theme={t} accent={accent} variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn theme={t} accent={accent} variant="primary" icon={isEdit ? undefined : <Icons.plus size={14} />} onClick={handleSubmit}>{isEdit ? 'Save changes' : 'Create task'}</Btn>
      </div>
    </div>
  );
}
