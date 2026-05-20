import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('feed source configuration', () => {
  function readFeedSourceMigrations() {
    return readdirSync('supabase/migrations')
      .filter((name) => name.includes('feed_sources') || name.includes('broad_tech_sources'))
      .map((name) => readFileSync(path.join('supabase/migrations', name), 'utf8'))
      .join('\n');
  }

  it('defines editable collector sources in a feed_sources migration', () => {
    const sql = readFeedSourceMigrations();
    const seededGithubSources = sql.match(/\(\s*'[^']+'\s*,\s*'[^']+'\s*,\s*'github_release'/g) || [];

    expect(sql).toContain('create table if not exists public.feed_sources');
    expect(seededGithubSources.length).toBeGreaterThan(5);
  });

  it('covers broad technology signal categories and source types', () => {
    const sql = readFeedSourceMigrations();
    const expectedCategories = [
      'AI / Models',
      'Web Dev',
      'Backend / Cloud',
      'Mobile',
      'Database',
      'Security',
      'Events',
      'Pricing / Policy',
      'Developer Tools',
    ];

    for (const category of expectedCategories) {
      expect(sql).toContain(`'${category}'`);
    }

    expect(sql).toContain("'rss'");
    expect(sql).toContain("'event'");
    expect(sql).toContain("'changelog'");
    expect(sql).toContain('Google I/O');
    expect(sql).toContain('OpenAI');
    expect(sql).toContain('GitHub Security');
  });

  it('makes the collector read active sources from feed_sources', () => {
    const code = readFileSync('supabase/functions/collect-tech-signals/index.ts', 'utf8');

    expect(code).toContain('.from("feed_sources")');
    expect(code).toContain('.eq("active", true)');
    expect(code).not.toContain('const sources = [');
  });

  it('makes the collector normalize RSS, event, and changelog feeds into tech signals', () => {
    const code = readFileSync('supabase/functions/collect-tech-signals/index.ts', 'utf8');

    expect(code).toContain('fetchLatestFeedSignal');
    expect(code).toContain('findRelevantFeedEntry');
    expect(code).toContain('source.source_type === "rss"');
    expect(code).toContain('source.source_type === "event"');
    expect(code).toContain('source.source_type === "changelog"');
    expect(code).toContain('extractFeedEntries');
  });
});
