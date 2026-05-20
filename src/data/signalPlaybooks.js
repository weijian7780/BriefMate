import { cleanText, getFirstSentence } from "../utils/textCleanup";

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

function isGenericBriefText(value) {
  const text = normalize(value);
  return (
    !text ||
    text.includes("official updates published an update") ||
    text.includes("briefmate converts it into a student friendly signal") ||
    text.includes("this source tracks") ||
    text.includes("open the official source verify the details") ||
    text.includes("decide whether to save ignore or apply")
  );
}

function detectSignalPlaybook(signal) {
  const text = getSearchText(signal);
  const category = signal.category;

  if (
    text.includes("tensor ml sdk") ||
    text.includes("litert") ||
    text.includes("pixel") ||
    text.includes("android") ||
    text.includes("mobile sdk") ||
    text.includes("on device") ||
    text.includes("on-device")
  ) {
    return "mobile_sdk_update";
  }
  if (category === "Security" || /cve|vulnerability|exploit|breach/.test(text)) {
    return "security_alert";
  }
  if (category === "Pricing / Policy" || /pricing|free tier|quota|policy/.test(text)) {
    return "pricing_change";
  }
  if (category === "AI / Models" || /gemini|openai|claude|llama|model/.test(text)) {
    return "model_release";
  }
  if (category === "Web Dev" || /react|next\.?js|vite|tailwind|framework/.test(text)) {
    return "framework_update";
  }
  if (category === "Database" || /postgres|mongodb|database|prisma/.test(text)) {
    return "database_update";
  }
  if (
    category === "Backend / Cloud" ||
    /firebase|supabase|aws|vercel|cloudflare|worker|edge/.test(text)
  ) {
    return "cloud_platform_update";
  }
  if (category === "Developer Tools" || /github|copilot|cursor|vscode|cli/.test(text)) {
    return "developer_tool_update";
  }
  if (category === "Events") return "developer_event";
  return "general_update";
}

function getPrimarySubject(signal) {
  const title = signal.title || "This update";
  const titleSeparator = new RegExp("\\s*(?:-|:|\\|).*$");
  return title.replace(titleSeparator, "").trim() || title;
}

function buildWhatHappened(signal, playbook) {
  const subject = getPrimarySubject(signal);
  const summary = getFirstSentence(signal.summary || signal.whatHappened);

  if (playbook === "mobile_sdk_update") {
    return `${subject} moved forward for mobile developers: it enables machine learning work closer to the device, especially Android or Pixel-style on-device AI use cases.`;
  }
  if (summary) return summary;
  return `${subject} has a new technology update that may affect how developers build, deploy, or maintain projects.`;
}

function buildBeginnerExplanation(signal, playbook) {
  const subject = getPrimarySubject(signal);
  const category = signal.category;

  const map = {
    mobile_sdk_update:
      `${subject} is about running AI or machine learning features inside a mobile device instead of depending only on a cloud API. This can make apps faster, cheaper to run, and more private.`,
    security_alert:
      `${subject} is a security warning. In simple terms, it means a tool, package, or platform may have a weakness that developers should patch or avoid.`,
    pricing_change:
      `${subject} changes cost, limits, terms, or platform access. For a student project, this matters because a free prototype can become expensive when usage grows.`,
    model_release:
      `${subject} is an AI model or API update. It may improve speed, quality, cost, context length, tool calling, or multimodal features for apps that use AI.`,
    framework_update:
      `${subject} is a web development framework update. It can change how you build pages, routing, performance, deployment, or developer experience.`,
    database_update:
      `${subject} is a database update. It may affect how data is stored, searched, indexed, secured, or scaled in an application.`,
    cloud_platform_update:
      `${subject} is a backend or cloud platform update. It may affect authentication, hosting, serverless functions, deployment, storage, or API reliability.`,
    developer_tool_update:
      `${subject} is a developer tool update. It may improve coding speed, debugging, automation, version control, or how you manage project workflow.`,
    developer_event:
      `${subject} is from a developer event. Treat it as a signal about where the platform is moving, not just an announcement to read once.`,
    general_update:
      `${subject} is a ${category} update. The key is to check whether it changes what you need to learn, build, deploy, secure, or pay for.`,
  };

  return map[playbook] || map.general_update;
}

