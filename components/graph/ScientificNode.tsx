"use client";

import { Fragment, memo, useEffect, useRef, useState } from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { KnowledgeNode, getNodeTypeMeta, OPERATION_STATUS_META, operationStatus } from "@/lib/graph/types";
import { Side } from "@/lib/graph/handles";

export interface ScientificNodeData extends Record<string, unknown> {
  knowledgeNode: KnowledgeNode;
  activeSides: Side[];
  role: "directional" | "both";
  density: "compact" | "expanded";
  padding: number;
  fontSize: number;
  showNodeId: boolean;
  showDimensions: boolean;
  dimmed: boolean;
  highlighted: boolean;
}

export type ScientificNodeType = Node<ScientificNodeData, "scientific">;

const SIDE_TO_POSITION: Record<Side, Position> = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
};

const DIRECTIONAL_ROLE: Record<Side, "source" | "target"> = {
  left: "target",
  top: "target",
  right: "source",
  bottom: "source",
};

function centeringStyle(side: Side) {
  return side === "top" || side === "bottom" ? { left: "50%" } : { top: "50%" };
}

function ScientificNodeImpl({ data }: NodeProps<ScientificNodeType>) {
  const {
    knowledgeNode,
    activeSides,
    role,
    density,
    padding,
    fontSize,
    showNodeId,
    showDimensions,
    dimmed,
    highlighted,
  } = data;
  const meta = getNodeTypeMeta(knowledgeNode.type);
  const statusMeta = OPERATION_STATUS_META[operationStatus(knowledgeNode.operation)];
  const cardRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!showDimensions || !cardRef.current) return;
    const el = cardRef.current;
    const observer = new ResizeObserver(([entry]) => {
      setMeasured({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [showDimensions]);

  return (
    <div style={{ opacity: dimmed ? 0.3 : 1 }} className="flex flex-col gap-1 transition-opacity">
      <div className="flex items-center gap-2 px-1">
        <div
          className="inline-flex w-fit items-center gap-1 self-start rounded-md border px-2 py-0.5 text-[10px] font-semibold"
          style={{
            backgroundColor: `${statusMeta.colorDark}26`,
            borderColor: `${statusMeta.colorDark}66`,
            color: statusMeta.colorDark,
          }}
        >
          {statusMeta.icon && <span>{statusMeta.icon}</span>}
          <span>{statusMeta.label}</span>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-400">
          <span>{meta.icon}</span>
          <span>{meta.category}</span>
        </span>
      </div>
      <div
        ref={cardRef}
        style={{
          borderColor: statusMeta.colorDark,
          borderStyle: statusMeta.dashed ? "dashed" : "solid",
          padding,
          fontSize,
          boxShadow: highlighted ? `0 0 0 2px ${statusMeta.colorDark}` : undefined,
        }}
        className="min-w-[200px] max-w-[260px] rounded-lg border-2 bg-zinc-900 text-zinc-100 shadow-md"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold leading-tight">{knowledgeNode.label}</span>
          <span
            style={{ backgroundColor: `${meta.color}33`, color: meta.color, borderColor: meta.color }}
            className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium"
          >
            {meta.label}
          </span>
        </div>
        {density === "expanded" && (
          <p className="mt-1 line-clamp-2 text-zinc-400" style={{ fontSize: fontSize - 1 }}>
            {knowledgeNode.description}
          </p>
        )}
        {showNodeId && <p className="mt-1 font-mono text-[10px] text-zinc-600">{knowledgeNode.id}</p>}
        {showDimensions && (
          <p className="mt-1 font-mono text-[10px] text-zinc-600">
            {Math.round(measured.width)}×{Math.round(measured.height)}
          </p>
        )}
      </div>

      {activeSides.map((side) => {
        const style = centeringStyle(side);
        if (role === "directional") {
          const handleRole = DIRECTIONAL_ROLE[side];
          return (
            <Handle
              key={side}
              id={`${side}-${handleRole}`}
              type={handleRole}
              position={SIDE_TO_POSITION[side]}
              style={style}
            />
          );
        }
        return (
          <Fragment key={side}>
            <Handle id={`${side}-source`} type="source" position={SIDE_TO_POSITION[side]} style={style} />
            <Handle id={`${side}-target`} type="target" position={SIDE_TO_POSITION[side]} style={style} />
          </Fragment>
        );
      })}
    </div>
  );
}

export const ScientificNode = memo(ScientificNodeImpl);
