import { describe, it, expect } from "vitest";
import { circularEngine } from "./circular";
import { KnowledgeEdge, KnowledgeNode } from "@/lib/graph/types";

const options = { direction: "DOWN" as const, spacing: { node: 40, layer: 60, edge: 20, component: 60 } };

function makeNodes(ids: string[]): KnowledgeNode[] {
  return ids.map((id) => ({ id, type: "Gene", label: id, description: "", operation: "node.fetch" }));
}

describe("circularEngine", () => {
  it("places every node at (approximately) equal distance from the shared center", async () => {
    const nodes = makeNodes(["a", "b", "c", "d", "e", "f"]);
    const sizes = Object.fromEntries(nodes.map((n) => [n.id, { width: 200, height: 80 }]));
    const result = await circularEngine.computeLayout(nodes, [], sizes, options);

    const centers = result.nodes.map((n) => ({ x: n.x + n.width / 2, y: n.y + n.height / 2 }));
    const cx = centers.reduce((s, c) => s + c.x, 0) / centers.length;
    const cy = centers.reduce((s, c) => s + c.y, 0) / centers.length;
    const distances = centers.map((c) => Math.hypot(c.x - cx, c.y - cy));

    for (const d of distances) {
      expect(Math.abs(d - distances[0])).toBeLessThan(1);
    }
  });

  it("handles a single node without producing NaN coordinates", async () => {
    const nodes = makeNodes(["only"]);
    const sizes = { only: { width: 200, height: 80 } };
    const result = await circularEngine.computeLayout(nodes, [], sizes, options);
    expect(result.nodes).toHaveLength(1);
    expect(Number.isFinite(result.nodes[0].x)).toBe(true);
    expect(Number.isFinite(result.nodes[0].y)).toBe(true);
  });

  it("handles an empty graph", async () => {
    const result = await circularEngine.computeLayout([], [], {}, options);
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });

  it("grows the ring radius to keep nodes from overlapping as node size increases", async () => {
    const nodes = makeNodes(["a", "b", "c"]);
    const small = await circularEngine.computeLayout(
      nodes,
      [],
      Object.fromEntries(nodes.map((n) => [n.id, { width: 50, height: 30 }])),
      options
    );
    const large = await circularEngine.computeLayout(
      nodes,
      [],
      Object.fromEntries(nodes.map((n) => [n.id, { width: 400, height: 300 }])),
      options
    );
    const radiusOf = (r: typeof small) => Math.hypot(r.nodes[0].x - r.nodes[1].x, r.nodes[0].y - r.nodes[1].y);
    expect(radiusOf(large)).toBeGreaterThan(radiusOf(small));
  });

  it("passes through edges by id without inventing routing points", async () => {
    const nodes = makeNodes(["a", "b"]);
    const edges: KnowledgeEdge[] = [{ id: "e1", source: "a", target: "b", type: "associatedWith", operation: "edge.fetch" }];
    const sizes = Object.fromEntries(nodes.map((n) => [n.id, { width: 200, height: 80 }]));
    const result = await circularEngine.computeLayout(nodes, edges, sizes, options);
    expect(result.edges).toEqual([{ id: "e1" }]);
  });
});
