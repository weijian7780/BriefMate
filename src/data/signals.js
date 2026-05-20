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

function findStackMatch(profile, signal) {
  const stack = profile?.stack || [];
  if (stack.length === 0) return null;

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

function personalizeRiskLevel(signal, hasPersonalMatch) {
  const baseRiskLevel = signal.baseRiskLevel || signal.riskLevel || "Low";
  const category = signal.category;
  let riskRank = getRiskRank(baseRiskLevel);

  if (["Security", "Pricing / Policy"].includes(category)) {
    riskRank = Math.max(riskRank, hasPersonalMatch ? 3 : 2);
  } else if (
    hasPersonalMatch &&
    ["Backend / Cloud", "Database", "Events"].includes(category)
  ) {
    riskRank = Math.max(riskRank, 2);
  }

  return getRiskFromRank(riskRank);
}

function getPersonalizedPriority(relevance, riskLevel, fallbackPriority) {
  if (riskLevel === "High" || relevance >= 80) return "Check Today";
  if (relevance >= 58 || riskLevel === "Medium") return "Review This Week";
  return fallbackPriority || "Save for Later";
}

function buildPersonalizedWhyMatters(signal, profile, personalization) {
  const reasons = [];

  if (personalization.stackMatch) {
    reasons.push(`you selected ${personalization.stackMatch} in your stack`);
  }
  if (personalization.projectMatches.length > 0) {
    reasons.push(
      `your project mentions ${personalization.projectMatches.join(", ")}`,
    );
  }
  if (personalization.learningGoalMatch) {
    reasons.push(`it fits your ${profile.learningGoal} learning path`);
  }

  if (reasons.length === 0) {
    return (
      signal.whyMatters ||
      `This source tracks ${signal.category} updates. Review it if it affects what you learn, build, deploy, or secure.`
    );
  }

  return `BriefMate raised this signal because ${reasons.join("; ")}.`;
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
  const stackMatch = findStackMatch(profile, signal);
  const projectMatches = getProjectMatches(profile, signal);
  const learningGoalMatch = matchesLearningGoal(profile, signal);
  const hasPersonalMatch = Boolean(
    stackMatch || projectMatches.length > 0 || learningGoalMatch,
  );

  // The collector score is treated as a weak base signal. Profile evidence is
  // stronger because BriefMate's value is personal impact, not generic news rank.
  const relevance = clampScore(
    baseRelevance * 0.35 +
      (stackMatch ? 34 : 0) +
      Math.min(projectMatches.length * 5, 15) +
      (learningGoalMatch ? 10 : 0) +
      getDeadlineScore(profile, hasPersonalMatch) +
      getFreshnessScore(signal, now) +
      (CATEGORY_IMPORTANCE[signal.category] || 3),
  );
  const riskLevel = personalizeRiskLevel(signal, hasPersonalMatch);

  const personalization = {
    stackMatch,
    projectMatches,
    learningGoalMatch,
  };

  return {
    ...signal,
    baseRelevance,
    baseRiskLevel,
    relevance,
    riskLevel,
    priority: getPersonalizedPriority(relevance, riskLevel, signal.priority),
    stackMatch: stackMatch || signal.stackMatch || NO_STACK_MATCH,
    whyMatters: buildPersonalizedWhyMatters(signal, profile, personalization),
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
