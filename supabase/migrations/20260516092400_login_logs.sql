create table if not exists public.login_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('login', 'logout')),
  email text,
  provider text not null default 'unknown',
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists login_logs_user_created_at_idx
  on public.login_logs (user_id, created_at desc);

alter table public.login_logs enable row level security;

create policy "Users can read own login logs"
  on public.login_logs for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own login logs"
  on public.login_logs for insert
  to authenticated
  with check (auth.uid() = user_id);
