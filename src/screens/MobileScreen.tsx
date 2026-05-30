import { useState, useCallback, useMemo, memo } from 'react';
import type { SurfaceTokens, Task, Mode, Settings, ThemeSource, TimerStyle } from '../types';
import { alpha, MODES } from '../lib/tokens';
import { Btn, Toggle, PomodoroDots, PriorityDot, TagPill } from '../components/ui';
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
import { useAnalytics } from '../hooks/useAnalytics';
import { useEscapeKey } from '../hooks/useEscapeKey';

type Screen = 'timer' | 'tasks' | 'analytics' | 'settings';
type AppDispatch = ReturnType<typeof useApp>['dispatch'];

export function MobileScreen({ theme: t, accent }: { theme: SurfaceTokens; accent: string }) {
  const { state, dispatch, startTimer, pauseTimer, resetTimer, skipSession } = useApp();
  const [tab, setTab] = useState<Screen>('timer');
  const [showModal, setShowModal] = useState(false);
  useEscapeKey(useCallback(() => setShowModal(false), []), showModal);

  const activeTask = useMemo(
    () => state.tasks.find((task) => task.id === state.activeTaskId) ?? null,
    [state.tasks, state.activeTaskId],
  );
  const totalSecs = useMemo(
    () => state.mode === 'focus' ? state.settings.pomodoroMins * 60
      : state.mode === 'short' ? state.settings.shortBreakMins * 60
      : state.settings.longBreakMins * 60,
    [state.mode, state.settings],
  );
  const running = state.timerState === 'running';

  return (
    <div className="w-full h-full flex flex-col overflow-hidden" style={{
      background: t.bg, color: t.text,
    }}>
      <MobileStatusBar theme={t} />

      <div className="flex-1 overflow-hidden flex flex-col">
        {tab === 'timer' && (
          <MobileTimerTab
            t={t} accent={accent} activeTask={activeTask} totalSecs={totalSecs} running={running}
            secondsLeft={state.secondsLeft} timerStyle={state.timerStyle} mode={state.mode}
            sessionCount={state.sessionCount} longBreakAfter={state.settings.longBreakAfter}
            streak={state.streak}
            onStart={startTimer} onPause={pauseTimer} onReset={resetTimer} onSkip={skipSession}
          />
        )}
        {tab === 'tasks' && (
          <MobileTasksTab
            t={t} accent={accent}
            tasks={state.tasks} activeTaskId={state.activeTaskId}
            dispatch={dispatch} setShowModal={setShowModal}
          />
        )}
        {tab === 'analytics' && (
          <MobileAnalyticsTab
            t={t} accent={accent}
            tasks={state.tasks} todaySessions={state.todaySessions} streak={state.streak}
          />
        )}
        {tab === 'settings' && (
          <MobileSettingsTab
            t={t} accent={accent}
            settings={state.settings} timerStyle={state.timerStyle}
            themeSource={state.themeSource} tasks={state.tasks}
            dispatch={dispatch}
          />
        )}
      </div>

      <MobileTabBar theme={t} accent={accent} active={tab} onNavigate={setTab} />

      {showModal && (
        <div
          className="fixed inset-0 flex items-end justify-center z-50"
          style={{ background: 'rgba(10,10,10,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="w-full overflow-y-auto" style={{
            background: t.surface, borderRadius: '20px 20px 0 0',
            padding: '12px 20px 24px',
            boxShadow: '0 -12px 32px rgba(0,0,0,0.25)', maxHeight: '90vh',
          }}>
            <div className="flex justify-center mb-3">
              <div style={{ width: 36, height: 4, borderRadius: 2, background: t.border }} />
            </div>
            <TaskFormModal theme={t} accent={accent} onClose={() => setShowModal(false)}
              onSubmit={(data, startNow) => {
                const id = crypto.randomUUID();
                dispatch({ type: 'ADD_TASK', task: { ...data, id, createdAt: Date.now(), active: false, done: 0, completed: false } });
                if (startNow) {
                  dispatch({ type: 'SET_ACTIVE_TASK', id });
                  startTimer();
                }
              }} />
          </div>
        </div>
      )}
    </div>
  );
}

