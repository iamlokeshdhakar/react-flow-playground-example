"use client";

import { LAYOUT_ENGINES } from "@/lib/layout/registry";
import { PlaygroundSettings, SettingsAction } from "@/lib/playground/settingsReducer";
import { ControlGroup, SelectField } from "./primitives";

export function LayoutControls({
  settings,
  dispatch,
}: {
  settings: PlaygroundSettings;
  dispatch: (a: SettingsAction) => void;
}) {
  return (
    <ControlGroup title="Layout">
      <SelectField
        label="Engine"
        value={settings.layoutEngineId}
        options={Object.values(LAYOUT_ENGINES).map((e) => ({ value: e.id, label: e.label }))}
        onChange={(id) => dispatch({ type: "SET_LAYOUT_ENGINE", id })}
      />
      <SelectField
        label="Direction"
        value={settings.direction}
        options={[
          { value: "DOWN", label: "Top → Bottom" },
          { value: "UP", label: "Bottom → Top" },
          { value: "RIGHT", label: "Left → Right" },
          { value: "LEFT", label: "Right → Left" },
        ]}
        onChange={(direction) => dispatch({ type: "SET_DIRECTION", direction })}
      />
    </ControlGroup>
  );
}
