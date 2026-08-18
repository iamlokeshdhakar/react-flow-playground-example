"use client";

import { useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  Edge,
  getStraightPath,
  getSmoothStepPath,
  getBezierPath,
  getSimpleBezierPath,
} from "@xyflow/react";
import { EdgeRoutingType, EdgeLabelMode } from "@/lib/playground/settingsReducer";
import { RoutedPoint } from "@/lib/layout/types";
import { EdgeOperation, OPERATION_STATUS_META, operationStatus } from "@/lib/graph/types";

export interface LabeledEdgeData extends Record<string, unknown> {
  routing: EdgeRoutingType;
  labelMode: EdgeLabelMode;
  label: string;
  operation: EdgeOperation;
  points?: RoutedPoint[];
  dimmed: boolean;
  crossing: boolean;
  showEdgeId: boolean;
}

export type LabeledEdgeType = Edge<LabeledEdgeData, "labeled">;

function buildElkPath(points: RoutedPoint[]): [string, number, number] {
  const [first, ...rest] = points;
  const path = [`M ${first.x},${first.y}`, ...rest.map((p) => `L ${p.x},${p.y}`)].join(" ");
  const mid = points[Math.floor(points.length / 2)];
  return [path, mid.x, mid.y];
}

export function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style,
}: EdgeProps<LabeledEdgeType>) {
  const [hovered, setHovered] = useState(false);
  if (!data) return null;
  const { routing, labelMode, label, operation, points, dimmed, crossing, showEdgeId } = data;
  const statusMeta = OPERATION_STATUS_META[operationStatus(operation)];

  let path: string;
  let labelX: number;
  let labelY: number;

  if (routing === "elk-routed" && points && points.length >= 2) {
    [path, labelX, labelY] = buildElkPath(points);
  } else if (routing === "straight") {
    [path, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  } else if (routing === "step") {
    [path, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 0,
    });
  } else if (routing === "bezier") {
    [path, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  } else if (routing === "simplebezier") {
    [path, labelX, labelY] = getSimpleBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  } else {
    [path, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  }

  const showLabel = labelMode === "always" || (labelMode === "hover" && hovered);

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: crossing ? "#ef4444" : statusMeta.colorDark,
          strokeWidth: crossing ? 2.5 : 1.5,
          strokeDasharray: crossing ? undefined : statusMeta.dashed ? "6 4" : undefined,
          opacity: dimmed ? 0.15 : 1,
        }}
      />
      <circle cx={sourceX} cy={sourceY} r={2.5} fill={statusMeta.colorDark} opacity={dimmed ? 0.15 : 1} />
      <circle cx={targetX} cy={targetY} r={2.5} fill={statusMeta.colorDark} opacity={dimmed ? 0.15 : 1} />
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ pointerEvents: dimmed ? "none" : "stroke" }}
      />
      {(showLabel || showEdgeId) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              opacity: dimmed ? 0.15 : 1,
            }}
            className="rounded border border-zinc-700 bg-zinc-900/90 px-1.5 py-0.5 text-[10px] text-zinc-300"
          >
            {showLabel && <span>{label}</span>}
            {showLabel && showEdgeId && <span className="text-zinc-600"> · </span>}
            {showEdgeId && <span className="font-mono text-zinc-600">{id}</span>}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