function MobileTimerTab({ t, accent, activeTask, totalSecs, running, secondsLeft, timerStyle, mode, sessionCount, longBreakAfter, streak, onStart, onPause, onReset, onSkip }: {
  t: SurfaceTokens; accent: string; activeTask: Task | null; totalSecs: number;
  running: boolean; secondsLeft: number; timerStyle: TimerStyle; mode: Mode;
  sessionCount: number; longBreakAfter: number; streak: number;
  onStart: () => void; onPause: () => void; onReset: () => void; onSkip: () => void;
}) {
  const elapsedSecs = totalSecs - secondsLeft;
  const [mins, secs] = formatTime(secondsLeft).split(':');
  const dateStr = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    [],
  );

  return (
    <div className="flex-1 flex flex-col overflow-y-auto" style={{ padding: '8px 20px 16px' }}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 500, letterSpacing: 0.4, textTransform: 'uppercase' }}>
            {dateStr}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: -0.5, marginTop: 2 }}>Stay with it</div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: alpha('#F97316', 0.12) }}>
          <Icons.fire size={14} color="#F97316" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#F97316', fontFamily: '"JetBrains Mono", monospace' }}>{streak}</span>
        </div>
      </div>

      <div className="flex justify-center" style={{ margin: '20px 0 12px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 999,
          background: alpha(accent, 0.12), color: accent,
          fontSize: 10.5, fontWeight: 600, letterSpacing: 1.2, fontFamily: '"JetBrains Mono", monospace',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: accent, animation: running ? 'pulse 1.6s ease-in-out infinite' : 'none' }} />
          {MODES[mode].short} · {sessionCount}/{longBreakAfter}
        </span>
      </div>

      <div
        role="timer" aria-live="polite" aria-label={`${secondsLeft} seconds remaining`}
        className="text-center mb-6"
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 84, fontWeight: 600, color: t.text,
          letterSpacing: -3, lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>
        {mins}<span style={{ color: t.textFaint, fontWeight: 400 }}>:</span>{secs}
      </div>

      <div className="flex justify-center mb-7">
        {timerStyle === 'bars'
          ? <BarTimer theme={t} accent={accent} totalMins={Math.ceil(totalSecs / 60)} elapsedSecs={elapsedSecs} running={running} size="md" />
          : <CircleTimer theme={t} accent={accent} totalSecs={totalSecs} elapsedSecs={elapsedSecs} size={180} strokeWidth={8} />
        }
      </div>

      <div className="flex items-center justify-center gap-[14px] mb-6">
        <button onClick={onReset} className="inline-flex items-center justify-center cursor-pointer" style={{
          width: 52, height: 52, borderRadius: 26,
          background: t.surface, border: `1px solid ${t.border}`,
          color: t.textMuted,
        }}><Icons.reset size={18} /></button>
        <button onClick={running ? onPause : onStart} className="inline-flex items-center justify-center cursor-pointer" style={{
          width: 68, height: 68, borderRadius: 34,
          background: accent, color: '#fff', border: 'none',
          boxShadow: `0 6px 20px ${alpha(accent, 0.4)}`,
        }}>
          {running ? <Icons.pause size={22} color="#fff" /> : <Icons.play size={22} color="#fff" />}
        </button>
        <button onClick={onSkip} className="inline-flex items-center justify-center cursor-pointer" style={{
          width: 52, height: 52, borderRadius: 26,
          background: t.surface, border: `1px solid ${t.border}`,
          color: t.textMuted,
        }}><Icons.skip size={18} /></button>
      </div>

      {activeTask && (
        <div className="mt-auto" style={{ padding: '14px 16px', borderRadius: 12, background: t.surface, border: `1px solid ${t.borderSoft}` }}>
          <div style={{ fontSize: 10, color: t.textFaint, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>Working on</div>
          <div className="flex items-center gap-[10px]">
            <PriorityDot priority={activeTask.priority} size={8} />
            <div className="flex-1 min-w-0">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{activeTask.title}</div>
            </div>
            <PomodoroDots done={activeTask.done} total={activeTask.total} accent={accent} theme={t} size={8} />
          </div>
        </div>
      )}
    </div>
  );
}

