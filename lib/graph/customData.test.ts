import { describe, it, expect } from "vitest";
import { parseCustomGraphJson } from "./customData";

describe("parseCustomGraphJson", () => {
  it("treats empty/whitespace input as 'no custom data', not an error", () => {
    expect(parseCustomGraphJson("")).toEqual({ data: null, error: null });
    expect(parseCustomGraphJson("   \n  ")).toEqual({ data: null, error: null });
  });

  it("reports invalid JSON", () => {
    const result = parseCustomGraphJson("{not valid json");
    expect(result.data).toBeNull();
    expect(result.error).toMatch(/Invalid JSON/);
  });

  it("rejects a JSON value that isn't an object with nodes/edges arrays", () => {
    expect(parseCustomGraphJson("[]").error).toMatch(/nodes.*edges/i);
    expect(parseCustomGraphJson('{"nodes": [], "edges": {}}').error).toMatch(/arrays/i);
  });

  it("parses a minimal valid graph, defaulting a missing description to an empty string", () => {
    const raw = JSON.stringify({
      nodes: [{ id: "n1", type: "Custom", label: "Node One" }],
      edges: [],
    });
    const result = parseCustomGraphJson(raw);
    expect(result.error).toBeNull();
    expect(result.data).toEqual({
      nodes: [{ id: "n1", type: "Custom", label: "Node One", description: "" }],
      edges: [],
    });
  });

  it("parses a graph with edges connecting known nodes", () => {
    const raw = JSON.stringify({
      nodes: [
        { id: "a", type: "Foo", label: "A", description: "desc a" },
        { id: "b", type: "Bar", label: "B" },
      ],
      edges: [{ id: "e1", source: "a", target: "b", type: "relatedTo" }],
    });
    const result = parseCustomGraphJson(raw);
    expect(result.error).toBeNull();
    expect(result.data?.nodes).toHaveLength(2);
    expect(result.data?.edges).toEqual([{ id: "e1", source: "a", target: "b", type: "relatedTo", label: undefined }]);
  });

  it("rejects nodes missing required string fields", () => {
    const raw = JSON.stringify({ nodes: [{ id: "a" }], edges: [] });
    expect(parseCustomGraphJson(raw).error).toMatch(/Node at index 0/);
  });

  it("rejects duplicate node ids", () => {
    const raw = JSON.stringify({
      nodes: [
        { id: "a", type: "Foo", label: "A" },
        { id: "a", type: "Foo", label: "A again" },
      ],
      edges: [],
    });
    expect(parseCustomGraphJson(raw).error).toMatch(/Duplicate node id "a"/);
  });

  it("rejects an edge referencing a node id that doesn't exist", () => {
    const raw = JSON.stringify({
      nodes: [{ id: "a", type: "Foo", label: "A" }],
      edges: [{ id: "e1", source: "a", target: "missing", type: "relatedTo" }],
    });
    expect(parseCustomGraphJson(raw).error).toMatch(/isn't in "nodes"/);
  });

  it("rejects an empty nodes array", () => {
    const raw = JSON.stringify({ nodes: [], edges: [] });
    expect(parseCustomGraphJson(raw).error).toMatch(/at least one node/);
  });
});
