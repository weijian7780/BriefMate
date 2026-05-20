import { useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

function throwIfSupabaseError(result) {
  if (result.error) {
    throw new Error(result.error.message || 'Authentication failed');
  }
  return result;
}

function getUserAgent() {
  return typeof navigator === 'undefined' ? null : navigator.userAgent;
}

function getAuthProvider(user) {
  return user?.app_metadata?.provider ?? user?.identities?.[0]?.provider ?? 'unknown';
}

async function recordLogout() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return;

  const result = await supabase.from('login_logs').insert({
    user_id: data.user.id,
    event_type: 'logout',
    email: data.user.email ?? null,
    provider: getAuthProvider(data.user),
    user_agent: getUserAgent(),
  });

  throwIfSupabaseError(result);
}

function useAuth() {
  const signInWithCredentials = useCallback(async ({ email, password }) => {
    return throwIfSupabaseError(
      await supabase.auth.signInWithPassword({
        email,
        password,
      }),
    );
  }, []);

  const signUpWithCredentials = useCallback(async ({ email, password }) => {
    const { data: exists, error: checkError } = await supabase.rpc('email_exists', {
      email_to_check: email.trim().toLowerCase(),
    });
    if (checkError) {
      throw new Error(checkError.message || 'Verification failed');
    }
    if (exists) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    return throwIfSupabaseError(
      await supabase.auth.signUp({
        email,
        password,
      }),
    );
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
    return throwIfSupabaseError(
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      }),
    );
  }, []);

  const setBriefMatePassword = useCallback(async ({ password }) => {
    return throwIfSupabaseError(
      await supabase.auth.updateUser({
        password,
      }),
    );
  }, []);

  const signOut = useCallback(async () => {
    await recordLogout();
    return throwIfSupabaseError(await supabase.auth.signOut());
  }, []);

  return {
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGoogle,
    setBriefMatePassword,
    signOut,
  };
}

export default useAuth;
