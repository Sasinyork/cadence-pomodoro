import { useState } from 'react';
import type { SurfaceTokens, Task, DeletedTask } from '../../types';
import { alpha, PRIORITY_COLORS } from '../../lib/tokens';
import { IconBtn, ConfirmDialog } from '../ui';
import { Icons } from '../icons';

interface HistoryPanelProps {
  theme: SurfaceTokens;
  accent: string;
  completedTasks: Task[];
  deletedTasks: DeletedTask[];
  onReopen: (id: string) => void;
  onRestore: (id: string) => void;
  onRemoveCompleted: (id: string) => void;
  onRemoveDeleted: (id: string) => void;
  onClearAll: () => void;
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

interface RowProps {
  task: Task | DeletedTask;
  type: 'completed' | 'deleted';
  theme: SurfaceTokens;
  accent: string;
  onPrimary: (id: string) => void;
  onRemove: (id: string) => void;
}

function HistoryRow({ task, type, theme: t, accent, onPrimary, onRemove }: RowProps) {
  const pColor = PRIORITY_COLORS[task.priority];
  const ts = type === 'deleted'
    ? (task as DeletedTask).deletedAt
    : (task.completedAt ?? task.createdAt);

  return (
    <div className="relative flex items-center gap-3" style={{
      padding: '10px 14px 10px 18px',
      borderRadius: 8,
      background: t.surface,
      border: `1px solid ${t.borderSoft}`,
    }}>
      <span className="sig-stripe" style={{ background: pColor, top: 8, bottom: 8 }} />

      <div className="flex-1 min-w-0">
        <div className="overflow-hidden text-ellipsis whitespace-nowrap" style={{
          fontSize: 13.5, fontWeight: 500, color: type === 'deleted' ? t.textMuted : t.text,
          textDecoration: type === 'completed' ? 'line-through' : 'none',
        }}>
          {task.title}
        </div>
        <div className="flex items-center gap-1.5 mt-[3px]">
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase',
            color: type === 'completed' ? '#10B981' : t.textFaint,
            fontFamily: '"JetBrains Mono", monospace',
          }}>
            {type === 'completed' ? 'Completed' : 'Deleted'}
          </span>
          <span style={{ fontSize: 10, color: t.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>
            · {relativeTime(ts)}
          </span>
          {task.tags.length > 0 && (
            <>
              <span style={{ fontSize: 10, color: t.textFaint }}>·</span>
              <span style={{ fontSize: 10, color: t.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>
                {task.tags.slice(0, 2).map(tag => `#${tag}`).join(' ')}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-0.5 shrink-0">
        <button
          onClick={() => onPrimary(task.id)}
          className="whitespace-nowrap cursor-pointer"
          style={{
            fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 6,
            border: `1px solid ${t.border}`, background: 'transparent',
            color: t.textMuted, fontFamily: 'inherit',
          }}
        >
          {type === 'completed' ? 'Reopen' : 'Restore'}
        </button>
        <IconBtn
          theme={t} icon={<Icons.x size={13} />} accent={accent}
          label="Remove from history"
          onClick={() => onRemove(task.id)}
          style={{ width: 26, height: 26, color: t.textFaint }}
        />
      </div>
    </div>
  );
}

export function HistoryPanel({ theme: t, accent, completedTasks, deletedTasks, onReopen, onRestore, onRemoveCompleted, onRemoveDeleted, onClearAll }: HistoryPanelProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const total = completedTasks.length + deletedTasks.length;
  if (total === 0) return null;

  const allItems: { task: Task | DeletedTask; type: 'completed' | 'deleted' }[] = [
    ...completedTasks.map(task => ({ task, type: 'completed' as const })),
    ...deletedTasks.map(task => ({ task, type: 'deleted' as const })),
  ].sort((a, b) => {
    const tsA = a.type === 'deleted' ? (a.task as DeletedTask).deletedAt : (a.task.completedAt ?? a.task.createdAt);
    const tsB = b.type === 'deleted' ? (b.task as DeletedTask).deletedAt : (b.task.completedAt ?? b.task.createdAt);
    return tsB - tsA;
  });

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-[10px]">
          <h2 className="m-0" style={{ fontSize: 15, fontWeight: 600, color: t.text, letterSpacing: -0.2 }}>History</h2>
          <span style={{ fontSize: 12, color: t.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>
            {completedTasks.length} completed · {deletedTasks.length} deleted
          </span>
        </div>
        <button
          onClick={() => setConfirmOpen(true)}
          className="cursor-pointer"
          style={{
            fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 6,
            border: `1px solid ${alpha('#EF4444', 0.25)}`, background: 'transparent',
            color: '#EF4444', fontFamily: 'inherit',
          }}
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        {allItems.map(({ task, type }) => (
          <HistoryRow
            key={`${type}-${task.id}`}
            task={task} type={type}
            theme={t} accent={accent}
            onPrimary={type === 'completed' ? onReopen : onRestore}
            onRemove={type === 'completed' ? onRemoveCompleted : onRemoveDeleted}
          />
        ))}
      </div>

      {confirmOpen && (
        <ConfirmDialog
          theme={t} accent={accent}
          title="Clear all history?"
          message="This will permanently remove all completed and deleted tasks. This cannot be undone."
          confirmLabel="Clear all"
          onConfirm={() => { setConfirmOpen(false); onClearAll(); }}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </section>
  );
}
