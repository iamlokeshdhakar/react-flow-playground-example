import { KnowledgeEdge, KnowledgeNode } from "./types";

export interface CustomGraphData {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export interface ParseResult {
  data: CustomGraphData | null;
  error: string | null;
}

/**
 * Parses and validates user-supplied graph JSON, shaped like `{ "nodes": [...], "edges": [...] }`
 * with node/edge fields matching KnowledgeNode/KnowledgeEdge. Node/edge `type` may be any string —
 * unrecognized types get a generated fallback color/icon via getNodeTypeMeta/getEdgeTypeLabel.
 * An empty/whitespace-only input is treated as "no custom data" rather than an error.
 */
export function parseCustomGraphJson(raw: string): ParseResult {
  if (!raw.trim()) return { data: null, error: null };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return { data: null, error: `Invalid JSON: ${(err as Error).message}` };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { data: null, error: 'Expected a JSON object shaped like { "nodes": [...], "edges": [...] }.' };
  }
  const obj = parsed as Record<string, unknown>;
  if (!Array.isArray(obj.nodes) || !Array.isArray(obj.edges)) {
    return { data: null, error: '"nodes" and "edges" must both be arrays.' };
  }

  const nodes: KnowledgeNode[] = [];
  const nodeIds = new Set<string>();
  for (let i = 0; i < obj.nodes.length; i++) {
    const entry = obj.nodes[i] as Record<string, unknown>;
    if (typeof entry?.id !== "string" || typeof entry?.type !== "string" || typeof entry?.label !== "string") {
      return { data: null, error: `Node at index ${i} must have string "id", "type", and "label" fields.` };
    }
    if (nodeIds.has(entry.id)) {
      return { data: null, error: `Duplicate node id "${entry.id}".` };
    }
    nodeIds.add(entry.id);
    nodes.push({
      id: entry.id,
      type: entry.type,
      label: entry.label,
      description: typeof entry.description === "string" ? entry.description : "",
    });
  }

  if (nodes.length === 0) {
    return { data: null, error: '"nodes" must contain at least one node.' };
  }

  const edges: KnowledgeEdge[] = [];
  const edgeIds = new Set<string>();
  for (let i = 0; i < obj.edges.length; i++) {
    const entry = obj.edges[i] as Record<string, unknown>;
    if (
      typeof entry?.id !== "string" ||
      typeof entry?.source !== "string" ||
      typeof entry?.target !== "string" ||
      typeof entry?.type !== "string"
    ) {
      return { data: null, error: `Edge at index ${i} must have string "id", "source", "target", and "type" fields.` };
    }
    if (edgeIds.has(entry.id)) {
      return { data: null, error: `Duplicate edge id "${entry.id}".` };
    }
    if (!nodeIds.has(entry.source) || !nodeIds.has(entry.target)) {
      return {
        data: null,
        error: `Edge "${entry.id}" references a node id that isn't in "nodes" (${entry.source} -> ${entry.target}).`,
      };
    }
    edgeIds.add(entry.id);
    edges.push({
      id: entry.id,
      source: entry.source,
      target: entry.target,
      type: entry.type,
      label: typeof entry.label === "string" ? entry.label : undefined,
    });
  }

  return { data: { nodes, edges }, error: null };
}
