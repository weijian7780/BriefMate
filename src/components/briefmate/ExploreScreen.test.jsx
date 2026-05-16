import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ExploreScreen from './ExploreScreen';

function getCategoryScroller() {
  return screen.getByLabelText('Category filters');
}

describe('ExploreScreen', () => {
  it('renders backend-provided live signals instead of the preserved mock list', () => {
    render(
      <ExploreScreen
        onDecode={vi.fn()}
        signals={[
          {
            id: 'live-supabase-edge-functions',
            title: 'Supabase Edge Functions scheduler update',
            category: 'Backend',
            relevance: 88,
            priority: 'Check Today',
            summary: 'A live signal loaded from Supabase.',
          },
        ]}
      />
    );

    expect(screen.getByText('Supabase Edge Functions scheduler update')).toBeInTheDocument();
    expect(screen.queryByText('Firebase pricing update')).not.toBeInTheDocument();
  });

  it('hides the native scrollbar on the category filters', () => {
    render(<ExploreScreen onDecode={vi.fn()} />);

    const categoryScroller = getCategoryScroller();

    expect(categoryScroller).toHaveClass('overflow-x-auto');
    expect(categoryScroller).toHaveClass('scrollbar-hide');
  });

  it('scrolls the category filters with a mouse drag', () => {
    render(<ExploreScreen onDecode={vi.fn()} />);

    const categoryScroller = getCategoryScroller();
    categoryScroller.scrollLeft = 20;

    fireEvent.mouseDown(categoryScroller, { button: 0, clientX: 100 });
    fireEvent.mouseMove(categoryScroller, { clientX: 60 });
    fireEvent.mouseUp(categoryScroller);

    expect(categoryScroller.scrollLeft).toBe(60);
  });

  it('keeps category chips clickable when not dragging', () => {
    render(<ExploreScreen onDecode={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Frontend' }));

    expect(screen.getByRole('button', { name: 'Frontend' })).toHaveClass('bg-[#3B82F6]');
    expect(screen.getByRole('button', { name: 'Frontend' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('does not select a category when the mouse interaction was a drag', () => {
    render(<ExploreScreen onDecode={vi.fn()} />);

    const categoryScroller = getCategoryScroller();
    const frontendChip = screen.getByRole('button', { name: 'Frontend' });

    fireEvent.mouseDown(frontendChip, { button: 0, clientX: 100 });
    fireEvent.mouseMove(categoryScroller, { clientX: 60 });
    fireEvent.mouseUp(frontendChip);
    fireEvent.click(frontendChip);

    expect(frontendChip).not.toHaveClass('bg-[#3B82F6]');
  });
});
