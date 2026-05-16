import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type FeedSource = {
  id: string;
  name: string;
  source_type: "github_release" | "rss" | "api";
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
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`[\]()]/g, " ")
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

async function collectSource(source: FeedSource) {
  if (source.source_type === "github_release") {
    return fetchLatestGithubRelease(source);
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
      throw new Error(`No releases collected. ${failures.join("; ")}`);
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
