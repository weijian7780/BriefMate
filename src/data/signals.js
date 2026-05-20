import { enrichSignalSections } from "./signalPlaybooks";

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
export const PROJECT_STAGES = ["Learning", "Prototype", "Deployed", "Production"];
export const ACTION_STYLES = [
  "Tell me what to do",
  "Explain only",
  "Save for later",
];
export const CATEGORIES = [
  "All",
  "AI / Models",
  "Web Dev",
  "Backend / Cloud",
  "Mobile",
  "Database",
  "Security",
  "Events",
  "Pricing / Policy",
  "Developer Tools",
];
export const SIGNAL_TYPE_OPTIONS = CATEGORIES.filter((category) => category !== "All");
export const MUTED_TOPIC_OPTIONS = [
  "Crypto",
  "Hardware",
  "Enterprise Cloud",
  "Hype / Rumours",
  "Gaming",
  "Marketing News",
];

const NO_STACK_MATCH = "No stack match";

const STACK_ALIASES = {
  "Gemini API": ["gemini", "google ai", "google deepmind"],
  "OpenAI API": ["openai", "gpt"],
  "Next.js": ["next.js", "nextjs"],
  "Tailwind CSS": ["tailwind", "tailwindcss"],
  "Node.js": ["node.js", "nodejs"],
  "PostgreSQL": ["postgres", "postgresql"],
  "MongoDB": ["mongodb", "mongo"],
  "Supabase": ["supabase"],
  "Firebase": ["firebase", "firestore"],
  "LangChain": ["langchain", "langgraph"],
};

const LEARNING_GOAL_CATEGORIES = {
  "AI/ML": ["AI / Models", "AI Tools", "Developer Tools"],
  Frontend: ["Web Dev", "Developer Tools"],
  Backend: ["Backend / Cloud", "Database", "Security"],
  Mobile: ["Mobile"],
  "Full-stack": ["Web Dev", "Backend / Cloud", "Database"],
  DevOps: [
    "Backend / Cloud",
    "Security",
    "Pricing / Policy",
    "Developer Tools",
  ],
};

const CATEGORY_IMPORTANCE = {
  Security: 10,
  "Pricing / Policy": 9,
  Events: 8,
  "AI / Models": 7,
  "AI Tools": 7,
  "Developer Tools": 6,
  "Backend / Cloud": 5,
  Database: 5,
  "Web Dev": 4,
  Mobile: 4,
};

const STOPWORDS = new Set([
  "with",
  "from",
  "that",
  "this",
  "have",
  "will",
  "your",
  "using",
  "built",
  "build",
  "project",
  "student",
  "prototype",
]);

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .trim();
}

function getSearchText(signal) {
  return normalize(
    [
      signal.title,
      signal.category,
      signal.stackMatch,
      signal.summary,
      signal.whatHappened,
      signal.beginnerExplanation,
      signal.whyMatters,
      signal.sourceName,
    ].join(" "),
  );
}

function getStackTerms(stackItem) {
  const aliases = STACK_ALIASES[stackItem] || [];
  return [stackItem, ...aliases].map(normalize).filter(Boolean);
}

function textIncludesTerm(text, term) {
  if (!term) return false;
  return text === term || text.includes(term);
}

function findStackMatchInItems(stack, signal) {
  if (!Array.isArray(stack) || stack.length === 0) return null;
  const stackMatch = normalize(signal.stackMatch);
  const searchText = getSearchText(signal);

  return stack.find((item) => {
    const terms = getStackTerms(item);
    return terms.some(
      (term) =>
      textIncludesTerm(stackMatch, term) || textIncludesTerm(searchText, term),
    );
  }) || null;
}

function findStackMatch(profile, signal) {
  return findStackMatchInItems(profile?.stack || [], signal);
}

function findPrimaryStackMatch(profile, signal) {
  return findStackMatchInItems(profile?.primaryStack || [], signal);
}

