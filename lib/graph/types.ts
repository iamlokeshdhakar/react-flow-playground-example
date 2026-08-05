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

export interface KnowledgeNode {
  id: string;
  type: NodeType;
  label: string;
  description: string;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label?: string;
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
