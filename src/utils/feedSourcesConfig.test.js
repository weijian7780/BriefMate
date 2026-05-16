import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('feed source configuration', () => {
  it('defines editable collector sources in a feed_sources migration', () => {
    const migrationName = readdirSync('supabase/migrations').find((name) =>
      name.includes('feed_sources')
    );

    expect(migrationName).toBeDefined();

    const sql = readFileSync(path.join('supabase/migrations', migrationName), 'utf8');
    const seededGithubSources = sql.match(/\(\s*'[^']+'\s*,\s*'[^']+'\s*,\s*'github_release'/g) || [];

    expect(sql).toContain('create table if not exists public.feed_sources');
    expect(seededGithubSources.length).toBeGreaterThan(5);
  });

  it('makes the collector read active sources from feed_sources', () => {
    const code = readFileSync('supabase/functions/collect-tech-signals/index.ts', 'utf8');

    expect(code).toContain('.from("feed_sources")');
    expect(code).toContain('.eq("active", true)');
    expect(code).not.toContain('const sources = [');
  });
});
