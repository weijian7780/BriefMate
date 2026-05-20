alter table public.profiles
  add column if not exists display_name text not null default '',
  add column if not exists primary_stack text[] not null default '{}',
  add column if not exists signal_preferences text[] not null default '{}',
  add column if not exists muted_topics text[] not null default '{}',
  add column if not exists project_stage text not null default '';
