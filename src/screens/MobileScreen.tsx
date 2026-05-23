import { useState } from 'react';
import type { SurfaceTokens, Task } from '../types';
import { alpha, MODES } from '../lib/tokens';
import { Btn, PomodoroDots, PriorityDot, TagPill } from '../components/ui';
import { Icons } from '../components/icons';
import { BarTimer } from '../components/timer/BarTimer';
import { CircleTimer } from '../components/timer/CircleTimer';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { MobileTabBar, MobileStatusBar } from '../components/layout/MobileTabBar';
import { StreakCard } from '../components/analytics/StreakCard';
import { WeeklyChart } from '../components/analytics/WeeklyChart';
import { HeatmapCard } from '../components/analytics/HeatmapCard';
import { formatTime } from '../lib/data';
import { useApp } from '../context/AppContext';

type Screen = 'timer' | 'tasks' | 'analytics' | 'settings';

export function MobileScreen({ theme: t, accent }: { theme: SurfaceTokens; accent: string }) {
  const { state, dispatch, startTimer, pauseTimer, resetTimer, skipSession } = useApp();
  const [tab, setTab] = useState<Screen>('timer');
  const [showModal, setShowModal] = useState(false);

  const activeTask = state.tasks.find((task) => task.id === state.activeTaskId) ?? null;
  const totalSecs = state.mode === 'focus' ? state.settings.pomodoroMins * 60
    : state.mode === 'short' ? state.settings.shortBreakMins * 60
    : state.settings.longBreakMins * 60;
  const running = state.timerState === 'running';

  return (
    <div style={{
      width: '100%', height: '100%',
      background: t.bg, color: t.text,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <MobileStatusBar theme={t} />

      {/* content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'timer' && <MobileTimerTab t={t} accent={accent} activeTask={activeTask} totalSecs={totalSecs} running={running}
          onStart={startTimer} onPause={pauseTimer} onReset={resetTimer} onSkip={skipSession} />}
        {tab === 'tasks' && <MobileTasksTab t={t} accent={accent} setShowModal={setShowModal} />}
        {tab === 'analytics' && <MobileAnalyticsTab t={t} accent={accent} />}
        {tab === 'settings' && <MobileSettingsTab t={t} accent={accent} />}
      </div>

      <MobileTabBar theme={t} accent={accent} active={tab} onNavigate={setTab} />

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(10,10,10,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 50,
        }} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{
            background: t.surface, borderRadius: '20px 20px 0 0',
            padding: '12px 20px 24px', width: '100%',
            boxShadow: '0 -12px 32px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: t.border }} />
            </div>
            <TaskFormModal theme={t} accent={accent} onClose={() => setShowModal(false)}
              onSubmit={(data) => {
                const id = crypto.randomUUID();
                dispatch({ type: 'ADD_TASK', task: { ...data, id, createdAt: Date.now(), active: false, done: 0, completed: false } });
              }} />
          </div>
        </div>
      )}
    </div>
  );
}

function MobileTimerTab({ t, accent, activeTask, totalSecs, running, onStart, onPause, onReset, onSkip }: {
  t: SurfaceTokens; accent: string; activeTask: Task | null; totalSecs: number;
  running: boolean; onStart: () => void; onPause: () => void; onReset: () => void; onSkip: () => void;
}) {
  const { state } = useApp();
  const elapsedSecs = totalSecs - state.secondsLeft;
  const [mins, secs] = formatTime(state.secondsLeft).split(':');

  return (
    <div style={{ flex: 1, padding: '8px 20px 16px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 500, letterSpacing: 0.4, textTransform: 'uppercase' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: -0.5, marginTop: 2 }}>Stay with it</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: alpha('#F97316', 0.12) }}>
          <Icons.fire size={14} color="#F97316" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#F97316', fontFamily: '"JetBrains Mono", monospace' }}>{state.streak}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0 12px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 999,
          background: alpha(accent, 0.12), color: accent,
          fontSize: 10.5, fontWeight: 600, letterSpacing: 1.2, fontFamily: '"JetBrains Mono", monospace',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: accent, animation: running ? 'pulse 1.6s ease-in-out infinite' : 'none' }} />
          {MODES[state.mode].short} · {state.sessionCount}/{state.settings.longBreakAfter}
        </span>
      </div>

      <div
        role="timer" aria-live="polite" aria-label={`${state.secondsLeft} seconds remaining`}
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 84, fontWeight: 600, color: t.text,
          letterSpacing: -3, textAlign: 'center', lineHeight: 1,
          fontVariantNumeric: 'tabular-nums', marginBottom: 24,
        }}>
        {mins}<span style={{ color: t.textFaint, fontWeight: 400 }}>:</span>{secs}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        {state.timerStyle === 'bars'
          ? <BarTimer theme={t} accent={accent} totalMins={Math.ceil(totalSecs / 60)} elapsedSecs={elapsedSecs} running={running} size="md" />
          : <CircleTimer theme={t} accent={accent} totalSecs={totalSecs} elapsedSecs={elapsedSecs} size={180} strokeWidth={8} />
        }
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 24 }}>
        <button onClick={onReset} style={{
          width: 52, height: 52, borderRadius: 26,
          background: t.surface, border: `1px solid ${t.border}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: t.textMuted, cursor: 'pointer',
        }}><Icons.reset size={18} /></button>
        <button onClick={running ? onPause : onStart} style={{
          width: 68, height: 68, borderRadius: 34,
          background: accent, color: '#fff', border: 'none',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 6px 20px ${alpha(accent, 0.4)}`,
          cursor: 'pointer',
        }}>
          {running ? <Icons.pause size={22} color="#fff" /> : <Icons.play size={22} color="#fff" />}
        </button>
        <button onClick={onSkip} style={{
          width: 52, height: 52, borderRadius: 26,
          background: t.surface, border: `1px solid ${t.border}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: t.textMuted, cursor: 'pointer',
        }}><Icons.skip size={18} /></button>
      </div>

      {activeTask && (
        <div style={{ marginTop: 'auto', padding: '14px 16px', borderRadius: 12, background: t.surface, border: `1px solid ${t.borderSoft}` }}>
          <div style={{ fontSize: 10, color: t.textFaint, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>Working on</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PriorityDot priority={activeTask.priority} size={8} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeTask.title}</div>
            </div>
            <PomodoroDots done={activeTask.done} total={activeTask.total} accent={accent} theme={t} size={8} />
          </div>
        </div>
      )}
    </div>
  );
}

function MobileTasksTab({ t, accent, setShowModal }: { t: SurfaceTokens; accent: string; setShowModal: (v: boolean) => void }) {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('all');
  const activeTasks = state.tasks.filter((task) => !task.completed);
  const filtered = filter === 'high' ? activeTasks.filter((t) => t.priority === 'high')
    : filter === 'done' ? state.tasks.filter((t) => t.completed)
    : activeTasks;

  return (
    <div style={{ flex: 1, padding: '8px 20px 16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: -0.5 }}>Tasks</div>
          <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{activeTasks.length} active · {state.tasks.filter((t) => t.completed).length} done</div>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          width: 36, height: 36, borderRadius: 18, background: accent, border: 'none',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 12px ${alpha(accent, 0.35)}`, cursor: 'pointer',
        }}><Icons.plus size={18} color="#fff" /></button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', flexShrink: 0 }}>
        {[{ id: 'all', label: 'All', count: activeTasks.length },
          { id: 'high', label: 'High', count: activeTasks.filter((t) => t.priority === 'high').length },
          { id: 'done', label: 'Done', count: state.tasks.filter((t) => t.completed).length },
        ].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: '6px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 500,
            background: filter === f.id ? alpha(accent, 0.12) : t.surface,
            border: `1px solid ${filter === f.id ? alpha(accent, 0.25) : t.borderSoft}`,
            color: filter === f.id ? accent : t.textMuted,
            display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {f.label}
            <span style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', opacity: 0.6 }}>{f.count}</span>
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((task) => (
          <div key={task.id} style={{
            background: t.surface, border: `1px solid ${t.borderSoft}`,
            borderRadius: 12, padding: '14px 16px',
            display: 'flex', alignItems: 'flex-start', gap: 12,
            opacity: task.completed ? 0.6 : 1,
          }}>
            <button onClick={() => dispatch({ type: 'TOGGLE_TASK_COMPLETE', id: task.id })} style={{
              width: 18, height: 18, borderRadius: 9, flexShrink: 0, marginTop: 1,
              border: `1.5px solid ${task.completed ? accent : t.border}`,
              background: task.completed ? accent : 'transparent',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0,
            }}>
              {task.completed && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5L4 7L8 3" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.text, letterSpacing: -0.1, textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <PomodoroDots done={task.done} total={task.total} accent={accent} theme={t} size={8} />
                <span style={{ fontSize: 11, color: t.textMuted, fontFamily: '"JetBrains Mono", monospace' }}>{task.done}/{task.total}</span>
                {task.tags.slice(0, 2).map((tag) => <TagPill key={tag} theme={t} label={tag} />)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileAnalyticsTab({ t, accent }: { t: SurfaceTokens; accent: string }) {
  const { state } = useApp();
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: -0.5, marginBottom: 4 }}>Stats</div>
      <StreakCard theme={t} days={state.streak} />
      <WeeklyChart theme={t} accent={accent} />
      <HeatmapCard theme={t} accent={accent} />
    </div>
  );
}

function MobileSettingsTab({ t, accent }: { t: SurfaceTokens; accent: string }) {
  const { state, dispatch } = useApp();
  const s = state.settings;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: -0.5 }}>Settings</div>
      {[
        { label: 'Pomodoro', key: 'pomodoroMins' as const, value: s.pomodoroMins, unit: 'min' },
        { label: 'Short break', key: 'shortBreakMins' as const, value: s.shortBreakMins, unit: 'min' },
        { label: 'Long break', key: 'longBreakMins' as const, value: s.longBreakMins, unit: 'min' },
      ].map((item) => (
        <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${t.borderSoft}`, paddingBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: t.text }}>{item.label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => dispatch({ type: 'UPDATE_SETTINGS', settings: { [item.key]: Math.max(1, item.value - 1) } })} style={{ width: 32, height: 32, borderRadius: 8, background: t.surfaceAlt, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.text }}><Icons.minus size={14} /></button>
            <span style={{ fontSize: 15, fontWeight: 600, fontFamily: '"JetBrains Mono", monospace', color: t.text, minWidth: 30, textAlign: 'center' }}>{item.value}</span>
            <button onClick={() => dispatch({ type: 'UPDATE_SETTINGS', settings: { [item.key]: Math.min(99, item.value + 1) } })} style={{ width: 32, height: 32, borderRadius: 8, background: t.surfaceAlt, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.text }}><Icons.plus size={14} /></button>
          </div>
        </div>
      ))}
      <div style={{ paddingTop: 4 }}>
        <Btn theme={t} accent={accent} variant="secondary" full onClick={() => dispatch({ type: 'RESET_SETTINGS' })}>Reset to defaults</Btn>
      </div>
    </div>
  );
}
