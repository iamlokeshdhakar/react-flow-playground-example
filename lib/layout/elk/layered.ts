import { KnowledgeNode, KnowledgeEdge } from "@/lib/graph/types";
import { LayoutEngine, LayoutOptions, Size } from "@/lib/layout/types";
import { runElk } from "./convert";

export const elkLayeredEngine: LayoutEngine = {
  id: "elk-layered",
  label: "ELK Layered",
  computeLayout(nodes: KnowledgeNode[], edges: KnowledgeEdge[], sizes: Record<string, Size>, options: LayoutOptions) {
    return runElk(nodes, edges, sizes, {
      "elk.algorithm": "org.eclipse.elk.layered",
      "elk.direction": options.direction,
      "elk.spacing.nodeNode": String(options.spacing.node),
      "elk.layered.spacing.nodeNodeBetweenLayers": String(options.spacing.layer),
      "elk.spacing.edgeNode": String(options.spacing.edge),
      "elk.spacing.componentComponent": String(options.spacing.component),
      "elk.edgeRouting": "ORTHOGONAL",
    });
  },
};
