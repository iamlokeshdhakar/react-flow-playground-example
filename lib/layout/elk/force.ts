import { KnowledgeNode, KnowledgeEdge } from "@/lib/graph/types";
import { LayoutEngine, LayoutOptions, Size } from "@/lib/layout/types";
import { runElk } from "./convert";

export const elkForceEngine: LayoutEngine = {
  id: "elk-force",
  label: "ELK Force",
  computeLayout(nodes: KnowledgeNode[], edges: KnowledgeEdge[], sizes: Record<string, Size>, options: LayoutOptions) {
    return runElk(nodes, edges, sizes, {
      "elk.algorithm": "org.eclipse.elk.force",
      "elk.spacing.nodeNode": String(options.spacing.node),
      "elk.spacing.componentComponent": String(options.spacing.component),
      "org.eclipse.elk.force.iterations": "300",
    });
  },
};
