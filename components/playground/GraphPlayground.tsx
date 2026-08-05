"use client";

import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  MiniMap,
  Controls,
  useNodesState,
  useEdgesState,
  useNodesInitialized,
  useReactFlow,
  NodeMouseHandler,
} from "@xyflow/react";
import { KNOWLEDGE_NODES, KNOWLEDGE_EDGES } from "@/lib/graph/data";
import { getEdgeTypeLabel, KnowledgeEdge, KnowledgeNode } from "@/lib/graph/types";
import { selectTopNodesByDegree } from "@/lib/graph/subset";
import { CustomGraphData, parseCustomGraphJson } from "@/lib/graph/customData";
import { LAYOUT_ENGINES, DEFAULT_LAYOUT_ENGINE_ID } from "@/lib/layout/registry";
import { DEFAULT_NODE_SIZE, PositionedNode, RoutedPoint, Size } from "@/lib/layout/types";
import {
  settingsReducer,
  INITIAL_SETTINGS,
  PlaygroundSettings,
  SettingsAction,
} from "@/lib/playground/settingsReducer";
import {
  HandleAssignment,
  Side,
  clampSideToAllowed,
  directionalSides,
  handleId,
  pickHandleSides,
  rolesForStrategy,
  sidesForStrategy,
} from "@/lib/graph/handles";
import { Segment, countEdgeCrossings } from "@/lib/metrics/edgeCrossings";
import { ScientificNode, ScientificNodeType } from "@/components/graph/ScientificNode";
import { LabeledEdge, LabeledEdgeType } from "@/components/graph/edges/LabeledEdge";
import { ControlPanel } from "./ControlPanel";

const NODE_TYPES = { scientific: ScientificNode };
const EDGE_TYPES = { labeled: LabeledEdge };

function buildNodesFor(activeNodes: KnowledgeNode[], settings: PlaygroundSettings): ScientificNodeType[] {
  const activeSides = sidesForStrategy(settings.handleStrategy);
  const role = rolesForStrategy(settings.handleStrategy);
  return activeNodes.map((kn) => ({
    id: kn.id,
    type: "scientific",
    position: { x: 0, y: 0 },
    data: {
      knowledgeNode: kn,
      activeSides,
      role,
      density: settings.nodeDensity,
      padding: settings.nodePadding,
      fontSize: settings.fontSize,
      showNodeId: settings.debug.showNodeIds,
      showDimensions: settings.debug.showDimensions,
      dimmed: false,
      highlighted: false,
    },
  }));
}

function buildEdgesFor(activeEdges: KnowledgeEdge[], settings: PlaygroundSettings): LabeledEdgeType[] {
  return activeEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "labeled",
    data: {
      routing: settings.edgeRouting,
      labelMode: settings.edgeLabelMode,
      label: getEdgeTypeLabel(e.type),
      points: undefined,
      dimmed: false,
      crossing: false,
      showEdgeId: settings.debug.showEdgeIds,
    },
  }));
}

function centerOf(pos: { x: number; y: number; width: number; height: number }) {
  return { x: pos.x + pos.width / 2, y: pos.y + pos.height / 2 };
}

