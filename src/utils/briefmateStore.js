import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const defaultState = {
  onboarded: false,
  profile: {
    skillLevel: '',
    role: '',
    stack: [],
    primaryStack: [],
    signalPreferences: [],
    mutedTopics: [],
    currentProject: '',
    learningGoal: '',
    deadline: '',
    projectStage: '',
  },
  saved: [],
  decodedIds: [],
  usefulIds: [],
};

function mapProfileRow(row) {
  if (!row) return defaultState.profile;
  return {
    skillLevel: row.skill_level ?? '',
    role: row.role ?? '',
    stack: row.stack ?? [],
    primaryStack: row.primary_stack ?? [],
    signalPreferences: row.signal_preferences ?? [],
    mutedTopics: row.muted_topics ?? [],
    currentProject: row.current_project ?? '',
    learningGoal: row.learning_goal ?? '',
    deadline: row.deadline ?? '',
    projectStage: row.project_stage ?? '',
  };
}

function mapProfileState(userId, state) {
  return {
    user_id: userId,
    onboarded: state.onboarded,
    skill_level: state.profile.skillLevel,
    role: state.profile.role,
    stack: state.profile.stack,
    primary_stack: state.profile.primaryStack,
    signal_preferences: state.profile.signalPreferences,
    muted_topics: state.profile.mutedTopics,
    current_project: state.profile.currentProject,
    learning_goal: state.profile.learningGoal,
    deadline: state.profile.deadline,
    project_stage: state.profile.projectStage,
  };
}

function rowsToIds(rows) {
  return (rows ?? []).map((row) => row.signal_id);
}

async function fetchSignalIds(table, userId) {
  const { data, error } = await supabase.from(table).select('signal_id').eq('user_id', userId);
  if (error) throw error;
  return rowsToIds(data);
}

async function loadState(userId) {
  const [{ data: profileRow, error: profileError }, saved, decodedIds, usefulIds] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
    fetchSignalIds('saved_signals', userId),
    fetchSignalIds('decoded_signals', userId),
    fetchSignalIds('useful_signals', userId),
  ]);

  if (profileError) throw profileError;

  return {
    ...defaultState,
    onboarded: profileRow?.onboarded ?? false,
    profile: mapProfileRow(profileRow),
    saved,
    decodedIds,
    usefulIds,
  };
}

async function getAuthenticatedUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

async function upsertProfile(userId, state) {
  const { error } = await supabase
    .from('profiles')
    .upsert(mapProfileState(userId, state), { onConflict: 'user_id' });
  if (error) throw error;
}

async function upsertSignal(table, userId, signalId) {
  const { error } = await supabase
    .from(table)
    .upsert({ user_id: userId, signal_id: signalId }, { onConflict: 'user_id,signal_id' });
  if (error) throw error;
}

async function deleteSignal(table, userId, signalId) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('user_id', userId)
    .eq('signal_id', signalId);
  if (error) throw error;
}

function getUserAgent() {
  return typeof navigator === 'undefined' ? null : navigator.userAgent;
}

function getAuthProvider(user) {
  return user?.app_metadata?.provider ?? user?.identities?.[0]?.provider ?? 'unknown';
}

async function recordLogin(user) {
  if (!user?.id) return;

  const { error } = await supabase.from('login_logs').insert({
    user_id: user.id,
    event_type: 'login',
    email: user.email ?? null,
    provider: getAuthProvider(user),
    user_agent: getUserAgent(),
  });

  if (error) throw error;
}

export function useBriefmateStore() {
  const [state, setState] = useState(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [persistenceError, setPersistenceError] = useState(null);

  useEffect(() => {
    let active = true;

    const loadForUser = async (user) => {
      if (!active) return;
      if (!user) {
        setState(defaultState);
        setUserId(null);
        setPersistenceError(null);
        setHydrated(true);
        return;
      }

      setUserId(user.id);
      try {
        const nextState = await loadState(user.id);
        if (!active) return;
        setState(nextState);
        setPersistenceError(null);
      } catch (error) {
        if (!active) return;
        setState(defaultState);
        setPersistenceError(error);
      } finally {
        if (active) setHydrated(true);
      }
    };

    getAuthenticatedUser()
      .then(loadForUser)
      .catch(() => {
        if (!active) return;
        setState(defaultState);
        setUserId(null);
        setPersistenceError(new Error('Unable to read the current Supabase user.'));
        setHydrated(true);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        recordLogin(session.user).catch(() => {});
      }

      setHydrated(false);
      loadForUser(session?.user ?? null).catch(() => {
        if (!active) return;
        setState(defaultState);
        setUserId(null);
        setPersistenceError(new Error('Unable to load BriefMate preferences.'));
        setHydrated(true);
      });
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const getCurrentUserId = useCallback(async () => {
    if (userId) return userId;

    const user = await getAuthenticatedUser();
    if (!user?.id) {
      throw new Error('Sign in before saving BriefMate preferences.');
    }

    setUserId(user.id);
    return user.id;
  }, [userId]);

  const saveProfileState = useCallback(
    async (nextState) => {
      try {
        const currentUserId = await getCurrentUserId();
        await upsertProfile(currentUserId, nextState);
        setPersistenceError(null);
      } catch (error) {
        setPersistenceError(error);
        throw error;
      }
    },
    [getCurrentUserId],
  );

  const completeOnboarding = useCallback(
    async (profile) => {
      const nextState = {
        ...state,
        onboarded: true,
        profile: { ...state.profile, ...profile },
      };
      await saveProfileState(nextState);
      setState(nextState);
    },
    [state, saveProfileState],
  );

  const updateProfile = useCallback(
    async (profile) => {
      const nextState = { ...state, profile: { ...state.profile, ...profile } };
      await saveProfileState(nextState);
      setState(nextState);
    },
    [state, saveProfileState],
  );

  const toggleSaved = useCallback(
    async (id) => {
      const has = state.saved.includes(id);
      const nextState = {
        ...state,
        saved: has ? state.saved.filter((item) => item !== id) : [...state.saved, id],
      };
      setState(nextState);
      if (!userId) return;
      if (has) {
        await deleteSignal('saved_signals', userId, id);
        return;
      }
      await upsertSignal('saved_signals', userId, id);
    },
    [state, userId],
  );

  const markDecoded = useCallback(
    async (id) => {
      if (state.decodedIds.includes(id)) return;
      const nextState = { ...state, decodedIds: [...state.decodedIds, id] };
      setState(nextState);
      if (userId) await upsertSignal('decoded_signals', userId, id);
    },
    [state, userId],
  );

  const toggleUseful = useCallback(
    async (id) => {
      const has = state.usefulIds.includes(id);
      const nextState = {
        ...state,
        usefulIds: has ? state.usefulIds.filter((item) => item !== id) : [...state.usefulIds, id],
      };
      setState(nextState);
      if (!userId) return;
      if (has) {
        await deleteSignal('useful_signals', userId, id);
        return;
      }
      await upsertSignal('useful_signals', userId, id);
    },
    [state, userId],
  );

  const resetAll = useCallback(async () => {
    await saveProfileState(defaultState);
    setState(defaultState);
  }, [saveProfileState]);

  const resetPreferences = useCallback(async () => {
    const nextState = {
      ...state,
      profile: { ...defaultState.profile },
      onboarded: false,
    };
    await saveProfileState(nextState);
    setState(nextState);
  }, [state, saveProfileState]);

  return {
    state,
    hydrated,
    completeOnboarding,
    updateProfile,
    toggleSaved,
    markDecoded,
    toggleUseful,
    resetAll,
    resetPreferences,
    persistenceError,
  };
}
