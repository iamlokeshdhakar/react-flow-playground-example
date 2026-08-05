import { describe, it, expect } from "vitest";
import { countEdgeCrossings, Segment } from "./edgeCrossings";

describe("countEdgeCrossings", () => {
  it("detects a single crossing between two segments forming an X", () => {
    const segments: Segment[] = [
      { id: "e1", a: { x: 0, y: 0 }, b: { x: 10, y: 10 } },
      { id: "e2", a: { x: 0, y: 10 }, b: { x: 10, y: 0 } },
    ];
    const result = countEdgeCrossings(segments);
    expect(result.count).toBe(1);
    expect(result.crossingEdgeIds).toEqual(new Set(["e1", "e2"]));
  });

  it("reports zero crossings for parallel, non-intersecting segments", () => {
    const segments: Segment[] = [
      { id: "e1", a: { x: 0, y: 0 }, b: { x: 10, y: 0 } },
      { id: "e2", a: { x: 0, y: 5 }, b: { x: 10, y: 5 } },
    ];
    expect(countEdgeCrossings(segments).count).toBe(0);
  });

  it("does not count two edges that share an endpoint (fanning out from one node) as crossing", () => {
    const segments: Segment[] = [
      { id: "e1", a: { x: 0, y: 0 }, b: { x: 10, y: 10 } },
      { id: "e2", a: { x: 0, y: 0 }, b: { x: 10, y: -10 } },
    ];
    expect(countEdgeCrossings(segments).count).toBe(0);
  });

  it("counts multiple independent crossings", () => {
    const segments: Segment[] = [
      { id: "e1", a: { x: 0, y: 0 }, b: { x: 10, y: 10 } },
      { id: "e2", a: { x: 0, y: 10 }, b: { x: 10, y: 0 } },
      { id: "e3", a: { x: 100, y: 0 }, b: { x: 110, y: 10 } },
      { id: "e4", a: { x: 100, y: 10 }, b: { x: 110, y: 0 } },
    ];
    expect(countEdgeCrossings(segments).count).toBe(2);
  });
});
