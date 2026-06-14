import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchFocusSessions } from '../lib/db';
import type { Task } from '../types';

export interface WeekDay {
  day: string;
  mins: number;
  sessions: number;
}

export interface TagStat {
  tag: string;
  mins: number;
  pct: number;
}

export interface AnalyticsData {
  loading: boolean;
  totalFocusSecs: number;
  todaySessions: number;
  streak: number;
  avgSessionSecs: number;
  weekFocus: WeekDay[];
  weekTotalSecs: number;
  heatmap: number[];
  heatmapTotal: number;
  hourDistribution: number[];
  timeByTag: TagStat[];
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function emptyWeekFocus(): WeekDay[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { day: DAY_LABELS[d.getDay()], mins: 0, sessions: 0 };
  });
}

const EMPTY: AnalyticsData = {
  loading: false,
  totalFocusSecs: 0,
  todaySessions: 0,
  streak: 0,
  avgSessionSecs: 0,
  weekFocus: emptyWeekFocus(),
  weekTotalSecs: 0,
  heatmap: Array(35).fill(0),
  heatmapTotal: 0,
  hourDistribution: Array(24).fill(0),
  timeByTag: [],
};

// refreshKey should be state.todaySessions — triggers a re-fetch when a session completes.
export function useAnalytics(tasks: Task[], refreshKey: number): AnalyticsData {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [data, setData] = useState<AnalyticsData>({ ...EMPTY, loading: !!userId });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!userId) { setData(EMPTY); return; }

    setData((prev) => ({ ...prev, loading: true }));

    fetchFocusSessions(userId)
      .then((sessions) => {
        const today = new Date();
        const todayStr = isoDate(today);

        const totalFocusSecs = sessions.reduce((s, r) => s + r.duration_secs, 0);
        const todaySessions = sessions.filter((s) => s.completed_at.slice(0, 10) === todayStr).length;
        const avgSessionSecs = sessions.length > 0 ? Math.round(totalFocusSecs / sessions.length) : 0;

        // Streak: count consecutive days ending today
        const focusDates = new Set(sessions.map((s) => s.completed_at.slice(0, 10)));
        let streak = 0;
        const cursor = new Date(today);
        while (focusDates.has(isoDate(cursor))) {
          streak++;
          cursor.setDate(cursor.getDate() - 1);
        }

        // Last 7 days
        const weekFocus: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() - (6 - i));
          const ds = isoDate(d);
          const daySessions = sessions.filter((s) => s.completed_at.slice(0, 10) === ds);
          return {
            day: DAY_LABELS[d.getDay()],
            mins: Math.round(daySessions.reduce((sum, s) => sum + s.duration_secs, 0) / 60),
            sessions: daySessions.length,
          };
        });
        const weekTotalSecs = weekFocus.reduce((sum, d) => sum + d.mins * 60, 0);

        // Last 35 days heatmap (5 weeks × 7 days)
        const heatmap: number[] = Array.from({ length: 35 }, (_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() - (34 - i));
          return sessions.filter((s) => s.completed_at.slice(0, 10) === isoDate(d)).length;
        });
        const heatmapTotal = heatmap.reduce((a, b) => a + b, 0);

        // Hour distribution (seconds of focus per hour of day)
        const hourDistribution = new Array(24).fill(0);
        for (const s of sessions) {
          hourDistribution[new Date(s.completed_at).getHours()] += s.duration_secs;
        }

        // Time by tag — join sessions → tasks → tags client-side
        const taskTagMap = new Map<string, string[]>(tasks.map((t) => [t.id, t.tags]));
        const tagSecs = new Map<string, number>();
        for (const s of sessions) {
          if (!s.task_id) continue;
          for (const tag of taskTagMap.get(s.task_id) ?? []) {
            tagSecs.set(tag, (tagSecs.get(tag) ?? 0) + s.duration_secs);
          }
        }
        const totalTagSecs = [...tagSecs.values()].reduce((a, b) => a + b, 0);
        const timeByTag: TagStat[] = [...tagSecs.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([tag, secs]) => ({
            tag,
            mins: Math.round(secs / 60),
            pct: totalTagSecs > 0 ? Math.round((secs / totalTagSecs) * 100) : 0,
          }));

        setData({
          loading: false,
          totalFocusSecs,
          todaySessions,
          streak,
          avgSessionSecs,
          weekFocus,
          weekTotalSecs,
          heatmap,
          heatmapTotal,
          hourDistribution,
          timeByTag,
        });
      })
      .catch((err) => {
        console.error('[useAnalytics]', err);
        setData((prev) => ({ ...prev, loading: false }));
      });
  }, [userId, refreshKey]);

  return data;
}
