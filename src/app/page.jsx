"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useBriefmateStore } from "../utils/briefmateStore";
import OnboardingScreen from "../components/briefmate/OnboardingScreen";
import ProfileSetupScreen from "../components/briefmate/ProfileSetupScreen";
import TodayScreen from "../components/briefmate/TodayScreen";
import ExploreScreen from "../components/briefmate/ExploreScreen";
import SavedScreen from "../components/briefmate/SavedScreen";
import ProfileScreen from "../components/briefmate/ProfileScreen";
import DecodeScreen from "../components/briefmate/DecodeScreen";
import BottomNav from "../components/briefmate/BottomNav";
import AuthScreen from "../components/briefmate/AuthScreen";
import useAuth from "../utils/useAuth";
import useUser from "../utils/useUser";
import { fetchTechSignals } from "../utils/techSignals";
import { personalizeSignals } from "../data/signals";

export default function HomePage() {
  const { user, loading: userLoading, refetch: refetchUser } = useUser();
  const { signOut, setBriefMatePassword } = useAuth();
  const {
    state,
    hydrated,
    completeOnboarding,
    updateProfile,
    toggleSaved,
    markDecoded,
    toggleUseful,
    resetPreferences,
  } = useBriefmateStore();

  // View state — local UI navigation
  const [view, setView] = useState("onboarding"); // onboarding | setup | app | decode | edit
  const [activeTab, setActiveTab] = useState("today");
  const [decodeId, setDecodeId] = useState(null);
  const [toast, setToast] = useState(null);
  const [techSignals, setTechSignals] = useState([]);
  const [signalsLoading, setSignalsLoading] = useState(false);
  const [signalsError, setSignalsError] = useState(null);
  const [signalsLastUpdatedAt, setSignalsLastUpdatedAt] = useState(null);

  // Sync initial view with persisted state once hydrated
  useEffect(() => {
    if (!hydrated) return;
    setView(state.onboarded ? "app" : "onboarding");
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;

    async function loadLiveSignals() {
      if (!user || !hydrated) return;

      setSignalsLoading(true);
      try {
        const result = await fetchTechSignals();
        if (cancelled) return;

        if (result.signals.length === 0) {
          setTechSignals([]);
          setSignalsLastUpdatedAt(null);
          setSignalsError(
            "No live tech signals found yet. Add collector rows in Supabase or refresh later.",
          );
          return;
        }

        setTechSignals(result.signals);
        setSignalsLastUpdatedAt(result.lastUpdatedAt);
        setSignalsError(null);
      } catch (error) {
        if (cancelled) return;
        setTechSignals([]);
        setSignalsLastUpdatedAt(null);
        setSignalsError(
          error?.message || "Unable to load live tech signals.",
        );
      } finally {
        if (!cancelled) setSignalsLoading(false);
      }
    }

    loadLiveSignals();

    return () => {
      cancelled = true;
    };
  }, [user, hydrated]);

  const showToast = useCallback((message) => {
    setToast(message);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 1800);
  }, []);

  const handleDecode = useCallback(
    (id) => {
      setDecodeId(id);
      markDecoded(id);
      setView("decode");
      window.scrollTo({ top: 0, behavior: "instant" });
    },
    [markDecoded],
  );

  const handleToggleSave = useCallback(
    (id) => {
      const wasSaved = state.saved.includes(id);
      toggleSaved(id);
      showToast(wasSaved ? "Removed from Saved" : "Saved to your library");
    },
    [state.saved, toggleSaved, showToast],
  );

  const handleToggleUseful = useCallback(
    (id) => {
      const wasUseful = state.usefulIds.includes(id);
      toggleUseful(id);
      showToast(
        wasUseful ? "Marked as not useful" : "Thanks — marked as useful",
      );
    },
    [state.usefulIds, toggleUseful, showToast],
  );

  const handleNotRelevant = useCallback(
    (id) => {
      showToast("Got it — we'll show less like this");
    },
    [showToast],
  );

  const handleCompleteOnboarding = useCallback(
    async (profile) => {
      await completeOnboarding(profile);
      setView("app");
      setActiveTab("today");
    },
    [completeOnboarding],
  );

  const handleEditSave = useCallback(
    async (profile) => {
      await updateProfile(profile);
      setView("app");
      setActiveTab("profile");
      showToast("Profile updated");
    },
    [updateProfile, showToast],
  );

  const handleResetPreferences = useCallback(async () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        "Reset your profile and start onboarding again?",
      );
      if (!ok) return;
    }
    await resetPreferences();
    setView("onboarding");
    setActiveTab("today");
    setDecodeId(null);
  }, [resetPreferences]);

  const handleLogout = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const handleSetPassword = useCallback(
    async (password) => {
      await setBriefMatePassword({ password });
      await refetchUser();
    },
    [setBriefMatePassword, refetchUser],
  );

  const hasBriefMatePassword = useMemo(
    () =>
      Boolean(
        user?.app_metadata?.provider === "email" ||
          user?.app_metadata?.providers?.includes("email") ||
          user?.identities?.some((identity) => identity.provider === "email"),
      ),
    [user],
  );

  const displaySignals = useMemo(
    () => personalizeSignals(state.profile, techSignals),
    [state.profile, techSignals],
  );

  const decodeSignal = useMemo(
    () => displaySignals.find((s) => s.id === decodeId),
    [displaySignals, decodeId],
  );

  const stats = useMemo(
    () => ({
      decoded: state.decodedIds.length,
      saved: state.saved.length,
      useful: state.usefulIds.length,
    }),
    [state.decodedIds, state.saved, state.usefulIds],
  );

  if (userLoading) {
    return (
      <main className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <div className="font-mono text-xs text-slate-500">loading session…</div>
      </main>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <div className="font-mono text-xs text-slate-500">loading profile…</div>
      </main>
    );
  }

  // Onboarding
  if (view === "onboarding") {
    return (
      <main className="min-h-screen bg-[#0F1117] text-white font-sans">
        <OnboardingScreen onGetStarted={() => setView("setup")} />
      </main>
    );
  }

  // Profile setup (initial)
  if (view === "setup") {
    return (
      <main className="min-h-screen bg-[#0F1117] text-white font-sans">
        <ProfileSetupScreen
          initial={state.profile}
          onComplete={handleCompleteOnboarding}
          onBack={() => setView("onboarding")}
        />
      </main>
    );
  }

  // Edit profile
  if (view === "edit") {
    return (
      <main className="min-h-screen bg-[#0F1117] text-white font-sans">
        <ProfileSetupScreen
          initial={state.profile}
          onComplete={handleEditSave}
          onBack={() => {
            setView("app");
            setActiveTab("profile");
          }}
        />
      </main>
    );
  }

  // Decode detail
  if (view === "decode" && decodeSignal) {
    return (
      <main className="min-h-screen bg-[#0F1117] text-white font-sans">
        <DecodeScreen
          signal={decodeSignal}
          saved={state.saved.includes(decodeSignal.id)}
          useful={state.usefulIds.includes(decodeSignal.id)}
          onBack={() => {
            setDecodeId(null);
            setView("app");
          }}
          onToggleSave={handleToggleSave}
          onToggleUseful={handleToggleUseful}
          onMarkNotRelevant={handleNotRelevant}
        />
        {toast ? <Toast message={toast} /> : null}
      </main>
    );
  }

  // Main app (tabs)
  return (
    <main className="min-h-screen bg-[#0F1117] text-white font-sans pb-24">
      {activeTab === "today" && (
        <TodayScreen
          profile={state.profile}
          saved={state.saved}
          signals={displaySignals}
          signalsPersonalized
          loading={signalsLoading}
          onDecode={handleDecode}
          onToggleSave={handleToggleSave}
        />
      )}
      {activeTab === "explore" && (
        <ExploreScreen
          signals={displaySignals}
          loading={signalsLoading}
          error={signalsError}
          lastUpdatedAt={signalsLastUpdatedAt}
          onDecode={handleDecode}
        />
      )}
      {activeTab === "saved" && (
        <SavedScreen
          saved={state.saved}
          signals={displaySignals}
          loading={signalsLoading}
          onDecode={handleDecode}
          onToggleSave={handleToggleSave}
        />
      )}
      {activeTab === "profile" && (
        <ProfileScreen
          profile={state.profile}
          stats={stats}
          hasBriefMatePassword={hasBriefMatePassword}
          onEdit={() => setView("edit")}
          onReset={handleResetPreferences}
          onLogout={handleLogout}
          onSetPassword={handleSetPassword}
        />
      )}

      <BottomNav active={activeTab} onChange={setActiveTab} />
      {toast ? <Toast message={toast} /> : null}
    </main>
  );
}

function Toast({ message }) {
  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 rounded-full border border-[#1E293B] bg-[#1E293B]/95 backdrop-blur px-4 py-2 text-sm text-white shadow-lg"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 88px)" }}
    >
      {message}
    </div>
  );
}
