export type HandleStrategy =
  | "left-right"
  | "top-bottom"
  | "left-only"
  | "right-only"
  | "top-only"
  | "bottom-only"
  | "left+right"
  | "top+bottom"
  | "four-way"
  | "dynamic"
  | "auto-after-layout";

export type EdgeRoutingType = "straight" | "step" | "smoothstep" | "bezier" | "simplebezier" | "elk-routed";
export type EdgeLabelMode = "off" | "always" | "hover";
export type NodeDensity = "compact" | "expanded";

export interface PlaygroundSettings {
  layoutEngineId: string;
  nodeLimit: number;
  direction: "DOWN" | "UP" | "RIGHT" | "LEFT";
  spacing: { node: number; layer: number; edge: number; component: number };
  handleStrategy: HandleStrategy;
  edgeRouting: EdgeRoutingType;
  edgeLabelMode: EdgeLabelMode;
  nodeDensity: NodeDensity;
  nodePadding: number;
  fontSize: number;
  view: {
    fitView: boolean;
    animateLayout: boolean;
    showMiniMap: boolean;
    showControls: boolean;
    showBackground: boolean;
    snapToGrid: boolean;
    panOnScroll: boolean;
    minZoom: number;
    maxZoom: number;
  };
  debug: {
    showNodeIds: boolean;
    showEdgeIds: boolean;
    highlightConnected: boolean;
    highlightCrossings: boolean;
    showDimensions: boolean;
    showLayoutTime: boolean;
    showCrossingCount: boolean;
  };
}

export const INITIAL_SETTINGS: PlaygroundSettings = {
  layoutEngineId: "elk-layered",
  nodeLimit: 10,
  direction: "DOWN",
  spacing: { node: 50, layer: 80, edge: 20, component: 80 },
  handleStrategy: "auto-after-layout",
  edgeRouting: "bezier",
  edgeLabelMode: "always",
  nodeDensity: "expanded",
  nodePadding: 12,
  fontSize: 13,
  view: {
    fitView: true,
    animateLayout: true,
    showMiniMap: true,
    showControls: true,
    showBackground: true,
    snapToGrid: false,
    panOnScroll: false,
    minZoom: 0.1,
    maxZoom: 2,
  },
  debug: {
    showNodeIds: false,
    showEdgeIds: false,
    highlightConnected: true,
    highlightCrossings: false,
    showDimensions: false,
    showLayoutTime: false,
    showCrossingCount: false,
  },
};

export type SettingsAction =
  | { type: "SET_LAYOUT_ENGINE"; id: string }
  | { type: "SET_NODE_LIMIT"; limit: number }
  | { type: "SET_DIRECTION"; direction: PlaygroundSettings["direction"] }
  | { type: "SET_SPACING"; key: keyof PlaygroundSettings["spacing"]; value: number }
  | { type: "SET_HANDLE_STRATEGY"; strategy: HandleStrategy }
  | { type: "SET_EDGE_ROUTING"; routing: EdgeRoutingType }
  | { type: "SET_EDGE_LABEL_MODE"; mode: EdgeLabelMode }
  | { type: "SET_NODE_DENSITY"; density: NodeDensity }
  | { type: "SET_NODE_PADDING"; value: number }
  | { type: "SET_FONT_SIZE"; value: number }
  | { type: "SET_VIEW_OPTION"; key: keyof PlaygroundSettings["view"]; value: boolean | number }
  | { type: "SET_DEBUG_OPTION"; key: keyof PlaygroundSettings["debug"]; value: boolean }
  | { type: "RESET" };

export function settingsReducer(state: PlaygroundSettings, action: SettingsAction): PlaygroundSettings {
  switch (action.type) {
    case "SET_LAYOUT_ENGINE":
      return { ...state, layoutEngineId: action.id };
    case "SET_NODE_LIMIT":
      return { ...state, nodeLimit: action.limit };
    case "SET_DIRECTION":
      return { ...state, direction: action.direction };
    case "SET_SPACING":
      return { ...state, spacing: { ...state.spacing, [action.key]: action.value } };
    case "SET_HANDLE_STRATEGY":
      return { ...state, handleStrategy: action.strategy };
    case "SET_EDGE_ROUTING":
      return { ...state, edgeRouting: action.routing };
    case "SET_EDGE_LABEL_MODE":
      return { ...state, edgeLabelMode: action.mode };
    case "SET_NODE_DENSITY":
      return { ...state, nodeDensity: action.density };
    case "SET_NODE_PADDING":
      return { ...state, nodePadding: action.value };
    case "SET_FONT_SIZE":
      return { ...state, fontSize: action.value };
    case "SET_VIEW_OPTION":
      return { ...state, view: { ...state.view, [action.key]: action.value } };
    case "SET_DEBUG_OPTION":
      return { ...state, debug: { ...state.debug, [action.key]: action.value } };
    case "RESET":
      return INITIAL_SETTINGS;
    default:
      return state;
  }
}
