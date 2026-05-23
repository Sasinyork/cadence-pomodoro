import { useState } from 'react';
import type { SurfaceTokens, Task } from '../types';
import { alpha } from '../lib/tokens';
import { Btn } from '../components/ui';
import { Icons } from '../components/icons';
import { TimerCard } from '../components/timer/TimerCard';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { StreakCard } from '../components/analytics/StreakCard';
import { TodayStats } from '../components/analytics/TodayStats';
import { HeatmapCard } from '../components/analytics/HeatmapCard';
import { PriorityDot } from '../components/ui';
import { useApp } from '../context/AppContext';
import { useAnalytics } from '../hooks/useAnalytics';

export function DashboardScreen({ theme: t, accent }: { theme: SurfaceTokens; accent: string }) {
  const { state, dispatch, startTimer, pauseTimer, resetTimer, skipSession } = useApp();
  const analytics = useAnalytics(state.tasks, state.todaySessions);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'today' | 'high'>('all');

  const activeTask = state.tasks.find((t) => t.id === state.activeTaskId) ?? null;

  const totalSecs = (() => {
    if (state.mode === 'focus') return state.settings.pomodoroMins * 60;
    if (state.mode === 'short') return state.settings.shortBreakMins * 60;
    return state.settings.longBreakMins * 60;
  })();

  const filteredTasks = state.tasks.filter((task) => {
    if (filter === 'all') return !task.completed;
    if (filter === 'today') return !task.completed; // simplified: show all active
    if (filter === 'high') return task.priority === 'high' && !task.completed;
    return true;
  });
  const completedTasks = state.tasks.filter((t) => t.completed);

  function handleAddTask(data: Omit<Task, 'id' | 'createdAt' | 'active' | 'done' | 'completed'>) {
    const id = crypto.randomUUID();
    dispatch({ type: 'ADD_TASK', task: { ...data, id, createdAt: Date.now(), active: false, done: 0, completed: false } });
  }

  const upNext = state.tasks.filter((t) => !t.active && !t.completed).slice(0, 2);

  return (
    <>
      {/* Main column */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: `1px solid ${t.borderSoft}`, flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, color: t.text, letterSpacing: -0.4 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })} focus
            </div>
            <div style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>
              {state.todaySessions} sessions in · keep the momentum
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: t.surface, border: `1px solid ${t.border}`,
              borderRadius: 8, padding: '7px 12px', minWidth: 200,
            }}>
              <Icons.search size={14} color={t.textFaint} />
              <span style={{ fontSize: 13, color: t.textFaint }}>Search tasks</span>
            </div>
            <Btn theme={t} accent={accent} variant="primary" icon={<Icons.plus size={14} />} onClick={() => setShowModal(true)}>New task</Btn>
          </div>
        </div>

        <div style={{ flex: 1, padding: 28, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <TimerCard
            theme={t} accent={accent} mode={state.mode}
            timerState={state.timerState}
            secondsLeft={state.secondsLeft}
            totalSecs={totalSecs}
            timerStyle={state.timerStyle}
            sessionCount={state.sessionCount}
            totalSessions={state.settings.longBreakAfter}
            linkedTask={activeTask}
            onStart={startTimer}
            onPause={pauseTimer}
            onReset={resetTimer}
            onSkip={skipSession}
          />

          {/* Task list */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: t.text, letterSpacing: -0.2 }}>Active tasks</h2>
                <span style={{ fontSize: 12, color: t.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>
                  {filteredTasks.length} open · {completedTasks.length} completed
                </span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['all', 'today', 'high'] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: '5px 11px', borderRadius: 7, fontSize: 12, fontWeight: 500,
                    background: filter === f ? alpha(accent, 0.1) : 'transparent',
                    color: filter === f ? accent : t.textMuted,
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    textTransform: 'capitalize',
                  }}>{f === 'all' ? 'All' : f === 'today' ? 'Today' : 'High'}</button>
                ))}
              </div>
            </div>

            {filteredTasks.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id} task={task} theme={t} accent={accent}
                    onToggleComplete={(id) => dispatch({ type: 'TOGGLE_TASK_COMPLETE', id })}
                    onSetActive={(id) => dispatch({ type: 'SET_ACTIVE_TASK', id })}
                    onDelete={(id) => dispatch({ type: 'DELETE_TASK', id })}
                  />
                ))}
              </div>
            ) : (
              <div style={{
                padding: '60px 24px', textAlign: 'center', borderRadius: 12,
                border: `1.5px dashed ${t.border}`, background: 'transparent',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, margin: '0 auto 16px',
                  background: alpha(accent, 0.1), color: accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><Icons.inbox size={22} color={accent} /></div>
                <div style={{ fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 4 }}>Your list is clear</div>
                <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 16 }}>Add something small to start a focused session.</div>
                <Btn theme={t} accent={accent} variant="primary" icon={<Icons.plus size={14} />} onClick={() => setShowModal(true)}>Add your first task</Btn>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Right panel */}
      <aside style={{
        width: 320, flexShrink: 0, padding: '20px 22px',
        borderLeft: `1px solid ${t.borderSoft}`,
        display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto',
      }}>
        <StreakCard theme={t} days={state.streak} />
        <TodayStats theme={t} accent={accent} sessions={state.todaySessions} />
        <HeatmapCard
          theme={t} accent={accent}
          data={analytics.heatmap}
          totalSessions={analytics.heatmapTotal}
          totalFocusSecs={analytics.totalFocusSecs}
        />
        {/* Up next */}
        {upNext.length > 0 && (
          <div style={{
            background: t.surface, border: `1px solid ${t.borderSoft}`,
            borderRadius: 12, padding: 18,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase' }}>Up next</div>
              <span style={{ fontSize: 11, color: t.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>auto-queue</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upNext.map((task, i) => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 10, color: t.textFaint, fontFamily: '"JetBrains Mono", monospace', width: 14, textAlign: 'right' }}>{i + 1}</span>
                  <PriorityDot priority={task.priority} size={6} />
                  <span style={{ flex: 1, fontSize: 12.5, color: t.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                  <span style={{ fontSize: 11, color: t.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>{task.total - task.done}×</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Task form modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(10, 10, 10, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 50,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <TaskFormModal
            theme={t} accent={accent}
            onClose={() => setShowModal(false)}
            onSubmit={handleAddTask}
          />
        </div>
      )}
    </>
  );
}
