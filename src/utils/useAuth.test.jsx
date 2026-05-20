import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useAuth from './useAuth';

const { supabase } = vi.hoisted(() => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      updateUser: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

vi.mock('../lib/supabaseClient', () => ({ supabase }));

beforeEach(() => {
  supabase.auth.getUser.mockReset();
  supabase.auth.signInWithPassword.mockReset();
  supabase.auth.signUp.mockReset();
  supabase.auth.signInWithOAuth.mockReset();
  supabase.auth.updateUser.mockReset();
  supabase.auth.signOut.mockReset();
  supabase.from.mockReset();
  supabase.rpc.mockReset();
  supabase.auth.getUser.mockResolvedValue({
    data: {
      user: {
        id: 'user-123',
        email: 'student@example.com',
        app_metadata: { provider: 'email' },
      },
    },
    error: null,
  });
  supabase.auth.signInWithPassword.mockResolvedValue({ error: null });
  supabase.auth.signUp.mockResolvedValue({ error: null });
  supabase.auth.signInWithOAuth.mockResolvedValue({ error: null });
  supabase.auth.updateUser.mockResolvedValue({ error: null });
  supabase.auth.signOut.mockResolvedValue({ error: null });
  supabase.rpc.mockResolvedValue({ data: false, error: null });
  supabase.from.mockReturnValue({
    insert: vi.fn(() => Promise.resolve({ error: null })),
  });
});

describe('useAuth', () => {
  it('signs in with email and password through Supabase', async () => {
    const { result } = renderHook(() => useAuth());

    await act(() =>
      result.current.signInWithCredentials({
        email: 'student@example.com',
        password: 'correct-password',
      }),
    );

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'student@example.com',
      password: 'correct-password',
    });
  });

  it('signs up with email and password through Supabase', async () => {
    const { result } = renderHook(() => useAuth());

    await act(() =>
      result.current.signUpWithCredentials({
        email: 'student@example.com',
        password: 'correct-password',
      }),
    );

    expect(supabase.rpc).toHaveBeenCalledWith('email_exists', {
      email_to_check: 'student@example.com',
    });
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'student@example.com',
      password: 'correct-password',
    });
  });

  it('fails to sign up if email already exists', async () => {
    supabase.rpc.mockResolvedValue({ data: true, error: null });
    const { result } = renderHook(() => useAuth());

    await expect(
      act(() =>
        result.current.signUpWithCredentials({
          email: 'student@example.com',
          password: 'correct-password',
        })
      )
    ).rejects.toThrow('An account with this email already exists. Please sign in instead.');

    expect(supabase.rpc).toHaveBeenCalledWith('email_exists', {
      email_to_check: 'student@example.com',
    });
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  it('fails to sign up if email_exists check fails', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: 'DB Error' } });
    const { result } = renderHook(() => useAuth());

    await expect(
      act(() =>
        result.current.signUpWithCredentials({
          email: 'student@example.com',
          password: 'correct-password',
        })
      )
    ).rejects.toThrow('DB Error');

    expect(supabase.rpc).toHaveBeenCalledWith('email_exists', {
      email_to_check: 'student@example.com',
    });
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  it('starts Google OAuth through Supabase', async () => {
    const { result } = renderHook(() => useAuth());

    await act(() => result.current.signInWithGoogle());

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  });

  it('sets a BriefMate password through Supabase without changing Google password', async () => {
    const { result } = renderHook(() => useAuth());

    await act(() =>
      result.current.setBriefMatePassword({
        password: 'new-secure-password',
      })
    );

    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      password: 'new-secure-password',
    });
  });

  it('signs out through Supabase', async () => {
    const { result } = renderHook(() => useAuth());

    await act(() => result.current.signOut());

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('records a logout log before signing out', async () => {
    const insert = vi.fn(() => Promise.resolve({ error: null }));
    supabase.from.mockReturnValue({ insert });
    const { result } = renderHook(() => useAuth());

    await act(() => result.current.signOut());

    expect(supabase.from).toHaveBeenCalledWith('login_logs');
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
        event_type: 'logout',
        email: 'student@example.com',
        provider: 'email',
        user_agent: expect.any(String),
      })
    );
    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(insert.mock.invocationCallOrder[0]).toBeLessThan(
      supabase.auth.signOut.mock.invocationCallOrder[0]
    );
  });
});
