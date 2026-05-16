import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TodayScreen from './TodayScreen';

describe('TodayScreen', () => {
  it('builds the daily brief from backend-provided signals', () => {
    render(
      <TodayScreen
        profile={{ stack: ['Supabase'] }}
        saved={[]}
        signals={[
          {
            id: 'live-supabase-edge-functions',
            title: 'Supabase Edge Functions scheduler update',
            category: 'Backend',
            relevance: 88,
            priority: 'Check Today',
            stackMatch: 'Supabase',
            summary: 'A live signal loaded from Supabase.',
          },
        ]}
        onDecode={vi.fn()}
        onToggleSave={vi.fn()}
      />
    );

    expect(screen.getByText('Supabase Edge Functions scheduler update')).toBeInTheDocument();
    expect(screen.queryByText('Firebase pricing update')).not.toBeInTheDocument();
  });

  it('presents the daily brief as a priority inbox', () => {
    const onDecode = vi.fn();

    render(
      <TodayScreen
        profile={{ stack: ['Gemini API', 'Firebase'] }}
        saved={[]}
        signals={[
          {
            id: 'firebase-pricing',
            title: 'Firebase pricing update',
            category: 'Backend',
            relevance: 86,
            priority: 'Review This Week',
            stackMatch: 'Firebase',
            summary: 'Firebase pricing changed.',
          },
          {
            id: 'gemini-2-5-flash',
            title: 'Gemini 2.5 Flash release',
            category: 'AI Tools',
            relevance: 91,
            priority: 'Check Today',
            stackMatch: 'Gemini API',
            summary: 'Gemini released a faster model.',
          },
          {
            id: 'react-compiler',
            title: 'React compiler update',
            category: 'Frontend',
            relevance: 18,
            priority: 'Ignore for Now',
            stackMatch: 'No stack match',
            summary: 'React compiler changed.',
          },
        ]}
        onDecode={onDecode}
        onToggleSave={vi.fn()}
      />
    );

    expect(screen.getByText("Today's Focus")).toBeInTheDocument();
    expect(screen.getByText('Gemini 2.5 Flash release')).toBeInTheDocument();
    expect(screen.getByText('Why now')).toBeInTheDocument();
    expect(screen.getByText('Next in queue')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Firebase pricing update/i })).toBeInTheDocument();
    expect(screen.getByText('Stack Watch')).toBeInTheDocument();
    expect(screen.getByText('Gemini API')).toBeInTheDocument();
    expect(screen.getAllByText('1 signal')).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /^Decode$/i })).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: /^Decode$/i }));
    expect(onDecode).toHaveBeenCalledWith('gemini-2-5-flash');

    fireEvent.click(screen.getByRole('button', { name: /Firebase pricing update/i }));
    expect(onDecode).toHaveBeenCalledWith('firebase-pricing');
  });
});
