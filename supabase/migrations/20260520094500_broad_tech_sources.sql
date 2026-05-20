alter table public.feed_sources
  drop constraint if exists feed_sources_source_type_check;

alter table public.feed_sources
  add constraint feed_sources_source_type_check
  check (source_type in ('github_release', 'rss', 'api', 'event', 'changelog'));

update public.feed_sources
set category = case category
  when 'AI Tools' then 'AI / Models'
  when 'Frontend' then 'Web Dev'
  when 'Backend' then 'Backend / Cloud'
  when 'DevOps' then 'Developer Tools'
  else category
end,
updated_at = now()
where category in ('AI Tools', 'Frontend', 'Backend', 'DevOps');

update public.tech_signals
set category = case category
  when 'AI Tools' then 'AI / Models'
  when 'Frontend' then 'Web Dev'
  when 'Backend' then 'Backend / Cloud'
  when 'DevOps' then 'Developer Tools'
  else category
end,
updated_at = now()
where category in ('AI Tools', 'Frontend', 'Backend', 'DevOps');

insert into public.feed_sources (
  id,
  name,
  source_type,
  url,
  category,
  stack_match,
  active
) values
('google-io-official', 'Google I/O official updates', 'event', 'https://developers.googleblog.com/feeds/posts/default', 'Events', 'Google I/O', true),
('google-developers-rss', 'Google Developers Blog', 'rss', 'https://developers.googleblog.com/feeds/posts/default', 'Developer Tools', 'Google Developers', true),
('openai-news-rss', 'OpenAI News', 'rss', 'https://openai.com/news/rss.xml', 'AI / Models', 'OpenAI API', true),
('anthropic-news-rss', 'Anthropic News', 'rss', 'https://www.anthropic.com/news/rss.xml', 'AI / Models', 'Claude API', true),
('android-developers-rss', 'Android Developers Blog', 'rss', 'https://android-developers.googleblog.com/feeds/posts/default', 'Mobile', 'Android', true),
('apple-developer-news-rss', 'Apple Developer News', 'rss', 'https://developer.apple.com/news/rss/news.rss', 'Mobile', 'iOS', true),
('vercel-changelog-rss', 'Vercel Changelog', 'changelog', 'https://vercel.com/changelog.rss', 'Backend / Cloud', 'Vercel', true),
('github-changelog-rss', 'GitHub Changelog', 'changelog', 'https://github.blog/changelog/feed/', 'Developer Tools', 'GitHub', true),
('aws-whats-new-rss', 'AWS What''s New', 'rss', 'https://aws.amazon.com/about-aws/whats-new/recent/feed/', 'Backend / Cloud', 'AWS', true),
('github-security-rss', 'GitHub Security Blog', 'rss', 'https://github.blog/security/feed/', 'Security', 'GitHub Security', true),
('snyk-security-rss', 'Snyk Security Blog', 'rss', 'https://snyk.io/blog/feed/', 'Security', 'Security', true),
('postgresql-news-rss', 'PostgreSQL News', 'rss', 'https://www.postgresql.org/about/news/rss/', 'Database', 'PostgreSQL', true),
('mongodb-blog-rss', 'MongoDB Blog', 'rss', 'https://www.mongodb.com/company/blog/rss', 'Database', 'MongoDB', true),
('firebase-blog-rss', 'Firebase Blog', 'rss', 'https://firebase.googleblog.com/feeds/posts/default', 'Backend / Cloud', 'Firebase', true),
('cloudflare-blog-rss', 'Cloudflare Blog', 'rss', 'https://blog.cloudflare.com/rss/', 'Pricing / Policy', 'Cloudflare', true)
on conflict (id) do update set
  name = excluded.name,
  source_type = excluded.source_type,
  url = excluded.url,
  category = excluded.category,
  stack_match = excluded.stack_match,
  active = excluded.active,
  updated_at = now();
