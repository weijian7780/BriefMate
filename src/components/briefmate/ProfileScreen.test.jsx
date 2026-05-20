import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProfileScreen from './ProfileScreen';

const baseProps = {
  profile: {
    displayName: 'Wei Jian',
    skillLevel: 'Intermediate',
    role: 'Frontend Developer',
    stack: ['React', 'Supabase'],
    currentProject: 'BriefMate',
    learningGoal: 'Ship faster',
    deadline: 'This month',
  },
  stats: {
    decoded: 2,
    saved: 3,
    useful: 1,
  },
  onEdit: vi.fn(),
  onReset: vi.fn(),
  onLogout: vi.fn(),
  onSetPassword: vi.fn(),
};

beforeEach(() => {
  Object.values(baseProps).forEach((value) => {
    if (typeof value === 'function') value.mockReset();
  });
  baseProps.onSetPassword.mockResolvedValue();
});

describe('ProfileScreen', () => {
  it('shows display name as the profile title and keeps role as context', () => {
    render(<ProfileScreen {...baseProps} />);

    expect(screen.getAllByText('Wei Jian')).toHaveLength(2);
    expect(screen.getByText('Intermediate - Frontend Developer')).toBeInTheDocument();
  });

  it('lets the user set a BriefMate password without changing Google password', async () => {
    render(<ProfileScreen {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: /set briefmate password/i }));
    fireEvent.change(screen.getByLabelText(/new briefmate password/i), {
      target: { value: 'new-secure-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save password/i }));

    await waitFor(() => expect(baseProps.onSetPassword).toHaveBeenCalledWith('new-secure-password'));

    expect(screen.getByText(/your google password stays unchanged/i)).toBeInTheDocument();
    expect(screen.getByText(/briefmate password set/i)).toBeInTheDocument();
  });

  it('shows update password action when the user already has a BriefMate password', async () => {
    render(<ProfileScreen {...baseProps} hasBriefMatePassword />);

    expect(screen.queryByRole('button', { name: /set briefmate password/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /update briefmate password/i }));
    fireEvent.change(screen.getByLabelText(/new briefmate password/i), {
      target: { value: 'new-secure-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save password/i }));

    await waitFor(() => expect(baseProps.onSetPassword).toHaveBeenCalledWith('new-secure-password'));

    expect(screen.getByText(/briefmate password updated/i)).toBeInTheDocument();
    expect(screen.getAllByText(/your google password stays unchanged/i)).toHaveLength(2);
  });
});
