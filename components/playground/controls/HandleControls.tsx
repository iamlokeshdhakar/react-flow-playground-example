"use client";

import { HandleStrategy, PlaygroundSettings, SettingsAction } from "@/lib/playground/settingsReducer";
import { ControlGroup, SelectField } from "./primitives";

const HANDLE_OPTIONS: { value: HandleStrategy; label: string }[] = [
  { value: "left-right", label: "Left → Right" },
  { value: "top-bottom", label: "Top → Bottom" },
  { value: "left-only", label: "Left only" },
  { value: "right-only", label: "Right only" },
  { value: "top-only", label: "Top only" },
  { value: "bottom-only", label: "Bottom only" },
  { value: "left+right", label: "Left + Right" },
  { value: "top+bottom", label: "Top + Bottom" },
  { value: "four-way", label: "Four-way" },
  { value: "dynamic", label: "Dynamic (per edge direction)" },
  { value: "auto-after-layout", label: "Automatic after layout" },
];

export function HandleControls({
  settings,
  dispatch,
}: {
  settings: PlaygroundSettings;
  dispatch: (a: SettingsAction) => void;
}) {
  return (
    <ControlGroup title="Handle Placement">
      <SelectField
        label="Strategy"
        value={settings.handleStrategy}
        options={HANDLE_OPTIONS}
        onChange={(strategy) => dispatch({ type: "SET_HANDLE_STRATEGY", strategy })}
      />
    </ControlGroup>
  );
}
