"use client";

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
import { EdgeRoutingType } from "@/lib/playground/settingsReducer";
import { RoutedPoint } from "@/lib/layout/types";
import { EdgeOperation, OPERATION_STATUS_META, operationStatus } from "@/lib/graph/types";

export interface DiffEdgeData extends Record<string, unknown> {
  routing: EdgeRoutingType;
  label: string;
  operation: EdgeOperation;
  points?: RoutedPoint[];
  dimmed: boolean;
}

export type DiffEdgeType = Edge<DiffEdgeData, "diff">;

function buildElkPath(points: RoutedPoint[]): [string, number, number] {
  const [first, ...rest] = points;
  const path = [`M ${first.x},${first.y}`, ...rest.map((p) => `L ${p.x},${p.y}`)].join(" ");
  const mid = points[Math.floor(points.length / 2)];
  return [path, mid.x, mid.y];
}

/** Angle (in degrees) of the source->target vector, flipped so label text never renders upside down. */
function labelAngle(sourceX: number, sourceY: number, targetX: number, targetY: number): number {
  let angle = (Math.atan2(targetY - sourceY, targetX - sourceX) * 180) / Math.PI;
  if (angle > 90) angle -= 180;
  if (angle < -90) angle += 180;
  return angle;
}

export function DiffEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<DiffEdgeType>) {
  if (!data) return null;
  const { routing, label, operation, points, dimmed } = data;
  const meta = OPERATION_STATUS_META[operationStatus(operation)];

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

  const angle = labelAngle(sourceX, sourceY, targetX, targetY);

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: meta.color,
          strokeWidth: 1.5,
          strokeDasharray: meta.dashed ? "6 4" : undefined,
          opacity: dimmed ? 0.15 : 1,
        }}
      />
      <circle cx={sourceX} cy={sourceY} r={2.5} fill={meta.color} opacity={dimmed ? 0.15 : 1} />
      <circle cx={targetX} cy={targetY} r={2.5} fill={meta.color} opacity={dimmed ? 0.15 : 1} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px) rotate(${angle}deg)`,
            opacity: dimmed ? 0.15 : 1,
            textShadow: "0 0 3px white, 0 0 3px white, 0 0 3px white",
          }}
          className="text-[11px] italic text-zinc-600"
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
