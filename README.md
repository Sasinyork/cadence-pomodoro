# Cadence — Pomodoro & Task Manager

A focused productivity app built with React, TypeScript, and Supabase. Combines a Pomodoro timer with a task manager and session analytics — all synced to the cloud.

## Features

- **Pomodoro timer** — focus / short break / long break modes with configurable durations, auto-start, and progress visualization (bars or ring style)
- **Task manager** — add, edit, and prioritize tasks with tags and pomodoro targets; track per-task progress
- **Task history** — completed and deleted tasks are preserved in a history panel; restore or permanently remove entries; auto-expires after 30 days
- **Session analytics** — weekly focus chart, activity heatmap, hour distribution, time by tag — all computed from real session history
- **Streak tracking** — consecutive-day streaks derived from your focus session log
- **Cloud sync** — tasks, deleted task history, preferences, and session data stored in Supabase; syncs across devices
- **Auth** — passwordless magic-link sign-in via email (no password required)
- **Guest mode** — try the app without signing in; data stored locally
- **Theming** — light / dark / system modes with four color palettes (Classic, Sunset, Forest, Candy)
- **Keyboard shortcuts** — Space / R / S for timer control; `⌘⇧1-4` for navigation; `⌘K` to open the shortcuts panel
- **Pause when inactive** — timer auto-pauses when you switch tabs; resume manually when you return
- **Responsive** — dedicated mobile layout with tab navigation
- **Browser notifications** — session-complete alerts (with permission prompt)

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite |
| State | React Context + useReducer |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (magic link / OTP) |
| Styling | Inline styles with design tokens |
| Fonts | Inter (UI) · JetBrains Mono (numbers) |
| Deployment | Vercel |

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/Sasinyork/cadence-pomodoro.git
cd cadence-pomodoro
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the contents of `supabase/schema.sql` to create tables and RLS policies
3. Copy your **Project URL** and **Anon key** from **Settings → API**

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the dev server

```bash
npm run dev
```

## Deploying to Vercel

1. Push the repo to GitHub
2. Import the project in [vercel.com](https://vercel.com)
3. Add the two environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in **Project Settings → Environment Variables**
4. Deploy — Vercel detects Vite automatically

## Project structure

```
src/
├── components/
│   ├── analytics/      # StreakCard, TodayStats, WeeklyChart, HeatmapCard
│   ├── layout/         # Sidebar, MobileTabBar
│   ├── tasks/          # TaskCard, TaskFormModal, HistoryPanel
│   ├── timer/          # TimerCard
│   └── ui/             # Btn, PriorityDot, shared primitives
├── context/
│   ├── AppContext.tsx   # Global state (useReducer)
│   └── AuthContext.tsx  # Supabase auth session
├── hooks/
│   ├── useAnalytics.ts  # Fetches & computes analytics from focus_sessions
│   ├── useDbSync.ts     # Bridges AppContext ↔ Supabase
│   └── useEscapeKey.ts  # Shared Escape key handler for modals
├── lib/
│   ├── db.ts            # All Supabase queries
│   ├── supabase.ts      # Supabase client singleton
│   ├── tokens.ts        # Design tokens, color helpers
│   └── data.ts          # Utility formatters
├── screens/
│   ├── DashboardScreen  # Timer + task list + right panel
│   ├── AnalyticsScreen  # Stats and charts
│   ├── SettingsScreen   # Timer and app settings
│   ├── MobileScreen     # Tabbed mobile layout
│   └── LoginScreen      # Magic link sign-in
└── types/index.ts       # Shared TypeScript types
supabase/
└── schema.sql           # Tables + RLS policies (run once in Supabase SQL Editor)
tests/
└── app.spec.ts          # Playwright end-to-end tests
playwright.config.ts     # Playwright config (targets localhost:5173)
```

## Testing

End-to-end tests run against the dev server with Playwright:

```bash
npx playwright test
```

Covers guest mode, timer controls (including keyboard shortcuts), task CRUD, and sidebar navigation.

## Database schema

Four tables, all protected by Row Level Security (users can only access their own rows):

- **`tasks`** — task records with title, priority, tags, pomodoro progress
- **`deleted_tasks`** — archived deleted tasks with a 30-day TTL; purged automatically on login
- **`user_preferences`** — theme, palette, timer style, settings per user
- **`focus_sessions`** — log of every completed pomodoro with duration and linked task

## License

MIT
