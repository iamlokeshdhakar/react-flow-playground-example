import ELK, { ElkNode } from "elkjs/lib/elk.bundled.js";
import { KnowledgeNode, KnowledgeEdge } from "@/lib/graph/types";
import { LayoutResult, PositionedEdge, PositionedNode, Size, DEFAULT_NODE_SIZE } from "@/lib/layout/types";

export function toElkGraph(
  nodes: KnowledgeNode[],
  edges: KnowledgeEdge[],
  sizes: Record<string, Size>,
  layoutOptions: Record<string, string>
): ElkNode {
  return {
    id: "root",
    layoutOptions,
    children: nodes.map((n) => ({
      id: n.id,
      width: sizes[n.id]?.width ?? DEFAULT_NODE_SIZE.width,
      height: sizes[n.id]?.height ?? DEFAULT_NODE_SIZE.height,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
  };
}

export function fromElkResult(result: ElkNode): LayoutResult {
  const nodes: PositionedNode[] = (result.children ?? []).map((c) => ({
    id: c.id,
    x: c.x ?? 0,
    y: c.y ?? 0,
    width: c.width ?? DEFAULT_NODE_SIZE.width,
    height: c.height ?? DEFAULT_NODE_SIZE.height,
  }));

  const edges: PositionedEdge[] = (result.edges ?? []).map((e) => {
    const section = (e.sections ?? [])[0];
    if (!section) return { id: e.id as string };
    const points = [section.startPoint, ...(section.bendPoints ?? []), section.endPoint];
    return { id: e.id as string, points };
  });

  return { nodes, edges };
}

export async function runElk(
  nodes: KnowledgeNode[],
  edges: KnowledgeEdge[],
  sizes: Record<string, Size>,
  layoutOptions: Record<string, string>
): Promise<LayoutResult> {
  const elk = new ELK();
  const graph = toElkGraph(nodes, edges, sizes, layoutOptions);
  const layouted = await elk.layout(graph);
  return fromElkResult(layouted);
}
