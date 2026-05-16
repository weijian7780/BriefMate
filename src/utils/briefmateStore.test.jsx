import { renderHook, waitFor, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBriefmateStore } from './briefmateStore';

const mocks = vi.hoisted(() => {
  const authUser = { id: 'user-123', email: 'student@example.com' };
  const state = {
    profileRow: null,
    profileError: null,
    savedRows: [],
    decodedRows: [],
    usefulRows: [],
  };
  const singleProfile = vi.fn(() => Promise.resolve({ data: state.profileRow, error: state.profileError }));
  const selectProfiles = vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: singleProfile })) }));
  const selectSignalRows = vi.fn((table) => () => ({
    eq: vi.fn(() => Promise.resolve({
      data:
        table === 'saved_signals'
          ? state.savedRows
          : table === 'decoded_signals'
            ? state.decodedRows
            : state.usefulRows,
      error: null,
    })),
  }));
  const upsertProfile = vi.fn(() => Promise.resolve({ error: null }));
  const upsertSignal = vi.fn(() => Promise.resolve({ error: null }));
  const deleteSignal = vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })) }));
  const insertLoginLog = vi.fn(() => Promise.resolve({ error: null }));
  const tableFns = {
    profiles: {
      select: selectProfiles,
      upsert: upsertProfile,
    },
    saved_signals: {
      select: selectSignalRows('saved_signals'),
      upsert: upsertSignal,
      delete: deleteSignal,
    },
    decoded_signals: {
      select: selectSignalRows('decoded_signals'),
      upsert: upsertSignal,
    },
    useful_signals: {
      select: selectSignalRows('useful_signals'),
      upsert: upsertSignal,
      delete: deleteSignal,
    },
    login_logs: {
      insert: insertLoginLog,
    },
  };
  const supabase = {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: authUser }, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn((table) => tableFns[table]),
  };

  return { state, supabase, upsertProfile, upsertSignal, insertLoginLog };
});

vi.mock('../lib/supabaseClient', () => ({ supabase: mocks.supabase }));

beforeEach(() => {
  mocks.state.profileRow = {
    onboarded: true,
    skill_level: 'Intermediate',
    role: 'Frontend Developer',
    stack: ['React', 'Supabase'],
    current_project: 'BriefMate',
    learning_goal: 'Ship a full-stack app',
    deadline: 'This month',
  };
  mocks.state.profileError = null;
  mocks.state.savedRows = [{ signal_id: 'react-19' }];
  mocks.state.decodedRows = [{ signal_id: 'supabase-auth' }];
  mocks.state.usefulRows = [{ signal_id: 'ai-tools' }];
  vi.clearAllMocks();
  mocks.upsertProfile.mockResolvedValue({ error: null });
});

describe('useBriefmateStore Supabase persistence', () => {
  it('hydrates Briefmate state from user-owned Supabase rows', async () => {
    const { result } = renderHook(() => useBriefmateStore());

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    expect(result.current.state).toMatchObject({
      onboarded: true,
      profile: {
        skillLevel: 'Intermediate',
        role: 'Frontend Developer',
        stack: ['React', 'Supabase'],
        currentProject: 'BriefMate',
        learningGoal: 'Ship a full-stack app',
        deadline: 'This month',
      },
      saved: ['react-19'],
      decodedIds: ['supabase-auth'],
      usefulIds: ['ai-tools'],
    });
  });

  it('upserts profile changes to Supabase for the authenticated user', async () => {
    const { result } = renderHook(() => useBriefmateStore());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    await act(() => result.current.completeOnboarding({ role: 'Backend Developer' }));

    expect(mocks.upsertProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
        onboarded: true,
        role: 'Backend Developer',
      }),
      { onConflict: 'user_id' },
    );
  });

  it('still saves onboarding for the authenticated user after preference hydration fails', async () => {
    mocks.state.profileError = new Error('relation "profiles" does not exist');
    const { result } = renderHook(() => useBriefmateStore());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    mocks.state.profileError = null;

    await act(() => result.current.completeOnboarding({ role: 'Backend Developer' }));

    expect(mocks.upsertProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
        onboarded: true,
        role: 'Backend Developer',
      }),
      { onConflict: 'user_id' },
    );
  });

  it('does not mark onboarding complete when Supabase rejects the profile save', async () => {
    mocks.state.profileRow = null;
    const { result } = renderHook(() => useBriefmateStore());
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    mocks.upsertProfile.mockResolvedValueOnce({
      error: new Error('new row violates row-level security policy'),
    });

    let caughtError;
    await act(async () => {
      try {
        await result.current.completeOnboarding({ role: 'Backend Developer' });
      } catch (error) {
        caughtError = error;
      }
    });

    expect(caughtError.message).toContain('row-level security');
    expect(result.current.state.onboarded).toBe(false);
    expect(result.current.persistenceError.message).toContain('row-level security');
  });

  it('persists saved signal toggles to Supabase', async () => {
    const { result } = renderHook(() => useBriefmateStore());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    await act(() => result.current.toggleSaved('vite-release'));

    expect(mocks.upsertSignal).toHaveBeenCalledWith(
      { user_id: 'user-123', signal_id: 'vite-release' },
      { onConflict: 'user_id,signal_id' },
    );
  });

  it('records a login log when Supabase reports a signed-in session', async () => {
    renderHook(() => useBriefmateStore());

    const handleAuthStateChange = mocks.supabase.auth.onAuthStateChange.mock.calls[0][0];

    await act(() =>
      handleAuthStateChange('SIGNED_IN', {
        user: {
          id: 'user-456',
          email: 'google-user@example.com',
          app_metadata: { provider: 'google' },
        },
      })
    );

    await waitFor(() =>
      expect(mocks.insertLoginLog).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-456',
          event_type: 'login',
          email: 'google-user@example.com',
          provider: 'google',
          user_agent: expect.any(String),
        })
      )
    );
  });
});
