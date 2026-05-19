import { describe, expect, it, vi } from 'vitest';
import { getTodaySignals } from './signals';

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
});
