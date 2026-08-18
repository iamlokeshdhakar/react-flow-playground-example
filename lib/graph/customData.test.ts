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
      nodes: [{ id: "n1", type: "Custom", label: "Node One", operation: "node.fetch" }],
      edges: [],
    });
    const result = parseCustomGraphJson(raw);
    expect(result.error).toBeNull();
    expect(result.data).toEqual({
      nodes: [{ id: "n1", type: "Custom", label: "Node One", description: "", operation: "node.fetch" }],
      edges: [],
    });
  });

  it("parses a graph with edges connecting known nodes", () => {
    const raw = JSON.stringify({
      nodes: [
        { id: "a", type: "Foo", label: "A", description: "desc a", operation: "node.create" },
        { id: "b", type: "Bar", label: "B", operation: "node.fetch" },
      ],
      edges: [{ id: "e1", source: "a", target: "b", type: "relatedTo", operation: "edge.create" }],
    });
    const result = parseCustomGraphJson(raw);
    expect(result.error).toBeNull();
    expect(result.data?.nodes).toHaveLength(2);
    expect(result.data?.edges).toEqual([
      { id: "e1", source: "a", target: "b", type: "relatedTo", label: undefined, operation: "edge.create" },
    ]);
  });

  it("rejects nodes missing required string fields", () => {
    const raw = JSON.stringify({ nodes: [{ id: "a" }], edges: [] });
    expect(parseCustomGraphJson(raw).error).toMatch(/Node at index 0/);
  });

  it("rejects duplicate node ids", () => {
    const raw = JSON.stringify({
      nodes: [
        { id: "a", type: "Foo", label: "A", operation: "node.fetch" },
        { id: "a", type: "Foo", label: "A again", operation: "node.fetch" },
      ],
      edges: [],
    });
    expect(parseCustomGraphJson(raw).error).toMatch(/Duplicate node id "a"/);
  });

  it("rejects an edge referencing a node id that doesn't exist", () => {
    const raw = JSON.stringify({
      nodes: [{ id: "a", type: "Foo", label: "A", operation: "node.fetch" }],
      edges: [{ id: "e1", source: "a", target: "missing", type: "relatedTo", operation: "edge.fetch" }],
    });
    expect(parseCustomGraphJson(raw).error).toMatch(/isn't in "nodes"/);
  });

  it("rejects an empty nodes array", () => {
    const raw = JSON.stringify({ nodes: [], edges: [] });
    expect(parseCustomGraphJson(raw).error).toMatch(/at least one node/);
  });

  it("rejects a node missing the operation field", () => {
    const raw = JSON.stringify({ nodes: [{ id: "a", type: "Foo", label: "A" }], edges: [] });
    expect(parseCustomGraphJson(raw).error).toMatch(/Node at index 0.*operation/);
  });

  it("rejects a node with an operation value that isn't a valid node.* operation", () => {
    const raw = JSON.stringify({
      nodes: [{ id: "a", type: "Foo", label: "A", operation: "edge.create" }],
      edges: [],
    });
    expect(parseCustomGraphJson(raw).error).toMatch(/Node at index 0.*operation/);
  });

  it("rejects an edge missing the operation field", () => {
    const raw = JSON.stringify({
      nodes: [
        { id: "a", type: "Foo", label: "A", operation: "node.fetch" },
        { id: "b", type: "Foo", label: "B", operation: "node.fetch" },
      ],
      edges: [{ id: "e1", source: "a", target: "b", type: "relatedTo" }],
    });
    expect(parseCustomGraphJson(raw).error).toMatch(/Edge at index 0.*operation/);
  });

  it("rejects an edge with an operation value that isn't a valid edge.* operation", () => {
    const raw = JSON.stringify({
      nodes: [
        { id: "a", type: "Foo", label: "A", operation: "node.fetch" },
        { id: "b", type: "Foo", label: "B", operation: "node.fetch" },
      ],
      edges: [{ id: "e1", source: "a", target: "b", type: "relatedTo", operation: "node.create" }],
    });
    expect(parseCustomGraphJson(raw).error).toMatch(/Edge at index 0.*operation/);
  });

  it("accepts every node.* and edge.* operation value", () => {
    const raw = JSON.stringify({
      nodes: [
        { id: "a", type: "Foo", label: "A", operation: "node.create" },
        { id: "b", type: "Foo", label: "B", operation: "node.update" },
        { id: "c", type: "Foo", label: "C", operation: "node.fetch" },
        { id: "d", type: "Foo", label: "D", operation: "node.delete" },
      ],
      edges: [
        { id: "e1", source: "a", target: "b", type: "relatedTo", operation: "edge.create" },
        { id: "e2", source: "b", target: "c", type: "relatedTo", operation: "edge.update" },
        { id: "e3", source: "c", target: "d", type: "relatedTo", operation: "edge.fetch" },
        { id: "e4", source: "d", target: "a", type: "relatedTo", operation: "edge.delete" },
      ],
    });
    const result = parseCustomGraphJson(raw);
    expect(result.error).toBeNull();
    expect(result.data?.nodes.map((n) => n.operation)).toEqual(["node.create", "node.update", "node.fetch", "node.delete"]);
    expect(result.data?.edges.map((e) => e.operation)).toEqual(["edge.create", "edge.update", "edge.fetch", "edge.delete"]);
  });
});