function findSignalPreferenceMatch(profile, signal) {
  const preferences = profile?.signalPreferences || [];
  if (!Array.isArray(preferences) || preferences.length === 0) return null;

  const category = normalize(signal.category);
  const searchText = getSearchText(signal);

  return preferences.find((preference) => {
    const term = normalize(preference);
    return category === term || textIncludesTerm(searchText, term);
  }) || null;
}

function findMutedTopicMatch(profile, signal) {
  const mutedTopics = profile?.mutedTopics || [];
  if (!Array.isArray(mutedTopics) || mutedTopics.length === 0) return null;

  const searchText = getSearchText(signal);
  return mutedTopics.find((topic) => textIncludesTerm(searchText, normalize(topic))) || null;
}

function getProjectMatches(profile, signal) {
  const projectText = normalize(profile?.currentProject);
  if (!projectText) return [];

  const searchText = getSearchText(signal);
  const terms = Array.from(new Set(projectText.split(/\s+/))).filter(
    (term) => term.length >= 4 && !STOPWORDS.has(term),
  );

  return terms.filter((term) => textIncludesTerm(searchText, term)).slice(0, 4);
}

function matchesLearningGoal(profile, signal) {
  const learningGoal = profile?.learningGoal;
  if (!learningGoal) return false;

  const categoryMatches = LEARNING_GOAL_CATEGORIES[learningGoal] || [];
  if (categoryMatches.includes(signal.category)) return true;

  return textIncludesTerm(getSearchText(signal), normalize(learningGoal));
}

function getFreshnessScore(signal, now) {
  const rawTimestamp = getSignalTimestamp(signal);
  if (!rawTimestamp) return 0;

  const timestamp = new Date(rawTimestamp);
  if (Number.isNaN(timestamp.getTime())) return 0;

  const ageMs = now.getTime() - timestamp.getTime();
  if (ageMs < 0) return 0;
  if (ageMs <= 24 * 60 * 60 * 1000) return 8;
  if (ageMs <= 7 * 24 * 60 * 60 * 1000) return 4;
  return 0;
}

function getDeadlineScore(profile, hasPersonalMatch) {
  if (!hasPersonalMatch) return 0;
  if (profile?.deadline === "This Week") return 6;
  if (profile?.deadline === "2 Weeks") return 4;
  if (profile?.deadline === "1 Month") return 2;
  return 0;
}

function getRiskRank(riskLevel) {
  if (riskLevel === "High") return 3;
  if (riskLevel === "Medium") return 2;
  return 1;
}

function getRiskFromRank(rank) {
  if (rank >= 3) return "High";
  if (rank >= 2) return "Medium";
  return "Low";
}

function getProjectStageRiskFloor(profile, signal, personalization) {
  const projectStage = profile?.projectStage;
  const directImpact = Boolean(
    personalization.primaryStackMatch ||
      personalization.stackMatch ||
      personalization.projectMatches.length > 0,
  );
  if (!directImpact) return 1;

  const category = signal.category;

  if (["Deployed", "Production"].includes(projectStage)) {
    if (
      ["Security", "Pricing / Policy", "Backend / Cloud", "Database"].includes(
        category,
      )
    ) {
      return 3;
    }
    return 2;
  }

  if (projectStage === "Prototype") {
    if (["Security", "Pricing / Policy"].includes(category)) return 3;
    if (["Backend / Cloud", "Database", "Developer Tools"].includes(category)) {
      return 2;
    }
  }

  return 1;
}

function personalizeRiskLevel(signal, profile, personalization) {
  const baseRiskLevel = signal.baseRiskLevel || signal.riskLevel || "Low";
  const category = signal.category;
  const hasPersonalMatch = Boolean(
    personalization.stackMatch ||
      personalization.primaryStackMatch ||
      personalization.projectMatches.length > 0 ||
      personalization.learningGoalMatch,
  );
  let riskRank = getRiskRank(baseRiskLevel);

  if (["Security", "Pricing / Policy"].includes(category)) {
    riskRank = Math.max(riskRank, hasPersonalMatch ? 3 : 2);
  } else if (
    hasPersonalMatch &&
    ["Backend / Cloud", "Database", "Events"].includes(category)
  ) {
    riskRank = Math.max(riskRank, 2);
  }

  riskRank = Math.max(riskRank, getProjectStageRiskFloor(profile, signal, personalization));

  return getRiskFromRank(riskRank);
}

