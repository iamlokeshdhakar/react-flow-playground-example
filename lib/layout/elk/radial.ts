import { KnowledgeNode, KnowledgeEdge } from "@/lib/graph/types";
import { LayoutEngine, LayoutOptions, Size } from "@/lib/layout/types";
import { runElk } from "./convert";

export const elkRadialEngine: LayoutEngine = {
  id: "elk-radial",
  label: "ELK Radial",
  computeLayout(nodes: KnowledgeNode[], edges: KnowledgeEdge[], sizes: Record<string, Size>, options: LayoutOptions) {
    return runElk(nodes, edges, sizes, {
      "elk.algorithm": "org.eclipse.elk.radial",
      "elk.spacing.nodeNode": String(options.spacing.node),
      "elk.spacing.componentComponent": String(options.spacing.component),
    });
  },
};
