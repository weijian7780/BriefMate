import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type FeedSource = {
  id: string;
  name: string;
  source_type: "github_release" | "rss" | "api" | "event" | "changelog";
  url: string;
  category: string;
  stack_match: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function plainText(value: string | null) {
  return (value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`[\]()]/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}...`;
}

async function loadFeedSources(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from("feed_sources")
    .select("id,name,source_type,url,category,stack_match")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data || []) as FeedSource[];
}

async function fetchLatestGithubRelease(source: FeedSource) {
  const response = await fetch(`https://api.github.com/repos/${source.url}/releases/latest`, {
    headers: {
      "Accept": "application/vnd.github+json",
      "User-Agent": "briefmate-tech-signal-collector",
    },
  });

  if (!response.ok) {
    throw new Error(`${source.name} returned ${response.status}`);
  }

  const release = await response.json();
  const body = plainText(release.body);
  const stackMatch = source.stack_match || "General";
  const title = `${stackMatch} ${release.name || release.tag_name} release`;
  const summary =
    truncate(body, 220) ||
    `${stackMatch} published a new release on GitHub. Review the changelog before upgrading.`;

  return {
    id: `${source.id}-${slugify(release.tag_name || release.name || crypto.randomUUID())}`,
    title,
    category: source.category,
    relevance: 70,
    priority: "Review This Week",
    stack_match: stackMatch,
    summary,
    what_happened: summary,
    beginner_explanation: `${stackMatch} published a new version. A version update can include bug fixes, new features, or breaking changes.`,
    why_matters: `You may use ${stackMatch} in your stack. Reviewing releases helps you avoid outdated tutorials and unexpected upgrade issues.`,
    risk_level: "Medium",
    recommended_action: "Open the release notes, check breaking changes, and upgrade only after testing in a branch.",
    resources: [`${stackMatch} latest release`],
    source_name: "GitHub Releases",
    source_url: release.html_url,
    published_at: release.published_at,
    collected_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
  };
}

function extractFeedEntries(xml: string) {
  const rssItems = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  if (rssItems.length > 0) return rssItems;

  return [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)].map((match) => match[0]);
}

function getTagValue(xml: string, tagNames: string[]) {
  for (const tagName of tagNames) {
    const pattern = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, "i");
    const match = xml.match(pattern);
    if (match?.[1]) return plainText(match[1]);
  }

  return "";
}

function getFeedLink(entryXml: string) {
  const atomLink = entryXml.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/i);
  if (atomLink?.[1]) return atomLink[1].replace(/&amp;/g, "&").trim();

  return getTagValue(entryXml, ["link"]);
}

function getFeedDate(entryXml: string) {
  return getTagValue(entryXml, ["published", "updated", "pubDate", "dc:date"]);
}

function getPriority(source: FeedSource) {
  if (
    source.source_type === "event" ||
    source.category === "Security" ||
    source.category === "Pricing / Policy"
  ) {
    return "Check Today";
  }

  if (source.source_type === "changelog") return "Review This Week";
  return "Save for Later";
}

function getRiskLevel(source: FeedSource) {
  if (source.category === "Security" || source.category === "Pricing / Policy") {
    return "High";
  }

  if (source.source_type === "event" || source.source_type === "changelog") {
    return "Medium";
  }

  return "Low";
}

function getRelevance(source: FeedSource) {
  if (source.source_type === "event" || source.category === "Security") return 84;
  if (source.source_type === "changelog" || source.category === "Pricing / Policy") return 78;
  if (source.category === "AI / Models" || source.category === "Developer Tools") return 74;
  return 68;
}

type FeedEntry = {
  title: string;
  link: string;
  publishedAt: string;
  summary: string;
};

