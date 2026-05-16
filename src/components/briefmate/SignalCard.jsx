import { Bookmark, BookmarkCheck, ChevronRight } from "lucide-react";
import PriorityPill from "./PriorityPill";

export default function SignalCard({ signal, saved, onDecode, onToggleSave }) {
  const matched = signal.stackMatch && signal.stackMatch !== "No stack match";

  return (
    <div className="rounded-2xl border border-[#1E293B] bg-[#0F1117]/80 backdrop-blur p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-[#1E293B] px-2 py-0.5 text-[11px] font-mono text-slate-300">
            {signal.category}
          </span>
          <PriorityPill priority={signal.priority} />
        </div>
        <button
          type="button"
          onClick={() => onToggleSave(signal.id)}
          aria-label={saved ? "Unsave" : "Save"}
          className="rounded-lg p-1.5 text-slate-300 hover:text-white hover:bg-[#1E293B] transition-colors"
        >
          {saved ? (
            <BookmarkCheck className="h-5 w-5 text-[#10B981]" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </button>
      </div>

      <h3 className="mt-3 text-base sm:text-lg font-semibold text-white leading-snug">
        {signal.title}
      </h3>
      <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
        {signal.summary}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Relevance</span>
          <span
            className={`font-mono font-semibold ${
              signal.relevance >= 70
                ? "text-[#10B981]"
                : signal.relevance >= 40
                  ? "text-[#60A5FA]"
                  : "text-slate-400"
            }`}
          >
            {signal.relevance}%
          </span>
          <span className="text-slate-700">•</span>
          <span
            className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
              matched
                ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30"
                : "bg-slate-700/30 text-slate-400 border border-slate-700/50"
            }`}
          >
            {matched ? `Matches ${signal.stackMatch}` : "No stack match"}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDecode(signal.id)}
        className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold py-2.5 transition-colors"
      >
        Decode
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
