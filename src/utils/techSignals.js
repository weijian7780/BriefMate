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

const MAX_TECH_SIGNAL_ROWS = 120;
const TECH_SIGNALS_CACHE_MS = 2 * 60 * 1000;

let cachedTechSignals = null;
let pendingTechSignalsRequest = null;

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
  return rows.reduce((latest, row) => {
    const timestamp = row.updated_at || row.collected_at || row.published_at;
    if (!timestamp) return latest;
    if (!latest) return timestamp;
    return timestamp > latest ? timestamp : latest;
  }, null);
}

export function clearTechSignalsCache() {
  cachedTechSignals = null;
  pendingTechSignalsRequest = null;
}

async function readTechSignalsFromSupabase() {
  const { data, error } = await supabase
    .from("tech_signals")
    .select(TECH_SIGNAL_COLUMNS)
    .eq("active", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(MAX_TECH_SIGNAL_ROWS);

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

export async function fetchTechSignals({ forceRefresh = false } = {}) {
  const now = Date.now();
  if (
    !forceRefresh &&
    cachedTechSignals &&
    now - cachedTechSignals.cachedAt < TECH_SIGNALS_CACHE_MS
  ) {
    return cachedTechSignals.result;
  }

  if (!forceRefresh && pendingTechSignalsRequest) {
    return pendingTechSignalsRequest;
  }

  pendingTechSignalsRequest = readTechSignalsFromSupabase()
    .then((result) => {
      cachedTechSignals = {
        cachedAt: Date.now(),
        result,
      };
      return result;
    })
    .finally(() => {
      pendingTechSignalsRequest = null;
    });

  return pendingTechSignalsRequest;
}