function findRelevantFeedEntry(source: FeedSource, entries: FeedEntry[]) {
  const sorted = [...entries].sort((a, b) => {
    const bTime = new Date(b.publishedAt || 0).getTime() || 0;
    const aTime = new Date(a.publishedAt || 0).getTime() || 0;
    return bTime - aTime;
  });

  if (source.source_type !== "event") return sorted[0];

  const keywords = [source.stack_match, source.name]
    .flatMap((value) => value.split(/\s+/))
    .map((value) => value.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter((value) => value.length >= 2);

  return (
    sorted.find((entry) => {
      const haystack = `${entry.title} ${entry.summary}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ");
      return keywords.some((keyword) => haystack.includes(keyword));
    }) || sorted[0]
  );
}

async function fetchLatestFeedSignal(source: FeedSource) {
  const response = await fetch(source.url, {
    headers: {
      "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml",
      "User-Agent": "briefmate-tech-signal-collector",
    },
  });

  if (!response.ok) {
    throw new Error(`${source.name} returned ${response.status}`);
  }

  const xml = await response.text();
  const entries = extractFeedEntries(xml)
    .map((entryXml) => {
      const title = getTagValue(entryXml, ["title"]);
      const link = getFeedLink(entryXml);
      const publishedAt = getFeedDate(entryXml);
      const summary = getTagValue(entryXml, [
        "description",
        "summary",
        "content",
        "content:encoded",
      ]);

      return {
        title,
        link,
        publishedAt,
        summary,
      };
    })
    .filter((entry) => entry.title);

  if (entries.length === 0) {
    throw new Error(`${source.name} did not contain feed entries`);
  }

  const entry = findRelevantFeedEntry(source, entries);
  const stackMatch = source.stack_match || "General";
  const collectedAt = new Date().toISOString();
  const summary =
    truncate(entry.summary, 220) ||
    `${source.name} published a new ${source.category.toLowerCase()} update.`;

  return {
    id: `${source.id}-${slugify(entry.link || entry.title || crypto.randomUUID())}`,
    title: entry.title,
    category: source.category,
    relevance: getRelevance(source),
    priority: getPriority(source),
    stack_match: stackMatch,
    summary,
    what_happened: summary,
    beginner_explanation: `${source.name} published an update in ${source.category}. BriefMate converts it into a student-friendly signal so you can decide whether it matters to your project.`,
    why_matters: `This source tracks ${source.category} updates. If it matches your stack, it can affect what you learn, build, deploy, or secure.`,
    risk_level: getRiskLevel(source),
    recommended_action: "Open the official source, verify the details, then decide whether to save, ignore, or apply it to your project.",
    resources: [source.name],
    source_name: source.name,
    source_url: entry.link || source.url,
    published_at: entry.publishedAt || collectedAt,
    collected_at: collectedAt,
    updated_at: collectedAt,
    active: true,
  };
}

async function collectSource(source: FeedSource) {
  if (source.source_type === "github_release") {
    return fetchLatestGithubRelease(source);
  }

  if (source.source_type === "rss") {
    return fetchLatestFeedSignal(source);
  }

  if (source.source_type === "event") {
    return fetchLatestFeedSignal(source);
  }

  if (source.source_type === "changelog") {
    return fetchLatestFeedSignal(source);
  }

  throw new Error(`${source.name} uses unsupported source type ${source.source_type}`);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const sources = await loadFeedSources(supabase);

    if (sources.length === 0) {
      throw new Error("No active feed sources found. Add rows to public.feed_sources.");
    }

    const settled = await Promise.allSettled(sources.map(collectSource));
    const rows = settled
      .filter((result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof collectSource>>> =>
        result.status === "fulfilled"
      )
      .map((result) => result.value);

    if (rows.length === 0) {
      const failures = settled
        .filter((result): result is PromiseRejectedResult => result.status === "rejected")
        .map((result) => result.reason?.message || String(result.reason));
      throw new Error(`No tech signals collected. ${failures.join("; ")}`);
    }

    const { error } = await supabase
      .from("tech_signals")
      .upsert(rows, { onConflict: "id" });

    if (error) throw error;

    return new Response(
      JSON.stringify({
        inserted: rows.length,
        skipped: settled.length - rows.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