function buildPersonalizedWhyMatters(signal, profile, personalization) {
  const reasons = [];

  if (personalization.primaryStackMatch) {
    reasons.push(
      `${personalization.primaryStackMatch} is marked as your primary stack`,
    );
  } else if (personalization.stackMatch) {
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
  if (personalization.signalPreferenceMatch) {
    reasons.push(
      `you asked BriefMate to prioritize ${personalization.signalPreferenceMatch} signals`,
    );
  }
  if (personalization.mutedTopicMatch) {
    reasons.push(
      `${personalization.mutedTopicMatch} is muted, so this should stay lower priority unless it directly affects your stack`,
    );
  }

  if (reasons.length === 0) {
    return (
      signal.whyMatters ||
      `This source tracks ${signal.category} updates. Review it if it affects what you learn, build, deploy, or secure.`
    );
  }

  return `BriefMate raised this signal because ${reasons.join("; ")}.`;
}

function buildPlaybookWhyMatters(signal, profile, playbook, personalization) {
  const directReason = buildPersonalizedWhyMatters(signal, profile, personalization);
  const map = {
    mobile_sdk_update:
      "For a mobile learning path or Android-style project, this matters because on-device AI can reduce latency, cloud cost, and privacy risk.",
    security_alert:
      "This matters because security issues can break trust, expose user data, or force urgent package and dependency updates.",
    pricing_change:
      "This matters because pricing or policy changes can affect whether your prototype stays affordable after demo or user growth.",
    model_release:
      "This matters if your project uses AI features, because model updates can change quality, speed, API cost, and what features are realistic.",
    framework_update:
      "This matters if you build web apps, because framework changes can affect routing, build performance, deployment behavior, or upgrade work.",
    database_update:
      "This matters if your app stores user data, because database updates can affect search, performance, schema design, or reliability.",
    cloud_platform_update:
      "This matters if your project depends on hosted backend services, because platform changes can affect deployment, authentication, storage, or runtime behavior.",
    developer_tool_update:
      "This matters because better developer tools can reduce setup time, debugging time, and repetitive project work.",
    developer_event:
      "This matters as a roadmap signal: event announcements often show which APIs, SDKs, or platforms are becoming important next.",
    general_update:
      directReason,
  };

  const playbookImpact = map[playbook] || directReason;
  if (!isGenericBriefText(directReason) && playbook !== "general_update") {
    return `${directReason} ${playbookImpact}`;
  }

  return playbookImpact;
}

function adaptActionToProfile(action, profile, playbook, hasDirectMatch) {
  if (!hasDirectMatch) return action;

  if (profile?.actionStyle === "Explain only") {
    return "Read the explanation and note what changed. Do not change your project today unless this update directly blocks your current learning or build task.";
  }

  if (profile?.actionStyle === "Save for later") {
    if (playbook === "security_alert") {
      return `${action} Save it only after confirming your stack is not affected.`;
    }
    return "Save this brief and review it during your next project planning session; no immediate change is needed today.";
  }

  if (profile?.projectStage === "Learning") {
    return `${action} Treat it as a learning comparison first, not a migration task.`;
  }

  if (profile?.projectStage === "Prototype") {
    return `${action} Keep the test small and reversible because your project is still a prototype.`;
  }

  if (["Deployed", "Production"].includes(profile?.projectStage)) {
    return `${action} Verify the official source and test in a branch or staging environment before changing the deployed app.`;
  }

  return action;
}

function buildRecommendedAction(signal, profile, playbook, personalization) {
  const hasDirectMatch = Boolean(
    personalization.primaryStackMatch ||
      personalization.stackMatch ||
      personalization.projectMatches.length > 0 ||
      personalization.learningGoalMatch,
  );

  const map = {
    mobile_sdk_update: hasDirectMatch
      ? "If your project has mobile or Android AI features, save this and prototype one small on-device inference flow. Compare it with cloud AI APIs before changing your main architecture."
      : "Save this only if you plan to build mobile AI later; otherwise monitor it as a platform trend.",
    security_alert: hasDirectMatch
      ? "Check whether your stack uses the affected package or platform, then patch, upgrade, or replace it before adding new features."
      : "Skim the affected technology and ignore it if your current stack does not use it.",
    pricing_change: hasDirectMatch
      ? "Check your current usage limits, estimate demo-week cost, and prepare one fallback service if the new policy affects your project."
      : "Monitor the pricing change, but do not spend time migrating unless your stack uses this service.",
    model_release: hasDirectMatch
      ? "Run a small comparison against your current AI API using one real project prompt, then decide whether the speed, quality, or cost is worth switching."
      : "Save it for learning; avoid changing your project unless the model clearly solves a current limitation.",
    framework_update: hasDirectMatch
      ? "Read the migration notes, test the update on a separate branch, and only upgrade if it fixes a problem or improves your current workflow."
      : "Review the headline only; upgrade work can wait if this framework is not in your stack.",
    database_update: hasDirectMatch
      ? "Check whether the update affects your schema, indexes, search, or hosting plan before changing database code."
      : "Keep this as background knowledge unless your project stores data with this database.",
    cloud_platform_update: hasDirectMatch
      ? "Check the official changelog, test the affected cloud feature in a small branch, and confirm deployment still works before relying on it."
      : "Monitor the platform update, but do not change your backend unless it affects your chosen hosting or auth service.",
    developer_tool_update: hasDirectMatch
      ? "Try the tool on one low-risk task, such as refactoring or documentation, before using it in important project code."
      : "Save it for later if it matches your workflow; otherwise ignore it for today.",
    developer_event: hasDirectMatch
      ? "Pick one announcement related to your stack or learning goal and test a tiny demo within 30 minutes."
      : "Scan the roadmap and save only the announcements that match your next project direction.",
    general_update: signal.recommendedAction,
  };

  return adaptActionToProfile(
    map[playbook] || signal.recommendedAction,
    profile,
    playbook,
    hasDirectMatch,
  );
}

export function enrichSignalSections(signal, profile, personalization) {
  const playbook = detectSignalPlaybook(signal);
  const whatHappened = isGenericBriefText(signal.whatHappened)
    ? buildWhatHappened(signal, playbook)
    : getFirstSentence(signal.whatHappened) || buildWhatHappened(signal, playbook);
  const beginnerExplanation = isGenericBriefText(signal.beginnerExplanation)
    ? buildBeginnerExplanation(signal, playbook)
    : cleanText(signal.beginnerExplanation) ||
      buildBeginnerExplanation(signal, playbook);
  const whyMatters = buildPlaybookWhyMatters(signal, profile, playbook, personalization);
  const recommendedAction = isGenericBriefText(signal.recommendedAction)
    ? buildRecommendedAction(signal, profile, playbook, personalization)
    : cleanText(signal.recommendedAction) ||
      buildRecommendedAction(signal, profile, playbook, personalization);

  return {
    whatHappened: cleanText(whatHappened),
    beginnerExplanation: cleanText(beginnerExplanation),
    whyMatters: cleanText(whyMatters),
    recommendedAction: cleanText(recommendedAction),
    signalType: playbook,
  };
}
