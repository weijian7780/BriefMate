import { fireEvent, render, screen, within } from '@testing-library/react';
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
            whatHappened: 'Supabase can refresh data on a schedule.',
            beginnerExplanation: 'A scheduler runs code automatically.',
            recommendedAction: 'Connect a scheduled collector.',
            sourceName: 'Supabase Docs',
            publishedAt: new Date().toISOString(),
          },
        ]}
        onDecode={vi.fn()}
        onToggleSave={vi.fn()}
      />
    );

    expect(
      screen.getAllByText('Supabase Edge Functions scheduler update').length,
    ).toBeGreaterThanOrEqual(1);
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
            whatHappened: 'Firebase changed pricing.',
            beginnerExplanation: 'Backend cost can change.',
            recommendedAction: 'Check billing settings.',
            publishedAt: new Date().toISOString(),
          },
          {
            id: 'gemini-2-5-flash',
            title: 'Gemini 2.5 Flash release',
            category: 'AI Tools',
            relevance: 91,
            priority: 'Check Today',
            stackMatch: 'Gemini API',
            summary: 'Gemini released a faster model.',
            whatHappened: 'Gemini model information changed.',
            beginnerExplanation: 'Gemini is an AI model used through an API.',
            recommendedAction: 'Verify the official model page before changing code.',
            sourceName: 'Google AI Docs',
            publishedAt: new Date().toISOString(),
          },
          {
            id: 'react-compiler',
            title: 'React compiler update',
            category: 'Frontend',
            relevance: 18,
            priority: 'Ignore for Now',
            stackMatch: 'No stack match',
            summary: 'React compiler changed.',
            whatHappened: 'React compiler changed.',
            beginnerExplanation: 'React can optimize rendering.',
            recommendedAction: 'Ignore if not using React.',
            publishedAt: new Date().toISOString(),
          },
        ]}
        onDecode={onDecode}
        onToggleSave={vi.fn()}
      />
    );

    expect(screen.getByText("Today's Focus")).toBeInTheDocument();
    expect(
      screen.getAllByText('Gemini 2.5 Flash release').length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Why now')).toBeInTheDocument();
    const flashcardDeck = screen.getByLabelText("Today's flashcards");
    expect(within(flashcardDeck).getByText("Today's flashcards")).toBeInTheDocument();
    expect(within(flashcardDeck).getByText('Gemini model information changed.')).toBeInTheDocument();
    fireEvent.click(
      within(flashcardDeck).getByRole('button', {
        name: /flip Gemini 2.5 Flash release flashcard/i,
      }),
    );
    expect(screen.getByText('Gemini is an AI model used through an API.')).toBeInTheDocument();
    expect(screen.getByText('Next in queue')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /open Firebase pricing update/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Stack Watch')).toBeInTheDocument();
    expect(screen.getByText('Gemini API')).toBeInTheDocument();
    expect(screen.getAllByText('1 signal')).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /^Decode$/i })).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: /^Decode$/i }));
    expect(onDecode).toHaveBeenCalledWith('gemini-2-5-flash');

    fireEvent.click(
      screen.getByRole('button', { name: /open Firebase pricing update/i }),
    );
    expect(onDecode).toHaveBeenCalledWith('firebase-pricing');
  });

  it('shows flashcards only when fresh tech signals exist today', () => {
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
            whatHappened: 'Firebase changed pricing.',
            beginnerExplanation: 'Backend cost can change.',
            recommendedAction: 'Check billing settings.',
            sourceName: 'Firebase Blog',
            publishedAt: new Date().toISOString(),
          },
          {
            id: 'gemini-model-update',
            title: 'Gemini model update',
            category: 'AI Tools',
            relevance: 91,
            priority: 'Check Today',
            stackMatch: 'Gemini API',
            summary: 'Gemini model details changed.',
            whatHappened: 'Gemini model information changed.',
            beginnerExplanation: 'Gemini is an AI model used through an API.',
            recommendedAction: 'Verify model availability before changing code.',
            sourceName: 'Google AI Docs',
            publishedAt: new Date().toISOString(),
          },
        ]}
        onDecode={vi.fn()}
        onToggleSave={vi.fn()}
      />,
    );

    const deck = screen.getByLabelText("Today's flashcards");

    expect(within(deck).getByText("Today's flashcards")).toBeInTheDocument();
    expect(within(deck).getByText('2 cards from fresh tech signals')).toBeInTheDocument();
    expect(within(deck).getByText('Gemini model update')).toBeInTheDocument();
    expect(within(deck).getByText('Firebase pricing update')).toBeInTheDocument();
    expect(within(deck).getByText('Gemini model information changed.')).toBeInTheDocument();

    fireEvent.click(
      within(deck).getByRole('button', {
        name: /flip Firebase pricing update flashcard/i,
      }),
    );

    expect(within(deck).getByText('Backend cost can change.')).toBeInTheDocument();
    expect(within(deck).getByText('Check billing settings.')).toBeInTheDocument();
  });

  it('hides flashcards when there are no fresh tech signals today', () => {
    render(
      <TodayScreen
        profile={{ stack: ['Gemini API'] }}
        saved={[]}
        signals={[]}
        onDecode={vi.fn()}
        onToggleSave={vi.fn()}
      />,
    );

    expect(screen.getByText('No fresh tech signals today')).toBeInTheDocument();
    expect(screen.queryByLabelText("Today's flashcards")).not.toBeInTheDocument();
  });
});
