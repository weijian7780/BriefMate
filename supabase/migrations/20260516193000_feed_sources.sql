create table if not exists public.feed_sources (
  id text primary key,
  name text not null,
  source_type text not null check (source_type in ('github_release', 'rss', 'api')),
  url text not null,
  category text not null,
  stack_match text not null default 'General',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists feed_sources_active_type_idx
  on public.feed_sources (active, source_type);

alter table public.feed_sources enable row level security;

drop policy if exists "Authenticated users can read active feed sources"
  on public.feed_sources;

create policy "Authenticated users can read active feed sources"
  on public.feed_sources for select
  to authenticated
  using (active = true);

insert into public.feed_sources (
  id,
  name,
  source_type,
  url,
  category,
  stack_match,
  active
) values
('nextjs-github', 'Next.js GitHub releases', 'github_release', 'vercel/next.js', 'Frontend', 'Next.js', true),
('react-github', 'React GitHub releases', 'github_release', 'facebook/react', 'Frontend', 'React', true),
('tailwind-github', 'Tailwind CSS GitHub releases', 'github_release', 'tailwindlabs/tailwindcss', 'Frontend', 'Tailwind CSS', true),
('vite-github', 'Vite GitHub releases', 'github_release', 'vitejs/vite', 'Frontend', 'Vite', true),
('vue-github', 'Vue GitHub releases', 'github_release', 'vuejs/core', 'Frontend', 'Vue', true),
('svelte-github', 'Svelte GitHub releases', 'github_release', 'sveltejs/svelte', 'Frontend', 'Svelte', true),
('angular-github', 'Angular GitHub releases', 'github_release', 'angular/angular', 'Frontend', 'Angular', true),
('supabase-github', 'Supabase GitHub releases', 'github_release', 'supabase/supabase', 'Backend', 'Supabase', true),
('nodejs-github', 'Node.js GitHub releases', 'github_release', 'nodejs/node', 'Backend', 'Node.js', true),
('nestjs-github', 'NestJS GitHub releases', 'github_release', 'nestjs/nest', 'Backend', 'NestJS', true),
('prisma-github', 'Prisma GitHub releases', 'github_release', 'prisma/prisma', 'Database', 'Prisma', true),
('mongodb-js-github', 'MongoDB Node.js Driver GitHub releases', 'github_release', 'mongodb/node-mongodb-native', 'Database', 'MongoDB', true),
('flutter-github', 'Flutter GitHub releases', 'github_release', 'flutter/flutter', 'Mobile', 'Flutter', true),
('react-native-github', 'React Native GitHub releases', 'github_release', 'facebook/react-native', 'Mobile', 'React Native', true),
('expo-github', 'Expo GitHub releases', 'github_release', 'expo/expo', 'Mobile', 'Expo', true),
('langchain-github', 'LangChain JS GitHub releases', 'github_release', 'langchain-ai/langchainjs', 'AI Tools', 'LangChain', true),
('tensorflow-github', 'TensorFlow GitHub releases', 'github_release', 'tensorflow/tensorflow', 'AI Tools', 'TensorFlow', true),
('pytorch-github', 'PyTorch GitHub releases', 'github_release', 'pytorch/pytorch', 'AI Tools', 'PyTorch', true),
('kubernetes-github', 'Kubernetes GitHub releases', 'github_release', 'kubernetes/kubernetes', 'DevOps', 'Kubernetes', true)
on conflict (id) do update set
  name = excluded.name,
  source_type = excluded.source_type,
  url = excluded.url,
  category = excluded.category,
  stack_match = excluded.stack_match,
  active = excluded.active,
  updated_at = now();
