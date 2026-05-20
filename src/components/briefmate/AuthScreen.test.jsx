import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AuthScreen from './AuthScreen';

const auth = vi.hoisted(() => ({
  signInWithCredentials: vi.fn(),
  signUpWithCredentials: vi.fn(),
  signInWithGoogle: vi.fn(),
}));

vi.mock('../../utils/useAuth', () => ({
  default: () => auth,
}));

beforeEach(() => {
  auth.signInWithCredentials.mockReset();
  auth.signUpWithCredentials.mockReset();
  auth.signInWithGoogle.mockReset();
  auth.signInWithCredentials.mockResolvedValue({});
  auth.signUpWithCredentials.mockResolvedValue({});
  auth.signInWithGoogle.mockResolvedValue({});
});

describe('AuthScreen', () => {
  it('shows a distinct sign-up page after choosing create account', () => {
    render(<AuthScreen />);

    fireEvent.click(screen.getByRole('button', { name: /create one/i }));

    expect(
      screen.getByRole('heading', { name: 'Create your BriefMate account' })
    ).toBeInTheDocument();
    expect(screen.getByText(/start saving your profile/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /already have an account/i })).toBeInTheDocument();
  });

  it('returns to the sign-in page after creating an account', async () => {
    render(<AuthScreen />);

    fireEvent.click(screen.getByRole('button', { name: /create one/i }));
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'student@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'correct-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

    await waitFor(() =>
      expect(auth.signUpWithCredentials).toHaveBeenCalledWith({
        email: 'student@example.com',
        password: 'correct-password',
      })
    );

    expect(screen.getByRole('heading', { name: 'Welcome back to BriefMate' })).toBeInTheDocument();
    expect(screen.getByText(/account created/i)).toBeInTheDocument();
  });

  it('displays the specific error message when signup fails', async () => {
    auth.signUpWithCredentials.mockRejectedValue(new Error('An account with this email already exists. Please sign in instead.'));
    render(<AuthScreen />);

    fireEvent.click(screen.getByRole('button', { name: /create one/i }));
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'student@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'correct-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

    await waitFor(() =>
      expect(screen.getByText('An account with this email already exists. Please sign in instead.')).toBeInTheDocument()
    );
  });
});
