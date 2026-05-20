import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearTechSignalsCache, fetchTechSignals } from './techSignals';

const mocks = vi.hoisted(() => {
  const limitSignals = vi.fn();
  const orderSignals = vi.fn(() => ({ limit: limitSignals }));
  const eqActive = vi.fn(() => ({ order: orderSignals }));
  const selectSignals = vi.fn(() => ({ eq: eqActive }));
  const supabase = {
    from: vi.fn(() => ({ select: selectSignals })),
  };

  return { supabase, selectSignals, eqActive, orderSignals, limitSignals };
});

vi.mock('../lib/supabaseClient', () => ({ supabase: mocks.supabase }));

beforeEach(() => {
  vi.clearAllMocks();
  clearTechSignalsCache();
});

describe('fetchTechSignals', () => {
  it('loads active Supabase rows and maps them to BriefMate signal fields', async () => {
    mocks.limitSignals.mockResolvedValueOnce({
      data: [
        {
          id: 'live-supabase-edge-functions',
          title: 'Supabase Edge Functions scheduler update',
          category: 'Backend',
          relevance: 88,
          priority: 'Check Today',
          stack_match: 'Supabase',
          summary: 'A live signal loaded from Supabase.',
          what_happened: 'Supabase scheduled functions can refresh signal data.',
          beginner_explanation: 'A scheduler runs code on a timer.',
          why_matters: 'Your app can stop depending only on preserved mock data.',
          risk_level: 'Low',
          recommended_action: 'Store collected items in Supabase.',
          resources: ['Supabase scheduled functions'],
          source_name: 'Supabase Docs',
          source_url: 'https://supabase.com/docs/guides/functions/schedule-functions',
          published_at: '2026-05-16T08:00:00.000Z',
          collected_at: '2026-05-16T09:00:00.000Z',
          updated_at: '2026-05-16T10:00:00.000Z',
        },
      ],
      error: null,
    });

    const result = await fetchTechSignals();

    expect(mocks.supabase.from).toHaveBeenCalledWith('tech_signals');
    expect(mocks.eqActive).toHaveBeenCalledWith('active', true);
    expect(mocks.limitSignals).toHaveBeenCalledWith(120);
    expect(result).toEqual({
      signals: [
        expect.objectContaining({
          id: 'live-supabase-edge-functions',
          title: 'Supabase Edge Functions scheduler update',
          stackMatch: 'Supabase',
          whatHappened: 'Supabase scheduled functions can refresh signal data.',
          beginnerExplanation: 'A scheduler runs code on a timer.',
          whyMatters: 'Your app can stop depending only on preserved mock data.',
          riskLevel: 'Low',
          recommendedAction: 'Store collected items in Supabase.',
          sourceName: 'Supabase Docs',
          sourceUrl: 'https://supabase.com/docs/guides/functions/schedule-functions',
          collectedAt: '2026-05-16T09:00:00.000Z',
        }),
      ],
      lastUpdatedAt: '2026-05-16T10:00:00.000Z',
    });
  });

  it('does not return preserved seed rows as live tech signals', async () => {
    mocks.limitSignals.mockResolvedValueOnce({
      data: [
        {
          id: 'gemini-2-5-flash',
          title: 'Gemini 2.5 Flash release',
          category: 'AI Tools',
          relevance: 91,
          priority: 'Check Today',
          stack_match: 'Gemini API',
          summary: 'Preserved seed signal.',
          source_name: 'BriefMate seed data',
          published_at: '2026-05-16T00:00:00.000Z',
          collected_at: '2026-05-16T01:00:00.000Z',
          updated_at: '2026-05-16T02:00:00.000Z',
        },
      ],
      error: null,
    });

    const result = await fetchTechSignals();

    expect(result).toEqual({
      signals: [],
      lastUpdatedAt: null,
    });
  });

  it('cleans HTML from feed text before returning live signals', async () => {
    mocks.limitSignals.mockResolvedValueOnce({
      data: [
        {
          id: 'aws-sagemaker-html',
          title: 'Amazon SageMaker HyperPod now supports data capture',
          category: 'Backend / Cloud',
          relevance: 49,
          priority: 'Review This Week',
          stack_match: 'AWS',
          summary:
            '<p>Amazon SageMaker HyperPod now supports data capture for inference workloads.</p>',
          what_happened:
            '<p>Amazon SageMaker HyperPod now supports data capture for inference workloads.</p>',
          beginner_explanation: '<p>This is a backend update.</p>',
          why_matters: '<p>This may affect cloud AI inference monitoring.</p>',
          risk_level: 'Low',
          recommended_action: '<p>Review the AWS changelog.</p>',
          resources: ['AWS What\'s New'],
          source_name: 'AWS What\'s New',
          source_url: 'https://aws.amazon.com/about-aws/whats-new/',
          published_at: '2026-05-20T08:00:00.000Z',
          collected_at: '2026-05-20T09:00:00.000Z',
          updated_at: '2026-05-20T10:00:00.000Z',
        },
      ],
      error: null,
    });

    const result = await fetchTechSignals();

    expect(result.signals[0]).toEqual(
      expect.objectContaining({
        summary: 'Amazon SageMaker HyperPod now supports data capture for inference workloads.',
        whatHappened: 'Amazon SageMaker HyperPod now supports data capture for inference workloads.',
        beginnerExplanation: 'This is a backend update.',
        whyMatters: 'This may affect cloud AI inference monitoring.',
        recommendedAction: 'Review the AWS changelog.',
      }),
    );
    expect(result.signals[0].whatHappened).not.toMatch(/<\/?p>/i);
  });

  it('reuses cached live signals to avoid repeated Supabase reads in one session', async () => {
    mocks.limitSignals.mockResolvedValueOnce({
      data: [
        {
          id: 'cached-signal',
          title: 'Cached signal',
          category: 'Developer Tools',
          relevance: 50,
          priority: 'Review This Week',
          stack_match: 'No stack match',
          summary: 'A cached signal.',
          source_name: 'Tool Blog',
          published_at: '2026-05-20T08:00:00.000Z',
          collected_at: '2026-05-20T09:00:00.000Z',
          updated_at: '2026-05-20T10:00:00.000Z',
        },
      ],
      error: null,
    });

    const first = await fetchTechSignals();
    const second = await fetchTechSignals();

    expect(second).toEqual(first);
    expect(mocks.supabase.from).toHaveBeenCalledTimes(1);
    expect(mocks.limitSignals).toHaveBeenCalledTimes(1);
  });
});
