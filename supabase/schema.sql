-- ============================================================
-- Cadence — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Tasks
create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  description text not null default '',
  priority    text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  tags        text[] not null default '{}',
  done        integer not null default 0,
  total       integer not null default 1,
  completed   boolean not null default false,
  active      boolean not null default false,
  created_at  timestamptz not null default now()
);

-- User preferences (one row per user)
create table if not exists user_preferences (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  theme_source text not null default 'system',
  palette      text not null default 'classic',
  timer_style  text not null default 'bars',
  streak       integer not null default 0,
  settings     jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now()
);

-- Focus sessions (for analytics)
create table if not exists focus_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  task_id      uuid references tasks(id) on delete set null,
  mode         text not null check (mode in ('focus', 'short', 'long')),
  duration_secs integer not null,
  completed_at  timestamptz not null default now()
);

-- ── Row Level Security ──────────────────────────────────────
-- Users can only read/write their own rows.

alter table tasks             enable row level security;
alter table user_preferences  enable row level security;
alter table focus_sessions    enable row level security;

-- tasks
create policy "tasks: owner access"
  on tasks for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- user_preferences
create policy "prefs: owner access"
  on user_preferences for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- focus_sessions
create policy "sessions: owner access"
  on focus_sessions for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Indexes ─────────────────────────────────────────────────
create index if not exists tasks_user_id_idx           on tasks (user_id);
create index if not exists focus_sessions_user_id_idx  on focus_sessions (user_id);
create index if not exists focus_sessions_completed_idx on focus_sessions (user_id, completed_at desc);

-- ── deleted_tasks ────────────────────────────────────────────
create table if not exists deleted_tasks (
  id           uuid        primary key,
  user_id      uuid        references auth.users(id) on delete cascade not null,
  title        text        not null,
  description  text        default '',
  priority     text        default 'medium',
  tags         text[]      default '{}',
  done         integer     default 0,
  total        integer     default 1,
  completed    boolean     default false,
  active       boolean     default false,
  created_at   timestamptz not null,
  completed_at timestamptz,
  deleted_at   timestamptz not null default now(),
  expires_at   timestamptz not null
);

alter table deleted_tasks enable row level security;

create policy "deleted_tasks: owner access"
  on deleted_tasks for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists deleted_tasks_user_id_idx  on deleted_tasks (user_id);
create index if not exists deleted_tasks_expires_idx  on deleted_tasks (user_id, expires_at);
