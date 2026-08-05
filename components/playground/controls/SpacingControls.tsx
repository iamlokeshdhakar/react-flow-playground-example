"use client";

import { PlaygroundSettings, SettingsAction } from "@/lib/playground/settingsReducer";
import { ControlGroup, SliderField } from "./primitives";

export function SpacingControls({
  settings,
  dispatch,
}: {
  settings: PlaygroundSettings;
  dispatch: (a: SettingsAction) => void;
}) {
  return (
    <ControlGroup title="Spacing">
      <SliderField
        label="Node spacing"
        value={settings.spacing.node}
        min={10}
        max={200}
        onChange={(value) => dispatch({ type: "SET_SPACING", key: "node", value })}
      />
      <SliderField
        label="Layer spacing"
        value={settings.spacing.layer}
        min={10}
        max={300}
        onChange={(value) => dispatch({ type: "SET_SPACING", key: "layer", value })}
      />
      <SliderField
        label="Edge spacing"
        value={settings.spacing.edge}
        min={0}
        max={100}
        onChange={(value) => dispatch({ type: "SET_SPACING", key: "edge", value })}
      />
      <SliderField
        label="Component spacing"
        value={settings.spacing.component}
        min={10}
        max={300}
        onChange={(value) => dispatch({ type: "SET_SPACING", key: "component", value })}
      />
    </ControlGroup>
  );
}
