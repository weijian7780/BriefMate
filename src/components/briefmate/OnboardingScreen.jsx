import { Terminal, ArrowRight } from "lucide-react";

export default function OnboardingScreen({ onGetStarted }) {
  return (
    <div className="min-h-screen flex flex-col px-6 py-10 bg-[#0F1117]">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="inline-flex items-center gap-2 self-start rounded-lg border border-[#1E293B] bg-[#1E293B]/40 px-2.5 py-1 font-mono text-[11px] text-slate-300">
          <Terminal className="h-3.5 w-3.5 text-[#3B82F6]" />
          v1.0 · student edition
        </div>

        <h1 className="mt-8 text-4xl sm:text-5xl font-bold tracking-tight text-white">
          BriefMate <span className="text-[#3B82F6]">Tech</span>
        </h1>
        <p className="mt-4 text-xl sm:text-2xl font-semibold text-white leading-snug">
          Decode tech signals.{" "}
          <span className="text-[#10B981]">Know what matters.</span>
        </p>
        <p className="mt-3 text-base text-slate-400 leading-relaxed">
          Daily tech updates simplified for student developers.
        </p>

        <div className="mt-8 space-y-2.5">
          {[
            { label: "AI tool releases", tag: "AI" },
            { label: "Framework changes", tag: "FE" },
            { label: "Developer trends", tag: "DEV" },
          ].map((item) => (
            <div
              key={item.tag}
              className="flex items-center gap-3 rounded-xl border border-[#1E293B] bg-[#1E293B]/30 px-3 py-2.5"
            >
              <span className="rounded-md bg-[#3B82F6]/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#3B82F6]">
                {item.tag}
              </span>
              <span className="text-sm text-slate-200">{item.label}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onGetStarted}
          className="mt-10 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold py-4 text-base transition-colors"
        >
          Get Started
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        Built for student developers
      </p>
    </div>
  );
}
