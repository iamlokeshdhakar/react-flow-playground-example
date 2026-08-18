"use client";

import { Fragment, memo } from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { KnowledgeNode, getNodeTypeMeta, OPERATION_STATUS_META, operationStatus } from "@/lib/graph/types";
import { Side } from "@/lib/graph/handles";

export interface DiffNodeData extends Record<string, unknown> {
  knowledgeNode: KnowledgeNode;
  activeSides: Side[];
  role: "directional" | "both";
  dimmed: boolean;
  highlighted: boolean;
}

export type DiffNodeType = Node<DiffNodeData, "diff">;

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

function DiffNodeImpl({ data }: NodeProps<DiffNodeType>) {
  const { knowledgeNode, activeSides, role, dimmed, highlighted } = data;
  const typeMeta = getNodeTypeMeta(knowledgeNode.type);
  const statusMeta = OPERATION_STATUS_META[operationStatus(knowledgeNode.operation)];

  return (
    <div style={{ opacity: dimmed ? 0.3 : 1 }} className="flex flex-col gap-1 transition-opacity">
      <div
        className="inline-flex w-fit items-center gap-1 self-start rounded-md border px-2 py-0.5 text-[10px] font-semibold"
        style={{
          backgroundColor: `${statusMeta.color}14`,
          borderColor: `${statusMeta.color}40`,
          color: statusMeta.color,
        }}
      >
        {statusMeta.icon && <span>{statusMeta.icon}</span>}
        <span>{statusMeta.label}</span>
      </div>
      <div
        style={{
          borderColor: statusMeta.color,
          borderStyle: statusMeta.dashed ? "dashed" : "solid",
          boxShadow: highlighted ? `0 0 0 2px ${statusMeta.color}` : undefined,
        }}
        className="min-w-[220px] max-w-[280px] rounded-lg border-2 bg-white p-3 text-sm text-zinc-900 shadow-sm"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold leading-tight">{knowledgeNode.label}</span>
          <span
            style={{ backgroundColor: `${typeMeta.color}1a`, color: typeMeta.color, borderColor: typeMeta.color }}
            className="flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium"
          >
            <span>{typeMeta.icon}</span>
            <span>{typeMeta.label}</span>
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-zinc-500">{knowledgeNode.description}</p>
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

export const DiffNode = memo(DiffNodeImpl);
