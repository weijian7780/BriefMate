import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProfileSetupScreen from './ProfileSetupScreen';

async function reachGoalStep() {
  fireEvent.click(screen.getByRole('button', { name: 'Beginner' }));
  fireEvent.click(screen.getByRole('button', { name: 'CS Student' }));
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

  fireEvent.click(screen.getAllByRole('button', { name: 'React' })[0]);
  fireEvent.click(screen.getAllByRole('button', { name: 'Firebase' })[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

  fireEvent.click(screen.getByRole('button', { name: 'Pricing / Policy' }));
  fireEvent.click(screen.getByRole('button', { name: 'Crypto' }));
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

  fireEvent.change(screen.getByPlaceholderText(/ai study buddy app/i), {
    target: { value: 'BriefMate' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Backend' }));
  fireEvent.click(screen.getByRole('button', { name: 'Prototype' }));
  fireEvent.click(screen.getByRole('button', { name: '2 Weeks' }));
  fireEvent.click(screen.getByRole('button', { name: 'Tell me what to do' }));
}

describe('ProfileSetupScreen', () => {
  it('saves preference fields that influence relevance and risk scoring', async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined);
    render(<ProfileSetupScreen onComplete={onComplete} />);

    await reachGoalStep();
    fireEvent.click(screen.getByRole('button', { name: /build my brief/i }));

    await waitFor(() =>
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          primaryStack: ['React', 'Firebase'],
          stack: ['React', 'Firebase'],
          signalPreferences: ['Pricing / Policy'],
          mutedTopics: ['Crypto'],
          currentProject: 'BriefMate',
          learningGoal: 'Backend',
          projectStage: 'Prototype',
          deadline: '2 Weeks',
          actionStyle: 'Tell me what to do',
        }),
      ),
    );
  });

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
