export type NodeType =
  | "Taxon"
  | "Gene"
  | "Protein"
  | "Publication"
  | "Dataset"
  | "Experiment"
  | "Method"
  | "Hypothesis"
  | "Finding"
  | "ResearchProject";

export type EdgeType =
  | "cites"
  | "produces"
  | "derivedFrom"
  | "partOf"
  | "usesMethod"
  | "supports"
  | "contradicts"
  | "associatedWith";

export type NodeOperation = "node.create" | "node.update" | "node.fetch" | "node.delete";
export type EdgeOperation = "edge.create" | "edge.update" | "edge.fetch" | "edge.delete";
export type OperationStatus = "new" | "existing" | "modified" | "deleted";

export const NODE_OPERATIONS: NodeOperation[] = ["node.create", "node.update", "node.fetch", "node.delete"];
export const EDGE_OPERATIONS: EdgeOperation[] = ["edge.create", "edge.update", "edge.fetch", "edge.delete"];

export function isNodeOperation(value: string): value is NodeOperation {
  return (NODE_OPERATIONS as string[]).includes(value);
}

export function isEdgeOperation(value: string): value is EdgeOperation {
  return (EDGE_OPERATIONS as string[]).includes(value);
}

/** Maps a node/edge operation to the diff status ("new"/"existing"/"modified"/"deleted") that drives its visual styling. */
export function operationStatus(operation: NodeOperation | EdgeOperation): OperationStatus {
  const action = operation.split(".")[1];
  switch (action) {
    case "create":
      return "new";
    case "update":
      return "modified";
    case "delete":
      return "deleted";
    default:
      return "existing";
  }
}

export interface OperationStatusMeta {
  label: string;
  icon: string;
  /** Accent color for a light background. */
  color: string;
  /** Accent color for a dark background — e.g. "existing" needs a light tone here since its light-mode near-black would be invisible on dark. */
  colorDark: string;
  dashed: boolean;
}

export const OPERATION_STATUS_META: Record<OperationStatus, OperationStatusMeta> = {
  new: { label: "New", icon: "\u{2606}", color: "#4f46e5", colorDark: "#818cf8", dashed: true },
  existing: { label: "Existing", icon: "", color: "#18181b", colorDark: "#e4e4e7", dashed: false },
  modified: { label: "Modified", icon: "\u{270E}", color: "#8b5cf6", colorDark: "#a78bfa", dashed: false },
  deleted: { label: "Deleted", icon: "\u{1F5D1}", color: "#ef4444", colorDark: "#f87171", dashed: true },
};

export interface KnowledgeNode {
  id: string;
  /** One of NodeType for the built-in dataset, but user-supplied custom data may use any string. */
  type: string;
  label: string;
  description: string;
  operation: NodeOperation;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  /** One of EdgeType for the built-in dataset, but user-supplied custom data may use any string. */
  type: string;
  label?: string;
  operation: EdgeOperation;
}

export interface NodeTypeMeta {
  label: string;
  color: string;
  icon: string;
  category: string;
}

export const NODE_TYPE_META: Record<NodeType, NodeTypeMeta> = {
  Taxon: { label: "Taxon", color: "#22c55e", icon: "\u{1F98E}", category: "Taxonomy & Phylogeny" },
  Gene: { label: "Gene", color: "#a855f7", icon: "\u{1F9EC}", category: "Molecular Biology" },
  Protein: { label: "Protein", color: "#f59e0b", icon: "\u{269B}\u{FE0F}", category: "Molecular Biology" },
  Publication: { label: "Publication", color: "#3b82f6", icon: "\u{1F4C4}", category: "Literature" },
  Dataset: { label: "Dataset", color: "#06b6d4", icon: "\u{1F4CA}", category: "Data Infrastructure" },
  Experiment: { label: "Experiment", color: "#ec4899", icon: "\u{1F9EA}", category: "Experiments" },
  Method: { label: "Method", color: "#eab308", icon: "\u{1F6E0}\u{FE0F}", category: "Methods" },
  Hypothesis: { label: "Hypothesis", color: "#6366f1", icon: "\u{1F4A1}", category: "Hypotheses" },
  Finding: { label: "Finding", color: "#14b8a6", icon: "\u{1F50E}", category: "Findings" },
  ResearchProject: { label: "Research Project", color: "#f43f5e", icon: "\u{1F5C2}\u{FE0F}", category: "Program" },
};

export const NODE_TYPES: NodeType[] = Object.keys(NODE_TYPE_META) as NodeType[];

export const EDGE_TYPE_META: Record<EdgeType, { label: string }> = {
  cites: { label: "cites" },
  produces: { label: "produces" },
  derivedFrom: { label: "derived from" },
  partOf: { label: "part of" },
  usesMethod: { label: "uses method" },
  supports: { label: "supports" },
  contradicts: { label: "contradicts" },
  associatedWith: { label: "associated with" },
};

const FALLBACK_NODE_COLORS = ["#64748b", "#84cc16", "#0ea5e9", "#d946ef", "#fb923c", "#4ade80", "#f472b6", "#38bdf8"];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + (value.codePointAt(i) ?? 0)) >>> 0;
  return hash;
}

function isKnownNodeType(type: string): type is NodeType {
  return type in NODE_TYPE_META;
}

function isKnownEdgeType(type: string): type is EdgeType {
  return type in EDGE_TYPE_META;
}

/** Looks up metadata for a node type, generating a stable fallback for types outside the built-in set. */
export function getNodeTypeMeta(type: string): NodeTypeMeta {
  if (isKnownNodeType(type)) return NODE_TYPE_META[type];
  return {
    label: type,
    color: FALLBACK_NODE_COLORS[hashString(type) % FALLBACK_NODE_COLORS.length],
    icon: "\u{25CF}",
    category: type,
  };
}

/** Looks up the display label for an edge type, falling back to the raw type string if unrecognized. */
export function getEdgeTypeLabel(type: string): string {
  if (isKnownEdgeType(type)) return EDGE_TYPE_META[type].label;
  return type;
}
