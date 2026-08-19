import { Paper, PrototypePayload } from "./types";

export interface LoadPapersResult {
  papers: Paper[];
  error: string | null;
}

function isValidPrototype(value: unknown): value is PrototypePayload {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.id === "string" && typeof entry.name === "string" && "payload" in entry;
}

function isValidPaper(value: unknown): value is Paper {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.id === "string" && typeof entry.title === "string" && Array.isArray(entry.prototypes);
}

/**
 * Fetches and leniently validates the paper registry. Malformed entries are dropped
 * (with a console.warn) rather than crashing the dialog, per the demo's error-handling requirements.
 */
export async function loadPapers(): Promise<LoadPapersResult> {
  let response: Response;
  try {
    response = await fetch("/papers/papers.json");
  } catch (err) {
    return { papers: [], error: `Failed to fetch papers.json: ${(err as Error).message}` };
  }
  if (!response.ok) {
    return { papers: [], error: `Failed to fetch papers.json: HTTP ${response.status}` };
  }

  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch (err) {
    return { papers: [], error: `papers.json is not valid JSON: ${(err as Error).message}` };
  }

  if (!Array.isArray(parsed)) {
    return { papers: [], error: "papers.json must be an array of papers." };
  }

  const papers: Paper[] = [];
  for (const entry of parsed) {
    if (!isValidPaper(entry)) {
      console.warn("Skipping malformed paper entry in papers.json", entry);
      continue;
    }
    const prototypes = entry.prototypes.filter((p) => {
      if (isValidPrototype(p)) return true;
      console.warn(`Skipping malformed prototype entry for paper "${entry.id}"`, p);
      return false;
    });
    papers.push({ ...entry, prototypes });
  }

  return { papers, error: null };
}
