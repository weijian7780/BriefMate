export const TECH_STACK_OPTIONS = [
  "React",
  "Next.js",
  "Flutter",
  "Python",
  "Firebase",
  "Supabase",
  "Tailwind CSS",
  "Node.js",
  "Express",
  "MongoDB",
  "PostgreSQL",
  "Gemini API",
  "OpenAI API",
  "LangChain",
  "Docker",
];

export const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];
export const ROLES = [
  "CS Student",
  "FYP Student",
  "Hackathon Builder",
  "Self-learner",
];
export const LEARNING_GOALS = [
  "AI/ML",
  "Frontend",
  "Backend",
  "Mobile",
  "Full-stack",
  "DevOps",
];
export const DEADLINES = ["This Week", "2 Weeks", "1 Month", "No Deadline"];
export const CATEGORIES = [
  "All",
  "AI Tools",
  "Frontend",
  "Backend",
  "Mobile",
  "Database",
  "DevOps",
];

function applyStackMatch(signal, profile) {
  const stack = profile?.stack || [];
  const stackMatch = signal.stackMatch || "No stack match";
  const matched = stack.find(
    (item) =>
      item.toLowerCase() === stackMatch.toLowerCase() ||
      stackMatch.toLowerCase().includes(item.toLowerCase()),
  );
  return {
    ...signal,
    stackMatch: matched || stackMatch,
  };
}

function getSignalTimestamp(signal) {
  return signal.publishedAt || signal.collectedAt || signal.updatedAt || null;
}

function isFreshForToday(signal, now = new Date()) {
  const rawTimestamp = getSignalTimestamp(signal);
  if (!rawTimestamp) return false;

  const timestamp = new Date(rawTimestamp);
  if (Number.isNaN(timestamp.getTime())) return false;

  const ageMs = now.getTime() - timestamp.getTime();
  return ageMs >= 0 && ageMs <= 24 * 60 * 60 * 1000;
}

// Get the 3 fresh "Today" signals based on user profile.
export function getTodaySignals(profile, signals = []) {
  return [...signals]
    .filter((signal) => isFreshForToday(signal))
    .sort((a, b) => {
      const relevanceDiff = (b.relevance ?? 0) - (a.relevance ?? 0);
      if (relevanceDiff !== 0) return relevanceDiff;
      return String(b.publishedAt || b.collectedAt || "").localeCompare(
        String(a.publishedAt || a.collectedAt || ""),
      );
    })
    .slice(0, 3)
    .map((signal) => applyStackMatch(signal, profile));
}
