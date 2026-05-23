// Database operations — all queries go through here, never directly in components.
import { supabase } from './supabase';
import type { Task, Settings, ThemeSource, Palette, TimerStyle } from '../types';

// ── Types that mirror the DB rows ────────────────────────────────────────

interface DbTask {
  id: string;
  user_id: string;
  title: string;
  description: string;
  priority: string;
  tags: string[];
  done: number;
  total: number;
  completed: boolean;
  active: boolean;
  created_at: string;
}

interface DbPrefs {
  user_id: string;
  theme_source: ThemeSource;
  palette: Palette;
  timer_style: TimerStyle;
  streak: number;
  settings: Settings;
  updated_at: string;
}

// ── Mappers ──────────────────────────────────────────────────────────────

function dbTaskToTask(row: DbTask): Task {
  return {
    id: row.id,
    title: row.title,
    desc: row.description,
    priority: row.priority as Task['priority'],
    tags: row.tags ?? [],
    done: row.done,
    total: row.total,
    completed: row.completed,
    active: row.active,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function taskToDbTask(task: Omit<Task, 'id' | 'createdAt'>, userId: string) {
  return {
    user_id: userId,
    title: task.title,
    description: task.desc,
    priority: task.priority,
    tags: task.tags,
    done: task.done,
    total: task.total,
    completed: task.completed,
    active: task.active,
  };
}

// ── Tasks ────────────────────────────────────────────────────────────────

export async function fetchTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as DbTask[]).map(dbTaskToTask);
}

export async function insertTask(task: Task, userId: string): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...taskToDbTask(task, userId), id: task.id })
    .select()
    .single();

  if (error) throw error;
  return dbTaskToTask(data as DbTask);
}

export async function updateTask(task: Task, userId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update(taskToDbTask(task, userId))
    .eq('id', task.id)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function deleteTask(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

// ── Preferences ──────────────────────────────────────────────────────────

export async function fetchPrefs(userId: string): Promise<Partial<DbPrefs> | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as Partial<DbPrefs> | null;
}

export async function upsertPrefs(
  userId: string,
  prefs: {
    themeSource: ThemeSource;
    palette: Palette;
    timerStyle: TimerStyle;
    settings: Settings;
  }
): Promise<void> {
  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id:      userId,
      theme_source: prefs.themeSource,
      palette:      prefs.palette,
      timer_style:  prefs.timerStyle,
      settings:     prefs.settings,
      updated_at:   new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) throw error;
}

// ── Focus sessions ────────────────────────────────────────────────────────

export async function insertSession(
  userId: string,
  taskId: string | null,
  mode: 'focus' | 'short' | 'long',
  durationSecs: number
): Promise<void> {
  const { error } = await supabase
    .from('focus_sessions')
    .insert({ user_id: userId, task_id: taskId, mode, duration_secs: durationSecs });

  if (error) throw error;
}

export interface RawFocusSession {
  task_id: string | null;
  duration_secs: number;
  completed_at: string;
}

export async function fetchFocusSessions(userId: string): Promise<RawFocusSession[]> {
  const { data, error } = await supabase
    .from('focus_sessions')
    .select('task_id, duration_secs, completed_at')
    .eq('user_id', userId)
    .eq('mode', 'focus')
    .order('completed_at', { ascending: false });

  if (error) throw error;
  return data as RawFocusSession[];
}

// Returns YYYY-MM-DD strings for the last 90 days of focus sessions.
// Used to seed streak and todaySessions on login without fetching full session data.
export async function fetchSessionDates(userId: string): Promise<string[]> {
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const { data, error } = await supabase
    .from('focus_sessions')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('mode', 'focus')
    .gte('completed_at', since.toISOString());

  if (error) throw error;
  return (data as { completed_at: string }[]).map((r) => r.completed_at.slice(0, 10));
}
