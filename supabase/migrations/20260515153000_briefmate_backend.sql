create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  onboarded boolean not null default false,
  skill_level text not null default '',
  role text not null default '',
  stack text[] not null default '{}',
  current_project text not null default '',
  learning_goal text not null default '',
  deadline text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_signals (
  user_id uuid not null references auth.users(id) on delete cascade,
  signal_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, signal_id)
);

create table if not exists public.decoded_signals (
  user_id uuid not null references auth.users(id) on delete cascade,
  signal_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, signal_id)
);

create table if not exists public.useful_signals (
  user_id uuid not null references auth.users(id) on delete cascade,
  signal_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, signal_id)
);

alter table public.profiles enable row level security;
alter table public.saved_signals enable row level security;
alter table public.decoded_signals enable row level security;
alter table public.useful_signals enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own profile"
  on public.profiles for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can read own saved signals"
  on public.saved_signals for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own saved signals"
  on public.saved_signals for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own saved signals"
  on public.saved_signals for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can read own decoded signals"
  on public.decoded_signals for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own decoded signals"
  on public.decoded_signals for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can read own useful signals"
  on public.useful_signals for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own useful signals"
  on public.useful_signals for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own useful signals"
  on public.useful_signals for delete
  to authenticated
  using (auth.uid() = user_id);