function GraphPlaygroundInner() {
  const [settings, dispatch] = useReducer(settingsReducer, INITIAL_SETTINGS);
  const [customGraph, setCustomGraph] = useState<CustomGraphData | null>(null);

  const baseNodes = customGraph?.nodes ?? KNOWLEDGE_NODES;
  const baseEdges = customGraph?.edges ?? KNOWLEDGE_EDGES;

  const activeGraph = useMemo(
    () => selectTopNodesByDegree(baseNodes, baseEdges, settings.nodeLimit),
    [baseNodes, baseEdges, settings.nodeLimit]
  );

  const loadCustomData = useCallback((raw: string): string | null => {
    const result = parseCustomGraphJson(raw);
    if (result.error) return result.error;
    setCustomGraph(result.data);
    return null;
  }, []);

  const resetToSampleData = useCallback(() => setCustomGraph(null), []);

  const sampleDataText = useMemo(
    () => JSON.stringify({ nodes: KNOWLEDGE_NODES, edges: KNOWLEDGE_EDGES }, null, 2),
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<ScientificNodeType>(
    buildNodesFor(activeGraph.nodes, settings)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<LabeledEdgeType>(
    buildEdgesFor(activeGraph.edges, settings)
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [layoutMs, setLayoutMs] = useState<number | null>(null);
  const [crossingCount, setCrossingCount] = useState(0);

  const { getNodes, fitView } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const frozenHandlesRef = useRef<Record<string, HandleAssignment>>({});
  const elkPointsRef = useRef<Map<string, RoutedPoint[] | undefined>>(new Map());

  const dispatchTyped = useCallback((action: SettingsAction) => dispatch(action), []);

  /** Rebuilds node.data (appearance) and every edge from current positions; does not move nodes. */
  const recompute = useCallback(
    (overridePositions?: Map<string, PositionedNode>) => {
      const currentNodes = getNodes();
      const nodeById = new Map(currentNodes.map((n) => [n.id, n]));
      const activeSides = sidesForStrategy(settings.handleStrategy);
      const role = rolesForStrategy(settings.handleStrategy);

      const connectedIds = new Set<string>();
      if (selectedNodeId) {
        connectedIds.add(selectedNodeId);
        for (const e of activeGraph.edges) {
          if (e.source === selectedNodeId) connectedIds.add(e.target);
          if (e.target === selectedNodeId) connectedIds.add(e.source);
        }
      }

      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: {
            ...n.data,
            activeSides,
            role,
            density: settings.nodeDensity,
            padding: settings.nodePadding,
            fontSize: settings.fontSize,
            showNodeId: settings.debug.showNodeIds,
            showDimensions: settings.debug.showDimensions,
            dimmed: Boolean(selectedNodeId) && settings.debug.highlightConnected && !connectedIds.has(n.id),
            highlighted: n.id === selectedNodeId,
          },
        }))
      );

      function getPos(id: string): { x: number; y: number; width: number; height: number } | undefined {
        const override = overridePositions?.get(id);
        if (override) return override;
        const n = nodeById.get(id);
        if (!n) return undefined;
        const size: Size = {
          width: n.measured?.width ?? DEFAULT_NODE_SIZE.width,
          height: n.measured?.height ?? DEFAULT_NODE_SIZE.height,
        };
        return { x: n.position.x, y: n.position.y, width: size.width, height: size.height };
      }

      const segments: Segment[] = [];
      const handleAssignments = new Map<string, HandleAssignment>();

      for (const e of activeGraph.edges) {
        const s = getPos(e.source);
        const t = getPos(e.target);
        if (!s || !t) continue;
        const sCenter = centerOf(s);
        const tCenter = centerOf(t);

        let assignment: HandleAssignment;
        if (settings.handleStrategy === "auto-after-layout" && frozenHandlesRef.current[e.id]) {
          assignment = frozenHandlesRef.current[e.id];
        } else if (settings.handleStrategy === "dynamic" || settings.handleStrategy === "auto-after-layout") {
          assignment = pickHandleSides(sCenter, tCenter);
        } else if (role === "directional") {
          assignment = directionalSides(settings.handleStrategy);
        } else {
          const raw = pickHandleSides(sCenter, tCenter);
          assignment = {
            sourceSide: clampSideToAllowed(raw.sourceSide, activeSides),
            targetSide: clampSideToAllowed(raw.targetSide, activeSides),
          };
        }
        handleAssignments.set(e.id, assignment);
        segments.push({ id: e.id, a: sCenter, b: tCenter });
      }

      const { count, crossingEdgeIds } = countEdgeCrossings(segments);
      setCrossingCount(count);

      setEdges(
        activeGraph.edges.map((e) => {
          const assignment = handleAssignments.get(e.id);
          const points = settings.edgeRouting === "elk-routed" ? elkPointsRef.current.get(e.id) : undefined;
          const bothConnected = connectedIds.has(e.source) && connectedIds.has(e.target);
          const dimmed = Boolean(selectedNodeId) && settings.debug.highlightConnected && !bothConnected;
          return {
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: assignment ? handleId(assignment.sourceSide, "source") : undefined,
            targetHandle: assignment ? handleId(assignment.targetSide, "target") : undefined,
            type: "labeled",
            data: {
              routing: settings.edgeRouting,
              labelMode: settings.edgeLabelMode,
              label: getEdgeTypeLabel(e.type),
              points,
              dimmed,
              crossing: settings.debug.highlightCrossings && crossingEdgeIds.has(e.id),
              showEdgeId: settings.debug.showEdgeIds,
            },
          };
        })
      );
    },
    [settings, selectedNodeId, activeGraph, getNodes, setNodes, setEdges]
  );

  const runLayout = useCallback(async () => {
    const currentNodes = getNodes();
    // The active node set may have just changed (nodeLimit); wait for the reset effect's fresh
    // nodes to mount and get re-measured before laying out, instead of laying out a stale set.
    if (currentNodes.length !== activeGraph.nodes.length) return;
    const sizes: Record<string, Size> = {};
    for (const n of currentNodes) {
      sizes[n.id] = {
        width: n.measured?.width ?? DEFAULT_NODE_SIZE.width,
        height: n.measured?.height ?? DEFAULT_NODE_SIZE.height,
      };
    }

    const engine = LAYOUT_ENGINES[settings.layoutEngineId] ?? LAYOUT_ENGINES[DEFAULT_LAYOUT_ENGINE_ID];
    const start = performance.now();
    const result = await engine.computeLayout(activeGraph.nodes, activeGraph.edges, sizes, {
      direction: settings.direction,
      spacing: settings.spacing,
    });
    setLayoutMs(performance.now() - start);

    const positionById = new Map(result.nodes.map((n) => [n.id, n] as const));
    elkPointsRef.current = new Map(result.edges.map((e) => [e.id, e.points] as const));

    setNodes((nds) =>
      nds.map((n) => {
        const pos = positionById.get(n.id);
        return pos ? { ...n, position: { x: pos.x, y: pos.y } } : n;
      })
    );

    if (settings.handleStrategy === "auto-after-layout") {
      const frozen: Record<string, HandleAssignment> = {};
      for (const e of activeGraph.edges) {
        const s = positionById.get(e.source);
        const t = positionById.get(e.target);
        if (s && t) frozen[e.id] = pickHandleSides(centerOf(s), centerOf(t));
      }
      frozenHandlesRef.current = frozen;
    }

    recompute(positionById);

    if (settings.view.fitView) {
      requestAnimationFrame(() => fitView({ duration: settings.view.animateLayout ? 400 : 0 }));
    }
  }, [settings, activeGraph, getNodes, setNodes, fitView, recompute]);

  const layoutKey = useMemo(
    () =>
      JSON.stringify({
        engine: settings.layoutEngineId,
        nodeLimit: settings.nodeLimit,
        direction: settings.direction,
        spacing: settings.spacing,
        density: settings.nodeDensity,
        padding: settings.nodePadding,
        fontSize: settings.fontSize,
        handles: settings.handleStrategy,
      }),
    [settings]
  );

  // The active node/edge subset changed (nodeLimit): fully replace the graph rather than patching
  // it in place, since the *set* of node ids is different, not just their appearance/position.
  useEffect(() => {
    setSelectedNodeId(null);
    frozenHandlesRef.current = {};
    elkPointsRef.current = new Map();
    setNodes(buildNodesFor(activeGraph.nodes, settings));
    setEdges(buildEdgesFor(activeGraph.edges, settings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGraph]);

  // Layout-affecting settings changed: update node data (may change measured size), then re-layout.
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          density: settings.nodeDensity,
          padding: settings.nodePadding,
          fontSize: settings.fontSize,
          activeSides: sidesForStrategy(settings.handleStrategy),
          role: rolesForStrategy(settings.handleStrategy),
        },
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.nodeDensity, settings.nodePadding, settings.fontSize, settings.handleStrategy]);

  useEffect(() => {
    if (!nodesInitialized) return;
    runLayout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesInitialized, layoutKey]);

  // Appearance-only settings (routing/labels/debug/selection): recompute edges/highlight without re-layout.
  useEffect(() => {
    if (!nodesInitialized) return;
    recompute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    settings.edgeRouting,
    settings.edgeLabelMode,
    settings.debug.showNodeIds,
    settings.debug.showEdgeIds,
    settings.debug.highlightConnected,
    settings.debug.highlightCrossings,
    settings.debug.showDimensions,
    selectedNodeId,
  ]);

  const onNodeClick: NodeMouseHandler<ScientificNodeType> = useCallback((_event, node) => {
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
  }, []);

  const onPaneClick = useCallback(() => setSelectedNodeId(null), []);

  return (
    <div className="flex h-screen w-screen bg-zinc-950">
      <div className="relative flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          minZoom={settings.view.minZoom}
          maxZoom={settings.view.maxZoom}
          snapToGrid={settings.view.snapToGrid}
          snapGrid={[16, 16]}
          panOnScroll={settings.view.panOnScroll}
          proOptions={{ hideAttribution: true }}
        >
          {settings.view.showBackground && <Background />}
          {settings.view.showMiniMap && <MiniMap pannable zoomable className="!bg-zinc-900" />}
          {settings.view.showControls && <Controls />}
        </ReactFlow>
        {(settings.debug.showLayoutTime || settings.debug.showCrossingCount) && (
          <div className="absolute left-3 top-3 flex flex-col gap-1 rounded-lg border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-xs text-zinc-300">
            {settings.debug.showLayoutTime && layoutMs != null && <span>Layout time: {layoutMs.toFixed(1)}ms</span>}
            {settings.debug.showCrossingCount && <span>Edge crossings: {crossingCount}</span>}
          </div>
        )}
      </div>
      <ControlPanel
        settings={settings}
        dispatch={dispatchTyped}
        totalNodeCount={baseNodes.length}
        onLoadCustomData={loadCustomData}
        onResetToSampleData={resetToSampleData}
        isCustomData={customGraph !== null}
        customNodeCount={baseNodes.length}
        customEdgeCount={baseEdges.length}
        defaultDataText={sampleDataText}
      />
    </div>
  );
}

export function GraphPlayground() {
  return (
    <ReactFlowProvider>
      <GraphPlaygroundInner />
    </ReactFlowProvider>
  );
}
