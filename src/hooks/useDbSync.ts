// Syncs AppContext state to/from Supabase when the user is logged in.
// AppContext itself stays unaware of Supabase — this hook bridges them.
import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { fetchTasks, fetchPrefs, fetchSessionDates, insertTask, updateTask, deleteTask, upsertPrefs, insertSession, fetchDeletedTasks, insertDeletedTask, removeDeletedTask, purgeExpiredDeletedTasks } from '../lib/db';
import type { Task, DeletedTask } from '../types';

export function useDbSync(userId: string | null) {
  const { state, dispatch } = useApp();

  // ── On login: load the user's data from Supabase ──────────────────────
  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        await purgeExpiredDeletedTasks(userId);
        const [tasks, deletedTasks, prefs, sessionDates] = await Promise.all([
          fetchTasks(userId),
          fetchDeletedTasks(userId),
          fetchPrefs(userId),
          fetchSessionDates(userId),
        ]);

        // Compute streak: consecutive days of focus ending today
        const focusDates = new Set(sessionDates);
        let streak = 0;
        const cursor = new Date();
        while (focusDates.has(cursor.toISOString().slice(0, 10))) {
          streak++;
          cursor.setDate(cursor.getDate() - 1);
        }

        const todayStr = new Date().toISOString().slice(0, 10);
        const todaySessions = sessionDates.filter((d) => d === todayStr).length;

        dispatch({
          type: 'LOAD_FROM_DB',
          tasks,
          deletedTasks,
          streak,
          todaySessions,
          prefs: prefs ? {
            themeSource: prefs.theme_source,
            palette:     prefs.palette,
            timerStyle:  prefs.timer_style,
            settings:    prefs.settings,
          } : {},
        });
        // Seed refs so the sync effects don't treat loaded data as new inserts.
        prevTasksRef.current = tasks;
        prevDeletedTasksRef.current = deletedTasks;
      } catch (err) {
        console.error('[DbSync] Failed to load from Supabase:', err);
      }
    })();
  }, [userId]);

  // ── Track previous state so we can detect adds/updates/deletes ───────
  // Initialized to null so we can skip the first run after LOAD_FROM_DB.
  const prevTasksRef = useRef<Task[] | null>(null);
  const prevDeletedTasksRef = useRef<DeletedTask[] | null>(null);

  useEffect(() => {
    if (!userId) return;
    if (prevTasksRef.current === null) return; // wait for LOAD_FROM_DB

    const prev = prevTasksRef.current;
    const curr = state.tasks;
    // eslint-disable-next-line react-hooks/immutability
    prevTasksRef.current = curr;

    const prevMap = new Map(prev.map((t) => [t.id, t]));
    const currMap = new Map(curr.map((t) => [t.id, t]));

    // Deleted
    for (const [id] of prevMap) {
      if (!currMap.has(id)) {
        deleteTask(id, userId).catch(console.error);
      }
    }

    // Added
    for (const [id, task] of currMap) {
      if (!prevMap.has(id)) {
        insertTask(task, userId).catch(console.error);
      }
    }

    // Updated
    for (const [id, task] of currMap) {
      const old = prevMap.get(id);
      if (old && JSON.stringify(old) !== JSON.stringify(task)) {
        updateTask(task, userId).catch(console.error);
      }
    }
  }, [state.tasks, userId]);

  // ── Sync deleted tasks history ────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    if (prevDeletedTasksRef.current === null) return;

    const prev = prevDeletedTasksRef.current;
    const curr = state.deletedTasks;
    // eslint-disable-next-line react-hooks/immutability
    prevDeletedTasksRef.current = curr;

    const prevIds = new Set(prev.map((t) => t.id));
    const currIds = new Set(curr.map((t) => t.id));

    for (const t of prev) {
      if (!currIds.has(t.id)) removeDeletedTask(t.id, userId).catch(console.error);
    }
    for (const t of curr) {
      if (!prevIds.has(t.id)) insertDeletedTask(t, userId).catch(console.error);
    }
  }, [state.deletedTasks, userId]);

  // ── Debounced preferences sync ─────────────────────────────────────────
  const prefsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!userId) return;

    if (prefsTimerRef.current) clearTimeout(prefsTimerRef.current);
    prefsTimerRef.current = setTimeout(() => {
      upsertPrefs(userId, {
        themeSource: state.themeSource,
        palette:     state.palette,
        timerStyle:  state.timerStyle,
        settings:    state.settings,
      }).catch(console.error);
    }, 1000);
  }, [state.themeSource, state.palette, state.timerStyle, state.settings, userId]);

  // ── Record focus sessions when a pomodoro completes ───────────────────
  const prevTimerStateRef = useRef(state.timerState);
  const prevModeRef       = useRef(state.mode);
  useEffect(() => {
    const wasRunning = prevTimerStateRef.current === 'running';
    const justCompleted = state.timerState === 'complete' || (wasRunning && state.timerState !== 'running' && state.secondsLeft === 0);
    prevTimerStateRef.current = state.timerState;

    if (userId && wasRunning && justCompleted) {
      const mode = prevModeRef.current;
      const durationSecs = mode === 'focus' ? state.settings.pomodoroMins * 60
        : mode === 'short' ? state.settings.shortBreakMins * 60
        : state.settings.longBreakMins * 60;
      insertSession(userId, state.activeTaskId, mode, durationSecs).catch(console.error);
    }

    prevModeRef.current = state.mode;
  }, [state.timerState]);
}
