import { describe, it, expect } from "vitest";
import { KNOWLEDGE_NODES, KNOWLEDGE_EDGES } from "./data";

function degreeMap(edges: { source: string; target: string }[]) {
  const degree: Record<string, number> = {};
  for (const e of edges) {
    degree[e.source] = (degree[e.source] ?? 0) + 1;
    degree[e.target] = (degree[e.target] ?? 0) + 1;
  }
  return degree;
}

function hasCycle(nodeIds: string[], edges: { source: string; target: string }[]): boolean {
  const adjacency: Record<string, string[]> = {};
  for (const id of nodeIds) adjacency[id] = [];
  for (const e of edges) adjacency[e.source].push(e.target);

  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color: Record<string, number> = {};
  for (const id of nodeIds) color[id] = WHITE;

  function visit(id: string): boolean {
    color[id] = GRAY;
    for (const next of adjacency[id]) {
      if (color[next] === GRAY) return true;
      if (color[next] === WHITE && visit(next)) return true;
    }
    color[id] = BLACK;
    return false;
  }

  return nodeIds.some((id) => color[id] === WHITE && visit(id));
}

describe("hand-authored knowledge graph dataset", () => {
  it("has approximately 50 nodes with unique ids", () => {
    expect(KNOWLEDGE_NODES.length).toBeGreaterThanOrEqual(45);
    expect(KNOWLEDGE_NODES.length).toBeLessThanOrEqual(55);
    const ids = KNOWLEDGE_NODES.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique edge ids", () => {
    const ids = KNOWLEDGE_EDGES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has no dangling edge references", () => {
    const nodeIds = new Set(KNOWLEDGE_NODES.map((n) => n.id));
    for (const edge of KNOWLEDGE_EDGES) {
      expect(nodeIds.has(edge.source)).toBe(true);
      expect(nodeIds.has(edge.target)).toBe(true);
    }
  });

  it("includes at least 2 hub nodes with 8 or more connections", () => {
    const degree = degreeMap(KNOWLEDGE_EDGES);
    const hubs = Object.values(degree).filter((d) => d >= 8);
    expect(hubs.length).toBeGreaterThanOrEqual(2);
  });

  it("includes at least one sparsely-connected node (degree 1-2)", () => {
    const degree = degreeMap(KNOWLEDGE_EDGES);
    const nodeIds = KNOWLEDGE_NODES.map((n) => n.id);
    const sparse = nodeIds.filter((id) => (degree[id] ?? 0) <= 2);
    expect(sparse.length).toBeGreaterThan(0);
  });

  it("contains at least one directed cycle", () => {
    const nodeIds = KNOWLEDGE_NODES.map((n) => n.id);
    expect(hasCycle(nodeIds, KNOWLEDGE_EDGES)).toBe(true);
  });

  it("represents all 10 node types", () => {
    const types = new Set(KNOWLEDGE_NODES.map((n) => n.type));
    expect(types.size).toBe(10);
  });
});
