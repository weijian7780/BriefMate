import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  AlertTriangle,
  Lightbulb,
  Target,
  Zap,
} from "lucide-react";
import PriorityPill from "./PriorityPill";

const RESOURCE_URLS = {
  "firebase pricing docs": "https://firebase.google.com/pricing",
  "firestore best practices": "https://firebase.google.com/docs/firestore/best-practices",
  "react compiler docs": "https://react.dev/learn/react-compiler",
  "react 19 release notes": "https://react.dev/blog/2024/12/05/react-19",
  "gemini api docs": "https://ai.google.dev/gemini-api/docs",
  "model comparison guide": "https://ai.google.dev/gemini-api/docs/models",
  "migrating from gemini 1.5 to 2.5": "https://ai.google.dev/gemini-api/docs/models",
  "next.js 15 upgrade guide": "https://nextjs.org/docs/app/guides/upgrading/version-15",
  "next.js upgrade guide": "https://nextjs.org/docs/app/guides/upgrading",
  "supabase auth docs": "https://supabase.com/docs/guides/auth",
  "supabase passkeys docs": "https://supabase.com/docs/guides/auth/auth-webauthn",
  "webauthn overview": "https://webauthn.guide/",
  "tailwind v4 announcement": "https://tailwindcss.com/blog/tailwindcss-v4",
  "migration guide": "https://tailwindcss.com/docs/upgrade-guide",
  "langchain v0.3 docs": "https://js.langchain.com/docs/versions/v0_3/",
  "agent tutorial": "https://js.langchain.com/docs/tutorials/agents/",
  "flutter 3.24 release notes": "https://docs.flutter.dev/release/release-notes",
  "impeller docs": "https://docs.flutter.dev/perf/impeller",
  "postgresql 17 release notes": "https://www.postgresql.org/docs/17/release-17.html",
  "docker desktop release notes": "https://docs.docker.com/desktop/release-notes/",
  "realtime api docs": "https://platform.openai.com/docs/guides/realtime",
  "voice quickstart": "https://platform.openai.com/docs/guides/realtime",
  "atlas vector search docs": "https://www.mongodb.com/docs/atlas/atlas-vector-search/",
  "rag tutorial": "https://www.mongodb.com/docs/atlas/atlas-vector-search/tutorials/",
};

function isExternalUrl(value) {
  return /^https?:\/\//i.test(value || "");
}

function resolveResource(resource, sourceUrl) {
  const label =
    typeof resource === "string"
      ? resource
      : resource?.label || resource?.title || resource?.name || resource?.url || "";
  const explicitUrl =
    typeof resource === "string" ? "" : resource?.url || resource?.href || "";
  const url =
    explicitUrl ||
    (isExternalUrl(label) ? label : RESOURCE_URLS[label.toLowerCase()] || sourceUrl || "");

  return {
    label,
    url: isExternalUrl(url) ? url : "",
  };
}

function RiskBadge({ level }) {
  const map = {
    Low: {
      bg: "bg-[#10B981]/15",
      border: "border-[#10B981]/40",
      text: "text-[#10B981]",
    },
    Medium: {
      bg: "bg-amber-500/15",
      border: "border-amber-500/40",
      text: "text-amber-400",
    },
    High: {
      bg: "bg-red-500/15",
      border: "border-red-500/40",
      text: "text-red-400",
    },
  };
  const s = map[level] || map.Low;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.bg} ${s.border} ${s.text}`}
    >
      <AlertTriangle className="h-3 w-3" />
      Risk: {level}
    </span>
  );
}

function Section({ icon: Icon, title, accent = "#3B82F6", children }) {
  return (
    <div className="mt-5 rounded-2xl border border-[#1E293B] bg-[#1E293B]/30 p-4">
      <div className="flex items-center gap-2">
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-md"
          style={{ backgroundColor: `${accent}26`, color: accent }}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="mt-2 text-sm leading-relaxed text-slate-300">
        {children}
      </div>
    </div>
  );
}

export default function DecodeScreen({
  signal,
  saved,
  useful,
  onBack,
  onToggleSave,
  onToggleUseful,
  onMarkNotRelevant,
}) {
  if (!signal) return null;

  const resourceLinks = (signal.resources || [])
    .map((resource) => resolveResource(resource, signal.sourceUrl))
    .filter((resource) => resource.label && resource.url);

  return (
    <div className="min-h-screen bg-[#0F1117] pb-32">
      <header className="sticky top-0 z-10 px-5 py-4 bg-[#0F1117]/95 backdrop-blur border-b border-[#1E293B]">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </header>

      <div className="px-5 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#1E293B] px-2 py-0.5 font-mono text-[11px] text-slate-300">
              {signal.category}
            </span>
            <PriorityPill priority={signal.priority} />
          </div>

          <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-white leading-tight">
            {signal.title}
          </h1>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#1E293B] bg-[#1E293B]/30 px-3.5 py-2.5">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
                Relevance
              </div>
              <div className="font-mono text-lg font-bold text-[#10B981]">
                {signal.relevance}%
              </div>
            </div>
            <div className="h-8 w-px bg-[#1E293B]" />
            <div className="flex-1">
              <div className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
                Stack match
              </div>
              <div className="text-sm text-white font-medium truncate">
                {signal.stackMatch && signal.stackMatch !== "No stack match"
                  ? signal.stackMatch
                  : "— none —"}
              </div>
            </div>
          </div>

          <Section icon={Zap} title="What Happened" accent="#3B82F6">
            {signal.whatHappened}
          </Section>

          <Section
            icon={Lightbulb}
            title="Beginner Explanation"
            accent="#10B981"
          >
            {signal.beginnerExplanation}
          </Section>

          <Section
            icon={Target}
            title="Why This Matters to You"
            accent="#3B82F6"
          >
            {signal.whyMatters}
          </Section>

          <div className="mt-5 rounded-2xl border border-[#1E293B] bg-[#1E293B]/30 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Risk Level</h3>
              <RiskBadge level={signal.riskLevel} />
            </div>
          </div>

          <Section icon={Target} title="Recommended Action" accent="#10B981">
            {signal.recommendedAction}
          </Section>

          {resourceLinks.length > 0 && (
            <div className="mt-5 rounded-2xl border border-[#1E293B] bg-[#1E293B]/30 p-4">
              <h3 className="text-sm font-semibold text-white">
                Related Resources
              </h3>
              <ul className="mt-2 space-y-1.5">
                {resourceLinks.map((resource) => (
                  <li key={`${resource.label}-${resource.url}`}>
                    <a
                      className="inline-flex items-center gap-1.5 text-sm text-[#60A5FA] hover:text-white"
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {resource.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <footer
        className="fixed bottom-0 inset-x-0 z-20 border-t border-[#1E293B] bg-[#0F1117]/95 backdrop-blur px-5 py-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
      >
        <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onToggleUseful(signal.id)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
              useful
                ? "bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981]"
                : "bg-[#1E293B]/40 border-[#1E293B] text-slate-300 hover:text-white"
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            Useful
          </button>
          <button
            type="button"
            onClick={() => onMarkNotRelevant(signal.id)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#1E293B] bg-[#1E293B]/40 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            <ThumbsDown className="h-4 w-4" />
            Not Relevant
          </button>
          <button
            type="button"
            onClick={() => onToggleSave(signal.id)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
              saved
                ? "bg-[#10B981] text-white hover:bg-[#059669]"
                : "bg-[#3B82F6] text-white hover:bg-[#2563EB]"
            }`}
          >
            {saved ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </footer>
    </div>
  );
}
