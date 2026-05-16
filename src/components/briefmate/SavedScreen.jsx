import { useMemo } from "react";
import { Bookmark, BookmarkCheck, ChevronRight } from "lucide-react";
import PriorityPill from "./PriorityPill";
import { MOCK_SIGNALS } from "../../data/signals";

const GROUPS = ["Check Today", "Review This Week", "Save for Later"];

export default function SavedScreen({
  saved,
  signals = MOCK_SIGNALS,
  loading = false,
  onDecode,
  onToggleSave,
}) {
  const grouped = useMemo(() => {
    const savedSignals = signals.filter((s) => saved.includes(s.id));
    const map = {};
    GROUPS.forEach((g) => {
      map[g] = savedSignals.filter((s) => s.priority === g);
    });
    // anything else (e.g., "Ignore for Now") falls into Save for Later
    const others = savedSignals.filter((s) => !GROUPS.includes(s.priority));
    map["Save for Later"] = [...map["Save for Later"], ...others];
    return map;
  }, [saved, signals]);

  const isEmpty = saved.length === 0;

  return (
    <div className="px-5 pt-6 pb-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white">Saved</h1>
        <p className="mt-1 text-sm text-slate-400">Your bookmarked signals</p>
        {loading ? (
          <p className="mt-2 rounded-xl border border-[#1E293B] bg-[#1E293B]/30 px-3 py-2 text-xs text-slate-400">
            Loading saved live signals...
          </p>
        ) : null}

        {isEmpty ? (
          <div className="mt-8 rounded-2xl border border-dashed border-[#1E293B] p-10 text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1E293B]">
              <Bookmark className="h-5 w-5 text-slate-500" />
            </div>
            <p className="mt-4 text-sm font-medium text-white">
              No saved signals yet.
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Save useful updates from Today or Explore.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-6">
            {GROUPS.map((group) => {
              const items = grouped[group];
              if (!items || items.length === 0) return null;
              return (
                <div key={group}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PriorityPill priority={group} size="lg" />
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">
                      {items.length} {items.length === 1 ? "signal" : "signals"}
                    </span>
                  </div>
                  <div className="mt-2.5 space-y-2">
                    {items.map((signal) => (
                      <div
                        key={signal.id}
                        className="rounded-xl border border-[#1E293B] bg-[#1E293B]/30 p-3.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <span className="rounded bg-[#1E293B] px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                              {signal.category}
                            </span>
                            <h3 className="mt-1.5 text-sm font-semibold text-white leading-snug">
                              {signal.title}
                            </h3>
                            <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                              {signal.summary}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onToggleSave(signal.id)}
                            className="shrink-0 rounded-lg p-1 text-[#10B981] hover:bg-[#1E293B]"
                            aria-label="Unsave"
                          >
                            <BookmarkCheck className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDecode(signal.id)}
                          className="mt-3 w-full inline-flex items-center justify-center gap-1 rounded-lg bg-[#3B82F6]/15 hover:bg-[#3B82F6]/25 text-[#60A5FA] text-xs font-semibold py-2 transition-colors"
                        >
                          Open Decode
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
