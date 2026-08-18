import { describe, it, expect } from "vitest";
import {
  NODE_TYPE_META,
  EDGE_TYPE_META,
  NODE_TYPES,
  getNodeTypeMeta,
  getEdgeTypeLabel,
  NODE_OPERATIONS,
  EDGE_OPERATIONS,
  OPERATION_STATUS_META,
  operationStatus,
  isNodeOperation,
  isEdgeOperation,
} from "./types";

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

describe("operationStatus", () => {
  it("maps create operations to 'new'", () => {
    expect(operationStatus("node.create")).toBe("new");
    expect(operationStatus("edge.create")).toBe("new");
  });

  it("maps fetch operations to 'existing'", () => {
    expect(operationStatus("node.fetch")).toBe("existing");
    expect(operationStatus("edge.fetch")).toBe("existing");
  });

  it("maps update operations to 'modified'", () => {
    expect(operationStatus("node.update")).toBe("modified");
    expect(operationStatus("edge.update")).toBe("modified");
  });

  it("maps delete operations to 'deleted'", () => {
    expect(operationStatus("node.delete")).toBe("deleted");
    expect(operationStatus("edge.delete")).toBe("deleted");
  });
});

describe("OPERATION_STATUS_META", () => {
  it("has an entry for each of the 4 statuses, with a non-empty label/icon, hex color/colorDark, and dashed flag", () => {
    expect(Object.keys(OPERATION_STATUS_META).sort()).toEqual(["deleted", "existing", "modified", "new"]);
    for (const status of Object.keys(OPERATION_STATUS_META) as (keyof typeof OPERATION_STATUS_META)[]) {
      const meta = OPERATION_STATUS_META[status];
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.icon.length).toBeGreaterThanOrEqual(0);
      expect(meta.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(meta.colorDark).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(typeof meta.dashed).toBe("boolean");
    }
  });

  it("gives 'existing' a light colorDark so it stays visible against a dark background, unlike its near-black light color", () => {
    expect(OPERATION_STATUS_META.existing.color).toMatch(/^#[01][0-9a-fA-F]{5}$/);
    expect(OPERATION_STATUS_META.existing.colorDark).not.toBe(OPERATION_STATUS_META.existing.color);
  });

  it("only dashes the 'new' and 'deleted' statuses, leaving 'existing'/'modified' solid", () => {
    expect(OPERATION_STATUS_META.new.dashed).toBe(true);
    expect(OPERATION_STATUS_META.deleted.dashed).toBe(true);
    expect(OPERATION_STATUS_META.existing.dashed).toBe(false);
    expect(OPERATION_STATUS_META.modified.dashed).toBe(false);
  });
});

describe("NODE_OPERATIONS / EDGE_OPERATIONS", () => {
  it("lists exactly the 4 node.* operations and 4 edge.* operations", () => {
    expect([...NODE_OPERATIONS].sort()).toEqual(["node.create", "node.delete", "node.fetch", "node.update"]);
    expect([...EDGE_OPERATIONS].sort()).toEqual(["edge.create", "edge.delete", "edge.fetch", "edge.update"]);
  });
});

describe("isNodeOperation / isEdgeOperation", () => {
  it("accepts only node.* values as node operations", () => {
    expect(isNodeOperation("node.create")).toBe(true);
    expect(isNodeOperation("edge.create")).toBe(false);
    expect(isNodeOperation("node.bogus")).toBe(false);
  });

  it("accepts only edge.* values as edge operations", () => {
    expect(isEdgeOperation("edge.update")).toBe(true);
    expect(isEdgeOperation("node.update")).toBe(false);
    expect(isEdgeOperation("edge.bogus")).toBe(false);
  });
});
