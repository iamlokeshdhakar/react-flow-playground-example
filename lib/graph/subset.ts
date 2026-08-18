import { KnowledgeEdge, KnowledgeNode, OperationStatus, operationStatus } from "./types";

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

/**
 * Keeps nodes whose diff status (new/existing/modified/deleted) is visible, plus every edge that
 * touches one of those nodes and the first-level neighbor node on the other end of that edge —
 * even if the neighbor's own status (or the edge's own status) isn't checked. Without this, a
 * filtered node would render with no visible relationships at all, since its neighbors and
 * connecting edges would usually carry a different status than the one being filtered for.
 * Neighbors are only pulled in one hop deep — a neighbor's own further neighbors stay excluded.
 */
export function filterByOperationStatus(
  nodes: KnowledgeNode[],
  edges: KnowledgeEdge[],
  visible: Record<OperationStatus, boolean>
): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
  const matchingIds = new Set(
    nodes.filter((n) => visible[operationStatus(n.operation)]).map((n) => n.id)
  );
  const keptEdges = edges.filter((e) => matchingIds.has(e.source) || matchingIds.has(e.target));

  const keptNodeIds = new Set(matchingIds);
  for (const e of keptEdges) {
    keptNodeIds.add(e.source);
    keptNodeIds.add(e.target);
  }

  return {
    nodes: nodes.filter((n) => keptNodeIds.has(n.id)),
    edges: keptEdges,
  };
}

export interface OperationStatusCount {
  nodes: number;
  edges: number;
}

/** Tallies how many nodes and edges (counted separately) carry each diff status. */
export function countByOperationStatus(
  nodes: KnowledgeNode[],
  edges: KnowledgeEdge[]
): Record<OperationStatus, OperationStatusCount> {
  const counts: Record<OperationStatus, OperationStatusCount> = {
    new: { nodes: 0, edges: 0 },
    existing: { nodes: 0, edges: 0 },
    modified: { nodes: 0, edges: 0 },
    deleted: { nodes: 0, edges: 0 },
  };
  for (const n of nodes) counts[operationStatus(n.operation)].nodes++;
  for (const e of edges) counts[operationStatus(e.operation)].edges++;
  return counts;
}
