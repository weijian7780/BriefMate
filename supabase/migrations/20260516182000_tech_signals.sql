create table if not exists public.tech_signals (
  id text primary key,
  title text not null,
  category text not null,
  relevance integer not null default 0 check (relevance >= 0 and relevance <= 100),
  priority text not null default 'Save for Later',
  stack_match text not null default 'No stack match',
  summary text not null default '',
  what_happened text not null default '',
  beginner_explanation text not null default '',
  why_matters text not null default '',
  risk_level text not null default 'Low' check (risk_level in ('Low', 'Medium', 'High')),
  recommended_action text not null default '',
  resources text[] not null default '{}',
  source_name text not null default '',
  source_url text not null default '',
  published_at timestamptz,
  collected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  active boolean not null default true
);

create index if not exists tech_signals_active_published_idx
  on public.tech_signals (active, published_at desc, collected_at desc);

alter table public.tech_signals enable row level security;

drop policy if exists "Authenticated users can read active tech signals"
  on public.tech_signals;

create policy "Authenticated users can read active tech signals"
  on public.tech_signals for select
  to authenticated
  using (active = true);

insert into public.tech_signals (
  id,
  title,
  category,
  relevance,
  priority,
  stack_match,
  summary,
  what_happened,
  beginner_explanation,
  why_matters,
  risk_level,
  recommended_action,
  resources,
  source_name,
  source_url,
  published_at
) values
(
  'firebase-pricing',
  'Firebase pricing update',
  'Backend',
  86,
  'Review This Week',
  'Firebase',
  'Firebase has updated its Blaze plan pricing with new tiered rates for Cloud Functions, Firestore reads, and Storage bandwidth starting next month.',
  'Google announced changes to Firebase Blaze plan pricing affecting Cloud Functions invocations, Firestore document reads, and outbound Storage bandwidth. Some free-tier limits have also been adjusted.',
  'Firebase is the cloud backend you use to store data, authenticate users, and run server code. They are changing how much it costs once your app gets popular.',
  'You listed Firebase in your stack and your current project may depend on Firestore or Cloud Functions. Knowing the new limits helps you avoid surprise bills.',
  'Medium',
  'Review your Firestore read patterns. Cache data on the client when possible and batch reads.',
  array['Firebase Pricing Docs', 'Firestore Best Practices'],
  'BriefMate seed data',
  'https://firebase.google.com/pricing',
  '2026-05-16T00:00:00Z'
),
(
  'gemini-2-5-flash',
  'Gemini 2.5 Flash release',
  'AI Tools',
  91,
  'Check Today',
  'Gemini API',
  'Google released Gemini 2.5 Flash with faster inference, lower latency, and improved reasoning at a reduced API cost.',
  'Google shipped Gemini 2.5 Flash, a faster and cheaper model option for API-backed AI features.',
  'Gemini is Google''s AI model that you can call from your code. Flash is a lighter, faster version for responsive app features.',
  'You use the Gemini API in your stack. A faster model can make AI features feel better during demos.',
  'Low',
  'Test the model in one branch before changing your main app.',
  array['Gemini API Docs', 'Model comparison guide'],
  'BriefMate seed data',
  'https://ai.google.dev/gemini-api/docs/models',
  '2026-05-16T00:00:00Z'
),
(
  'react-compiler',
  'React compiler update',
  'Frontend',
  18,
  'Ignore for Now',
  'No stack match',
  'The React team shipped a stable release of the React Compiler that auto-memoizes components without manual useMemo or useCallback.',
  'React Compiler reached stable status and can optimize component rendering at build time.',
  'React Compiler helps reduce manual memoization work in React projects.',
  'If React is not in your selected stack, this is low priority right now.',
  'Low',
  'No action needed unless you start or maintain a React project.',
  array['React Compiler Docs'],
  'BriefMate seed data',
  'https://react.dev/learn/react-compiler',
  '2026-05-16T00:00:00Z'
),
(
  'nextjs-15',
  'Next.js 15 stable release',
  'Frontend',
  72,
  'Review This Week',
  'Next.js',
  'Next.js 15 ships with React support changes, updated caching defaults, and a faster development path.',
  'Next.js changed several defaults that can affect how app data is fetched and cached.',
  'Next.js is a React framework. Version changes can affect tutorials and old project code.',
  'Knowing the caching changes can save debugging time when your app data looks stale.',
  'Medium',
  'Read the upgrade guide before bumping an existing project.',
  array['Next.js upgrade guide'],
  'BriefMate seed data',
  'https://nextjs.org/docs',
  '2026-05-16T00:00:00Z'
),
(
  'supabase-auth',
  'Supabase Auth gets passkeys',
  'Backend',
  65,
  'Review This Week',
  'Supabase',
  'Supabase Auth supports passkeys for passwordless sign-in using device authentication.',
  'Supabase added passkey support to its authentication product.',
  'Passkeys let users sign in with device security instead of remembering passwords.',
  'This can improve your authentication UX if you want a stronger portfolio feature later.',
  'Low',
  'Keep this as a later enhancement after your main auth and profile storage are stable.',
  array['Supabase Auth Docs', 'WebAuthn overview'],
  'BriefMate seed data',
  'https://supabase.com/docs/guides/auth',
  '2026-05-16T00:00:00Z'
)
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  relevance = excluded.relevance,
  priority = excluded.priority,
  stack_match = excluded.stack_match,
  summary = excluded.summary,
  what_happened = excluded.what_happened,
  beginner_explanation = excluded.beginner_explanation,
  why_matters = excluded.why_matters,
  risk_level = excluded.risk_level,
  recommended_action = excluded.recommended_action,
  resources = excluded.resources,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  published_at = excluded.published_at,
  updated_at = now(),
  active = true;
