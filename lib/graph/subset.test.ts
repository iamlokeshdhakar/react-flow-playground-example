import { describe, it, expect } from "vitest";
import { selectTopNodesByDegree } from "./subset";
import { KnowledgeNode, KnowledgeEdge } from "./types";

const nodes: KnowledgeNode[] = ["a", "b", "c", "d", "e"].map((id) => ({
  id,
  type: "Gene",
  label: id,
  description: "",
}));

// degree: a=3, b=2, c=2, d=1, e=0
const edges: KnowledgeEdge[] = [
  { id: "e1", source: "a", target: "b", type: "associatedWith" },
  { id: "e2", source: "a", target: "c", type: "associatedWith" },
  { id: "e3", source: "a", target: "d", type: "associatedWith" },
  { id: "e4", source: "b", target: "c", type: "associatedWith" },
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
