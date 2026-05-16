import * as React from 'react';
import { supabase } from '../lib/supabaseClient';

const useUser = () => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const refetchUser = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      const nextUser = error ? null : data.user;
      setUser(nextUser);
      return nextUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(error ? null : data.user);
      } catch {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe?.();
    };
  }, []);

  return { user, data: user, loading, refetch: refetchUser };
};

export { useUser };

export default useUser;