function getPersonalizedPriority(relevance, riskLevel, fallbackPriority) {
  if (riskLevel === "High" || relevance >= 80) return "Check Today";
  if (relevance >= 58 || riskLevel === "Medium") return "Review This Week";
  return fallbackPriority || "Save for Later";
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

export function personalizeSignal(profile, signal, now = new Date()) {
  const baseRelevance = signal.baseRelevance ?? signal.relevance ?? 0;
  const baseRiskLevel = signal.baseRiskLevel || signal.riskLevel || "Low";
  const primaryStackMatch = findPrimaryStackMatch(profile, signal);
  const stackMatch = primaryStackMatch || findStackMatch(profile, signal);
  const projectMatches = getProjectMatches(profile, signal);
  const learningGoalMatch = matchesLearningGoal(profile, signal);
  const signalPreferenceMatch = findSignalPreferenceMatch(profile, signal);
  const mutedTopicMatch = findMutedTopicMatch(profile, signal);
  const hasPersonalMatch = Boolean(
    stackMatch ||
      primaryStackMatch ||
      projectMatches.length > 0 ||
      learningGoalMatch ||
      signalPreferenceMatch,
  );

  const personalization = {
    stackMatch,
    primaryStackMatch,
    projectMatches,
    learningGoalMatch,
    signalPreferenceMatch,
    mutedTopicMatch,
  };

  // The collector score is treated as a weak base signal. Profile evidence is
  // stronger because BriefMate's value is personal impact, not generic news rank.
  const relevance = clampScore(
    baseRelevance * 0.35 +
      (primaryStackMatch ? 42 : stackMatch ? 30 : 0) +
      Math.min(projectMatches.length * 5, 15) +
      (learningGoalMatch ? 10 : 0) +
      (signalPreferenceMatch ? 12 : 0) +
      getDeadlineScore(profile, hasPersonalMatch) +
      getFreshnessScore(signal, now) +
      (CATEGORY_IMPORTANCE[signal.category] || 3) -
      (mutedTopicMatch ? 40 : 0),
  );
  const riskLevel = personalizeRiskLevel(signal, profile, personalization);
  const enrichedSections = enrichSignalSections(signal, profile, personalization);

  return {
    ...signal,
    baseRelevance,
    baseRiskLevel,
    relevance,
    riskLevel,
    priority: getPersonalizedPriority(relevance, riskLevel, signal.priority),
    stackMatch: stackMatch || signal.stackMatch || NO_STACK_MATCH,
    whatHappened: enrichedSections.whatHappened,
    beginnerExplanation: enrichedSections.beginnerExplanation,
    whyMatters: enrichedSections.whyMatters,
    recommendedAction: enrichedSections.recommendedAction,
    signalType: enrichedSections.signalType,
    personalization,
  };
}

export function personalizeSignals(profile, signals = [], now = new Date()) {
  return signals.map((signal) => personalizeSignal(profile, signal, now));
}

// Get the 3 fresh "Today" signals based on user profile.
export function getTodaySignals(profile, signals = []) {
  const now = new Date();

  return personalizeSignals(profile, signals, now)
    .filter((signal) => isFreshForToday(signal))
    .sort((a, b) => {
      const relevanceDiff = (b.relevance ?? 0) - (a.relevance ?? 0);
      if (relevanceDiff !== 0) return relevanceDiff;
      return String(b.publishedAt || b.collectedAt || "").localeCompare(
        String(a.publishedAt || a.collectedAt || ""),
      );
    })
    .slice(0, 3);
}
