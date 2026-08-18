import { describe, it, expect } from "vitest";
import { selectTopNodesByDegree, filterByOperationStatus, countByOperationStatus } from "./subset";
import { KnowledgeNode, KnowledgeEdge } from "./types";

const nodes: KnowledgeNode[] = ["a", "b", "c", "d", "e"].map((id) => ({
  id,
  type: "Gene",
  label: id,
  description: "",
  operation: "node.fetch",
}));

// degree: a=3, b=2, c=2, d=1, e=0
const edges: KnowledgeEdge[] = [
  { id: "e1", source: "a", target: "b", type: "associatedWith", operation: "edge.fetch" },
  { id: "e2", source: "a", target: "c", type: "associatedWith", operation: "edge.fetch" },
  { id: "e3", source: "a", target: "d", type: "associatedWith", operation: "edge.fetch" },
  { id: "e4", source: "b", target: "c", type: "associatedWith", operation: "edge.fetch" },
];

describe("selectTopNodesByDegree", () => {
  it("returns everything unchanged when the limit is at or above the total node count", () => {
    const result = selectTopNodesByDegree(nodes, edges, 5);
    expect(result.nodes).toEqual(nodes);
    expect(result.edges).toEqual(edges);
    expect(selectTopNodesByDegree(nodes, edges, 10).nodes).toEqual(nodes);
  });

  it("picks the highest-degree nodes first", () => {
    const result = selectTopNodesByDegree(nodes, edges, 3);
    const ids = new Set(result.nodes.map((n) => n.id));
    expect(ids).toEqual(new Set(["a", "b", "c"]));
  });

  it("only keeps edges whose both endpoints survived the cut", () => {
    const result = selectTopNodesByDegree(nodes, edges, 3);
    const survivingIds = new Set(result.nodes.map((n) => n.id));
    for (const e of result.edges) {
      expect(survivingIds.has(e.source)).toBe(true);
      expect(survivingIds.has(e.target)).toBe(true);
    }
    // e3 (a->d) and any edge touching e/d must be dropped since d/e aren't in the top 3.
    expect(result.edges.map((e) => e.id).sort()).toEqual(["e1", "e2", "e4"]);
  });

  it("returns an empty graph for a limit of 0", () => {
    const result = selectTopNodesByDegree(nodes, edges, 0);
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });
});

const mixedNodes: KnowledgeNode[] = [
  { id: "n1", type: "Gene", label: "n1", description: "", operation: "node.create" },
  { id: "n2", type: "Gene", label: "n2", description: "", operation: "node.fetch" },
  { id: "n3", type: "Gene", label: "n3", description: "", operation: "node.update" },
  { id: "n4", type: "Gene", label: "n4", description: "", operation: "node.delete" },
];

const mixedEdges: KnowledgeEdge[] = [
  { id: "me1", source: "n1", target: "n2", type: "associatedWith", operation: "edge.create" },
  { id: "me2", source: "n2", target: "n3", type: "associatedWith", operation: "edge.fetch" },
  { id: "me3", source: "n3", target: "n4", type: "associatedWith", operation: "edge.update" },
];

const ALL_VISIBLE = { new: true, existing: true, modified: true, deleted: true };

describe("filterByOperationStatus", () => {
  it("returns everything unchanged when every status is visible", () => {
    const result = filterByOperationStatus(mixedNodes, mixedEdges, ALL_VISIBLE);
    expect(result.nodes).toEqual(mixedNodes);
    expect(result.edges).toEqual(mixedEdges);
  });

  it("keeps nodes matching the visible statuses plus their first-level neighbors", () => {
    // only n1 (create/"new") matches; n2 is its direct neighbor via me1 and should be pulled in
    // for context even though "existing" is hidden. n3/n4 are 2+ hops away and stay excluded.
    const result = filterByOperationStatus(mixedNodes, mixedEdges, {
      new: true,
      existing: false,
      modified: false,
      deleted: false,
    });
    expect(result.nodes.map((n) => n.id).sort()).toEqual(["n1", "n2"]);
    expect(result.edges.map((e) => e.id)).toEqual(["me1"]);
  });

  it("keeps an edge whose own status is hidden, as long as it touches a matching node", () => {
    const twoNewNodes: KnowledgeNode[] = [
      { id: "x1", type: "Gene", label: "x1", description: "", operation: "node.create" },
      { id: "x2", type: "Gene", label: "x2", description: "", operation: "node.create" },
    ];
    const edgeBetween: KnowledgeEdge[] = [
      { id: "ex1", source: "x1", target: "x2", type: "associatedWith", operation: "edge.fetch" },
    ];
    const result = filterByOperationStatus(twoNewNodes, edgeBetween, { ...ALL_VISIBLE, existing: false });
    // the edge's own "existing" status is hidden, but it still touches two matching "new" nodes.
    expect(result.nodes).toEqual(twoNewNodes);
    expect(result.edges).toEqual(edgeBetween);
  });

  it("still shows a filtered-out node as a first-level neighbor, instead of dropping its edge", () => {
    // "deleted" is hidden, but n4 is a direct neighbor of matching n3 (via me3) so it stays visible
    // as context, and me3 stays too — dropping context edges was the exact bug being fixed here.
    const result = filterByOperationStatus(mixedNodes, mixedEdges, { ...ALL_VISIBLE, deleted: false });
    expect(result.nodes.map((n) => n.id).sort()).toEqual(["n1", "n2", "n3", "n4"]);
    expect(result.edges.map((e) => e.id)).toEqual(["me1", "me2", "me3"]);
  });

  it("does not pull in a neighbor's own further (2-hop) neighbors", () => {
    // only n2 (fetch/"existing") matches; n1 and n3 are direct neighbors and get pulled in, but n4
    // (2 hops away, only reachable through non-matching n3) must not be.
    const result = filterByOperationStatus(mixedNodes, mixedEdges, {
      new: false,
      existing: true,
      modified: false,
      deleted: false,
    });
    expect(result.nodes.map((n) => n.id).sort()).toEqual(["n1", "n2", "n3"]);
    expect(result.edges.map((e) => e.id).sort()).toEqual(["me1", "me2"]);
  });

  it("returns an empty graph when no status is visible", () => {
    const result = filterByOperationStatus(mixedNodes, mixedEdges, {
      new: false,
      existing: false,
      modified: false,
      deleted: false,
    });
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });
});

describe("countByOperationStatus", () => {
  it("counts nodes and edges separately per diff status", () => {
    const counts = countByOperationStatus(mixedNodes, mixedEdges);
    expect(counts).toEqual({
      new: { nodes: 1, edges: 1 },
      existing: { nodes: 1, edges: 1 },
      modified: { nodes: 1, edges: 1 },
      deleted: { nodes: 1, edges: 0 },
    });
  });

  it("gives every status a zeroed entry even when the graph is empty", () => {
    expect(countByOperationStatus([], [])).toEqual({
      new: { nodes: 0, edges: 0 },
      existing: { nodes: 0, edges: 0 },
      modified: { nodes: 0, edges: 0 },
      deleted: { nodes: 0, edges: 0 },
    });
  });
});
