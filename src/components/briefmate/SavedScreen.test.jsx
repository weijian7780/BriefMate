import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SavedScreen from './SavedScreen';

describe('SavedScreen', () => {
  it('resolves saved signal ids against backend-provided signals', () => {
    render(
      <SavedScreen
        saved={['live-supabase-edge-functions']}
        signals={[
          {
            id: 'live-supabase-edge-functions',
            title: 'Supabase Edge Functions scheduler update',
            category: 'Backend',
            priority: 'Check Today',
            summary: 'A live signal loaded from Supabase.',
          },
        ]}
        onDecode={vi.fn()}
        onToggleSave={vi.fn()}
      />
    );

    expect(screen.getByText('Supabase Edge Functions scheduler update')).toBeInTheDocument();
    expect(screen.queryByText('No saved signals yet.')).not.toBeInTheDocument();
  });
});
