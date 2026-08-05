"use client";

import { useState } from "react";
import { LAYOUT_ENGINES } from "@/lib/layout/registry";
import { PlaygroundSettings, SettingsAction } from "@/lib/playground/settingsReducer";
import { ControlGroup, SelectField } from "./primitives";

const LAYOUT_PRESETS: { engineId: string; direction: PlaygroundSettings["direction"]; label: string }[] = [
  { engineId: "elk-layered", direction: "DOWN", label: "Layered — vertical" },
  { engineId: "elk-layered", direction: "RIGHT", label: "Layered — horizontal" },
  { engineId: "elk-radial", direction: "DOWN", label: "Radial" },
  { engineId: "elk-force", direction: "DOWN", label: "Force" },
  { engineId: "circular", direction: "DOWN", label: "Circular" },
];

export function LayoutControls({
  settings,
  dispatch,
}: {
  settings: PlaygroundSettings;
  dispatch: (a: SettingsAction) => void;
}) {
  const [presetIndex, setPresetIndex] = useState(0);

  const tryNextLayout = () => {
    const next = (presetIndex + 1) % LAYOUT_PRESETS.length;
    setPresetIndex(next);
    const preset = LAYOUT_PRESETS[next];
    dispatch({ type: "SET_LAYOUT_ENGINE", id: preset.engineId });
    dispatch({ type: "SET_DIRECTION", direction: preset.direction });
  };

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
          { value: "RIGHT", label: "Left → Right (Horizontal)" },
          { value: "LEFT", label: "Right → Left (Horizontal)" },
        ]}
        onChange={(direction) => dispatch({ type: "SET_DIRECTION", direction })}
      />
      <button
        type="button"
        className="mt-1 w-full rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
        onClick={tryNextLayout}
      >
        Try next layout ({LAYOUT_PRESETS[presetIndex].label})
      </button>
    </ControlGroup>
  );
}
