"use client";

import { OPERATION_STATUS_META, OperationStatus } from "@/lib/graph/types";

const LEGEND_ORDER: OperationStatus[] = ["new", "existing", "modified", "deleted"];

export function DiffLegend({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={`absolute bottom-3 right-3 flex flex-col gap-1.5 rounded-lg border px-3 py-2 text-xs shadow-sm ${
        dark ? "border-zinc-700 bg-zinc-900/95 text-zinc-300" : "border-zinc-200 bg-white/95 text-zinc-700"
      }`}
    >
      {LEGEND_ORDER.map((status) => {
        const meta = OPERATION_STATUS_META[status];
        const color = dark ? meta.colorDark : meta.color;
        return (
          <div key={status} className="flex items-center gap-2">
            <svg width="28" height="10" className="shrink-0">
              <line
                x1="1"
                y1="5"
                x2="27"
                y2="5"
                stroke={color}
                strokeWidth="2"
                strokeDasharray={meta.dashed ? "4 3" : undefined}
              />
            </svg>
            <span>{meta.label}</span>
          </div>
        );
      })}
    </div>
  );
}
