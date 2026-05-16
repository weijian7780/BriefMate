import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProfileSetupScreen from './ProfileSetupScreen';

async function reachGoalStep() {
  fireEvent.click(screen.getByRole('button', { name: 'Beginner' }));
  fireEvent.click(screen.getByRole('button', { name: 'CS Student' }));
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

  fireEvent.click(screen.getByRole('button', { name: 'React' }));
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

  fireEvent.change(screen.getByPlaceholderText(/ai study buddy app/i), {
    target: { value: 'BriefMate' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Backend' }));
  fireEvent.click(screen.getByRole('button', { name: '2 Weeks' }));
}

describe('ProfileSetupScreen', () => {
  it('shows a save error when building the brief fails', async () => {
    const onComplete = vi.fn().mockRejectedValue(
      new Error('new row violates row-level security policy'),
    );
    render(<ProfileSetupScreen onComplete={onComplete} />);

    await reachGoalStep();
    fireEvent.click(screen.getByRole('button', { name: /build my brief/i }));

    expect(
      await screen.findByText(/unable to save preferences/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/new row violates row-level security policy/i),
    ).toBeInTheDocument();
  });
});
