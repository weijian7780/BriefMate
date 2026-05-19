import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchTechSignals } from './techSignals';

const mocks = vi.hoisted(() => {
  const orderSignals = vi.fn();
  const eqActive = vi.fn(() => ({ order: orderSignals }));
  const selectSignals = vi.fn(() => ({ eq: eqActive }));
  const supabase = {
    from: vi.fn(() => ({ select: selectSignals })),
  };

  return { supabase, selectSignals, eqActive, orderSignals };
});

vi.mock('../lib/supabaseClient', () => ({ supabase: mocks.supabase }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchTechSignals', () => {
  it('loads active Supabase rows and maps them to BriefMate signal fields', async () => {
    mocks.orderSignals.mockResolvedValueOnce({
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
    mocks.orderSignals.mockResolvedValueOnce({
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
});
