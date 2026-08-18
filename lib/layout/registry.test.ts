import { describe, it, expect } from "vitest";
import { LAYOUT_ENGINES, DEFAULT_LAYOUT_ENGINE_ID } from "./registry";
import { KnowledgeNode, KnowledgeEdge } from "@/lib/graph/types";

const nodes: KnowledgeNode[] = ["a", "b", "c", "d"].map((id) => ({
  id,
  type: "Gene",
  label: id,
  description: "",
  operation: "node.fetch",
}));
const edges: KnowledgeEdge[] = [
  { id: "e1", source: "a", target: "b", type: "associatedWith", operation: "edge.fetch" },
  { id: "e2", source: "b", target: "c", type: "associatedWith", operation: "edge.fetch" },
  { id: "e3", source: "a", target: "d", type: "associatedWith", operation: "edge.fetch" },
];
const sizes = Object.fromEntries(nodes.map((n) => [n.id, { width: 200, height: 80 }]));
const options = { direction: "DOWN" as const, spacing: { node: 40, layer: 60, edge: 20, component: 60 } };

describe("layout engine registry", () => {
  it("registers elk-layered, elk-force, elk-radial, and circular", () => {
    expect(Object.keys(LAYOUT_ENGINES).sort()).toEqual(["circular", "elk-force", "elk-layered", "elk-radial"]);
    expect(LAYOUT_ENGINES[DEFAULT_LAYOUT_ENGINE_ID]).toBeDefined();
  });

  it.each(["elk-layered", "elk-force", "elk-radial", "circular"])(
    "%s positions every node with a finite x/y",
    async (id) => {
      const result = await LAYOUT_ENGINES[id].computeLayout(nodes, edges, sizes, options);
      expect(result.nodes).toHaveLength(4);
      for (const n of result.nodes) {
        expect(Number.isFinite(n.x)).toBe(true);
        expect(Number.isFinite(n.y)).toBe(true);
      }
    }
  );
});
