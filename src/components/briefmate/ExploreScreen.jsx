import { useMemo, useRef, useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import Chip from "./Chip";
import PriorityPill from "./PriorityPill";
import { CATEGORIES } from "../../data/signals";

export default function ExploreScreen({
  signals = [],
  lastUpdatedAt,
  loading = false,
  error = null,
  onDecode,
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const [categoryDrag, setCategoryDrag] = useState(null);
  const didDragCategoryRef = useRef(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return signals.filter((s) => {
      if (category !== "All" && s.category !== category) return false;
      if (
        q &&
        !`${s.title} ${s.summary} ${s.category}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [signals, query, category]);

  const handleCategoryMouseDown = (event) => {
    if (event.button !== 0) return;

    didDragCategoryRef.current = false;
    setCategoryDrag({
      initialScrollLeft: event.currentTarget.scrollLeft,
      startX: event.clientX,
    });
  };

  const handleCategoryMouseMove = (event) => {
    if (!categoryDrag) return;

    event.preventDefault();
    const dragDistance = event.clientX - categoryDrag.startX;
    if (Math.abs(dragDistance) > 5) {
      didDragCategoryRef.current = true;
    }
    event.currentTarget.scrollLeft = categoryDrag.initialScrollLeft - dragDistance;
  };

  const stopCategoryDrag = () => {
    setCategoryDrag(null);
  };

  const selectCategory = (nextCategory) => {
    if (didDragCategoryRef.current) {
      didDragCategoryRef.current = false;
      return;
    }

    setCategory(nextCategory);
  };

  return (
    <div className="px-5 pt-6 pb-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white">Explore</h1>
        <p className="mt-1 text-sm text-slate-400">Browse all tech signals</p>
        {lastUpdatedAt ? (
          <p className="mt-1 font-mono text-[11px] text-slate-500">
            Live data last updated {new Date(lastUpdatedAt).toLocaleString()}
          </p>
        ) : null}
        {loading ? (
          <p className="mt-2 rounded-xl border border-[#1E293B] bg-[#1E293B]/30 px-3 py-2 text-xs text-slate-400">
            Loading live tech signals...
          </p>
        ) : null}
        {error ? (
          <p className="mt-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
            {error}
          </p>
        ) : null}

        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search signals..."
            className="w-full rounded-xl border border-[#1E293B] bg-[#1E293B]/40 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#3B82F6] transition-colors"
          />
        </div>

        <div
          aria-label="Category filters"
          role="group"
          className="mt-3 -mx-5 px-5 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleCategoryMouseDown}
          onMouseLeave={stopCategoryDrag}
          onMouseMove={handleCategoryMouseMove}
          onMouseUp={stopCategoryDrag}
        >
          <div className="flex gap-2 pb-1">
            {CATEGORIES.map((c) => (
              <Chip
                key={c}
                active={category === c}
                aria-pressed={category === c}
                onClick={() => selectCategory(c)}
                size="sm"
              >
                {c}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-2.5">
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#1E293B] p-8 text-center">
              <p className="text-sm text-slate-400">
                No signals match your filters.
              </p>
            </div>
          )}
          {filtered.map((signal) => (
            <button
              key={signal.id}
              type="button"
              onClick={() => onDecode(signal.id)}
              className="w-full text-left rounded-xl border border-[#1E293B] bg-[#1E293B]/30 p-3.5 hover:border-[#3B82F6]/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded bg-[#1E293B] px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                      {signal.category}
                    </span>
                    <PriorityPill priority={signal.priority} />
                  </div>
                  <h3 className="mt-1.5 text-sm font-semibold text-white leading-snug">
                    {signal.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-slate-500">Relevance</span>
                    <span
                      className={
                        signal.relevance >= 70
                          ? "text-[#10B981]"
                          : signal.relevance >= 40
                            ? "text-[#60A5FA]"
                            : "text-slate-400"
                      }
                    >
                      {signal.relevance}%
                    </span>
                  </div>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-[#3B82F6]/15 text-[#60A5FA] px-2.5 py-1.5 text-xs font-semibold">
                  Decode
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
