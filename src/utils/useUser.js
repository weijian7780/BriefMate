import * as React from 'react';
import { getAuthenticatedUser, subscribeToAuthStateChange } from './authSession';

const useUser = () => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const refetchUser = React.useCallback(async () => {
    setLoading(true);
    try {
      const nextUser = await getAuthenticatedUser();
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
        const nextUser = await getAuthenticatedUser();
        if (!mounted) return;
        setUser(nextUser);
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

    const { data: subscription } = subscribeToAuthStateChange((_event, session) => {
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