const MobileTasksTab = memo(function MobileTasksTab({ t, accent, tasks, activeTaskId, dispatch, setShowModal }: {
  t: SurfaceTokens; accent: string; tasks: Task[]; activeTaskId: string | null;
  dispatch: AppDispatch; setShowModal: (v: boolean) => void;
}) {
  const [filter, setFilter] = useState('all');
  const activeTasks = tasks.filter((task) => !task.completed);
  const filtered = filter === 'high' ? activeTasks.filter((task) => task.priority === 'high')
    : filter === 'done' ? tasks.filter((task) => task.completed)
    : activeTasks;

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ padding: '8px 20px 16px' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: -0.5 }}>Tasks</div>
          <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{activeTasks.length} active · {tasks.filter((task) => task.completed).length} done</div>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center justify-center cursor-pointer" style={{
          width: 36, height: 36, borderRadius: 18, background: accent, border: 'none',
          boxShadow: `0 4px 12px ${alpha(accent, 0.35)}`,
        }}><Icons.plus size={18} color="#fff" /></button>
      </div>

      <div className="flex gap-1.5 mb-3.5 overflow-x-auto shrink-0">
        {[{ id: 'all', label: 'All', count: activeTasks.length },
          { id: 'high', label: 'High', count: activeTasks.filter((task) => task.priority === 'high').length },
          { id: 'done', label: 'Done', count: tasks.filter((task) => task.completed).length },
        ].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className="inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer" style={{
            padding: '6px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 500,
            background: filter === f.id ? alpha(accent, 0.12) : t.surface,
            border: `1px solid ${filter === f.id ? alpha(accent, 0.25) : t.borderSoft}`,
            color: filter === f.id ? accent : t.textMuted,
            fontFamily: 'inherit',
          }}>
            {f.label}
            <span style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', opacity: 0.6 }}>{f.count}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-[10px]">
        {filtered.map((task) => {
          const isActive = task.id === activeTaskId;
          return (
            <div
              key={task.id}
              onClick={() => { if (!task.completed) dispatch({ type: 'SET_ACTIVE_TASK', id: isActive ? null : task.id }); }}
              className="flex items-start gap-3"
              style={{
                background: isActive ? alpha(accent, 0.05) : t.surface,
                border: `1px solid ${isActive ? alpha(accent, 0.3) : t.borderSoft}`,
                borderRadius: 12, padding: '14px 16px',
                opacity: task.completed ? 0.6 : 1,
                cursor: task.completed ? 'default' : 'pointer',
              }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); dispatch({ type: 'TOGGLE_TASK_COMPLETE', id: task.id }); }}
                className="inline-flex items-center justify-center shrink-0 cursor-pointer"
                style={{
                  width: 18, height: 18, borderRadius: 9, marginTop: 1,
                  border: `1.5px solid ${task.completed ? accent : t.border}`,
                  background: task.completed ? accent : 'transparent',
                  padding: 0,
                }}
              >
                {task.completed && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5L4 7L8 3" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.text, letterSpacing: -0.1, textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</div>
                  {isActive && (
                    <span className="sig-status-label shrink-0" style={{ color: accent }}>
                      <span className="sig-live-dot" style={{ background: accent }} />
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <PomodoroDots done={task.done} total={task.total} accent={accent} theme={t} size={8} />
                  <span style={{ fontSize: 11, color: t.textMuted, fontFamily: '"JetBrains Mono", monospace' }}>{task.done}/{task.total}</span>
                  {task.tags.slice(0, 2).map((tag) => <TagPill key={tag} theme={t} label={tag} />)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const MobileAnalyticsTab = memo(function MobileAnalyticsTab({ t, accent, tasks, todaySessions, streak }: {
  t: SurfaceTokens; accent: string; tasks: Task[]; todaySessions: number; streak: number;
}) {
  const analytics = useAnalytics(tasks, todaySessions);
  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-3.5" style={{ padding: '8px 20px 16px' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: -0.5, marginBottom: 4 }}>Analytics</div>
      <StreakCard theme={t} days={streak} />
      <WeeklyChart theme={t} accent={accent} data={analytics.weekFocus} totalSecs={analytics.weekTotalSecs} />
      <HeatmapCard theme={t} accent={accent} data={analytics.heatmap} totalSessions={analytics.heatmapTotal} totalFocusSecs={analytics.totalFocusSecs} />
    </div>
  );
});

function MobileSettingsStepper({ t, label, hint, value, min, max, step = 1, unit, onChange }: {
  t: SurfaceTokens; label: string; hint?: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex-1">
        <div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: t.textMuted, marginTop: 1 }}>{hint}</div>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => onChange(Math.max(min, value - step))} className="flex items-center justify-center cursor-pointer" style={{ width: 32, height: 32, borderRadius: 8, background: t.surfaceAlt, border: `1px solid ${t.border}`, color: t.text }}><Icons.minus size={14} /></button>
        <span className="text-center" style={{ fontSize: 14, fontWeight: 600, fontFamily: '"JetBrains Mono", monospace', color: t.text, minWidth: 38 }}>{value}{unit ? ` ${unit}` : ''}</span>
        <button onClick={() => onChange(Math.min(max, value + step))} className="flex items-center justify-center cursor-pointer" style={{ width: 32, height: 32, borderRadius: 8, background: t.surfaceAlt, border: `1px solid ${t.border}`, color: t.text }}><Icons.plus size={14} /></button>
      </div>
    </div>
  );
}

function MobileSettingsSection({ t, title, children }: { t: SurfaceTokens; title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col" style={{ background: t.surface, border: `1px solid ${t.borderSoft}`, borderRadius: 12, padding: '14px 16px', gap: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: t.textFaint, letterSpacing: 0.8, textTransform: 'uppercase' }}>{title}</div>
      {children}
    </div>
  );
}

const MobileSettingsTab = memo(function MobileSettingsTab({ t, accent, settings, timerStyle, themeSource, tasks, dispatch }: {
  t: SurfaceTokens; accent: string;
  settings: Settings; timerStyle: TimerStyle; themeSource: ThemeSource; tasks: Task[];
  dispatch: AppDispatch;
}) {
  const s = settings;

  function update(key: keyof typeof s, val: unknown) {
    dispatch({ type: 'UPDATE_SETTINGS', settings: { [key]: val } });
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-3.5" style={{ padding: '8px 20px 24px' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: -0.5 }}>Settings</div>

      <MobileSettingsSection t={t} title="Timer durations">
        <MobileSettingsStepper t={t} label="Pomodoro" hint="Deep work block" value={s.pomodoroMins} min={1} max={60} unit="min" onChange={(v) => update('pomodoroMins', v)} />
        <MobileSettingsStepper t={t} label="Short break" value={s.shortBreakMins} min={1} max={30} unit="min" onChange={(v) => update('shortBreakMins', v)} />
        <MobileSettingsStepper t={t} label="Long break" value={s.longBreakMins} min={5} max={60} unit="min" onChange={(v) => update('longBreakMins', v)} />
        <MobileSettingsStepper t={t} label="Long break after" hint="Pomodoros before long break" value={s.longBreakAfter} min={2} max={8} unit="cycles" onChange={(v) => update('longBreakAfter', v)} />
      </MobileSettingsSection>

      <MobileSettingsSection t={t} title="Goals">
        <MobileSettingsStepper
          t={t} label="Daily focus goal" value={s.dailyGoalMins} min={25} max={480} step={25}
          hint={s.dailyGoalMins >= 60 ? `${Math.floor(s.dailyGoalMins / 60)}h${s.dailyGoalMins % 60 > 0 ? ` ${s.dailyGoalMins % 60}m` : ''}` : `${s.dailyGoalMins}m`}
          unit="min" onChange={(v) => update('dailyGoalMins', v)}
        />
      </MobileSettingsSection>

      <MobileSettingsSection t={t} title="Automation">
        <Toggle theme={t} on={s.autoStartBreaks} accent={accent} label="Auto-start breaks" hint="Begin a break as soon as a pomodoro ends" onChange={(v) => update('autoStartBreaks', v)} />
        <Toggle theme={t} on={s.autoStartPomodoros} accent={accent} label="Auto-start pomodoros" hint="Jump into the next focus block after a break" onChange={(v) => update('autoStartPomodoros', v)} />
        <Toggle theme={t} on={s.pauseWhenInactive} accent={accent} label="Pause when inactive" onChange={(v) => update('pauseWhenInactive', v)} />
      </MobileSettingsSection>

      <MobileSettingsSection t={t} title="Sound & Notifications">
        <Toggle theme={t} on={s.browserNotifications} accent={accent} label="Browser notifications" onChange={(v) => update('browserNotifications', v)} />
        <Toggle theme={t} on={s.soundEffects} accent={accent} label="Sound effects" hint="Play a soft chime at start and end" onChange={(v) => update('soundEffects', v)} />
      </MobileSettingsSection>

      <MobileSettingsSection t={t} title="Timer style">
        <div className="flex gap-2">
          {(['bars', 'circle'] as const).map((style) => (
            <button key={style} onClick={() => dispatch({ type: 'SET_TIMER_STYLE', style })} className="flex-1 capitalize cursor-pointer" style={{
              padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 500,
              border: `1px solid ${timerStyle === style ? accent : t.border}`,
              background: timerStyle === style ? `${accent}18` : 'transparent',
              color: timerStyle === style ? accent : t.textMuted,
              fontFamily: 'inherit',
            }}>{style}</button>
          ))}
        </div>
      </MobileSettingsSection>

      <MobileSettingsSection t={t} title="Appearance">
        <div className="flex gap-2">
          {([
            { value: 'system', label: 'System' },
            { value: 'light',  label: 'Light' },
            { value: 'dark',   label: 'Dark' },
          ] as const).map((opt) => (
            <button key={opt.value} onClick={() => dispatch({ type: 'SET_THEME_SOURCE', source: opt.value })} className="flex-1 cursor-pointer" style={{
              padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 500,
              border: `1px solid ${themeSource === opt.value ? accent : t.border}`,
              background: themeSource === opt.value ? `${accent}18` : 'transparent',
              color: themeSource === opt.value ? accent : t.textMuted,
              fontFamily: 'inherit',
            }}>{opt.label}</button>
          ))}
        </div>
      </MobileSettingsSection>

      <div className="flex flex-col gap-2">
        <Btn theme={t} accent={accent} variant="secondary" full onClick={() => dispatch({ type: 'RESET_SETTINGS' })}>Reset to defaults</Btn>
        <Btn theme={t} accent={accent} variant="danger" full onClick={() => {
          if (confirm('Delete all tasks? This cannot be undone.')) {
            tasks.forEach((task) => dispatch({ type: 'DELETE_TASK', id: task.id }));
          }
        }}>Clear all tasks</Btn>
      </div>
    </div>
  );
});
