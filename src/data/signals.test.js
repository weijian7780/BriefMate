import { describe, expect, it, vi } from 'vitest';
import { CATEGORIES, getTodaySignals, personalizeSignal } from './signals';

describe('personalizeSignal', () => {
  it('recalculates relevance and risk from the user profile', () => {
    const signal = {
      id: 'cloudflare-agents',
      title: 'Announcing Claude Managed Agents on Cloudflare',
      category: 'Pricing / Policy',
      relevance: 38,
      riskLevel: 'Low',
      priority: 'Save for Later',
      stackMatch: 'Cloudflare',
      summary: 'Cloudflare now supports managed agent workloads.',
      whyMatters: 'Base collector explanation.',
      publishedAt: '2026-05-20T08:00:00.000Z',
    };

    const matchedProfile = {
      stack: ['Cloudflare', 'Next.js'],
      currentProject: 'Deploy a Cloudflare Worker for an AI agent prototype',
      learningGoal: 'Backend',
      deadline: 'This Week',
    };
    const unrelatedProfile = {
      stack: ['Flutter'],
      currentProject: 'Mobile habit tracker',
      learningGoal: 'Mobile',
      deadline: 'No Deadline',
    };

    const matched = personalizeSignal(matchedProfile, signal);
    const unrelated = personalizeSignal(unrelatedProfile, signal);

    expect(matched.relevance).toBeGreaterThan(unrelated.relevance);
    expect(matched.riskLevel).toBe('High');
    expect(matched.stackMatch).toBe('Cloudflare');
    expect(matched.whyMatters).toContain('Cloudflare');
    expect(matched.baseRelevance).toBe(38);
    expect(matched.baseRiskLevel).toBe('Low');
    expect(unrelated.riskLevel).toBe('Medium');
  });
});

describe('getTodaySignals', () => {
  it('only returns fresh live signals for the Today page', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-19T12:00:00.000Z'));

    const signals = [
      {
        id: 'old-gemini',
        title: 'Gemini 2.5 Flash release',
        relevance: 91,
        priority: 'Check Today',
        stackMatch: 'Gemini API',
        publishedAt: '2026-05-16T00:00:00.000Z',
      },
      {
        id: 'fresh-ai',
        title: 'AI-driven development - It is a spectrum',
        relevance: 62,
        priority: 'Save for Later',
        stackMatch: 'No stack match',
        publishedAt: '2026-05-19T09:14:33.000Z',
      },
    ];

    expect(getTodaySignals({ stack: ['Gemini API'] }, signals)).toEqual([
      expect.objectContaining({ id: 'fresh-ai' }),
    ]);
    vi.useRealTimers();
  });

  it('prioritizes signals by personalized relevance for the Today page', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-20T12:00:00.000Z'));

    const signals = [
      {
        id: 'unrelated-security',
        title: 'Critical Kubernetes vulnerability',
        category: 'Security',
        relevance: 90,
        priority: 'Check Today',
        stackMatch: 'Kubernetes',
        publishedAt: '2026-05-20T09:00:00.000Z',
      },
      {
        id: 'matched-next',
        title: 'Next.js routing update',
        category: 'Web Dev',
        relevance: 40,
        priority: 'Save for Later',
        stackMatch: 'Next.js',
        publishedAt: '2026-05-20T08:00:00.000Z',
      },
    ];

    const today = getTodaySignals(
      {
        stack: ['Next.js'],
        currentProject: 'Student dashboard built with Next.js',
        learningGoal: 'Frontend',
        deadline: 'This Week',
      },
      signals,
    );

    expect(today[0]).toEqual(expect.objectContaining({ id: 'matched-next' }));
    vi.useRealTimers();
  });
});

describe('signal categories', () => {
  it('supports broad technology signal filters', () => {
    expect(CATEGORIES).toEqual([
      'All',
      'AI / Models',
      'Web Dev',
      'Backend / Cloud',
      'Mobile',
      'Database',
      'Security',
      'Events',
      'Pricing / Policy',
      'Developer Tools',
    ]);
  });
});
