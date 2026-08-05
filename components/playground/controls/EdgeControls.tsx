"use client";

import { EdgeLabelMode, EdgeRoutingType, PlaygroundSettings, SettingsAction } from "@/lib/playground/settingsReducer";
import { ControlGroup, SelectField } from "./primitives";

const ROUTING_OPTIONS: { value: EdgeRoutingType; label: string }[] = [
  { value: "straight", label: "Straight" },
  { value: "step", label: "Step" },
  { value: "smoothstep", label: "Smooth Step" },
  { value: "bezier", label: "Bezier" },
  { value: "simplebezier", label: "Simple Bezier" },
  { value: "elk-routed", label: "ELK generated routing" },
];

const LABEL_MODE_OPTIONS: { value: EdgeLabelMode; label: string }[] = [
  { value: "off", label: "Off" },
  { value: "always", label: "Always visible" },
  { value: "hover", label: "Visible on hover" },
];

export function EdgeControls({
  settings,
  dispatch,
}: {
  settings: PlaygroundSettings;
  dispatch: (a: SettingsAction) => void;
}) {
  return (
    <ControlGroup title="Edges">
      <SelectField
        label="Routing"
        value={settings.edgeRouting}
        options={ROUTING_OPTIONS}
        onChange={(routing) => dispatch({ type: "SET_EDGE_ROUTING", routing })}
      />
      <SelectField
        label="Labels"
        value={settings.edgeLabelMode}
        options={LABEL_MODE_OPTIONS}
        onChange={(mode) => dispatch({ type: "SET_EDGE_LABEL_MODE", mode })}
      />
    </ControlGroup>
  );
}
