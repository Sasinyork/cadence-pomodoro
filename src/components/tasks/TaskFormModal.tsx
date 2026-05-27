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
      className="modal-enter w-full overflow-hidden"
      style={{
        maxWidth: 520, background: t.surface, border: `1px solid ${t.borderSoft}`,
        borderRadius: 16, boxShadow: t.shadowLift,
      }}
    >
      {/* header */}
      <div className="flex items-center justify-between" style={{ padding: '20px 24px', borderBottom: `1px solid ${t.borderSoft}` }}>
        <div>
          <div style={{ fontSize: 11, color: accent, fontWeight: 600, letterSpacing: 1, fontFamily: '"JetBrains Mono", monospace' }}>{isEdit ? 'EDIT TASK' : 'NEW TASK'}</div>
          <div id="task-modal-title" style={{ fontSize: 18, fontWeight: 600, color: t.text, letterSpacing: -0.3, marginTop: 2 }}>{isEdit ? 'Update your task' : 'Plan something worth focusing on'}</div>
        </div>
        <IconBtn theme={t} icon={<Icons.x size={16} />} accent={accent} onClick={onClose} label="Close modal" />
      </div>

      {/* body */}
      <div className="flex flex-col" style={{ padding: '20px 24px', gap: 16 }}>
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

        <div className="grid grid-cols-2 gap-3.5">
          {/* priority */}
          <div className="flex flex-col gap-1.5">
            <span style={{ fontSize: 12, fontWeight: 500, color: t.textMuted, letterSpacing: 0.2 }}>PRIORITY</span>
            <div className="flex gap-1.5">
              {(['high', 'medium', 'low'] as Priority[]).map((p) => {
                const c = PRIORITY_COLORS[p];
                const active = p === priority;
                return (
                  <button
                    key={p} type="button"
                    className="priority-btn flex-1 flex items-center gap-1.5 cursor-pointer"
                    onClick={() => setPriority(p)}
                    style={{
                      padding: '8px 10px', borderRadius: 8,
                      border: `1px solid ${active ? c : t.border}`,
                      background: active ? alpha(c, 0.08) : 'transparent',
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
          <div className="flex flex-col gap-1.5">
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
          <div className="flex items-center gap-[10px]" style={{
            padding: '12px 14px', borderRadius: 8,
            background: alpha(accent, 0.06), border: `1px solid ${alpha(accent, 0.18)}`,
          }}>
            <Icons.zap size={14} color={accent} style={{ marginTop: 2, flexShrink: 0 }} />
            <div className="flex-1" style={{ fontSize: 12.5, color: t.text, lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600 }}>Start now after creating?</span>{' '}
              <span style={{ color: t.textMuted }}>The timer will begin counting toward this task immediately.</span>
            </div>
            <Toggle theme={t} on={doStart} accent={accent} label="" onChange={setDoStart} />
          </div>
        )}

        {/* pomodoro preview */}
        <div className="flex items-center gap-2">
          <PomodoroDots done={0} total={total} accent={accent} theme={t} size={9} />
          <span style={{ fontSize: 12, color: t.textMuted }}>{total} pomodoros · est. {Math.ceil((total * 25) / 60) <= 1 ? `${total * 25}m` : `${Math.floor(total * 25 / 60)}h ${total * 25 % 60 > 0 ? `${total * 25 % 60}m` : ''}`}</span>
        </div>
      </div>

      {/* footer */}
      <div className="flex justify-end gap-2" style={{ padding: '14px 24px', borderTop: `1px solid ${t.borderSoft}`, background: t.surfaceAlt }}>
        <Btn theme={t} accent={accent} variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn theme={t} accent={accent} variant="primary" icon={isEdit ? undefined : <Icons.plus size={14} />} onClick={handleSubmit}>{isEdit ? 'Save changes' : 'Create task'}</Btn>
      </div>
    </div>
  );
}
