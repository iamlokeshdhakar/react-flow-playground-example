"use client";

import { NodeDensity, PlaygroundSettings, SettingsAction } from "@/lib/playground/settingsReducer";
import { ControlGroup, SelectField, SliderField } from "./primitives";

const DENSITY_OPTIONS: { value: NodeDensity; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "expanded", label: "Expanded" },
];

export function NodeControls({
  settings,
  dispatch,
}: {
  settings: PlaygroundSettings;
  dispatch: (a: SettingsAction) => void;
}) {
  return (
    <ControlGroup title="Nodes">
      <SelectField
        label="Density"
        value={settings.nodeDensity}
        options={DENSITY_OPTIONS}
        onChange={(density) => dispatch({ type: "SET_NODE_DENSITY", density })}
      />
      <SliderField
        label="Padding"
        value={settings.nodePadding}
        min={4}
        max={32}
        onChange={(value) => dispatch({ type: "SET_NODE_PADDING", value })}
      />
      <SliderField
        label="Font size"
        value={settings.fontSize}
        min={10}
        max={20}
        onChange={(value) => dispatch({ type: "SET_FONT_SIZE", value })}
      />
    </ControlGroup>
  );
}
