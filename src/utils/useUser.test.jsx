import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useUser from './useUser';

const { supabase } = vi.hoisted(() => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

vi.mock('../lib/supabaseClient', () => ({ supabase }));

beforeEach(() => {
  supabase.auth.getUser.mockReset();
  supabase.auth.onAuthStateChange.mockReset();
  supabase.auth.onAuthStateChange.mockReturnValue({
    data: {
      subscription: {
        unsubscribe: vi.fn(),
      },
    },
  });
});

describe('useUser', () => {
  it('stops loading when Supabase session lookup fails', async () => {
    supabase.auth.getUser.mockRejectedValue(new Error('network failed'));

    const { result } = renderHook(() => useUser());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toBeNull();
  });
});
