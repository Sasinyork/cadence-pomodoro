import { createContext, useContext, useReducer, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { AppState, Task, DeletedTask, Settings, Mode, Theme, ThemeSource, Palette, TimerStyle, TimerState } from '../types';
import { MODES } from '../lib/tokens';

const DEFAULT_SETTINGS: Settings = {
  pomodoroMins: 25,
  shortBreakMins: 5,
  longBreakMins: 15,
  longBreakAfter: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  pauseWhenInactive: true,
  browserNotifications: true,
  soundEffects: true,
  dailyGoalMins: 120,
};

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(source: ThemeSource): Theme {
  if (source === 'system') return getSystemTheme();
  return source;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function getInitialState(): AppState {
  const saved = localStorage.getItem('cadence-state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as Partial<AppState> & { lastSessionDate?: string };
      const source: ThemeSource = parsed.themeSource ?? 'system';
      // Restore todaySessions only if the last session was today, otherwise reset to 0.
      const isToday = parsed.lastSessionDate === todayStr();
      return {
        themeSource: source,
        theme: resolveTheme(source),
        palette: parsed.palette ?? 'classic',
        timerStyle: parsed.timerStyle ?? 'bars',
        mode: 'focus',
        timerState: 'idle',
        secondsLeft: (parsed.settings?.pomodoroMins ?? 25) * 60,
        sessionCount: parsed.sessionCount ?? 1,
        activeTaskId: parsed.activeTaskId ?? null,
        tasks: [],
        deletedTasks: parsed.deletedTasks ?? [],
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
        streak: parsed.streak ?? 0,
        todaySessions: isToday ? (parsed.todaySessions ?? 0) : 0,
        currentScreen: 'timer',
      };
    } catch {
      // fall through to defaults
    }
  }
  return {
    themeSource: 'system',
    theme: getSystemTheme(),
    palette: 'classic',
    timerStyle: 'bars',
    mode: 'focus',
    timerState: 'idle',
    secondsLeft: 25 * 60,
    sessionCount: 1,
    activeTaskId: null,
    tasks: [],
    deletedTasks: [],
    settings: DEFAULT_SETTINGS,
    streak: 0,
    todaySessions: 0,
    currentScreen: 'timer',
  };
}

type Action =
  | { type: 'SET_THEME'; theme: Theme }
  | { type: 'SET_THEME_SOURCE'; source: ThemeSource }
  | { type: 'SET_PALETTE'; palette: Palette }
  | { type: 'SET_TIMER_STYLE'; style: TimerStyle }
  | { type: 'SET_MODE'; mode: Mode }
  | { type: 'SET_TIMER_STATE'; state: TimerState }
  | { type: 'TICK' }
  | { type: 'TIMER_COMPLETE' }
  | { type: 'SKIP_SESSION' }
  | { type: 'RESET_TIMER' }
  | { type: 'SET_SCREEN'; screen: AppState['currentScreen'] }
  | { type: 'SET_ACTIVE_TASK'; id: string | null }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; task: Task }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'TOGGLE_TASK_COMPLETE'; id: string }
  | { type: 'RESTORE_TASK'; id: string }
  | { type: 'REMOVE_FROM_HISTORY'; id: string }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<Settings> }
  | { type: 'RESET_SETTINGS' }
  | { type: 'LOAD_FROM_DB'; tasks: Task[]; deletedTasks: DeletedTask[]; streak: number; todaySessions: number; prefs: Partial<{ themeSource: ThemeSource; palette: Palette; timerStyle: TimerStyle; settings: Settings }> };

function secsForMode(mode: Mode, settings: Settings): number {
  if (mode === 'focus') return settings.pomodoroMins * 60;
  if (mode === 'short') return settings.shortBreakMins * 60;
  return settings.longBreakMins * 60;
}

