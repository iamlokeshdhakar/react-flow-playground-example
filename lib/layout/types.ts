import { KnowledgeNode, KnowledgeEdge } from "@/lib/graph/types";

export interface Size {
  width: number;
  height: number;
}

export interface LayoutOptions {
  direction: "DOWN" | "UP" | "RIGHT" | "LEFT";
  spacing: { node: number; layer: number; edge: number; component: number };
}

export interface PositionedNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoutedPoint {
  x: number;
  y: number;
}

export interface PositionedEdge {
  id: string;
  points?: RoutedPoint[];
}

export interface LayoutResult {
  nodes: PositionedNode[];
  edges: PositionedEdge[];
}

export interface LayoutEngine {
  id: string;
  label: string;
  computeLayout(
    nodes: KnowledgeNode[],
    edges: KnowledgeEdge[],
    measuredSizes: Record<string, Size>,
    options: LayoutOptions
  ): Promise<LayoutResult>;
}

export const DEFAULT_NODE_SIZE: Size = { width: 220, height: 96 };
