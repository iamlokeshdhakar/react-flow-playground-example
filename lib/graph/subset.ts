import { KnowledgeEdge, KnowledgeNode } from "./types";

/**
 * Picks the `limit` highest-degree nodes (by total in+out edges across the full graph) and
 * every edge whose both endpoints survive — so a small subset still shows the most connected,
 * most illustrative part of the graph rather than an arbitrary slice.
 */
export function selectTopNodesByDegree(
  nodes: KnowledgeNode[],
  edges: KnowledgeEdge[],
  limit: number
): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
  if (limit >= nodes.length) return { nodes, edges };

  const degree: Record<string, number> = {};
  for (const n of nodes) degree[n.id] = 0;
  for (const e of edges) {
    degree[e.source] = (degree[e.source] ?? 0) + 1;
    degree[e.target] = (degree[e.target] ?? 0) + 1;
  }

  const ranked = [...nodes].sort((a, b) => degree[b.id] - degree[a.id]);
  const selectedIds = new Set(ranked.slice(0, Math.max(0, limit)).map((n) => n.id));

  return {
    nodes: nodes.filter((n) => selectedIds.has(n.id)),
    edges: edges.filter((e) => selectedIds.has(e.source) && selectedIds.has(e.target)),
  };
}
