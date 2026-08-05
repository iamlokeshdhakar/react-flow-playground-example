import { KnowledgeEdge, KnowledgeNode } from "@/lib/graph/types";
import { DEFAULT_NODE_SIZE, LayoutEngine, LayoutOptions, LayoutResult, PositionedNode, Size } from "./types";

/**
 * Places every node evenly spaced around a single ring (not ELK-backed — a plain, cheap
 * placement useful as a contrasting baseline against ELK's tiered/force/radial layouts, and as
 * a worked example of adding a non-ELK engine to the registry).
 */
export const circularEngine: LayoutEngine = {
  id: "circular",
  label: "Circular",
  async computeLayout(
    nodes: KnowledgeNode[],
    edges: KnowledgeEdge[],
    sizes: Record<string, Size>,
    options: LayoutOptions
  ): Promise<LayoutResult> {
    const count = nodes.length;
    if (count === 0) return { nodes: [], edges: edges.map((e) => ({ id: e.id })) };

    if (count === 1) {
      const size = sizes[nodes[0].id] ?? DEFAULT_NODE_SIZE;
      return {
        nodes: [{ id: nodes[0].id, x: 0, y: 0, width: size.width, height: size.height }],
        edges: edges.map((e) => ({ id: e.id })),
      };
    }

    const maxDiagonal = nodes.reduce((max, n) => {
      const size = sizes[n.id] ?? DEFAULT_NODE_SIZE;
      return Math.max(max, Math.hypot(size.width, size.height));
    }, 0);
    const circumferenceNeeded = count * (maxDiagonal + options.spacing.node);
    const radius = Math.max(150, circumferenceNeeded / (2 * Math.PI));

    const positioned: PositionedNode[] = nodes.map((n, i) => {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      const size = sizes[n.id] ?? DEFAULT_NODE_SIZE;
      return {
        id: n.id,
        x: radius * Math.cos(angle) - size.width / 2,
        y: radius * Math.sin(angle) - size.height / 2,
        width: size.width,
        height: size.height,
      };
    });

    return { nodes: positioned, edges: edges.map((e) => ({ id: e.id })) };
  },
};
