import { supabase } from "../lib/supabaseClient";
import { cleanText } from "./textCleanup";

const TECH_SIGNAL_COLUMNS = [
  "id",
  "title",
  "category",
  "relevance",
  "priority",
  "stack_match",
  "summary",
  "what_happened",
  "beginner_explanation",
  "why_matters",
  "risk_level",
  "recommended_action",
  "resources",
  "source_name",
  "source_url",
  "published_at",
  "collected_at",
  "updated_at",
].join(",");

function mapTechSignalRow(row) {
  const summary = cleanText(row.summary);
  const whatHappened = cleanText(row.what_happened) || summary;

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    relevance: row.relevance ?? 0,
    priority: row.priority || "Save for Later",
    stackMatch: row.stack_match || "No stack match",
    summary,
    whatHappened,
    beginnerExplanation: cleanText(row.beginner_explanation),
    whyMatters: cleanText(row.why_matters),
    riskLevel: row.risk_level || "Low",
    recommendedAction: cleanText(row.recommended_action),
    resources: row.resources || [],
    sourceName: row.source_name || "",
    sourceUrl: row.source_url || "",
    publishedAt: row.published_at || null,
    collectedAt: row.collected_at || null,
    updatedAt: row.updated_at || null,
  };
}

function getLatestUpdatedAt(rows) {
  return rows
    .map((row) => row.updated_at || row.collected_at || row.published_at)
    .filter(Boolean)
    .sort()
    .at(-1) || null;
}

export async function fetchTechSignals() {
  const { data, error } = await supabase
    .from("tech_signals")
    .select(TECH_SIGNAL_COLUMNS)
    .eq("active", true)
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(error.message || "Unable to load live tech signals.");
  }

  const rows = (data || []).filter(
    (row) => row.source_name !== "BriefMate seed data",
  );

  return {
    signals: rows.map(mapTechSignalRow),
    lastUpdatedAt: getLatestUpdatedAt(rows),
  };
}
