import { useMemo, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  RotateCw,
  ListChecks,
  Layers,
  Target,
} from "lucide-react";
import PriorityPill from "./PriorityPill";
import { getTodaySignals } from "../../data/signals";

function getGreeting() {
  if (typeof window === "undefined") return "Good morning";
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function isMatchedSignal(signal) {
  return signal.stackMatch && signal.stackMatch !== "No stack match";
}

function countStackMatches(signals, stackItem) {
  const normalizedStackItem = stackItem.toLowerCase();

  return signals.filter((signal) => {
    const stackMatch = (signal.stackMatch || "").toLowerCase();
    if (!stackMatch || stackMatch === "no stack match") return false;

    return (
      stackMatch === normalizedStackItem ||
      stackMatch.includes(normalizedStackItem) ||
      normalizedStackItem.includes(stackMatch)
    );
  }).length;
}

function buildStackWatch(profile, signals) {
  const profileStack = profile?.stack || [];

  if (profileStack.length > 0) {
    return profileStack.slice(0, 4).map((item) => ({
      name: item,
      count: countStackMatches(signals, item),
    }));
  }

  return Array.from(
    new Set(
      signals
        .filter(isMatchedSignal)
        .map((signal) => signal.stackMatch)
        .slice(0, 4),
    ),
  ).map((item) => ({
    name: item,
    count: countStackMatches(signals, item),
  }));
}

function pluralizeSignal(count) {
  return `${count} ${count === 1 ? "signal" : "signals"}`;
}

export default function TodayScreen({
  profile,
  saved,
  signals = [],
  loading = false,
  onDecode,
  onToggleSave,
}) {
  const [flippedCards, setFlippedCards] = useState({});
  const todaySignals = useMemo(
    () => getTodaySignals(profile, signals),
    [profile, signals],
  );
  const greeting = getGreeting();
  const focusSignal = todaySignals[0];
  const queueSignals = todaySignals.slice(1);
  const matchedCount = todaySignals.filter(isMatchedSignal).length;
  const stackWatch = buildStackWatch(profile, todaySignals);
  const toggleFlashcard = (signalId) => {
    setFlippedCards((cards) => ({
      ...cards,
      [signalId]: !cards[signalId],
    }));
  };

  return (
    <div className="px-5 pt-6 pb-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
          PERSONAL BRIEF -{" "}
          {new Date().toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-white">
          My Brief
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {greeting}. Your prioritized tech action list is ready.
        </p>
        {loading ? (
          <p className="mt-2 rounded-xl border border-[#1E293B] bg-[#1E293B]/30 px-3 py-2 text-xs text-slate-400">
            Loading live brief...
          </p>
        ) : null}

        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-[#1E293B] bg-[#1E293B]/30 px-3 py-2.5">
            <div className="font-mono text-[10px] uppercase text-slate-500">
              Signals
            </div>
            <div className="mt-1 text-lg font-bold text-white">
              {todaySignals.length}
            </div>
          </div>
          <div className="rounded-xl border border-[#1E293B] bg-[#1E293B]/30 px-3 py-2.5">
            <div className="font-mono text-[10px] uppercase text-slate-500">
              Matched
            </div>
            <div className="mt-1 text-lg font-bold text-[#10B981]">
              {matchedCount}
            </div>
          </div>
          <div className="rounded-xl border border-[#1E293B] bg-[#1E293B]/30 px-3 py-2.5">
            <div className="font-mono text-[10px] uppercase text-slate-500">
              Focus
            </div>
            <div className="mt-1 text-lg font-bold text-[#60A5FA]">
              {focusSignal?.relevance ?? 0}%
            </div>
          </div>
        </div>

        {focusSignal ? (
          <section className="mt-6 rounded-2xl border border-[#1E293B] bg-[#101722] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-[#60A5FA]">
                  <Target className="h-3.5 w-3.5" />
                  Today's Focus
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#1E293B] px-2 py-0.5 text-[11px] font-mono text-slate-300">
                    {focusSignal.category}
                  </span>
                  <PriorityPill priority={focusSignal.priority} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggleSave(focusSignal.id)}
                aria-label={saved.includes(focusSignal.id) ? "Unsave" : "Save"}
                className="rounded-lg p-1.5 text-slate-300 hover:text-white hover:bg-[#1E293B] transition-colors"
              >
                {saved.includes(focusSignal.id) ? (
                  <BookmarkCheck className="h-5 w-5 text-[#10B981]" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </button>
            </div>

            <h2 className="mt-4 text-xl font-bold leading-tight text-white">
              {focusSignal.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {focusSignal.summary}
            </p>

            <div className="mt-4 rounded-xl border border-[#1E293B] bg-[#0F1117]/60 p-3">
              <div className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
                Why now
              </div>
              <p className="mt-1 text-sm text-slate-300">
                {isMatchedSignal(focusSignal)
                  ? `Matches ${focusSignal.stackMatch} with ${focusSignal.relevance}% relevance.`
                  : `Highest available relevance at ${focusSignal.relevance}%.`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onDecode(focusSignal.id)}
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] py-2.5 text-sm font-semibold text-white transition-colors"
            >
              Decode
              <ChevronRight className="h-4 w-4" />
            </button>
          </section>
        ) : !loading ? (
          <section className="mt-6 rounded-2xl border border-dashed border-[#1E293B] bg-[#101722] p-6 text-center">
            <h2 className="text-base font-semibold text-white">
              No fresh tech signals today
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              The live collector has no signal from the last 24 hours. Check
              Explore for older collected signals or refresh after the collector
              runs again.
            </p>
          </section>
        ) : null}

        {todaySignals.length > 0 ? (
          <section
            aria-label="Today's flashcards"
            className="mt-6 rounded-2xl border border-[#1E293B] bg-[#101722] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#10B981]" />
                  <h2 className="text-sm font-semibold text-white">
                    Today's flashcards
                  </h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {todaySignals.length}{" "}
                  {todaySignals.length === 1 ? "card" : "cards"} from fresh
                  tech signals
                </p>
              </div>
              <span className="rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-2 py-0.5 font-mono text-[10px] uppercase text-[#10B981]">
                New today
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {todaySignals.map((signal, index) => {
                const isBackVisible = Boolean(flippedCards[signal.id]);

                return (
                  <article
                    key={signal.id}
                    className="min-h-[164px] rounded-xl border border-[#1E293B] bg-[#0F1117]/70 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
                          Card {index + 1}
                        </div>
                        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-white">
                          {signal.title}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFlashcard(signal.id)}
                        aria-label={`Flip ${signal.title} flashcard`}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#1E293B] px-2 py-1 text-[11px] font-semibold text-[#60A5FA] hover:border-[#3B82F6]/50"
                      >
                        <RotateCw className="h-3 w-3" />
                        Flip
                      </button>
                    </div>

                    {isBackVisible ? (
                      <div className="mt-3 space-y-3">
                        <div>
                          <div className="font-mono text-[10px] uppercase text-slate-500">
                            Simple meaning
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-slate-300">
                            {signal.beginnerExplanation || signal.summary}
                          </p>
                        </div>
                        <div>
                          <div className="font-mono text-[10px] uppercase text-slate-500">
                            Action
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-slate-300">
                            {signal.recommendedAction ||
                              "Open the source and verify before changing your project."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <div className="font-mono text-[10px] uppercase text-slate-500">
                          What happened
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-slate-300">
                          {signal.whatHappened || signal.summary}
                        </p>
                        {signal.sourceName || signal.publishedAt ? (
                          <p className="mt-3 text-[11px] text-slate-500">
                            {signal.sourceName
                              ? `Source: ${signal.sourceName}`
                              : ""}
                            {signal.sourceName && signal.publishedAt
                              ? " - "
                              : ""}
                            {signal.publishedAt
                              ? `Published ${new Date(
                                  signal.publishedAt,
                                ).toLocaleDateString()}`
                              : ""}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        {queueSignals.length > 0 ? (
          <section className="mt-6">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-white">
                Next in queue
              </h2>
            </div>
            <div className="mt-3 space-y-2">
              {queueSignals.map((signal, index) => (
                <button
                  key={signal.id}
                  type="button"
                  onClick={() => onDecode(signal.id)}
                  aria-label={`Open ${signal.title}`}
                  className="w-full rounded-xl border border-[#1E293B] bg-[#1E293B]/25 p-3 text-left transition-colors hover:border-[#3B82F6]/50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#0F1117] font-mono text-[11px] text-slate-400">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-white">
                          {signal.title}
                        </h3>
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                          {isMatchedSignal(signal)
                            ? `Matches ${signal.stackMatch}`
                            : "No stack match"}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <PriorityPill priority={signal.priority} />
                      <div className="mt-1 font-mono text-[11px] text-[#10B981]">
                        {signal.relevance}%
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {stackWatch.length > 0 ? (
          <section className="mt-6 rounded-2xl border border-[#1E293B] bg-[#1E293B]/20 p-4">
            <h2 className="text-sm font-semibold text-white">Stack Watch</h2>
            <div className="mt-3 space-y-2">
              {stackWatch.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[#0F1117]/60 px-3 py-2"
                >
                  <span className="min-w-0 truncate text-sm text-slate-300">
                    {item.name}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[11px] ${
                      item.count > 0
                        ? "bg-[#10B981]/10 text-[#10B981]"
                        : "bg-slate-700/30 text-slate-500"
                    }`}
                  >
                    {pluralizeSignal(item.count)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
