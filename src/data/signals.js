// Mock tech signals data
export const MOCK_SIGNALS = [
  {
    id: "firebase-pricing",
    title: "Firebase pricing update",
    category: "Backend",
    relevance: 86,
    priority: "Review This Week",
    stackMatch: "Firebase",
    summary:
      "Firebase has updated its Blaze plan pricing with new tiered rates for Cloud Functions, Firestore reads, and Storage bandwidth starting next month.",
    whatHappened:
      "Google announced changes to Firebase Blaze plan pricing affecting Cloud Functions invocations, Firestore document reads, and outbound Storage bandwidth. Some free-tier limits have also been adjusted.",
    beginnerExplanation:
      "Firebase is the cloud backend you use to store data, authenticate users, and run server code. They are changing how much it costs once your app gets popular. Small student projects on the free tier are mostly fine, but if your project scales, your bill could look different.",
    whyMatters:
      "You listed Firebase in your stack and your current project may depend on Firestore or Cloud Functions. Knowing the new limits helps you avoid surprise bills and plan your data structure to minimize reads.",
    riskLevel: "Medium",
    recommendedAction:
      "Review your Firestore read patterns. Cache data on the client when possible and batch reads. If your app is still on free tier, monitor your usage in the Firebase console weekly.",
    resources: [
      "Firebase Pricing Docs",
      "Firestore Best Practices",
      "Reducing Firestore Reads (YouTube)",
    ],
  },
  {
    id: "gemini-2-5-flash",
    title: "Gemini 2.5 Flash release",
    category: "AI Tools",
    relevance: 91,
    priority: "Check Today",
    stackMatch: "Gemini API",
    summary:
      "Google released Gemini 2.5 Flash with faster inference, lower latency, and improved reasoning at a reduced API cost.",
    whatHappened:
      "Google DeepMind shipped Gemini 2.5 Flash, a faster and cheaper variant of Gemini 2.5 Pro. It offers improved reasoning, a 1M token context window, and lower per-token pricing on the API.",
    beginnerExplanation:
      'Gemini is Google\'s AI model that you can call from your code. The new "Flash" version is like a lighter, faster version of the smart Pro model. It costs less and replies quicker, which is perfect for chat features in student projects.',
    whyMatters:
      "You use the Gemini API in your stack. Switching to 2.5 Flash could make your AI features feel snappier and cost less per request, which matters when you demo a project or run on free credits.",
    riskLevel: "Low",
    recommendedAction:
      'Swap your current model name to "gemini-2.5-flash" in one branch and test latency and output quality. Keep Pro as a fallback for complex prompts.',
    resources: [
      "Gemini API Docs",
      "Model Comparison Guide",
      "Migrating from Gemini 1.5 to 2.5",
    ],
  },
  {
    id: "react-compiler",
    title: "React compiler update",
    category: "Frontend",
    relevance: 18,
    priority: "Ignore for Now",
    stackMatch: "No stack match",
    summary:
      "The React team shipped a stable release of the React Compiler that auto-memoizes components without manual useMemo or useCallback.",
    whatHappened:
      "React Compiler reached stable status. It automatically optimizes your components at build time, removing the need for manual useMemo, useCallback, and React.memo in most cases.",
    beginnerExplanation:
      "Normally in React you have to tell the app which parts not to re-render using useMemo or useCallback. The new compiler does this for you automatically when you build your app.",
    whyMatters:
      "You did not select React in your stack, so this update has low relevance right now. If you pivot to a React-based frontend later, this will reduce boilerplate.",
    riskLevel: "Low",
    recommendedAction:
      "No action needed. Bookmark for later if you start a React project.",
    resources: ["React Compiler Docs", "React 19 Release Notes"],
  },
  // Extra signals for Explore
  {
    id: "nextjs-15",
    title: "Next.js 15 stable release",
    category: "Frontend",
    relevance: 72,
    priority: "Review This Week",
    stackMatch: "Next.js",
    summary:
      "Next.js 15 ships with React 19 support, improved caching defaults, and a faster Turbopack dev server.",
    whatHappened:
      "Vercel released Next.js 15 with React 19 support, new caching defaults (fetch is no longer cached by default), and Turbopack improvements for faster local development.",
    beginnerExplanation:
      'Next.js is a popular framework built on React. Version 15 changes a few defaults around caching, so data you fetch will feel more "live" by default instead of being cached.',
    whyMatters:
      "If you build with Next.js, the new caching defaults can break assumptions in older tutorials. Knowing this saves debugging time.",
    riskLevel: "Medium",
    recommendedAction:
      "Read the upgrade guide before bumping versions. Audit any fetch() calls where you relied on the old caching behavior.",
    resources: ["Next.js 15 Upgrade Guide", "React 19 Notes"],
  },
  {
    id: "supabase-auth",
    title: "Supabase Auth gets passkeys",
    category: "Backend",
    relevance: 65,
    priority: "Review This Week",
    stackMatch: "Supabase",
    summary:
      "Supabase Auth now supports passkeys natively, letting users sign in without passwords using Face ID or fingerprints.",
    whatHappened:
      "Supabase added native passkey support to their Auth service. Users can register a passkey and sign in using device biometrics.",
    beginnerExplanation:
      "Passkeys are a passwordless login method. Instead of remembering a password, the user uses Face ID or a fingerprint to log in. Supabase now handles this for you.",
    whyMatters:
      "Adding passkeys to a student project is a strong portfolio differentiator and improves UX.",
    riskLevel: "Low",
    recommendedAction:
      "Try the passkey demo and consider adding it as an optional login method in your project.",
    resources: ["Supabase Passkeys Docs", "WebAuthn Overview"],
  },
  {
    id: "tailwind-4",
    title: "Tailwind CSS v4 launches",
    category: "Frontend",
    relevance: 58,
    priority: "Review This Week",
    stackMatch: "Tailwind CSS",
    summary:
      "Tailwind CSS v4 ships with a new Oxide engine, faster builds, and CSS-first configuration.",
    whatHappened:
      "Tailwind v4 introduces a Rust-powered engine, native CSS variables for theming, and removes the JS config file in favor of CSS-based configuration.",
    beginnerExplanation:
      "Tailwind is the utility-first CSS framework you use for styling. The new version is much faster and you configure your colors directly in CSS instead of a JS file.",
    whyMatters:
      "Migrating may break older tutorials, but builds will be noticeably faster on your laptop.",
    riskLevel: "Medium",
    recommendedAction:
      "Stay on v3 for active projects. Try v4 on a new side project first.",
    resources: ["Tailwind v4 Announcement", "Migration Guide"],
  },
  {
    id: "langchain-update",
    title: "LangChain v0.3 simplifies agents",
    category: "AI Tools",
    relevance: 78,
    priority: "Check Today",
    stackMatch: "LangChain",
    summary:
      "LangChain v0.3 introduces a cleaner agent API and better streaming support across providers.",
    whatHappened:
      "LangChain shipped v0.3 with a redesigned agent API, native streaming for tool calls, and improved error messages.",
    beginnerExplanation:
      "LangChain helps you build apps that chain together LLM calls and tools. The new version makes building agents (LLMs that can use tools) much easier.",
    whyMatters:
      "If your project uses LangChain, upgrading will reduce boilerplate and improve reliability.",
    riskLevel: "Medium",
    recommendedAction:
      "Read the migration notes and update your agent code on a branch.",
    resources: ["LangChain v0.3 Docs", "Agent Tutorial"],
  },
  {
    id: "flutter-3-24",
    title: "Flutter 3.24 adds GPU shaders",
    category: "Mobile",
    relevance: 62,
    priority: "Review This Week",
    stackMatch: "Flutter",
    summary:
      "Flutter 3.24 introduces Impeller on Android by default and new GPU shader APIs for custom effects.",
    whatHappened:
      "Flutter 3.24 enables the Impeller rendering engine on Android by default and exposes new APIs for custom GPU shaders.",
    beginnerExplanation:
      "Flutter is the cross-platform mobile framework. The new rendering engine makes animations smoother on Android, matching the experience on iOS.",
    whyMatters:
      "If you ship Android apps, jank should reduce. Custom shader APIs are advanced but useful for unique effects.",
    riskLevel: "Low",
    recommendedAction:
      "Update to 3.24 and test your animations on a low-end Android device.",
    resources: ["Flutter 3.24 Release Notes", "Impeller Docs"],
  },
  {
    id: "postgres-17",
    title: "PostgreSQL 17 released",
    category: "Database",
    relevance: 55,
    priority: "Save for Later",
    stackMatch: "PostgreSQL",
    summary:
      "PostgreSQL 17 brings faster vacuum, improved JSON_TABLE support, and better logical replication.",
    whatHappened:
      "The PostgreSQL team released v17 with significant vacuum performance improvements, SQL/JSON enhancements, and better logical replication for failover.",
    beginnerExplanation:
      "Postgres is a powerful SQL database. Version 17 is faster at cleanup tasks and handles JSON data better, which is useful when you mix structured and flexible data.",
    whyMatters:
      "Most managed Postgres providers will upgrade automatically. Knowing the new JSON features helps when modeling flexible data.",
    riskLevel: "Low",
    recommendedAction:
      "Read the JSON_TABLE examples. No urgent migration needed.",
    resources: ["PostgreSQL 17 Release Notes"],
  },
  {
    id: "docker-desktop",
    title: "Docker Desktop adds AI dev env",
    category: "DevOps",
    relevance: 40,
    priority: "Save for Later",
    stackMatch: "Docker",
    summary:
      "Docker Desktop now bundles an AI-assisted dev environment for spinning up local services.",
    whatHappened:
      "Docker shipped an AI feature in Docker Desktop that suggests services and writes compose files based on natural language.",
    beginnerExplanation:
      "Docker lets you run things like databases on your laptop without installing them directly. The new AI helper writes the config files for you.",
    whyMatters:
      "Faster local setup means less time fighting tooling and more time building features.",
    riskLevel: "Low",
    recommendedAction:
      "Update Docker Desktop and try generating a compose file for your project.",
    resources: ["Docker Desktop Release Notes"],
  },
  {
    id: "openai-realtime",
    title: "OpenAI Realtime API GA",
    category: "AI Tools",
    relevance: 70,
    priority: "Check Today",
    stackMatch: "OpenAI API",
    summary:
      "OpenAI Realtime API is now generally available with lower latency voice conversations.",
    whatHappened:
      "OpenAI moved the Realtime API to general availability with reduced latency, new voices, and lower pricing.",
    beginnerExplanation:
      "The Realtime API lets you build voice apps that feel like a phone call with an AI. It is now stable enough for real projects.",
    whyMatters:
      "Voice projects are great portfolio pieces. Lower pricing makes this affordable for student builds.",
    riskLevel: "Low",
    recommendedAction:
      "Try the voice quickstart in a side project this weekend.",
    resources: ["Realtime API Docs", "Voice Quickstart"],
  },
  {
    id: "mongodb-atlas",
    title: "MongoDB Atlas Vector Search GA",
    category: "Database",
    relevance: 48,
    priority: "Save for Later",
    stackMatch: "MongoDB",
    summary:
      "MongoDB Atlas Vector Search is generally available, letting you do semantic search inside your existing database.",
    whatHappened:
      "MongoDB Atlas Vector Search reached GA, supporting hybrid search combining keyword and vector similarity.",
    beginnerExplanation:
      'Vector search lets you find data by meaning, not just keywords. Useful for AI features like "find similar notes" or RAG.',
    whyMatters:
      "You can add AI search to a MongoDB project without setting up a separate vector database.",
    riskLevel: "Low",
    recommendedAction: "Try the vector search tutorial on a small dataset.",
    resources: ["Atlas Vector Search Docs", "RAG Tutorial"],
  },
];

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

// Get the 3 "Today" signals based on user profile.
export function getTodaySignals(profile, signals = MOCK_SIGNALS) {
  const todayIds = ["firebase-pricing", "gemini-2-5-flash", "react-compiler"];
  const fallbackDailyBrief =
    signals === MOCK_SIGNALS
      ? todayIds.map((id) => signals.find((signal) => signal.id === id))
      : [...signals]
          .sort((a, b) => {
            const relevanceDiff = (b.relevance ?? 0) - (a.relevance ?? 0);
            if (relevanceDiff !== 0) return relevanceDiff;
            return String(b.publishedAt || "").localeCompare(String(a.publishedAt || ""));
          })
          .slice(0, 3);

  return fallbackDailyBrief.filter(Boolean).map((signal) => applyStackMatch(signal, profile));
}
