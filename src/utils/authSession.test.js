import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  vi.resetModules();
  supabase.auth.getUser.mockReset();
  supabase.auth.onAuthStateChange.mockReset();
});

describe('auth session adapter', () => {
  it('shares an in-flight Supabase user request across callers', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'student@example.com' } },
      error: null,
    });
    const { getAuthenticatedUser } = await import('./authSession');

    const [first, second] = await Promise.all([
      getAuthenticatedUser(),
      getAuthenticatedUser(),
    ]);

    expect(first).toEqual({ id: 'user-123', email: 'student@example.com' });
    expect(second).toEqual(first);
    expect(supabase.auth.getUser).toHaveBeenCalledTimes(1);
  });
});
