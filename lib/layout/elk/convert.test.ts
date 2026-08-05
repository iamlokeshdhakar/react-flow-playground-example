import { describe, it, expect } from "vitest";
import { toElkGraph, fromElkResult, runElk } from "./convert";
import { KnowledgeNode, KnowledgeEdge } from "@/lib/graph/types";

const nodes: KnowledgeNode[] = [
  { id: "a", type: "Gene", label: "A", description: "" },
  { id: "b", type: "Gene", label: "B", description: "" },
  { id: "c", type: "Gene", label: "C", description: "" },
];
const edges: KnowledgeEdge[] = [
  { id: "e1", source: "a", target: "b", type: "associatedWith" },
  { id: "e2", source: "b", target: "c", type: "associatedWith" },
];
const sizes = {
  a: { width: 200, height: 80 },
  b: { width: 200, height: 80 },
  c: { width: 200, height: 80 },
};

describe("toElkGraph", () => {
  it("maps nodes and edges into ELK's expected shape, using measured sizes", () => {
    const graph = toElkGraph(nodes, edges, sizes, { "elk.algorithm": "org.eclipse.elk.layered" });
    expect(graph.children).toHaveLength(3);
    expect(graph.children?.[0]).toMatchObject({ id: "a", width: 200, height: 80 });
    expect(graph.edges).toHaveLength(2);
    expect(graph.edges?.[0]).toMatchObject({ id: "e1", sources: ["a"], targets: ["b"] });
  });

  it("falls back to a default size for unmeasured nodes", () => {
    const graph = toElkGraph(nodes, edges, {}, { "elk.algorithm": "org.eclipse.elk.layered" });
    expect(graph.children?.[0].width).toBeGreaterThan(0);
    expect(graph.children?.[0].height).toBeGreaterThan(0);
  });
});

describe("fromElkResult", () => {
  it("maps ELK's positioned output back into PositionedNode/PositionedEdge", () => {
    const elkResult = {
      id: "root",
      children: [{ id: "a", x: 10, y: 20, width: 200, height: 80 }],
      edges: [
        {
          id: "e1",
          sources: ["a"],
          targets: ["b"],
          sections: [
            { id: "s1", startPoint: { x: 10, y: 20 }, bendPoints: [{ x: 50, y: 30 }], endPoint: { x: 90, y: 40 } },
          ],
        },
      ],
    };
    const result = fromElkResult(elkResult);
    expect(result.nodes[0]).toEqual({ id: "a", x: 10, y: 20, width: 200, height: 80 });
    expect(result.edges[0].points).toEqual([
      { x: 10, y: 20 },
      { x: 50, y: 30 },
      { x: 90, y: 40 },
    ]);
  });
});

describe("runElk", () => {
  it("actually lays out a small graph with real elkjs, producing finite, distinct positions", async () => {
    const result = await runElk(nodes, edges, sizes, {
      "elk.algorithm": "org.eclipse.elk.layered",
      "elk.direction": "DOWN",
    });
    expect(result.nodes).toHaveLength(3);
    for (const n of result.nodes) {
      expect(Number.isFinite(n.x)).toBe(true);
      expect(Number.isFinite(n.y)).toBe(true);
    }
    const positions = result.nodes.map((n) => `${n.x},${n.y}`);
    expect(new Set(positions).size).toBe(positions.length);
  });
});
