"use client";

import { PlaygroundSettings, SettingsAction } from "@/lib/playground/settingsReducer";
import { ControlGroup, ToggleField } from "./primitives";

export function DebugControls({
  settings,
  dispatch,
}: {
  settings: PlaygroundSettings;
  dispatch: (a: SettingsAction) => void;
}) {
  const debug = settings.debug;
  const set = (key: keyof PlaygroundSettings["debug"], value: boolean) => dispatch({ type: "SET_DEBUG_OPTION", key, value });

  return (
    <ControlGroup title="Debug">
      <ToggleField label="Show node IDs" checked={debug.showNodeIds} onChange={(v) => set("showNodeIds", v)} />
      <ToggleField label="Show edge IDs" checked={debug.showEdgeIds} onChange={(v) => set("showEdgeIds", v)} />
      <ToggleField
        label="Highlight incoming/outgoing on select"
        checked={debug.highlightConnected}
        onChange={(v) => set("highlightConnected", v)}
      />
      <ToggleField label="Highlight overlapping edges" checked={debug.highlightCrossings} onChange={(v) => set("highlightCrossings", v)} />
      <ToggleField label="Show node dimensions" checked={debug.showDimensions} onChange={(v) => set("showDimensions", v)} />
      <ToggleField label="Show layout execution time" checked={debug.showLayoutTime} onChange={(v) => set("showLayoutTime", v)} />
      <ToggleField label="Show total edge crossings" checked={debug.showCrossingCount} onChange={(v) => set("showCrossingCount", v)} />
    </ControlGroup>
  );
}
