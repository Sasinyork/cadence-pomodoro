export type Mode = 'focus' | 'short' | 'long';
export type Theme = 'light' | 'dark';
export type ThemeSource = 'system' | 'light' | 'dark';
export type Palette = 'classic' | 'sunset' | 'forest' | 'candy';
export type TimerStyle = 'bars' | 'circle';
export type TimerState = 'idle' | 'running' | 'paused' | 'complete';
export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  desc: string;
  priority: Priority;
  tags: string[];
  done: number;
  total: number;
  completed: boolean;
  active: boolean;
  createdAt: number;
  completedAt?: number;
}

export interface DeletedTask extends Task {
  deletedAt: number;
}

export interface Settings {
  pomodoroMins: number;
  shortBreakMins: number;
  longBreakMins: number;
  longBreakAfter: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  pauseWhenInactive: boolean;
  browserNotifications: boolean;
  soundEffects: boolean;
  ambientTrack: string;
}

export interface AppState {
  theme: Theme;
  themeSource: ThemeSource;
  palette: Palette;
  timerStyle: TimerStyle;
  mode: Mode;
  timerState: TimerState;
  secondsLeft: number;
  sessionCount: number;
  activeTaskId: string | null;
  tasks: Task[];
  deletedTasks: DeletedTask[];
  settings: Settings;
  streak: number;
  todaySessions: number;
  currentScreen: 'timer' | 'tasks' | 'analytics' | 'settings';
}

export interface SurfaceTokens {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderSoft: string;
  text: string;
  textMuted: string;
  textFaint: string;
  shadow: string;
  shadowLift: string;
}

export interface ModeTokens {
  light: string;
  main: string;
  dark: string;
  label: string;
  short: string;
}
