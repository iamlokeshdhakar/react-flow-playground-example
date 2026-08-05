import { describe, it, expect } from "vitest";
import { NODE_TYPE_META, EDGE_TYPE_META, NODE_TYPES, getNodeTypeMeta, getEdgeTypeLabel } from "./types";

describe("node/edge type metadata", () => {
  it("has exactly 10 node types, each with a non-empty label, hex color, icon, and category", () => {
    expect(NODE_TYPES).toHaveLength(10);
    for (const type of NODE_TYPES) {
      const meta = NODE_TYPE_META[type];
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(meta.icon.length).toBeGreaterThan(0);
      expect(meta.category.length).toBeGreaterThan(0);
    }
  });

  it("has exactly 8 edge types, each with a non-empty label", () => {
    const edgeTypes = Object.keys(EDGE_TYPE_META);
    expect(edgeTypes).toHaveLength(8);
    for (const type of edgeTypes) {
      expect(EDGE_TYPE_META[type as keyof typeof EDGE_TYPE_META].label.length).toBeGreaterThan(0);
    }
  });

  it("has unique colors across node types", () => {
    const colors = NODE_TYPES.map((t) => NODE_TYPE_META[t].color);
    expect(new Set(colors).size).toBe(colors.length);
  });
});

describe("getNodeTypeMeta", () => {
  it("returns the built-in metadata for a known node type", () => {
    expect(getNodeTypeMeta("Gene")).toEqual(NODE_TYPE_META.Gene);
  });

  it("generates a stable, non-empty fallback for an unrecognized node type", () => {
    const first = getNodeTypeMeta("CustomThing");
    const second = getNodeTypeMeta("CustomThing");
    expect(first).toEqual(second);
    expect(first.label).toBe("CustomThing");
    expect(first.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(first.icon.length).toBeGreaterThan(0);
  });

  it("generates different fallback colors for different unrecognized types (usually)", () => {
    const a = getNodeTypeMeta("AlphaType");
    const b = getNodeTypeMeta("BetaType");
    expect(a.color).not.toBe(b.color);
  });
});

describe("getEdgeTypeLabel", () => {
  it("returns the built-in label for a known edge type", () => {
    expect(getEdgeTypeLabel("cites")).toBe("cites");
  });

  it("falls back to the raw string for an unrecognized edge type", () => {
    expect(getEdgeTypeLabel("relatedTo")).toBe("relatedTo");
  });
});
