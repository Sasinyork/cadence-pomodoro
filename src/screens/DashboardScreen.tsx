import { useState, useCallback } from 'react';
import type { SurfaceTokens, Task } from '../types';
import { alpha } from '../lib/tokens';
import { Btn } from '../components/ui';
import { Icons } from '../components/icons';
import { TimerCard } from '../components/timer/TimerCard';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { HistoryPanel } from '../components/tasks/HistoryPanel';
import { StreakCard } from '../components/analytics/StreakCard';
import { TodayStats } from '../components/analytics/TodayStats';
import { HeatmapCard } from '../components/analytics/HeatmapCard';
import { PriorityDot } from '../components/ui';
import { useApp } from '../context/AppContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { useEscapeKey } from '../hooks/useEscapeKey';

export function DashboardScreen({ theme: t, accent }: { theme: SurfaceTokens; accent: string }) {
  const { state, dispatch, startTimer, pauseTimer, resetTimer, skipSession } = useApp();
  const isTasksView = state.currentScreen === 'tasks';
  const analytics = useAnalytics(state.tasks, state.todaySessions);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'high'>('all');

  const activeTask = state.tasks.find((t) => t.id === state.activeTaskId) ?? null;

  useEscapeKey(useCallback(() => {
    if (editingTask) { setEditingTask(null); return; }
    if (showModal) setShowModal(false);
  }, [editingTask, showModal]));

  const totalSecs = (() => {
    if (state.mode === 'focus') return state.settings.pomodoroMins * 60;
    if (state.mode === 'short') return state.settings.shortBreakMins * 60;
    return state.settings.longBreakMins * 60;
  })();

  const filteredTasks = state.tasks.filter((task) => {
    if (filter === 'high') return task.priority === 'high' && !task.completed;
    return !task.completed;
  });
  const completedTasks = state.tasks.filter((t) => t.completed);

  function handleAddTask(data: Omit<Task, 'id' | 'createdAt' | 'active' | 'done' | 'completed'>, startNow: boolean) {
    const id = crypto.randomUUID();
    dispatch({ type: 'ADD_TASK', task: { ...data, id, createdAt: Date.now(), active: false, done: 0, completed: false } });
    if (startNow) {
      dispatch({ type: 'SET_ACTIVE_TASK', id });
      startTimer();
    }
  }

  function handleEditTask(data: Omit<Task, 'id' | 'createdAt' | 'active' | 'done' | 'completed'>, _startNow: boolean) {
    if (!editingTask) return;
    dispatch({ type: 'UPDATE_TASK', task: { ...editingTask, ...data, done: Math.min(editingTask.done, data.total) } });
    setEditingTask(null);
  }

  const upNext = state.tasks.filter((t) => !t.active && !t.completed).slice(0, 2);

  return (
    <>
      {/* Main column */}
      <main className="screen-enter flex-1 flex flex-col min-w-0">
        {/* header */}
        <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 28px', borderBottom: `1px solid ${t.borderSoft}` }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, color: t.text, letterSpacing: -0.4 }}>
              {isTasksView ? 'Tasks' : `${new Date().toLocaleDateString('en-US', { weekday: 'long' })} focus`}
            </div>
            <div style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>
              {isTasksView
                ? `${state.tasks.filter(t => !t.completed).length} open · ${state.tasks.filter(t => t.completed).length} completed`
                : `${state.todaySessions} sessions in · keep the momentum`}
            </div>
          </div>
          <Btn theme={t} accent={accent} variant="primary" icon={<Icons.plus size={14} />} onClick={() => setShowModal(true)}>New task</Btn>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col" style={{ padding: 28, gap: 22 }}>
          {!isTasksView && (
            <TimerCard
              theme={t} accent={accent} mode={state.mode}
              timerState={state.timerState}
              secondsLeft={state.secondsLeft}
              totalSecs={totalSecs}
              timerStyle={state.timerStyle}
              sessionCount={state.sessionCount}
              totalSessions={state.settings.longBreakAfter}
              linkedTask={activeTask}
              soundEnabled={state.settings.soundEffects}
              onStart={startTimer}
              onPause={pauseTimer}
              onReset={resetTimer}
              onSkip={skipSession}
              onToggleSound={() => dispatch({ type: 'UPDATE_SETTINGS', settings: { soundEffects: !state.settings.soundEffects } })}
            />
          )}

          {/* Task list */}
          <section>
            <div className="flex items-center justify-between mb-[14px]">
              <div className="flex items-baseline gap-3">
                <h2 className="m-0" style={{ fontSize: 15, fontWeight: 600, color: t.text, letterSpacing: -0.2 }}>Active tasks</h2>
                <span style={{ fontSize: 12, color: t.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>
                  {filteredTasks.length} open · {completedTasks.length} completed
                </span>
              </div>
              <div className="flex gap-1">
                {(['all', 'high'] as const).map((f) => (
                  <button
                    key={f}
                    className="filter-btn capitalize cursor-pointer"
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '5px 11px', borderRadius: 7, fontSize: 12, fontWeight: 500,
                      background: filter === f ? alpha(accent, 0.1) : 'transparent',
                      color: filter === f ? accent : t.textMuted,
                      border: 'none', fontFamily: 'inherit',
                    }}
                  >{f === 'all' ? 'All' : 'High priority'}</button>
                ))}
              </div>
            </div>

            {filteredTasks.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {filteredTasks.map((task, i) => (
                  <div
                    key={task.id}
                    className="card-enter"
                    style={{ animationDelay: `${i * 0.04}s`, animationFillMode: 'both' }}
                  >
                    <TaskCard
                      task={task} theme={t} accent={accent}
                      onToggleComplete={(id) => dispatch({ type: 'TOGGLE_TASK_COMPLETE', id })}
                      onSetActive={(id) => dispatch({ type: 'SET_ACTIVE_TASK', id: state.activeTaskId === id ? null : id })}
                      onDelete={(id) => dispatch({ type: 'DELETE_TASK', id })}
                      onEdit={(id) => setEditingTask(state.tasks.find((t) => t.id === id) ?? null)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="card-enter text-center"
                style={{
                  padding: '60px 24px', borderRadius: 12,
                  border: `1.5px dashed ${t.border}`, background: 'transparent',
                }}
              >
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

          <HistoryPanel
            theme={t} accent={accent}
            completedTasks={state.tasks.filter((t) => t.completed)}
            deletedTasks={state.deletedTasks}
            onReopen={(id) => dispatch({ type: 'TOGGLE_TASK_COMPLETE', id })}
            onRestore={(id) => dispatch({ type: 'RESTORE_TASK', id })}
            onRemoveCompleted={(id) => dispatch({ type: 'DELETE_TASK', id })}
            onRemoveDeleted={(id) => dispatch({ type: 'REMOVE_FROM_HISTORY', id })}
            onClearAll={() => dispatch({ type: 'CLEAR_HISTORY' })}
          />
        </div>
      </main>

      {/* Right panel */}
      <aside className="shrink-0 overflow-y-auto flex flex-col" style={{
        width: 320, padding: '20px 22px',
        borderLeft: `1px solid ${t.borderSoft}`,
        gap: 14,
      }}>
        <StreakCard theme={t} days={state.streak} />
        <TodayStats
          theme={t} accent={accent}
          sessions={state.todaySessions}
          focusedMins={state.todaySessions * state.settings.pomodoroMins}
          avgDailySessions={Math.round(analytics.weekFocus.slice(0, 6).reduce((sum, d) => sum + d.sessions, 0) / 6)}
          dailyGoalMins={state.settings.dailyGoalMins}
        />
        <HeatmapCard
          theme={t} accent={accent}
          data={analytics.heatmap}
          totalSessions={analytics.heatmapTotal}
          totalFocusSecs={analytics.totalFocusSecs}
        />
        {/* Up next */}
        {upNext.length > 0 && (
          <div className="card-enter" style={{
            background: t.surface, border: `1px solid ${t.borderSoft}`,
            borderRadius: 12, padding: 18,
          }}>
            <div className="flex items-center justify-between mb-3">
              <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase' }}>Up next</div>
              <span style={{ fontSize: 11, color: t.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>auto-queue</span>
            </div>
            <div className="flex flex-col gap-[10px]">
              {upNext.map((task, i) => (
                <div key={task.id} className="flex items-center gap-[10px]">
                  <span style={{ fontSize: 10, color: t.textFaint, fontFamily: '"JetBrains Mono", monospace', width: 14, textAlign: 'right' }}>{i + 1}</span>
                  <PriorityDot priority={task.priority} size={6} />
                  <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontSize: 12.5, color: t.text, fontWeight: 500 }}>{task.title}</span>
                  <span style={{ fontSize: 11, color: t.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>{task.total - task.done}×</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Task form modal — create */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            background: 'rgba(10, 10, 10, 0.55)',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease both',
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

      {/* Task form modal — edit */}
      {editingTask && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            background: 'rgba(10, 10, 10, 0.55)',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease both',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditingTask(null); }}
        >
          <TaskFormModal
            theme={t} accent={accent}
            onClose={() => setEditingTask(null)}
            onSubmit={handleEditTask}
            initialTask={editingTask}
          />
        </div>
      )}
    </>
  );
}
