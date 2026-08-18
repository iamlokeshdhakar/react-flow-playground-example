"use client";

import { OPERATION_STATUS_META, OperationStatus } from "@/lib/graph/types";
import { OperationStatusCount } from "@/lib/graph/subset";
import { PlaygroundSettings, SettingsAction } from "@/lib/playground/settingsReducer";
import { ControlGroup, ToggleField } from "./primitives";

const STATUS_ORDER: OperationStatus[] = ["new", "existing", "modified", "deleted"];

export function OperationFilterControls({
  settings,
  dispatch,
  counts,
}: {
  settings: PlaygroundSettings;
  dispatch: (a: SettingsAction) => void;
  counts: Record<OperationStatus, OperationStatusCount>;
}) {
  return (
    <ControlGroup title="Operation filter">
      {STATUS_ORDER.map((status) => {
        const meta = OPERATION_STATUS_META[status];
        const count = counts[status];
        return (
          <ToggleField
            key={status}
            label={meta.icon ? `${meta.icon} ${meta.label}` : meta.label}
            sublabel={`${count.nodes} node${count.nodes === 1 ? "" : "s"}, ${count.edges} edge${count.edges === 1 ? "" : "s"}`}
            checked={settings.operationFilter[status]}
            onChange={(v) => dispatch({ type: "SET_OPERATION_FILTER", status, value: v })}
          />
        );
      })}
    </ControlGroup>
  );
}
