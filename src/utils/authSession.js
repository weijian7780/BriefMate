import { supabase } from '../lib/supabaseClient';

let pendingUserRequest = null;

export async function getAuthenticatedUser() {
  if (!pendingUserRequest) {
    pendingUserRequest = supabase.auth
      .getUser()
      .then(({ data, error }) => (error ? null : data.user))
      .catch(() => null)
      .finally(() => {
        pendingUserRequest = null;
      });
  }

  return pendingUserRequest;
}

export function subscribeToAuthStateChange(handler) {
  return supabase.auth.onAuthStateChange(handler);
}