function nextMode(mode: Mode, sessionCount: number, longBreakAfter: number): Mode {
  if (mode !== 'focus') return 'focus';
  if (sessionCount % longBreakAfter === 0) return 'long';
  return 'short';
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.theme };
    case 'SET_THEME_SOURCE':
      return { ...state, themeSource: action.source, theme: resolveTheme(action.source) };
    case 'SET_PALETTE':
      return { ...state, palette: action.palette };
    case 'SET_TIMER_STYLE':
      return { ...state, timerStyle: action.style };
    case 'SET_MODE':
      return { ...state, mode: action.mode, timerState: 'idle', secondsLeft: secsForMode(action.mode, state.settings) };
    case 'SET_TIMER_STATE':
      return { ...state, timerState: action.state };
    case 'TICK':
      if (state.timerState !== 'running' || state.secondsLeft <= 0) return state;
      return { ...state, secondsLeft: state.secondsLeft - 1 };
    case 'TIMER_COMPLETE': {
      const newSessionCount = state.mode === 'focus' ? state.sessionCount + 1 : state.sessionCount;
      const newTodaySessions = state.mode === 'focus' ? state.todaySessions + 1 : state.todaySessions;
      // Increment streak on the first focus session of the day (todaySessions was 0 before this completion).
      const newStreak = state.mode === 'focus' && state.todaySessions === 0 ? state.streak + 1 : state.streak;
      // increment pomodoro done on active task
      const tasks = state.mode === 'focus' && state.activeTaskId
        ? state.tasks.map((t) => {
            if (t.id === state.activeTaskId && t.done < t.total) {
              const newDone = t.done + 1;
              const nowComplete = newDone >= t.total;
              return { ...t, done: newDone, completed: nowComplete, completedAt: nowComplete ? Date.now() : t.completedAt };
            }
            return t;
          })
        : state.tasks;
      const nm = nextMode(state.mode, state.sessionCount, state.settings.longBreakAfter);
      const autoStart = state.mode === 'focus' ? state.settings.autoStartBreaks : state.settings.autoStartPomodoros;
      return {
        ...state,
        timerState: autoStart ? 'running' : 'complete',
        mode: nm,
        secondsLeft: secsForMode(nm, state.settings),
        sessionCount: newSessionCount,
        todaySessions: newTodaySessions,
        streak: newStreak,
        tasks,
      };
    }
    case 'SKIP_SESSION': {
      const newSessionCount = state.mode === 'focus' ? state.sessionCount + 1 : state.sessionCount;
      const nm = nextMode(state.mode, state.sessionCount, state.settings.longBreakAfter);
      return {
        ...state,
        mode: nm,
        timerState: 'idle',
        secondsLeft: secsForMode(nm, state.settings),
        sessionCount: newSessionCount,
      };
    }
    case 'RESET_TIMER':
      return { ...state, timerState: 'idle', secondsLeft: secsForMode(state.mode, state.settings) };
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.screen };
    case 'SET_ACTIVE_TASK':
      return {
        ...state,
        activeTaskId: action.id,
        tasks: state.tasks.map((t) => ({ ...t, active: t.id === action.id })),
      };
    case 'ADD_TASK':
      return { ...state, tasks: [action.task, ...state.tasks] };
    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map((t) => t.id === action.task.id ? action.task : t) };
    case 'DELETE_TASK': {
      const target = state.tasks.find((t) => t.id === action.id);
      const archived: DeletedTask[] = target
        ? [{ ...target, deletedAt: Date.now() }, ...state.deletedTasks].slice(0, 50)
        : state.deletedTasks;
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.id),
        deletedTasks: archived,
        activeTaskId: state.activeTaskId === action.id ? null : state.activeTaskId,
      };
    }
    case 'TOGGLE_TASK_COMPLETE': {
      const toggled = state.tasks.map((t) => {
        if (t.id !== action.id) return t;
        const nowComplete = !t.completed;
        return { ...t, completed: nowComplete, completedAt: nowComplete ? Date.now() : undefined };
      });
      return { ...state, tasks: toggled };
    }
    case 'RESTORE_TASK': {
      const entry = state.deletedTasks.find((t) => t.id === action.id);
      if (!entry) return state;
      const { deletedAt: _d, ...restored } = entry;
      return {
        ...state,
        tasks: [{ ...restored, completed: false, active: false, completedAt: undefined }, ...state.tasks],
        deletedTasks: state.deletedTasks.filter((t) => t.id !== action.id),
      };
    }
    case 'REMOVE_FROM_HISTORY':
      return { ...state, deletedTasks: state.deletedTasks.filter((t) => t.id !== action.id) };
    case 'CLEAR_HISTORY':
      return {
        ...state,
        tasks: state.tasks.filter((t) => !t.completed),
        deletedTasks: [],
      };
    case 'UPDATE_SETTINGS': {
      const ns = { ...state.settings, ...action.settings };
      // If timer is idle, recalculate secondsLeft based on new settings
      const sl = state.timerState === 'idle' ? secsForMode(state.mode, ns) : state.secondsLeft;
      return { ...state, settings: ns, secondsLeft: sl };
    }
    case 'RESET_SETTINGS':
      return { ...state, settings: DEFAULT_SETTINGS, secondsLeft: secsForMode(state.mode, DEFAULT_SETTINGS) };
    case 'LOAD_FROM_DB': {
      const p = action.prefs;
      const src: ThemeSource = p.themeSource ?? state.themeSource;
      const resolvedTheme: Theme = src === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : src;
      const ns = { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) };
      return {
        ...state,
        tasks: action.tasks,
        deletedTasks: action.deletedTasks,
        themeSource: src,
        theme: resolvedTheme,
        palette: p.palette ?? state.palette,
        timerStyle: p.timerStyle ?? state.timerStyle,
        streak: action.streak,
        todaySessions: action.todaySessions,
        settings: ns,
        secondsLeft: state.timerState === 'idle' ? secsForMode(state.mode, ns) : state.secondsLeft,
      };
    }
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep a ref so the OS listener can read the current themeSource without re-subscribing
  const themeSourceRef = useRef(state.themeSource);
  useEffect(() => { themeSourceRef.current = state.themeSource; }, [state.themeSource]);

  // Sync theme with OS preference changes — only when user chose 'system'
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (themeSourceRef.current === 'system') {
        dispatch({ type: 'SET_THEME', theme: e.matches ? 'dark' : 'light' });
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Tick
  useEffect(() => {
    if (state.timerState === 'running') {
      tickRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    } else {
      if (tickRef.current) clearInterval(tickRef.current);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.timerState]);

  // Complete when secondsLeft hits 0
  useEffect(() => {
    if (state.timerState === 'running' && state.secondsLeft === 0) {
      dispatch({ type: 'TIMER_COMPLETE' });
      if (state.settings.soundEffects) playChime();
      if (state.settings.browserNotifications) {
        const label = MODES[state.mode].label;
        showNotification(`${label} complete!`, `Time for a ${state.mode === 'focus' ? 'break' : 'focus session'}.`);
      }
    }
  }, [state.secondsLeft, state.timerState, state.mode, state.settings]);

  // Update document title
  useEffect(() => {
    const label = MODES[state.mode].short;
    const t = formatTimeParts(state.secondsLeft);
    document.title = state.timerState === 'running' ? `${t} — ${label} · Cadence` : 'Cadence · Pomodoro';
  }, [state.secondsLeft, state.timerState, state.mode]);

  // Persist to localStorage (debounced: save only non-timer state to avoid excessive writes)
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => {
      const toSave = {
        theme: state.theme,
        themeSource: state.themeSource,
        palette: state.palette,
        timerStyle: state.timerStyle,
        tasks: state.tasks,
        deletedTasks: state.deletedTasks,
        settings: state.settings,
        streak: state.streak,
        todaySessions: state.todaySessions,
        lastSessionDate: state.todaySessions > 0 ? todayStr() : undefined,
        sessionCount: state.sessionCount,
        activeTaskId: state.activeTaskId,
      };
      localStorage.setItem('cadence-state', JSON.stringify(toSave));
    }, 500);
  }, [state.theme, state.palette, state.timerStyle, state.tasks, state.deletedTasks, state.settings, state.streak, state.todaySessions, state.sessionCount, state.activeTaskId]);

  const startTimer = useCallback(() => dispatch({ type: 'SET_TIMER_STATE', state: 'running' }), []);
  const pauseTimer = useCallback(() => dispatch({ type: 'SET_TIMER_STATE', state: 'paused' }), []);
  const resetTimer = useCallback(() => dispatch({ type: 'RESET_TIMER' }), []);
  const skipSession = useCallback(() => {
    dispatch({ type: 'SKIP_SESSION' });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, startTimer, pauseTimer, resetTimer, skipSession }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

function formatTimeParts(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function playChime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // AudioContext not available
  }
}

function showNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  } else if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission().then((p) => {
      if (p === 'granted') new Notification(title, { body });
    });
  }
}
